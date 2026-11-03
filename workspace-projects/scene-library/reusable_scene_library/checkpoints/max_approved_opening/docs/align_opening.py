from pathlib import Path
from pocketsphinx import Decoder
import re,wave,json
root=Path(__file__).resolve().parent.parent
text=(root/'docs/script.txt').read_text().strip()
tokens=text.split()[:25]
def normalize(t):
 n=re.sub(r"[^\w']",'',t.lower())
 return {'3':['three'],'am':['a.m.'],'84':['eighty','four'],'7':['seven'],'911':['nine','one','one']}.get(n,[n])
normalized=[w for t in tokens for w in normalize(t)]
d=Decoder(samprate=16000,loglevel='WARN',bestpath=False)
d.add_word('whined','W AY N D',False)
d.add_word("harlan's",'HH AA R L AH N Z',False)
for w in normalized:
 if not d.lookup_word(w): raise ValueError(f'MISSING DICTIONARY TOKEN {w}')
d.set_align_text(' '.join(normalized))
wav=wave.open(str(root/'docs/narration_16k.wav'));data=wav.readframes(int(7.1*16000))
d.start_utt();d.process_raw(data,full_utt=True);d.end_utt()
segments=[{'word':s.word,'start':round(s.start_frame/100,3),'end':round((s.end_frame+1)/100,3),'prob':s.prob} for s in d.seg()]
(root/'docs/opening_alignment_raw.json').write_text(json.dumps(segments,indent=2)+'\n')
print('First pass',len(segments),flush=True)
d.set_alignment();d.start_utt();d.process_raw(data,full_utt=True);d.end_utt()
segments2=[{'word':s.name,'start':round(s.start/100,3),'end':round((s.start+s.duration)/100,3),'score':s.score} for s in d.get_alignment()]
(root/'docs/opening_alignment_refined.json').write_text(json.dumps(segments2,indent=2)+'\n')
print('Second pass',len(segments2),flush=True)
a=[x for x in segments2 if not x['word'].startswith('<')]
assert len(a)==len(normalized),(len(a),len(normalized))
for w,x in zip(normalized,a): assert w==re.sub(r'\(\d+\)$','',x['word']),(w,x)
j=0;merged=[]
for t in tokens:
 n=len(normalize(t));ws=a[j:j+n];merged.append({'text':t,'start':ws[0]['start'],'end':ws[-1]['end']});j+=n
(root/'docs/opening_word_alignment.json').write_text(json.dumps(merged,indent=2)+'\n')
for w in merged:print(w,flush=True)
