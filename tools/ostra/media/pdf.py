from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
W,H=landscape(A4); INK=HexColor('#0a0a0a'); PAPER=HexColor('#f5f4f0'); MUTE=HexColor('#6b6a66'); ACC=HexColor('#c4aa80'); RULE=HexColor('#d9d7d0')
c=canvas.Canvas('ostra-studio-profile-2026.pdf',pagesize=(W,H))
c.setTitle('Ostra Atelier — Studio Profile 2026'); c.setAuthor('Ostra Atelier')
M=48
def foot(n,dark=False):
    c.setFont('Helvetica',8); c.setFillColor(MUTE if not dark else HexColor('#8a8984'))
    c.drawString(M,28,'Ostra Atelier — Studio Profile 2026'); c.drawRightString(W-M,28,f'{n:02d} / 04')
def wrap(text,x,y,w,size=11,lead=16,font='Helvetica',col=INK):
    c.setFont(font,size); c.setFillColor(col); line=''
    for word in text.split():
        t=(line+' '+word).strip()
        if c.stringWidth(t,font,size)>w: c.drawString(x,y,line); y-=lead; line=word
        else: line=t
    if line: c.drawString(x,y,line); y-=lead
    return y
# 1 cover
c.setFillColor(INK); c.rect(0,0,W,H,fill=1,stroke=0)
c.drawImage(ImageReader('poster.png'),W*0.42,0,W*0.58,H*0.58*W/W*1.0 if False else H,preserveAspectRatio=True,anchor='e',mask=None)
c.setFillColor(PAPER); c.setFont('Helvetica-Bold',13); c.drawString(M,H-M-6,'OSTRA ATELIER')
c.setFont('Helvetica-Bold',52)
for i,l in enumerate(['Space.','Every Line.','Matters.']): c.drawString(M,H/2+60-i*60,l)
c.setFont('Helvetica',11); c.setFillColor(HexColor('#b8b6b0')); c.drawString(M,96,'Studio Profile 2026  ·  Architecture, interiors, landscape  ·  Vienna — Trieste')
foot(1,True); c.showPage()
# 2 how a commission runs
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(MUTE); c.setFont('Helvetica',9); c.drawString(M,H-M,'( 01 )  HOW A COMMISSION RUNS')
c.setFillColor(INK); c.setFont('Helvetica-Bold',34); c.drawString(M,H-M-52,'One studio, site to detail.')
y=wrap('Ostra Atelier is an independent studio for architecture, interiors, and landscape. We work with private clients, hoteliers and public institutions on buildings designed from the site out. The same senior architects stay with the work from the first site visit to handover.',M,H-M-90,W*0.55,12,18)
phases=[('01','Site study','3 weeks','A written brief both sides sign. Survey, planning context, budget and a first massing.'),
('02','Concept','6–8 weeks','Plans, sections and a material direction. Quoted as a fixed fee once the site study is done.'),
('03','Permit','4–9 months','Planning and permit drawings, consultants coordinated in-house.'),
('04','Build','per project','Tender, site visits by a senior architect every week, detail drawings as work proceeds.'),
('05','Handover','year one','A building manual and two site reviews in the first year.')]
cw=(W-2*M)/5; top=H*0.48
for i,(n,t,d,txt) in enumerate(phases):
    x=M+i*cw
    c.setStrokeColor(RULE); c.line(x,top+28,x+cw-12,top+28)
    c.setFillColor(ACC); c.setFont('Helvetica',9); c.drawString(x,top+36,n)
    c.setFillColor(INK); c.setFont('Helvetica-Bold',15); c.drawString(x,top+6,t)
    c.setFillColor(MUTE); c.setFont('Helvetica',9); c.drawString(x,top-10,d.upper())
    wrap(txt,x,top-32,cw-20,9.5,14)
c.setFillColor(INK); c.setFont('Helvetica-Bold',11); c.drawString(M,96,'Fees')
wrap('Interiors start at 60,000 EUR in fees. Architecture is quoted per phase once the site study is done. We quote by phase, never by the hour.',M,78,W-2*M,10,14,col=MUTE)
foot(2); c.showPage()
# 3 practices
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(MUTE); c.setFont('Helvetica',9); c.drawString(M,H-M,'( 02 )  FOUR PRACTICES')
c.setFillColor(INK); c.setFont('Helvetica-Bold',34); c.drawString(M,H-M-52,'One senior studio.')
pr=[('Architecture','New buildings and careful additions, from first sketch to site handover.'),('Interiors','Rooms, light and material, drawn by the team who drew the shell.'),('Landscape','Gardens, courtyards and terraces designed as part of the plan.'),('Furniture & objects','Furniture, lighting and fittings made for the rooms they live in.')]
y=H-M-120
for i,(t,d) in enumerate(pr):
    c.setStrokeColor(RULE); c.line(M,y+22,W-M,y+22)
    c.setFillColor(ACC); c.setFont('Helvetica',9); c.drawString(M,y,f'0{i+1}')
    c.setFillColor(INK); c.setFont('Helvetica-Bold',20); c.drawString(M+60,y-4,t)
    wrap(d,W*0.5,y,W*0.5-M,11,16,col=MUTE); y-=78
stats=[('10','years'),('26','projects built'),('31','craft awards'),('71%','repeat clients')]
sw=(W-2*M)/4
for i,(n,l) in enumerate(stats):
    c.setFillColor(INK); c.setFont('Helvetica-Bold',28); c.drawString(M+i*sw,80,n)
    c.setFillColor(MUTE); c.setFont('Helvetica',9); c.drawString(M+i*sw,62,l.upper())
foot(3); c.showPage()
# 4 contact
c.setFillColor(INK); c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(HexColor('#8a8984')); c.setFont('Helvetica',9); c.drawString(M,H-M,'( 03 )  START A CONVERSATION')
c.setFillColor(PAPER); c.setFont('Helvetica-Bold',46); c.drawString(M,H/2+40,'Tell us what'); c.drawString(M,H/2-14,'you want to build.')
c.setFont('Helvetica',13)
for i,(k,v) in enumerate([('Email','hello@ostra-atelier.at'),('Phone','+43 1 532 0418'),('Studios','Vienna — Trieste'),('Booking','2027 commissions')]):
    c.setFillColor(HexColor('#8a8984')); c.setFont('Helvetica',9); c.drawString(M+i*190,130,k.upper())
    c.setFillColor(PAPER); c.setFont('Helvetica',13); c.drawString(M+i*190,110,v)
c.setFillColor(HexColor('#6b6a66')); c.setFont('Helvetica',7.5); c.drawString(M,52,'Ostra Atelier is a fictional studio created for the Amri Webflow Library demo.')
foot(4,True); c.save()
