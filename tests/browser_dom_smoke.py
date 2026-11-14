"""Optional visual/interaction smoke test in Chromium with static data injected.

Why injection? In some sandboxes Chromium local navigation is denied by policy,
although HTTP delivery works; here page DOM and real app code are exercised.
The browser here does NOT prove public deployment or external URL reachability.
Requires: pip install playwright; locally installed Chromium (or Playwright browser).
"""
from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]; W=R/'web'; S=R/'screenshots';S.mkdir(exist_ok=True)
html=(W/'index.html').read_text().replace('<link rel="stylesheet" href="styles.css">','').replace('<script defer src="app.js"></script>','')
css=(W/'styles.css').read_text();js=(W/'app.js').read_text().replace("window.addEventListener('DOMContentLoaded',start);",'')
sources={str(p.relative_to(W)):json.loads(p.read_text()) for p in list((W/'data').glob('*.json'))+list((W/'data').glob('*.geojson'))}
with sync_playwright() as p:
 exe='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None
 browser=p.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':940},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded');page.add_style_tag(content=css)
 page.evaluate('(sources)=>{window.fetch=async(url)=>{const data=sources[url];return {ok:data!==undefined,status:data!==undefined?200:404,json:async()=>data}}}',sources)
 page.add_script_tag(content=js);page.evaluate('start()')
 page.wait_for_function('document.getElementById("year").options.length === 26')
 assert page.locator('#selected-name').inner_text()=='Nov 2018'
 assert page.locator('#selected-indicator').inner_text()=='1,220'
 assert page.locator('#map-layer circle').count()>100
 page.screenshot(path=str(S/'01_dashboard_desktop.png'),full_page=True)
 page.select_option('#year','2024');page.locator('.month-tile').nth(6).click()
 assert page.locator('#quality-heading').inner_text()=='July 2024: major mismatch'
 assert page.locator('#viirs-count').inner_text()=='58'
 assert page.locator('#modis-count').inner_text()=='322'
 page.screenshot(path=str(S/'02_july_2024_warning.png'),full_page=True)
 page.select_option('#year','2001');assert page.locator('#map-viirs').is_disabled()
 assert page.locator('#source-signal').inner_text()=='MODELED FROM MODIS'
 assert page.locator('#map-layer circle').count()>0
 page.select_option('#year','2018')
 page.locator('.month-tile').nth(10).click()
 page.locator('#range-from').fill('2018-11');page.locator('#range-to').fill('2018-12')
 with page.expect_download() as dl:page.locator('#export-range').click()
 download=dl.value
 assert download.suggested_filename=='FireLens_Butte_2018-11_to_2018-12.csv'
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path=str(S/'03_mobile_dashboard.png'),full_page=True)
 assert page.evaluate('document.documentElement.scrollWidth')<=394
 assert not errors,errors
 print('BROWSER DOM PASS: initial calendar, 2024 anomaly, early VIIRS disabled, map, CSV download, mobile, no JS errors')
 print('SCREENSHOTS',*[str(p) for p in sorted(S.glob('*.png'))],sep='\n')
 browser.close()
