from pathlib import Path
from pocketsphinx import Decoder
import re,wave,json
root=Path(__file__).resolve().parent.parent
text=(root/'docs/script.txt').read_text().strip();paragraphs=text.split('\n\n')
paragraphs=paragraphs[:6]+['Mr. Harlan was on the floor.', "He'd fallen hours earlier and couldn't reach his phone.", 'The paramedic looked at me and said,', '"Another hour, and we wouldn\'t have been having this conversation."']+paragraphs[7:]
bounds=[0,7.1,18.3,34.5,42.7,57.6,74.9,76.8,79.8,81.6,85.0,90.4,96.208938]
def normalize(t):
 n=re.sub(r"[^\w']",'',t.lower())
 return {'3':['three'],'am':['a.m.'],'84':['eighty','four'],'7':['seven'],'911':['nine','one','one']}.get(n,[n])
wav=wave.open(str(root/'docs/narration_16k.wav'));data=wav.readframes(wav.getnframes());merged=[];rawall=[];refinedall=[]
for pi,paragraph in enumerate(paragraphs):
 tokens=paragraph.split();normalized=[w for t in tokens for w in normalize(t)];offset=bounds[pi];end=bounds[pi+1]
 d=Decoder(samprate=16000,loglevel='WARN',bestpath=False,beam=1e-100,wbeam=1e-80,pbeam=1e-80,topn=8)
 d.add_word('whined','W AY N D',False);d.add_word("harlan's",'HH AA R L AH N Z',False)
 for w in normalized:
  if not d.lookup_word(w): raise ValueError(f'MISSING DICTIONARY TOKEN {w}')
 pcm=data[round(offset*16000)*2:round(end*16000)*2]
 d.set_align_text(' '.join(normalized));d.start_utt();d.process_raw(pcm,full_utt=True);d.end_utt()
 segments=[{'paragraph':pi,'word':s.word,'start':round(offset+s.start_frame/100,3),'end':round(offset+(s.end_frame+1)/100,3),'prob':s.prob} for s in d.seg()];rawall.extend(segments)
 print('Paragraph',pi+1,'firstpass',len(segments),flush=True)
 d.set_alignment();d.start_utt();d.process_raw(pcm,full_utt=True);d.end_utt()
 segments2=[{'paragraph':pi,'word':s.name,'start':round(offset+s.start/100,3),'end':round(offset+(s.start+s.duration)/100,3),'score':s.score} for s in d.get_alignment()];refinedall.extend(segments2)
 a=[x for x in segments2 if not x['word'].startswith('<')]
 assert len(a)==len(normalized),(len(a),len(normalized))
 for w,x in zip(normalized,a): assert w==re.sub(r'\(\d+\)$','',x['word']),(w,x)
 j=0
 for t in tokens:
  n=len(normalize(t));ws=a[j:j+n];merged.append({'text':t,'start':ws[0]['start'],'end':ws[-1]['end']});j+=n
 print('Paragraph',pi+1,'secondpass completed',tokens[0],tokens[-1],a[0]['start'],a[-1]['end'],flush=True)
 (root/'docs/word_alignment.json').write_text(json.dumps(merged,indent=2)+'\n')
(root/'docs/forced_alignment_raw.json').write_text(json.dumps(rawall,indent=2)+'\n')
(root/'docs/forced_alignment_refined.json').write_text(json.dumps(refinedall,indent=2)+'\n')
(root/'docs/alignment_chunks.json').write_text(json.dumps({'method':'two-pass PocketSphinx 5.0.4 acoustic forced alignment in paragraph chunks; chunk boundaries placed inside quiet gaps identified by independent unconstrained local ASR and RMS analysis','bounds':bounds,'dictionary_additions':{'whined':'W AY N D',"harlan's":'HH AA R L AH N Z'},'normalizations':{'3':'three','AM':'a.m.','84':'eighty four','7':'seven','911':'nine one one'}},indent=2)+'\n')
print('COMPLETE',len(merged),'words',merged[0],merged[-1],flush=True)
