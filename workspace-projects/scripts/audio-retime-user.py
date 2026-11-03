"""Preserve supplied voice, correct only obvious ASR spelling/window artifacts."""
from pathlib import Path
import json, math, hashlib
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'public/audio/timing.json'
x=json.loads(p.read_text())
words=x['words']; corrected=[]; i=0
while i<len(words):
    w=words[i].copy()
    if w['text'].lower()=='unsafe.' and i+1<len(words) and words[i+1]['text']=='Successfully,':
        w['text']='unsuccessfully.';w['end']=words[i+1]['end'];w['probability']=min(w['probability'],words[i+1]['probability']);i+=1
    if w['text']=="It's" and i+1<len(words) and words[i+1]['text']=='atoms':w['text']='Its'
    corrected.append(w);i+=1
x['words']=corrected
x['timingMethod']='faster-whisper base.en automatic word alignment of supplied ElevenLabs audio. ASR window split of unsuccessfully and Its orthography corrected against source script; no audio altered. Timestamps are model estimates.'
x['segments']=[]
bounds=[0,3.96,12.96,17.72,23.42,25.84,30.74,39.62,47.44,55.36,100]
for a,b in zip(bounds,bounds[1:]):
    group=[w for w in corrected if a<=w['start']<b]
    x['segments'].append({'text':' '.join(w['text'] for w in group),'start':group[0]['start'],'end':group[-1]['end']})
p.write_text(json.dumps(x,indent=2),encoding='utf8')
(ROOT/'public/audio/words.json').write_text(json.dumps(corrected,indent=2),encoding='utf8')
provenance={'source':'User supplied ElevenLabs MP3','sourceFile':'out/audio/user-elevenlabs.mp3','voice':'Alex - Upbeat, Energetic and Clear','sourceSHA256':hashlib.sha256((ROOT/'out/audio/user-elevenlabs.mp3').read_bytes()).hexdigest(),'processing':'Decoded and resampled to 48kHz stereo PCM only. Original speed, pauses, and delivery preserved. No time compression, silence trimming, or pitch change. Mix master gain/limiting only.','voiceDuration':x['duration'],'compositionFrames':math.ceil(x['duration']*30),'compositionDuration':math.ceil(x['duration']*30)/30,'transcriptCheck':'Same narration as SCRIPT.md; automatic ASR spelled Its as It\'s and split unsuccessfully at the 30-second analysis window. Corrected transcript only.'}
(ROOT/'out/audio/provenance.json').write_text(json.dumps(provenance,indent=2),encoding='utf8')
print(json.dumps(provenance,indent=2))
