/** Max wall rescue: narrative cameras driven by exact original-audio word timing.
 * Uses actual MIT claude-animated-shorts run/glide/pushK/dolly/zoom engine,
 * preserved from the approved baseball implementation, not a replacement renderer.
 */
import plan from '../docs/story_beats.json';
export const FPS=30, FRAMES=2887;
export const SHOTS=plan.shots;
export const shotAt=(frame:number)=>SHOTS.find(s=>frame>=s.startFrame&&frame<s.endFrameExclusive)||SHOTS[SHOTS.length-1];
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const smooth=(x:number)=>{const u=clamp(x);return u*u*(3-2*u);};
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function shotProgress(frame:number){const shot=shotAt(frame);return {shot,p:clamp((frame-shot.startFrame)/Math.max(1,shot.frames-1))};}
export type V3=[number,number,number];
export type Cam={pos:V3;look:V3;fov:number;roll:number};
type Framing=Partial<Cam>&{pos:V3;look:V3};
type Key={f:number;dur?:number;cut?:boolean;s:(f:number)=>Framing};
// ACTUAL REPOSITORY CAMERA ENGINE. Preserve smoothstep glides and restrained pushes.
export const glide=(u:number)=>{const x=clamp(u);return x*x*x*(x*(6*x-15)+10);};
const mixCam=(a:Cam,b:Cam,k:number):Cam=>({
 pos:a.pos.map((v,i)=>v+(b.pos[i]-v)*k) as V3,
 look:a.look.map((v,i)=>v+(b.look[i]-v)*k) as V3,
 fov:a.fov+(b.fov-a.fov)*k,roll:a.roll+(b.roll-a.roll)*k,
});
const full=(c:Framing):Cam=>({fov:40,roll:0,...c});
const run=(keys:Key[],f:number)=>{
 let cur=full(keys[0].s(f));
 for(let i=1;i<keys.length;i++){const k=keys[i];if(f<k.f)break;
  cur=k.cut?full(k.s(f)):mixCam(cur,full(k.s(f)),glide((f-k.f)/(k.dur??24)));
 }return cur;
};
const pushK=(f:number,f0:number,rate:number,punch=0,n=35)=>{
 const x=Math.max(0,f-f0);let s=rate*x;
 if(punch>rate)for(let i=0;i<Math.min(x,n);i++)s+=(punch-rate)*Math.max(0,Math.min(1,(i+.5)/8,(n-i-.5)/8));
 return Math.exp(-s);
};
const dolly=(pos:V3,look:V3,k:number,rest:Partial<Cam>={}):Framing=>({
 pos:[look[0]+(pos[0]-look[0])*k,look[1]+(pos[1]-look[1])*k,look[2]+(pos[2]-look[2])*k],look,...rest,
});
const zoom=(pos:V3,look:V3,fov:number,k:number,rest:Partial<Cam>={}):Framing=>({
 pos,look,fov:(360/Math.PI)*Math.atan(Math.tan((fov*Math.PI)/360)*k),...rest,
});
const rolled=(s:(f:number)=>Framing,roll:number)=>(f:number):Framing=>({...s(f),roll});

const D=(f0:number,pos:V3,look:V3,fov=38,rate=.0015,roll=0,punch=0)=>(f:number)=>dolly(pos,look,pushK(f,f0,rate,punch),{fov,roll});
const Z=(f0:number,pos:V3,look:V3,fov=38,rate=.0015,roll=0)=>(f:number)=>zoom(pos,look,fov,pushK(f,f0,rate),{roll});
// Canonical right-wall geography. Camera approaches from negative-X / positive-Z.
export const ANCHORS={dogEye:[2.12,1.00,-2.56] as V3,narratorEye:[.3,2.48,-2.53] as V3,
 wall:[2.75,1.05,-2.6] as V3,clock:[-1.31,1.56,-3.602] as V3,
 hallwayDoor:[7,1.55,3.5] as V3,bathEntry:[6.8,.9,0] as V3,
 harlanFloor:[4.5,.36,-2.6] as V3,unreachablePhone:[5.45,.12,-2.6] as V3};
const dog=(f:number)=>D(f,[-1.0,1.55,1.4],[1.30,.58,-2.6],40,.0012);
const person=(f:number)=>D(f,[-1.5,2.75,1.2],[.3,2.12,-2.53],31,.0015);
const pair=(f:number)=>D(f,[-3,3,4.3],[1.0,1.45,-2.6],40,.0012);
const door=(f:number)=>D(f,[4.0,2.9,6.35],[7,1.55,3.55],40,.0010);
const bath=(f:number)=>D(f,[6.4,3.4,-.30],[4.8,.7,-2.3],42,.0009);
const cams:Record<number,Key[]>={};
for(const s of SHOTS){const f=s.startFrame;cams[s.id]=[{f,s:s.set==='hallway'?door(f):s.set==='bathroom'?bath(f):pair(f)}];}
// 0–10s proof: hook, 3AM / exhaustion, guilty close, first-night suspicion, ear contact.
cams[0]=[{f:0,s:D(0,[-1.0,1.55,1.4],[1.65,.58,-2.6],42,.0006)}];
cams[1]=[{f:79,s:Z(79,[-1.2,1.95,-.2],ANCHORS.clock,40,.0012)},
 {f:104,cut:true,s:person(104)}];
