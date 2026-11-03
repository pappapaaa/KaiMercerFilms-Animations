"""Read-only full-film assembly audit. Decode pixels, do not render any 3D.
Verify every final decoded frame equals the corresponding immutable chunk frame.
Also verify source/receipt identities, seamless frame ownership and opening reuse.
"""
from pathlib import Path
import json, hashlib, subprocess, sys
job = Path(sys.argv[1]).resolve()
project = Path(__file__).resolve().parents[2]
qa = Path(__file__).resolve().parent
state = json.loads((job / 'progress.json').read_text())
manifest = json.loads((job / 'source_manifest.json').read_text())
issues = []
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()

def video_md5(p):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-threads', '2', '-i', str(p), '-map', '0:v:0', '-an', '-f', 'framemd5', '-'])
    return [line.decode().split(',')[-1].strip() for line in raw.splitlines() if line and not line.startswith(b'#')]

snapshot = job / 'source'
source_bad = []
for f in manifest['files']:
    p = snapshot / f['path']
    if not p.is_file() or sha(p) != f['sha256']: source_bad.append(f['path'])
if source_bad: issues.append('Snapshot source identity mismatch')

opening = job / 'shots/opening_0000_0299.mp4'
approved = project / 'outputs/preview_v01/silent.mp4'
if sha(opening) != sha(approved): issues.append('Opening is not byte-identical to approved 300-frame preview')
expected = video_md5(opening)
if len(expected) != 300: issues.append('Opening decoded frame count is not 300')
segments = [{'path':str(opening), 'startFrame':0, 'endFrameExclusive':300, 'decodedFrames':len(expected)}]
boundaries=[]
next_frame=300
for receipt in state['completed']:
    a,b=receipt['startFrame'], receipt['endFrameExclusive']
    p=job/'shots'/f"part_{receipt['part']:02d}_{a}_{b-1}.mp4"
    if a != next_frame: issues.append(f'Gap/overlap at {a}, expected {next_frame}')
    if receipt['sourceSha256'] != manifest['sha256']: issues.append(f'Source mismatch in {p.name}')
    if sha(p) != receipt['video']['sha256']: issues.append(f'Chunk byte hash mismatch {p.name}')
    hashes=video_md5(p)
    if len(hashes) != b-a: issues.append(f'Wrong decoded count in {p.name}')
    boundaries.append({'beforeFrame':a-1,'afterFrame':a,'beforePixelMD5':expected[-1] if expected else None,'afterPixelMD5':hashes[0] if hashes else None})
    expected.extend(hashes)
    segments.append({'path':str(p),'startFrame':a,'endFrameExclusive':b,'decodedFrames':len(hashes)})
    next_frame=b
if next_frame != 2887 or len(expected) != 2887: issues.append('Expected timeline is not exactly 2887 frames')
final = Path(state['final']['path'])
actual=video_md5(final)
mismatch=[i for i,(x,y) in enumerate(zip(expected,actual)) if x!=y]
if len(actual)!=len(expected): issues.append('Final frame count differs from source chunks')
if mismatch: issues.append('Final decoded pixels differ from chunk timeline')
result={'method':'SHA-256 source/receipt audit and every-frame ffmpeg decoded-pixel framemd5 comparison; not real-time playback','job':str(job),'final':str(final),'nativeFrames':len(actual),'openingByteIdentical':sha(opening)==sha(approved),'sourceIdentityMismatches':source_bad,'decodedPixelMismatches':mismatch,'segments':segments,'boundaries':boundaries,'issues':issues,'pass':not issues}
out=qa/(job.name+'_assembly_integrity.json')
out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'report':str(out),'nativeFrames':len(actual),'segments':len(segments),'mismatchCount':len(mismatch),'issues':issues,'pass':not issues},indent=2))
