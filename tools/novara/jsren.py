import re,json,glob,os,sys
cm=json.load(open('out/classmap.json'))
mod_base={}
for c in json.load(open('wfdata.json'))['chains']:
    t=c.split()
    for x in t[1:]:
        if '--' in x and not x.startswith('is-'): mod_base[x]=x.split('--',1)[0]
def selcls(c):
    if c not in cm or cm[c]==c: return '.'+c
    if c in mod_base: return '.'+cm[mod_base[c]]+'.'+cm[c]
    return '.'+cm[c]
def tokcls(c): return cm.get(c,c)
STR=re.compile(r'''(?P<q>["'`])(?P<body>(?:\\.|(?!(?P=q)).)*)(?P=q)''',re.S)
changes=[]
def fix_body(body,before):
    orig=body
    # class lists: classList.*( "a" ), className = "a b", class="a b" inside markup
    if re.search(r'classList\.(add|remove|toggle|contains|replace)\(\s*$|className\s*[+]?=\s*$|setAttribute\(\s*["\']class["\']\s*,\s*$',before):
        body=' '.join(tokcls(t) for t in body.split(' ')) if re.fullmatch(r'[\w\s-]+',body) else body
    else:
        body=re.sub(r'class="([^"$]*)"',lambda m:'class="'+' '.join(tokcls(t) for t in m.group(1).split())+'"',body)
        # selectors: .cls preceded by start, space, >, +, ~, (, comma, ] or ) or another class
        body=re.sub(r'(?:(?<=^)|(?<=[\s>+~(,]))\.([a-zA-Z][\w-]*)(?![\w-])',lambda m:selcls(m.group(1)) if not re.match(r'^\w',body[max(0,m.start()-1):m.start()] or ' ') or body[max(0,m.start()-1):m.start()] in ' >+~(,])' else m.group(0),body)
    return body
for f in sorted(glob.glob(sys.argv[1]+'/*.js')):
    s=open(f).read();out=[];pos=0
    for m in STR.finditer(s):
        q,body=m.group('q'),m.group('body')
        before=s[max(0,m.start()-60):m.start()]
        nb=fix_body(body,before)
        if nb!=body: changes.append((os.path.basename(f),body[:90],nb[:110]))
        out.append(s[pos:m.start()]+q+nb+q);pos=m.end()
    out.append(s[pos:])
    open(sys.argv[2]+'/'+os.path.basename(f),'w').write(''.join(out))
for c in changes: print(c)
print(len(changes))
