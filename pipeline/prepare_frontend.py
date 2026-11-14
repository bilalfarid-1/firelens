"""Build a local UI bundle from scientific CSV products; never fit a model or edit inputs."""
import csv,hashlib,json
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
def read(name):
    with (ROOT/'products'/name).open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
def num(r,k):return float(r[k]) if r[k] else None
monthly=read('Butte_Harmonized_Monthly.csv'); records=[]
for r in monthly:
    estimated=r['reference_status']=='estimated_from_MODIS'
    records.append({'date':r['month'],'modis':num(r,'MODIS_cell_days'),'viirs':num(r,'VIIRS_SNPP_cell_days'),
      'estimated':num(r,'harmonized_viirs_reference_cell_days') if estimated else None,
      'diagnostic':num(r,'model_prediction_diagnostic'),'low':num(r,'estimate_lower_heuristic'),'high':num(r,'estimate_upper_heuristic'),
      'flag':r['data_quality_flag'],'status':r['reference_status'],'modis_raw':num(r,'MODIS_raw_type0'),'viirs_raw':num(r,'VIIRS_SNPP_raw_type0')})
grid=read('Butte_Grid_Month_Cell_Days.csv')
gridrows=[[r['month'],int(r['gx']),int(r['gy']),float(r['lon']),float(r['lat']),int(r['MODIS']),int(r['VIIRS_SNPP'])] for r in grid]
training=[r for r in records if '2013-01'<=r['date']<='2023-12']; test=[r for r in records if '2024-01'<=r['date']<='2025-12']
actual=np.array([r['viirs'] for r in test]); ratio=sum(r['viirs'] for r in training)/sum(r['modis'] for r in training)
predictions=[('MODIS-to-VIIRS crosswalk',[r['diagnostic'] for r in test]),('Unadjusted MODIS',[r['modis'] for r in test]),('Training-derived ratio',[r['modis']*ratio for r in test]),('Training median',[float(np.median([t['viirs'] for t in training]))]*24),('Training calendar-month median',[float(np.median([t['viirs'] for t in training if t['date'][5:]==r['date'][5:]])) for r in test])]
validation=[{'method':name,'mae':round(float(np.mean(np.abs(actual-np.array(p)))),3)} for name,p in predictions]
csvs={p.name:p.read_text(encoding='utf-8') for p in (ROOT/'products').glob('*.csv')}
csvs['Method_Comparison.csv']='method,MAE_cell_days_per_month\n'+'\n'.join(f'{r["method"]},{r["mae"]:.3f}' for r in validation)+'\n'
boundary=json.loads((ROOT/'results/Butte_County_Boundary.geojson').read_text(encoding='utf-8'))
for f in boundary['features']:f['properties'].update(GEOID='06007',NAME='Butte')
bundle={'records':records,'grid':gridrows,'boundary':boundary,'csv':csvs,'validation':validation,'monthlyRows':monthly,
 'provenance':{'ai_assistance':'AI-assisted code, design translation, testing and documentation. Original NASA observations unchanged.', 'boundary':'Simplified official California display outline; all county rows independently match exact polygon.',
 'sourceArchives':json.loads((ROOT/'products/harmonization_manifest.json').read_text())['source_archives_sha256'],
 'productHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'products').glob('*.csv')}}}
dest=ROOT/'frontend/src/generated';dest.mkdir(parents=True,exist_ok=True)
(dest/'bundle.json').write_text(json.dumps(bundle,separators=(',',':'),allow_nan=False),encoding='utf-8')
print(f'Bundled {len(records)} months, {len(gridrows)} grid-month rows, {len(csvs)} downloads; no runtime data services.')
