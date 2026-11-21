import re,json,tinycss2
fx=open('/home/claude/os/out/fx.css').read()+open('fx-extra.css').read().replace('\n','')
SIMPLE=re.compile(r'^\.os-[\w-]+(\.is-[\w-]+)?$')
NATIVE_OK=lambda n,v: not ('var(' in v or '!important' in v or 'url(' in v or n.startswith('--'))
out=[]
def ser(n): return tinycss2.serialize(n).strip()
def rule(r,media=None):
    sel=ser(r.prelude); sels=[s.strip() for s in sel.split(',')]
    body=ser(r.content)
    if all(SIMPLE.match(s) for s in sels) and media in (None,'screen and (max-width:991px)','screen and (max-width:767px)','screen and (max-width:479px)') and not any(s.startswith(('.os-hdr','.os-nav')) for s in sels):
        keep=[]
        for d in tinycss2.parse_declaration_list(r.content,skip_whitespace=True,skip_comments=True):
            if d.type=='declaration':
                v=ser(d.value)
                if not NATIVE_OK(d.name,v) or d.name in('transition','backdrop-filter','-webkit-backdrop-filter'): keep.append(f'{d.name}:{v}'+('!important' if d.important else ''))
        if not keep: return None
        body=';'.join(keep)
    return f'{sel}{{{body}}}'
for n in tinycss2.parse_stylesheet(fx,skip_whitespace=True,skip_comments=True):
    if n.type=='qualified-rule':
        x=rule(n); x and out.append(x)
    elif n.type=='at-rule' and n.lower_at_keyword=='media':
        q=ser(n.prelude); inner=[rule(r,q) for r in tinycss2.parse_rule_list(n.content,skip_whitespace=True,skip_comments=True) if r.type=='qualified-rule']
        inner=[i for i in inner if i]
        if inner: out.append(f'@media {q}{{'+''.join(inner)+'}')
    else: out.append(ser([n]))
s=''.join(out); s=re.sub(r'\s*([{};:,])\s*',r'\1',s)
open('/home/claude/os/out/fx-slim.css','w').write(s); print(len(s))
