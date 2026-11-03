"""Reproduce the four user-requested downloads; no account cookies required."""
from pathlib import Path
import argparse,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[2]
for p in [ROOT/'.tools/pydeps',ROOT.parent/'out/audio/pydeps']:
    if p.exists():sys.path.insert(0,str(p))
from yt_dlp import YoutubeDL
parser=argparse.ArgumentParser();parser.add_argument('--captions',action='store_true');args=parser.parse_args()
sources=json.loads((ROOT/'references/sources.json').read_text())
opts={'outtmpl':str(ROOT/'references/videos/%(id)s.%(ext)s'),'format':'bv*[height<=1920]+ba/b[height<=1920]',
      'merge_output_format':'mp4','noplaylist':True,'writeinfojson':True,'writedescription':True,
      'js_runtimes':{'node':{}},'remote_components':{'ejs:github'},'cachedir':str(ROOT/'.tools/yt-cache'),
      'writesubtitles':args.captions,'writeautomaticsub':args.captions,'subtitleslangs':['en-orig'],
      'subtitlesformat':'vtt','ignoreerrors':True,'noprogress':True}
(ROOT/'references/videos').mkdir(parents=True,exist_ok=True)
with YoutubeDL(opts) as downloader:
    code=downloader.download([v['url'] for v in sources['videos']])
sys.exit(code)

