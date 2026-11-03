import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill,renderMedia} from '@remotion/renderer';
const root=process.cwd();
process.env.TEMP=process.env.TMP=path.join(root,'.render-tmp');fs.mkdirSync(process.env.TEMP,{recursive:true});
const mode=process.argv[2]||'stills';const browserExecutable='C:/Program Files/Google/Chrome/Application/chrome.exe';const chromiumOptions={gl:'angle'};
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions});
const common={serveUrl,browserExecutable,chromiumOptions,puppeteerInstance:browser,timeoutInMilliseconds:180000,onBrowserLog:l=>{if(l.type==='error')console.error(l.text.slice(0,800));}};
fs.mkdirSync('outputs/fresh-stills',{recursive:true});
try{
 const composition=await selectComposition({...common,id:mode==='video'||process.env.MAX_NATIVE?'MaxWall2K':'MaxWall'});
 if(mode==='stills'){
  const plan=JSON.parse(fs.readFileSync('docs/story_beats.json','utf8'));
  const frames=process.argv[3]?process.argv[3].split(',').map(Number):plan.shots.map(s=>Math.floor((s.startFrame+s.endFrameExclusive)/2));
  for(const frame of frames){await renderStill({...common,composition,frame,output:`outputs/fresh-stills/f${String(frame).padStart(4,'0')}.png`,scale:process.env.MAX_NATIVE?1:.5});console.log(`Still ${frame}`);}
 }else{
  let last=-5;
  await renderMedia({...common,composition,outputLocation:process.env.MAX_OUTPUT||'outputs/Max-The-Wall-at-3AM-2K.mp4',codec:'h264',pixelFormat:'yuv420p',colorSpace:'bt709',crf:17,concurrency:Number(process.env.MAX_CONCURRENCY||'2'),...(process.env.MAX_RANGE?{frameRange:process.env.MAX_RANGE.split('-').map(Number)}:{}),onProgress:p=>{const pc=Math.floor(p.progress*100);if(pc>=last+5){last=pc;console.log(`Render ${pc}%: ${p.renderedFrames}/${composition.durationInFrames}`);}}});
 }
}finally{await browser.close({silent:true});}
