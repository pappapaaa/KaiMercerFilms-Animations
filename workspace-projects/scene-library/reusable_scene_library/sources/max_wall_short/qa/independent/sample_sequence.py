"""Decode-only review sheets from an existing encoded clip. Does NOT render 3D.
Usage: sample_sequence.py VIDEO GLOBAL_START OUTPUT_DIR [global frames comma list]
Default: up to seven distributed actual frames per clip including both endpoints.
"""
from pathlib import Path
import subprocess,json,sys,hashlib
from PIL import Image,ImageOps,ImageDraw,ImageFont
video=Path(sys.argv[1]).resolve(); start=int(sys.argv[2]);out=Path(sys.argv[3]).resolve();out.mkdir(parents=True,exist_ok=True)
p=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','json',str(video)]))
n=int(p['streams'][0]['nb_frames'])
frames=sorted(set(int(x) for x in sys.argv[4].split(','))) if len(sys.argv)>4 else sorted(set(start+round((n-1)*x/6) for x in range(7)))
assert all(start<=f<start+n for f in frames)
expr='+'.join('eq(n\\,%d)'%(f-start) for f in frames)
subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(video),'-vf',f'select={expr}','-vsync','0','-q:v','2',str(out/'selected_%04d.jpg')],check=True)
entries=[]
for i,f in enumerate(frames,1):
 source=out/f'selected_{i:04d}.jpg'; target=out/f'f{f:04d}.jpg';source.rename(target);entries.append({'globalFrame':f,'localFrame':f-start,'path':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
for page in range((len(frames)+5)//6):
 sheet=Image.new('RGB',(1620,1980),(25,25,25));d=ImageDraw.Draw(sheet)
 for k,e in enumerate(entries[page*6:page*6+6]):
  im=Image.open(e['path']);im.thumbnail((540,960));x=k%3*540;y=k//3*990;sheet.paste(im,(x,y+30));d.text((x+10,y+4),f"Frame {e['globalFrame']} / {e['globalFrame']/30:.3f}s",font=font,fill='white')
 sheet.save(out/f'sheet_{page:02d}.jpg',quality=94)
(out/'coverage.json').write_text(json.dumps({'method':'actual encoded frame decode, distributed sequential stills; not real-time video playback','video':str(video),'globalStart':start,'clipFrames':n,'samples':entries},indent=2)+'\n')
print(json.dumps({'video':str(video),'clipFrames':n,'frames':frames,'sheets':(len(frames)+5)//6}))
