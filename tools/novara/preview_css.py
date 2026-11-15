#!/usr/bin/env python3
"""native.json -> native-preview.css (emulates the Webflow-generated CSS, for pre-flight testing)"""
import json, sys
d = json.load(open(sys.argv[1]))
base, hov, small = [], [], []
for k in d['order']:
    s = d['styles'][k]
    sel = '.' + '.'.join(s['chain'] + [s['style']])
    decl = lambda m: ';'.join(f'{p}:{v}' for p, v in m.items())
    if s['base']: base.append(f'{sel}{{{decl(s["base"])}}}')
    if s['hover']: hov.append(f'{sel}:hover{{{decl(s["hover"])}}}')
    if s['small']: small.append(f'{sel}{{{decl(s["small"])}}}')
open(sys.argv[2], 'w').write('\n'.join(base + hov) + '\n@media screen and (max-width:767px){' + ''.join(small) + '}\n')
