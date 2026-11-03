/** Geometry-only contact tests; no renderer, no GPU, no claim of visual QA. */
const ts=require('typescript'),fs=require('fs'),path=require('path');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const gradient={addColorStop(){}};const ctx=new Proxy({createLinearGradient(){return gradient},createRadialGradient(){return gradient}},{get(o,k){return k in o?o[k]:(...a)=>{}},set(o,k,v){o[k]=v;return true}});
global.document={createElement(){return {width:0,height:0,getContext(){return ctx}}}};
const{makeMax,maxFootPhase,MAX_METRICS}=require('../src/DogMax.ts'),{makeCharacter}=require('../src/Characters.ts');const r=makeMax();const rows=[],failures=[];
for(const action of ['idle','alert','bark','howl','whine','scratch','sniff','eat','happy','walk','return'])for(let frame=0;frame<90;frame++){
 r.pose({time:frame/30,action});let c=r.root.userData.contacts;for(const a of [r.head,r.muzzle,r.collar,r.pawFL,r.pawFR,r.pawBL,r.pawBR])if(!a.position.toArray().every(Number.isFinite))failures.push(`${action} ${frame} nonfinite`);
 if(!['scratch','walk','return'].includes(action)&&c.some(p=>Math.abs(p.y)>1e-9))failures.push(`${action} ${frame} floating paw`);
 if(action==='scratch'&&(c.filter(p=>p.y>.05).length!==1||Math.abs(r.frontPaw.position.x-MAX_METRICS.scratchWallX)>1e-8))failures.push(`scratch ${frame} wrong contact`);
 if(frame===15)rows.push({action,head:r.head.position.toArray(),muzzle:r.muzzle.position.toArray(),collar:r.collar.position.toArray(),paws:c.map(p=>({y:p.y,planted:p.planted})),mouth:r.root.userData.mouthOpen});
}
let stanceErr=0;for(let stride of [.62,1])for(let off of [0,.5])for(let d=.01;d<.6;d+=.002){const a=maxFootPhase(d,off,1,stride),b=maxFootPhase(d+.0001,off,1,stride);if(a.planted&&b.planted)stanceErr=Math.max(stanceErr,Math.abs(.0001+(b.x-a.x)*.0024));}
if(stanceErr>1e-9)failures.push('stance slip '+stanceErr);
r.pose({time:.2,action:'bark',facing:1});const right=r.muzzle.position.clone();r.pose({time:.2,action:'bark',facing:-1});if(Math.abs(r.muzzle.position.x+right.x)>1e-9)failures.push('mirror failed');
r.pose({time:.3,action:'scratch',scratchReach:.96});if(Math.abs(r.frontPaw.position.x-.96)>1e-9)failures.push('Scratch reach override incorrect');
const human=makeCharacter('narrator','pajamas',17);let humanHandError=0;
for(let i=0;i<90;i++){const target=[.42,.68,.055];human.pose({time:i/30,walk:.8,lean:.2,handR:target});humanHandError=Math.max(humanHandError,Math.hypot(human.handR.position.x-target[0],human.handR.position.y-target[1]));}
if(humanHandError>1e-8)failures.push('human grip miss '+humanHandError);
const report={testedDogFrames:990,testedDogStrideLengths:[.62,1],testedHumanFrames:90,metrics:MAX_METRICS,stanceMaxErrorMetres:stanceErr,humanHandXYMaxErrorMetres:humanHandError,failures,samplePoses:rows};fs.writeFileSync(path.join(__dirname,'max-contact-tests.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,samplePoses:undefined},null,2));r.dispose();human.dispose();process.exit(failures.length?1:0);
