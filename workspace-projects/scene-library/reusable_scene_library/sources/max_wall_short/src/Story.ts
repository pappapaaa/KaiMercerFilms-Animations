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
 harlanFloor:[5.1,.43,-2.62] as V3,unreachablePhone:[5.87,.065,-2.56] as V3};
const dog=(f:number)=>D(f,[-1.0,1.55,1.4],[1.65,.58,-2.6],42,.00045);
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
// FULL-FILM CAMERA PASS: actual action/contact locations; approved shots0–4 above unchanged.
for(const id of [5,7,10,20,23]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:person(f)}];}
for(const id of [6,12,16,17,18]){const f=SHOTS[id].startFrame;cams[id]=[{f,s:dog(f)}];}
// Bed roll must be seen from above; seated scold is a separate supported pose.
cams[8]=[{f:656,s:D(656,[-.7,4.9,-.1],[-3.3,1.17,-2.9],40,.0005)}];
cams[9]=[{f:724,s:D(724,[-.8,3.0,2.1],[-2.55,2.0,-1.94],38,.00065)}];
cams[11]=[{f:892,s:D(892,[-1.2,2.3,2.1],[1.25,1.1,-2.55],42,.00045)}];
cams[12]=[{f:949,s:D(949,[-1.5,2.5,2.4],[1.35,1.35,-2.6],43,.00045)}];
const phoneContext=(f:number)=>D(f,[-1.2,2.8,1.5],[.35,2.05,-2.2],38,.00065);
const phoneInsert=(f:number)=>D(f,[.5,2.1,-.35],[.47,1.97,-2.16],45,.0002);
cams[13]=[{f:1041,s:phoneContext(1041)}];
cams[14]=[{f:1102,s:phoneInsert(1102)}];
cams[15]=[{f:1193,s:phoneInsert(1193)},{f:1232,cut:true,s:phoneContext(1232)}];
// Exact second3AM, then changed canine behavior. The howl preserves upward muzzle room.
cams[16]=[{f:1287,s:Z(1287,[-1.2,1.95,-.2],ANCHORS.clock,40,.0006)},{f:1318,cut:true,s:dog(1318)}];
cams[17]=[{f:1366,s:D(1366,[-1.0,1.55,1.4],[1.65,.58,-2.6],42,.0002)}];
cams[18]=[{f:1422,s:D(1422,[-1.0,1.75,1.4],[1.65,.78,-2.6],43,.00045)}];
cams[19]=[{f:1460,s:D(1460,[-1.2,1.8,-.4],[2.58,.72,-2.55],42,.00035)}];
// One continuous ear/head framing through all three audible thumps. No empty wall cut.
const listenHold=D(1583,[-.75,2.75,.2],[2.24,2.15,-2.6],34,.00025);
cams[21]=[{f:1583,s:listenHold}];
cams[22]=[{f:1648,s:listenHold}];
// Track the genuine7.45m hallway run; floor/facade has a camera-side cutaway, not a new room.
cams[24]=[{f:1786,s:(f:number)=>{const u=smooth((f-1786)/(1844-1786-1)),x=mix(-1.2,6.25,u);return dolly([x-3,2.8,9.3],[x+.55,1.35,4.5],pushK(f,1786,.0003),{fov:46,roll:0});}}];
const doorWide=(f:number)=>D(f,[3.7,3.05,7.0],[6.95,1.7,3.98],44,.00045);
const doorFace=(f:number)=>D(f,[4.8,2.9,5.9],[6.95,2.15,4.1],39,.00045);
cams[25]=[{f:1844,s:doorWide(1844)}];
cams[26]=[{f:1899,s:doorFace(1899)}];
cams[27]=[{f:1956,s:D(1956,[3.7,3.05,7.0],[6.95,1.7,3.98],44,.0001)}];
cams[28]=[{f:1985,s:doorFace(1985)}];
cams[29]=[{f:2070,s:D(2070,[5.4,2.9,7.2],[6.3,2.15,4.2],37,.00045)}];
cams[30]=[{f:2110,s:D(2110,[5.7,3.5,10.5],[6.8,1.65,4.05],56,.00035)}];
// Bathroom: exterior dog/jamb first; interior reveal and phone cameras avoid the real z0 partition.
cams[31]=[{f:2175,s:D(2175,[9.5,1.9,3.5],[6.60,.72,1.03],44,.00035)}];
cams[32]=[{f:2252,s:D(2252,[6.3,3.8,-.30],[5.1,.68,-2.62],54,.00025)}];
cams[33]=[{f:2307,s:D(2307,[5.7,1.9,-1.82],[5.62,.12,-2.56],48,.00025)}];
// Interior reverse: camera is beyond the open leaf so both speaker and reaction remain visible.
const warningTwoShot=D(2398,[5.4,3.4,-.2],[5.4,1.7,-2.3],76,.00025);
cams[34]=[{f:2398,s:warningTwoShot}];
cams[35]=[{f:2452,s:warningTwoShot}];
cams[36]=[{f:2556,s:phoneContext(2556)},{f:2602,cut:true,s:phoneInsert(2602)}];
cams[37]=[{f:2648,s:D(2648,[-1.8,3.1,3.5],[.7,1.3,-2.1],43,.00045)},
 {f:2684,cut:true,s:D(2684,[-.6,1.55,1.3],[1.3,.37,-2.0],44,.00035)}];