cams[2]=[{f:153,s:person(153)},{f:171,dur:22,s:D(171,[-1.15,2.62,.6],[.3,2.12,-2.53],31,.0011,-.018)}];
cams[3]=[{f:217,s:D(217,[-1.8,2.8,2.7],[1.20,1.50,-2.6],43,.0012)}];
cams[4]=[{f:291,s:D(291,[-.75,2.75,.2],[2.24,2.15,-2.6],34,.0012)}];
// Motivated reframing: gestures and hand/prop contacts, not continuous generic float.
for(const id of [5,7,10,20,23]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:person(f)}];}
for(const id of [6,12,16,17,18,19]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:dog(f)}];}
cams[8]=[{f:656,s:D(656,[-2.1,3.2,2.2],[-3.4,1.05,-2.65],40,.0011)}];
cams[9]=[{f:724,s:D(724,[-2.0,2.7,1.1],[-2.1,1.20,-2.1],35,.0012)}];
cams[11]=[{f:892,s:D(892,[-.8,1.8,1.2],[1.92,1.02,-2.6],36,.0012)}];
for(const id of [13,14,15,36]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:D(f,[-1.5,2.9,.6],[.25,1.56,-2.28],34,.0011)}];}
cams[21]=[{f:1583,s:D(1583,[.0,2.25,.55],[2.38,1.95,-2.6],35,.0005)}];
// Three thumps remain one held image: suspense lives in the pause, not cut density.
cams[22]=[{f:1648,s:D(1648,[-.1,2.05,.35],[2.65,1.45,-2.6],35,.0002)}];
cams[24]=[{f:1786,s:D(1786,[1.5,2.3,6.2],[3.8,1.45,4.8],46,.0011)}];
for(const id of [25,26,28,29,30]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:door(f)}];}
cams[27]=[{f:1956,s:D(1956,[4.8,2.4,6.25],[7,1.65,3.55],38,.00015)}];
cams[31]=[{f:2175,s:D(2175,[8.9,1.7,2.8],[6.8,.9,0],39,.0012)}];
cams[32]=[{f:2252,s:D(2252,[6.4,3.4,-.30],ANCHORS.harlanFloor,40,.0007)}];
cams[33]=[{f:2307,s:D(2307,[5.4,1.9,.2],[4.95,.25,-2.6],33,.0010)}];
cams[34]=[{f:2398,s:D(2398,[7.1,2.8,1.8],[4.9,1.65,-2.3],39,.0009)}];
cams[35]=[{f:2452,s:D(2452,[7.2,2.9,2.0],[5.0,1.75,-2.3],39,.0004)}];
cams[37]=[{f:2648,s:D(2648,[-.4,1.8,1.25],[1.0,.75,-2.6],40,.0010)}];
for(const id of [38,39,40]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:D(f,[7.3,2.8,1.5],[3.9,1.65,-2.6],40,.0007)}];}
cams[41]=[{f:2840,s:D(2840,[-1.7,2.4,2.4],[1.15,1.25,-2.6],40,.0008)}];
export const CAMS=cams;
// Minimal repo kick only for body/door impacts; none on realization or medical reveal.
export const KICKS:[number,number][]=[[49.15,.12],[50.2,.10],[71.65,.16]];
export const kickAt=(t:number)=>{let a=0;for(const[t0,g]of KICKS){const n=Math.floor((t-t0)*FPS+1e-6);if(n>=0&&n<7)a+=g*(n%2?-1:1)*(1-n/7)**1.5;}return a;};
export function camAt(id:number,f:number):Cam{
 const c=run(CAMS[id],f),a=kickAt(f/FPS);if(!a)return c;
 const d:V3=[c.look[0]-c.pos[0],c.look[1]-c.pos[1],c.look[2]-c.pos[2]];
 const L=Math.hypot(...d),h=Math.hypot(d[0],d[2])||1,m=(3/640)*Math.tan(c.fov*Math.PI/360)*L*a;
 return{...c,look:[c.look[0]-(d[2]/h)*m,c.look[1]+.6*m,c.look[2]+(d[0]/h)*m],roll:c.roll+a*.004};
}
export const keyEnd=(id:number,f:number)=>{let e=0;for(const k of CAMS[id])if(f>=k.f)e=k.f+(k.cut?0:k.dur??24);return Math.max(f,e);};
export const dofAt=(f:number)=>{const s=shotAt(f);return{cInf:s.id===0?7:([1,2,4,5,7,20,23].includes(s.id)&&f>=104)?12:[18,33].includes(s.id)?8:s.id===27?3:5};};
export const focusAt=(id:number,f:number):V3=>camAt(id,f).look;
export function cameraAt(frame:number){const c=camAt(shotAt(frame).id,frame);return{pos:c.pos,aim:c.look,fov:c.fov,roll:c.roll,blur:dofAt(frame).cInf};}
