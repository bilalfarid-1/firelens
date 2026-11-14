'use strict';
/* FireLens Butte: pure static web app, intentionally no remote APIs or live alerts. */
const $=id=>document.getElementById(id);
const svgNS='http://www.w3.org/2000/svg';
const nf=new Intl.NumberFormat('en-US',{maximumFractionDigits:1});
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let rows=[],gridRows=[],boundary=null,byMonth=new Map(),state={year:2018,month:11,sensor:'VIIRS_SNPP'};
let geoProject=null;
function notify(message){const node=$('toast');node.textContent=message;node.classList.add('show');setTimeout(()=>node.classList.remove('show'),4000)}
function isoMonth(y,m){return `${y}-${String(m).padStart(2,'0')}`}
function current(){return byMonth.get(isoMonth(state.year,state.month))}
function isEstimated(r){return r?.status==='estimated_from_MODIS'}
function amount(n){return n==null?'Unavailable':nf.format(n)}
function setYear(y){state.year=Math.min(2025,Math.max(2000,Number(y)));if(state.year===2000&&state.month<11)state.month=11;render()}
function setMonth(m){state.month=Number(m);render()}
function render(){const r=current();$('year').value=state.year;$('prev-year').disabled=state.year===2000;$('next-year').disabled=state.year===2025;
  if(r.viirs==null)state.sensor='MODIS';renderCalendar();renderMetrics(r);renderMap(r);renderHistory()}
