"""Package the fresh editable film without caches or historical rendered footage."""
from pathlib import Path
import zipfile,hashlib,json
ROOT=Path(__file__).resolve().parents[1]
files=[]
for folder in ['src','public','third_party','audio/sources']:
    files.extend(p for p in (ROOT/folder).rglob('*') if p.is_file())
for name in ['README.md','PRODUCTION.md','package.json','package-lock.json','tsconfig.json','.gitignore',
             'scripts/produce.mjs','scripts/audio-mix.py','scripts/contact_sheet.py','scripts/review_frames.py','scripts/qa-plan.cjs','scripts/video-qa.py','scripts/verify_export.py','scripts/package_project.py',
             'docs/script.txt','docs/story_beats.json','docs/word_alignment.json','docs/captions.srt','docs/captions.vtt','docs/audio_identity.json','docs/FRESH_SHOT_DESIGN.md','docs/world_contract.md',
             'qa/test_max_contacts.cjs','qa/fresh_profile_walk.cjs','qa/max-contact-tests.json','qa/fresh-profile-walk.json',
             'audio/README.md','audio/report.json','audio/cues.json','audio/source-manifest.json','audio/music.wav','audio/sfx.wav','audio/voice-leveled.wav',
             'outputs/qa/report.md','outputs/qa/review.md','outputs/qa/shots.json','outputs/qa/export-check.json']:
    p=ROOT/name
    if p.exists(): files.append(p)
manifest={str(p.relative_to(ROOT)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(files))}
dest=ROOT.parent/'out/Max-editable-project.zip'
dest.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=5) as z:
    for rel in manifest: z.write(ROOT/rel,f'Max-fresh-video/{rel}')
    z.writestr('Max-fresh-video/FILE_SHA256.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(dest) as z:
    bad=z.testzip()
    if bad: raise RuntimeError('Corrupt archive member: '+bad)
print(json.dumps({'file':str(dest),'files':len(manifest)+1,'bytes':dest.stat().st_size,'archiveCRC':'pass'}))
