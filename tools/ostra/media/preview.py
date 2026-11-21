from PIL import Image, ImageDraw
import subprocess, os, math
D='/tmp/claude-tool-results/fa3875dc-fb1e-55af-99ac-619883524ab4/mcp-remote-devices-blob-'
hero=Image.open(D+'1795296583305-9zlyxg-cb9eec2f.jpg').convert('RGB')
hero_c=hero.crop((0,0,790,494)).resize((800,500),Image.LANCZOS)
hero_c.resize((1440,900),Image.LANCZOS).save('hero.png')
sl=[('1795296595406-extdcf-33ab76e2',900),('1795296604227-yz0y2v-1457ab8c',1800),('1795296607333-w0cj3i-6af6566b',2700),('1795296615270-uig7eo-44bc7a25',3600),('1795296618237-wglkgr-1d780c7b',4500),('1795296626851-6mv75m-c93cfe0f',5400),('1795296629941-apwdbq-d538fa47',6300),('1795296639757-45uin0-9c4a1cc5',7200),('1795296642852-qvh4n5-d7cb49ec',8100),('1795296651373-7x8gtt-f0a39337',9000),('1795296655096-pvta8o-055ceffb',9462.4)]
k=500/900
H=round(9462.4*k)+500
tall=Image.new('RGB',(800,H))
tall.paste(hero_c,(0,0))
for f,y in sl:
    im=Image.open(D+f+'.jpg').convert('RGB').resize((800,500))
    tall.paste(im,(0,round(y*k)))
tall.save('tall.jpg',quality=90)
# header overlay from hero (pill)
box=(273,13,518,43)
src=hero_c.crop(box).convert('L')
pill=Image.new('RGB',src.size,(52,52,50)); m=Image.new('L',src.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,src.size[0]-1,src.size[1]-1),radius=8,fill=240)
glyph=src.point(lambda v:max(0,min(255,int((v-70)*2.4))))
pill.paste(Image.new('RGB',src.size,(245,244,240)),(0,0),glyph)
os.makedirs('fr',exist_ok=True)
def ease(t): return 0.5-0.5*math.cos(math.pi*t)
maxy=H-500
# keyframe stops (px in tall) with pauses: hero, work, live, practices, reel, testimonials, journal, careers, footer
stops=[0,520,1040,1500,2060,2700,3000,3400,4040,4600,4905,maxy]
seq=[0]*10
for a,b in zip(stops,stops[1:]):
    n=max(6,int(abs(b-a)/52))
    seq+= [a+(b-a)*ease(i/n) for i in range(1,n+1)]
    seq+= [b]*3
seq+=[maxy]*8
for i,y in enumerate(seq):
    fr=tall.crop((0,int(y),800,int(y)+500)).copy()
    fr.paste(pill,box[:2],m)
    fr.resize((640,400),Image.LANCZOS).save(f'fr/{i:04d}.png')
print(len(seq),'frames', H)
