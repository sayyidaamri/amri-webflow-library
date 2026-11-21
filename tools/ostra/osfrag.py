#!/usr/bin/env python3
import re, json, os, sys
from bs4 import BeautifulSoup, NavigableString, Comment
sys.path.insert(0, os.path.dirname(__file__))
from oscopy import COPY
from convert import tok, OUT, SRC
native=json.load(open(f'{OUT}/native.json'))['native']
CASE={'pleat':'halde','osprey-films':'karst','atrium':'mura','vellum':'lumen','terra':'terra','cadence':'still','skyridge':'alpenhof','prisma':'prisma'}
CATS={'digital-product':'residential','brand-identity':'hospitality','film-campaign':'cultural','packaging':'workplace','design-systems':'landscape','content-motion':'objects'}
PAGES={'index.html':'/ostra/home','about.html':'/ostra/studio','work.html':'/ostra/work','contact.html':'/ostra/contact','journal.html':'/ostra/studio'}
EXACT={' '.join(a.split()):b for a,b in COPY}
DROP_LINKS=('style-guide','licenses','changelog','404','401')
def href(h):
    if not h or h.startswith(('http','mailto','tel','#')): return h
    p,_,frag=h.partition('#')
    if p in PAGES: return PAGES[p]+('#'+frag if frag else '')
    m=re.match(r'work/([\w-]+)\.html',p)
    if m: return '#case-'+CASE.get(m.group(1),m.group(1))
    m=re.match(r'categories/([\w-]+)\.html',p)
    if m: return '/ostra/work?cat='+CATS.get(m.group(1),m.group(1))
    if p.startswith('journal'): return '/ostra/studio'
    return '#'
def text(s):
    v=' '.join(s.split())
    if not v: return s
    lead=' ' if s[:1].isspace() else ''; trail=' ' if s[-1:].isspace() else ''
    if v in EXACT: v=EXACT[v]
    v=v.replace('Norvik','Ostra')
    return lead+v+trail
def transform(el):
    for c in el.find_all(string=lambda t: isinstance(t,Comment)): c.extract()
    for a in el.find_all('a'):
        h=a.get('href','')
        if any(d in h for d in DROP_LINKS):
            (a.find_parent('li') or a).decompose(); continue
        nh=href(h); a['href']=nh
        if nh.startswith('#case-'): a['data-case']=nh[6:]
    for b in el.find_all('button'):
        b.name='div'; b['role']='button'; b['tabindex']='0'; b.attrs.pop('type',None)
    for x in el.find_all(style=True):
        m=re.fullmatch(r'width:(\d+)%',x['style'].strip())
        if m: x['class']=x.get('class',[])+['is-w'+m.group(1)]
        del x['style']
    for x in el.find_all(class_=True):
        x['class']=[tok(c) for c in x['class']]
    for img in el.find_all('img'):
        img['data-img']=os.path.basename(img['src']).rsplit('.',1)[0]
        img['src']='__IMG__'
        img.attrs.pop('loading',None)
    for t in el.find_all(string=True):
        if t.parent.name in('script','style'): continue
        t.replace_with(text(str(t)))
    for x in el.find_all(True):
        for k in ('alt','aria-label','title','placeholder'):
            if x.get(k): x[k]=text(x[k])
    return el
def stubs(el):
    chains=set()
    for x in [el]+el.find_all(True):
        cl=x.get('class') or []
        for i in range(1,len(cl)+1): chains.add(tuple(cl[:i]))
    idx={}
    for s,m,d in native: idx.setdefault((s,m),[]).append(d)
    rules=[]
    for ch in sorted(chains):
        sel='.'+'.'.join(ch)
        cands=[sel] if len(ch)==1 else (['.'+ch[-1],sel] if not ch[-1].startswith('is-') else [sel])
        got=False
        for m in (None,'991','767','479'):
            ds=[d for c in cands for d in idx.get((c,m),[])]
            if not ds: continue
            body=';'.join(ds)
            rules.append(f'@media screen and (max-width: {m}px){{{sel}{{{body}}}}}' if m else f'{sel}{{{body}}}')
            if m is None: got=True
        if not got: rules.append(sel+'{box-sizing:border-box}')
    return '\n'.join(rules)
O_RECTS=''.join('<rect fill="currentColor" height="10" width="10" x="%d" y="%d"></rect>'%p for p in [(10,0),(20,0),(30,0),(0,10),(40,10),(0,20),(40,20),(0,30),(40,30),(10,40),(20,40),(30,40)])
IMGS=json.load(open('/home/claude/os/imgs.json'))
def mini(h):
    h=re.sub(r'(<svg[^>]*view[bB]ox="0 0 50 50"[^>]*>)(?:<rect[^>]*></rect>)+', lambda m: m.group(1)+O_RECTS, h)
    h=h.replace(' class=""','').replace('Ostra Studio home','Ostra Atelier home')
    def _img(m):
        t=m.group(0); k=re.search(r'data-img="([\w-]+)"',t)
        return t.replace('src="__IMG__"','src="%s"'%IMGS.get(k.group(1),'__IMG__')) if k else t
    h=re.sub(r'<img[^>]*>',_img,h)
    h=h.replace('viewbox=','viewBox=').replace('assets/video/','https://cdn.jsdelivr.net/gh/sayyidaamri/vantra-studio.webflow.io@64b6622677ee8ff6612eecd028773e588adb378f/assets/video/')
    h=re.sub(r'>\s+<','><',h); return re.sub(r'\s{2,}',' ',h).strip()
def frag(el,name):
    h=mini(str(el)); c=stubs(el)
    open(f'{OUT}/{name}.html','w').write(h); open(f'{OUT}/{name}.css','w').write(c)
    return len(h),len(c)
if __name__=='__main__':
    page=sys.argv[1] if len(sys.argv)>1 else 'index'
    s=BeautifulSoup(open(f'{SRC}/{page}.html').read(),'html.parser')
    body=s.body; transform(body)
    imgs=sorted({i['data-img'] for i in body.find_all('img')})
    if page=='index':
        print('header',frag(body.find('header'),'header'))
        print('footer',frag(body.find('footer'),'footer'))
    for i,sec in enumerate(body.find('main').find_all('section',recursive=False)):
        n=f"{page}-{i:02d}-{sec['class'][0]}"; print(n,frag(sec,n))
    for sec in body.find(class_='os-page').find_all('section',recursive=False):
        n=f"{page}-z-{sec['class'][0]}"; print(n,frag(sec,n))
    print('imgs',imgs)
