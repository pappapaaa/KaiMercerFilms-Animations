/** Baseball editorial adaptation of mromidev/claude-animated-shorts story.ts.
 * Camera engine below is the actual MIT repo run/glide/pushK/dolly/zoom/kick engine,
 * not the old Fan Cam's full-shot interpolation. Source license: vendor/LICENSE-claude-animated-shorts.txt.
 * Narration, 30 fps, 2253 frames, and all original major shot boundaries remain unchanged.
 */
import plan from '../docs/story_beats.json';
export const FPS=30, FRAMES=2253;
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

// ----- ACTUAL REPOSITORY CAMERA ENGINE; baseball adaptations start below -----
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
// ----- BASEBALL FRAMINGS: action-based reframes, not indiscriminate float -----
const D=(f0:number,pos:V3,look:V3,fov=38,rate=.0015,roll=0,punch=0)=>(f:number)=>dolly(pos,look,pushK(f,f0,rate,punch),{fov,roll});
const Z=(f0:number,pos:V3,look:V3,fov=38,rate=.0015,roll=0)=>(f:number)=>zoom(pos,look,fov,pushK(f,f0,rate),{roll});
const bedroomFace:V3=[1.4,2.043,.065];
const employeeEye:V3=[0,2.155,.51],bossEye:V3=[1.35,2.838,-1.39];
// Actual body-card yaw moves the seated z-offset; focus uses transformed eye anchors.
export const REACTION_FACING={employee:1.05,boss:.78};
// Seat offset stays WORLD-forward after inverse-root rotation; only the .070 eye-plane offset rotates.
const reactionFocus:V3=[(.070*Math.sin(1.05)+1.35+.070*Math.sin(.78))/2,(2.155+2.838)/2,(.44+.070*Math.cos(1.05)-1.9+.44+.070*Math.cos(.78))/2];
const stadiumWide=D(456,[19,20,35],[0,1,8],48,.0015);
const stadiumEmployee=D(490,[-.8,3.0,6.6],[0,1.75,0],38,.0015);
// Full screen at f675: the world scoreboard really is at (0,10.4,-18.2).
const scoreboard=Z(618,[-2,10.5,18],[0,10.4,-18.2],44,.0015);
// Insert crops are intentional: no boss eyes/moustache are available before f1310.
const shirt=D(1226,[.80,2.0,2.35],[1.35,1.65,-1.415],29.5,.0014);
// Beer target is the boss's right-side hand / cup body; scene must use the exported anchor.
const beer=D(1263,[2.05,2.10,2.10],[1.70,2.04,-1.395],20,.0015);
const bossReveal=D(1310,[1.7,2.94,1.99],bossEye,32,.0016,-.035,.0040);
// Shared two-shot avoids an unwanted jump exactly between "eyes" and "foam finger".
const eyeLock=D(1348,[7.799445,3.198,4.960133],[0.669445,1.95,-0.387867],46,.0015);
const droppedWide=D(1406,[7.714445,3.05,4.944133],[0.669445,1.74,-0.387867],46,.0015);
const breathHold=D(1462,[7.364445,3.0,4.644133],[0.669445,1.88,-0.387867],46,.0015);
const meetingStand=(f:number):Framing=>{
 const lift=glide((f-1966)/22);
 // Same planted-feet composition through the sit-to-stand; follow with a restrained tilt.
 return dolly([1.0,3.0+.14*lift,6.3],[0,1.73+.20*lift,-3.85],pushK(f,1948,.0015),{fov:37,roll:0});
};
export const CAMS:Record<number,Key[]>={
 0:[{f:0,s:D(0,[3,3,6.2],[1.4,1.65,.1],38,.0018)},
    {f:56,cut:true,s:D(56,[2.2,2.75,4.7],bedroomFace,35,.0018)}],
 1:[{f:103,s:D(103,[2.15,2.62,4.45],bedroomFace,35,.0018)},
    {f:138,dur:20,s:D(138,[2.0,2.5,3.9],[1.4,2.1,.1],35,.0017,-.035)}],
 2:[{f:189,s:D(189,[2.4,3.05,5.25],[1.4,1.85,.1],36,.0015)},
    {f:232,dur:22,s:D(232,[2.1,2.8,4.85],bedroomFace,36,.0016)}],
 3:[{f:272,s:D(272,[1.3,2.95,4.7],[.5,1.85,-2.2],36,.0015)},
    {f:302,dur:22,s:D(302,[1.05,2.7,4.2],[.5,2.16,-2.2],35,.0015)}],
 4:[{f:376,s:D(376,[2.2,2.8,4.75],bedroomFace,36,.0018)},
    {f:393,dur:20,s:D(393,[1.85,2.6,4.2],bedroomFace,34,.0015,.035,.004)}],
 5:[{f:456,s:stadiumWide},{f:490,cut:true,s:stadiumEmployee},
    {f:543,dur:22,s:D(543,[-.55,2.75,5.6],[0,1.65,.14],37,.0015,-.025)}],
 6:[{f:592,s:Z(592,[-2.8,10.2,20.5],[0,8.9,-18.2],46,.0015)},
    {f:618,dur:24,s:scoreboard},
    {f:684,cut:true,s:D(684,[-.9,4.15,10.2],[.6,1.9,-1.4],43,.0018,.025)}],
 7:[{f:732,s:D(732,[-4.0,3.1,4.9],[-2.7,2.15,-1.9],36,.0018)},
    {f:744,dur:22,s:D(744,[-3.25,2.9,4.35],[-2.7,2.4,-1.9],36,.0015,.025)}],
 8:[{f:781,s:D(781,[4.65,3.1,4.8],[4.05,2.35,-1.9],36,.0018)},
    {f:791,dur:20,s:rolled(D(791,[4.4,2.9,4.3],[4.05,2.4,-1.9],36,.0015),-.025)}],
 9:[{f:835,s:D(835,[-.5,2.65,5.55],[0,1.95,.05],38,.0018)},
    {f:870,cut:true,s:D(870,[-.35,2.45,3.85],employeeEye,34,.0018)},
    {f:918,cut:true,s:D(918,[-.65,2.95,6.65],[.03,1.8,.05],39,.0018,-.035)}],
 10:[{f:987,s:D(987,[-1.2,4.2,10.0],[.4,2.0,-1.3],43,.0018,.025)}],
 11:[{f:1028,s:D(1028,[.15,2.9,6.0],[0,1.9,0],38,.0018,-.035)},
     {f:1052,dur:18,s:D(1052,[-.25,2.8,5.55],[0,2.04,0],38,.0015,.035)}],
 12:[{f:1085,s:D(1085,[-.50,2.5,3.9],employeeEye,34,.0018)},
     // A lower two-plane crop reveals someone in the next row, not his identity.
     {f:1136,cut:true,s:D(1136,[-.60,3.30,5.0],[.40,.90,-.70],32,.0015)},
     {f:1170,cut:true,s:D(1170,[.30,2.45,1.75],[.70,2.20,-1.40],24,.0015)}],
 13:[{f:1226,s:shirt}],
 14:[{f:1263,s:beer}],
 15:[{f:1310,s:bossReveal},{f:1313,dur:18,s:rolled(bossReveal,.035)}],
 16:[{f:1348,s:eyeLock}],
 17:[{f:1389,s:eyeLock},{f:1406,dur:24,s:droppedWide}],
 18:[{f:1462,s:breathHold},
     {f:1514,dur:20,s:D(1514,[7.214445,3.08,4.444133],[0.669445,1.97,-0.387867],46,.0015)}],
 19:[{f:1567,s:D(1567,[.35,2.55,4.85],[0,1.91,.05],36,.0015)},
     {f:1582,dur:24,s:D(1582,[.25,2.50,4.55],[0,1.66,.12],36,.0015,.025)}],
 20:[{f:1640,s:D(1640,[4.4,3.7,7.5],[.2,1.5,-1.1],40,.0018)},
     {f:1699,cut:true,s:D(1699,[1.1,2.9,4.6],[.5,2.16,-2.15],35,.0018)}],
 21:[{f:1753,s:D(1753,[1.2,3.2,3.8],[.35,1.17,.15],34,.0015)},
     {f:1772,dur:22,s:D(1772,[.75,2.8,2.4],[.35,1.17,.15],32,.0015)}],
 22:[{f:1812,s:Z(1812,[.35,3.25,2.1],[.35,1.17,.15],28,.0015)},
     {f:1881,cut:true,s:D(1881,[1.0,2.8,4.4],[.5,2.16,-2.2],34,.0015)}],
 23:[{f:1922,s:D(1922,[4.3,4.4,9.2],[0,1.6,-1.4],42,.0015)},
     {f:1948,cut:true,s:meetingStand}],
 24:[{f:1998,s:D(1998,[.85,3.0,3.8],[0,2.43,-3.85],35,.0015)}],
 25:[{f:2031,s:D(2031,[3.7,4.15,9.6],[-.5,2.0,-1.9],42,.0015)},
     {f:2085,cut:true,s:D(2085,[2.0,3.55,5.7],[-.5,2.5,-4],38,.0015,.025)}],
 26:[{f:2143,s:D(2143,[.8,2.95,3.5],[0,2.43,-3.85],34,.0016)},
     {f:2159,cut:true,s:D(2159,[-2.7,2.65,6.7],[-2,2.16,1],35,.0015)}],
 27:[{f:2183,s:D(2183,[2.8,3.65,9.3],[-.55,1.9,-1.5],40,.0015)},
     {f:2223,cut:true,s:D(2223,[-2.65,2.7,6.6],[-2,2.16,1],35,.0018,.035)}],
};

