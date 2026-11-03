"""Decode and validate a rendered video; held/black intervals are advisory.

python templates/scripts/qa_video.py outputs/style-proof-2K.mp4 --frames 288 \
    --fps 24 --width 1440 --height 2560 --require-audio --out outputs/qa.json

Requires Python's standard library and FFmpeg/FFprobe on PATH. No NumPy/Pillow
installation is needed. Checks encoded media, not artistic quality or lip sync.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from fractions import Fraction


def number(value):
    try:
        result = float(Fraction(str(value)))
        return result if math.isfinite(result) else None
    except (ValueError, TypeError, ZeroDivisionError):
        return None


def probe(path: Path) -> dict:
    command = ['ffprobe', '-v', 'error', '-count_frames', '-show_streams',
               '-show_format', '-of', 'json', str(path)]
    return json.loads(subprocess.run(command, check=True, capture_output=True,
                                     text=True, encoding='utf-8').stdout)


def frame_timing(path: Path) -> list[dict]:
    command = ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_frames',
               '-show_entries', 'frame=best_effort_timestamp_time,duration_time,pkt_duration_time',
               '-of', 'json', str(path)]
    result = subprocess.run(command, check=True, capture_output=True, text=True, encoding='utf-8')
    return json.loads(result.stdout).get('frames', [])


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def read_frame(stream, length: int) -> bytes:
    chunks, remaining = [], length
    while remaining:
        block = stream.read(remaining)
        if not block:
            break
        chunks.append(block)
        remaining -= len(block)
    return b''.join(chunks)


def decode_metrics(path: Path, width: int, height: int, has_audio: bool) -> dict:
    """One FFmpeg pass fully decodes video, and all audio streams if present."""
    measure_w, measure_h = 64, max(2, round(64 * height / width))
    command = ['ffmpeg', '-v', 'error', '-xerror', '-y', '-i', str(path),
               '-map', '0:v:0', '-an', '-vf', f'scale={measure_w}:{measure_h}:flags=area',
               '-pix_fmt', 'gray', '-fps_mode', 'passthrough', '-f', 'rawvideo', 'pipe:1']
    if has_audio:
        command.extend(['-map', '0:a', '-vn', '-f', 'null', os.devnull])
    gray_bytes = measure_w * measure_h
    static_flags, black_flags, luma_means = [], [], []
    previous = None
    truncated = False
    with tempfile.TemporaryFile() as errors:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=errors)
        try:
            while True:
                frame = read_frame(process.stdout, gray_bytes)
                if not frame:
                    break
                if len(frame) != gray_bytes:
                    truncated = True
                    break
                mean = sum(frame) / gray_bytes
                changed = sum(abs(a - b) for a, b in zip(frame, previous)) / gray_bytes if previous is not None else None
                static_flags.append(changed is not None and changed <= .35)
                black_flags.append(mean <= 5 and sum(value > 16 for value in frame) / gray_bytes <= .01)
                luma_means.append(mean)
                previous = frame
        finally:
            process.stdout.close()
            return_code = process.wait()
        errors.seek(0)
        stderr = errors.read().decode('utf-8', errors='replace').strip()
    return {'return_code': return_code, 'errors': stderr, 'truncated_raw_frame': truncated,
            'decoded_frames': len(static_flags), 'measurement_dimensions': [measure_w, measure_h],
            'static_flags': static_flags, 'black_flags': black_flags,
            'mean_luma_8bit': sum(luma_means) / len(luma_means) if luma_means else None}


def intervals(flags: list[bool], timing: list[dict], fps: float,
              transition_flags: bool, minimum_frames: int) -> list[dict]:
    result, start = [], None
    def timestamp(index):
        value = number(timing[index].get('best_effort_timestamp_time')) if index < len(timing) else None
        return value if value is not None else index / fps
    def append(end):
        count = end - start + 1
        if count >= minimum_frames:
            duration = number(timing[end].get('duration_time') or timing[end].get('pkt_duration_time')) if end < len(timing) else None
            first, last = timestamp(start), timestamp(end)
            result.append({'first_frame': start, 'last_frame_inclusive': end, 'frames': count,
                           'start_seconds': first, 'end_exclusive_seconds': last + (duration or 1 / fps),
                           'exposure_seconds': last + (duration or 1 / fps) - first})
    for index, active in enumerate(flags):
        if active and start is None:
            start = max(0, index - 1) if transition_flags else index
        if not active and start is not None:
            append(index - 1)
            start = None
    if start is not None:
        append(len(flags) - 1)
    return result


def positive_int(value):
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError('must be positive')
    return parsed


def positive_float(value):
    parsed = float(value)
    if not math.isfinite(parsed) or parsed <= 0:
        raise argparse.ArgumentTypeError('must be finite and positive')
    return parsed


def run(args) -> dict:
    path = args.input.resolve()
    report = {'tool': 'qa_video.py', 'version': '1.0.0', 'input': str(path),
              'created_utc': datetime.now(timezone.utc).isoformat(), 'checks': [], 'warnings': []}
    def check(name, passed, actual=None, expected=None):
        report['checks'].append({'name': name, 'passed': bool(passed), 'actual': actual, 'expected': expected})
    if not path.is_file():
        check('input_exists', False, str(path), 'existing video file')
        report['passed'] = False
        return report
    for executable in ('ffmpeg', 'ffprobe'):
        if not shutil.which(executable):
            check(f'{executable}_available', False, None, 'executable on PATH')
            report['passed'] = False
            return report
    metadata = probe(path)
    videos = [s for s in metadata.get('streams', []) if s.get('codec_type') == 'video']
    audio = [s for s in metadata.get('streams', []) if s.get('codec_type') == 'audio']
    check('video_stream_present', bool(videos), len(videos), 'at least 1')
    if not videos:
        report['passed'] = False
        return report
    video = videos[0]
    width, height = video['width'], video['height']
    fps = number(video.get('avg_frame_rate')) or number(video.get('r_frame_rate')) or args.fps or 24
    sar_text = video.get('sample_aspect_ratio', '1:1')
    sar = number(sar_text.replace(':', '/')) or 1
    rotation = next((number(d.get('rotation')) for d in video.get('side_data_list', []) if 'rotation' in d), 0) or 0
    if abs(rotation) % 180 > .01:
        width, height, sar = height, width, 1 / sar
    actual_aspect = width * sar / height
    timing = frame_timing(path)
    decoded = decode_metrics(path, width, height, bool(audio))
    frame_count = decoded['decoded_frames']
    duration = number(video.get('duration'))
    if duration is None and timing:
        first = number(timing[0].get('best_effort_timestamp_time')) or 0
        last = number(timing[-1].get('best_effort_timestamp_time'))
        last_duration = number(timing[-1].get('duration_time') or timing[-1].get('pkt_duration_time')) or 1 / fps
        duration = (last - first + last_duration) if last is not None else frame_count / fps
    report['media'] = {'sha256': sha256(path), 'bytes': path.stat().st_size,
                       'display_width': width, 'display_height': height, 'sample_aspect_ratio': sar,
                       'display_aspect_ratio': actual_aspect, 'rotation_degrees': rotation,
                       'average_fps': fps, 'video_duration_seconds': duration,
                       'container_duration_seconds': number(metadata.get('format', {}).get('duration')),
                       'decoded_frames': frame_count, 'ffprobe_frames': len(timing),
                       'video_codec': video.get('codec_name'), 'pixel_format': video.get('pix_fmt'),
                       'audio_streams': [{k: s.get(k) for k in ('index', 'codec_name', 'sample_rate', 'channels', 'duration')} for s in audio]}
    check('full_ffmpeg_decode', decoded['return_code'] == 0 and not decoded['truncated_raw_frame'],
          {'return_code': decoded['return_code'], 'truncated_frame': decoded['truncated_raw_frame'], 'stderr': decoded['errors']},
          'no decode errors; all video and audio streams decoded')
    check('nonempty_video', frame_count > 0, frame_count, '> 0')
    check('decoded_matches_ffprobe', frame_count == len(timing), frame_count, len(timing))
    reported_count = number(video.get('nb_read_frames'))
    if reported_count is not None:
        check('decoded_matches_stream_count', frame_count == reported_count, frame_count, reported_count)
    pts = [number(f.get('best_effort_timestamp_time')) for f in timing]
    check('timestamps_complete_increasing', bool(pts) and all(t is not None for t in pts) and
          all(b > a for a, b in zip(pts, pts[1:]) if a is not None and b is not None),
          {'timestamps': len(pts)}, 'one strictly increasing presentation timestamp per frame')
    if args.frames is not None:
        check('expected_frames', frame_count == args.frames, frame_count, args.frames)
    if args.fps is not None:
        check('expected_fps', abs(fps - args.fps) <= .01, fps, args.fps)
    if args.width is not None:
        check('expected_width', width == args.width, width, args.width)
    if args.height is not None:
        check('expected_height', height == args.height, height, args.height)
    if args.width is not None and args.height is not None:
        expected_aspect = args.width / args.height
        check('expected_display_aspect', abs(actual_aspect - expected_aspect) <= .001,
              actual_aspect, expected_aspect)
    target_frames, target_fps = args.frames or frame_count, args.fps or fps
    expected_duration = target_frames / target_fps
    tolerance = max(1 / target_fps, .02)
    check('video_duration_matches_frames', duration is not None and abs(duration - expected_duration) <= tolerance,
          duration, {'seconds': expected_duration, 'tolerance_seconds': tolerance})
    if args.require_audio:
        check('required_audio', bool(audio), len(audio), 'at least 1 decodable audio stream')
    if audio:
        check('audio_stream_parameters', all((number(s.get('sample_rate')) or 0) > 0 and s.get('channels', 0) > 0 for s in audio),
              [{'sample_rate': s.get('sample_rate'), 'channels': s.get('channels')} for s in audio], 'positive sample rate and channels')
    held = intervals(decoded['static_flags'], timing, fps, True, max(2, math.ceil(fps * .5)))
    black = intervals(decoded['black_flags'], timing, fps, False, 1)
    report['advisories'] = {'measurement_dimensions': decoded['measurement_dimensions'],
        'held_intervals': held, 'black_intervals': black,
        'near_static_transition_percent': 100 * sum(decoded['static_flags']) / max(frame_count - 1, 1),
        'mean_luma_8bit': decoded['mean_luma_8bit'],
        'interpretation': 'Held drawings, reaction pauses, black cards, and fades can be intentional. These intervals never fail QA on their own.',
        'method': 'Full-frame grayscale at 64-pixel width; held adjacent mean difference <=0.35 for >=0.5s; black mean <=5 with <=1% pixels above16. These are image heuristics, not exact production exposure sheets.'}
    if held:
        report['warnings'].append(f'{len(held)} near-static intervals of at least 0.5s: review against intended holds.')
    if black:
        report['warnings'].append(f'{len(black)} black/near-black intervals: review against intended cards and fades.')
    report['passed'] = all(c['passed'] for c in report['checks'])
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('input', type=Path)
    parser.add_argument('--frames', type=positive_int)
    parser.add_argument('--fps', type=positive_float)
    parser.add_argument('--width', type=positive_int)
    parser.add_argument('--height', type=positive_int)
    parser.add_argument('--require-audio', action='store_true')
    parser.add_argument('--out', type=Path, help='Optional JSON report path; JSON is always printed to stdout.')
    args = parser.parse_args()
    try:
        report = run(args)
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        report = {'tool': 'qa_video.py', 'input': str(args.input), 'passed': False,
                  'error': str(error), 'error_type': type(error).__name__}
        if isinstance(error, subprocess.CalledProcessError):
            report['stderr'] = error.stderr
    rendered = json.dumps(report, indent=2, allow_nan=False)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(rendered + '\n', encoding='utf-8')
    print(rendered)
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
