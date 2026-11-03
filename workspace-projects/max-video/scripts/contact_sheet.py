from pathlib import Path
import sys,json
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT.parent/'out/audio/pydeps'))
from PIL import Image,ImageDraw
shots=json.loads((ROOT/'docs/story_beats.json').read_text())['shots']
frames=[(s['id'],(s['startFrame']+s['endFrameExclusive'])//2,s['action']) for s in shots]
for page in range(3):
    canvas=Image.new('RGB',(7*216,2*410),'#182033');draw=ImageDraw.Draw(canvas)
    for j,(sid,f,action) in enumerate(frames[page*14:(page+1)*14]):
        src=ROOT/f'outputs/fresh-stills/f{f:04d}.png'
        if not src.exists(): continue
        x=(j%7)*216;y=(j//7)*410
        canvas.paste(Image.open(src).convert('RGB').resize((216,384)),(x,y))
        draw.text((x+5,y+386),f'{sid} / f{f} / {action[:19]}',fill='white')
    canvas.save(ROOT/f'outputs/fresh-contact-{page+1}.jpg',quality=92)
