"""Document audio source identity; read-only analysis except manifest output."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sources=[]
for slug in ['animal-dog-bark-25','dog-howl-02']:
    p=ROOT/'audio/sources'/f'{slug}.wav'
    sources.append({'file':f'audio/sources/{slug}.wav','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'page':f'https://sfxmint.com/sounds/{slug}','download':f'https://sfxmint.com/dl/{slug}.wav','license':'CC0 1.0 Universal','licenseURL':'https://sfxmint.com/license','checked':'2026-11-02','type':'AI-generated published library sound','edits':'Leading/trailing silence trimmed, level adjusted, mixed under narration.'})
(ROOT/'audio/source-manifest.json').write_text(json.dumps(sources,indent=2),encoding='utf8')
print('Source manifest saved.')
