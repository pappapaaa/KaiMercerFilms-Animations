"""Original score and Foley for The Tower That Chases Shade.

Deterministic additive/modal synthesis; no sampled music or borrowed melody.
Voice is the supplied ElevenLabs narration, with original timing preserved.
Master uses measured two-pass EBU R128.
"""
import sys, json, subprocess, math, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'out/audio/pydeps'))
import numpy as np
import soundfile as sf
from scipy import signal, ndimage
OUT=ROOT/'out/audio'; PUB=ROOT/'public/audio'
SR=48000; VOICE_INFO=sf.info(PUB/'voice.wav'); FRAMES=math.ceil(VOICE_INFO.frames/VOICE_INFO.samplerate*30)
DUR=FRAMES/30; N=round(SR*DUR); TAU=2*np.pi
OUT.mkdir(exist_ok=True,parents=True)
rng=np.random.default_rng(241126)
music=np.zeros((N,2),dtype=np.float64); sfx=music.copy()
def add(dst,y,at,level=1,pan=0):
    p=int(round(at*SR)); n=min(len(y),N-p)
    if p<0 or n<=0:return
    dst[p:p+n,0]+=y[:n]*level*np.sqrt((1-pan)/2)
    dst[p:p+n,1]+=y[:n]*level*np.sqrt((1+pan)/2)
def hz(m):return 440*2**((m-69)/12)
def time(d):return np.arange(round(d*SR))/SR
def gate(t,d,a=.008,r=.06):return np.minimum(t/a,1)*np.clip((d-t)/r,0,1)
def pluck(m,d=.65):
    t=time(d); f=hz(m); y=np.zeros(len(t))
    for k in range(1,10):y+=np.sin(TAU*f*k*t+.04*k)*np.exp(-t*(4.2+k*.45))/(k**1.5)
    return y*gate(t,d,.003,.08)
def bass(m,d=.4):
    t=time(d); f=hz(m)
    return (np.sin(TAU*f*t)+.25*np.sin(TAU*2*f*t)+.10*np.sin(TAU*3*f*t))*np.exp(-t*4)*gate(t,d,.018,.09)
def bell(m,d=1.4):
    t=time(d); f=hz(m)
    y=np.sin(TAU*f*t)*np.exp(-t*3)+.19*np.sin(TAU*f*2.756*t)*np.exp(-t*8)+.05*np.sin(TAU*f*5.404*t)*np.exp(-t*20)
    return y*gate(t,d,.002,.08)
def reed(m,d):
    t=time(d); f=hz(m); y=np.zeros(len(t)); vibrato=.0013*np.sin(TAU*4.8*t)
    ph=TAU*f*(t+vibrato*.03)
    for k in range(1,7):y+=np.sin(k*ph)/(k**1.7)
    return y*gate(t,d,.12,.25)*(.91+.09*np.sin(TAU*1.2*t))
def brushed(d=.075):
    t=time(d); nz=rng.standard_normal(len(t)); nz=signal.sosfilt(signal.butter(2,5500,fs=SR,btype='highpass',output='sos'),nz)
    return nz*np.exp(-t*65)*gate(t,d,.002,.01)
def whoosh(d=.48,down=False):
    t=time(d); nz=rng.standard_normal(len(t)); nz=signal.sosfilt(signal.butter(2,[400,3500],fs=SR,btype='bandpass',output='sos'),nz)
    env=np.sin(np.pi*t/d)**2
    f=np.linspace(1300,300,len(t)) if down else np.linspace(300,1300,len(t))
    return .7*nz*env+.18*np.sin(TAU*np.cumsum(f)/SR)*env
def creak(d=.45):
    t=time(d); ph=TAU*np.cumsum(290+75*np.sin(TAU*2*t)+30*t/d)/SR
    return (.6*np.sin(ph)+.15*np.sin(ph*2.02))*np.sin(np.pi*t/d)**2
def click():
    t=time(.12); n=rng.standard_normal(len(t)); env=np.exp(-t*90)+.6*np.exp(-np.maximum(t-.045,0)*140)*(t>=.045)
    return signal.sosfilt(signal.butter(2,[1300,8000],fs=SR,btype='bandpass',output='sos'),n)*env
def boing(d=.5):
    t=time(d); f=105+430*np.exp(-t*10)+18*np.sin(TAU*7*t)
    return np.sin(TAU*np.cumsum(f)/SR)*np.exp(-t*8)*gate(t,d,.004,.08)

# A quiet Paris-flavoured chamber cue: pizzicato, reed chords, bass, and small mallet answers.
BPM=112; BEAT=60/BPM; BAR=4*BEAT
chords=[[62,66,69,73],[59,62,66,69],[55,59,62,66],[57,61,64,67]]
motifs=[[74,None,78,76,None,73,74,None],[71,None,74,None,78,76,74,None],
        [71,None,74,78,None,76,74,None],[73,None,76,None,79,76,73,None]]
for bar in range(math.ceil(DUR/BAR)):
    at=bar*BAR; ch=chords[bar%4]; atomic=30.74<=at<39.62; outro=at>=57.34
    strength=.62 if atomic else .92 if outro else 1
    for b in range(4):
        tm=at+b*BEAT
        add(music,bass(ch[0]-24,.44),tm,.105*strength,-.12)
        # Off-beat pizzicato chord breathes around the narration.
        for k,note in enumerate(ch[1:]):add(music,pluck(note,.48),tm+BEAT*.52,.034*strength,(-.35,0,.35)[k])
        add(music,brushed(),tm+BEAT*.5,.023*strength,.32)
    for j,note in enumerate(motifs[bar%4]):
        if note is not None and (bar%2==0 or j<4):add(music,bell(note,1.1),at+j*BEAT*.5,.036*(.5 if atomic else 1),-.28 if j%2 else .24)
    for k,note in enumerate(ch):add(music,reed(note-12,BAR+.25),at,.017*(.75 if atomic else 1),-.5+k/3)
