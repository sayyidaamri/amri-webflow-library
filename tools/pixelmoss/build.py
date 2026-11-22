#!/usr/bin/env python3
"""jld2nd.dev (RAKA'8) -> PIXELMOSS: fx.css + js/pixelmoss.js (monochrome, pm- classes, new copy) + whtml fragments.
Usage: python3 build.py  (ref repo at /home/claude/jld2nd.dev, output into dist/sites/pixelmoss and /home/claude/pm/out)"""
import re, os, sys, json, shutil
import tinycss2
from bs4 import BeautifulSoup
sys.path.insert(0, os.path.dirname(__file__))
from pmcopy import COPY, NAV
REF='/home/claude/jld2nd.dev'; LIB=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
DIST=f'{LIB}/dist/sites/pixelmoss'; OUT='/home/claude/pm/out'; HERE=os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT,exist_ok=True); os.makedirs(f'{DIST}/js',exist_ok=True)
rd=lambda p: open(p,encoding='utf-8').read()

# ---------- monochrome ----------
PAL=[(0x0a,0x0a,0x0a),(0x16,0x16,0x16),(0x2e,0x2e,0x2e),(0x6b,0x6b,0x6b),(0xb5,0xb5,0xb5),(0xe2,0xe2,0xde),(0xf3,0xf3,0xef)]
def lum(r,g,b): return .2126*r+.7152*g+.0722*b
def near(r,g,b):
    L=lum(r,g,b)
    if L>150: return PAL[6] if L>205 or (g>200) else PAL[5] if L>185 else PAL[4]
    return min(PAL,key=lambda p: abs(lum(*p)-L))
def hx(p): return '#%02x%02x%02x'%p
def mono_hex(m):
    h=m.group(1)
    if len(h) in (3,4): h=''.join(c*2 for c in h[:3])+(h[3]*2 if len(h)==4 else '')
    r,g,b=int(h[0:2],16),int(h[2:4],16),int(h[4:6],16)
    return hx(near(r,g,b))+(h[6:8] if len(h)==8 else '')
def mono_rgba(m):
    r,g,b=[int(float(x)) for x in m.group(2).split(',')[:3]]; rest=m.group(2).split(',')[3:]
    p=near(r,g,b); return f"{m.group(1)}({p[0]},{p[1]},{p[2]}{','+','.join(rest) if rest else ''})"
def mono(s):
    s=re.sub(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b(?![\w-])',mono_hex,s)
    return re.sub(r'(rgba?)\(\s*([\d.\s,%]+)\)',mono_rgba,s)

# ---------- art contrast: near() collapses shade pairs (skin/shadow, sleeve/skin, hair/highlight) ----------
BG=PAL[0]; GAP=60
SEP_PAIRS=[('Y','y'),('H','h'),('C','c'),('S','s'),('P','p')]
HAND_PAIRS=[('B','h'),('h','s')]          # sleeve/skin, skin/nail shading
BG_FLOOR={'handRPal':('B',),'handLPal':('B',)}   # sleeves must read against the #0a0a0a section bg
def unhx(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))
def away(base):
    """nearest PAL shade >= GAP luminance from base; light bases go darker, dark go lighter."""
    Lb=lum(*base); order=sorted(PAL,key=lambda p: abs(lum(*p)-Lb))
    pref=[p for p in order if abs(lum(*p)-Lb)>=GAP and ((lum(*p)<Lb) if Lb>150 else (lum(*p)>Lb))]
    return (pref or [p for p in order if abs(lum(*p)-Lb)>=GAP] or [order[-1]])[0]
