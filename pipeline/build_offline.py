"""Generate self-contained single HTML file with CSS, JS, local data and exports.
No network or npm needed; product CSV files remain separately available too.
"""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1];WEB=ROOT/'web';D=WEB/'data'
bundle={
 'calendar':json.loads((D/'calendar.json').read_text(encoding='utf-8')),
 'grid':json.loads((D/'grid.json').read_text(encoding='utf-8')),
 'boundary':json.loads((D/'boundary.geojson').read_text(encoding='utf-8')),
 'csv':{'data/'+n:(D/n).read_text(encoding='utf-8') for n in ('monthly.csv','yearly.csv','heldout_validation.csv')}
}
html=(WEB/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(WEB/'styles.css').read_text(encoding='utf-8')+'\n</style>')
html=html.replace('<script defer src="app.js"></script>',
 '<script>window.FIRELENS_DATA='+json.dumps(bundle,separators=(',',':')).replace('</','<\\/')+';</script>\n<script>\n'+(WEB/'app.js').read_text(encoding='utf-8')+'\n</script>')
out=WEB/'FireLens_Butte_Offline.html';out.write_text(html,encoding='utf-8')
print('WROTE',out,'bytes',out.stat().st_size)
