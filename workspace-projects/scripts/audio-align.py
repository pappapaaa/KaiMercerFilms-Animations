"""Transcribe the generated narration into measured word timings (CPU Whisper).

Run with Python 3.13 and workspace-local dependencies in out/audio/pydeps.
"""
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'out/audio/pydeps'))
import json
from faster_whisper import WhisperModel
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

model = WhisperModel('base.en', device='cpu', compute_type='int8', download_root=str(ROOT / 'out/audio/models'))
x,sr=sf.read(ROOT/'public/audio/voice.wav',always_2d=True)
x=resample_poly(x.mean(axis=1),16000,sr).astype(np.float32)
segments, info = model.transcribe(x, language='en', word_timestamps=True,
    beam_size=5, initial_prompt='The Eiffel Tower, Paris, iron, thermal expansion, atoms, fifteen centimeters, sun dodge.', vad_filter=False)
segs, words = [], []
for seg in segments:
    ws = [{'text':w.word.strip(), 'start':round(w.start,3), 'end':round(w.end,3), 'probability':round(w.probability,3)} for w in seg.words]
    words.extend(ws)
    segs.append({'text':seg.text.strip(), 'start':round(seg.start,3), 'end':round(seg.end,3)})
    print(f'{seg.start:.2f}-{seg.end:.2f}: {seg.text}', flush=True)
for w in words:
    if w['text']=="It's" and 30<w['start']<33:w['text']='Its'
    if w['text']=='sundodge.':w['text']='sun dodge.'
for s in segs:s['text']=s['text'].replace("It's atoms",'Its atoms').replace('sundodge.','sun dodge.')
timing = {'duration':round(info.duration,6), 'timingMethod':'faster-whisper base.en automatic word alignment of rendered audio; transcript compared with source script. Timestamps are model estimates, not manually verified frame-accurate marks.', 'segments':segs, 'words':words}
(ROOT / 'public/audio/timing.json').write_text(json.dumps(timing,indent=2),encoding='utf8')
(ROOT / 'public/audio/words.json').write_text(json.dumps(words,indent=2),encoding='utf8')
print('Saved',len(words),'word timings', flush=True)
