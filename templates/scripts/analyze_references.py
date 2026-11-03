"""Exhaustive native-frame reference study, with reproducible visual evidence.

Every decoded input frame has one CSV row, one indexed JPEG, and one dense-sheet
cell. No fps filter, interpolation, frame skipping, or motion smoothing is used.
Images are reduced for measurement/storage; curated PNGs retain native resolution.
Run from any directory: python templates/scripts/analyze_references.py [VIDEO_ID ...]
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# Optional workspace-local installations; ordinary installed dependencies also work.
for dep in [ROOT.parent / 'out/audio/pydeps', ROOT / '.tools/pydeps']:
    if dep.exists():
        sys.path.insert(0, str(dep))
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

VERSION = '1.0.0'
IDS = ['2GGA4NlMjKc', 'tN0ra1h3uKo', 'HOjbzw2xqEE', 'XdcSli5STR4']


def invoke(args: list[str]) -> str:
    return subprocess.run(args, check=True, capture_output=True, text=True, encoding='utf-8').stdout


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def font(size: int):
    for name in ['C:/Windows/Fonts/arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def make_sheet(images, dest: Path, title: str, cols=10, rows=6, cell_w=126) -> None:
    cell_h = round(cell_w * 16 / 9)
    label_h, header_h = 22, 36
    sheet = Image.new('RGB', (cols * cell_w, rows * (cell_h + label_h) + header_h), '#172033')
    draw = ImageDraw.Draw(sheet)
    draw.text((8, 9), title, font=font(16), fill='white')
    for j, (frame_index, time, im) in enumerate(images):
        x, y = j % cols * cell_w, j // cols * (cell_h + label_h) + header_h
        frame = im.copy()
        frame.thumbnail((cell_w, cell_h), Image.Resampling.LANCZOS)
        sheet.paste(frame, (x + (cell_w - frame.width) // 2, y + (cell_h - frame.height) // 2))
        draw.text((x + 3, y + cell_h + 3), f'f{frame_index:05d}  {time:.3f}s', font=font(11), fill='#f7e6aa')
    sheet.save(dest, quality=90, subsampling=0)


def percentile(values, q):
    return float(np.percentile(np.asarray(values, dtype=float), q)) if len(values) else 0.0


def spans_from_flags(flags: list[bool], pts: list[float]) -> list[dict]:
    """A flagged transition i connects frame i-1 to frame i."""
    spans, start = [], None
    for i in range(1, len(flags)):
        if flags[i] and start is None:
            start = i - 1
        if start is not None and (not flags[i] or i == len(flags) - 1):
            end = i if flags[i] else i - 1
            if end > start:
                spans.append({'start_frame': start, 'end_frame_inclusive': end,
                              'frames': end - start + 1, 'start_time': pts[start],
                              'end_time': pts[end], 'elapsed_seconds': pts[end] - pts[start]})
            start = None
    return spans


def native_keyframes(video: Path, indices: list[int], target: Path) -> list[str]:
    target.mkdir(exist_ok=True, parents=True)
    select = 'select=' + '+'.join(f'eq(n\\,{i})' for i in indices)
    temp_pattern = target / '_extract_%04d.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-an', '-vf', select,
                    '-fps_mode', 'passthrough', '-start_number', '0', str(temp_pattern)], check=True)
    names = []
    for j, idx in enumerate(indices):
        source = target / f'_extract_{j:04d}.png'
        dest = target / f'f{idx:06d}.png'
        if not source.exists():
            raise RuntimeError(f'Missing native extraction: {source}')
        source.replace(dest)
        names.append(str(dest.relative_to(ROOT)).replace('\\', '/'))
    return names


def analyze(video_id: str, args) -> dict:
    video = ROOT / 'references/videos' / f'{video_id}.mp4'
    if not video.exists():
        raise FileNotFoundError(video)
    data_dir = ROOT / 'references/data' / video_id
    frame_dir = ROOT / 'references/frames' / video_id / 'all'
    sheet_dir = ROOT / 'references/sheets' / video_id
    for folder in [data_dir, frame_dir, sheet_dir]:
        folder.mkdir(parents=True, exist_ok=True)
    source_hash = sha256(video)
    summary_path = data_dir / 'summary.json'
    if summary_path.exists() and not args.force:
        prior = json.loads(summary_path.read_text(encoding='utf-8'))
        if prior.get('complete') and prior.get('analysis_version') == VERSION and prior.get('sha256') == source_hash and prior.get('analysis_width') == args.frame_width and prior.get('jpeg_quality') == args.jpeg_quality and prior.get('flow_enabled') == (not args.no_flow):
            print(f'{video_id}: existing complete analysis matches source; skipped.', flush=True)
            return prior

    probe = json.loads(invoke(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
    stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    audio = [s for s in probe['streams'] if s['codec_type'] == 'audio']
    timing = json.loads(invoke(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_frames',
                               '-show_entries', 'frame=best_effort_timestamp_time,pkt_duration_time,duration_time,pict_type,key_frame',
                               '-of', 'json', str(video)]))['frames']
    pts = [float(f['best_effort_timestamp_time']) for f in timing]
    if not pts or any(b < a for a, b in zip(pts, pts[1:])):
        raise RuntimeError('Missing or nonmonotonic decoded presentation timestamps')
    source_w, source_h = int(stream['width']), int(stream['height'])
    w = args.frame_width
    h = max(2, 2 * round(source_h / source_w * w / 2))
    flow_w = 108
    flow_h = max(2, round(source_h / source_w * flow_w))
    source_fps = stream.get('avg_frame_rate', stream.get('r_frame_rate'))
    num, den = map(float, source_fps.split('/'))
    fps = num / den
    write_json(data_dir / 'probe.json', probe)
    write_json(data_dir / 'frame_timestamps.json', timing)

    command = ['ffmpeg', '-v', 'error', '-i', str(video), '-map', '0:v:0', '-an',
               '-vf', f'scale={w}:{h}:flags=area', '-fps_mode', 'passthrough',
               '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    pipe = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    rows, dense, overview = [], [], []
    page, next_overview_time = 0, pts[0]
    last_rgb = last_gray = last_hist = None
    quant_counts = np.zeros(512, dtype=np.int64)
    quant_rgb_sums = np.zeros((512, 3), dtype=np.int64)
    frame_size = w * h * 3
    idx = 0
    while True:
        raw = pipe.stdout.read(frame_size)
        if not raw:
            break
        if len(raw) != frame_size or idx >= len(pts):
            raise RuntimeError(f'Decode/timestamp alignment failed at {idx}: {len(raw)} bytes')
        rgb = np.frombuffer(raw, dtype=np.uint8).reshape(h, w, 3)
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        small = cv2.resize(gray, (flow_w, flow_h), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        hist = cv2.calcHist([hsv], [0, 1], None, [24, 16], [0, 180, 0, 256])
        hist = cv2.normalize(hist, hist).reshape(-1)
        delta_mae = changed_fraction = hist_distance = dx = dy = flow_median = flow_p90 = 0.0
        if last_rgb is not None:
            absolute = np.abs(rgb.astype(np.int16) - last_rgb.astype(np.int16))
            delta_mae = float(absolute.mean())
            changed_fraction = float((absolute.max(axis=2) > 40).mean())
            hist_distance = float(cv2.compareHist(last_hist, hist, cv2.HISTCMP_BHATTACHARYYA))
            if not args.no_flow:
                flow = cv2.calcOpticalFlowFarneback(last_gray, small, None, .5, 3, 15, 3, 5, 1.1, 0)
                magnitude = np.linalg.norm(flow, axis=2)
                # Report source-independent pixels at a 1080-wide frame, not metric scene motion.
                scale = 1080 / flow_w
                flow_median = float(np.median(magnitude) * scale)
                flow_p90 = float(np.percentile(magnitude, 90) * scale)
                dx, dy = (np.median(flow.reshape(-1, 2), axis=0) * scale).tolist()
        luma = rgb @ np.array([.2126, .7152, .0722], dtype=np.float32) / 255
        edge = cv2.Canny(gray, 70, 140)
        rows.append({'frame': idx, 'pts_seconds': pts[idx], 'relative_seconds': pts[idx] - pts[0],
                     'duration_seconds': float(timing[idx].get('duration_time', timing[idx].get('pkt_duration_time', 1 / fps))),
                     'luma_mean': float(luma.mean()), 'luma_p05': float(np.percentile(luma, 5)),
                     'luma_p95': float(np.percentile(luma, 95)), 'saturation_mean': float(hsv[..., 1].mean() / 255),
                     'edge_fraction': float((edge > 0).mean()), 'laplacian_variance': float(cv2.Laplacian(gray, cv2.CV_32F).var()),
                     'rgb_delta_mae': delta_mae, 'changed_fraction_gt40': changed_fraction,
                     'histogram_distance': hist_distance, 'near_static_transition': int(idx > 0 and delta_mae <= .35),
                     'flow_median_px_at1080': flow_median, 'flow_p90_px_at1080': flow_p90,
                     'flow_median_dx_px_at1080': dx, 'flow_median_dy_px_at1080': dy})
        im = Image.fromarray(rgb)
        im.save(frame_dir / f'f{idx:06d}.jpg', quality=args.jpeg_quality, subsampling=0)
        dense.append((idx, pts[idx], im))
        if pts[idx] + 1e-6 >= next_overview_time:
            overview.append((idx, pts[idx], im.copy()))
            next_overview_time = pts[0] + math.floor(pts[idx] - pts[0] + 1e-6) + 1
        if len(dense) == 60:
            make_sheet(dense, sheet_dir / f'dense_{page:04d}.jpg',
                       f'{video_id} | EVERY decoded frame {dense[0][0]}–{dense[-1][0]} | {fps:g} fps')
            page += 1
            dense = []
        # Sparse pixel sample within EVERY frame for a simple dominant-color census.
        pixels = rgb[::8, ::8].reshape(-1, 3)
        bins = (pixels[:, 0].astype(int) // 32) * 64 + (pixels[:, 1].astype(int) // 32) * 8 + pixels[:, 2] // 32
        quant_counts += np.bincount(bins, minlength=512)
        for channel in range(3):
            quant_rgb_sums[:, channel] += np.bincount(bins, weights=pixels[:, channel], minlength=512).astype(np.int64)
        last_rgb, last_gray, last_hist = rgb.copy(), small, hist
        idx += 1
        if idx % 240 == 0:
            print(f'{video_id}: {idx}/{len(pts)} frames measured/exported', flush=True)
    error = pipe.stderr.read().decode('utf-8', errors='replace')
    if pipe.wait() != 0:
        raise RuntimeError(error)
    if idx != len(pts):
        raise RuntimeError(f'Decoded {idx} frames but ffprobe identified {len(pts)} frames')
    if dense:
        make_sheet(dense, sheet_dir / f'dense_{page:04d}.jpg',
                   f'{video_id} | EVERY decoded frame {dense[0][0]}–{dense[-1][0]} | {fps:g} fps')
        page += 1
    if overview[-1][0] != idx - 1:
        overview.append((idx - 1, pts[-1], Image.fromarray(last_rgb)))
    for start in range(0, len(overview), 48):
        make_sheet(overview[start:start + 48], sheet_dir / f'overview_{start // 48:02d}.jpg',
                   f'{video_id} | SAMPLED overview, about 1 s apart; dense sheets contain every frame',
                   cols=8, rows=6, cell_w=150)

    deltas = [r['rgb_delta_mae'] for r in rows]
    candidates = []
    for i in range(1, idx):
        r = rows[i]
        neighbors = deltas[max(1, i - 12):i] + deltas[i + 1:min(idx, i + 13)]
        local_median = max(.2, float(np.median(neighbors))) if neighbors else .2
        ratio = r['rgb_delta_mae'] / local_median
        is_candidate = ((r['rgb_delta_mae'] >= 12 and ratio >= 3 and r['changed_fraction_gt40'] >= .18 and r['histogram_distance'] >= .10)
                        or (r['rgb_delta_mae'] >= 25 and r['changed_fraction_gt40'] >= .50)
                        or (r['rgb_delta_mae'] >= 8 and ratio >= 6 and r['changed_fraction_gt40'] >= .30))
        # Adjacent jumps can be the in/out edges of a flash; retain both and explicitly leave review pending.
        if is_candidate:
            confidence = 'high' if r['rgb_delta_mae'] >= 30 and r['changed_fraction_gt40'] >= .55 and r['histogram_distance'] >= .18 else 'medium'
            candidates.append({'frame': i, 'time': pts[i], 'rgb_delta_mae': r['rgb_delta_mae'],
                               'changed_fraction_gt40': r['changed_fraction_gt40'], 'histogram_distance': r['histogram_distance'],
                               'local_delta_ratio': ratio, 'confidence': confidence, 'status': 'unverified_candidate'})
        r['cut_candidate'] = int(is_candidate)
        r['local_delta_ratio'] = ratio
    rows[0]['cut_candidate'], rows[0]['local_delta_ratio'] = 0, 0
    with (data_dir / 'frames.csv').open('w', newline='', encoding='utf-8') as stream_out:
        writer = csv.DictWriter(stream_out, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    holds = spans_from_flags([bool(r['near_static_transition']) for r in rows], pts)
    write_json(data_dir / 'cut_candidates.json', candidates)
    write_json(data_dir / 'held_spans.json', holds)
    native_indices = {0, idx - 1}
    native_indices.update(min(range(idx), key=lambda i: abs(pts[i] - t)) for t in np.arange(pts[0], pts[-1], 4))
    native_indices.update(c['frame'] for c in candidates)
    native_indices = sorted(native_indices)
    if len(native_indices) > 96:
        native_indices = sorted(set([native_indices[i] for i in np.linspace(0, len(native_indices) - 1, 96).astype(int)]))
    pngs = native_keyframes(video, native_indices, frame_dir.parent / 'native')
    source_info_path = video.with_suffix('.info.json')
    source_info = json.loads(source_info_path.read_text(encoding='utf-8')) if source_info_path.exists() else {}
    palette = []
    for b in np.argsort(quant_counts)[-12:][::-1]:
        rgb_color = np.rint(quant_rgb_sums[b] / max(int(quant_counts[b]), 1)).astype(int).tolist()
        palette.append({'hex': '#%02x%02x%02x' % tuple(rgb_color), 'sampled_pixel_fraction': float(quant_counts[b] / quant_counts.sum())})
    actual_duration = pts[-1] - pts[0] + rows[-1]['duration_seconds']
    summary = {'analysis_version': VERSION, 'complete': True, 'id': video_id,
               'url': f'https://www.youtube.com/shorts/{video_id}', 'title': source_info.get('title'),
               'channel': source_info.get('channel'), 'sha256': source_hash, 'source_bytes': video.stat().st_size,
               'native_dimensions': [source_w, source_h], 'average_frame_rate': source_fps, 'fps': fps,
               'decoded_frames': idx, 'ffprobe_frame_count': len(pts), 'native_pts_preserved': True,
               'first_pts': pts[0], 'last_pts': pts[-1], 'duration_seconds': actual_duration,
               'analysis_width': w, 'analysis_height': h, 'flow_enabled': not args.no_flow,
               'flow_measurement_dimensions': [flow_w, flow_h], 'jpeg_quality': args.jpeg_quality,
               'all_frame_jpegs': idx, 'dense_sheet_cells': idx, 'dense_sheet_count': page,
               'overview_sample_count': len(overview), 'overview_indices': [entry[0] for entry in overview],
               'native_keyframe_count': len(pngs), 'native_keyframe_indices': native_indices,
               'native_keyframe_paths': pngs, 'cut_candidate_count': len(candidates),
               'cut_candidate_frames': [c['frame'] for c in candidates],
               'near_static_transition_percent': float(100 * sum(r['near_static_transition'] for r in rows) / max(idx - 1, 1)),
               'longest_near_static_span_frames': max([s['frames'] for s in holds] or [0]),
               'held_span_lengths_frames': {str(n): sum(s['frames'] == n for s in holds) for n in [2, 3, 4, 5, 6, 12, 24]},
               'delta_mae_median': percentile(deltas[1:], 50), 'delta_mae_p90': percentile(deltas[1:], 90),
               'flow_median_px1080_p50': percentile([r['flow_median_px_at1080'] for r in rows[1:] if not r['cut_candidate']], 50),
               'flow_p90_px1080_p50': percentile([r['flow_p90_px_at1080'] for r in rows[1:] if not r['cut_candidate']], 50),
               'luma_mean_median': percentile([r['luma_mean'] for r in rows], 50),
               'saturation_mean_median': percentile([r['saturation_mean'] for r in rows], 50),
               'dominant_quantized_colors': palette,
               'audio_streams': [{k: s.get(k) for k in ['codec_name', 'sample_rate', 'channels', 'duration']} for s in audio],
               'created_utc': datetime.now(timezone.utc).isoformat(),
               'limitations': ['Cut candidates are not verified edits; pose swaps, impact frames and flashes can trigger them.',
                              'Near-static flags are whole-frame image similarity, not proof of animation exposure or unwanted freezing.',
                              'Optical flow mixes camera, actor and effect motion and cannot recover lens focal length or scene scale.',
                              'Luma and palette statistics are display-referred whole-frame measurements including any embedded text.',
                              'Every input frame is decoded, measured and archived in reduced-resolution form; native PNG selection is sampled.']}
    write_json(summary_path, summary)
    print(f'{video_id}: COMPLETE {idx} frames, {page} dense sheets, {len(candidates)} candidate boundaries, {len(pngs)} native PNGs', flush=True)
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('video_ids', nargs='*', default=IDS)
    parser.add_argument('--frame-width', type=int, default=360)
    parser.add_argument('--jpeg-quality', type=int, default=88)
    parser.add_argument('--no-flow', action='store_true')
    parser.add_argument('--force', action='store_true', help='Recompute existing analysis; never deletes source videos.')
    args = parser.parse_args()
    if args.frame_width < 108 or args.frame_width > 1080:
        parser.error('frame width must be 108–1080')
    results = []
    for video_id in args.video_ids:
        results.append(analyze(video_id, args))
    all_summaries = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((ROOT / 'references/data').glob('*/summary.json'))]
    manifest = {'analysis_version': VERSION, 'method': 'Every native presentation frame decoded once, no fps resampling',
                'python': platform.python_version(), 'opencv': cv2.__version__, 'numpy': np.__version__,
                'ffmpeg': invoke(['ffmpeg', '-version']).splitlines()[0], 'videos': all_summaries,
                'total_decoded_frames': sum(s['decoded_frames'] for s in all_summaries),
                'total_dense_sheets': sum(s['dense_sheet_count'] for s in all_summaries),
                'updated_utc': datetime.now(timezone.utc).isoformat()}
    write_json(ROOT / 'references/data/analysis_manifest.json', manifest)
    print(json.dumps({'completed_videos': len(all_summaries), 'total_frames': manifest['total_decoded_frames'],
                      'dense_sheets': manifest['total_dense_sheets']}), flush=True)


if __name__ == '__main__':
    main()
