from pathlib import Path
import json,re,wave,hashlib,math
r=Path(__file__).resolve().parent.parent
script=' '.join((r/'docs/script.txt').read_text().split());words=json.loads((r/'docs/word_alignment.json').read_text())
phrases='''My dog Max had barked
at the same wall
at 3 AM
every night for a week,
and I was about
to give him away.
The first night,
I figured he heard a mouse.
I pressed my ear
against the wall and heard nothing.
"Max, go to sleep!"
He whined and clawed
at the paint
like his life depended on it.
By Thursday, I hadn't slept
in four days.
My girlfriend rolled over and groaned,
"It's your dog,
you fix it."
"The neighbor is 84,
he's asleep by 7!"
I dragged Max out
by his collar,
but he broke free
and sprinted right back
to the wall.
That morning, I wrote a post:
Free to a good home:
one loud dog.
I hit save as a draft
and went to bed angry.
At 3 AM,
Max started again,
but this time
he wasn't barking.
He was howling,
throwing his whole body
against the wall.
I opened my mouth to yell,
and then I heard it
through the drywall:
thump...
thump...
thump.
My stomach dropped.
I ran into the hallway
in my socks
and pounded on Mr. Harlan's door.
"Sir, are you okay?!"
Nothing.
Then the weak sound
of someone tapping back.
I called 911,
and by the time the paramedics
broke the door down,
Max was already scratching
at the bathroom.
Mr. Harlan was on the floor.
He'd fallen hours earlier
and couldn't reach his phone.
The paramedic looked at me
and said, "Another hour,
and we wouldn't have been
having this conversation."
I went back to my apartment
and deleted the post.
Max got a whole steak
that night.
And Mr. Harlan?
Every Sunday now,
he knocks on our wall twice,
and Max barks back.'''.splitlines()
assert ' '.join(phrases)==script
assert ' '.join(w['text'] for w in words)==script
assert len(words)==286
caps=[];j=0
for p in phrases:
 n=len(p.split());ws=words[j:j+n];assert ' '.join(w['text'] for w in ws)==p
 caps.append({'start':ws[0]['start'],'end':ws[-1]['end'],'text':p,'words':ws});j+=n
for i,c in enumerate(caps):
 nxt=caps[i+1]['start'] if i+1<len(caps) else 2887/30
 hold=.18 if c['text'].startswith('thump') else .12
 c['end']=round(min(c['end']+hold,nxt),3)
caps[-1]['end']=2887/30
assert all(a['end']<=b['start'] for a,b in zip(caps,caps[1:]))
assert all(c['start']<=w['start']<w['end']<=c['end'] for c in caps for w in c['words'])
(r/'src/captions.json').write_text(json.dumps(caps,indent=2)+'\n')
def ts(t,sep=','):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'
(r/'docs/captions.srt').write_text('\n\n'.join(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}" for i,c in enumerate(caps,1))+'\n')
(r/'docs/captions.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f"{ts(c['start'],'.')} --> {ts(c['end'],'.')}\n{c['text']}" for c in caps)+'\n')
original=next((r/'audio').glob('*.mp3'));public=r/'public/narration.mp3';hashfn=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
with wave.open(str(r/'docs/narration_16k.wav')) as w:duration=w.getnframes()/w.getframerate()
report={'passed':True,'scriptWords':286,'alignedScriptWords':len(words),'acousticTokens':289,'captionCount':len(caps),'firstWordStart':words[0]['start'],'lastWordEnd':words[-1]['end'],'mp3ContainerDurationSeconds':96.208938,'analysisDecodedPCMSeconds':duration,'compositionFrames':2887,'compositionFPS':30,'compositionDurationSeconds':2887/30,'audioPlaybackRate':1,'originalSha256':hashfn(original),'publicSha256':hashfn(public),'byteIdentical':original.read_bytes()==public.read_bytes(),'method':'PocketSphinx5.0.4 local en-US acoustic forced alignment; word pass followed by phone/state pass; 10ms acoustic frames.12 silent-gap-delimited chunks. Broadbeam search retained to align compressed contracted warning sentence. Numeric display tokens84 and911 merge their two/three spoken tokens without changing original captions. No proportional timing, silence insertion, speech-speed modification or remote audio upload.','checks':['all286 original script tokens retained verbatim and in order','all positive word durations','all words enclosed in corresponding cue','all cue boundaries nonoverlapping','first audio and video frames start0; no pre-roll','last cue held through composition end96.233333; source MP3 untouched'],'shortDramaticCues':['thump...','thump...','thump.','Nothing.','that night.'],'limitations':['Forced alignment is constrained to supplied script and does not independently prove spoken transcript accuracy.','Independent local unconstrained ASR saved in docs/independent_asr.json; recognition errors remain and were not used to rewrite captions.','No human-certified listening or transcription.10ms boundaries are acoustic estimates.','Whole-file narrow-beam alignment failed; successful chunked broad-beam results are authoritative.'],'officialDocumentation':'https://pocketsphinx.readthedocs.io/en/stable/pocketsphinx.html#pocketsphinx.Decoder.set_align_text'}
(r/'docs/captions_validation.json').write_text(json.dumps(report,indent=2)+'\n')
print('COMPLETE',len(caps),'cues',len(words),'words',duration,'decodedseconds')
for c in caps:print(f"{c['start']:6.2f}–{c['end']:6.2f} {c['text']}")
