"""Package tested Vite output as hostable static site and self-contained offline HTML."""
from pathlib import Path
import hashlib,json,re,shutil
ROOT=Path(__file__).resolve().parents[1];dist=ROOT/'frontend/dist';target=ROOT/'release/site'
assert (dist/'index.html').is_file(),'Build frontend first'
target.mkdir(parents=True,exist_ok=True)
# Remove only stale files under the verified release/site target, never source inputs.
assert target.resolve().is_relative_to((ROOT/'release').resolve())
current={p.relative_to(dist) for p in dist.rglob('*') if p.is_file()}
for p in target.rglob('*'):
    if p.is_file() and p.relative_to(target) not in current:p.unlink()
shutil.copytree(dist,target,dirs_exist_ok=True)
# The original three-record prototype data must never be shipped as a release dataset.
for n in ['observations.json','boundaries.geojson']:
    p=target/'data'/n
    if p.exists():p.unlink()
html=(dist/'index.html').read_text(encoding='utf-8')
def script(m):
    p=dist/m.group(1).removeprefix('./'); code=p.read_text(encoding='utf-8')
    assert not re.search(r'\bimport\s*\(',code),'Dynamic chunks require explicit bundling'
    return '<script type="module">'+code.replace('</script','<\\/script')+'</script>'
html=re.sub(r'<script type="module"[^>]*src="([^"]+)"[^>]*></script>',script,html)
def style(m):return '<style>'+(dist/m.group(1).removeprefix('./')).read_text(encoding='utf-8')+'</style>'
html=re.sub(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>',style,html)
assert not re.search(r'(?:src|href)="\./assets/',html)
offline=ROOT/'release/FireLens_Butte_Offline.html';offline.write_text(html,encoding='utf-8')
manifest={str(p.relative_to(ROOT/'release')).replace('\\','/'):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in (ROOT/'release').rglob('*') if p.is_file() and p.name!='release_manifest.json'}
(ROOT/'release/release_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Packaged',target,'and offline HTML',offline.stat().st_size,'bytes')
