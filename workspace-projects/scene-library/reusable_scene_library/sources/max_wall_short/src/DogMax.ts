/** Max: original quadruped artwork, drawn with the actual MIT repo Pen and cardShade.
 * No human body/limbs are reused for the dog. Four canine paws share floor y=0.
 * Card faces +Z, muzzle points +X by default. All anchors are exact drawing points.
 */
import * as THREE from 'three';
import {Pen,INK,fxContact,fxShadow,mul} from './vendor/toon';
import {cardShade,blobMaterial,CARD_K} from './vendor/cardshade';
export type MaxAction='idle'|'alert'|'bark'|'howl'|'whine'|'scratch'|'sniff'|'walk'|'return'|'eat'|'happy';
export type MaxPose={time:number;action?:MaxAction;phase?:number;facing?:1|-1;bark?:number;howl?:number;whine?:number;scratch?:number;scratchReach?:number;sniff?:number;eat?:number;lean?:number;gaze?:[number,number];happy?:number;walk?:number;travel?:number;strideLength?:number;energy?:number;earAlert?:number;headTilt?:number;blink?:number;tail?:number};
export type MaxRig={root:THREE.Group;head:THREE.Group;muzzle:THREE.Group;collar:THREE.Group;frontPaw:THREE.Group;pawFL:THREE.Group;pawFR:THREE.Group;pawBL:THREE.Group;pawBR:THREE.Group;pose:(p:MaxPose)=>void;dispose:()=>void};
const U=.0024,W=1000,H=700,FLOOR=660,NOINK=3;
export const MAX_METRICS={floor:0,shoulderHeight:.78,headTop:1.22,bodyLength:1.38,totalLength:2.18,cardWidth:W*U,cardHeight:H*U,collar:[.42,.67,.055] as const,muzzle:[.89,.80,.055] as const,scratchWallX:.91,scratchHeight:.65,strideLength:.62};
type P2=[number,number];
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const rot=(q:P2,c:P2,a:number):P2=>[c[0]+(q[0]-c[0])*Math.cos(a)-(q[1]-c[1])*Math.sin(a),c[1]+(q[0]-c[0])*Math.sin(a)+(q[1]-c[1])*Math.cos(a)];
const canvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const tex=(c:HTMLCanvasElement)=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
const COL={fur:'#bd8856',shade:'#936e58',cream:'#ecd4a7',far:'#967155',ear:'#745345',nose:'#30232a',tongue:'#d1817d',collar:'#528d8d'};
/** Draw a thick-thin, softly painted ellipse using the actual repo Pen API. */
function bean(p:Pen,cx:number,cy:number,rx:number,ry:number,color:string,angle=0){const pts:P2[]=[];for(let i=0;i<56;i++){const a=i/56*Math.PI*2;pts.push(rot([cx+rx*Math.cos(a)*(1+.025*Math.sin(a*3)),cy+ry*Math.sin(a)], [cx,cy],angle));}p.gradFill(pts,color,mul(color,[.79,.77,.83]),-Math.PI/3,.35);p.inkRing(pts,8.0,Math.PI/2,.34);}
/** Periodic gait: stance phase travels backward linearly to cancel world travel.
 * For zero foot slip, pass monotonically increasing travel (metres) matching root movement.
 */
