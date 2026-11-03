"""Package portable code separately from the local reference-study imagery."""
from pathlib import Path
import hashlib,json,os,zipfile
ROOT=Path(__file__).resolve().parents[2]
IGNORE={'.git','node_modules','.tools','.render-tmp','__pycache__','.venv','outputs'}

def source_files(study):
    for folder,dirs,names in os.walk(ROOT):
        here=Path(folder);rel=here.relative_to(ROOT)
        dirs[:]=[d for d in dirs if d not in IGNORE]
        if rel.as_posix()=='references':dirs[:]=[d for d in dirs if d!='videos']
        if len(rel.parts)==3 and rel.parts[:2]==('references','frames'):dirs[:]=[d for d in dirs if d!='all']
        if rel.as_posix()=='public':dirs[:]=[d for d in dirs if d!='stems']
        for name in sorted(names):
            file=here/name;part=file.relative_to(ROOT)
            if file.suffix in {'.pyc','.part','.ytdl'}:continue
            if part.parts[0]=='public' and (name.endswith('.premaster.wav') or name=='demo-mix.json'):continue
            if not study and part.parts[0]=='references' and file.suffix.lower() in {'.jpg','.jpeg','.png','.webp','.mp4','.wav','.vtt'}:continue
            yield file
    # These are original project outputs, never reference footage.
    outputs=['style-proof-preview.mp4','style-proof-2K.mp4','proof-sheet.jpg','style-proof-2K.qa.json','kit-validation.json','kit-default-validation.json','kit-code-only-validation.json','BUILD_REPORT.md','main-character-2K.mp4','main-character-preview.mp4','main-character.qa.json','main-character-sheet.jpg']
    for name in outputs:
        file=ROOT/'outputs'/name
        if file.is_file():yield file
    forward=ROOT/'outputs/forward-test'
    if forward.exists():
        for file in sorted(forward.rglob('*')):
            if file.is_file() and file.suffix in {'.md','.tsx','.ts','.json','.png'}:yield file

def main():
    out=ROOT/'outputs';out.mkdir(exist_ok=True);results=[]
    for study in [False,True]:
        kind='study' if study else 'code';target=out/f'reference-shorts-style-kit-{kind}.zip'
        files=sorted(set(source_files(study)));entries=[]
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
            for file in files:
                name=file.relative_to(ROOT).as_posix();raw=file.read_bytes()
                archive.writestr('reference-shorts-style-kit/'+name,raw)
                entries.append({'path':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
            manifest={'package':kind,'reference_imagery_included':study,'raw_videos_included':False,'all_frame_jpegs_included':False,'files':entries}
            archive.writestr('reference-shorts-style-kit/PACKAGE_MANIFEST.json',json.dumps(manifest,indent=2))
        with zipfile.ZipFile(target) as archive:
            if archive.testzip() is not None:raise RuntimeError('ZIP integrity failure: '+str(target))
        result={'package':kind,'path':str(target),'files':len(entries),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
        results.append(result);print(json.dumps(result))
    (out/'package-manifest.json').write_text(json.dumps(results,indent=2))
if __name__=='__main__':main()
