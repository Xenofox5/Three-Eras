import os
from playwright.sync_api import sync_playwright
HTML = 'file://' + os.path.abspath(os.environ.get('TE_HTML', 'dist/three-eras.html'))
import time, json, sys
errs=[]; part=int(sys.argv[1])
teams=[['trigg','alfred','yousuf'],['ethan','ben','gemia'],['kingsley','vasco','david'],['aamay','harry','daniel'],['soham','vehra','seraphine'],['trigg','ethan','kingsley']]
builds={'trigg':'packmaster','alfred':'chaos','ethan':'warking','ben':'schemer','kingsley':'collector','vasco':'hollow','aamay':'archivist','soham':'breaker'}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type in('error','warning') and '403' not in m.text else None)
    pg.goto(HTML); time.sleep(.3)
    ids=pg.evaluate("STAGES.map(s=>s.id)"); n=len(ids)
    rng = range(0,16) if part==0 else range(16,n)
    res=[]
    for si in rng:
        t=teams[si%len(teams)]
        pg.evaluate(f"localStorage.setItem('threeEras.save.v2', JSON.stringify({{speed:40,sound:false,team:{json.dumps(t)},builds:{json.dumps(builds)},stars:{json.dumps({s:1 for s in ids})}}}))")
        pg.reload(); time.sleep(.2)
        pg.evaluate(f"showTeam({{mode:'campaign', idx:{si}}})"); pg.click('#fight'); time.sleep(.2); pg.click('#bAuto')
        t0=time.time()
        while time.time()-t0<60 and not pg.query_selector('.res'): time.sleep(.2)
        res.append(f"{si+1}:{(pg.inner_text('.res h2') if pg.query_selector('.res') else 'TIMEOUT')[:3]}")
    if part==1:
        pg.evaluate("localStorage.setItem('threeEras.save.v2', JSON.stringify({speed:40,sound:false,stars:{road:1},custom:{team:['angus','flynn','leo'],foes:['trigg','alfred','ethan','ben','kingsley'],power:1}}))")
        pg.reload(); time.sleep(.3); pg.evaluate("showCustom()"); pg.click('#cgo'); time.sleep(.3); pg.click('#bAuto')
        t0=time.time()
        while time.time()-t0<60 and not pg.query_selector('.res'): time.sleep(.2)
        res.append('custom:'+(pg.inner_text('.res h2') if pg.query_selector('.res') else 'TIMEOUT')[:3])
        pg.evaluate("localStorage.setItem('threeEras.save.v2', JSON.stringify({speed:40,sound:false,team:['trigg','vasco','aamay'],stars:"+json.dumps({s:1 for s in ids})+"}))")
        pg.reload(); time.sleep(.3); pg.evaluate("showTeam({mode:'gauntlet'})"); pg.click('#fight'); time.sleep(.3); pg.click('#bAuto')
        w=0
        while w<4:
            t0=time.time()
            while time.time()-t0<60 and not pg.query_selector('.res'): time.sleep(.2)
            bo=pg.query_selector('.boon')
            if not bo: break
            bo.click(); w+=1; time.sleep(.4)
        res.append(f'gauntlet waves:{w}')
    print(' '.join(res))
    b.close()
print('\n'.join(errs[:15]) or 'no errors')
