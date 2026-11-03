"""Portable exact-duration mix builder; optional voice/music and frame-indexed original cues.

python templates/audio/mix.py --voice narration.mp3 --music score.wav --out public/mix.wav
Without inputs, creates the original 12-second proof's small Foley track only.
"""
from pathlib import Path
import argparse,json,subprocess,sys,wave
ROOT=Path(__file__).resolve().parents[2]
for p in [ROOT.parent/'out/audio/pydeps',ROOT/'.tools/pydeps']:
    if p.exists():sys.path.insert(0,str(p))
import numpy as np
from scipy.ndimage import maximum_filter1d,gaussian_filter1d
from sfx import event
def read_audio(path,sr):
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-ar',str(sr),'-ac','2','-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,2)
def write_wav(path,x,sr):
    path.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes())
def main():
    p=argparse.ArgumentParser();p.add_argument('--timeline',default=str(Path(__file__).with_name('timeline.json')));p.add_argument('--voice');p.add_argument('--music');p.add_argument('--out',default=str(ROOT/'public/demo-mix.wav'));p.add_argument('--music-gain',type=float,default=.15);p.add_argument('--lufs',type=float,default=-16);args=p.parse_args()
    plan=json.loads(Path(args.timeline).read_text());sr=plan.get('sampleRate',48000)
    if sr!=48000:raise ValueError('This Foley library uses 48000 Hz; set sampleRate to 48000.')
    if not isinstance(plan['frames'],int) or plan['frames']<=0 or plan['fps']<=0:raise ValueError('Timeline needs a positive integer frame count and positive FPS.')
    n=round(plan['frames']/plan['fps']*sr)
    voice=np.zeros((n,2));music=np.zeros((n,2));sfx=np.zeros((n,2))
    if args.voice:
        x=read_audio(args.voice,sr)
        if len(x)>n:raise ValueError('Narration is longer than the shot plan. Extend the timeline; do not trim the voice.')
        voice[:min(n,len(x))]=x[:n]
    if args.music:
        x=read_audio(args.music,sr);music[:min(n,len(x))]=x[:n]*args.music_gain
        # A short look-ahead envelope ducks the music through actual speech.
        mono=np.max(np.abs(voice),axis=1);envelope=gaussian_filter1d(maximum_filter1d(mono,size=4801),sigma=1200)
        music*=np.where(envelope>.035,.28,1)[:,None]
    for i,cue in enumerate(plan.get('cues',[])):
        x=event(cue['type'],i)*cue.get('gain',.1);a=round(cue['frame']/plan['fps']*sr);b=min(n,a+len(x))
        if a<0 or a>=n:raise ValueError('Cue outside picture timeline')
        sfx[a:b]+=x[:b-a,None]
    mix=voice+music+sfx;peak=float(np.abs(mix).max());pre_gain=min(1,.95/max(peak,1e-9));mix*=pre_gain
    out=Path(args.out).resolve();temp=out.with_suffix('.premaster.wav');write_wav(temp,mix,sr)
    if (args.voice or args.music) and peak>1e-8:
        first=subprocess.run(['ffmpeg','-hide_banner','-i',str(temp),'-af',f'loudnorm=I={args.lufs}:TP=-1.2:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True).stderr
        meter=json.loads(first[first.rfind('{'):first.rfind('}')+1]);filt=f"loudnorm=I={args.lufs}:TP=-1.2:LRA=11:measured_I={meter['input_i']}:measured_TP={meter['input_tp']}:measured_LRA={meter['input_lra']}:measured_thresh={meter['input_thresh']}:offset={meter['target_offset']}:linear=true"
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(temp),'-af',filt,'-ar',str(sr),'-ac','2','-c:a','pcm_s24le','-t',str(n/sr),str(out)],check=True)
    else:write_wav(out,mix,sr)
    stemdir=out.parent/'stems';stemdir.mkdir(exist_ok=True)
    for name,x in [('voice',voice),('music',music),('sfx',sfx)]:write_wav(stemdir/f'{name}.wav',x,sr)
    result={'samples':n,'duration':n/sr,'sampleRate':sr,'original_voice_speed':1,'pre_gain':pre_gain,'raw_mix_peak':peak,'cues':len(plan.get('cues',[])),'output':str(out)}
    out.with_suffix('.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
if __name__=='__main__':main()
