import re,os,sys
sys.path.insert(0,os.path.dirname(__file__))
from convert import tok, SRC, OUT
js=open(f'{SRC}/assets/js/main.js').read()
css=open(f'{SRC}/assets/css/style.css').read()
classes=set(re.findall(r'\.([a-zA-Z][\w-]*)',re.sub(r'url\([^)]*\)','',css)))
for f in ['index','about','work','contact']:
    for m in re.finditer(r'class="([^"]*)"',open(f'{SRC}/{f}.html').read()): classes.update(m.group(1).split())
cm={c:tok(c) for c in classes if tok(c)!=c}
def ren(m):
    c=m.group(1)
    if c in cm:
        t=cm[c]
        return '.'+(t if not t.startswith('is-') or '--' not in c else base(c))
    return m.group(0)
# rename only inside string literals
def strren(m):
    q=m.group(0)
    return re.sub(r'\.([a-zA-Z][\w-]*)(?![\w-])', lambda mm: '.'+cm[mm.group(1)] if mm.group(1) in cm else mm.group(0), q)
js=re.sub(r'"[^"\n]*"|`[^`\n]*`', strren, js)
# demo-only pieces
js=js.replace('location.href = "index.html"','location.href = "/ostra/home"')
js=js.replace('"norvik"','"ostra"')
open(f'{OUT}/main.renamed.js','w').write(js)
print(len(js)); print(sorted(set(re.findall(r'"\.[\w-]+',js)))[:80])
