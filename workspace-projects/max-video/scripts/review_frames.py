"""Assemble QA-only proof frames; does not alter the film artwork."""
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT.parent/'out/audio/pydeps'))
from PIL import Image,ImageDraw
frames=[int(f) for f in sys.argv[1].split(',')]
for page,start in enumerate(range(0,len(frames),12)):
    batch=frames[start:start+12]
    sheet=Image.new('RGB',(6*270,2*504),'#182033')
    draw=ImageDraw.Draw(sheet)
    for j,f in enumerate(batch):
        x=(j%6)*270;y=(j//6)*504
        sheet.paste(Image.open(ROOT/f'outputs/fresh-stills/f{f:04d}.png').convert('RGB').resize((270,480)),(x,y))
        draw.text((x+6,y+483),f'Frame {f} / {f/30:.2f}s',fill='white')
    sheet.save(ROOT/f'outputs/review-{page+1}.jpg',quality=93)
