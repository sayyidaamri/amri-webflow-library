#!/usr/bin/env python3
"""NOVARA hybrid converter.
in : src.css (lusion.co main.css), wfdata.json (Webflow class chains, ids, extra css), JS sources
out: out/classmap.json, out/native.json (per Webflow style: base/small/hover decls),
     out/fx.css (everything not native, classes renamed), out/js/*.js (renamed)
"""
import re, json, os, glob
import tinycss2

SRC = '/home/claude/sayyidaamri/lusion.co'
LIB = '/home/claude/amri-webflow-library'
OUT = '/home/claude/nv-build/out'
os.makedirs(OUT + '/js', exist_ok=True)
wf = json.load(open('/home/claude/nv-build/wfdata.json'))
css_src = open('/home/claude/nv-build/src.css').read() + '\n' + wf['extra_css']

# ---------------- classmap ----------------
chains = [c.split() for c in wf['chains']]
W = set(t for c in chains for t in c)

def tok(t):
    if t.startswith(('is-', 'nv-')):
        return t
    if '--' in t:
        return 'is-' + t.split('--', 1)[1]
    return 'nv-' + t

classmap = {t: tok(t) for t in sorted(W)}
# base of each modifier class (for selectors like .pill--dark alone)
mod_base = {}
for c in chains:
    for t in c[1:]:
        if '--' in t and not t.startswith('is-'):
            mod_base[t] = t.split('--', 1)[0]
json.dump(classmap, open(f'{OUT}/classmap.json', 'w'), indent=0)

def sel_class(c):
    if c not in W:
        return '.' + c
    if c in mod_base:
        return '.' + tok(mod_base[c]) + '.' + tok(c)
    return '.' + tok(c)

def rename_sel(s):
    return re.sub(r'\.(-?[a-zA-Z_][\w-]*)', lambda m: sel_class(m.group(1)), s)

# ---------------- id styles ----------------
ids = {}
mapped_names = set(classmap.values())
for i, desc in wf['ids'].items():
    parts = desc.split('.')
    cls = [classmap[p] for p in parts[1:]]
    if cls:
        ids[i] = {'chain': cls, 'style': 'is-' + i}
    else:
        name = 'nv-' + i
        if name in mapped_names:
            name += '-el'
        ids[i] = {'chain': [], 'style': name}

# ---------------- tokens ----------------
TOK = {  # css var -> (webflow variable name, type, value)
    '--off-white': ('nv-off-white', 'color', '#f0f1fa'), '--white': ('nv-white', 'color', '#fff'),
    '--dark-white': ('nv-dark-white', 'color', '#e4e6ef'), '--black': ('nv-black', 'color', '#000'),
    '--ink': ('nv-ink', 'color', '#0b0c10'), '--grey-blue': ('nv-grey-blue', 'color', '#2b2e3a'),
    '--blue': ('nv-blue', 'color', '#1a2ffb'), '--dark-blue': ('nv-dark-blue', 'color', '#071bdf'),
    '--green': ('nv-green', 'color', '#c1ff00'), '--red': ('nv-red', 'color', '#ff4c41'),
    '--nav-bg': ('nv-nav-bg', 'color', '#121416'), '--error': ('nv-error', 'color', '#e90000'),
    '--px': ('nv-px', 'size', 'max(5vw, 40px)'), '--py': ('nv-py', 'size', 'clamp(30px, 4vw, 50px)'),
    '--gap': ('nv-gap', 'size', '2vw'), '--radius': ('nv-radius', 'size', '20px'),
    '--col': ('nv-col', 'size', 'calc((100vw - 2 * var(--_nv---nv-px) - 11 * var(--_nv---nv-gap)) / 12)'),
    '--font': ('nv-font', 'font', '"Inter Tight", "Helvetica Neue", Arial, sans-serif'),
    '--mono': ('nv-mono', 'font', '"IBM Plex Mono", ui-monospace, monospace'),
}
WFVAR = lambda n: f'--_nv---{n}'
THEME_OK = {'--fg', '--bg', '--accent'}  # defined in fx :root / body, kept as var()