export function maxFootPhase(travel:number,offset:number,amount=1,strideLength=MAX_METRICS.strideLength){const phase=((travel/strideLength+offset)%1+1)%1,stance=.63;let x:number,y:number;if(phase<stance){x=mix(strideLength*stance/(2*U),-strideLength*stance/(2*U),phase/stance);y=0;}else{const s=(phase-stance)/(1-stance);x=mix(-strideLength*stance/(2*U),strideLength*stance/(2*U),smooth(s));y=Math.sin(Math.PI*s)*48;}return {x:x*amount,y:y*amount,planted:phase<stance||amount<.001,phase};}
export function makeMax(seed=41):MaxRig{
 const root=new THREE.Group();root.name='Max / canine illustrated card';root.userData={source:'repo Pen / cardShade / fxContact',anatomy:'four paws, canine hocks, no human hands',axes:'card XY, front +Z, muzzle +X',floorY:0};
 const c=canvas(1500,1050),ctx=c.getContext('2d')!,map=tex(c),geo=new THREE.PlaneGeometry(W*U,H*U);geo.translate(0,(FLOOR-H/2)*U,0);
 const mat=cardShade(new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide}));mat.alphaToCoverage=false;
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map,alphaTest:.5,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geo,mat);mesh.name='Max actual drawn dog';mesh.layers.set(NOINK);mesh.customDepthMaterial=depth;mesh.receiveShadow=true;mesh.renderOrder=1;root.add(mesh);
 mesh.onBeforeRender=r=>{CARD_K.uPx.value=(r.getRenderTarget()?.height??r.domElement.height)/1920;};
 const head=new THREE.Group(),muzzle=new THREE.Group(),collar=new THREE.Group(),pawFL=new THREE.Group(),pawFR=new THREE.Group(),pawBL=new THREE.Group(),pawBR=new THREE.Group();
 const anchors={head,muzzle,collar,pawFL,pawFR,pawBL,pawBR};Object.entries(anchors).forEach(([n,g])=>{g.name='Max drawn '+n;root.add(g);});
 const sc=canvas(128,128);fxContact(new Pen(sc.getContext('2d')!),'#7c7e9b');const st=tex(sc);st.generateMipmaps=false;st.minFilter=THREE.LinearFilter;const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.78,.67),blobMaterial(st));shadow.rotation.x=-Math.PI/2;shadow.position.set(-.1,.018,.02);shadow.layers.set(NOINK);shadow.renderOrder=.5;root.add(shadow);
 const tc=canvas(128,256);fxShadow(new Pen(tc.getContext('2d')!),'#adb1ce');const tt=tex(tc);tt.generateMipmaps=false;tt.minFilter=THREE.LinearFilter;const tailShadow=new THREE.Mesh(new THREE.PlaneGeometry(1.52,1.32),blobMaterial(tt));tailShadow.rotation.set(-Math.PI/2,0,-1.2);tailShadow.position.set(-.42,.014,.32);tailShadow.layers.set(NOINK);tailShadow.renderOrder=.4;root.add(tailShadow);
 const pose=(a:MaxPose)=>{
  const time=a.time,action=a.action??'idle',facing=a.facing??1,phase=a.phase??time,energy=clamp(a.energy??1),act=(name:MaxAction)=>action===name?1:0;
  const bark=clamp(a.bark??act('bark')),howl=clamp(a.howl??act('howl')),whine=clamp(a.whine??act('whine')),scratch=clamp(a.scratch??act('scratch')),sniff=clamp(a.sniff??act('sniff')),eat=clamp(a.eat??act('eat')),happy=clamp(a.happy??act('happy'));
  const scratchReach=clamp(a.scratchReach??MAX_METRICS.scratchWallX,.65,1.15);
  const strideLength=clamp(a.strideLength??MAX_METRICS.strideLength,.35,1.25);
  const walk=clamp(a.walk??Math.max(act('walk'),act('return'))),travel=a.travel??time*.50,earAlert=clamp(a.earAlert??Math.max(act('alert'),bark,howl,scratch,.45));
  const pulse=Math.pow(Math.max(0,Math.sin(phase*12.6)),2.2)*bark*energy,chew=(.5+.5*Math.sin(phase*13))*eat;
  const breath=Math.sin(time*2.2+seed)*1.4,down=clamp(sniff+eat),headAngle=(-.095*pulse-.58*howl+1.22*down+.09*whine+(a.headTilt??0));
  const pivot:P2=[648,385],headShift:P2=[8*pulse+8*(a.lean??0),-4*pulse+breath];
  const tr=(pt:P2):P2=>{const q=rot(pt,pivot,headAngle);return[q[0]+headShift[0],q[1]+headShift[1]];};
  const hook=(g:THREE.Group,pt:P2,z=.055)=>g.position.set((pt[0]-W/2)*U*facing,(FLOOR-pt[1])*U,z);
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.setTransform(1.5*facing,0,0,1.5,facing<0?1500:0,0);const p=new Pen(ctx);p.ol=7;
  const bodyY=440+breath+3*pulse+Math.sin(travel*16)*2*walk;
  // Tail has an anatomical root at the rump; worry lowers it, reward loosens it.
  const wag=(a.tail??(.20+.52*happy+.15*walk))*Math.sin(time*(happy?11:5)+seed),tailTipY=330+100*whine-65*happy+wag*90;
  p.line([[236,bodyY-22],[174,bodyY-70],[127,tailTipY+35],[93+wag*16,tailTipY]],COL.fur,33);
  p.line([[109+wag*10,tailTipY+24],[93+wag*16,tailTipY]],COL.cream,26,false);
  const feet=[{g:pawBR,x:293,far:true,front:false,off:.5},{g:pawFR,x:635,far:true,front:true,off:0},{g:pawBL,x:253,far:false,front:false,off:0},{g:pawFL,x:606,far:false,front:true,off:.5}];
  const contacts:any[]=[];
  const drawLeg=(leg:typeof feet[number])=>{
   const gait=maxFootPhase(travel,leg.off,walk,strideLength),lift=gait.y;let foot:P2=[leg.x+gait.x+(leg.front?35:0),FLOOR-lift];
   const claw=leg===feet[3]?scratch:0,clawCycle=.5+.5*Math.sin(phase*16),clawX=500+scratchReach/U,clawY=FLOOR-MAX_METRICS.scratchHeight/U;
   if(claw>0)foot=[mix(foot[0],clawX-41,claw),mix(foot[1],clawY+clawCycle*38,claw)];
   const top:P2=[leg.x,bodyY+(leg.front?15:21)],knee:P2=leg.front?[mix(leg.x,foot[0]-.0,.43),mix(bodyY+15,foot[1]-20,.52)]:[leg.x+45,mix(bodyY+21,foot[1]-20,.49)],ankle:P2=[foot[0]-(leg.front?11:15),foot[1]-28];
   const color=leg.far?COL.far:COL.fur;p.line([top,knee,ankle],color,leg.front?38:44);
   bean(p,foot[0]+6,foot[1]-13,35,13,leg.far?COL.shade:COL.cream);
   // Tiny toe separations are on the paw, never finger-like appendages.
   if(!leg.far){p.stroke([[foot[0]+17,foot[1]-14],[foot[0]+17,foot[1]-3]],2.3);p.stroke([[foot[0]+29,foot[1]-13],[foot[0]+28,foot[1]-5]],2.3);}
   hook(leg.g,[foot[0]+41*claw,foot[1]-13*claw]);contacts.push({name:leg.g.name,y:leg.g.position.y,planted:gait.planted&&!claw,x:leg.g.position.x});
  };
  // Four separate canine limbs, far pair behind torso and near pair in front.
  drawLeg(feet[0]);drawLeg(feet[1]);bean(p,430,bodyY,237,104,COL.fur,-.035);bean(p,566,bodyY-10,92,104,COL.fur,-.13);
  // Warm cream chest follows real chest silhouette rather than human-shirt geometry.
  p.poly([[579,bodyY-75],[626,bodyY-91],[663,bodyY-43],[633,bodyY+61],[597,bodyY+68]],COL.cream,0);
  drawLeg(feet[2]);drawLeg(feet[3]);
  ctx.save();ctx.translate(headShift[0]+pivot[0],headShift[1]+pivot[1]);ctx.rotate(headAngle);ctx.translate(-pivot[0],-pivot[1]);
  // Neck connects the shoulder to the skull through all sniff/howl poses.
  p.line([[604,bodyY-43],[651,362],[695,311]],COL.fur,104);
  // Back ear is visibly separate and reacts one beat later than the near ear.
  const flop=(1-earAlert)*31+whine*40+Math.sin(phase*10+.9)*pulse*19;
  bean(p,681,257,46,88,COL.ear,-.55-.003*flop);
  bean(p,728,277,108,100,COL.fur,-.12);
  // White muzzle and canine wedge nose give Max an unambiguous dog profile.
  bean(p,811,329,76,48,COL.cream,-.06);
  const open=clamp(.02+pulse*.95+howl*.91+whine*.17+chew*.36);
  if(open>.08){p.poly([[779,339],[867,335],[855,354+open*47],[813,363+open*45],[783,354]],'#57323a',6);bean(p,824,361+open*32,31,11,COL.tongue,.05);p.stroke([[788,346],[817,355],[854,349]],4,COL.cream);}
  else p.stroke([[784,347],[816,351],[856,340]],4.7);
  p.poly([[849,303],[877,307],[880,326],[864,336],[847,325]],COL.nose,6);p.dot(870,314,3,'#493a3d');
  // Lidded no-catchlight eyes share the repo's deadpan expression vocabulary.
  const blink=a.blink??(((Math.floor(time*30+seed*7)%67)>=63)?1:0),gaze=clamp(a.gaze?.[0]??.7,-1,1),eyeY=278-4*howl+5*whine;
  if(blink>.6)p.stroke([[742,eyeY+4],[767,eyeY+5]],5);
  else{bean(p,754,eyeY,15,18*(1-.65*blink),'#f4e6ca');p.ell(759+gaze*3,eyeY+2,5.5,10*(1-.6*blink),INK,0);}
  p.stroke([[739,eyeY-27+whine*12],[758,eyeY-29],[770,eyeY-24-7*whine]],5.7);
  // Near ear, supple but rooted to skull, not disconnected spring parts.
  const earY=292+flop*.55,earX=690-flop*.20;bean(p,earX,earY,45,86,COL.ear,-.33+flop*.005+happy*.15);
  p.stroke([[earX-12,earY-39],[earX-20,earY+13],[earX-10,earY+48]],3.6,'#a17a5e');
  // Soft collar is anatomically around the neck; bronze tag is dog identity, not text.
  p.line([[640,374],[670,397],[699,398]],COL.collar,22);
  p.ell(678,412,12,14,'#d9b972',5);p.dot(678,412,3.2,'#8c734d');
  ctx.restore();
  // Whisker ticks (not human mouth detail).
  const hp=tr([728,277]),mp=tr([879,320]),cp=tr([675,397]);hook(head,hp);hook(muzzle,mp);hook(collar,cp);
  head.rotation.z=-headAngle*facing;muzzle.rotation.z=-headAngle*facing;collar.rotation.z=-headAngle*facing;
  root.userData.contacts=contacts;root.userData.pose={time,action,bark:pulse,howl,whine,scratch,sniff,eat,walk,facing,headAngle,strideLength,scratchReach};root.userData.mouthOpen=open;
  shadow.scale.set(1+walk*.025,1,1);shadow.position.x=-.1*facing;map.needsUpdate=true;root.updateMatrixWorld(true);
 };
 pose({time:0});return{root,head,muzzle,collar,frontPaw:pawFL,pawFL,pawFR,pawBL,pawBR,pose,dispose:()=>{geo.dispose();map.dispose();mat.dispose();depth.dispose();shadow.geometry.dispose();(shadow.material as THREE.Material).dispose();st.dispose();tailShadow.geometry.dispose();(tailShadow.material as THREE.Material).dispose();tt.dispose();}};
}
export const makeDog=makeMax;
