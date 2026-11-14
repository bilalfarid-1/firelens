#!/usr/bin/env python3
"""Transparent MODIS -> VIIRS S-NPP common-grid hotspot-activity crosswalk.

Raw FIRMS county data remain unmodified. The model estimates VIIRS-reference
1 km cell-day counts, NOT true fire counts/extent, as a conditional proxy.
"""
from __future__ import annotations
import calendar, csv, datetime as dt, hashlib, json, math
from pathlib import Path
import numpy as np
import pandas as pd
from pyproj import Transformer
from scipy.optimize import least_squares
from scipy.stats import spearmanr
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'results'; OUT=ROOT/'products'; WEB=ROOT/'web'/'data'; CHART=ROOT/'charts'
TRAIN_FROM, TRAIN_THRU=2013,2023
TEST_YEARS=(2024,2025)
GRIDSIZE_METERS=1000
PERIODS=pd.period_range('2000-11','2025-12',freq='M')
INSTRUMENTS=(('MODIS','MODIS_Butte_Raw_Detections.csv'),('VIIRS_SNPP','VIIRS_SNPP_Butte_Raw_Detections.csv'))

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def fit_log(z,season=False):
    """Huber-like robust loss in log1p count space; fixed coefficient topology."""
    f=feats(z,season)
    y=np.log1p(z.VIIRS_cell_days.to_numpy(dtype=float))
    initial=[1.0,0.8]+([0.0,0.0] if season else [])
    return least_squares(lambda beta: f@beta-y,initial,loss='soft_l1',f_scale=0.5,max_nfev=2000).x

def feats(z,season=False):
    xx=np.log1p(z.MODIS_cell_days.to_numpy(dtype=float))
    f=np.column_stack([np.ones(len(z)),xx])
    if season:
        theta=(z.m.to_numpy(dtype=float)-1)*2*np.pi/12
        f=np.column_stack([f,np.sin(theta),np.cos(theta)])
    return f

def predict(z,coef,season=False):
    return np.maximum(0,np.expm1(np.clip(feats(z,season)@coef,0,12)))

def metrics(y,p):
    y=np.asarray(y,dtype=float);p=np.asarray(p,dtype=float)
    return {'n_months':int(len(y)),
            'MAE_cell_days':round(float(np.mean(np.abs(y-p))),3),
            'median_AE_cell_days':round(float(np.median(np.abs(y-p))),3),
            'mean_absolute_log1p_error':round(float(np.mean(np.abs(np.log1p(y)-np.log1p(p)))),4),
            'mean_signed_error':round(float(np.mean(p-y)),3),
            'spearman_rho':round(float(spearmanr(y,p).statistic),4) if len(np.unique(y))>1 and len(np.unique(p))>1 else None}

