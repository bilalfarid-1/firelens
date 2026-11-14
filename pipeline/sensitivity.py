#!/usr/bin/env python3
"""Non-calibration sensitivity: grid origin and instrument confidence separately."""
from pathlib import Path
import pandas as pd,numpy as np
from pyproj import Transformer
ROOT=Path(__file__).resolve().parents[1];R=ROOT/'results';OUT=ROOT/'products'
trans=Transformer.from_crs('EPSG:4326','EPSG:3310',always_xy=True)
S=[('MODIS','MODIS_Butte_Raw_Detections.csv'),('VIIRS_SNPP','VIIRS_SNPP_Butte_Raw_Detections.csv')]
rows=[]
for sensor,name in S:
 d=pd.read_csv(R/name,dtype={'confidence':str});d=d[d.type==0].copy()
 x,y=trans.transform(d.longitude.to_numpy(),d.latitude.to_numpy());d['x']=x;d['y']=y;d['month']=d.acq_date.str[:7]
 if sensor=='MODIS':filtered=d[pd.to_numeric(d.confidence)>=30]
 else:filtered=d[d.confidence.isin(('n','h'))]
 for selection,frame in [('all_confidence',d),('instrument_specific_screen',filtered)]:
  for meters,xoffset,yoffset in [(1000,0,0),(1000,500,500),(2000,0,0)]:
   k=frame[['month','acq_date','x','y']].copy();k['gx']=np.floor((k.x-xoffset)/meters).astype(int);k['gy']=np.floor((k.y-yoffset)/meters).astype(int)
   k=k.drop_duplicates(['acq_date','gx','gy'])
   for mo in ('2018-11','2024-07','2025-04'):
    rows.append({'sensor':sensor,'selection':selection,'cell_width_m':meters,'x_offset_m':xoffset,'y_offset_m':yoffset,'month':mo,'cell_days':int((k.month==mo).sum())})
result=pd.DataFrame(rows);result.to_csv(OUT/'Sensitivity_Grid_And_Confidence.csv',index=False)
print(result.to_string(index=False))
