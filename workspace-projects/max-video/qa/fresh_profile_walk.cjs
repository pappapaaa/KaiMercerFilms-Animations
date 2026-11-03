/** Tests the actual Pen.stroke output of unchanged repo bodySide; no GPU/render. */
const ts=require('typescript'),fs=require('fs'),path=require('path'),crypto=require('crypto');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
let trace=[];
const ctx=()=>new Proxy({createLinearGradient(...a){const g={stops:[],addColorStop(...v){this.stops.push(v)}};trace.push(['linearGradient',...a,g]);return g},createRadialGradient(...a){const g={stops:[],addColorStop(...v){this.stops.push(v)}};trace.push(['radialGradient',...a,g]);return g}},{get(o,k){return k in o?o[k]:(...a)=>{trace.push([k,...a])}},set(o,k,v){o[k]=v;trace.push(['set',k,v]);return true}});
global.document={createElement(){return {width:0,height:0,getContext:ctx}}};
const {makeCharacter,HUMAN_SIDE_METRICS}=require('../src/Characters.ts');const r=makeCharacter('narrator','pajamas',13),failures=[];let maxSlip=0,minSole=Infinity,maxSole=-Infinity,stepSamples=0;
for(const stride of [.31,1])for(const direction of [1,-1])for(let d=.001;d<2.8;d+=.009){
 r.pose({time:d,profileBody:direction,profileStride:stride,walk:1,travel:d});const a=JSON.parse(JSON.stringify(r.root.userData.footContacts));
 r.pose({time:d+.0001,profileBody:direction,profileStride:stride,walk:1,travel:d+.0001});const b=r.root.userData.footContacts;
 if(a.length!==2||b.length!==2)failures.push('Expected two actual source foot strokes');
 for(let i=0;i<2;i++)if(a[i].planted&&b[i].planted){maxSlip=Math.max(maxSlip,Math.abs(direction*.0001+b[i].x-a[i].x));minSole=Math.min(minSole,a[i].y);maxSole=Math.max(maxSole,a[i].y);stepSamples++;}
 if(![r.head,r.hip,r.handL,r.handR].every(g=>g.position.toArray().every(Number.isFinite)))failures.push('Non-finite original bodySide hook');
}
if(maxSlip>1e-8)failures.push('Actual source stance slip '+maxSlip);if(minSole<-.005||maxSole>.005)failures.push('Sole not on ground');
r.pose({time:0,groundShadow:false});if(r.root.getObjectByName('Human contact shadow').visible||r.root.getObjectByName('Human directional floor shadow').visible)failures.push('Prone shadow flag ignored');
const report={actualRepoBodySide:true,testedProfileStrides:[.31,1],stanceSamples:stepSamples,maxWorldSlipMetres:maxSlip,stanceSoleYRange:[minSole,maxSole],failures};fs.writeFileSync(path.join(__dirname,'fresh-profile-walk.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(failures.length?1:0);