import json,sys,glob
import os; R=os.path.dirname(os.path.abspath(__file__))+'/'
nat=json.load(open(R+'native.json'))
made=set()
for f in sorted(glob.glob(R+'batches/b*.json'))+[R+'actions.json']:
    for a in json.load(open(f)):
        for k in ('create_style','update_style'):
            if k in a:
                s=a[k]; made.add(s.get('name') or s.get('style_name'))
page,src=sys.argv[1],sys.argv[2]
acts=[];skip=[]
for line in open(src):
    i,el,typ,cur=line.split(); cur=[] if cur=='-' else cur.split(',')
    m=nat['ids'].get(i)
    if not m: skip.append(i+':no-map');continue
    if m['style'] not in made: skip.append(i+':style-missing '+m['style']);continue
    if typ=='DOM': skip.append(i+':DOM');continue
    names=list(dict.fromkeys(cur+m['chain']+[m['style']]))
    if cur and cur!=m['chain'][:len(cur)] and set(cur)!=set(m['chain']): skip.append(i+':chain-mismatch '+str(cur)+str(m['chain']))
    acts.append({"label":i,"set_style":{"id":{"component":page,"element":el},"style_names":m['chain']+[m['style']] if set(cur)<=set(m['chain']) else names}})
json.dump(acts,open(src+'.json','w'),separators=(',',':'))
print(len(acts),'skip',skip)
