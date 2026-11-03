"""Max and the wall: original suspense-to-warmth score + restrained Foley.

Preserves public/narration.mp3 timing and delivery exactly. Only resampling,
speech dynamics, and final mix mastering alter level; no time/pitch processing.
Run with Python 3.13; dependencies live in ../../out/audio/pydeps.
"""
from pathlib import Path
import sys, json, math, subprocess, hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT.parent/'out/audio/pydeps'))
import numpy as np
import soundfile as sf
from scipy import signal, ndimage, optimize

SR=48000; FRAMES=2887; DUR=FRAMES/30; N=round(DUR*SR); TAU=2*np.pi
OUT=ROOT/'audio'; PUB=ROOT/'public'; OUT.mkdir(exist_ok=True)
rng=np.random.default_rng(802361)
score=np.zeros((N,2)); foley=np.zeros((N,2)); cues=[]

def tt(d):return np.arange(round(d*SR))/SR
def hz(m):return 440*2**((m-69)/12)
def fade(t,d,a=.008,r=.08):return np.minimum(t/a,1)*np.clip((d-t)/r,0,1)
def add(dst,y,at,amp=1,pan=0):
    start=round(at*SR); stop=min(N,start+len(y)); n=stop-start
    if n<1 or start<0:return
    if y.ndim==1:
        dst[start:stop,0]+=y[:n]*amp*np.sqrt((1-pan)/2)
        dst[start:stop,1]+=y[:n]*amp*np.sqrt((1+pan)/2)
    else:dst[start:stop]+=y[:n]*amp
def event(at,name,y,amp=.05,pan=0,kind='procedural'):
    add(foley,y,at,amp,pan);cues.append({'time':round(at,4),'name':name,'duration':round(len(y)/SR,4),'source':kind})
def piano(m,d=2.3,soft=1):
    t=tt(d);f=hz(m);y=np.zeros(len(t))
    # Inharmonic hammered strings, softer upper partials and short felt strike.
    for k in range(1,9):
        ph=TAU*f*k*np.sqrt(1+.000035*k*k)*t
        y+=np.sin(ph+.02*k)*np.exp(-t*(.8+k*.58))/(k**(1.7+soft*.3))
    return y*fade(t,d,.006,.24)
def pad(m,d=4.2):
    t=tt(d);f=hz(m);y=np.zeros(len(t))
    for det in [-.0017,.0017]:
        for k in [1,2,3,4]:y+=np.sin(TAU*f*k*(1+det)*t+.11*k)/(k**2.4)
    return y*.5*fade(t,d,.6,.85)*(.94+.06*np.sin(TAU*.4*t))
def pulse(m,d=.44):
    t=tt(d);f=hz(m)
    return (np.sin(TAU*f*t)+.22*np.sin(TAU*2*f*t))*np.exp(-t*5.5)*fade(t,d,.04,.1)
def noise(d,low=100,high=5000):
    y=rng.standard_normal(round(d*SR))
    return signal.sosfilt(signal.butter(2,[low,high],fs=SR,btype='bandpass',output='sos'),y)
def knock(d=.31,heavy=0):
    t=tt(d);y=np.zeros(len(t))
    for f,a,decay in [(103-heavy*23,.65,20),(187-heavy*25,.34,31),(351,.16,41),(734,.05,65)]:
        y+=a*np.sin(TAU*f*t)*np.exp(-t*decay)
    y+=noise(d,150,3000)*.16*np.exp(-t*110)
    return y*fade(t,d,.0008,.06)
def cloth(d=.35):
    t=tt(d);return noise(d,250,2400)*np.sin(np.pi*t/d)**2*.5
def scratch(d=.20):
    t=tt(d);y=noise(d,1000,5200)
    return y*np.sin(np.pi*t/d)**2*(.55+.45*np.sin(TAU*47*t)**2)
def foot(d=.14):
    t=tt(d);return (noise(d,120,1600)*.16*np.exp(-t*33)+.22*np.sin(TAU*84*t)*np.exp(-t*38))*fade(t,d,.003,.04)
def click(d=.07):
    t=tt(d);return (noise(d,1300,6800)*.2+np.sin(TAU*1150*t)*.1)*np.exp(-t*80)*fade(t,d,.001,.02)
def dtmf(d=.09,low=697,high=1209):
    t=tt(d);return (np.sin(TAU*low*t)+np.sin(TAU*high*t))*.5*fade(t,d,.008,.015)
def whine(d=.43):
    t=tt(d);f=480+70*np.sin(np.pi*t/d)+9*np.sin(TAU*5.2*t);ph=TAU*np.cumsum(f)/SR
    return (np.sin(ph)+.27*np.sin(2*ph)+.11*np.sin(3*ph))*np.sin(np.pi*t/d)**1.3*.45