// Repository impact engine, restrained: coughs and the new screen. NO kick on eye contact.
export const KICKS:[number,number][]=[[107/FPS,.28],[143/FPS,.35],[637/FPS,.35]];
export const kickAt=(t:number)=>{let a=0;for(const[t0,g]of KICKS){const n=Math.floor((t-t0)*FPS+1e-6);if(n>=0&&n<7)a+=g*(n%2?-1:1)*(1-n/7)**1.5;}return a;};
export function camAt(id:number,f:number):Cam{
 const c=run(CAMS[id],f),a=kickAt(f/FPS);if(!a)return c;
 const d:V3=[c.look[0]-c.pos[0],c.look[1]-c.pos[1],c.look[2]-c.pos[2]];
 const L=Math.hypot(...d),h=Math.hypot(d[0],d[2])||1,m=(3/640)*Math.tan(c.fov*Math.PI/360)*L*a;
 return{...c,look:[c.look[0]-(d[2]/h)*m,c.look[1]+.6*m,c.look[2]+(d[0]/h)*m],roll:c.roll+a*.004};
}
export const keyEnd=(id:number,f:number)=>{let e=0;for(const k of CAMS[id])if(f>=k.f)e=k.f+(k.cut?0:k.dur??24);return Math.max(f,e);};

