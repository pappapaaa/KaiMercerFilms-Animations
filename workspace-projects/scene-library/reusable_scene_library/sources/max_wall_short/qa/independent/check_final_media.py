"""Read-only independent contract/audio-integrity checks; not perceptual playback."""
from pathlib import Path
import json,sys,hashlib,subprocess
import numpy as np
from scipy.signal import correlate,correlation_lags
root=Path(__file__).resolve().parents[2]
video=Path(sys.argv[1]).resolve()
expected_frames=int(sys.argv[2]) if len(sys.argv)>2 else 300
expected_duration=expected_frames/30
qa=root/'qa/independent'
def run(*a): return subprocess.run(a,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
probe=json.loads(run('ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(video)))
v=next(x for x in probe['streams'] if x['codec_type']=='video')
a=next((x for x in probe['streams'] if x['codec_type']=='audio'),None)
run('ffmpeg','-v','error','-i',str(video),'-f','null','-')
issues=[]
for field,expected in [('width',1080),('height',1920),('r_frame_rate','30/1'),('avg_frame_rate','30/1')]:
 if v.get(field)!=expected:issues.append(f'{field}: {v.get(field)} != {expected}')
if int(v.get('nb_read_frames',0))!=expected_frames:issues.append(f'framecount {v.get("nb_read_frames")} !={expected_frames}')
if abs(float(v.get('duration',0))-expected_duration)>.001:issues.append('Video duration does not match expected frame duration')
if not a:issues.append('No audio stream')
source=root/'public/narration.mp3'
def pcm(p):return np.frombuffer(run('ffmpeg','-v','error','-i',str(p),'-t',str(expected_duration),'-ac','1','-ar','16000','-f','f32le','-'),dtype=np.float32).astype(float)
x,y=pcm(source),pcm(video)
n=min(len(x),len(y));x=x[:n];y=y[:n]
# Whole requested-duration waveform comparison at original speed, as decoded to16kmono.
c=correlate(y,x,method='fft');lags=correlation_lags(len(y),len(x));mask=np.abs(lags)<=1600
lag=int(lags[mask][np.argmax(c[mask])])
if lag>=0:xx=x[:n-lag];yy=y[lag:]
else:xx=x[-lag:];yy=y[:n+lag]
rho=float(np.corrcoef(xx,yy)[0,1]);lagms=lag/16
if abs(lagms)>33.4:issues.append(f'Audio lag {lagms:.3f}ms exceeds1video frame')
if rho<.98:issues.append(f'Audio waveform correlationlow {rho:.6f}')
r={'video':str(video),'expectedFrames':expected_frames,'expectedDuration':expected_duration,'sha256':sha(video),'bytes':video.stat().st_size,'method':'ffprobe counted decodedframes;ffmpeg full decode;crosscorrelation of decoded16kmono source vs mux. These do not establish subjective motion or listening quality.','videoStream':{k:v.get(k) for k in ['codec_name','width','height','r_frame_rate','avg_frame_rate','nb_frames','nb_read_frames','duration','pix_fmt']},'audioStream':{k:a.get(k) for k in ['codec_name','sample_rate','channels','duration','start_time']} if a else None,'sourceAudioSha256':sha(source),'audioLagMilliseconds':lagms,'audioCorrelation':rho,'decodePass':True,'issues':issues,'pass':not issues}
out=qa/(video.stem+'_media_integrity.json');out.write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
