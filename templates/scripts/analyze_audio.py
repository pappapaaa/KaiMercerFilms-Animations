"""Mixed-track measurements, not invented source-stem levels or dialogue transcription."""
from pathlib import Path
import json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[2]
for p in [ROOT.parent/'out/audio/pydeps',ROOT/'.tools/pydeps']:
    if p.exists():sys.path.insert(0,str(p))
import numpy as np
rows=[]
for item in json.loads((ROOT/'references/sources.json').read_text())['videos']:
    vid=ROOT/f'references/videos/{item["id"]}.mp4'
    if not vid.exists():continue
    decoded=subprocess.run(['ffmpeg','-v','error','-i',str(vid),'-vn','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
    samples=np.frombuffer(decoded,np.float32);n=len(samples)//160;bins=samples[:n*160].reshape(n,160)
    rms=np.sqrt(np.mean(bins*bins,axis=1)+1e-12);db=20*np.log10(rms)
    log=subprocess.run(['ffmpeg','-hide_banner','-i',str(vid),'-vn','-af','loudnorm=I=-16:TP=-1.2:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True).stderr
    meter=json.loads(log[log.rfind('{'):log.rfind('}')+1])
    result={'id':item['id'],'duration':len(samples)/16000,'integrated_LUFS':float(meter['input_i']),'true_peak_dBTP':float(meter['input_tp']),'LRA_LU':float(meter['input_lra']),'mixed_track_quiet_fraction_below_minus40dB':float(np.mean(db< -40)),'rms_window_seconds':.01,'limitation':'These measure the complete mixed track. Voice/music/SFX gains cannot be separately recovered from this measurement.'}
    dest=ROOT/'references/data'/item['id'];dest.mkdir(parents=True,exist_ok=True)
    np.savetxt(dest/'audio_envelope.csv',np.column_stack([np.arange(n)*.01,db]),delimiter=',',header='time_seconds,mixed_rms_dBFS',comments='',fmt='%.5f')
    (dest/'audio.json').write_text(json.dumps(result,indent=2));rows.append(result)
(ROOT/'references/data/audio_summary.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows,indent=2))