FX_PROPS = re.compile(r'^(transition|transform|opacity|filter|backdrop-filter|-webkit-backdrop-filter|will-change|animation|'
                      r'mix-blend-mode|clip-path|mask|-webkit-mask|content|vector-effect|stroke|fill|scrollbar|'
                      r'-webkit-|perspective|backface|transform-style|transform-origin|font-feature|touch-action|user-select|isolation)')

def expand(name, val):
    """shorthand -> longhands Webflow understands; None = not native"""
    v = val.strip()
    parts = split_ws(v)
    four = lambda p: (p * 4)[:4] if len(p) == 1 else [p[0], p[1], p[0], p[1]] if len(p) == 2 else [p[0], p[1], p[2], p[1]] if len(p) == 3 else p
    if name in ('padding', 'margin'):
        t, r, b, l = four(parts)
        return [(f'{name}-top', t), (f'{name}-right', r), (f'{name}-bottom', b), (f'{name}-left', l)]
    if name == 'inset':
        t, r, b, l = four(parts)
        return [('top', t), ('right', r), ('bottom', b), ('left', l)]
    if name == 'overflow':
        return [('overflow-x', parts[0]), ('overflow-y', parts[-1])]
    if name == 'gap':
        return [('grid-row-gap', parts[0]), ('grid-column-gap', parts[-1])]
    if name == 'place-items':
        return [('align-items', parts[0]), ('justify-items', parts[-1])]
    if name == 'border-radius':
        if len(parts) == 1:
            return [(f'border-{k}-radius', v) for k in ('top-left', 'top-right', 'bottom-right', 'bottom-left')]
        return None
    if name == 'flex':
        if v == 'none':
            return [('flex-grow', '0'), ('flex-shrink', '0'), ('flex-basis', 'auto')]
        if re.fullmatch(r'\d+(\.\d+)?', v):
            return [('flex-grow', v), ('flex-shrink', '1'), ('flex-basis', '0%')]
        if len(parts) == 3:
            return [('flex-grow', parts[0]), ('flex-shrink', parts[1]), ('flex-basis', parts[2])]
        return None
    if name == 'background':
        if re.fullmatch(r'(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|var\(--[\w-]+\)|transparent|none|currentColor)', v):
            return [('background-color', v if v != 'none' else 'transparent')]
        if re.fullmatch(r'(linear|radial)-gradient\(.*\)', v):
            return [('background-image', v)]
        return None
    if name in ('border', 'border-top', 'border-bottom', 'border-left', 'border-right'):
        sides = ['top', 'right', 'bottom', 'left'] if name == 'border' else [name.split('-')[1]]
        if v in ('0', 'none'):
            return [(f'border-{s}-width', '0') for s in sides] + [(f'border-{s}-style', 'none') for s in sides]
        m = re.fullmatch(r'(\S+)\s+(solid|dashed|dotted)\s+(.+)', v)
        if not m:
            return None
        out = []
        for s in sides:
            out += [(f'border-{s}-width', m.group(1)), (f'border-{s}-style', m.group(2)), (f'border-{s}-color', m.group(3))]
        return out
    if name in ('font', 'grid', 'grid-area', 'list-style', 'outline', 'text-decoration', 'columns', 'place-content', 'place-self'):
        return None
    return [(name, v)]

def split_ws(v):
    out, depth, cur = [], 0, ''
    for ch in v:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ' ' and depth == 0:
            if cur:
                out.append(cur)
            cur = ''
        else:
            cur += ch
    if cur:
        out.append(cur)
    return out

def native_value(val):
    """returns value with token vars mapped, or None if it uses runtime vars"""
    if re.search(r'var\(--[\w-]+\s*,', val):
        return None  # var with fallback = runtime var set by JS (e.g. #reel-play --gap)
    used = re.findall(r'var\((--[\w-]+)', val)
    for u in used:
        if u not in TOK and u not in THEME_OK:
            return None
    return re.sub(r'var\((--[\w-]+)', lambda m: f'var({WFVAR(TOK[m.group(1)][0])}' if m.group(1) in TOK else m.group(0), val)

# ---------------- parse ----------------
def ser(n):
    return tinycss2.serialize(n).strip()

