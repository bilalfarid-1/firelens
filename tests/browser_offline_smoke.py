"""Optional Chromium test of the completely standalone, fully self-contained HTML.
Runs without any URL fetch or local HTTP service. Requires playwright and Chromium.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'web'/'FireLens_Butte_Offline.html').read_text()
with sync_playwright() as p:
    exe='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None
    browser=p.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
    errs=[];page.on('pageerror',lambda err:errs.append(str(err)))
    page.set_content(html,wait_until='load');page.wait_for_function('document.getElementById("year").options.length===26')
    assert page.locator('#selected-name').inner_text()=='Nov 2018'
    assert page.locator('#selected-indicator').inner_text()=='1,220'
    with page.expect_download() as d: page.locator('a.nav-download').click()
    print('csv download filename',d.value.suggested_filename);assert d.value.suggested_filename.endswith('.csv')
    page.select_option('#year','2024');page.locator('.month-tile').nth(6).click()
    assert page.locator('#quality-heading').inner_text()=='July 2024: major mismatch'
    assert page.locator('#viirs-count').inner_text()=='58'
    page.select_option('#year','2001')
    assert page.locator('#map-viirs').is_disabled()
    page.set_viewport_size({'width':390,'height':800})
    assert page.evaluate('document.documentElement.scrollWidth')<=394
    assert not errs,errs
    print('STANDALONE HTML PASS: no fetch, calendar, map, full CSV export, anomaly, early sensor availability, mobile; no JS errors')
    browser.close()
