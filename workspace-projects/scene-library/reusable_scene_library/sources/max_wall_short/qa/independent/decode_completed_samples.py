"""Serial low-CPU decode-only QA samples from verified completed native chunks.
Never invokes the production renderer or modifies sources. Outputs native JPEGs
plus 9-frame chronological thumbnail sheets. No real-time-playback claim.
"""
from pathlib import Path
import json, subprocess, sys, hashlib
from PIL import Image, ImageDraw, ImageFont
job=Path(sys.argv[1]).resolve(); root=Path(__file__).resolve().parents[2]
out=root/'qa/independent'/f'{job.name}_samples';out.mkdir(exist_ok=True)
state=json.loads((job/'progress.json').read_text())
plan={
0:[300,325,381],1:[382,410,438],2:[439,463,496,523,553],3:[554,604,655],
4:[656,668,689,711,723],5:[724,755,786],6:[787,839,891],7:[892,907,920,938,948],
8:[949,960,980,994,1018,1040],9:[1041,1071,1101],10:[1102,1147,1192],
11:[1193,1201,1202,1203,1231,1232,1239,1286],12:[1287,1317,1318,1326,1365],
13:[1366,1393,1421],14:[1422,1440,1459],15:[1460,1468,1475,1476,1497,1535],
16:[1536,1559,1582],17:[1583,1615,1647],18:[1648,1670,1691,1713,1735],
19:[1736,1760,1785],20:[1786,1798,1814,1830,1843],21:[1844,1858,1871,1898],
22:[1899,1927,1955],23:[1956,1970,1984],24:[1985,2027,2069],25:[2070,2089,2109],
26:[2110,2124,2142,2160,2174],27:[2175,2193,2213,2235,2251],28:[2252,2279,2306],
29:[2307,2352,2397],30:[2398,2424,2451],31:[2452,2480,2503,2535,2555],
32:[2556,2601,2602,2604,2605,2606,2647],33:[2648,2682,2683,2684,2690,2716],
34:[2717,2734,2751],35:[2752,2769,2786],36:[2787,2793,2797,2803,2814,2822,2831,2839],
37:[2840,2863,2886]}
entries=[];added=[]
for receipt in state['completed']:
    i,a,b=receipt['part'],receipt['startFrame'],receipt['endFrameExclusive']
    frames=plan[i]; assert all(a<=f<b for f in frames)
    video=job/'shots'/f'part_{i:02d}_{a}_{b-1}.mp4'
    targets=[out/f'f{f:04d}.jpg' for f in frames]
    if not all(t.exists() for t in targets):
        expr='+'.join('eq(n\\,%d)'%(f-a) for f in frames)
        temp=out/f'p{i:02d}_%03d.jpg'
        subprocess.run(['ffmpeg','-v','error','-y','-threads','1','-i',str(video),'-vf',f'select={expr}','-vsync','0','-q:v','2',str(temp)],check=True)
        for j,target in enumerate(targets,1): (out/f'p{i:02d}_{j:03d}.jpg').replace(target)
        added.append(i)
    for f,target in zip(frames,targets):entries.append({'part':i,'globalFrame':f,'path':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
sheets=[]
# Only full pages have stable membership until terminal state.
terminal=state['status'] in ['rendered-awaiting-independent-QA','independently-passed']
for page in range((len(entries)+8)//9 if terminal else len(entries)//9):
    page_entries=entries[page*9:page*9+9];target=out/f'sheet_{page:02d}.jpg'
    if not target.exists() or len(page_entries)<9:
        rows=(len(page_entries)+2)//3
        sheet=Image.new('RGB',(1080,rows*670),(24,24,24));d=ImageDraw.Draw(sheet)
        for k,e in enumerate(page_entries):
            im=Image.open(e['path']);im.thumbnail((360,640));x=k%3*360;y=k//3*670
            sheet.paste(im,(x,y+30));d.text((x+7,y+4),f"f{e['globalFrame']} | {e['globalFrame']/30:.3f}s",font=font,fill='white')
        sheet.save(target,quality=93)
    sheets.append({'page':page,'path':str(target),'frames':[e['globalFrame'] for e in page_entries]})
result={'method':'Native encoded frames decoded serially; chronological thumbnail review sheets, not real-time video playback','job':str(job),'sourceSha256':state['sourceSha256'],'completedFrames':state['completedFrames'],'samples':entries,'sheets':sheets}
(out/'coverage.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'newParts':added,'completedFrames':state['completedFrames'],'sampleCount':len(entries),'sheetCount':len(sheets),'output':str(out)}))
