#!/usr/bin/env python3
"""Noctelle -> Webflow converter.
Outputs (in out/):
  classmap.json          original class -> webflow class
  fx.css                 effect/state CSS (repo, @import from header embed)
  native.json            [{sel, media, decls}] simple class rules for whtml css
  home.html              renamed, Webflow-safe markup of index.html body (EN only)
  noctelle.js            adapter + data + portfolio + app (renamed)
"""
import re, json, os
import tinycss2
from bs4 import BeautifulSoup, NavigableString, Comment

SRC = '/home/claude/estherwong.fun'
OUT = '/home/claude/nc-build/out'
os.makedirs(OUT, exist_ok=True)

css_src = open(f'{SRC}/assets/css/style.css').read()
html_src = open(f'{SRC}/index.html').read()
app_js = open(f'{SRC}/assets/js/app.js').read()
pf_js = open(f'{SRC}/assets/js/portfolio.js').read()

KEEP_PREFIX = ('is-', 'has-')
TOKENS = {  # css var -> webflow variable name (collection NC)
    '--text': 'nc-text', '--text-dim': 'nc-text-dim', '--gold': 'nc-gold', '--gold-dim': 'nc-gold-dim',
    '--nav-gold': 'nc-nav-gold', '--pt-black': 'nc-black', '--pt-gold': 'nc-pt-gold',
    '--pt-gold-soft': 'nc-pt-gold-soft', '--pt-gold-dim': 'nc-pt-gold-dim',
    '--pt-font-cn': 'nc-font-serif', '--pt-font-en': 'nc-font-display',
}
def wfvar(name):
    return f'--_nc---{name}'

# ---------- class map ----------
classes = set(re.findall(r'\.(-?[a-zA-Z_][\w-]*)', re.sub(r'url\([^)]*\)', '', css_src)))
for m in re.finditer(r'class="([^"]*)"', html_src + app_js + pf_js):
    classes.update(c for c in m.group(1).split() if re.match(r'^[a-zA-Z][\w-]*$', c))
classes = {c for c in classes if not re.match(r'^\d', c)}

def base_name(c):
    return 'nc-' + c.replace('__', '_')

def map_token(c):
    """class token as used in a class attribute -> webflow token"""
    if c.startswith(KEEP_PREFIX):
        return c
    if '--' in c:
        return 'is-' + c.split('--', 1)[1]
    return base_name(c)

def map_selector_class(c):
    """.c in a selector -> replacement selector text"""
    if c.startswith(KEEP_PREFIX):
        return '.' + c
    if '--' in c:
        b, m = c.split('--', 1)
        return '.' + base_name(b) + '.is-' + m
    return '.' + base_name(c)

classmap = {c: map_token(c) for c in sorted(classes)}
json.dump(classmap, open(f'{OUT}/classmap.json', 'w'), indent=0)

def rename_selector(sel):
    return re.sub(r'\.(-?[a-zA-Z_][\w-]*)', lambda m: map_selector_class(m.group(1)), sel)

# ---------- CSS ----------
MEDIA_MAP = {'(max-width: 1080px)': 991, '(max-width: 900px)': 991, '(max-width: 720px)': 767}
SIMPLE = re.compile(r'^\.nc-[\w-]+(\.is-[\w-]+)?$')

root_vars = {}
fx_parts, native = [], []

def ser(nodes):
    return tinycss2.serialize(nodes).strip()

