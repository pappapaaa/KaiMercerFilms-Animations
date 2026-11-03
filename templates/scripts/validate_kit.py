"""Validate kit structure, literal timeline contracts, assets, and study coverage.

python templates/scripts/validate_kit.py
python templates/scripts/validate_kit.py --full-study --out outputs/kit-qa.json
python templates/scripts/validate_kit.py --code-only --root unpacked-code-kit

No TypeScript execution or npm install is needed. Timeline values may be numeric
literals or properties of an imported JSON file. Dynamic TypeScript expressions
are rejected as unverifiable by this validator, rather than evaluated. Full-study
mode additionally needs Pillow to decode every reduced JPEG; optional workspace
dependency directories are discovered. Source hashes are checked only in full mode.
Encoded proof correctness is checked separately by qa_video.py.
"""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import wave

ROOT = Path(__file__).resolve().parents[2]
REFERENCES = {'2GGA4NlMjKc': 1282, 'tN0ra1h3uKo': 978, 'HOjbzw2xqEE': 870, 'XdcSli5STR4': 779}
REQUIRED = ['SKILL.md', 'README.md', 'NOTICE.md', 'LICENSE', 'package.json', 'package-lock.json', 'tsconfig.json',
    'examples/index.tsx', 'examples/Root.tsx', 'references/STYLE_BIBLE.md',
    'references/reports/ANALYSIS_METHOD.md', 'references/reports/MOTION_AND_EDITING.md',
    'references/reports/CHARACTERS.md', 'references/reports/DEPTH_AND_STAGING.md',
    'references/reports/COLOR_AND_LIGHTING.md', 'references/reports/OUTLINES_AND_MATERIALS.md',
    'templates/bridge/Bridge.tsx', 'templates/bridge/Character.ts', 'templates/bridge/characterDrawing.ts',
    'templates/bridge/World.ts', 'templates/bridge/Design.ts', 'templates/bridge/Camera.ts',
    'templates/bridge/Motion.ts', 'templates/bridge/Story.ts', 'templates/bridge/Props.ts',
    'templates/bridge/Paint.ts', 'templates/bridge/Post.tsx',
    'templates/audio/timeline.json', 'templates/audio/mix.py', 'templates/audio/dsp.py',
    'templates/audio/sfx.py', 'templates/audio/instruments.py',
    'templates/scripts/render.mjs', 'templates/scripts/analyze_references.py',
    'templates/scripts/download_references.py', 'templates/scripts/analyze_audio.py',
    'templates/scripts/qa_video.py', 'templates/scripts/validate_kit.py', 'templates/scripts/requirements.txt',
    'templates/scripts/render-character.mjs', 'templates/characters/MainCharacter.ts',
    'templates/characters/mainCharacterDrawing.ts', 'episodes/main-character/index.tsx',
    'episodes/main-character/Showcase.tsx', 'characters/main/identity.json',
    'characters/main/CHARACTER_BIBLE.md', 'characters/main/concept.png', 'characters/main/model-sheet-v2.png']


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def digest(path: Path) -> str:
    result = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def finite(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def integer(value) -> bool:
    return finite(value) and value == int(value)


def array_literal(source: str, name: str) -> str | None:
    found = re.search(r'\b' + re.escape(name) + r'\b[^=;\n]*=\s*\[', source)
    if not found:
        return None
    start, depth, quote, escaped = found.end() - 1, 0, None, False
    for index in range(start, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == quote:
                quote = None
        elif char in "'\"`":
            quote = char
        elif char == '[':
            depth += 1
        elif char == ']':
            depth -= 1
            if not depth:
                return source[start:index + 1]
    raise ValueError(f'Unclosed literal array {name}')


def simple_objects(literal: str) -> list[dict]:
    """Read the flat data objects used by Story.ts; never execute code."""
    result = []
    pattern = r"(\w+)\s*:\s*(?:'([^']*)'|\"([^\"]*)\"|(-?(?:\d+(?:\.\d*)?|\.\d+)))"
    for body in re.findall(r'\{([^{}]*)\}', literal, flags=re.S):
        item = {}
        for match in re.finditer(pattern, body):
            key, single, double, numeric = match.groups()
            item[key] = float(numeric) if numeric is not None else single if single is not None else double
        result.append(item)
    return result


def resolve_value(expression: str, bindings: dict):
    expression = expression.strip()
    if re.fullmatch(r'-?(?:\d+(?:\.\d*)?|\.\d+)', expression):
        return float(expression)
    parts = expression.split('.')
    if all(re.fullmatch(r'[A-Za-z_$][\w$]*', part) for part in parts) and parts[0] in bindings:
        value = bindings[parts[0]]
        for part in parts[1:]:
            value = value[part]
        return value
    raise ValueError(f'Cannot statically verify expression {expression!r}; use a numeric literal or imported JSON property.')


def exported_value(source: str, name: str, bindings: dict):
    match = re.search(r'\b' + re.escape(name) + r'\s*=\s*([^,;\n]+)', source)
    if not match:
        raise ValueError(f'Missing assignment for {name}')
    return resolve_value(match.group(1), bindings)


class Validator:
    def __init__(self, args):
        self.args, self.root = args, args.root.resolve()
        self.report = {'tool': 'validate_kit.py', 'version': '1.0.0', 'root': str(self.root),
            'mode': 'code-only' if args.code_only else 'full-study' if args.full_study else 'standard',
            'created_utc': datetime.now(timezone.utc).isoformat(), 'checks': [], 'warnings': []}

    def check(self, name, passed, details=None):
        self.report['checks'].append({'name': name, 'passed': bool(passed), 'details': details})

    def section(self, name, function):
        try:
            function()
        except (OSError, ValueError, KeyError, TypeError, IndexError, wave.Error) as error:
            self.check(name, False, {'error': str(error), 'type': type(error).__name__})

    def structure(self):
        missing = [path for path in REQUIRED if not (self.root / path).is_file() or (self.root / path).stat().st_size == 0]
        self.check('required_source_structure', not missing, {'required_files': len(REQUIRED), 'missing_or_empty': missing})
        package = read_json(self.root / 'package.json')
        expected_commands = ('studio', 'typecheck', 'stills', 'render', 'render:preview')
        self.check('package_commands', all(package.get('scripts', {}).get(k) for k in expected_commands), list(expected_commands))
        dependencies = package.get('dependencies', {})
        remotion_versions = {k: v for k, v in dependencies.items() if k == 'remotion' or k.startswith('@remotion/')}
        self.check('remotion_versions_match', bool(remotion_versions) and len(set(remotion_versions.values())) == 1, remotion_versions)
        lock = read_json(self.root / 'package-lock.json')
        locked_dependencies = lock.get('packages', {}).get('', {}).get('dependencies', {})
        self.check('lockfile_matches_dependencies', dependencies == locked_dependencies, {'manifest_dependencies': len(dependencies)})
        unresolved = []
        files = list((self.root / 'examples').glob('*.tsx')) + list((self.root / 'templates/bridge').glob('*.ts*'))
        files += list((self.root / 'templates/characters').glob('*.ts*')) + list((self.root / 'episodes').rglob('*.ts*'))
        for file in files:
            for target in re.findall(r'''(?:from\s*|import\s*)['"](\.[^'"]+)['"]''', file.read_text(encoding='utf-8')):
                candidate = file.parent / target
                possibilities = [candidate, Path(str(candidate) + '.ts'), Path(str(candidate) + '.tsx'),
                                 Path(str(candidate) + '.json'), candidate / 'index.ts', candidate / 'index.tsx']
                if not any(path.is_file() for path in possibilities):
                    unresolved.append({'file': str(file.relative_to(self.root)), 'import': target})
        self.check('local_source_imports_resolve', not unresolved, {'source_files': len(files), 'unresolved': unresolved})
        identity = read_json(self.root / 'characters/main/identity.json')
        identity_paths = ('concept', 'model_sheet', 'bible', 'rig', 'drawing_module')
        missing_identity = [identity.get(k) for k in identity_paths if not isinstance(identity.get(k), str) or not (self.root / identity[k]).is_file()]
        self.check('selected_character_assets_resolve', identity.get('selected_by_user') is True and identity.get('selected_option') == 'C' and not missing_identity,
                   {'selected_option': identity.get('selected_option'), 'missing_assets': missing_identity})

    def timeline(self):
        story_path = self.root / 'templates/bridge/Story.ts'
        story = story_path.read_text(encoding='utf-8')
        bindings = {}
        for name, path in re.findall(r'''import\s+(\w+)\s+from\s*['"]([^'"]+\.json)['"]''', story):
            bindings[name] = read_json(story_path.parent / path)
        constants = {name: exported_value(story, name, bindings) for name in ('FPS', 'WIDTH', 'HEIGHT', 'DURATION')}
        valid = all(finite(value) and value > 0 for value in constants.values()) and all(integer(constants[k]) for k in ('WIDTH', 'HEIGHT', 'DURATION'))
        self.check('story_constants_valid', valid, constants)
        if not valid:
            return
        fps, frames = constants['FPS'], int(constants['DURATION'])
        shot_literal = array_literal(story, 'SHOTS')
        if shot_literal is None:
            raise ValueError('SHOTS must be a literal array of {id,a,b,...} intervals for static validation.')
        shots = simple_objects(shot_literal)
        problems, previous, ids = [], 0, set()
        for index, shot in enumerate(shots):
            if not isinstance(shot.get('id'), str) or shot['id'] in ids:
                problems.append(f'shot {index}: missing or duplicate id')
            ids.add(shot.get('id'))
            a, b = shot.get('a'), shot.get('b')
            if not integer(a) or not integer(b) or a != previous or not a < b <= frames:
                problems.append(f'shot {index}: invalid/gapped/overlapping range {a}–{b}; expected start {previous}')
            previous = b
        if not shots or previous != frames:
            problems.append(f'shots end at {previous}, expected {frames}')
        self.check('shots_cover_timeline_once', not problems, {'shots': shots, 'problems': problems})
        audio_plan = read_json(self.root / 'templates/audio/timeline.json')
        self.check('picture_audio_timeline_matches', audio_plan.get('fps') == fps and audio_plan.get('frames') == frames,
                   {'picture': {'fps': fps, 'frames': frames}, 'audio': {k: audio_plan.get(k) for k in ('fps', 'frames', 'sampleRate')}})
        cues = audio_plan.get('cues', [])
        bad_cues = [cue for cue in cues if not integer(cue.get('frame')) or not 0 <= cue['frame'] < frames or
                    not isinstance(cue.get('type'), str) or not finite(cue.get('gain', 1)) or cue.get('gain', 1) < 0]
        self.check('audio_cues_inside_timeline', not bad_cues, {'count': len(cues), 'invalid': bad_cues})
        cue_literal = array_literal(story, 'SOUND_CUES')
        story_cues = simple_objects(cue_literal) if cue_literal is not None else exported_value(story, 'SOUND_CUES', bindings)
        def canonical(entries):
            return sorted((e['frame'], e['type'], e.get('gain', 1)) for e in entries)
        self.check('story_audio_cues_match', canonical(story_cues) == canonical(cues), {'story_cues': story_cues, 'audio_cues': cues})
        root_tsx = (self.root / 'examples/Root.tsx').read_text(encoding='utf-8')
        compositions, composition_problems = [], []
        for tag in re.findall(r'<Composition\b[^>]*?/>', root_tsx, flags=re.S):
            name_match = re.search(r'''\bid\s*=\s*['"]([^'"]+)['"]''', tag)
            if not name_match:
                composition_problems.append('Composition without a literal id')
                continue
            composition = {'id': name_match.group(1)}
            for prop, expected in [('width', 'WIDTH'), ('height', 'HEIGHT'), ('fps', 'FPS'), ('durationInFrames', 'DURATION')]:
                expression = re.search(r'\b' + prop + r'\s*=\s*\{([^{}]+)\}', tag)
                value = resolve_value(expression.group(1), constants) if expression else None
                composition[prop] = value
                if value != constants[expected]:
                    composition_problems.append(f'{composition["id"]}.{prop}={value}, expected {constants[expected]}')
            component = re.search(r'\bcomponent\s*=\s*\{(\w+)\}', tag)
            composition['component'] = component.group(1) if component else None
            if not component:
                composition_problems.append(f'{composition["id"]}: component not statically readable')
            compositions.append(composition)
        names = [item['id'] for item in compositions]
        if not names or len(set(names)) != len(names):
            composition_problems.append('No registered compositions or duplicate IDs')
        renderer = (self.root / 'templates/scripts/render.mjs').read_text(encoding='utf-8')
        default_match = re.search(r'''id\s*:\s*process\.env\.COMP\s*\|\|\s*['"]([^'"]+)['"]''', renderer)
        default_id = default_match.group(1) if default_match else None
        if default_id not in names:
            composition_problems.append(f'Renderer default {default_id!r} is not registered')
        bridge = (self.root / 'templates/bridge/Bridge.tsx').read_text(encoding='utf-8')
        for item in compositions:
            if not re.search(r'export\s+(?:const|function|class)\s+' + re.escape(item['component'] or '__missing__') + r'\b', bridge):
                composition_problems.append(f'{item["id"]}: component export not found in Bridge.tsx')
        self.check('registered_proof_matches_timeline', not composition_problems,
                   {'compositions': compositions, 'renderer_default': default_id, 'problems': composition_problems})
        assets = set(re.findall(r'''\baudio\s*:\s*['"]([^'"]+)['"]''', root_tsx))
        for file in [self.root / 'examples/Root.tsx', *list((self.root / 'templates/bridge').glob('*.ts*'))]:
            assets.update(re.findall(r'''staticFile\(\s*['"]([^'"]+)['"]\s*\)''', file.read_text(encoding='utf-8')))
        for asset in sorted(assets):
            path = (self.root / 'public' / asset).resolve()
            if not path.is_relative_to((self.root / 'public').resolve()):
                self.check('public_asset_path', False, asset)
                continue
            exists = path.is_file() and path.stat().st_size > 0
            self.check(f'public_asset:{asset}', exists, {'bytes': path.stat().st_size if exists else 0})
            if exists and path.suffix.lower() == '.wav':
                with wave.open(str(path), 'rb') as wav:
                    samples, sample_rate, channels = wav.getnframes(), wav.getframerate(), wav.getnchannels()
                expected_samples = round(frames / fps * audio_plan['sampleRate'])
                self.check(f'public_audio_duration:{asset}', samples == expected_samples and sample_rate == audio_plan['sampleRate'] and channels > 0,
                           {'samples': samples, 'expected_samples': expected_samples, 'sample_rate': sample_rate, 'channels': channels})
        self.report['registered_proof'] = {'fps': fps, 'frames': frames, 'width': constants['WIDTH'], 'height': constants['HEIGHT'],
                                          'duration_seconds': frames / fps, 'public_assets': sorted(assets)}

    def study(self):
        manifest = read_json(self.root / 'references/data/analysis_manifest.json')
        total_frames, total_sheets, summaries = 0, 0, {}
        manifest_videos = {s['id']: s for s in manifest.get('videos', [])}
        self.check('study_manifest_has_four_sources', set(REFERENCES).issubset(manifest_videos), list(manifest_videos))
        for video_id, expected_frames in REFERENCES.items():
            summary = read_json(self.root / 'references/data' / video_id / 'summary.json')
            summaries[video_id] = summary
            expected_sheets = math.ceil(expected_frames / 60)
            properties = {key: summary.get(key) for key in ('complete', 'decoded_frames', 'ffprobe_frame_count', 'all_frame_jpegs', 'dense_sheet_cells', 'dense_sheet_count', 'native_pts_preserved')}
            good = summary.get('complete') is True and summary.get('native_pts_preserved') is True and all(
                summary.get(k) == expected_frames for k in ('decoded_frames', 'ffprobe_frame_count', 'all_frame_jpegs', 'dense_sheet_cells')) and summary.get('dense_sheet_count') == expected_sheets
            self.check(f'study_summary:{video_id}', good, properties)
            sheet_dir = self.root / 'references/sheets' / video_id
            actual_names = {p.name for p in sheet_dir.glob('dense_*.jpg')}
            expected_names = {f'dense_{n:04d}.jpg' for n in range(expected_sheets)}
            empty = [name for name in actual_names if (sheet_dir / name).stat().st_size == 0]
            self.check(f'dense_sheets:{video_id}', actual_names == expected_names and not empty,
                       {'actual_count': len(actual_names), 'expected_count': expected_sheets,
                        'missing': sorted(expected_names - actual_names), 'extra': sorted(actual_names - expected_names), 'empty': empty})
            manifest_summary = manifest_videos.get(video_id, {})
            self.check(f'manifest_summary_consistency:{video_id}', all(manifest_summary.get(k) == summary.get(k) for k in
                ('sha256', 'decoded_frames', 'dense_sheet_count', 'native_dimensions', 'analysis_version')),
                {'sha256': summary.get('sha256')})
            native = summary.get('native_keyframe_paths', [])
            self.check(f'native_samples_present:{video_id}', len(native) == summary.get('native_keyframe_count') and all((self.root / p).is_file() for p in native), {'listed': len(native)})
            total_frames += summary.get('decoded_frames', 0)
            total_sheets += len(actual_names)
        self.check('study_total_coverage', total_frames == 3909 and total_sheets == 67 and
                   manifest.get('total_decoded_frames') == 3909 and manifest.get('total_dense_sheets') == 67,
                   {'frames': total_frames, 'dense_sheets': total_sheets, 'expected_frames': 3909, 'expected_sheets': 67})
        self.report['study_coverage'] = {'frames': total_frames, 'dense_sheets': total_sheets}
        if self.args.full_study:
            self.full_study(summaries)

    def full_study(self, summaries):
        for dep in [self.root.parent / 'out/audio/pydeps', self.root / '.tools/pydeps']:
            if dep.exists():
                sys.path.insert(0, str(dep))
        try:
            from PIL import Image
        except ImportError:
            self.check('full_study_image_decoder', False, 'Install Pillow: python -m pip install Pillow')
            return
        for video_id, expected_frames in REFERENCES.items():
            summary = summaries[video_id]
            video = self.root / 'references/videos' / f'{video_id}.mp4'
            actual_hash = digest(video) if video.is_file() else None
            self.check(f'source_hash:{video_id}', actual_hash == summary.get('sha256'),
                       {'actual': actual_hash, 'expected': summary.get('sha256')})
            data_dir = self.root / 'references/data' / video_id
            timing = read_json(data_dir / 'frame_timestamps.json')
            problems, seen, previous_pts = [], [], None
            with (data_dir / 'frames.csv').open(newline='', encoding='utf-8-sig') as source:
                reader = csv.DictReader(source)
                required_columns = {'frame', 'pts_seconds', 'duration_seconds', 'luma_mean', 'saturation_mean', 'rgb_delta_mae', 'near_static_transition'}
                if not required_columns.issubset(reader.fieldnames or []):
                    problems.append('Missing required CSV columns')
                for expected_index, row in enumerate(reader):
                    try:
                        index, pts = int(row['frame']), float(row['pts_seconds'])
                        seen.append(index)
                        if index != expected_index or not math.isfinite(pts) or (previous_pts is not None and pts <= previous_pts):
                            problems.append(f'Invalid index or timestamp at row {expected_index}')
                        if expected_index >= len(timing) or abs(pts - float(timing[expected_index]['best_effort_timestamp_time'])) > .000001:
                            problems.append(f'CSV/FFprobe timestamp mismatch at row {expected_index}')
                        if any(not math.isfinite(float(value)) for value in row.values()):
                            problems.append(f'Non-finite metric at row {expected_index}')
                        previous_pts = pts
                    except (ValueError, TypeError, KeyError) as error:
                        problems.append(f'Row {expected_index}: {error}')
            self.check(f'indexed_csv_and_pts:{video_id}', seen == list(range(expected_frames)) and len(timing) == expected_frames and not problems,
                       {'rows': len(seen), 'ffprobe_rows': len(timing), 'problems': problems[:20], 'problem_count': len(problems)})
            frame_dir = self.root / 'references/frames' / video_id / 'all'
            expected_names = {f'f{n:06d}.jpg' for n in range(expected_frames)}
            actual_names = {p.name for p in frame_dir.glob('*.jpg')}
            image_errors = []
            expected_size = (summary['analysis_width'], summary['analysis_height'])
            for name in sorted(actual_names & expected_names):
                try:
                    with Image.open(frame_dir / name) as image:
                        if image.format != 'JPEG' or image.size != expected_size:
                            image_errors.append(f'{name}: format/size {image.format} {image.size}')
                        image.load()
                except (OSError, ValueError) as error:
                    image_errors.append(f'{name}: {error}')
            self.check(f'all_frame_jpegs_decode:{video_id}', expected_names == actual_names and not image_errors,
                       {'decoded_images': len(actual_names & expected_names), 'expected_images': expected_frames,
                        'missing': sorted(expected_names - actual_names)[:20], 'extra': sorted(actual_names - expected_names)[:20],
                        'image_errors': image_errors[:20], 'image_error_count': len(image_errors)})

    def run(self):
        self.section('structure', self.structure)
        self.section('timeline_and_assets', self.timeline)
        if self.args.code_only:
            self.report['warnings'].append('Reference videos, data, frame archives, native samples, and dense sheets intentionally not required in code-only mode.')
        else:
            self.section('study', self.study)
        self.report['warnings'].append('This validator does not run TypeScript type checking or judge artistic fidelity. Run npm run typecheck and qa_video.py on the encoded proof.')
        self.report['passed'] = all(item['passed'] for item in self.report['checks'])
        self.report['checks_passed'] = sum(item['passed'] for item in self.report['checks'])
        self.report['checks_total'] = len(self.report['checks'])
        return self.report


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--root', type=Path, default=ROOT, help='Kit folder, including an extracted source-only ZIP.')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--full-study', action='store_true', help='Also decode all JPEGs, validate every indexed CSV row/timestamp, and hash the four MP4s.')
    mode.add_argument('--code-only', action='store_true', help='Allow absent reference data and media; still validate source, timeline, and runtime assets.')
    parser.add_argument('--out', type=Path, help='Optional JSON report path; JSON is always printed to stdout.')
    args = parser.parse_args()
    report = Validator(args).run()
    rendered = json.dumps(report, indent=2, allow_nan=False)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(rendered + '\n', encoding='utf-8')
    print(rendered)
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