def source(name):
    x,sr=sf.read(OUT/'sources'/name,always_2d=True)
    if sr!=SR:x=signal.resample_poly(x,SR,sr,axis=0)
    x=x.mean(axis=1)
    env=ndimage.maximum_filter1d(np.abs(x),size=round(.015*SR))
    active=np.flatnonzero(env>max(np.max(env)*.015,1e-6))
    if len(active):x=x[max(0,active[0]-round(.006*SR)):min(len(x),active[-1]+round(.06*SR))]
    x=x/max(np.max(np.abs(x)),1e-8)
    t=np.arange(len(x))/SR;x*=fade(t,len(x)/SR,.004,.065)
    return x

# Sparse original harmonic story. No percussive beat during listening/medical warning.
BEAT=60/84; BAR=4*BEAT
minor=[[48,55,62,63],[44,51,58,60],[46,53,60,65],[43,50,58,62]]
warm=[[48,55,60,64,67],[45,52,59,60,64],[41,48,55,57,60],[43,50,57,59,62]]
for bar in range(math.ceil(DUR/BAR)):
    at=bar*BAR;iswarm=at>=85.25;ch=(warm if iswarm else minor)[bar%4]
    for j,n in enumerate(ch):add(score,pad(n,4.5),at,.026,(-.55+j*.22))
    for b,n in enumerate([ch[0]+12,ch[2]+12,ch[1]+12,ch[-1]+12]):
        if b%2==0 or 18.48<at<34.69 or 59.52<at<75.08:
            add(score,piano(n,2.1),at+b*BEAT,.060 if iswarm else .050,-.22 if b%2 else .22)
    if 59.52<=at<75.08:
        for b in range(4):add(score,pulse(ch[0]-12),at+b*BEAT,.050,0)
# A three-note motif resolves from C–D–Eb to C–D–E after the rescue.
for base,iswarm in [(1.2,False),(19.1,False),(35.2,False),(43.25,False),(85.8,True),(90.8,True)]:
    for off,m in zip([0,1.35,2.5],[72,74,76 if iswarm else 75]):add(score,piano(m,2.2),base+off,.040,-.1+off*.1)
for j,m in enumerate([60,64,67,72]):add(score,piano(m,3.8),92.05+j*.085,.026,-.2+j*.14)
# Preserve meaningful quiet, rather than turning it into a relentless trailer.
t=np.arange(N)/SR
level=np.interp(t,[0,.18,7,18.48,34.69,42.90,45.52,47.35,49.2,51.19,52.77,57.86,59.52,70.32,75.08,79.92,81.73,84.8,85.25,88.1,92.8,94.15,95.0,DUR],
    [.38,.6,.66,.75,.55,.72,.28,.28,.63,.18,.06,.06,.82,.86,.38,.29,.08,.08,.4,.8,.48,.48,.68,0])
score*=level[:,None]
for delay,g in [(.085,.10),(.14,.055),(.22,.025)]:
    d=round(delay*SR);score[d:]+=score[:-d,::-1]*g
score[-round(.15*SR):]*=np.linspace(1,0,round(.15*SR))[:,None]

bark=source('animal-dog-bark-25.wav'); howl=source('dog-howl-02.wav')
# Bark hits are a few accents, not a dog loop beneath every sentence.
for at,amp in [(.54,.050),(1.85,.037),(27.7,.027),(43.55,.035),(95.43,.057)]:
    event(at,'Max bark' if at<90 else 'Max warm answering bark',bark,amp,.24,'SFXMint CC0 animal-dog-bark-25')
event(15.05,'brief soft canine whine',whine(),.023,.22)
for at in [15.62,16.30,16.98,17.66]:event(at,'claws on painted wall',scratch(),.034,.25)
event(22.52,'bed sheet rustle',cloth(.5),.018,-.32)
event(30.24,'collar fabric contact',cloth(.27),.023,.1)
for at in [32.18,32.43,32.68,32.94]:event(at,'Max quick paw step',foot(.08),.042,.2)
event(1202/30,'save draft phone tap',click(),.030,0)
event(47.43,'short domestic dog howl',howl,.041,.22,'SFXMint CC0 dog-howl-02')
event(49.20,'Max controlled body contact with wall',knock(.40,.7),.083,.25)
# Exact editorial thumps. Background is intentionally almost absent here.
for at,amp in [(54.94,.078),(55.90,.066),(56.81,.056)]:event(at,'distant drywall thump',knock(.38,.6),amp,.32)
# Existing travel is 7.45m with native stride cycle 2.775m. Place sock contacts by travel.
for k in range(1,6):
    fraction=(k*1.3875)/7.45
    u=optimize.brentq(lambda v:3*v*v-2*v*v*v-fraction,0,1)
    event(1786/30+u*((1844-1786-1)/30),'socked hallway footfall',foot(.15),.11,(-.1 if k%2 else .1))