def handle_rule(rule, media=None, fx_media_text=None):
    sel = ser(rule.prelude)
    decl_text = ser(rule.content)
    sel_new = ', '.join(rename_selector(s.strip()) for s in sel.split(','))
    if sel.strip() == ':root':
        for d in tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True):
            if d.type == 'declaration':
                root_vars['--' + d.name.lstrip('-')] = ser(d.value)
        return
    sels = [s.strip() for s in sel_new.split(',')]
    is_native = media is not None or fx_media_text is None
    uses_custom = [v for v in re.findall(r'var\((--[\w-]+)', decl_text) if v not in TOKENS]
    if (all(SIMPLE.match(s) for s in sels) and not uses_custom and 'url(' not in decl_text
            and '!important' not in decl_text and is_native):
        decls = []
        for d in tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True):
            if d.type != 'declaration':
                continue
            val = ser(d.value)
            val = re.sub(r'var\((--[\w-]+)\)', lambda m: f'var({wfvar(TOKENS[m.group(1)])})', val)
            decls.append((d.name, val))
        for s in sels:
            native.append({'sel': s, 'media': media, 'decls': decls})
        return
    block = f'{sel_new}{{{decl_text}}}'
    fx_parts.append((fx_media_text, block))

for node in tinycss2.parse_stylesheet(css_src, skip_whitespace=True, skip_comments=True):
    if node.type == 'qualified-rule':
        handle_rule(node)
    elif node.type == 'at-rule' and node.lower_at_keyword == 'media':
        q = ser(node.prelude)
        rules = tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True)
        bp = MEDIA_MAP.get(q)
        fxq = f'screen and (max-width: {bp}px)' if bp else q
        for r in rules:
            if r.type == 'qualified-rule':
                handle_rule(r, media=bp, fx_media_text=fxq) if bp else handle_rule(r, media=None, fx_media_text=fxq)
    elif node.type == 'at-rule' and node.lower_at_keyword == 'keyframes':
        fx_parts.append((None, ser([node])))
    elif node.type == 'at-rule' and node.lower_at_keyword == 'import':
        pass

fonts = open(f'{SRC}/assets/css/fonts.part.css').read()
fonts = '\n'.join(b for b in re.findall(r'@font-face\s*\{[^}]*\}', fonts) if 'latin-ext' not in b)
fonts = re.sub(r'url\((["\']?)\.\./fonts/', r'url(\1../fonts/', fonts)
root_lines = []
for k, v in root_vars.items():
    if k in TOKENS:
        root_lines.append(f'{k}:var({wfvar(TOKENS[k])},{v})')
    else:
        root_lines.append(f'{k}:{v}')
fx = ['/* NOCTELLE (Webflow build) - effect & state CSS. Layout lives in Webflow native classes. */', fonts,
      ':root{' + ';'.join(root_lines) + '}']
cur_media, buf = None, []
def flush():
    if not buf:
        return
    fx.append(('@media ' + cur_media + '{' + ''.join(buf) + '}') if cur_media else '\n'.join(buf))
for mq, block in fx_parts:
    if mq != cur_media:
        flush(); buf = []; cur_media = mq
    buf.append(block)
flush()
fx_css = '\n'.join(fx)
# custom cursor only when the app runs (home); other pages keep native cursor
fx_css = fx_css.replace('body{overflow-x:hidden;overflow-y:auto;cursor:none}', 'body{overflow-x:hidden;overflow-y:auto}')
fx_css += '\n/* EN-only build: hide secondary-language duplicates */\n.nc-pt-intro-tab-en,.nc-pt-section-tab-en,.nc-pt-intro-section-title small,.nc-pt-info-en,.nc-pt-info-label small,.nc-pt-title-en:empty,.nc-pt-title span:empty{display:none!important}\n.nc-intro-modal_subtitle a{color:inherit;text-decoration:underline;text-underline-offset:3px}\n'
open(f'{OUT}/fx.css', 'w').write(fx_css)
json.dump(native, open(f'{OUT}/native.json', 'w'), indent=0)

# ---------- HTML ----------
soup = BeautifulSoup(html_src, 'lxml')
body = soup.body
for c in body.find_all(string=lambda s: isinstance(s, Comment)):
    c.extract()
for s in body.find_all('script'):
    s.decompose()
# EN only
for b in body.select('[data-intro-lang="id"]'):
    b.decompose()
for b in body.select('[data-intro-lang="en"]'):
    del b['hidden']
lb = body.select_one('#introLangBtn')
if lb:
    lb.decompose()
eb = body.select_one('#loaderEnterBtn')
eb.find_all('span')[0].decompose()

