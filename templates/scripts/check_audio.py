"""Integration checks for exact picture length, voice preservation and music ducking."""
from pathlib import Path
import json,subprocess,sys,wave
ROOT=Path(__file__).resolve().parents[2]
for dep in [ROOT.parent/'out/audio/pydeps',ROOT/'.tools/pydeps']:
    if dep.exists():sys.path.insert(0,str(dep))
import numpy as np

def wav(path,x):
    with wave.open(str(path),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(48000);f.writeframes((x[:,None].repeat(2,axis=1)*32767).astype('<i2').tobytes())
def read(path):
    with wave.open(str(path),'rb') as f:return np.frombuffer(f.readframes(f.getnframes()),'<i2').reshape(-1,2)/32768

def main():
    out=ROOT/'outputs/audio-check';out.mkdir(parents=True,exist_ok=True);sr=48000;n=sr*12;t=np.arange(n)/sr
    voice=.16*np.sin(2*np.pi*220*t)*(((t>=1)&(t<3))|((t>=5)&(t<7)))
    music=.2*np.sin(2*np.pi*110*t);wav(out/'voice.wav',voice);wav(out/'music.wav',music)
    plan={'fps':24,'frames':288,'sampleRate':sr,'cues':[]};(out/'timeline.json').write_text(json.dumps(plan))
    command=[sys.executable,str(ROOT/'templates/audio/mix.py'),'--timeline',str(out/'timeline.json'),'--voice',str(out/'voice.wav'),'--music',str(out/'music.wav'),'--out',str(out/'mix.wav')]
    subprocess.run(command,capture_output=True,text=True,check=True)
    stem=read(out/'stems/voice.wav');original=read(out/'voice.wav')
    if stem.shape!=(n,2) or np.max(np.abs(stem-original))>1/16384:raise AssertionError('Voice timing/samples changed unexpectedly.')
    bed=read(out/'stems/music.wav');rms=lambda x:float(np.sqrt(np.mean(x*x)))
    ratio=rms(bed[2*sr:round(2.5*sr)])/rms(bed[8*sr:round(8.5*sr)])
    if not .25<ratio<.32:raise AssertionError('Music failed to duck during voice and recover in silence.')
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(out/'mix.wav')]))['streams'][0]
    if abs(float(info['duration'])-12)>1/sr or info['sample_rate']!='48000':raise AssertionError('Final duration/sample rate differs from picture.')
    # One additional sample is enough to require a longer picture timeline.
    wav(out/'too-long.wav',np.zeros(n+1));bad=command.copy();bad[bad.index('--voice')+1]=str(out/'too-long.wav')
    rejected=subprocess.run(bad,capture_output=True,text=True)
    if rejected.returncode==0:raise AssertionError('Overlength narration was silently accepted.')
    result={'passed':True,'duration_seconds':12,'sample_rate':sr,'voice_samples_preserved_with_pcm_quantization':True,'music_speech_to_silence_ratio':ratio,'overlength_narration_rejected':True}
    (out/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
if __name__=='__main__':main()
