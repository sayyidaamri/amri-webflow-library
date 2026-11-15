#!/usr/bin/env python3
"""native.json -> list of Webflow data_style_tool actions (create for id styles, update for existing)."""
import json, re, sys
d = json.load(open(sys.argv[1])); V = json.load(open(sys.argv[2]))
idstyles = {(tuple(v['chain']), v['style']) for v in d['ids'].values()}
def props(m):
    out = []
    for k, v in m.items():
        mm = re.fullmatch(r'var\(--_nv---([\w-]+)\)', v.strip())
        if mm and mm.group(1) in V:
            out.append({'property_name': k, 'variable_as_value': V[mm.group(1)]})
        else:
            out.append({'property_name': k, 'property_value': v})
    return out
acts = []
for key in d['order']:
    s = d['styles'][key]; chain, name = s['chain'], s['style']
    pp = {'parent_style_names': chain} if chain else {}
    is_new = (tuple(chain), name) in idstyles
    if is_new:
        acts.append({'label': f'c {key}', 'create_style': {'name': name, **pp, 'properties': props(s['base'])}})
    elif s['base']:
        acts.append({'label': f'u {key}', 'update_style': {'style_name': name, **pp, 'properties': props(s['base'])}})
    if s['small']:
        acts.append({'label': f's {key}', 'update_style': {'style_name': name, **pp, 'breakpoint_id': 'small', 'properties': props(s['small'])}})
    if s['hover']:
        acts.append({'label': f'h {key}', 'update_style': {'style_name': name, **pp, 'pseudo': 'hover', 'properties': props(s['hover'])}})
json.dump(acts, open(sys.argv[3], 'w'))
print(len(acts), 'actions', sum(1 for a in acts if 'create_style' in a), 'creates')
