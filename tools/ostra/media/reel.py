import math, random, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS,DUR=1280,720,24,10
N=FPS*DUR
INK=(14,14,13); PAPER=(245,244,240); LINE=(232,230,224); DIM=(70,70,66); ACC=(196,170,128)
random.seed(4)
S=2  # supersample
def P(x,y): return (x*S,y*S)
# plan geometry (units px at 1280x720), house plan centered
ox,oy=330,140
walls=[ # outer walls
((0,0),(620,0)),((620,0),(620,440)),((620,440),(0,440)),((0,440),(0,0)),
# interior
((240,0),(240,180)),((240,250),(240,440)),((240,260),(420,260)),((480,260),(620,260)),((420,260),(420,440)),
((0,300),(160,300)),
]
thin=[ # windows / furniture
((60,0),(180,0)),((300,0),(560,0)),((620,60),(620,200)),((80,440),(200,440)),((470,440),(580,440)),
]
stairs=[((260+i*16,300),(260+i*16,420)) for i in range(10)]
grid=[((x,-60),(x,500)) for x in range(-90,720,60)]+[((-90,y),(710,y)) for y in range(-60,520,60)]
dims=[((0,-40),(620,-40)),((660,0),(660,440)),((0,-48),(0,-32)),((620,-48),(620,-32)),((652,0),(668,0)),((652,440),(668,440))]
arcs=[(240,180,70,0,90),(420,260,60,90,180),(0,300,50,270,360)]
def seglen(s): (a,b),(c,d)=s; return math.hypot(c-a,d-b)
def draw_partial(dr,segs,t,col,w):
    tot=sum(seglen(s) for s in segs); L=tot*max(0,min(1,t))
    for s in segs:
        l=seglen(s)
        if L<=0: break
        (a,b),(c,d)=s; f=min(1,L/l)
        dr.line([P(ox+a,oy+b),P(ox+a+(c-a)*f,oy+b+(d-b)*f)],fill=col,width=w*S)
        L-=l
def ease(t): t=max(0,min(1,t)); return t*t*(3-2*t)
try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13*S)
except: font=ImageFont.load_default()
rooms=[((0,0,240,300),'LIVING'),((240,0,620,260),'KITCHEN / DINING'),((0,300,240,440),'STUDY'),((420,260,620,440),'BED'),((240,260,420,440),'STAIR')]
for i in range(N):
    t=i/FPS
    im=Image.new('RGB',(W*S,H*S),INK); dr=ImageDraw.Draw(im)
    # slow camera drift via offset
    global_ox=0
    g=ease(t/1.2)
    for s in grid:
        (a,b),(c,d)=s
        col=tuple(int(INK[k]+(28-INK[k]*0)*0+ (DIM[k]-INK[k])*0.35*g) for k in range(3))
        dr.line([P(ox+a,oy+b),P(ox+c,oy+d)],fill=col,width=1*S)
    # room fills fade
    rf=ease((t-5.0)/1.5)
    for (x0,y0,x1,y1),lab in rooms:
        c=tuple(int(INK[k]+(30-INK[k]+INK[k])*0.0+( (24,24,22)[k]-INK[k])*rf) for k in range(3))
        dr.rectangle([P(ox+x0,oy+y0),P(ox+x1,oy+y1)],fill=c)
    draw_partial(dr,thin,ease((t-3.2)/1.6),DIM if t<9 else DIM,2)
    draw_partial(dr,walls,ease((t-0.6)/3.4),LINE,7)
    draw_partial(dr,stairs,ease((t-3.8)/1.4),DIM,2)
    draw_partial(dr,dims,ease((t-4.4)/1.2),ACC,1)
    ap=ease((t-4.2)/1.0)
    for (cx,cy,r,a0,a1) in arcs:
        if ap>0: dr.arc([P(ox+cx-r,oy+cy-r),P(ox+cx+r,oy+cy+r)],a0,a0+(a1-a0)*ap,fill=DIM,width=2*S)
    la=ease((t-5.6)/1.0)
    if la>0:
        for (x0,y0,x1,y1),lab in rooms:
            col=tuple(int(INK[k]+(PAPER[k]-INK[k])*0.55*la) for k in range(3))
            dr.text(P(ox+x0+14,oy+y0+14),lab,fill=col,font=font)
        col=tuple(int(INK[k]+(ACC[k]-INK[k])*la) for k in range(3))
        dr.text(P(ox+250,oy-62),'14.20 m',fill=col,font=font)
        dr.text(P(ox+672,oy+212),'9.40 m',fill=col,font=font)
    im=im.resize((W,H),Image.LANCZOS)
    # light sweep: diagonal warm band moving across after 6s
    sw=(t-6.0)/3.2
    if 0<sw<1.2:
        ov=Image.new('L',(W,H),0); od=ImageDraw.Draw(ov)
        cx=-300+sw*(W+600)
        od.polygon([(cx,0),(cx+260,0),(cx+60,H),(cx-200,H)],fill=60)
        ov=ov.filter(ImageFilter.GaussianBlur(60))
        im=Image.composite(Image.new('RGB',(W,H),ACC),im,ov)
    # fade in/out for loop
    a=min(1,t/0.5,(DUR-t)/0.6)
    if a<1: im=Image.blend(Image.new('RGB',(W,H),INK),im,max(0,a))
    im.save(f'f{i:04d}.png')
    if i==int(8.2*FPS): im.save('poster.png')
