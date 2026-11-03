"""Prepare narration. Supplied ElevenLabs audio is resampled only.

The old generated-voice preparation remains as a fallback for projects without
the supplied MP3; its outputs have been archived under previous-holden.
"""
import sys, re, subprocess, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'out/audio/pydeps'))
import numpy as np
import soundfile as sf
user=ROOT/'out/audio/user-elevenlabs.mp3'
if user.exists():
    subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(user),'-ar','48000','-ac','2','-c:a','pcm_s24le',str(ROOT/'public/audio/voice.wav')],check=True,capture_output=True)
    info=sf.info(ROOT/'public/audio/voice.wav')
    print(json.dumps({'source':str(user),'processing':'Resample only; original speed, pauses, and pitch preserved','duration':info.duration}))
    sys.exit(0)
src=ROOT/'out/audio/voice-source.wav'
r=subprocess.run(['ffmpeg','-hide_banner','-i',str(src),'-af','silencedetect=noise=-42dB:d=0.28','-f','null','-'],capture_output=True,text=True)
silences=[]; start=None
for line in r.stderr.splitlines():
    if 'silence_start:' in line: start=float(re.search(r'silence_start: ([\d.]+)',line)[1])
    if 'silence_end:' in line and start is not None:
        end=float(re.search(r'silence_end: ([\d.]+)',line)[1]); silences.append((start,end)); start=None
x,sr=sf.read(src,always_2d=True,dtype='float64')
pieces=[]; prev=0
for a,b in silences:
    if b-a<0.28: continue
    # Keep 0.22 s for sentence endings. Remove only the center of confirmed silence.
    cut1=int((a+0.11)*sr); cut2=int((b-0.11)*sr)
    pieces.append(x[prev:cut1]); prev=cut2
pieces.append(x[prev:])
y=np.concatenate(pieces)
sf.write(ROOT/'out/audio/voice-tight.wav',y,sr,subtype='PCM_24')
subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(ROOT/'out/audio/voice-tight.wav'),'-af','atempo=1.10,highpass=f=75,lowpass=f=16000','-ar','48000','-ac','2','-c:a','pcm_s24le',str(ROOT/'public/audio/voice.wav')],check=True,capture_output=True)
final,sr=sf.read(ROOT/'public/audio/voice.wav',always_2d=True)
meta={'source':'Higgsfield Seed Audio 1.0','voice':'Holden built-in preset','generationId':'34f069cc-6e6c-4a5b-b63c-52a709da4af9','sourceDuration':len(x)/sr,'pauseTrimSeconds':(len(x)-len(y))/sr,'atempo':1.10,'voiceDuration':len(final)/sr,'scriptWords':len((ROOT/'SCRIPT.md').read_text().split('## Narration')[1].split('## Visual beats')[0].split())}
(ROOT/'out/audio/provenance.json').write_text(json.dumps(meta,indent=2))
print(json.dumps(meta,indent=2))