function colorFor(value){let fraction=Math.min(1,Math.max(0,Math.log1p(value||0)/Math.log1p(1250)));let stops=[[28,50,54],[50,100,99],[126,172,131],[241,160,107]];let pos=fraction*3;let i=Math.min(2,Math.floor(pos)),t=pos-i;let col=stops[i].map((a,j)=>Math.round(a+(stops[i+1][j]-a)*t));return 'rgb('+col.join(',')+')'}
function renderCalendar(){const container=$('calendar-months');container.textContent='';for(let m=1;m<=12;m++){
  const r=byMonth.get(isoMonth(state.year,m));const btn=document.createElement('button');btn.type='button';btn.className='month-tile'+(state.month===m?' active':'')+(isEstimated(r)?' estimated':'');
  btn.disabled=!r;btn.style.background=r?colorFor(r.harmonized):'#203035';btn.setAttribute('aria-label',r?`${monthNames[m-1]} ${state.year} ${amount(r.harmonized)} ${isEstimated(r)?'modeled':'observed'} cell days`:`${monthNames[m-1]} unavailable`);
  btn.innerHTML=`<span class="month-name">${monthNames[m-1].toUpperCase()}</span><strong class="month-value">${r?nf.format(Math.round(r.harmonized)):'—'}</strong><span class="month-unit">${r&&isEstimated(r)?'ESTIMATE':'CELL-DAYS'}</span>`;
  btn.addEventListener('click',()=>setMonth(m));container.appendChild(btn)
}}
function renderMetrics(r){const month=monthNames[state.month-1];$('selected-name').textContent=`${month} ${state.year}`;$('selected-indicator').textContent=nf.format(r.harmonized);
 const signal=$('source-signal');signal.textContent=isEstimated(r)?'MODELED FROM MODIS':'OBSERVED VIIRS S-NPP';signal.className='signal'+(isEstimated(r)?' estimated':'');
 $('interval').textContent=isEstimated(r)?`Empirical residual band: ${amount(r.low)}–${amount(r.high)} cell-days (not guaranteed coverage).`:'Observed VIIRS cell-day occupancy. Observation completeness not verified.';
 $('modis-count').textContent=amount(r.modis);$('viirs-count').textContent=amount(r.viirs);
 const max=Math.max(1,r.modis,r.viirs||0);$('modis-bar').style.width=`${r.modis/max*100}%`;$('viirs-bar').style.width=r.viirs==null?'0%':`${r.viirs/max*100}%`;
 $('raw-records').textContent=`Presumed-vegetation raw rows: MODIS ${r.modis_raw} / VIIRS ${amount(r.viirs_raw)}.`;
 const headings={large_sensor_disagreement:'July 2024: major mismatch',VIIRS_partial_coverage:'January 2012 is incomplete',MODIS_early_Terra_only:'Early MODIS era: Terra only'};
 const explanations={large_sensor_disagreement:'MODIS finds extensive activity on July 25–26; the provided VIIRS S-NPP county file contains none on those days. NASA MODAPS documents an S-NPP outage July 24–29, 2024. Reference coverage is incomplete; the number of missed detections remains unknown.',VIIRS_partial_coverage:'VIIRS S-NPP archive starts January 20, 2012; we therefore mark January as partial and use a MODIS-based estimate instead of treating the VIIRS zero as a full month.',MODIS_early_Terra_only:'This early history has only Terra MODIS before Aqua enters the record. A model trained on later Terra+Aqua observations may not transfer reliably.'};
 $('quality-heading').textContent=headings[r.flag]||'Activity, not unique fires';$('quality-text').textContent=explanations[r.flag]||'The satellites view different pixels and overpass times. Cloud, smoke, thresholds and incomplete sampling can all change recorded activity.';
}
function coordinates(geom){if(!geom)return[];if(geom.type==='Polygon')return geom.coordinates; if(geom.type==='MultiPolygon')return geom.coordinates.flat();return[]}
function mapProjection(){const rings=coordinates(boundary.features[0].geometry);const all=rings.flat(),minLon=Math.min(...all.map(p=>p[0])),maxLon=Math.max(...all.map(p=>p[0])),minLat=Math.min(...all.map(p=>p[1])),maxLat=Math.max(...all.map(p=>p[1]));const cf=Math.cos(39.7*Math.PI/180);const scale=Math.min(550/((maxLon-minLon)*cf),415/(maxLat-minLat));const left=(650-(maxLon-minLon)*cf*scale)/2,top=(490-(maxLat-minLat)*scale)/2;return ([lon,lat])=>[left+(lon-minLon)*cf*scale,top+(maxLat-lat)*scale]}
function childSvg(name,attrs,parent,title){const e=document.createElementNS(svgNS,name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(title){const t=document.createElementNS(svgNS,'title');t.textContent=title;e.appendChild(t)}parent.appendChild(e);return e}
function renderMap(r){$('map-viirs').disabled=r.viirs==null;if(r.viirs==null&&state.sensor==='VIIRS_SNPP')state.sensor='MODIS';$('map-viirs').classList.toggle('active',state.sensor==='VIIRS_SNPP');$('map-modis').classList.toggle('active',state.sensor==='MODIS');
 const layer=$('map-layer');layer.textContent='';if(!geoProject)geoProject=mapProjection();
 for(const ring of coordinates(boundary.features[0].geometry)){
   const d=ring.map((p,i)=>{const pt=geoProject(p);return(i?'L':'M')+pt[0].toFixed(2)+','+pt[1].toFixed(2)}).join(' ')+' Z';
   childSvg('path',{d,fill:'#294f4b','fill-opacity':'.6',stroke:'#9bcab1','stroke-width':'1.25'},layer)
 }
 const key=state.sensor==='MODIS'?3:4;const monthIndex=rows.findIndex(a=>a.month===r.month);const points=gridRows.filter(a=>a[0]===monthIndex&&a[key]>0);const color=state.sensor==='MODIS'?'#f0a474':'#b4e8bb';
 for(const p of points){const xy=geoProject([p[1],p[2]]);childSvg('circle',{cx:xy[0].toFixed(2),cy:xy[1].toFixed(2),r:Math.min(10,2+Math.sqrt(p[key])*1.5),fill:color,'fill-opacity':'.71',stroke:'#0d292e','stroke-width':'.42'},layer,`${state.sensor==='MODIS'?'MODIS':'VIIRS'} • ${p[key]} detected UTC day(s) • ${p[2]}°N, ${p[1]}°E`)}
 $('map-month').textContent=`${monthNames[state.month-1]} ${state.year}`;$('map-cell-total').textContent=nf.format(points.length);
 $('map-source').textContent=`${state.sensor==='MODIS'?'MODIS Terra/Aqua':'VIIRS S-NPP'} detected activity in ${points.length} distinct 1-km cells. Bubble size reflects the number of UTC days with at least one recorded hotspot in that cell.`;
 $('map-subtitle').textContent=`${state.sensor==='MODIS'?'MODIS Terra/Aqua':'VIIRS S-NPP'} • Unique grid cells with detected activity during ${monthNames[state.month-1]} ${state.year}.`;
}
function exportSelectedRange(){const start=$('range-from').value,end=$('range-to').value;if(!start||!end||start>end){notify('Choose a valid month range.');return}const subset=rows.filter(r=>r.month>=start&&r.month<=end);if(!subset.length){notify('No months in that range.');return}const columns=['month','year','modis','viirs','modis_raw','viirs_raw','harmonized','status','low','high','flag'];const lines=[columns.join(','),...subset.map(r=>columns.map(c=>r[c]==null?'':r[c]).join(','))];const blob=new Blob([lines.join('\n')+'\n'],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`FireLens_Butte_${start}_to_${end}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);notify(`Exported ${subset.length} months; observed and estimated flags included.`)}
function renderHistory(){const holder=$('history-bars');holder.textContent='';const annual=new Map();for(const r of rows){if(!annual.has(r.year))annual.set(r.year,0);annual.set(r.year,annual.get(r.year)+r.harmonized)}const highest=Math.max(...annual.values());
 for(const [year,value] of annual){const b=document.createElement('button');b.type='button';b.className='year-bar'+(year<=2011?' estimated':'')+(state.year===year?' current':'');b.style.setProperty('--h',`${Math.max(1,value/highest*100)}%`);b.setAttribute('data-tooltip',`${year}: ${nf.format(Math.round(value))} cell-days`);b.setAttribute('aria-label',`${year} total ${nf.format(value)} cell-days; click to view`);b.addEventListener('click',()=>{setYear(year);$('calendar').scrollIntoView({behavior:'smooth'})});holder.appendChild(b)}
}
async function start(){try{const bundle=window.FIRELENS_DATA;const [cal,grid,bound]=bundle?[bundle.calendar,bundle.grid,bundle.boundary]:await Promise.all(['data/calendar.json','data/grid.json','data/boundary.geojson'].map(u=>fetch(u).then(r=>{if(!r.ok)throw Error(`${u}: ${r.status}`);return r.json()})));if(bundle?.csv){for(const a of document.querySelectorAll('a[download]')){const sourceFile=a.getAttribute('href');const payload=bundle.csv[sourceFile];if(!payload)continue;const blob=new Blob([payload],{type:'text/csv;charset=utf-8'});a.href=URL.createObjectURL(blob);a.download=sourceFile.split('/').pop()}}
 rows=cal.rows;gridRows=grid.rows;boundary=bound;byMonth=new Map(rows.map(r=>[r.month,r]));for(let y=2000;y<=2025;y++){const o=document.createElement('option');o.value=y;o.textContent=y;$('year').appendChild(o)}
 $('export-range').addEventListener('click',exportSelectedRange);$('year').addEventListener('change',e=>setYear(e.target.value));$('prev-year').addEventListener('click',()=>setYear(state.year-1));$('next-year').addEventListener('click',()=>setYear(state.year+1));$('map-viirs').addEventListener('click',()=>{state.sensor='VIIRS_SNPP';renderMap(current())});$('map-modis').addEventListener('click',()=>{state.sensor='MODIS';renderMap(current())});render();
 }catch(err){console.error(err);document.querySelector('main').innerHTML=`<div style="padding:40px;max-width:750px"><h1>Data could not load</h1><p>Serve the web folder over HTTP, rather than opening index.html directly. Run <code>python -m http.server 8000 --directory web</code> from the project root, then open http://localhost:8000. The application uses local, versioned static data files.</p><pre id="error-detail"></pre></div>`;$('error-detail').textContent=err.message;}}
window.addEventListener('DOMContentLoaded',start);
