/** Fresh Max camera design, 2026-11-02. Existing audio/action timings; entirely new shot compositions. */
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
export const glide=(u:number)=>{const x=clamp(u);return x*x*x*(x*(6*x-15)+10);};
const mixCam=(a:Cam,b:Cam,k:number):Cam=>({pos:a.pos.map((v,i)=>v+(b.pos[i]-v)*k) as V3,look:a.look.map((v,i)=>v+(b.look[i]-v)*k) as V3,fov:a.fov+(b.fov-a.fov)*k,roll:a.roll+(b.roll-a.roll)*k});
const full=(c:Framing):Cam=>({fov:40,roll:0,...c});
const run=(keys:Key[],f:number)=>{let cur=full(keys[0].s(f));for(let i=1;i<keys.length;i++){const k=keys[i];if(f<k.f)break;cur=k.cut?full(k.s(f)):mixCam(cur,full(k.s(f)),glide((f-k.f)/(k.dur??24)));}return cur;};
const pushK=(f:number,f0:number,rate:number,punch=0,n=35)=>{const x=Math.max(0,f-f0);let s=rate*x;if(punch>rate)for(let i=0;i<Math.min(x,n);i++)s+=(punch-rate)*Math.max(0,Math.min(1,(i+.5)/8,(n-i-.5)/8));return Math.exp(-s);};
const dolly=(pos:V3,look:V3,k:number,rest:Partial<Cam>={}):Framing=>({pos:[look[0]+(pos[0]-look[0])*k,look[1]+(pos[1]-look[1])*k,look[2]+(pos[2]-look[2])*k],look,...rest});
const zoom=(pos:V3,look:V3,fov:number,k:number,rest:Partial<Cam>={}):Framing=>({pos,look,fov:(360/Math.PI)*Math.atan(Math.tan((fov*Math.PI)/360)*k),...rest});
const D=(f0:number,pos:V3,look:V3,fov=46,rate=.00045,roll=0)=>(f:number)=>dolly(pos,look,pushK(f,f0,rate),{fov,roll});
const Z=(f0:number,pos:V3,look:V3,fov=46,rate=.00045)=>(f:number)=>zoom(pos,look,fov,pushK(f,f0,rate),{roll:0});
export const ANCHORS={dogEye:[2.12,1.00,-2.56] as V3,narratorEye:[.3,2.48,-2.53] as V3,wall:[2.75,1.05,-2.6] as V3,clock:[-1.31,1.56,-3.602] as V3,hallwayDoor:[7,1.55,3.5] as V3,bathEntry:[6.8,.9,0] as V3,harlanFloor:[5.1,.43,-2.62] as V3,unreachablePhone:[5.87,.065,-2.56] as V3};
const cams:Record<number,Key[]>={};
const single=(id:number,pos:V3,look:V3,fov:number,rate=.00045)=>{const f=SHOTS[id].startFrame;cams[id]=[{f,s:D(f,pos,look,fov,rate)}];};
// Act I: owner on the bed and Max at the wall together, then descend to Max.
cams[0]=[{f:0,s:D(0,[-3.5,4.0,5.8],[-.55,1.25,-2.7],61,.0004)},{f:33,dur:30,s:D(33,[1.0,1.2,2.0],[1.45,.73,-2.6],56,.0003)}];
cams[1]=[{f:79,s:Z(79,[-2.3,1.75,-1.25],ANCHORS.clock,50,.0004)},{f:111,cut:true,s:D(111,[1.6,3.1,2.2],[.2,1.95,-2.6],46,.00065)}];
single(2,[2.3,1.65,.25],[.3,1.95,-2.55],43,.0007);
single(3,[-4.4,2.1,2.65],[.1,1.30,-2.65],66,.0005);
single(4,[.9,2.1,-.45],[2.18,2.25,-2.6],54,.00045);
single(5,[-2.8,3.25,.6],[.25,1.9,-2.55],49,.0006);
cams[6]=[{f:439,s:D(439,[.55,.72,.9],[1.70,.52,-2.6],58,.00035)},{f:493,dur:24,s:D(493,[.55,1.0,.9],[2.08,.62,-2.6],43,.00035)}];
single(7,[.8,3.25,.35],[.35,2.45,-2.6],40,.00045);
// Reclining artwork faces upward; this high view preserves the face and bed support.
single(8,[-4.1,5.9,-1.15],[-3.2,1.15,-2.65],52,.0003);
single(9,[.25,2.45,1.8],[-2.5,1.95,-1.95],51,.0005);
single(10,[-1.9,3.2,4.8],[-1.25,1.65,-2.5],67,.00035);
const collarLow=D(892,[.2,1.25,1.3],[1.20,.85,-2.55],60,.0003);
cams[11]=[{f:892,s:collarLow}];
cams[12]=[{f:949,s:collarLow},{f:961,dur:30,s:D(961,[-.65,2.65,3.1],[1.0,1.05,-2.6],52,.0004)}];
// Act II: diagonal overhead phone coverage; clock-to-dog descent and quiet hold.
single(13,[-2.65,2.8,1.15],[.25,1.8,-2.2],51,.0004);
const overheadPhone=(f:number)=>D(f,[-.65,2.90,-.75],[.42,1.98,-2.17],53,.00022);
cams[14]=[{f:1102,s:overheadPhone(1102)}];
cams[15]=[{f:1193,s:overheadPhone(1102)},{f:1238,dur:28,s:D(1238,[.1,3.45,3.1],[.1,1.6,-2.2],53,.0004)}];
const quietDog=D(1312,[.8,.97,1.7],[1.55,.65,-2.6],55,.00025);
cams[16]=[{f:1287,s:Z(1287,[-.4,2.05,-.95],ANCHORS.clock,46,.00035)},{f:1312,dur:24,s:quietDog}];
cams[17]=[{f:1366,s:quietDog}];
single(18,[.2,.56,1.8],[1.5,.95,-2.6],56,.0004);
// Broadside dog card faces -X: reverse from the back half of the bedroom.
single(19,[.15,.86,-4.25],[2.43,.65,-2.45],58,.00025);
single(20,[1.45,2.9,-.25],[.3,2.4,-2.53],43,.00045);
const listenDiagonal=D(1583,[1.45,3.25,-.35],[2.16,2.17,-2.60],52,.00025);
cams[21]=[{f:1583,s:listenDiagonal}];cams[22]=[{f:1648,s:listenDiagonal}];
single(23,[.25,1.75,.6],[.3,2.38,-2.53],40,.00065);
// Act III: lead the runner from ahead; the doors remain on the same facade.
cams[24]=[{f:1786,s:(f:number)=>{const u=smooth((f-1786)/(1844-1786-1)),x=mix(-1.2,6.25,u);return dolly([x+2.4,2.1,8.7],[x+.1,1.5,4.55],pushK(f,1786,.0002),{fov:54,roll:0});}}];
single(25,[3.5,2.05,6.2],[6.98,1.55,4.0],59,.00035);
single(26,[4.9,2.2,4.8],[7.0,2.2,4.20],52,.00045);
single(27,[4.7,1.2,7.1],[7,1.55,3.5],51,.00018);
single(28,[5.0,2.45,5.3],[7.0,2.1,4.20],52,.0003);
single(29,[7.7,2.75,6.9],[6.38,2.25,4.2],48,.00035);
cams[30]=[{f:2110,s:D(2110,[3.6,1.3,9.1],[7.1,1.7,4.0],60,.0003)},{f:2138,dur:28,s:D(2138,[4.9,2.4,7.8],[6.8,1.5,3.5],58,.00025)}];
// Exterior bathroom insert views the +X-facing dog card; all interior cameras use z<0.
single(31,[8.9,.78,2.0],[6.63,.55,.75],61,.0003);
single(32,[3.55,2.8,-.75],[5.08,.5,-2.6],66,.00025);
single(33,[4.8,2.2,-.95],[5.65,.22,-2.58],50,.00025);
const careTwo=D(2398,[6.85,3.3,-.35],[5.4,1.7,-2.3],77,.00025);
cams[34]=[{f:2398,s:careTwo}];
cams[35]=[{f:2452,s:careTwo},{f:2470,dur:32,s:D(2470,[6.9,2.9,-.65],[6.05,2.22,-2.3],58,.00025)}];
// Act IV: low gratitude, new neighbor reverse, then warm room-to-dog closing move.
cams[36]=[{f:2556,s:D(2556,[-2.2,3.1,.65],[.2,1.95,-2.2],49,.00035)},{f:2592,dur:24,s:overheadPhone(2592)}];
cams[37]=[{f:2648,s:D(2648,[.2,2.6,2.8],[.6,1.25,-2.1],56,.00035)},{f:2675,dur:25,s:D(2675,[2.2,.72,.75],[1.55,.38,-1.97],57,.00035)}];
const sundayWide=D(2717,[4.0,3.0,-.25],[3.65,1.45,-2.6],68,.0003);
cams[38]=[{f:2717,s:sundayWide}];
cams[39]=[{f:2752,s:sundayWide},{f:2757,dur:22,s:D(2757,[4.1,2.65,-.35],[3.55,1.85,-2.6],59,.0003)}];
single(40,[4.0,2.6,-.25],[3.45,2.0,-2.6],55,.0003);
cams[41]=[{f:2840,s:D(2840,[-2.7,3.65,4.9],[.75,1.3,-2.6],57,.00045)},{f:2854,dur:24,s:D(2854,[.4,1.5,2.5],[1.42,.9,-2.6],55,.0003)}];
export const CAMS=cams;
export const KICKS:[number,number][]=[[1476/FPS,.08],[71.65,.12]];
export const kickAt=(t:number)=>{let a=0;for(const[t0,g]of KICKS){const n=Math.floor((t-t0)*FPS+1e-6);if(n>=0&&n<7)a+=g*(n%2?-1:1)*(1-n/7)**1.5;}return a;};
export function camAt(id:number,f:number):Cam{const c=run(CAMS[id],f),a=kickAt(f/FPS);if(!a)return c;const d:V3=[c.look[0]-c.pos[0],c.look[1]-c.pos[1],c.look[2]-c.pos[2]],L=Math.hypot(...d),h=Math.hypot(d[0],d[2])||1,m=(3/640)*Math.tan(c.fov*Math.PI/360)*L*a;return{...c,look:[c.look[0]-(d[2]/h)*m,c.look[1]+.6*m,c.look[2]+(d[0]/h)*m],roll:c.roll+a*.004};}
export const keyEnd=(id:number,f:number)=>{let e=0;for(const k of CAMS[id])if(f>=k.f)e=k.f+(k.cut?0:k.dur??24);return Math.max(f,e);};
export const dofAt=(f:number)=>{const s=shotAt(f);return{cInf:[0,3,8,10,24,30,32,34,38,41].includes(s.id)?2.5:[14,15,33,36].includes(s.id)?5:[4,7,20,21,22,23,26,28,35,40].includes(s.id)?9:6};};
export const focusAt=(id:number,f:number):V3=>camAt(id,f).look;
export function cameraAt(frame:number){const c=camAt(shotAt(frame).id,frame);return{pos:c.pos,aim:c.look,fov:c.fov,roll:c.roll,blur:dofAt(frame).cInf};}
