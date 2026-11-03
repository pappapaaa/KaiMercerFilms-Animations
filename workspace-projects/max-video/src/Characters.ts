/** Actual MIT repo bodyFront/headBlob/face library/cardShade, with only role/outfit/action adapters. */
import * as THREE from 'three';
import {Pen,bodyFront,bodySide,headBlob,Outfit,Expr,FrontOpts,INK,SKIN,fxContact,fxShadow} from './vendor/toon';
import {cardShade,blobMaterial,CARD_K} from './vendor/cardshade';
export type CharacterRole='narrator'|'girlfriend'|'harlan'|'Harlan'|'paramedic'|'employee'|'boss'|'kid'|'grandma'|'fan';
export type Costume='pajamas'|'casual'|'cardigan'|'medic'|'jersey'|'office'|'hawaiian';
export type XYZ=[number,number,number];
export type CharacterPose={time:number;walk?:number;travel?:number;profileBody?:boolean|1|-1;profileStride?:number;groundShadow?:boolean;seated?:number;expression?:string;mood?:string;mouth?:number;gaze?:[number,number];headYaw?:number;headView?:-1|0|1;headTilt?:number;lean?:number;handL?:XYZ;handR?:XYZ;armL?:XYZ;armR?:XYZ;blink?:number;light?:number};
export type CharacterRig={root:THREE.Group;head:THREE.Group;leftHand:THREE.Group;rightHand:THREE.Group;handL:THREE.Group;handR:THREE.Group;hip:THREE.Group;pose:(p:CharacterPose)=>void;dispose:()=>void};
export const CHARACTER_METRICS={standingHeight:2.94,standingHip:1.20,seatedHip:.89,seatedBodyBottom:.79,faceDiameter:.89,seatDepth:.58};
const SU=.00375,NOINK=3;
/** Unchanged repo bodySide uses 370*stride design units each half-cycle. */
export const HUMAN_SIDE_METRICS={stride:.31,cycleDistance:2*370*.31*SU,designScale:SU};
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const rnd=(s:number,k:number)=>{const n=Math.sin(s*127.1+k*311.7)*43758.5453;return n-Math.floor(n);};
const P=(x:number,y:number,z=0)=>new THREE.Vector3(x,y,z);
const designToLocal=(p:[number,number])=>P((p[0]-300)*SU,(975-p[1])*SU,.045);
const makeTex=(canvas:HTMLCanvasElement)=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
const makeCanvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
// Original cast.ts blink cadence: half/shut/shut/half, 0.5–2.3s seeded intervals.
const LID=[.5,1,1,.5];
function lidAt(t:number,i:number){const f=Math.round(t*30);let s=Math.round(-60*rnd(i,9));for(let n=0;s<=f&&n<400;n++){const k=f-s;if(k>=0&&k<4)return LID[k];s+=Math.round(15+54*rnd(i*31+n,13));}return 0;}
function outfit(role:CharacterRole,costume:Costume,seed:number):Outfit{
 const o:Outfit={jacket:costume==='pajamas'?'#82b4b2':costume==='hawaiian'?'#e47d61':costume==='jersey'?'#f3e6c8':'#eee3cc',pants:costume==='pajamas'?'#4d747d':'#33464f',boots:INK,hat:'hair',hair:'#665044',skin:SKIN,build:'adult',belt:null,rifle:false,sword:false,buttons:costume==='hawaiian'?'#fbe1ad':'#668a88'};
 if(role==='narrator'){o.hair='#594535';o.jacket=costume==='pajamas'?'#82a9b2':'#c88a59';o.pants=costume==='pajamas'?'#4a6676':'#3d5861';o.skin='#f5c9a0';if(costume==='pajamas')o.boots='#e5e2cf';}
 if(role==='girlfriend'){o.hair='#423747';o.jacket=costume==='pajamas'?'#b29cbd':'#b97072';o.dress=costume==='pajamas'?'#9b829f':'#a5676e';o.pants='#625672';o.skin='#ffe2c2';}
 if(role==='harlan'||role==='Harlan'){o.hair='#d2cdca';o.moustache='#bfb8b3';o.jacket='#86a29c';o.pants='#6a635c';o.skin='#ecd0b6';o.buttons='#e6dbbf';}
 if(role==='paramedic'){o.hair=seed%2?'#3d363a':'#7b5944';o.jacket='#477c88';o.pants='#304c59';o.boots='#28363c';o.skin=seed%2?'#c99067':'#f5c9a0';o.buttons='#dce4d4';}
 if(role==='boss'){o.build='stout';o.hair='#675042';o.moustache='#584034';}
 if(role==='kid'){o.build='kid';o.hat='cap';o.cap='#d86d54';o.jacket='#6caaa5';o.boots='#f4e5c9';}
 if(role==='grandma'){o.hair='#aaa7ab';o.jacket='#859f9f';o.dress='#6e9690';}
 if(role==='fan'){o.jacket=['#698e9d','#d7ac64','#bd7969','#8a9c71'][seed%4];o.hair=['#514139','#9e7960','#403b40','#6b4e3b'][seed%4];if(seed%3===1){o.hat='cap';o.cap='#507f79';}}
 return o;
}
function expression(s:string,time:number):Expr{
 const legal:Expr[]=['neutral','stern','grin','laugh','whistle','nervous','shock','relief','relief_open','dazed','pained','smile','smile_closed','lick'],e=s.toLowerCase();
 if(/chew|eat/.test(e))return Math.sin(time*9)>0?'lick':'smile';
 if(legal.includes(e as Expr))return e as Expr;
 if(/shock|surpris|caught|panic|fear|stunned/.test(e))return 'shock';
 if(/sick|sad|tired|worr/.test(e))return 'pained';
 if(/angry|suspici|deadpan/.test(e))return 'stern';
 if(/awkward|uneasy|nerv/.test(e))return 'nervous';
 if(/happy|joy|grin|proud|smug|amused/.test(e))return 'grin';
 if(/relief|relax/.test(e))return 'relief';return 'neutral';
}
function decorate(costume:Costume,seed:number):FrontOpts['decor']{
 return (p,cx,cy,w,h)=>{
  if(costume==='hawaiian')for(let i=0;i<16;i++){
   const x=cx+(rnd(seed+61,i)*2-1)*w,y=cy+(rnd(seed+84,i)*2-1)*h;
   for(let k=0;k<5;k++){const a=k*Math.PI*2/5;p.ell(x+10*Math.cos(a),y+10*Math.sin(a),9,5,'#ffe7b4',0,0,360,a*180/Math.PI);}
   p.dot(x,y,3.5,'#d7aa4e');p.stroke([[x+12,y+14],[x+20,y+27],[x+26,y+11]],3,'#487c6a');
  }else if(costume==='medic'){
   p.stroke([[cx-w*.85,cy+h*.18],[cx+w*.85,cy+h*.18]],10,'#d9dfb5');
   p.poly([[cx-w*.65,cy-h*.45],[cx-w*.2,cy-h*.45],[cx-w*.2,cy-h*.07],[cx-w*.65,cy-h*.07]],'#e6e8da',2);
   p.stroke([[cx-w*.43,cy-h*.38],[cx-w*.43,cy-h*.14]],5,'#477c88');p.stroke([[cx-w*.55,cy-h*.26],[cx-w*.31,cy-h*.26]],5,'#477c88');
  }else if(costume==='cardigan'){
   p.stroke([[cx,cy-h*.8],[cx,cy+h*.8]],4,'#536f69');
   p.stroke([[cx-w*.74,cy+h*.38],[cx-w*.3,cy+h*.38]],4,'#536f69');
  }else if(costume==='jersey'){
   for(let x=cx-w;x<cx+w;x+=18)p.stroke([[x,cy-h],[x+2,cy+h]],1.6,'#8fa99c');
   p.stroke([[cx-w,cy-h+27],[cx,cy-h+36],[cx+w,cy-h+27]],7,'#467c79');
  }else if(costume==='pajamas')for(let x=cx-w;x<cx+w;x+=16)p.stroke([[x,cy-h],[x+4,cy+h]],2,'#b4d0c2');
  else if(costume==='office')p.poly([[cx-5,cy-h+27],[cx+5,cy-h+27],[cx+12,cy+h*.38],[cx,cy+h*.55],[cx-12,cy+h*.38]],'#b86453',2);
 };
}
export function makeCharacter(role:CharacterRole,costume:Costume='jersey',seed=0):CharacterRig{
 const root=new THREE.Group();root.name='Repo bodyFront / Max story: '+role+' / '+costume;root.userData={source:'claude-animated-shorts/templates/bridge/toon.ts bodyFront',adaptations:['costume','seat interpolation','exact grip hooks'],standingHeight:2.94,seatBodyBottom:.79};
 const c=makeCanvas(900,1500),ctx=c.getContext('2d')!,tex=makeTex(c),geo=new THREE.PlaneGeometry(600*SU,1000*SU);geo.translate(0,(975-500)*SU,0);
 const mat=cardShade(new THREE.MeshLambertMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide}));mat.alphaToCoverage=false;
 // Register the original shader's fixed head/body zones to the seated drawing; formulas/presets are unchanged.
 const poseShift={value:0},cardCompile=mat.onBeforeCompile;
 mat.onBeforeCompile=(shader,renderer)=>{cardCompile(shader,renderer);shader.uniforms.uPoseShift=poseShift;shader.fragmentShader=shader.fragmentShader
  .replace('uniform vec3 uCharTint;','uniform float uPoseShift; uniform vec3 uCharTint;')
  .replace('smoothstep( 0.565, 0.6, vMapUv.y )','smoothstep( 0.565, 0.6, vMapUv.y + uPoseShift )')
  .replace('( vMapUv.y - 0.69 ) / 0.11','( vMapUv.y + uPoseShift - 0.69 ) / 0.11')
  .replace('step( 0.27, vMapUv.y ) * step( vMapUv.y, 0.57 )','step( 0.27, vMapUv.y + uPoseShift ) * step( vMapUv.y + uPoseShift, 0.57 )');};
 mat.customProgramCacheKey=()=> 'card9-fancam-seat-registration';
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.5,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geo,mat);mesh.name='Actual repo character card';mesh.customDepthMaterial=depth;mesh.receiveShadow=true;mesh.castShadow=false;mesh.renderOrder=1;mesh.layers.set(NOINK);root.add(mesh);
 mesh.onBeforeRender=r=>{const rt=r.getRenderTarget();CARD_K.uPx.value=(rt?rt.height:r.domElement.height)/1920;};
 const head=new THREE.Group(),handL=new THREE.Group(),handR=new THREE.Group(),hip=new THREE.Group();head.name='actual drawn head center';handL.name='actual drawn left hand';handR.name='actual drawn right hand';hip.name='actual hip / seat contact';root.add(head,handL,handR,hip);
 const o=outfit(role,costume,seed),decor=decorate(costume,seed);
 const sc=makeCanvas(128,128);fxContact(new Pen(sc.getContext('2d')!),'#7c7e9b');
 const st=makeTex(sc);st.generateMipmaps=false;st.minFilter=THREE.LinearFilter;const blob=new THREE.Mesh(new THREE.PlaneGeometry(.91,.70),blobMaterial(st));blob.name='Human contact shadow';blob.rotation.x=-Math.PI/2;blob.position.set(0,.022,.03);blob.layers.set(NOINK);blob.renderOrder=.5;root.add(blob);
 const tailCanvas=makeCanvas(128,256);fxShadow(new Pen(tailCanvas.getContext('2d')!),'#adb1ce');const tailTex=makeTex(tailCanvas);tailTex.generateMipmaps=false;tailTex.minFilter=THREE.LinearFilter;
 const tail=new THREE.Mesh(new THREE.PlaneGeometry(1.25,2.48),blobMaterial(tailTex));tail.name='Human directional floor shadow';tail.rotation.set(-Math.PI/2,0,-1.2);tail.position.set(-.62,.018,.22);tail.layers.set(NOINK);tail.renderOrder=.4;root.add(tail);
 const pose=(a:CharacterPose)=>{
  const walk=clamp(a.walk??0),walkMode:FrontOpts['mode']=walk>.65?'march':walk>.001?'stroll':'stand',walkPhase=a.travel===undefined?a.time*1.55:a.travel/.8;
  const profile=!!a.profileBody,profileFacing=a.profileBody===-1?-1:1;
  const seat=profile?0:clamp(a.seated??0),gaze=a.gaze??[0,0],tilt=clamp(a.lean??0,-.3,.3)*180/Math.PI;
  const H=headBlob(seed+1,o.build==='kid'?112:118,0),HH=H.b*2,build=o.build==='stout'?{torso:1.15,legs:1.32}:o.build==='kid'?{torso:.85,legs:1}:{torso:1.1,legs:1.4};
  // The original torso bottom lies .12HH below its anatomical hip. Place the BOTTOM above the .78 seat top.
  const seatHipDesign=975-.79/SU-.12*HH;
  const standingHip=975-build.legs*HH-.12*HH,walkBob=walkMode==='march'?.025*(1+build.torso+build.legs)*HH*Math.cos(4*Math.PI*walkPhase):walkMode==='stroll'?.015*(1+build.torso+build.legs)*HH*Math.cos(4*Math.PI*walkPhase):0,walkSway=(walkMode==='march'?1.6:walkMode==='stroll'?1:0)*Math.sin(2*Math.PI*walkPhase),hipY=standingHip+walkBob+(seatHipDesign-standingHip-walkBob)*seat,A=(tilt+walkSway)*Math.PI/180;
  const toDesign=(hand:XYZ|undefined):[number,number]|undefined=>{if(!hand)return undefined;const x=hand[0]/SU+300,y=975-hand[1]/SU,dx=x-300,dy=y-hipY;return [300+dx*Math.cos(A)+dy*Math.sin(A),hipY-dx*Math.sin(A)+dy*Math.cos(A)];};
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.setTransform(1.5,0,0,1.5,0,0);
  const blink=a.blink??(Math.abs(gaze[0])>.6?0:lidAt(a.time,seed));
  // Scene supplies a word-timed, deterministic aperture (typically .30–.52).
  // Keep the chosen emotion while talking; rests at .02/.03 use the source
  // mouth unchanged. No clock, random oscillator or whole-face substitution.
  const mouthOpen=(a.mouth??0)>.1?clamp(a.mouth??0):0;
  poseShift.value=(hipY-standingHip)/1000;
  if(profile){
   // This is the actual source bodySide, not a redrawn walk. Pen interception records
   // its real stroke contacts and attaches the existing costume decoration only.
   const stride=clamp(a.profileStride??HUMAN_SIDE_METRICS.stride,.2,1.15),cycleDistance=2*370*stride*SU;
   const phase=(a.travel??a.time*1.25)/cycleDistance,walking=walk>.001;
   const pen=new Pen(ctx),u=(o.build==='kid'?112:118)*2/100;
   const hands:[number,number][]=[],feet:{x:number;y:number;planted:boolean;phase:number}[]=[];
   let sideHead:[number,number]|undefined,sideHip:[number,number]|undefined;
   if(profileFacing<0)ctx.setTransform(-1.5,0,0,1.5,c.width,0);
   const dot=pen.dot.bind(pen),stroke=pen.stroke.bind(pen),grad=pen.gradFill.bind(pen),shaded=pen.shadedFill.bind(pen);
   pen.dot=(x,y,r,col)=>{if(Math.abs(r-5.5*u)<1e-6)hands.push(pen.P(x,y));dot(x,y,r,col);};
   pen.stroke=(pts,w,col)=>{
    if(Math.abs(w-7.5*u)<1e-6&&pts.length===2){
     const index=feet.length,ph=((phase+(index===0?.5:0))%1+1)%1;
     const p0=pen.P(pts[0][0],pts[0][1]),p1=pen.P(pts[1][0],pts[1][1]);
     // Actual source ankle recovered from footStroke endpoints; stance is horizontal.
     const x=p0[0]+3*u*(p1[0]-p0[0])/Math.hypot(p1[0]-p0[0],p1[1]-p0[1]-.5*u);
     const sole=Math.max(p0[1],p1[1])+w/2;
     feet.push({x:(x-300)*SU*profileFacing,y:(975-sole)*SU,planted:!walking||ph<.5,phase:ph});
    }
    stroke(pts,w,col);
   };
   pen.gradFill=(pts,base,shadow,light,flat)=>{
    grad(pts,base,shadow,light,flat);
    if(base===o.jacket){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),loX=Math.min(...xs),hiX=Math.max(...xs),loY=Math.min(...ys),hiY=Math.max(...ys);pen.clip(pts,()=>decor?.(pen,(loX+hiX)/2,(loY+hiY)/2,(hiX-loX)/2,(hiY-loY)/2));if(pen.rot)sideHip=[pen.rot[1],pen.rot[2]];}
   };
   pen.shadedFill=(pts,base,shadow,light,R,shift,r0,r1)=>{
    shaded(pts,base,shadow,light,R,shift,r0,r1);
    if(base===o.skin){const ps=pts.map(p=>pen.P(p[0],p[1]));sideHead=[(Math.min(...ps.map(p=>p[0]))+Math.max(...ps.map(p=>p[0])))/2,(Math.min(...ps.map(p=>p[1]))+Math.max(...ps.map(p=>p[1])))/2];}
   };
   bodySide(pen,o,{mode:walking?'march':'stand',phase,stride,stomp:1,expr:expression(a.expression??a.mood??'neutral',a.time),mouthOpen,blink,seed:seed+1,light:a.light??-Math.PI/4});
   const hook=(g:THREE.Group,pt:[number,number])=>{g.position.copy(designToLocal(pt));g.position.x*=profileFacing;};
   hook(head,sideHead??[300,331]);hook(hip,sideHip??[300,standingHip]);
   hook(handL,hands[0]??[300,600]);hook(handR,hands[1]??hands[0]??[300,600]);
   poseShift.value=((sideHip?.[1]??standingHip)-standingHip)/1000;
   root.userData.footContacts=feet;root.userData.profileBody={source:'unchanged vendor/toon.ts bodySide',phase,travel:a.travel??a.time*1.25,cycleDistance,stride,facing:profileFacing,handTargetsIgnored:true};
  }else{
  bodyFront(new Pen(ctx),o,{mode:walkMode,phase:walkPhase,lift:55*walk,seated:seat,seatedHipDesignY:seatHipDesign,expr:expression(a.expression??a.mood??'neutral',a.time),mouthOpen,look:clamp(gaze[0],-1,1)*2.2,blink,tilt,headTilt:a.headTilt??clamp(gaze[1],-1,1)*2.5,profile:a.headView??0,facing:(a.headYaw??0)>.15?1:(a.headYaw??0)<-.15?-1:0,seed:seed+1,light:a.light??-Math.PI/4,decor,
   handL:toDesign(a.handL??a.armL),handR:toDesign(a.handR??a.armR),
   onPose:p=>{head.position.copy(designToLocal(p.head));hip.position.copy(designToLocal(p.hip));handL.position.copy(designToLocal(p.hands[0]));handR.position.copy(designToLocal(p.hands[1]));}
  });
   root.userData.footContacts=undefined;root.userData.profileBody=undefined;
  }
  handL.rotation.set(0,0,0);handR.rotation.set(0,0,0);head.rotation.set(0,0,-(tilt+walkSway)*Math.PI/180);hip.rotation.set(0,0,0);
  // Prop contacts are exactly on the character card, not independently floating at supplied arbitrary z.
  // Seat forward offset belongs to the WORLD, not the billboard yaw: do not slide sideways into armrests.
  const seatOffset=P(0,0,.44*seat).applyQuaternion(root.quaternion.clone().invert());mesh.position.copy(seatOffset);
  handL.position.z=.065;handR.position.z=.065;head.position.z=.070;hip.position.z=.045;
  handL.position.add(seatOffset);handR.position.add(seatOffset);head.position.add(seatOffset);hip.position.add(seatOffset);
  blob.position.copy(P(0,.022,.03).add(seatOffset));tail.position.copy(P(-.62,.018,.22).add(seatOffset));
  blob.visible=tail.visible=a.groundShadow??true;
  tex.needsUpdate=true;root.updateMatrixWorld(true);
 };
 pose({time:0});
 return {root,head,hip,leftHand:handL,rightHand:handR,handL,handR,pose,dispose:()=>{geo.dispose();mat.dispose();depth.dispose();tex.dispose();blob.geometry.dispose();(blob.material as THREE.Material).dispose();st.dispose();tail.geometry.dispose();(tail.material as THREE.Material).dispose();tailTex.dispose();}};
}
export const createCharacter=makeCharacter;