def sep_art(js):
    m=re.search(r'const C = \{(.*?)\};',js,re.S)
    C={k:v for k,v in re.findall(r'(\w+):\s*"(#[0-9a-f]{6})"',m.group(1))} if m else {}
    def fix_obj(name,body):
        ents=re.findall(r'(\w+):\s*("#[0-9a-f]{6}"|C\.\w+)',body)
        val={k:(v.strip('"') if v.startswith('"') else C.get(v[2:],'')) for k,v in ents}
        new=dict(val)
        for k in BG_FLOOR.get(name,()):
            if k in new and abs(lum(*unhx(new[k]))-lum(*BG))<GAP: new[k]=hx(away(BG))
        for a,b in (HAND_PAIRS if name.startswith('hand') else SEP_PAIRS):
            if a in new and b in new and abs(lum(*unhx(new[a]))-lum(*unhx(new[b])))<GAP: new[b]=hx(away(unhx(new[a])))
        for k in new:
            if new[k]!=val[k]: body=re.sub(r'(\b%s:\s*)("#[0-9a-f]{6}"|C\.\w+)'%k,lambda q:q.group(1)+'"%s"'%new[k],body,count=1)
        return body
    js=re.sub(r'(const (handLPal|handRPal|glassesPal) = )\{([^{}]*)\}',lambda q:q.group(1)+'{'+fix_obj(q.group(2),q.group(3))+'}',js)
    js=re.sub(r'(\n\s*(dev|creative): \{ )([^{}]*?)( \},)',lambda q:q.group(1)+(fix_obj(q.group(2),q.group(3)) if '...' not in q.group(3) else q.group(3))+q.group(4),js)
    js=re.sub(r'(\n\s*(dev|creative): \{ \.\.\.avatarPal\.\w+, )([^{}]*?)( \},)',lambda q:q.group(1)+fix_obj(q.group(2),q.group(3))+q.group(4),js)
    return js
if '--fix-dist' in sys.argv:   # ref repo not needed: re-run only the contrast pass on the built bundle
    p=f'{DIST}/js/pixelmoss.js'; s=sep_art(rd(p)); open(p,'w').write(s); sys.exit(0)

# ---------- classes ----------
html=rd(f'{REF}/index.html')
for a,b in COPY: html=html.replace(a,b).replace(a.replace('<br/>','<br>'),b)
soup=BeautifulSoup(html,'html.parser')
css_src=rd(f'{REF}/assets/css/base.css')+'\n'+rd(f'{REF}/assets/css/home.css')
jsnames=['art','core','home']; js={n:rd(f'{REF}/assets/js/{n}.js') for n in jsnames}
css_cls=set(re.findall(r'\.(-?[a-zA-Z_][\w-]*)',' '.join(tinycss2.serialize(r.prelude) for r in tinycss2.parse_stylesheet(css_src,skip_comments=True,skip_whitespace=True) if r.type=='qualified-rule')))
for r in tinycss2.parse_stylesheet(css_src,skip_comments=True,skip_whitespace=True):
    if r.type=='at-rule' and r.content:
        for q in tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True):
            if q.type=='qualified-rule': css_cls|=set(re.findall(r'\.(-?[a-zA-Z_][\w-]*)',tinycss2.serialize(q.prelude)))
html_cls={c for x in soup.find_all(class_=True) for c in x['class']}
alljs='\n'.join(js.values())
js_cls=set()
for m in re.finditer(r'class="([^"$]*)"',alljs): js_cls|=set(m.group(1).split())
for m in re.finditer(r'className\s*=\s*"([^"]*)',alljs): js_cls|=set(m.group(1).split())
P={c for c in (html_cls|js_cls|css_cls) if (c in html_cls or c in js_cls) and not c.startswith(('is-','no-','has-'))}
P|={'arcade-label','arcade-cab','arcade-screen','arcade-start','arcade-name','arcade-tag','arcade-grid'}
STATE=sorted((css_cls-P))
pm=lambda c: 'pm-'+c
def ren_tokens(s): return ' '.join(pm(t) if t in P else t for t in s.split())

