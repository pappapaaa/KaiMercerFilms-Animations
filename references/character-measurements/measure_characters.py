"""Reproduce explicitly annotated 1080px reference measurements; no generative edits."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT.parent/'out/audio/pydeps'))
from PIL import Image,ImageDraw
import numpy as np

# Hand-delineated visible image bounds, excluding brows/hats/hair where specified.
# Coordinates are estimates, not recovered model or rig parameters.
samples=[
 {'id':'2GGA4NlMjKc','frame':240,'head':[133,400,1040,1066],'body':None,'note':'Owner head only; body seated and frame-cropped','scan':[600,385,450]},
 {'id':'tN0ra1h3uKo','frame':12,'head':[223,807,707,1150],'body':[34,656,711,1682],'note':'Child head includes hair perimeter; body includes winter hat and scarf','scan':None},
 {'id':'tN0ra1h3uKo','frame':504,'head':[216,323,925,817],'body':[70,84,1047,1758],'note':'Elf head excludes hat and ears; body includes hat','scan':[600,300,360]},
 {'id':'HOjbzw2xqEE','frame':360,'head':[35,766,477,1101],'body':None,'note':'Owner head only; desk occludes lower body','scan':[250,745,800]},
 {'id':'HOjbzw2xqEE','frame':600,'head':[598,1170,715,1262],'body':[570,1170,733,1384],'note':'Distant character; strong overhead view changes apparent body ratio','scan':None},
 {'id':'XdcSli5STR4','frame':312,'head':[80,920,434,1178],'body':[76,920,464,1630],'note':'Neutral standing figure; excludes floating brow accents','scan':[250,905,950]},
 {'id':'XdcSli5STR4','frame':408,'head':[108,932,448,1183],'body':[80,932,566,1641],'note':'Standing figure with bent arms; excludes floating brow accents','scan':[250,912,955]},
]
for s in samples:
 im=Image.open(ROOT/f"references/character-measurements/{s['id']}_f{s['frame']}.png").convert('RGB')
 a=np.asarray(im);x0,y0,x1,y1=s['head'];w=x1-x0;h=y1-y0
 s.update(time_seconds=s['frame']/24,head_width_px=w,head_height_px=h,head_height_over_width=round(h/w,3),head_fraction_of_frame_height=round(h/im.height,3),coordinate_uncertainty_px=8 if w>300 else 3)
 if s['body']:
  bx0,by0,bx1,by1=s['body'];s['visible_body_height_px']=by1-by0;s['visible_body_in_head_heights']=round((by1-by0)/h,2)
 if s['scan']:
  x,ya,yb=s['scan'];black=np.max(a[ya:yb,x,:],axis=1)<65
  runs=[];start=None
  for j,on in enumerate(black.tolist()+[False]):
   if on and start is None:start=j
   elif not on and start is not None:runs.append([start+ya,j+ya,j-start]);start=None
  s['ink_vertical_runs_y0_y1_width']=runs
 d=ImageDraw.Draw(im);d.rectangle(s['head'],outline='#f000ff',width=3)
 if s['body']:d.rectangle(s['body'],outline='#00d8ff',width=3)
 label=f"f{s['frame']} / {s['time_seconds']:.2f}s | head {w}x{h}px"
 d.rectangle((0,0,1080,34),fill='#101010');d.text((10,10),label,fill='white')
 im.save(ROOT/f"references/character-measurements/{s['id']}_f{s['frame']}_annotated.jpg",quality=92)
(ROOT/'references/character-measurements/measurements.json').write_text(json.dumps({'method':'Manual image-space bounds on native decoded frames; see per-row notes and uncertainty. Black scan uses max RGB<65. No exact rig/camera inference.','samples':samples},indent=2))
print(json.dumps(samples,indent=2))
