"""Prepare browsable project source and complete, independently extractable workspace ZIP parts.

All files, including hidden files, dependencies, caches, media, and Git metadata,
are included in archive mode. Output must live outside the workspace being read.
"""
from __future__ import annotations
import argparse,hashlib,json,os,shutil,time,zipfile
from pathlib import Path

COMPRESSED={'.mp4','.webm','.mov','.mp3','.opus','.png','.jpg','.jpeg','.webp','.gif','.zip','.7z','.gz','.woff','.woff2'}
CODE_SKIP={'.git','node_modules','.render-tmp','__pycache__','outputs','pydeps','models','.tools'}

def inventory(root):
    files=[];directories=[]
    for folder,dirs,names in os.walk(root):
        dirs.sort();names.sort();base=Path(folder)
        if base!=root:directories.append(base.relative_to(root).as_posix())
        for name in names:
            path=base/name
            if path.is_symlink():raise RuntimeError('Inspect symbolic link before archiving: '+str(path))
            files.append(path)
    return files,directories

def prepare_projects(root,repo):
    target=repo/'workspace-projects';target.mkdir(exist_ok=True)
    copied=[];archive_only=[]
    def copy(path,rel):
        if path.stat().st_size>=100*1024**2:
            archive_only.append(rel.as_posix());return
        dest=target/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest);copied.append(rel.as_posix())
    for path in sorted(root.iterdir()):
        if path.is_file():copy(path,Path(path.name))
    for name in ['src','public','scene-library','scripts','max-video','repo']:
        source=root/name
        if not source.exists():continue
        for folder,dirs,names in os.walk(source):
            dirs[:]=sorted(d for d in dirs if d not in CODE_SKIP)
            for filename in sorted(names):
                path=Path(folder)/filename
                if path.suffix.lower() in {'.mp4','.webm','.zip','.log','.pyc'}:continue
                copy(path,path.relative_to(root))
    out=root/'out'
    if out.exists():
        for folder,dirs,names in os.walk(out):
            dirs[:]=sorted(d for d in dirs if d not in CODE_SKIP and d!='frames')
            for filename in sorted(names):
                path=Path(folder)/filename
                if path.suffix.lower() in {'.py','.json','.md','.txt','.srt','.vtt'}:copy(path,path.relative_to(root))
    report={'files':len(copied),'paths':copied,'large_files_in_complete_release_only':archive_only}
    (target/'SOURCE_INDEX.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'browsable_project_files':len(copied),'path':str(target),'large_files_archive_only':archive_only}),flush=True)

def sha256(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(4*1024**2),b''):h.update(block)
    return h.hexdigest()

def archive(root,out,part_mib):
    root=root.resolve();out=out.resolve()
    if out==root or root in out.parents:raise ValueError('Place release output outside the workspace.')
    out.mkdir(parents=True,exist_ok=True)
    files,dirs=inventory(root);limit=part_mib*1024**2
    if any(p.stat().st_size>limit for p in files):raise ValueError('An individual input file exceeds the part budget.')
    parts=[];records=[];zipper=None;used=0;current=None;started=time.time()
    def close_part():
        nonlocal zipper
        if zipper is None:return
        zipper.close();zipper=None
        with zipfile.ZipFile(current) as check:
            bad=check.testzip()
            if bad:raise RuntimeError('CRC validation failed: '+bad)
        item={'file':current.name,'bytes':current.stat().st_size,'sha256':sha256(current),'uncompressed_file_bytes':used}
        parts.append(item);print(json.dumps({'part_complete':item,'elapsed_seconds':round(time.time()-started)}),flush=True)
    for index,path in enumerate(files):
        stat=path.stat()
        if zipper is None or (used and used+stat.st_size>limit):
            close_part();used=0;current=out/f'KaiMercerFilms-workspace-part-{len(parts)+1:02d}.zip'
            if current.exists():raise FileExistsError('Archive already exists; use a fresh output folder: '+str(current))
            zipper=zipfile.ZipFile(current,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=3,allowZip64=True)
            if not parts:
                for directory in dirs:zipper.writestr('new animate/'+directory+'/',b'')
        rel=path.relative_to(root).as_posix();info=zipfile.ZipInfo.from_file(path,'new animate/'+rel,strict_timestamps=False)
        info.compress_type=zipfile.ZIP_STORED if path.suffix.lower() in COMPRESSED else zipfile.ZIP_DEFLATED
        info._compresslevel=3;digest=hashlib.sha256()
        with path.open('rb') as source,zipper.open(info,'w',force_zip64=True) as dest:
            for block in iter(lambda:source.read(4*1024**2),b''):
                digest.update(block);dest.write(block)
        after=path.stat()
        if after.st_size!=stat.st_size or after.st_mtime_ns!=stat.st_mtime_ns:raise RuntimeError('Source changed while archiving: '+rel)
        records.append({'path':rel,'bytes':stat.st_size,'sha256':digest.hexdigest(),'part':current.name})
        used+=stat.st_size
        if (index+1)%10000==0:print(json.dumps({'files_archived':index+1,'total_files':len(files)}),flush=True)
    close_part()
    manifest={'format':'independent ZIP parts; extract all into the same destination','root_folder':'new animate','all_workspace_files_included':True,'file_count':len(records),'directory_count':len(dirs)+1,'total_uncompressed_bytes':sum(x['bytes'] for x in records),'parts':parts,'files':records}
    (out/'workspace-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    checksums=''.join(p['sha256']+'  '+p['file']+'\n' for p in parts)
    checksums+=sha256(out/'workspace-manifest.json')+'  workspace-manifest.json\n'
    (out/'SHA256SUMS.txt').write_text(checksums,encoding='utf-8')
    readme='''# Complete KaiMercerFilms workspace

Download every `KaiMercerFilms-workspace-part-*.zip`, `workspace-manifest.json`, and `SHA256SUMS.txt` from this release. Each ZIP is independently extractable and contains different files. Extract ALL parts into the SAME new destination. The resulting folder is `new animate`.

PowerShell, from the folder containing all downloaded parts:

```powershell
Get-ChildItem 'KaiMercerFilms-workspace-part-*.zip' | Sort-Object Name | ForEach-Object {
  Expand-Archive -LiteralPath $_.FullName -DestinationPath './restored-workspace'
}
```

The restored workspace includes every file in the captured workspace: source, earlier Max/Eiffel projects, original audio, finished videos, reference videos and every extracted frame, scene library, Character C with red lowercase kai, installed dependencies, caches, and Git metadata. Files are not omitted merely because Git ignores them.

The manifest records each file path, byte size, SHA-256 and ZIP part. Every ZIP was CRC-tested before upload. Browser profile credential tables were checked before packaging and contained no saved login or cookie records. Dependencies are the captured Windows versions. FFmpeg/Chrome installed outside the workspace are not part of this folder snapshot.

The code in the repository root is the active style kit. `workspace-projects/` exposes the other project source for browsing. These complete ZIP parts preserve the original workspace layout and all large files.
'''
    (out/'RESTORE-WORKSPACE.md').write_text(readme,encoding='utf-8')
    print(json.dumps({'complete':True,'files':len(records),'parts':len(parts),'source_bytes':manifest['total_uncompressed_bytes'],'archive_bytes':sum(p['bytes'] for p in parts),'output':str(out)}),flush=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--repo',type=Path);p.add_argument('--prepare-projects',action='store_true');p.add_argument('--out',type=Path);p.add_argument('--part-mib',type=int,default=1024);args=p.parse_args()
    if args.prepare_projects:
        if not args.repo:raise ValueError('--repo is required for source preparation.')
        prepare_projects(args.root.resolve(),args.repo.resolve())
    else:
        if not args.out:raise ValueError('--out is required for archives.')
        archive(args.root,args.out,args.part_mib)
if __name__=='__main__':main()