native = {}   # key "chain|style" -> {'chain':[..], 'style':name, 'combo':bool, 'base':{}, 'small':{}, 'hover':{}}
order = []
fx = []       # (media or None, selector, decl_text)

SIMPLE_CLASS = re.compile(r'^((?:\.[a-zA-Z][\w-]*)+)(:hover)?$')
SIMPLE_ID = re.compile(r'^#([\w-]+)(:hover)?$')

# kept in fx: classes without a Webflow style (svg/embed markup) and ids inside embeds
EX_CLASS = re.compile(r'^(snake|snake--\w+|s-\w+|news-bg|news-msg|pl-[\w-]+|tr-[\w-]+|glyph|g[123])$')
EX_ID = re.compile(r'^(preloader|transition|video-overlay|vo-[\w-]+|scroll-indicator|reel-line|goal-line)$')

# (selector, property) that must stay in fx because an fx rule relied on losing to it by specificity
KEEP_FX = {('#menu', 'pointer-events')}

def target_for(sel):
    """selector part -> (chain, style_name, pseudo) or None"""
    if any(EX_CLASS.match(c) for c in re.findall(r'\.([\w-]+)', sel)) or any(EX_ID.match(i) for i in re.findall(r'#([\w-]+)', sel)):
        return None
    m = SIMPLE_ID.match(sel)
    if m:
        i = m.group(1)
        if i not in ids:
            return None
        d = ids[i]
        return (tuple(d['chain']), d['style'], m.group(2))
    m = SIMPLE_CLASS.match(sel)
    if not m:
        return None
    cs = re.findall(r'\.([\w-]+)', m.group(1))
    if not all(c in W for c in cs):
        return None
    # expand lone modifiers to base + modifier
    full = []
    for c in cs:
        if c in mod_base and mod_base[c] not in cs:
            full.append(mod_base[c])
        full.append(c)
    # must be a prefix-consistent chain seen in markup
    ok = any(ch[:len(full)] == full or (len(full) == 1 and full[0] in ch) for ch in chains)
    if len(full) > 1 and not any(ch[:len(full)] == full for ch in chains):
        return None
    if not ok:
        return None
    mapped = [classmap[c] for c in full]
    return (tuple(mapped[:-1]), mapped[-1], m.group(2))

def handle(rule, media):
    sel = ser(rule.prelude)
    decls = [d for d in tinycss2.parse_declaration_list(rule.content, skip_whitespace=True, skip_comments=True) if d.type == 'declaration']
    bp = None if media is None else ('small' if media == '(max-width: 767px)' else 'X')
    parts = [s.strip() for s in sel.split(',')]
    for p in parts:
        tgt = target_for(p) if bp != 'X' else None
        rest = []
        if tgt:
            chain, style, pseudo = tgt
            key = '|'.join(chain) + '|' + style
            if key not in native:
                native[key] = {'chain': list(chain), 'style': style, 'base': {}, 'small': {}, 'hover': {}, 'small_hover': {}}
                order.append(key)
            slot = ('hover' if pseudo else 'base') if bp is None else ('small_hover' if pseudo else 'small')
            if pseudo and bp:
                tgt = None
            for d in decls:
                val = ser(d.value)
                if d.important or FX_PROPS.match(d.lower_name) or (p, d.lower_name) in KEEP_FX:
                    rest.append(f'{d.name}:{val}{" !important" if d.important else ""}')
                    continue
                nv = native_value(val)
                ex = expand(d.lower_name, val) if nv is not None else None
                if ex is None:
                    rest.append(f'{d.name}:{val}')
                    continue
                for k, v in ex:
                    native[key][slot][k] = native_value(v)
        else:
            rest = [f'{d.name}:{ser(d.value)}{" !important" if d.important else ""}' for d in decls]
        if rest:
            fx.append((media, rename_sel(p), ';'.join(rest)))

