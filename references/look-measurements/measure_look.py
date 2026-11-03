"""Native-frame look samples for the four supplied references; no resampling in time."""
from pathlib import Path
import sys,json,subprocess,csv
ROOT=Path(__file__).resolve().parents[2]
sys.path[:0]=[str(ROOT/'.tools/pydeps'),str(ROOT.parent/'out/audio/pydeps')]
import cv2,numpy as np
OUT=Path(__file__).resolve().parent
SAMPLES={'2GGA4NlMjKc':[0,3,10,22,44,49], 'tN0ra1h3uKo':[0,4,14,25,38], 'HOjbzw2xqEE':[2,10,24,29], 'XdcSli5STR4':[4,9,14,20,27]}
def hexval(v):return '#'+''.join(f'{round(float(c)):02x}' for c in v)
records=[]
for ident,times in SAMPLES.items():
    cap=cv2.VideoCapture(str(ROOT/f'references/videos/{ident}.mp4'))
    fps=cap.get(cv2.CAP_PROP_FPS)
    for t in times:
        f=round(t*fps);cap.set(cv2.CAP_PROP_POS_FRAMES,f);ok,bgr=cap.read()
        if not ok:raise RuntimeError((ident,f))
        rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB);h,w=rgb.shape[:2]
        cv2.imwrite(str(OUT/f'{ident}_f{f:04d}.png'),bgr)
        thumb=cv2.resize(rgb,(216,384),interpolation=cv2.INTER_AREA)
        x=thumb.astype(np.float32)/255
        luma=x@np.array([.2126,.7152,.0722],np.float32)
        hsv=cv2.cvtColor(thumb,cv2.COLOR_RGB2HSV)
        cv2.setRNGSeed(31)
        sample=thumb.reshape(-1,3)[::11].astype(np.float32)
        _,labels,centers=cv2.kmeans(sample,6,None,(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,40,.2),3,cv2.KMEANS_PP_CENTERS)
        counts=np.bincount(labels.ravel(),minlength=6);idx=np.argsort(counts)[::-1]
        records.append({'id':ident,'timeSeconds':t,'frame':f,'fps':fps,'width':w,'height':h,
         'lumaGammaMedian':float(np.median(luma)),'lumaGammaP05':float(np.quantile(luma,.05)),
         'lumaGammaP95':float(np.quantile(luma,.95)),'meanSaturationHSV':float(hsv[...,1].mean()/255),
         'darkCoverageBelow0.10':float((luma<.1).mean()),
         'dominantColours':[{'hex':hexval(centers[i]),'fraction':round(float(counts[i]/counts.sum()),3)} for i in idx]})
    cap.release()
(OUT/'samples.json').write_text(json.dumps(records,indent=2))
print(json.dumps(records,indent=2))