// Reverse side of the same shared wall. All Harlan cameras are INSIDE the bathroom partition.
const harlanWarm=D(2717,[5.35,3.05,-.3],[3.60,1.65,-2.6],48,.0003);
cams[38]=[{f:2717,s:harlanWarm}];
cams[39]=[{f:2752,s:harlanWarm}];
cams[40]=[{f:2787,s:D(2787,[5.0,2.85,-.3],[3.36,2.0,-2.6],46,.0003)}];
cams[41]=[{f:2840,s:D(2840,[-1.8,2.8,2.7],[1.20,1.50,-2.6],43,.00045)}];
export const CAMS=cams;
// Minimal repo kick only for body/door impacts; none on realization or medical reveal.
export const KICKS:[number,number][]=[[1476/FPS,.10],[71.65,.16]];
export const kickAt=(t:number)=>{let a=0;for(const[t0,g]of KICKS){const n=Math.floor((t-t0)*FPS+1e-6);if(n>=0&&n<7)a+=g*(n%2?-1:1)*(1-n/7)**1.5;}return a;};
export function camAt(id:number,f:number):Cam{
 const c=run(CAMS[id],f),a=kickAt(f/FPS);if(!a)return c;
 const d:V3=[c.look[0]-c.pos[0],c.look[1]-c.pos[1],c.look[2]-c.pos[2]];
 const L=Math.hypot(...d),h=Math.hypot(d[0],d[2])||1,m=(3/640)*Math.tan(c.fov*Math.PI/360)*L*a;
 return{...c,look:[c.look[0]-(d[2]/h)*m,c.look[1]+.6*m,c.look[2]+(d[0]/h)*m],roll:c.roll+a*.004};
}
export const keyEnd=(id:number,f:number)=>{let e=0;for(const k of CAMS[id])if(f>=k.f)e=k.f+(k.cut?0:k.dur??24);return Math.max(f,e);};
export const dofAt=(f:number)=>{const s=shotAt(f);return{cInf:s.id===0?7:([1,2,4,5,7,20,23].includes(s.id)&&f>=104)?12:[14,15,33,36].includes(s.id)?6:[21,22,26,28,29,40].includes(s.id)?8:[24,30,32,34,35].includes(s.id)?2.5:s.id===27?3:5};};
export const focusAt=(id:number,f:number):V3=>camAt(id,f).look;
export function cameraAt(frame:number){const c=camAt(shotAt(frame).id,frame);return{pos:c.pos,aim:c.look,fov:c.fov,roll:c.roll,blur:dofAt(frame).cInf};}