top_fx = []
for node in tinycss2.parse_stylesheet(css_src, skip_whitespace=True, skip_comments=True):
    if node.type == 'qualified-rule':
        if ser(node.prelude) == ':root':
            continue  # tokens handled below
        handle(node, None)
    elif node.type == 'at-rule' and node.lower_at_keyword == 'media':
        q = ser(node.prelude)
        for r in tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True):
            if r.type == 'qualified-rule':
                handle(r, q)
    elif node.type == 'at-rule':
        top_fx.append(ser([node]))

# ---------------- move combo-only classes into their combos ----------------
firsts = set(classmap[c[0]] for c in chains)
for key in list(order):
    st = native[key]
    if st['chain'] or st['style'] in firsts or st['style'].startswith('is-') and key.startswith('|') is False:
        continue
    if st['style'] in firsts:
        continue
    parents = set()
    for ch in chains:
        m = [classmap[c] for c in ch]
        if st['style'] in m[1:]:
            parents.add(tuple(m[:m.index(st['style'])]))
    if not parents:
        continue
    for p in sorted(parents):
        k2 = '|'.join(p) + '|' + st['style']
        if k2 not in native:
            native[k2] = {'chain': list(p), 'style': st['style'], 'base': {}, 'small': {}, 'hover': {}, 'small_hover': {}}
            order.insert(order.index(key), k2)
        for slot in ('base', 'small', 'hover', 'small_hover'):
            native[k2][slot] = {**st[slot], **native[k2][slot]}
    order.remove(key); del native[key]

# ---------------- conflicts among native globals sharing an element ----------------
conflicts = []
for ch in chains:
    mapped = [classmap[c] for c in ch]
    globs = [native.get('|' + m) for m in mapped]
    seen = {}
    for g in globs:
        if not g:
            continue
        for slot in ('base', 'small'):
            for k, v in g[slot].items():
                if (slot, k) in seen and seen[(slot, k)][1] != v:
                    conflicts.append((' '.join(mapped), slot, k, seen[(slot, k)], (g['style'], v)))
                    # later class wins: copy into its combo
                    pos = mapped.index(g['style'])
                    if pos > 0:
                        k2 = '|'.join(mapped[:pos]) + '|' + g['style']
                        if k2 not in native:
                            native[k2] = {'chain': mapped[:pos], 'style': g['style'], 'base': {}, 'small': {}, 'hover': {}, 'small_hover': {}}
                            order.append(k2)
                        native[k2][slot][k] = v
                seen[(slot, k)] = (g['style'], v)

# ---------------- fx.css ----------------
fonts = re.findall(r'@font-face\s*\{[^}]*\}', open(f'{SRC}/assets/fonts/fonts.css').read())
fonts = [f for f in fonts if 'latin-ext' not in f and 'cyrillic' not in f and 'greek' not in f and 'vietnamese' not in f]
root = ':root{' + ';'.join(f'{k}:var({WFVAR(v[0])},{v[2]})' for k, v in TOK.items() if k != '--col') + \
       ';--col:calc((100vw - 2 * var(--px) - 11 * var(--gap)) / 12);--ease:cubic-bezier(.22,1,.36,1);' \
       '--ease-io:cubic-bezier(.65,0,.35,1);--fg:#000;--bg:var(--off-white);--accent:var(--blue)}'
lines = [root]
cur = None
buf = []
def flush():
    if not buf:
        return
    body = ''.join(f'{s}{{{d}}}' for s, d in buf)
    lines.append(body if cur is None else f'@media {cur}{{{body}}}')
    buf.clear()
for media, s, d in fx:
    if media != cur:
        flush()
        cur = media
    buf.append((s, d))
flush()
fxcss = '\n'.join(fonts) + '\n' + '\n'.join(lines) + '\n' + '\n'.join(top_fx) + '\n'
fxcss = re.sub(r'\s*\n\s*', '\n', fxcss)
open(f'{OUT}/fx.css', 'w').write(fxcss)

json.dump({'order': order, 'styles': native, 'ids': ids, 'tokens': TOK}, open(f'{OUT}/native.json', 'w'), indent=1)
print('classes', len(classmap), 'native styles', len(native), 'fx rules', len(fx), 'fx bytes', len(fxcss))
print('conflicts', len(conflicts))
for c in conflicts[:40]:
    print('  ', c)
