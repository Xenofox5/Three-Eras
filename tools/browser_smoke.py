import os
from playwright.sync_api import sync_playwright
HTML = 'file://' + os.path.abspath(os.environ.get('TE_HTML', 'dist/three-eras.html'))
import time, json
errs=[]
ids=['road','pack','king','quarry','mire','shrine','wyvern','cult','prophet','malakai','mirror','elphi','chosen','gate','warden','shadows','yunze','harry','e_legends','e_ash','e_massacre','e_unbound']
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type in('error','warning') and '403' not in m.text else None)
    pg.goto(HTML)
    res=[]
    for si in [0,5,10,15,17,20]:
        pg.evaluate(f"localStorage.setItem('threeEras.save.v2', JSON.stringify({{speed:40,sound:false,team:['yunze','malakai','yousuf'],stars:{json.dumps({s:1 for s in ids})}}}))")
        pg.reload(); time.sleep(.3)
        pg.click('[data-go=campaign]'); pg.click(f'.stage[data-i="{si}"]'); pg.click('#fight'); time.sleep(.3); pg.click('#bAuto')
        t0=time.time()
        while time.time()-t0<60 and not pg.query_selector('.res'): time.sleep(.2)
        res.append(f"{si+1}:{pg.inner_text('.res h2') if pg.query_selector('.res') else 'TIMEOUT'}")
    pg.evaluate("localStorage.setItem('threeEras.save.v2', JSON.stringify({speed:40,sound:false,team:['angus','flynn','yousuf'],stars:{road:1}}))")
    pg.reload(); time.sleep(.3)
    pg.click('[data-go=gauntlet]'); pg.click('#fight'); time.sleep(.3); pg.click('#bAuto')
    t0=time.time()
    while time.time()-t0<60 and not pg.query_selector('.res'): time.sleep(.2)
    res.append('gauntlet:'+('boon' if pg.query_selector('.boon') else 'no boon'))
    print(' '.join(res))
    b.close()
print('\n'.join(errs) or 'no errors')
