/** Original painted/ink Fan Cam props. All grip roots are the exact contact point for a hand anchor. */
import * as THREE from 'three';
import {Pen, INK as CHARACTER_INK} from './vendor/toon';
import {twoTone} from './vendor/shade';
const INK='#291f2b',CREAM='#fff2d5',TEAL='#3e8d88',CORAL='#e77d64';
const NOINK=3;
function mat(color:THREE.ColorRepresentation){return color===INK?new THREE.MeshBasicMaterial({color,toneMapped:false}):twoTone(new THREE.MeshLambertMaterial({color}));}
function mesh(g:THREE.Object3D,geo:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.layers.set(NOINK);g.add(o);return o;}
function sphere(g:THREE.Object3D,x:number,y:number,z:number,s:[number,number,number],color:string){const o=mesh(g,new THREE.SphereGeometry(1,20,12),mat(color),x,y,z);o.scale.set(...s);return o;}
function card(g:THREE.Object3D,w:number,h:number,draw:(p:Pen,c:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=600;c.height=Math.round(600*h/w);const x=c.getContext('2d')!;draw(new Pen(x),x);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return mesh(g,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:false,alphaTest:.3,side:THREE.DoubleSide,toneMapped:false}));}

export function makePhone(){
 const g=new THREE.Group();g.name='phone — grip at lower-middle';
 mesh(g,new THREE.BoxGeometry(.25,.43,.051),mat(INK),0,.12,.025);
 mesh(g,new THREE.BoxGeometry(.211,.352,.009),mat('#b9d9cb'),0,.125,.055);
 mesh(g,new THREE.BoxGeometry(.075,.012,.011),mat(INK),0,.307,.061);
 mesh(g,new THREE.BoxGeometry(.075,.012,.011),mat('#edf3db'),0,-.025,.062);
 sphere(g,0,.15,.063,[.040,.040,.004],TEAL);
 g.userData={grip:[0,0,0],size:[.25,.43,.06]};return g;
}
export function makeBeer(){
 const g=new THREE.Group();g.name='giant stadium beer — exact side grip';
 // The handle center equals the grip origin; cup body sits to its left.
 const centerX=-.13;
 const bodyOutline=mat(INK);bodyOutline.side=THREE.BackSide;
 mesh(g,new THREE.CylinderGeometry(.155,.120,.46,28),bodyOutline,centerX,.12,0);
 mesh(g,new THREE.CylinderGeometry(.138,.105,.460,28),mat('#dfac48'),centerX,.120,.003);
 const handleOutline=mat(INK);handleOutline.side=THREE.BackSide;
 const hoop=mesh(g,new THREE.TorusGeometry(.112,.025,10,24),handleOutline,.024,.11,.0);
 const handle=mesh(g,new THREE.TorusGeometry(.112,.014,10,24),mat('#f0d295'),.029,.11,.0);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;sphere(g,centerX+Math.cos(a)*.085,.357+(i%2)*.015,Math.sin(a)*.08,[.064,.047,.064],CREAM);}
 mesh(g,new THREE.CylinderGeometry(.127,.127,.028,28),mat(CREAM),centerX,.355,0);
 const stripe=mesh(g,new THREE.BoxGeometry(.022,.29,.012),mat('#f7da8a'),centerX-.065,.14,.130);stripe.rotation.z=-.03;
 g.userData={grip:[0,.11,0],bodyCenter:[centerX,.12,0],size:[.40,.54,.31]};
 // Normalize grip center to group origin for direct attachment to a character hand.
 for(const o of g.children)o.position.y-=.11;
 // Surface the actual character's original ink-dot hand inside the now-visible handle loop.
 const grip=card(g,.060,.060,(p)=>p.dot(300,300,255,CHARACTER_INK));grip.name='Repo ink-dot grip in beer handle';grip.position.set(.024,0,.070);
 g.scale.setScalar(1.60);return g;
}
export function makeFoamFinger(){
 const g=new THREE.Group();g.name='original foam finger — grip at cuff';
 const o=card(g,.42,.82,(p)=>{
  const points:[number,number][]=[[176,1055],[157,763],[104,652],[88,520],[116,470],[157,475],[185,524],[178,194],[190,103],[222,74],[257,92],[273,154],[274,446],[310,418],[347,435],[360,468],[396,452],[430,483],[437,524],[479,529],[504,577],[507,772],[449,906],[426,1055]];
  p.poly(points,'#e7b759',17);p.stroke([[229,176],[232,580],[187,544]],16,INK);p.stroke([[300,508],[311,665]],14,INK);p.stroke([[372,532],[381,679]],13,INK);p.stroke([[442,590],[445,717]],13,INK);p.stroke([[174,947],[435,947]],15,INK);
 });o.position.y=.30;g.userData={grip:[0,0,0],size:[.42,.82,.02]};g.scale.setScalar(1.2);return g;
}
export function makeNote(text='Feel better soon.'){
 const g=new THREE.Group();g.name='handwritten note';
 const o=card(g,.59,.70,(p,c)=>{
  p.poly([[38,32],[535,20],[570,615],[530,672],[49,665]],CREAM,9);p.poly([[530,672],[530,615],[570,615]],'#daceb2',6);
  c.fillStyle=INK;c.textAlign='center';c.font='italic 36px Georgia';const lines=text.split('\n');lines.forEach((line,i)=>c.fillText(line,300,255+i*57,470));
  p.stroke([[168,457],[209,450],[238,462],[278,449],[318,458],[365,444],[414,451]],4,TEAL);
 });o.position.y=.27;g.userData={grip:[0,0,0],size:[.59,.70,.01]};return g;
}
export function makeSunglasses(){
 const g=new THREE.Group();g.name='sunglasses — nose-bridge anchor';
 for(const sign of [-1,1]){const rim=mesh(g,new THREE.SphereGeometry(1,24,16),mat(INK),sign*.145,0,.015);rim.scale.set(.133,.092,.023);const lens=mesh(g,new THREE.SphereGeometry(1,24,16),mat('#34575c'),sign*.145,0,.035);lens.scale.set(.110,.072,.014);const shine=mesh(g,new THREE.BoxGeometry(.050,.009,.006),mat('#a7cebd'),sign*.145-.02,.028,.051);shine.rotation.z=.3;}
 mesh(g,new THREE.BoxGeometry(.065,.025,.029),mat(INK),0,.015,.018);return g;
}
export function makeBaseball(){const g=new THREE.Group();g.name='baseball';sphere(g,0,0,0,[.092,.092,.092],CREAM);for(const sign of [-1,1]){const arc=mesh(g,new THREE.TorusGeometry(.065,.004,6,20,Math.PI*.8),mat(CORAL),sign*.038,0,.065);arc.rotation.z=sign<0?Math.PI*.6:-Math.PI*.4;}return g;}
export function makeHotDog(){
 const g=new THREE.Group();g.name='hot dog in paper tray — supporting-hand grip';
 const dog=card(g,.95,.32,(p,c)=>{
  p.poly([[30,139],[570,139],[535,178],[65,178]],'#f3dfc1',7);
  // One visible bun enclosing one sausage. No second full ellipse that reads as a spare bun.
  p.ell(300,110,258,43,'#edbc70',8);
  p.ell(300,96,230,21,'#9c4d37',7);
  p.stroke([[91,96],[133,87],[174,102],[217,88],[261,102],[304,88],[349,102],[393,88],[436,101],[503,91]],8,'#f2d45c');
  p.arc(300,110,250,38,15,165,16,'#f4c87c');
  p.arc(300,110,258,43,12,168,5,'#ba8449');
 });dog.position.set(0,.19,.025);
 // The same plum ink-dot hand, surfaced just below the tray rather than hidden behind it.
 const grip=card(g,.105,.105,(p)=>p.dot(300,300,255,INK));grip.position.set(0,0,.036);
 g.userData={grip:[0,0,0],size:[.95,.32,.04]};return g;
}
export function disposeProp(root:THREE.Object3D){root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){const map=(m as THREE.MeshBasicMaterial).map;map?.dispose();m.dispose();}}});}