for at in [61.59,62.16,62.74]:event(at,'urgent door pound',knock(.32,.25),.091,.15)
for at in [67.78,68.18]:event(at,'weak answering tap',knock(.24,.15),.040,.24)
event(69.39,'phone keypad 9',dtmf(low=852,high=1477),.009,0)
event(69.51,'phone keypad 1',dtmf(),.009,0)
event(69.63,'phone keypad 1',dtmf(),.009,0)
event(71.65,'forced door latch and muted impact',knock(.46,.8),.11,.15)
event(71.69,'door wood movement',cloth(.40),.038,.15)
for at in [72.70,73.16,73.62,74.08]:event(at,'bathroom door scratch',scratch(.22),.030,-.13)
event(2605/30,'delete saved draft phone tap',click(),.029,0)
# Exactly two knocks in the Sunday payoff. No drum/percussion layers in this region.
for at in [93.24,94.05]:event(at,'Sunday friendly wall knock',knock(.24,.1),.075,-.2)

sf.write(OUT/'score-raw.wav',score,SR,subtype='PCM_24')
sf.write(OUT/'sfx.wav',foley,SR,subtype='PCM_24')
subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(PUB/'narration.mp3'),'-ar',str(SR),'-ac','2','-c:a','pcm_s24le',str(OUT/'voice.wav')],capture_output=True,check=True)
# Light vocal compression allows intelligible -14 LUFS delivery while retaining its pauses.
subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(OUT/'voice.wav'),'-af','acompressor=threshold=0.06:ratio=2.2:attack=8:release=95:knee=4:makeup=1.45:mix=0.65','-ar',str(SR),'-c:a','pcm_s24le',str(OUT/'voice-leveled.wav')],capture_output=True,check=True)
subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(OUT/'score-raw.wav'),'-af','highpass=f=65,equalizer=f=1900:t=q:w=0.7:g=-5,lowpass=f=6500,loudnorm=I=-36:TP=-9:LRA=10','-ar',str(SR),'-c:a','pcm_s24le',str(OUT/'score-carved.wav')],capture_output=True,check=True)
music,_=sf.read(OUT/'score-carved.wav',always_2d=True);music=music[:N]
voice,sr=sf.read(OUT/'voice-leveled.wav',always_2d=True);v=np.zeros((N,2));v[:min(len(voice),N)]=voice[:N]
# Actual voice envelope drives moderate sidechain ducking, with an 80ms look-ahead.
block=480;count=N//block;rms=np.sqrt(np.mean(v[:count*block].reshape(-1,block,2)**2,axis=(1,2)))
activity=(ndimage.maximum_filter1d(rms,size=17)>.004).astype(float);env=np.zeros(len(activity));val=0
for i,a in enumerate(activity):val+=(a-val)*(1-np.exp(-.01/(.025 if a>val else .24)));env[i]=val
ducker=np.interp(np.arange(N)/SR,np.arange(len(env))*.01,1-.32*env)
music*=ducker[:,None]
# Dog accents yield a little more to the narration through the common SFX stem.
foley*=np.interp(np.arange(N)/SR,np.arange(len(env))*.01,1-.10*env)[:,None]
sf.write(OUT/'music.wav',music,SR,subtype='PCM_24');sf.write(OUT/'sfx.wav',foley,SR,subtype='PCM_24')
sf.write(OUT/'premaster.wav',v+music+foley,SR,subtype='PCM_24')
def measure(path):
    p=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-af','loudnorm=I=-14:TP=-1.2:LRA=6:print_format=json','-f','null','-'],capture_output=True,text=True)
    return json.loads(p.stderr[p.stderr.rfind('{'):p.stderr.rfind('}')+1])
stats=measure(OUT/'premaster.wav')
filt=f"loudnorm=I=-14:TP=-1.2:LRA=6:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true:print_format=json"
subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(OUT/'premaster.wav'),'-af',filt,'-ar',str(SR),'-ac','2','-c:a','pcm_s24le',str(PUB/'mix.wav')],capture_output=True,check=True)
stats=measure(PUB/'mix.wav');master,sr=sf.read(PUB/'mix.wav',always_2d=True)
report={'duration':len(master)/sr,'frames':FRAMES,'fps':30,'sampleRate':sr,'channels':master.shape[1],'integratedLUFS':float(stats['input_i']),'truePeakDBTP':float(stats['input_tp']),'loudnessRangeLU':float(stats['input_lra']),'samplePeak':float(np.max(np.abs(master))),'clippedSamples':int(np.sum(np.abs(master)>=1)),'narrationSHA256':hashlib.sha256((PUB/'narration.mp3').read_bytes()).hexdigest(),'originalNarrationFileUnmodified':True,'playbackRate':1,'voiceProcessing':'Resampling and light level compression only; no cuts, pause removal, stretch or pitch change. Master loudness normalization/limiting.', 'drywallThumps':[54.94,55.90,56.81],'finalKnocks':[93.24,94.05],'cueCount':len(cues)}
(OUT/'report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
(OUT/'cues.json').write_text(json.dumps(sorted(cues,key=lambda c:c['time']),indent=2),encoding='utf8')
print(json.dumps(report,indent=2),flush=True)