# Short resolving cadence under the last punchline.
for j,n in enumerate([76,73,74]):add(music,bell(n,1.15),60.80+j*.31,.045,.05)

cues=[
    (0.45,'gentle hook rise',whoosh(.38),.028,-.15),
    (7.30,'camera shutter',click(),.075,.15),
    (13.55,'warm metal shimmer',bell(86,.9),.035,.3),
    (14.90,'small expansion creak',creak(.4),.031,-.15),
    (24.28,'comic lean',boing(.45),.051,.2),
    (27.50,'shade parasol soft pop',pluck(81,.4),.052,-.2),
    (30.68,'into microscopic world',whoosh(.55,True),.038,0),
    (33.44,'atom glint',bell(88,.7),.025,-.3),
    (35.72,'atomic spacing glint',bell(90,.75),.025,.3),
    (39.54,'return to Paris',whoosh(.4),.032,0),
    (47.38,'summit drift shimmer',bell(83,.9),.028,.2),
    (56.40,'cooling contraction',creak(.3),.025,-.2),
    (61.90,'final tiny sun dodge',boing(.3),.032,.05),
]
for at,name,wave,level,pan in cues:add(sfx,wave,at,level,pan)
for at in np.arange(40.20,44.2,BEAT*.54):add(sfx,brushed(.045),float(at),.022,-.15 if int(at*10)%2 else .15)

# Small stereo room: 63/91ms reflections, no long wash obscuring syllables.
for offset,amt in [(int(.063*SR),.10),(int(.091*SR),.06)]:music[offset:]+=music[:-offset,::-1]*amt
fade=np.ones(N); fade[:int(.10*SR)]=np.linspace(0,1,int(.10*SR)); fade[-int(.20*SR):]=np.linspace(1,0,int(.20*SR))
music*=fade[:,None]; sfx*=fade[:,None]
sf.write(OUT/'score-raw.wav',music,SR,subtype='PCM_24')
sf.write(OUT/'sfx.wav',sfx,SR,subtype='PCM_24')
# Spectral carve around speech consonants and presence; bed is then level-matched.
subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(OUT/'score-raw.wav'),'-af','highpass=f=60,equalizer=f=1800:t=q:w=0.7:g=-5,lowpass=f=7500,loudnorm=I=-27.5:TP=-5:LRA=7','-ar',str(SR),'-c:a','pcm_s24le',str(OUT/'score-carved.wav')],check=True,capture_output=True)
music,_=sf.read(OUT/'score-carved.wav',always_2d=True); music=music[:N]
voice,sr=sf.read(PUB/'voice.wav',always_2d=True); v=np.zeros((N,2));v[:len(voice)]=voice
# Smoothed, look-ahead envelope following the actual voice, not estimated word durations.
block=480; vr=np.sqrt(np.mean(v[:N//block*block].reshape(-1,block,2)**2,axis=(1,2)))
active=(ndimage.maximum_filter1d(vr,size=17)>.007).astype(float)
env=np.zeros_like(active); p=0
for i,a in enumerate(active):p+=(a-p)*(1-np.exp(-.01/(.025 if a>p else .19)));env[i]=p
duck=np.interp(np.arange(N)/SR,np.arange(len(env))*.01,1-.28*env)
music*=duck[:,None]
sf.write(OUT/'music.wav',music,SR,subtype='PCM_24')
sf.write(OUT/'premaster.wav',v+music+sfx,SR,subtype='PCM_24')

def measure(path):
    p=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-af','loudnorm=I=-14:TP=-1.2:LRA=5:print_format=json','-f','null','-'],capture_output=True,text=True)
    return json.loads(p.stderr[p.stderr.rfind('{'):p.stderr.rfind('}')+1])
stats=measure(OUT/'premaster.wav')
filt=f"loudnorm=I=-14:TP=-1.2:LRA=5:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true:print_format=json"
p=subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(OUT/'premaster.wav'),'-af',filt,'-ar',str(SR),'-ac','2','-c:a','pcm_s24le',str(PUB/'mix.wav')],capture_output=True,text=True,check=True)
final=measure(PUB/'mix.wav'); data,sr=sf.read(PUB/'mix.wav',always_2d=True)
report={'duration':len(data)/sr,'sampleRate':sr,'channels':data.shape[1],'integratedLUFS':float(final['input_i']),'truePeakDBTP':float(final['input_tp']),'loudnessRangeLU':float(final['input_lra']),'samplePeak':float(np.max(np.abs(data))),'clippedSamples':int(np.sum(np.abs(data)>=1)),'voiceDuration':len(voice)/SR,'bedTargetLUFS':-27.5,'voiceUnchangedExceptMaster':True,'voiceTimingPreserved':True,'timing':f'{DUR} seconds, {FRAMES} frames at 30fps', 'cues':[{'time':at,'name':name} for at,name,*_ in cues]}
(OUT/'report.json').write_text(json.dumps(report,indent=2))
(PUB/'cues.md').write_text('# Audio cues\n\nOriginal synthesized score at 112 BPM; additive/modal instruments and procedural Foley. No sampled songs. Voice: user-supplied ElevenLabs Alex narration. Original delivery, pauses, and speed preserved; 48kHz resampling and mix mastering only.\n\n'+ '\n'.join(f'- {at:.2f}s — {name}' for at,name,*_ in cues)+ '\n\nMix: '+json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report,indent=2),flush=True)
