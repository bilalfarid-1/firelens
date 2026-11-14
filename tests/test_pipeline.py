"""Data-integrity and science-output checks; stdlib unittest only."""
import csv, hashlib, json, unittest, zipfile
from pathlib import Path
import numpy as np
import pandas as pd
from pyproj import Transformer

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'results'; PROD=ROOT/'products'; WEB=ROOT/'web'/'data'
readcsv=lambda name:pd.read_csv(PROD/name)

class ScientificIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.monthly=readcsv('Butte_Harmonized_Monthly.csv')
        cls.yearly=readcsv('Butte_Harmonized_Yearly.csv')
        cls.manifest=json.loads((PROD/'harmonization_manifest.json').read_text())
        cls.grid=readcsv('Butte_Grid_Month_Cell_Days.csv')
    def test_original_zip_checksums_and_crc(self):
        expected={'DL_FIRE_M-C61_848030.zip':'dcd09d67c0b9a2d95b1be7c8fbd97e2dbd1cd28a5240857c6ecc60d89fbc55f9',
                  'DL_FIRE_SV-C2_848031.zip':'0e855b5059966c61ae11cd712bbbfc6409ae4913cf18259cab4ec429b4826eb8'}
        for name,digest in expected.items():
            with self.subTest(name=name):
                self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),digest)
                with zipfile.ZipFile(ROOT/name) as z:self.assertIsNone(z.testzip())
    def test_original_county_csv_rows(self):
        for name,expected in [('MODIS_Butte_Raw_Detections.csv',7211),('VIIRS_SNPP_Butte_Raw_Detections.csv',16526)]:
            with (RAW/name).open(newline='') as f:self.assertEqual(sum(1 for _ in csv.DictReader(f)),expected)
    def test_month_sequence_and_null_viirs(self):
        self.assertEqual(len(self.monthly),302)
        self.assertEqual(self.monthly.month.iloc[0],'2000-11');self.assertEqual(self.monthly.month.iloc[-1],'2025-12')
        self.assertEqual(len(set(self.monthly.month)),302)
        self.assertTrue(self.monthly.loc[self.monthly.month<'2012-02','VIIRS_SNPP_cell_days'].isna().all())
        self.assertTrue(self.monthly.loc[self.monthly.month>='2012-02','VIIRS_SNPP_cell_days'].notna().all())
        self.assertTrue((self.monthly.loc[self.monthly.month<'2012-02','reference_status']=='estimated_from_MODIS').all())
    def test_type0_decision_and_cell_day_bounds(self):
        self.assertEqual(self.manifest['quality_by_sensor']['MODIS']['presumed_vegetation_count'],7105)
        self.assertEqual(self.manifest['quality_by_sensor']['VIIRS_SNPP']['presumed_vegetation_count'],16450)
        self.assertEqual(int(self.monthly.MODIS_raw_type0.sum()),7105)
        self.assertEqual(int(self.monthly.VIIRS_SNPP_raw_type0.sum()),16450)
        for s in ['MODIS','VIIRS_SNPP']:
            present=self.monthly[[s+'_cell_days',s+'_raw_type0']].dropna()
            self.assertTrue((present[s+'_cell_days']<=present[s+'_raw_type0']).all())
    def test_yearly_aggregation_exact(self):
        for _,y in self.yearly.iterrows():
            monthly=self.monthly[self.monthly.year==y.year]
            self.assertAlmostEqual(monthly.harmonized_viirs_reference_cell_days.sum(),y.harmonized_viirs_reference_cell_days,delta=.02)
            self.assertEqual(int(monthly.MODIS_cell_days.sum()),int(y.MODIS_cell_days))
    def test_independent_spatial_day_aggregation_july_2024(self):
        # Independent re-projection of a single stress month; not trusting modeled summary alone.
        trans=Transformer.from_crs(4326,3310,always_xy=True)
        for sensor,fn,expected in [('MODIS','MODIS_Butte_Raw_Detections.csv',322),('VIIRS_SNPP','VIIRS_SNPP_Butte_Raw_Detections.csv',58)]:
            d=pd.read_csv(RAW/fn);d=d[(d.type==0)&d.acq_date.str.startswith('2024-07')]
            x,y=trans.transform(d.longitude.to_numpy(),d.latitude.to_numpy())
            independent=len(set(zip(d.acq_date,np.floor(np.asarray(x)/1000).astype(int),np.floor(np.asarray(y)/1000).astype(int))))
            self.assertEqual(independent,expected)
            output=self.monthly[self.monthly.month=='2024-07'].iloc[0][sensor+'_cell_days']
            self.assertEqual(int(output),expected)
    def test_model_year_separation_and_errors(self):
        self.assertEqual(self.manifest['training_years'],[2013,2023]);self.assertEqual(self.manifest['test_years'],[2024,2025])
        self.assertEqual(self.manifest['chosen_model'],'robust_log')
        held=readcsv('Validation_Heldout_2024_2025.csv')
        self.assertEqual(len(held),24)
        self.assertTrue(set(held.year)=={2024,2025})
        actual=np.abs(held.VIIRS_cell_days-held.model_predicted_viirs_cell_days).mean()
        self.assertAlmostEqual(actual,20.334,places=2)
        j=held[held.month=='2024-07'].iloc[0]
        self.assertEqual(int(j.VIIRS_cell_days),58);self.assertGreater(j.model_predicted_viirs_cell_days,340)
    def test_web_product_consistency(self):
        cal=json.loads((WEB/'calendar.json').read_text())
        grid=json.loads((WEB/'grid.json').read_text())
        self.assertEqual(len(cal['rows']),302);self.assertEqual(len(grid['rows']),len(self.grid))
        for row in cal['rows']:
            expected=self.monthly[self.monthly.month==row['month']].iloc[0]
            self.assertAlmostEqual(row['harmonized'],expected.harmonized_viirs_reference_cell_days,delta=.01)
            if row['month']<'2012-02':self.assertIsNone(row['viirs'])
        self.assertTrue(all(0<=r[0]<302 and r[3]>=0 and r[4]>=0 for r in grid['rows']))
    def test_no_external_runtime_scripts(self):
        html=(ROOT/'web'/'index.html').read_text();self.assertIn('src="app.js"',html)
        self.assertNotIn('src="http',html);self.assertNotIn('src="//',html)

if __name__=='__main__':unittest.main()