type Dof={f:number;dur?:number;cInf:number;focus?:(f:number)=>V3};
// Actual repo lens: a midpoint eye focus plus three-quarter camera keeps BOTH faces sharp, background soft.
export const DOF:Dof[]=[
 {f:0,cInf:8},{f:103,cInf:11},{f:189,cInf:8},{f:272,cInf:9},{f:376,cInf:9},
 {f:456,cInf:0},{f:490,cInf:7},{f:592,cInf:0},{f:732,cInf:8},{f:781,cInf:8},
 {f:835,cInf:8},{f:870,cInf:12},{f:918,cInf:7},{f:987,cInf:0},{f:1028,cInf:8},
 {f:1085,cInf:10},{f:1136,cInf:0},{f:1226,cInf:10},{f:1263,cInf:10},{f:1310,cInf:12,focus:()=>bossEye},
 {f:1348,cInf:12,focus:()=>reactionFocus},{f:1567,cInf:9},{f:1640,cInf:0},{f:1699,cInf:8},{f:1753,cInf:8},
 {f:1812,cInf:7},{f:1881,cInf:10},{f:1922,cInf:0},{f:1998,cInf:8},{f:2031,cInf:0},{f:2085,cInf:5},
 {f:2143,cInf:10},{f:2159,cInf:10},{f:2183,cInf:0},{f:2223,cInf:10},
];
export const dofAt=(f:number)=>{let i=0;while(i+1<DOF.length&&f>=DOF[i+1].f)i++;const d=DOF[i],p=DOF[Math.max(0,i-1)],k=d.dur?Math.min(1,(f-d.f)/d.dur):1;return{cInf:p.cInf+(d.cInf-p.cInf)*k,focus:d.focus};};
export const focusAt=(id:number,f:number):V3=>{const d=dofAt(f);return d.focus?d.focus(f):camAt(id,f).look;};
export function cameraAt(frame:number){const c=camAt(shotAt(frame).id,frame);return{pos:c.pos,aim:c.look,fov:c.fov,roll:c.roll,blur:dofAt(frame).cInf};}

