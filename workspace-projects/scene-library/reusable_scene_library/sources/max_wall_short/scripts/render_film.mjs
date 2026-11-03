#!/usr/bin/env node
/** Native full-film renderer; immutable snapshots, verified resumable camera-shot chunks.
 * Uses the already-reviewed native opening as a 300-frame prefix; never upscales.
 */
import {mkdir,readdir,readFile,writeFile,cp,symlink,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const name=process.argv[2]||'film_v01',concurrency=Number(process.argv[3]||3);
if(!/^film_[a-zA-Z0-9_-]+$/.test(name)||![1,2,3,4].includes(concurrency))throw Error('Use film_NAME [1-4 concurrency]');
const job=path.join(root,'outputs',name),snapshot=path.join(job,'source'),out=path.join(job,'shots');await mkdir(out,{recursive:true});
const sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
async function entries(p,base=p){let a=[];for(const e of await readdir(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())a.push(...await entries(f,base));else if(e.isFile())a.push({path:path.relative(base,f),bytes:(await stat(f)).size,sha256:await sha(f)});}return a;}
const run=(cmd,argv)=>new Promise((resolve,reject)=>{const p=spawn(cmd,argv,{cwd:snapshot,stdio:['ignore','pipe','pipe']});let text='';p.stdout.on('data',b=>{text+=b;process.stdout.write(b)});p.stderr.on('data',b=>{text+=b;process.stderr.write(b)});p.on('error',reject);p.on('close',code=>code===0?resolve(text):reject(Error(cmd+' exited '+code+'\n'+text.slice(-3000))));});
const verify=async(file,frames)=>{const p=JSON.parse(await run('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_frames','-of','json',file])).streams[0];if(p.width!==1080||p.height!==1920||p.r_frame_rate!=='30/1'||Number(p.nb_frames)!==frames)throw Error('Native-frame contract failed '+JSON.stringify(p));await run('ffmpeg',['-v','error','-threads','2','-i',file,'-map','0:v:0','-f','null','-']);return{sha256:await sha(file),bytes:(await stat(file)).size,stream:p};};
let manifest;try{manifest=JSON.parse(await readFile(path.join(job,'source_manifest.json'),'utf8'));}catch{
 const preview=JSON.parse(await readFile(path.join(root,'outputs/preview_v01/progress.json'),'utf8'));
 if(!preview.final?.path||preview.status==='stopped-error')throw Error('Reviewed opening not rendered');
 await mkdir(snapshot,{recursive:true});for(const f of ['src','public','docs','scripts','third_party','package.json','package-lock.json','tsconfig.json'])await cp(path.join(root,f),path.join(snapshot,f),{recursive:true,errorOnExist:true,force:false});await symlink(path.join(root,'node_modules'),path.join(snapshot,'node_modules'),'dir');
 const prefix=path.join(out,'opening_0000_0299.mp4');await cp(path.join(root,'outputs/preview_v01/silent.mp4'),prefix,{force:false,errorOnExist:true});
 const prefixVideo=await verify(prefix,300),all=(await entries(snapshot)).sort((a,b)=>a.path.localeCompare(b.path));
 manifest={sha256:createHash('sha256').update(JSON.stringify(all)).digest('hex'),createdAt:new Date().toISOString(),root:snapshot,files:all,totalFrames:2887,fps:30,width:1080,height:1920,prefix:{path:prefix,sourceSha256:preview.sourceSha256,frames:300,video:prefixVideo},scope:'Full 96.2333-second native film, normal-speed original narration'};
 await writeFile(path.join(job,'source_manifest.json'),JSON.stringify(manifest,null,2));
}
const plan=JSON.parse(await readFile(path.join(snapshot,'docs/story_beats.json'),'utf8'));
const cuts=[300,...plan.shots.map(s=>s.endFrameExclusive).filter(f=>f>300)];
if(cuts.at(-1)!==2887)throw Error('Bad film endpoint');
const state={name,status:'starting',sourceSha256:manifest.sha256,totalFrames:2887,prefixFrames:300,completedFrames:300,concurrency,completed:[],startedAt:new Date().toISOString(),current:null};
const update=()=>writeFile(path.join(job,'progress.json'),JSON.stringify(state,null,2));
try{
 state.status='rendering';await update();
 for(let i=0;i<cuts.length-1;i++){
  const a=cuts[i],b=cuts[i+1],file=path.join(out,`part_${String(i).padStart(2,'0')}_${a}_${b-1}.mp4`),receipt=file+'.json';state.current={part:i,start:a,endExclusive:b,startedAt:new Date().toISOString()};await update();let r;
  try{r=JSON.parse(await readFile(receipt,'utf8'));if(r.sourceSha256!==manifest.sha256||r.video.sha256!==await sha(file))r=null;}catch{r=null;}
  if(!r){const bundlePath=path.join(snapshot,'.bundle');let cached=[];try{await stat(path.join(bundlePath,'index.html'));cached=['--bundle',bundlePath];}catch{}
   const started=Date.now(),log=await run(process.execPath,['scripts/render.mjs','--comp','MaxWall','--frames',`${a}-${b-1}`,'--mute','1','--concurrency',String(concurrency),'--out',file,...cached]);await writeFile(file+'.log',log);
   r={part:i,startFrame:a,endFrameExclusive:b,sourceSha256:manifest.sha256,renderWallSeconds:(Date.now()-started)/1000,video:await verify(file,b-a)};await writeFile(receipt,JSON.stringify(r,null,2));
  }
  state.completed.push(r);state.completedFrames=b;await update();
 }
 state.status='assembling';state.current=null;await update();
 const list=path.join(out,'concat.txt');await writeFile(list,`file 'opening_0000_0299.mp4'\nduration 10.000000000\n`+state.completed.map(r=>`file 'part_${String(r.part).padStart(2,'0')}_${r.startFrame}_${r.endFrameExclusive-1}.mp4'\nduration ${((r.endFrameExclusive-r.startFrame)/30).toFixed(9)}\n`).join(''));
 const silent=path.join(job,'Max_Wall_FullFilm_Silent_HD.mp4');await run('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-map','0:v:0','-c:v','copy','-an',silent]);await verify(silent,2887);
 const final=path.join(job,'Max_Wall_FullFilm_HD.mp4');await run('ffmpeg',['-v','error','-y','-i',silent,'-i',path.join(snapshot,'public/narration.mp3'),'-map','0:v:0','-map','1:a:0','-t',(2887/30).toFixed(9),'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',final]);
 state.status='rendered-awaiting-independent-QA';state.final={path:final,...await verify(final,2887)};state.completedAt=new Date().toISOString();await update();console.log(JSON.stringify(state,null,2));
}catch(e){state.status='stopped-error';state.error=String(e);await update();throw e;}
