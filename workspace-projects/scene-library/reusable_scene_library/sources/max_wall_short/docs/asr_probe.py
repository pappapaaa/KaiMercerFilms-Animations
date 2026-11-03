from pathlib import Path
from pocketsphinx import Decoder
import wave,json
r=Path(__file__).resolve().parent
w=wave.open(str(r/'narration_16k.wav'));data=w.readframes(w.getnframes());d=Decoder(samprate=16000,loglevel='WARN',bestpath=False)
d.start_utt();d.process_raw(data,full_utt=True);d.end_utt()
a=[{'word':s.word,'start':s.start_frame/100,'end':(s.end_frame+1)/100} for s in d.seg()]
(r/'independent_asr.json').write_text(json.dumps({'hypothesis':d.hyp().hypstr,'words':a},indent=2)+'\n')
print(d.hyp().hypstr)
