"""Actual-source regression checks that supplement the inherited nine checks."""
import csv,datetime as dt,json,math,unittest
from pathlib import Path
from pyproj import Transformer
ROOT=Path(__file__).resolve().parents[1]
def read(p):
    with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
class SourceRegressions(unittest.TestCase):
    def test_quiet_month_returns_zero_records_not_missing_calendar(self):
        month='2017-01'
        for sensor in ['MODIS','VIIRS_SNPP']:
            raw=read(ROOT/'results'/f'{sensor}_Butte_Raw_Detections.csv')
            self.assertEqual(sum(r['type']=='0' and r['acq_date'].startswith(month) for r in raw),0)
            row=next(r for r in read(ROOT/'products/Butte_Harmonized_Monthly.csv') if r['month']==month)
            self.assertEqual(float(row[sensor+'_cell_days']),0)
            self.assertEqual(row['reference_status'],'observed_VIIRS_S_NPP')
    def test_source_utc_timestamps_and_actual_leap_day(self):
        leap=[]
        for sensor in ['MODIS','VIIRS_SNPP']:
            rows=read(ROOT/'results'/f'{sensor}_Butte_Raw_Detections.csv')
            for r in rows:
                stamp=dt.datetime.strptime(r['acq_date']+' '+r['acq_time'].zfill(4),'%Y-%m-%d %H%M').replace(tzinfo=dt.timezone.utc)
                self.assertEqual(stamp.date().isoformat(),r['acq_date'])
                if r['acq_date']=='2016-02-29':leap.append(r)
        self.assertEqual(len(leap),1)
        self.assertEqual(dt.date.fromisoformat(leap[0]['acq_date']).month,2)
    def test_corrected_flags_survive_frontend_adapter(self):
        b=json.loads((ROOT/'frontend/src/generated/bundle.json').read_text(encoding='utf-8'))
        for r in b['records']:
            if r['date']<'2002-07':self.assertEqual(r['flag'],'MODIS_early_Terra_only')
        self.assertEqual(len(b['records']),302)
if __name__=='__main__':unittest.main()