def main():
    OUT.mkdir(exist_ok=True); WEB.mkdir(parents=True,exist_ok=True); CHART.mkdir(exist_ok=True)
    inputs={}
    to_xy=Transformer.from_crs('EPSG:4326','EPSG:3310',always_xy=True)
    to_wgs=Transformer.from_crs('EPSG:3310','EPSG:4326',always_xy=True)
    subsets=[]; audit={}
    for sensor,name in INSTRUMENTS:
        file=RAW/name; d=pd.read_csv(file,dtype={'acq_date':str,'confidence':str,'type':str,'acq_time':str})
        inputs[name]=sha(file)
        all_count=len(d); types=d.type.value_counts().to_dict()
        d=d[d.type=='0'].copy()  # presumed vegetation only, never unique fires
        x,y=to_xy.transform(d.longitude.to_numpy(),d.latitude.to_numpy())
        d['gx']=np.floor(np.asarray(x)/GRIDSIZE_METERS).astype('int32')
        d['gy']=np.floor(np.asarray(y)/GRIDSIZE_METERS).astype('int32')
        d['day']=d.acq_date
        d['month']=d.acq_date.str[:7]
        d['sensor']=sensor
        d['daypart']=d.daynight
        audit[sensor]={'input_count':all_count,'presumed_vegetation_count':len(d),'excluded_non_vegetation':all_count-len(d),
                       'type_distribution_all':types,'daynight_vegetation':d.daynight.value_counts().to_dict(),
                       'confidence_vegetation':d.confidence.value_counts().to_dict(),
                       'distinct_dates':int(d.day.nunique()),
                       'distinct_date_cell':int(len(d.drop_duplicates(['day','gx','gy'])))}
        subsets.append(d)
    allveg=pd.concat(subsets,ignore_index=True)
    # Deduplicate separate revisits and adjacent VIIRS fire pixels only within each UTC day and 1km grid.
    daycells=allveg.drop_duplicates(['sensor','day','gx','gy'])
    rawmonth=allveg.groupby(['month','sensor']).size().unstack(fill_value=0)
    cellsmonth=daycells.groupby(['month','sensor']).size().unstack(fill_value=0)
    months=[str(p) for p in PERIODS]
    mainrows=pd.DataFrame({'month':months});mainrows['year']=[p.year for p in PERIODS];mainrows['m']=[p.month for p in PERIODS]
    for s in ['MODIS','VIIRS_SNPP']:
        mainrows[s+'_raw_type0']=rawmonth.reindex(months,fill_value=0)[s].to_numpy(dtype=int)
        mainrows[s+'_cell_days']=cellsmonth.reindex(months,fill_value=0)[s].to_numpy(dtype=int)
    # Partial January 2012: VIIRS archive begins 20 January; do not count as full-month comparable coverage.
    mainrows.loc[mainrows.year<2012,['VIIRS_SNPP_raw_type0','VIIRS_SNPP_cell_days']]=np.nan
    mainrows.loc[mainrows.month=='2012-01',['VIIRS_SNPP_raw_type0','VIIRS_SNPP_cell_days']]=np.nan
    mainrows['VIIRS_raw_all_types']=[None if p<'2012-02' else None for p in months]  # explicit metadata absent, not used
    mainrows=mainrows.drop(columns=['VIIRS_raw_all_types'])
    z=mainrows.rename(columns={'VIIRS_SNPP_cell_days':'VIIRS_cell_days','MODIS_cell_days':'MODIS_cell_days'})
    training=z[(z.year>=TRAIN_FROM)&(z.year<=TRAIN_THRU)].copy()
    testing=z[z.year.isin(TEST_YEARS)].copy()

    # Candidate selection is exclusively leave-one-entire-year-out on TRAIN years.
    candidates={}; cv_by_candidate={}
    for season in (False,True):
        key='robust_log_with_annual_harmonics' if season else 'robust_log'
        folds=[]
        for year in sorted(training.year.unique()):
            other=training[training.year!=year]
            t=training[training.year==year]
            coef=fit_log(other,season)
            pp=predict(t,coef,season)
            folds.extend(zip(t.month.to_list(),t.VIIRS_cell_days.to_list(),pp.tolist()))
        frame=pd.DataFrame(folds,columns=['month','actual','prediction']).sort_values('month')
        candidates[key]=metrics(frame.actual,frame.prediction)
        cv_by_candidate[key]=frame
    # Select model by whole-year CV log error; seasonal option only if demonstrably better.
    selected=min(candidates,key=lambda k:(candidates[k]['mean_absolute_log1p_error'],len(k)))
    seasonal=selected.endswith('harmonics')
    coef=fit_log(training,seasonal)
    testprediction=predict(testing,coef,seasonal)
    test_naive=testing.MODIS_cell_days.to_numpy(dtype=float)
    # Data-estimated constant-factor benchmark (NOT harmonization method).
    benchmark_factor=float(training.VIIRS_cell_days.sum()/training.MODIS_cell_days.sum())
    test_scaled=test_naive*benchmark_factor
    evals={'heldout_'+str(TEST_YEARS[0])+'_'+str(TEST_YEARS[-1]):{
        'model':metrics(testing.VIIRS_cell_days,testprediction),
        'uncorrected_MODIS_grid':metrics(testing.VIIRS_cell_days,test_naive),
        'trained_global_ratio_benchmark':metrics(testing.VIIRS_cell_days,test_scaled)}}
    # Predictions for all months, including overlap diagnostics but never replacing observed VIIRS where available.
    predall=predict(z,coef,seasonal)
    cv_res=cv_by_candidate[selected]
    # Empirical residual band across calibration-era leave-year-out predictions;
    # descriptive, NOT coverage-guaranteed confidence interval.
    absres=np.abs(np.log1p(cv_res.actual.to_numpy())-np.log1p(cv_res.prediction.to_numpy()))
    radius=float(np.quantile(absres,.9))
    lower=np.maximum(0,np.expm1(np.maximum(0,np.log1p(predall)-radius)))
    upper=np.maximum(0,np.expm1(np.log1p(predall)+radius))
    isobserved=(mainrows.year>=2012)&(mainrows.month!='2012-01')
    mainrows['harmonized_viirs_reference_cell_days']=np.where(isobserved,mainrows.VIIRS_SNPP_cell_days,predall)
    mainrows['reference_status']=np.where(isobserved,'observed_VIIRS_S_NPP','estimated_from_MODIS')
    mainrows['estimate_lower_heuristic']=np.where(isobserved,np.nan,lower)
    mainrows['estimate_upper_heuristic']=np.where(isobserved,np.nan,upper)
    mainrows['model_prediction_diagnostic']=predall
    mainrows['data_quality_flag']=np.where(mainrows.month=='2012-01','VIIRS_partial_coverage',
        np.where(mainrows.month<'2002-07','MODIS_early_Terra_only',
        np.where(mainrows.month=='2024-07','large_sensor_disagreement','standard_coverage_unknown')))
    mainrows['model_outside_training_MODIS_range']=(z.MODIS_cell_days>training.MODIS_cell_days.max())
    # No decimals from original observed cell-day integers; estimates remain fractional expectations.
    csv_path=OUT/'Butte_Harmonized_Monthly.csv'
    mainrows.to_csv(csv_path,index=False,float_format='%.3f',na_rep='')
    yr=mainrows.groupby('year',sort=True).agg(
        MODIS_raw_type0=('MODIS_raw_type0','sum'),MODIS_cell_days=('MODIS_cell_days','sum'),
        VIIRS_SNPP_raw_type0=('VIIRS_SNPP_raw_type0',lambda s: s.sum(min_count=1)),
        VIIRS_SNPP_cell_days=('VIIRS_SNPP_cell_days',lambda s:s.sum(min_count=1)),
        harmonized_viirs_reference_cell_days=('harmonized_viirs_reference_cell_days','sum'),
        estimated_months=('reference_status',lambda s:sum(s=='estimated_from_MODIS'))).reset_index()
    yr.to_csv(OUT/'Butte_Harmonized_Yearly.csv',index=False,float_format='%.3f',na_rep='')
    val=testing[['month','year','MODIS_cell_days','VIIRS_cell_days']].copy()
    val['model_predicted_viirs_cell_days']=testprediction
    val['naive_MODIS_cell_days']=test_naive
    val['trained_ratio_benchmark']=test_scaled
    val['absolute_error_model']=np.abs(val.VIIRS_cell_days-testprediction)
    val.to_csv(OUT/'Validation_Heldout_2024_2025.csv',index=False,float_format='%.3f')
    cv_res.to_csv(OUT/'Validation_Train_Leave_One_Year_Out.csv',index=False,float_format='%.3f')

    # Grid positions: same equal-area 1 km cells, with unique DATE count per month/sensor.
    g=daycells.groupby(['month','gx','gy','sensor']).size().unstack(fill_value=0).reset_index()
    g['mid']=g.month.map({m:i for i,m in enumerate(months)}).astype(int)
    lon,lat=to_wgs.transform((g.gx.to_numpy()+.5)*GRIDSIZE_METERS,(g.gy.to_numpy()+.5)*GRIDSIZE_METERS)
    g['lon']=np.round(lon,5);g['lat']=np.round(lat,5)
    g['MODIS']=g.MODIS.astype(int);g['VIIRS_SNPP']=g.VIIRS_SNPP.astype(int)
    grid=g[['month','gx','gy','lon','lat','MODIS','VIIRS_SNPP']]
    grid.to_csv(OUT/'Butte_Grid_Month_Cell_Days.csv',index=False)
    # Slim, self-contained static web data (no access to raw precision coordinates).
    records=[{'month':r.month,'year':int(r.year),'modis':int(r.MODIS_cell_days),
             'viirs':None if pd.isna(r.VIIRS_SNPP_cell_days) else int(r.VIIRS_SNPP_cell_days),
             'modis_raw':int(r.MODIS_raw_type0),
             'viirs_raw':None if pd.isna(r.VIIRS_SNPP_raw_type0) else int(r.VIIRS_SNPP_raw_type0),
             'harmonized':round(float(r.harmonized_viirs_reference_cell_days),2),
             'status':r.reference_status,
             'low':None if pd.isna(r.estimate_lower_heuristic) else round(float(r.estimate_lower_heuristic),2),
             'high':None if pd.isna(r.estimate_upper_heuristic) else round(float(r.estimate_upper_heuristic),2),
             'flag':r.data_quality_flag} for r in mainrows.itertuples()]
    (WEB/'calendar.json').write_text(json.dumps({'title':'Butte County historical active-fire detection indicator',
        'unit':'distinct 1-km equal-area county cells per UTC day, summed within UTC month',
        'boundary':'Simplified official display outline; independent exact membership replay matches all county rows (see evidence/independent_results.json).',
        'model':selected,'rows':records},separators=(',',':')))
    (WEB/'grid.json').write_text(json.dumps({'encoding':'[month_index,longitude,latitude,modis_cell_days,viirs_cell_days]',
        'rows':[[int(row.mid),float(row.lon),float(row.lat),int(row.MODIS),int(row.VIIRS_SNPP)] for row in g.itertuples()]},separators=(',',':')))
    (WEB/'boundary.geojson').write_bytes((RAW/'Butte_County_Boundary.geojson').read_bytes())
    (WEB/'monthly.csv').write_bytes(csv_path.read_bytes())
    (WEB/'yearly.csv').write_bytes((OUT/'Butte_Harmonized_Yearly.csv').read_bytes())
    (WEB/'heldout_validation.csv').write_bytes((OUT/'Validation_Heldout_2024_2025.csv').read_bytes())
    # Data lineage with explicit separate pre-existing source archive audit.
    lineage={'generated_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
        'source_input_sha256':inputs,'source_archives_sha256':json.loads((RAW/'processing_manifest.json').read_text())['source_archives_sha256'],
        'county_boundary_mode':'simplified_display_outline; exact_membership_independently_replayed',
        'grid_crs':'EPSG:3310 California Albers', 'grid_meters':GRIDSIZE_METERS,
        'time':'UTC acquisition date; no attempt at complete observation coverage',
        'selection':'type=0 presumed vegetation; all native confidence and both day/night',
        'training_years':[TRAIN_FROM,TRAIN_THRU],'test_years':TEST_YEARS,
        'candidate_cv':candidates,'chosen_model':selected,'coefficients':[round(float(c),6) for c in coef],
        'formula':'exp(intercept + slope*ln(1 + MODIS_cell_days) + optional seasonal harmonic) - 1, clipped nonnegative',
        'uncertainty':'plus/minus 90th percentile absolute leave-year-out log1p residual; heuristic, not guaranteed coverage',
        'interval_log_radius':round(radius,5),
        'heldout_scores':evals,'benchmark_train_ratio':benchmark_factor,
        'quality_by_sensor':audit,
        'product_hashes':{}}
    # Figures: objective side-by-side comparisons, no claim of wildfire counts.
    fig,ax=plt.subplots(figsize=(12,4))
    ax.plot(mainrows.year+(mainrows.m-1)/12,mainrows.MODIS_cell_days,alpha=.6,lw=1,color='#ee9b5f',label='MODIS 1-km cell-days')
    t=mainrows[mainrows.VIIRS_SNPP_cell_days.notna()]
    ax.plot(t.year+(t.m-1)/12,t.VIIRS_SNPP_cell_days,lw=1.2,color='#4f9dce',label='VIIRS 1-km cell-days')
    ax.set(title='Butte County • observed monthly hotspot-cell-days, not wildfire counts',ylabel='1 km cell-days / UTC month',xlabel='Year')
    ax.legend(loc='upper left'); ax.grid(alpha=.18); fig.tight_layout();fig.savefig(CHART/'observed_common_grid.png',dpi=150);plt.close(fig)
    fig,ax=plt.subplots(figsize=(10,4.5))
    ax.plot(testing.month,testing.VIIRS_cell_days,'o-',label='Observed VIIRS',color='#4f9dce')
    ax.plot(testing.month,testprediction,'--',label='Crosswalk estimate from MODIS',color='#c37149')
    ax.set(title='Untouched holdout years 2024–2025 • including July 2024 mismatch',ylabel='1 km cell-days / month')
    ax.set_xticks(testing.month.iloc[::3]);ax.tick_params(axis='x',rotation=45);ax.legend();ax.grid(alpha=.2);fig.tight_layout();fig.savefig(CHART/'heldout_validation.png',dpi=160);plt.close(fig)
    fig,ax=plt.subplots(figsize=(11,4))
    y2=yr[yr.year>=2000]
    ax.plot(y2.year,y2.harmonized_viirs_reference_cell_days,color='#367f88',lw=2,label='VIIRS reference: observed or modeled')
    ax.scatter(y2[y2.year<=2011].year,y2[y2.year<=2011].harmonized_viirs_reference_cell_days,marker='s',facecolors='none',edgecolors='#a87c35',label='Modeled MODIS-based years')
    ax.axvline(2012,color='#777',ls=':',lw=1)
    ax.set(title='Historical VIIRS-reference proxy • method break in 2012',ylabel='1 km cell-days / year',xlabel='Year')
    ax.grid(alpha=.2);ax.legend();fig.tight_layout();fig.savefig(CHART/'historical_indicator.png',dpi=160);plt.close(fig)
    lineage['product_hashes']={p.name:sha(p) for p in sorted(OUT.glob('*.csv'))}
    (OUT/'harmonization_manifest.json').write_text(json.dumps(lineage,indent=2,allow_nan=False)+'\n')
    summary={'raw':audit,'train_cv':candidates,'model':selected,'holdout':evals,'grid_records':len(g),'months':len(mainrows),
             'model_training_max_MODIS_cell_days':int(training.MODIS_cell_days.max()),
             'july_2024':val[val.month=='2024-07'].round(2).to_dict('records')[0]}
    print(json.dumps(summary,indent=2,default=str))

if __name__=='__main__':main()