/** Pure frame-driven acting channels. Rig owners map channels to repository poses/face options.
 * No narrator speed change, no clock/state accumulation, no per-frame random motion.
 */
const rise=(f:number,a:number,b:number)=>glide((f-a)/Math.max(1,b-a));
const window=(f:number,a:number,b:number,edge=6)=>rise(f,a,a+edge)*(1-rise(f,b-edge,b));
export const ACTION_TIMES={
 bossWave:[1170,1210],bossRecognition:[1313,1327],eyeLock:[1349,1359],
 foamDrop:[1413,1447],foamAftermath:[1448,1462],duck:[1584,1607],
 bossStandAnticipate:[1955,1967],bossStandRise:[1967,1986],bossStandSettle:[1986,1997],
} as const;
// Contact points are local-to-root. The beer insert's camera is aimed at its actual cup center.
export const PROP_ANCHORS={bossBeerHand:[.55,1.40,.505] as V3,bossBeerScale:1.65,
 employeeFoamHigh:[-.58,1.96,.505] as V3,employeeFoamLow:[-.58,.94,.505] as V3};
export function actorBeatAt(f:number){
 const stadium=f>=456&&f<1640,meeting=f>=1922;
 const cheer=window(f,918,1103,10),notice=rise(f,1101,1115),recognition=rise(f,1313,1327);
 const lock=rise(f,1349,1359),foamLower=rise(f,1413,1447),duck=rise(f,1584,1607);
 const stand=rise(f,1967,1986),standAnticipate=window(f,1955,1972,6);
 return{
  employee:{sick:window(f,0,376,8),cough:window(f,104,121,3)+window(f,140,157,3),
   grin:window(f,393,456,8),cheer,notice:stadium?notice:0,gazeToBoss:stadium?lock:0,
   foamLower:stadium?foamLower:0,duck:stadium?duck:0,walk:window(f,1664,1700,7),
   nervous:window(f,1640,1812,8),noteRead:window(f,1753,1881,8),relief:window(f,1882,1922,7),
   meetingGlance:meeting?rise(f,2158,2168):0,seated:stadium||meeting?1:0},
  boss:{sigh:window(f,276,296,5),wave:stadium?window(f,1170,1317,6):0,
   recognition:stadium?recognition:0,gazeToEmployee:stadium?lock:meeting?rise(f,2144,2155):0,
   beerLower:stadium?rise(f,1327,1342):0,standAnticipate:meeting?standAnticipate:0,
   stand:meeting?stand:0,seated:meeting?1-stand:1,announce:window(f,1998,2143,7),
   glance:meeting?rise(f,2144,2155):0},
  crowdEnergy:stadium?(f<680?.15:f<1085?.95:mix(.55,.06,rise(f,1308,1330))):0,
  boardOn:rise(f,635,642),
 };
}