TEXT_FIX = {
    'UX Portfolio｜Karya UX': 'Selected Worlds',
    'Proyek Inti': 'Featured Case Studies', 'Karya Pilihan Lain': 'Selected Works',
}
for el in body.find_all(string=True):
    t = el.strip()
    if t in TEXT_FIX:
        el.replace_with(el.replace(t, TEXT_FIX[t]))
for el in body.select('.pt-zone-label-en, .pt-zone-label-sep'):
    el.decompose()
ARIA = {
    'NOCTELLE — kembali ke awal': 'NOCTELLE, back to start', 'Sub-menu proyek': 'Projects menu',
    'Buka Other Projects': 'Open other projects', 'Bagian proyek': 'Project sections',
    'Tutup detail proyek': 'Close project details', 'Halaman proyek': 'Project pages',
    'Halaman sebelumnya': 'Previous page', 'Halaman berikutnya': 'Next page',
    'Tutup Other Projects': 'Close other projects', 'Profil': 'Profile', 'Tutup profil': 'Close profile',
}
for el in body.find_all(attrs={'aria-label': True}):
    el['aria-label'] = ARIA.get(el['aria-label'], el['aria-label'])

h2 = body.select_one('.intro-modal__hero h2')
h2.clear(); h2.append('Mira Solenne ')
sp = soup.new_tag('span'); sp.string = 'Noctelle · Montréal'; h2.append(sp)
body.select_one('.intro-modal__role').string = 'Founder & Creative Director'
sub = body.select_one('.intro-modal__subtitle')
sub.clear(); sub.append(BeautifulSoup('<a href="/noctelle/studio">Read the studio story</a> · <a href="/noctelle/contact">Start a project</a>', 'html.parser'))
for t in body.select('.intro-modal__section-title span'):
    t.decompose()
# header: CONTACT link before MUTE
mute_li = body.select_one('#soundToggle').parent
sep = body.select('.nav__sep')[0]
import copy
mute_li.insert_before(BeautifulSoup('<li><a href="/noctelle/contact" id="contactLink">CONTACT</a></li>', 'html.parser'))
mute_li.insert_before(copy.copy(sep))
# rename classes
for el in body.find_all(class_=True):
    el['class'] = [map_token(c) for c in el['class']]
    # keep base before modifiers / states
    el['class'] = sorted(el['class'], key=lambda c: (c.startswith(KEEP_PREFIX)))

# webflow-safe: buttons -> div[data-nc-btn], hidden -> data-nc-hidden
for b in body.find_all('button'):
    b.name = 'div'
    b['data-nc-btn'] = b.attrs.pop('type', 'button')
for el in body.find_all(attrs={'hidden': True}):
    del el['hidden']
    el['data-nc-hidden'] = ''
# nav separators: inline dot svg instead of <img>
dot = open(f'{SRC}/assets/svg/dot.svg').read()
dot = re.sub(r'<\?xml[^>]*>', '', dot).strip()
for img in body.select('.nc-nav_sep img'):
    img.replace_with(BeautifulSoup(dot, 'html.parser'))

SVG_CASE = ['viewBox','radialGradient','linearGradient','textPath','feTurbulence','feDisplacementMap','feGaussianBlur','feColorMatrix','attributeName','baseFrequency','numOctaves','xChannelSelector','yChannelSelector','repeatCount','startOffset','stdDeviation','gradientUnits','clipPath','preserveAspectRatio','gradientTransform','patternUnits','maskUnits','filterUnits']
hb = str(body)
for w in SVG_CASE:
    hb = re.sub(r'(?<=[<\s/])' + w.lower() + r'(?=[\s=>/])', w, hb)
hb = hb.replace('src="assets/', 'src="__NCB__')
open(f'{OUT}/home-body.html', 'w').write(hb)

# ---------- JS ----------
def rename_class_attr(val):
    return ' '.join(map_token(c) if c in classmap or '--' in c or c.startswith(KEEP_PREFIX) else c for c in val.split(' '))