# ---------- CSS ----------
extra=rd(f'{HERE}/extra.css')
css=css_src+'\n'+extra
css=css.replace('url(../fonts/','url(fonts/')
css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
def ren_css(s):
    out=[]
    def q(rule,media=None):
        pre=tinycss2.serialize(rule.prelude)
        pre=re.sub(r'\.(-?[a-zA-Z_][\w-]*)',lambda m:'.'+(pm(m.group(1)) if m.group(1) in P else m.group(1)),pre)
        pre=pre.replace(':disabled','.is-disabled')
        return pre.strip()+'{'+tinycss2.serialize(rule.content).strip()+'}'
    for r in tinycss2.parse_stylesheet(s,skip_comments=True,skip_whitespace=True):
        if r.type=='qualified-rule': out.append(q(r))
        elif r.type=='at-rule' and r.lower_at_keyword in('media','supports'):
            inner=''.join(q(x) for x in tinycss2.parse_rule_list(r.content,skip_comments=True,skip_whitespace=True) if x.type=='qualified-rule')
            out.append('@'+r.lower_at_keyword+' '+tinycss2.serialize(r.prelude).strip()+'{'+inner+'}')
        else: out.append(tinycss2.serialize([r]))
    return '\n'.join(out)
css=ren_css(css)
css=mono(css)
# tokens -> Webflow PM variables
VARS={'--color-ink':'var(--_pm---pm-ink,#0a0a0a)','--color-white':'var(--_pm---pm-paper,#f3f3ef)','--color-lime':'var(--_pm---pm-paper,#f3f3ef)',
 '--color-primary':'var(--_pm---pm-paper,#f3f3ef)','--color-secondary':'var(--_pm---pm-paper,#f3f3ef)','--color-cream':'var(--_pm---pm-gray-100,#e2e2de)',
 '--color-lime-d':'var(--_pm---pm-gray-500,#6b6b6b)','--color-dock':'var(--_pm---pm-gray-300,#b5b5b5)',
 '--pixel':'var(--_pm---pm-font-pixel,"Pixel",ui-monospace,monospace)','--head':'var(--_pm---pm-font-head,"Mozilla Headline",system-ui,sans-serif)'}
for k,v in VARS.items(): css=re.sub(re.escape(k)+r':[^;}]+',k+':'+v,css,count=1)
css=re.sub(r'--page-gutter:40px','--page-gutter:var(--_pm---pm-page-gutter,40px)',css,count=1)
css=re.sub(r'--gutter:35px','--gutter:var(--_pm---pm-gutter,35px)',css,count=1)
css=re.sub(r'\s+',' ',css); css=re.sub(r'\s*([{};:,>])\s*',r'\1',css).replace(';}','}')
css=css.replace('and(','and (')
open(f'{DIST}/fx.css','w').write(css)

# ---------- JS ----------
def ren_js(s):
    for a,b in COPY: s=s.replace(a,b)
    s=s.replace('"#ceff00"','"#f3f3ef"')
    def strlit(m):
        q,body=m.group(1),m.group(2)
        body=re.sub(r'class="([^"$]*)"',lambda k:'class="'+ren_tokens(k.group(1))+'"',body)
        body=re.sub(r'(?<![\w$])\.(-?[a-zA-Z_][\w-]*)',lambda k:'.'+(pm(k.group(1)) if k.group(1) in P else k.group(1)),body)
        if re.fullmatch(r'[\w\- ]+',body) and any(t in P for t in body.split()) and all(t in P or t in STATE or t.startswith('is-') for t in body.split()):
            body=ren_tokens(body)
        return q+body+q
    s=re.sub(r'(["`])((?:\\.|(?!\1).)*?)\1',strlit,s,flags=re.S)
    s=re.sub(r"className = \"window \"",'className = "pm-window "',s)
    s=s.replace('.disabled = ','.classList.toggle("is-disabled", ').replace('mode === "dev";','mode === "dev");').replace('mode === "creative";','mode === "creative");')
    s=s.replace('closest("button, a")','closest("button, a, [role=button]")').replace('closest("a, button, .pm-selection-button")','closest("a, button, [role=button], .pm-selection-button")')
    return mono(s)
