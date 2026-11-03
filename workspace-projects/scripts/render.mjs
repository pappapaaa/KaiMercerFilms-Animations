import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill,renderMedia,selectComposition} from '@remotion/renderer';
const root=process.cwd();
process.env.TEMP=process.env.TMP=path.join(root,'.render-tmp');fs.mkdirSync(process.env.TEMP,{recursive:true});
const mode=process.argv[2]||'stills';const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';
const chromiumOptions={gl:'angle'};
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public')});
const inputProps={dpr:Number(process.env.RENDER_DPR||(mode==='stills'?'1':'1.3333333333333333'))};
const composition=await selectComposition({serveUrl,id:'EiffelShort',browserExecutable,chromiumOptions,inputProps});
const common={composition,serveUrl,browserExecutable,chromiumOptions,inputProps,timeoutInMilliseconds:180000,onBrowserLog:l=>{if(l.type==='error')console.error(l.text.slice(0,500))}};
fs.mkdirSync('out/stills',{recursive:true});
if(mode==='stills'){
 for(const f of (process.argv[3]||'30,220,460,620,820,1070,1350,1580,1770,1850').split(',').map(Number)){
  const start=Date.now();await renderStill({...common,frame:f,output:`out/stills/frame-${String(f).padStart(4,'0')}.png`,scale:.5});console.log(`Frame ${f}: ${((Date.now()-start)/1000).toFixed(1)}s`);
 }
}else{
 let last=-1;const scale=Number(process.env.RENDER_SCALE||'1.3333333333333333');
 await renderMedia({...common,outputLocation:process.env.RENDER_OUTPUT||'out/eiffel-picture.mp4',codec:'h264',crf:17,scale,concurrency:Number(process.env.RENDER_CONCURRENCY||'2'),...(process.env.FRAME_RANGE?{frameRange:process.env.FRAME_RANGE.split('-').map(Number)}:{}),onProgress:p=>{const pc=Math.floor(p.progress*100);if(pc>=last+5){last=pc;console.log(`Render ${pc}% (${p.renderedFrames}/${composition.durationInFrames})`)}}});
 if(!process.env.FRAME_RANGE){const ffmpeg=process.env.FFMPEG_PATH||(fs.existsSync('C:/ffmpeg/ffmpeg.exe')?'C:/ffmpeg/ffmpeg.exe':'ffmpeg');const result=spawnSync(ffmpeg,['-y','-v','error','-i',process.env.RENDER_OUTPUT||'out/eiffel-picture.mp4','-i','public/audio/mix.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-t',String(composition.durationInFrames/composition.fps),'-movflags','+faststart','out/The-Tower-That-Chases-Shade-2K.mp4'],{stdio:'inherit'});if(result.status!==0)throw new Error(`Final audio mux failed: ${result.error?.message??result.status}`);console.log('Final: out/The-Tower-That-Chases-Shade-2K.mp4');}
}
