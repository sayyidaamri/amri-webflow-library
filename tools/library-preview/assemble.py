#!/usr/bin/env python3
"""Rakit screenshot rekaman (urut mtime) jadi homepage.gif 640x400 @130ms.
Pakai: assemble.py <dir screenshot> <timestamp blob frame pertama> [hold_last=8]"""
import os,glob,re,sys,subprocess
from PIL import Image
D,start=sys.argv[1],int(sys.argv[2]); hold=int(sys.argv[3]) if len(sys.argv)>3 else 8
fs=[f for f in glob.glob(os.path.join(D,'mcp-remote-devices-blob-*.jpg')) if int(re.search(r'blob-(\d+)-',f).group(1))>=start]
fs.sort(key=lambda f:(os.stat(f).st_mtime_ns,f)); os.makedirs('fr',exist_ok=True)
for i,f in enumerate(fs): Image.open(f).convert('RGB').resize((640,400)).save(f'fr/{i:04d}.png')
for j in range(hold): Image.open(f'fr/{len(fs)-1:04d}.png').save(f'fr/{len(fs)+j:04d}.png')
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','1000/130','-i','fr/%04d.png','-vf','split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle','-loop','0','homepage.gif'],check=True)
print(len(fs),'frames ->',os.path.getsize('homepage.gif')//1024,'KB')
