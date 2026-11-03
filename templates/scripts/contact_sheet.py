"""Make labeled inspection sheets from rendered images; no creative image edits."""
from pathlib import Path
import argparse,math,re,sys
ROOT=Path(__file__).resolve().parents[2]
for dep in [ROOT.parent/'out/audio/pydeps',ROOT/'.tools/pydeps']:
    if dep.exists():sys.path.insert(0,str(dep))
from PIL import Image,ImageDraw,ImageOps

def main():
    p=argparse.ArgumentParser();p.add_argument('input',type=Path);p.add_argument('--out',type=Path,default=ROOT/'outputs/proof-sheet.jpg');p.add_argument('--glob',default='*.png');p.add_argument('--columns',type=int,default=5);p.add_argument('--width',type=int,default=220);p.add_argument('--fps',type=float,default=24);args=p.parse_args()
    files=sorted(args.input.glob(args.glob))
    if not files:raise SystemExit('No images match the input/glob.')
    if args.columns<1 or args.width<32 or args.fps<=0:raise SystemExit('Invalid sheet dimensions/FPS.')
    with Image.open(files[0]) as first:height=round(args.width*first.height/first.width)
    label=34;rows=math.ceil(len(files)/args.columns)
    sheet=Image.new('RGB',(args.columns*args.width,rows*(height+label)),(26,29,35));draw=ImageDraw.Draw(sheet)
    for i,file in enumerate(files):
        with Image.open(file) as im:thumb=ImageOps.contain(im.convert('RGB'),(args.width,height))
        x=i%args.columns*args.width;y=i//args.columns*(height+label)
        sheet.paste(thumb,(x+(args.width-thumb.width)//2,y))
        match=re.search(r'f(\d+)',file.stem);caption=file.stem
        if match:caption+=f' / {int(match[1])/args.fps:.3f}s'
        draw.text((x+7,y+height+9),caption,fill=(241,243,246))
    args.out.parent.mkdir(parents=True,exist_ok=True);sheet.save(args.out,quality=91);print(args.out)
if __name__=='__main__':main()