art=js['art']
art=art.replace('    8: [".###.",','    P: ["####.","#...#","#...#","####.","#....","#....","#...."],\n    I: ["###",".#.",".#.",".#.",".#.",".#.","###"],\n    X: ["#...#","#...#",".#.#.","..#..",".#.#.","#...#","#...#"],\n    E: ["#####","#....","#....","####.","#....","#....","#####"],\n    L: ["#....","#....","#....","#....","#....","#....","#####"],\n    M: ["#...#","##.##","#.#.#","#.#.#","#...#","#...#","#...#"],\n    O: [".###.","#...#","#...#","#...#","#...#","#...#",".###."],\n    S: [".####","#....","#....",".###.","....#","....#","####."],\n    8: [".###.",',1)
js['art']=art
bundle='/* PIXELMOSS (Amri Webflow Library) — built from jld2nd.dev by tools/pixelmoss/build.py */\n'
bundle+='\n'.join(ren_js(js[n]) for n in jsnames)+'\n'+rd(f'{HERE}/arcade.js')+'\n'+rd(f'{HERE}/arcade-page.js')
HOME_HDR='/* PIXELMOSS — home page: loader, intro, modes, chomper nav, scroll-driven scenes. */\n(function () {\n  const A = window.ART, K = window.CORE;\n'
bundle=bundle.replace(HOME_HDR,HOME_HDR+rd(f'{HERE}/subpage.js'),1)  # guard: sub pages (play/arcade/contact)
open(f'{DIST}/js/pixelmoss.js','w').write(sep_art(bundle))

# ---------- markup -> whtml fragments ----------
body=soup.body
for s in body.find_all('script'): s.decompose()
for b in body.find_all('button'):
    b.name='div'; b['role']='button'; b['tabindex']='0'; b.attrs.pop('type',None)
arc=BeautifulSoup(rd(f'{HERE}/arcade.html'),'html.parser')
body.find(id='hands').insert_after(arc)
for x in body.find_all(class_=True): x['class']=[pm(c) if c in P else c for c in x['class']]
for a in body.find_all('a'):
    if not a.get('href'): a['href']='#'
# nav labels + arcade dot
ol=body.find('ol')
for a in ol.find_all('a'):
    k=a.get('data-section'); 
    if k in NAV: a['aria-label']=NAV[k]; a['title']=NAV[k]
hands_li=ol.find('a',attrs={'data-section':'hands'}).parent
li=soup.new_tag('li'); na=soup.new_tag('a',attrs={'class':'pm-section-nav-food','data-section':'arcade','href':'#arcade','aria-label':'Arcade','title':'Arcade'}); li.append(na); hands_li.insert_after(li)
for a in body.select('#home-dock a'):
    t=a.get('title','')
    if t=='Game': a['href']='/pixelmoss/play'
    if t=='Projects': a['title']='Arcade'; a['aria-label']='Arcade'; a['href']='/pixelmoss/arcade'
def mini(e):
    h=str(e).replace('<br/>','<br>'); h=re.sub(r'>\s+<','><',h); return re.sub(r'\s{2,}',' ',h).strip()
frags={}
chrome=''.join(mini(body.find(id=i)) for i in ('loader','site-header','section-nav','home-dock'))
frags['header']=chrome
footer=body.find(id='home-footer'); frags['footer']=mini(footer); footer.decompose()
for i,sec in enumerate(body.find('main').find_all('section',recursive=False)):
    frags[f'{i:02d}-{sec["id"]}']=mini(sec)
for k,v in frags.items(): open(f'{OUT}/{k}.html','w').write(v)
print('fx',len(css),'js',len(bundle),'P',len(P),'state',len(STATE)); print({k:len(v) for k,v in frags.items()})
json.dump({'P':sorted(P),'STATE':STATE},open(f'{OUT}/classes.json','w'))
