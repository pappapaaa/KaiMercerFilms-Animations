"""Simple reproducible native-pixel color patches and perpendicular contour scans."""
from pathlib import Path
import sys,json
ROOT=Path(__file__).resolve().parents[2]
sys.path[:0]=[str(ROOT/'.tools/pydeps'),str(ROOT.parent/'out/audio/pydeps')]
import numpy as np
from PIL import Image,ImageDraw
OUT=Path(__file__).resolve().parent
# Coordinates are in decoded 1080x1920 PNGs, never scaled thumbnails.
PATCHES=[
 ('2GGA4NlMjKc_f0240.png','white face',[450,450,570,550]),
 ('2GGA4NlMjKc_f0240.png','cool cel shadow',[900,660,960,780]),
 ('2GGA4NlMjKc_f0240.png','olive background',[800,130,950,240]),
 ('HOjbzw2xqEE_f0048.png','peach wall',[50,80,220,200]),
 ('HOjbzw2xqEE_f0048.png','table',[40,1650,170,1780]),
 ('tN0ra1h3uKo_f0336.png','night lit wall',[930,630,1030,810]),
 ('tN0ra1h3uKo_f0336.png','night ceiling',[70,40,210,150]),
 ('XdcSli5STR4_f0336.png','upper sky',[100,100,350,250]),
 ('XdcSli5STR4_f0336.png','lower sky',[50,780,220,900]),
]
SCANS=[
 ('2GGA4NlMjKc_f0240.png','top head silhouette','vertical',600,380,450),
 ('2GGA4NlMjKc_f0240.png','bottom head silhouette','vertical',500,1020,1090),
 ('2GGA4NlMjKc_f0240.png','left eye outer side','horizontal',760,175,235),
 ('HOjbzw2xqEE_f0048.png','top head silhouette','vertical',430,680,760),
 ('HOjbzw2xqEE_f0048.png','left eye upper edge','vertical',310,800,860),
 ('XdcSli5STR4_f0336.png','small head left silhouette','horizontal',1070,60,110),
 ('XdcSli5STR4_f0336.png','podium left seam','horizontal',1350,500,545),
]
def hx(x):return '#'+''.join(f'{round(float(v)):02x}' for v in x)
patch_results=[];scan_results=[]
for name,label,box in PATCHES:
 im=np.asarray(Image.open(OUT/name).convert('RGB'));x0,y0,x1,y1=box;p=im[y0:y1,x0:x1].reshape(-1,3)
 patch_results.append({'image':name,'label':label,'boxXYXY':box,'medianRGB':np.median(p,axis=0).tolist(),'hex':hx(np.median(p,axis=0)),'RGBStd':p.std(0).round(2).tolist()})
for name,label,axis,fixed,a,b in SCANS:
 im=np.asarray(Image.open(OUT/name).convert('RGB'));p=im[a:b,fixed] if axis=='vertical' else im[fixed,a:b]
 low=p.max(1)<45;runs=[];start=None
 for i,v in enumerate([*low,False]):
  if v and start is None:start=i
  if not v and start is not None:runs.append([a+start,a+i,i-start]);start=None
 scan_results.append({'image':name,'label':label,'axis':axis,'fixedCoordinate':fixed,'range':[a,b],'darkRunsStartEndWidth':runs})
 cropbox=(fixed-16,a-8,fixed+17,b+8) if axis=='vertical' else (a-8,fixed-16,b+8,fixed+17)
 image=Image.fromarray(im).crop(cropbox);image=image.resize((image.width*4,image.height*4),Image.Resampling.NEAREST)
 image.save(OUT/(name[:-4]+'_'+label.replace(' ','-')+'.png'))
data={'patches':patch_results,'scans':scan_results,'darkThreshold':'max(R,G,B)<45; contiguous core, antialias fringe excluded'}
(OUT/'profiles.json').write_text(json.dumps(data,indent=2));print(json.dumps(data,indent=2))