STR = re.compile(r'"(?:[^"\\\n]|\\.)*"|\'(?:[^\'\\\n]|\\.)*\'')
def js_rename(src):
    out, last = [], 0
    for m in STR.finditer(src):
        lit = m.group(0); q = lit[0]; inner = lit[1:-1]
        pre = src[max(0, m.start() - 40):m.start()]
        new = inner
        if re.search(r'class="[^"]*$', pre) or re.search(r"class='[^']*$", pre):
            pass
        if 'class="' in inner:
            new = re.sub(r'class="([^"]*)"', lambda mm: 'class="' + rename_class_attr(mm.group(1)) + '"', inner)
            # a literal that opens class=" and is continued by concatenation
            new = re.sub(r'class="([^"]*)$', lambda mm: 'class="' + rename_class_attr(mm.group(1)), new)
        elif re.search(r'classList\.(add|remove|toggle|contains)\([^)]*$', pre) or re.search(r'className\s*=\s*$', pre):
            new = ' '.join(map_token(c) if c in classmap else c for c in inner.split(' '))
        elif re.search(r'(querySelector(All)?|closest|matches)\(\s*$', pre) or inner.startswith('.') or ', .' in inner:
            new = re.sub(r'\.(-?[a-zA-Z_][\w-]*)', lambda mm: map_selector_class(mm.group(1)) if mm.group(1) in classmap else mm.group(0), inner)
        new = new.replace('assets/', q + ' + NCB + ' + q)
        out.append(src[last:m.start()]); out.append(q + new + q); last = m.end()
    out.append(src[last:])
    return ''.join(out)

app2 = js_rename(app_js)
pf2 = js_rename(pf_js)
app2 = app2.replace('"nc-cursor nc-cursor-default"', '"nc-cursor nc-cursor-default"')
app2 = app2.replace('cursor.className = "nc-cursor cursor-" + s', 'cursor.className = "nc-cursor nc-cursor-" + s')
app2 = app2.replace('cursor.className = "cursor cursor-" + s', 'cursor.className = "nc-cursor nc-cursor-" + s')
# English only + 767 breakpoint
app2 = app2.replace('introLangBtn = $("introLangBtn");', 'introLangBtn = $("introLangBtn") || document.createElement("button");')
app2 = app2.replace('var introLang = "id";', 'var introLang = "en";')
app2 = app2.replace('(max-width: 720px)', '(max-width: 767px)').replace('innerWidth <= 720', 'innerWidth <= 767')
pf2 = pf2.replace('innerWidth > 720', 'innerWidth > 767')
for a, b in [('"Halaman "', '"Page "'), ("Buka detail proyek ", "Open project details ")]:
    pf2 = pf2.replace(a, b)
open(f'{OUT}/app.js', 'w').write(app2)
open(f'{OUT}/portfolio.js', 'w').write(pf2)
print('classes', len(classmap), 'native rules', len(native), 'fx bytes', len(fx_css))

# ---------- bundle ----------
data = open('/home/claude/nc-build/data-en.js').read().replace('"__NC_BASE__', 'NCB + "')
prelude = open('/home/claude/amri-webflow-library/tools/noctelle/prelude.js').read()
bundle = prelude + '\nif (document.getElementById("page-1")) {\nncPrep();\n' + data + '\n' + pf2 + '\n' + app2 + '\n} else { ncPrep(); ncSubpage(); }\n'
open(f'{OUT}/noctelle.js', 'w').write(bundle)

# ---------- local test page ----------
def native_css(rules):
    out=[]
    for bp in [None, 991, 767, 479]:
        rs=[r for r in rules if r['media']==bp]
        if not rs: continue
        body=''.join(r['sel']+'{'+';'.join(f'{k}:{v}' for k,v in r['decls'])+'}' for r in rs)
        out.append(body if bp is None else f'@media screen and (max-width: {bp}px){{{body}}}')
    return '\n'.join(out)
open(f'{OUT}/native.css','w').write(native_css(native))
