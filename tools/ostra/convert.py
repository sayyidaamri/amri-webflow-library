#!/usr/bin/env python3
"""Ostra (Norvik ref) -> Webflow fragments. Output in /home/claude/os/out"""
import re, json, os, sys
import tinycss2
from bs4 import BeautifulSoup, NavigableString, Comment
sys.path.insert(0, os.path.dirname(__file__))
from oscopy import COPY
SRC='/home/claude/ref/vantra-studio.webflow.io'; OUT='/home/claude/os/out'
ROOT='.page-wrapper.is-os'
css_src=open(f'{SRC}/assets/css/style.css').read()

KEEP=('is-','has-','lenis','menu-open','split-line','shake')
def base(c): return 'os-'+c.replace('__','_')
def tok(c):
    if c.startswith(KEEP): return c
    if '--' in c: return 'is-'+c.split('--',1)[1]
    return base(c)
def selcls(c):
    if c.startswith(KEEP): return '.'+c
    if '--' in c:
        b,m=c.split('--',1); return '.'+base(b)+'.is-'+m
    return '.'+base(c)
ELEM=re.compile(r'(?<![\w.#:-])(html|body|h[1-6]|p|a|img|video|svg|button|blockquote|ul|ol|\*)(?![\w-])')
def rensel(s):
    s=s.strip()
    if s in(':root',): return None
    s2=re.sub(r'\.(-?[a-zA-Z_][\w-]*)', lambda m: selcls(m.group(1)), s)
    # element/global selectors -> scope under ROOT
    if s2.startswith('html') or s2.startswith('body'):
        s2=re.sub(r'^(html(\.[\w-]+)*\s*)?body','',s2).strip()
        s2=re.sub(r'^html(\.lenis)?(\.[\w-]+)*', lambda m: m.group(0), s2)
        if s2.startswith('html'): return s2  # keep html.lenis rules global
        return (ROOT+(' '+s2 if s2 else '')).strip()
    if s2.startswith('[hidden]'): return ROOT+' '+s2
    if re.match(r'^(\*|h[1-6]|p|a|img|video|svg|button|blockquote|ul|ol)\b',s2):
        return ROOT+' '+s2
    if s2.startswith('.page'): return s2.replace('.os-page',ROOT,1)
    if s2.startswith('.os-main'): return s2.replace('.os-main','.main-wrapper.is-os',1)
    return s2

root_vars={}; out_rules=[]; native=[]
def ser(n): return tinycss2.serialize(n).strip()
SIMPLE=re.compile(r'^\.os-[\w-]+(\.is-[\w-]+)?$')
def lit(v):
    for _ in range(3):
        v=re.sub(r'var\((--[\w-]+)\)', lambda m: root_vars.get(m.group(1),m.group(0)), v)
    return v
def handle(rule, media=None):
    sel=ser(rule.prelude); body=ser(rule.content)
    if sel==':root':
        for d in tinycss2.parse_declaration_list(rule.content,skip_whitespace=True,skip_comments=True):
            if d.type=='declaration' and media is None: root_vars['--'+d.name.lstrip('-')]=ser(d.value)
        out_rules.append((media, ROOT+'{'+body+'}')); return
    sels=[x for x in (rensel(s) for s in sel.split(',')) if x]
    if not sels: return
    out_rules.append((media, ','.join(sels)+'{'+body+'}'))
    if media in (None,'991','767','479') and all(SIMPLE.match(s) for s in sels):
        decls=[]
        for d in tinycss2.parse_declaration_list(rule.content,skip_whitespace=True,skip_comments=True):
            if d.type!='declaration': continue
            v=lit(ser(d.value))
            if 'var(' in v or '!important' in v or 'url(' in v or d.name.startswith('--'): continue
            decls.append(f'{d.name}:{v}')
        if decls:
            for s in sels: native.append((s,media,';'.join(decls)))
for node in tinycss2.parse_stylesheet(css_src,skip_whitespace=True,skip_comments=True):
    if node.type=='qualified-rule': handle(node)
    elif node.type=='at-rule' and node.lower_at_keyword=='media':
        q=ser(node.prelude); m=re.fullmatch(r'\(max-width:\s*(\d+)px\)',q)
        key=m.group(1) if m and m.group(1) in('991','767','479') else q
        for r in tinycss2.parse_rule_list(node.content,skip_whitespace=True,skip_comments=True):
            if r.type=='qualified-rule': handle(r,key)
    elif node.type=='at-rule' and node.lower_at_keyword=='keyframes':
        out_rules.append((None,ser([node])))

def mq(k):
    if k is None: return None
    return f'screen and (max-width: {k}px)' if k in('991','767','479') else k
# fx css (full)
fx=[]
fx.append("@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');")
fx.append(ROOT+'{font-size:calc(clamp(768px,100vw,1920px)/(1440/var(--unit)));line-height:1.55;font-weight:400;-webkit-font-smoothing:antialiased;overflow:clip;position:static;font-family:var(--text);color:var(--ink);background:var(--paper)}')
fx.append('.main-wrapper.is-os{position:relative;z-index:auto}')
fx.append(ROOT+' [role=button]{cursor:pointer;user-select:none}')
for m,r in out_rules:
    fx.append(f'@media {mq(m)}{{{r}}}' if m else r)
fxs='\n'.join(fx)
# minify
fxs=re.sub(r'/\*.*?\*/','',fxs,flags=re.S); fxs=re.sub(r'\s+',' ',fxs); fxs=re.sub(r'\s*([{};:,>])\s*',r'\1',fxs)
fxs=fxs.replace(';}','}')
open(f'{OUT}/fx.css','w').write(fxs)
json.dump({'native':native,'vars':root_vars},open(f'{OUT}/native.json','w'))
print('fx chars',len(fxs),'native rules',len(native))
