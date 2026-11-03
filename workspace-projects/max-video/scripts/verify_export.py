"""Verify the delivered file and compare two encoded frames with native source proofs."""
from pathlib import Path
import sys,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT.parent/'out/audio/pydeps'))
import numpy as np
from PIL import Image
video=Path(sys.argv[1]).resolve()
out=ROOT/'outputs/qa';out.mkdir(exist_ok=True)
probe=json.loads(subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],capture_output=True,text=True,check=True).stdout)
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1440,2560,'30/1',2887),v
assert v['codec_name']=='h264' and v['pix_fmt']=='yuv420p',v
assert a['codec_name']=='aac' and int(a['sample_rate'])==48000 and a['channels']==2,a
assert abs(float(probe['format']['duration'])-2887/30)<.03,probe['format']['duration']
checks=[]
for f in [64,2425]:
    dest=out/f'encoded-{f:04d}.png'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(video),'-vf',f'select=eq(n\\,{f})','-frames:v','1',str(dest)],check=True)
    actual=np.asarray(Image.open(dest).convert('RGB'),dtype=np.float32)
    expected=np.asarray(Image.open(ROOT/f'outputs/fresh-stills/f{f:04d}.png').convert('RGB'),dtype=np.float32)
    assert actual.shape==expected.shape
    mse=np.square(actual-expected).mean()
    checks.append({'frame':f,'meanAbsoluteChannelDifference':float(np.abs(actual-expected).mean()),'PSNRdB':float(10*np.log10(255**2/max(mse,1e-9)))})
report={'video':video.name,'dimensions':[1440,2560],'fps':30,'frames':2887,'duration':float(probe['format']['duration']),'videoCodec':v['codec_name'],'pixelFormat':v['pix_fmt'],'audioCodec':a['codec_name'],'audioSampleRate':48000,'audioChannels':2,'nativeProofComparison':checks}
(out/'export-check.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
