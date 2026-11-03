import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Actor} from './actors';
import {cameraAt,smooth,storyTime} from './story';
import {NOINK} from './ink';
import {twoTone,TONE,CHAR,untone} from './shade';
import {LIGHTS} from './lights';
import {ctex,rep,grassHD,cobbleHD,stoneHD,roofHD,facadeHD,cloudHD} from './paint';

const V=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
const materialCache=new Map<string,THREE.Material>();
const mat=(color:string,map?:THREE.Texture)=>{const key=color+(map?.uuid??'');let m=materialCache.get(key);if(!m){m=twoTone(new THREE.MeshLambertMaterial({color,...(map?{map}:{})}));materialCache.set(key,m);}return m;};
class Batch{
 parts=new Map<THREE.Material,THREE.BufferGeometry[]>();
 add(g:THREE.BufferGeometry,m:THREE.Material,p:THREE.Vector3=V(0,0,0),q?:THREE.Quaternion){const x=g.index?g.toNonIndexed():g.clone();x.applyMatrix4(new THREE.Matrix4().compose(p,q??new THREE.Quaternion(),V(1,1,1)));const a=this.parts.get(m)??[];a.push(x);this.parts.set(m,a);g.dispose();}
 box(m:THREE.Material,x:number,y:number,z:number,w:number,h:number,d:number){this.add(new THREE.BoxGeometry(w,h,d),m,V(x,y,z));}
 beam(m:THREE.Material,a:THREE.Vector3,b:THREE.Vector3,w:number,d=w){this.add(new THREE.BoxGeometry(w,a.distanceTo(b),d),m,a.clone().add(b).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize()));}
 finish(parent:THREE.Group,shadow=true){const meshes:THREE.Mesh[]=[];for(const[m,geos]of this.parts){const g=mergeGeometries(geos,false);const o=new THREE.Mesh(g,m);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);meshes.push(o);for(const geo of geos)geo.dispose();}return meshes;}
}

function makeTower(){
 const root=new THREE.Group(),b=new Batch();
 const bronze=mat('#a87948'),dark=mat('#5e4d48'),edge=mat('#d3a45f'),deck=mat('#b88f60');
 // Four open trussed feet, curving inward into the tapered upper lattice.
 const levels=[[0,5.8,1.25],[2.8,4.8,1.08],[5.5,3.7,.88],[8.0,2.95,.68],[11.2,2.15,.48],[14.2,1.6,.38],[18,1.15,.30],[22,.78,.23],[26,.48,.16],[29,.3,.10]];
 for(const sx of[-1,1])for(const sz of[-1,1]){
  for(let i=0;i<levels.length-1;i++){
   const[y,r,w]=levels[i],[y2,r2,w2]=levels[i+1];
   const c=V(sx*r,y,sz*r),c2=V(sx*r2,y2,sz*r2);
   for(const a of[-1,1])for(const d of[-1,1])b.beam(bronze,c.clone().add(V(a*w/2,0,d*w/2)),c2.clone().add(V(a*w2/2,0,d*w2/2)),i<4?.17:.105);
   for(const side of[-1,1]){
    b.beam(edge,c.clone().add(V(-w/2,0,side*w/2)),c2.clone().add(V(w2/2,0,side*w2/2)),.075);
    b.beam(dark,c.clone().add(V(w/2,0,side*w/2)),c2.clone().add(V(-w2/2,0,side*w2/2)),.065);
    b.beam(bronze,c.clone().add(V(side*w/2,0,-w/2)),c2.clone().add(V(side*w2/2,0,w2/2)),.075);
    b.beam(bronze,c.clone().add(V(side*w/2,0,w/2)),c2.clone().add(V(side*w2/2,0,-w2/2)),.065);
   }
  }
  b.box(mat('#d5c4a8'),sx*5.8,.13,sz*5.8,2,.26,2);
 }
 // Cross-bracing of all four faces above the first deck.
 for(let i=3;i<levels.length-1;i++){
  const[y,r]=levels[i],[y2,r2]=levels[i+1];
  for(const s of[-1,1]){
   b.beam(bronze,V(-r,y,s*r),V(r,y,s*r),.12);
   b.beam(bronze,V(s*r,y,-r),V(s*r,y,r),.12);
   b.beam(edge,V(-r,y,s*r),V(r2,y2,s*r2),.095);
   b.beam(dark,V(r,y,s*r),V(-r2,y2,s*r2),.085);
   b.beam(edge,V(s*r,y,-r),V(s*r2,y2,r2),.095);
   b.beam(dark,V(s*r,y,r),V(s*r2,y2,-r2),.085);
  }
 }
 for(const[y,r]of[[7.7,3.7],[14.1,2.1],[28.5,.85]]){
  b.box(deck,0,y,0,r*2,.38,r*2);
  b.box(dark,0,y-.24,0,r*2+.15,.12,r*2+.15);
  for(const s of[-1,1]){b.beam(edge,V(-r,y+.55,s*r),V(r,y+.55,s*r),.08);b.beam(edge,V(s*r,y+.55,-r),V(s*r,y+.55,r),.08);
   for(let i=0;i<=16;i++){const a=-r+i*r/8;b.beam(dark,V(a,y,s*r),V(a,y+.55,s*r),.035);b.beam(dark,V(s*r,y,a),V(s*r,y+.55,a),.035);}}
 }
 // Decorative arches make the silhouette unmistakably Eiffel.
 for(const side of[-1,1])for(const axis of[0,1])for(let i=0;i<28;i++){
  const arch=(k:number)=>{const x=-5.2+k*10.4/28;const y=.9+5.1*Math.sqrt(Math.max(0,1-(x/5.2)**2));return axis===0?V(x,y,side*4.0):V(side*4.0,y,x);};
  b.beam(bronze,arch(i),arch(i+1),.23,.16);
 }
 b.box(edge,0,29.5,0,.62,1.2,.62);b.beam(dark,V(0,30,0),V(0,32.7,0),.075);b.box(bronze,0,30.5,0,.27,.8,.27);
 const meshes=b.finish(root);const bases=meshes.map(m=>(m.geometry.attributes.position.array as Float32Array).slice());
 return {root,pose(growth:number,bend:number,bendZ=0){meshes.forEach((m,j)=>{const a=m.geometry.attributes.position.array as Float32Array,base=bases[j];for(let i=0;i<a.length;i+=3){const y=base[i+1];a[i]=base[i]+bend*(y/32)**2;a[i+1]=y*growth;a[i+2]=base[i+2]+bendZ*(y/32)**2;}m.geometry.attributes.position.needsUpdate=true;});}};
}

function makeCity(parent:THREE.Group){
 const b=new Batch(),stone=mat('#ffffff',stoneHD()),trim=mat('#ead9b8'),iron=mat('#384859'),wood=mat('#a36640');
 b.box(mat('#d4d9be',rep(grassHD(),90,90)),0,-.2,0,540,.3,540);
 b.box(mat('#f1e6ce',rep(cobbleHD(),10,18)),0,-.025,18,17,.10,66);
 for(const s of[-1,1]){b.box(stone,s*8.7,.06,18,.4,.22,66);b.box(stone,s*14,.05,20,3.2,.15,70);}
 // Original Paris-inspired facades: cream masonry, slate mansards, dormers and balconies.
 const walls=['#d3b995','#e0c9a5','#bfae9c','#deb59a','#c6bba7'];
 for(let i=0;i<22;i++){
  const s=i%2?-1:1,k=Math.floor(i/2),x=s*(25+(k%3)*3.8),z=-45+k*9,h=8+(k%3)*1.5,w=7.5;
  const wall=mat('#ffffff',facadeHD(`paris-${i}`,w,h,{wall:walls[i%5],shutter:'#43556c',door:true}));
  b.box(wall,x,h/2,z,w,h,7.6);b.box(trim,x,h,z,w+.45,.35,8);b.box(stone,x,.35,z,w+.35,.7,7.9);
  b.add(new THREE.CylinderGeometry(w*.47,w*.76,2.0,4),mat('#ffffff',roofHD('#45556a',true)),V(x,h+1.15,z),new THREE.Quaternion().setFromAxisAngle(V(0,1,0),Math.PI/4));
  b.box(iron,x,h+2.25,z,w*.66,.15,w*.66);
  for(const dx of[-2,0,2]){b.box(trim,x+dx,h+1.15,z+3.2,.9,1,.5);b.box(iron,x+dx,h+1.15,z+3.48,.55,.7,.04);b.box(iron,x+dx,h+1.75,z+3.2,1.1,.15,.7);}
  for(let f=1;f<=3;f++){b.box(trim,x,f*h/3-.05,z+3.9,w+.25,.12,.24);for(let c=-1;c<=1;c++){
   b.box(iron,x+c*2.3,f*h/3-1.1,z+4.15,1.5,.08,.55);
   b.beam(iron,V(x+c*2.3-.7,f*h/3-.45,z+4.4),V(x+c*2.3+.7,f*h/3-.45,z+4.4),.055);
   for(let n=-2;n<=2;n++)b.beam(iron,V(x+c*2.3+n*.28,f*h/3-1.1,z+4.4),V(x+c*2.3+n*.28,f*h/3-.45,z+4.4),.035);
  }}
  b.box(mat('#b8755e'),x+2,h+2.8,z-1,1,1.4,.8);
 }
 for(let i=0;i<28;i++){
  const s=i%2?-1:1,k=Math.floor(i/2),x=s*(12+(k%3)*3),z=-36+k*6;
  const trunk=mat('#795336');b.beam(trunk,V(x,0,z),V(x,3.1,z),.32);
  for(let c=0;c<4;c++){const g=new THREE.IcosahedronGeometry(1,2);g.scale(1.65,1.5,1.45);b.add(g,mat(['#678b4c','#719b50','#88ac5b','#587f46'][(i+c)%4]),V(x+Math.sin(c*2)*.65,3.2+c*.5,z+Math.cos(c*2)*.6));}
 }
 for(const s of[-1,1])for(const z of[10,23,35]){
  const x=s*8;b.beam(iron,V(x,0,z),V(x,4.1,z),.13);b.box(iron,x,.16,z,.55,.3,.55);b.box(trim,x,4.25,z,.5,.7,.5);b.box(iron,x,4.65,z,.65,.12,.65);
  for(const dx of[-.25,.25])for(const dz of[-.25,.25])b.beam(iron,V(x+dx,3.9,z+dz),V(x+dx,4.6,z+dz),.05);
  const bx=s*10.2;for(const yy of[.9,1.25,1.5])b.box(wood,bx,yy,z+2,2.4,.18,.25);b.box(wood,bx,.75,z+2.45,2.4,.15,.8);for(const dx of[-.85,.85])b.beam(iron,V(bx+dx,0,z+2.4),V(bx+dx,1.6,z+2.1),.09);
 }
 for(let i=0;i<80;i++){const s=i%2?-1:1,x=s*(9.4+(i%7)*.35),z=2+Math.floor(i/2)*.9;const g=new THREE.IcosahedronGeometry(.12,0);b.add(g,mat(['#f0af2f','#d56362','#e5c478'][i%3]),V(x,.33,z));}
 for(let i=0;i<25;i++){const x=-78+i*6.5,z=-60-(i%3)*9,h=6+(i%5);b.box(mat(['#c6bdb2','#d5c2a6','#bead9a'][i%3]),x,h/2,z,6,h,8);b.add(new THREE.CylinderGeometry(2.4,4.4,1.8,4),mat('#667080'),V(x,h+.8,z),new THREE.Quaternion().setFromAxisAngle(V(0,1,0),Math.PI/4));b.box(trim,x,h-1,z+4.04,6,.16,.1);}
 b.finish(parent);
 // Two small cafe tables and striped awnings give near-city depth.
 const awning=new Batch();for(const s of[-1,1])for(let i=0;i<10;i++)awning.box(mat(i%2?'#f4dfbc':'#b8463c'),s*23-3.4+i*.7,3,12.5,.72,.17,2.6);awning.finish(parent);
}

function skyTexture(golden:boolean){return ctex(`sky-${golden}`,16,512,g=>{const grad=g.createLinearGradient(0,0,0,512);grad.addColorStop(0,golden?'#65678d':'#377cc7');grad.addColorStop(.5,golden?'#df967e':'#6a9cdb');grad.addColorStop(1,golden?'#ffc78c':'#c4d8e9');g.fillStyle=grad;g.fillRect(0,0,16,512);});}

export class World{
 root=new THREE.Group();paris=new THREE.Group();atomStage=new THREE.Group();friendsStage=new THREE.Group();
 tower=makeTower();sun=new THREE.DirectionalLight('#fff1d7',2.8);hemi=new THREE.HemisphereLight('#cbdfff','#a99885',.65);
 tourist=new Actor('tourist',3.05);guide=new Actor('guide',2.95);friend=new Actor('friend',2.9);walker=new Actor('guide',2.9);
 sky:THREE.Mesh;sunDisc:THREE.Mesh;clouds:THREE.Mesh[]=[];atoms:THREE.Mesh[]=[];bonds:THREE.Mesh[]=[];trace:THREE.Mesh;footprints:THREE.Mesh[]=[];
 constructor(){
  this.root.add(this.paris,this.atomStage,this.friendsStage,this.sun,this.hemi);this.paris.add(this.tower.root);makeCity(this.paris);
  this.sky=new THREE.Mesh(new THREE.SphereGeometry(230,40,24),new THREE.ShaderMaterial({uniforms:{zenith:{value:untone('#3d80ce')},horizon:{value:untone('#c5d9e9')}},vertexShader:'varying vec3 dir; void main(){dir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 dir;uniform vec3 zenith;uniform vec3 horizon;void main(){float k=smoothstep(-.02,.65,normalize(dir).y);gl_FragColor=vec4(mix(horizon,zenith,k),1.);}',side:THREE.BackSide,depthWrite:false}));this.sky.layers.set(NOINK);this.root.add(this.sky);
  this.sunDisc=new THREE.Mesh(new THREE.CircleGeometry(3.6,64),new THREE.MeshBasicMaterial({color:new THREE.Color('#fff0a2').multiplyScalar(1.7),fog:false}));this.sunDisc.layers.set(NOINK);this.root.add(this.sunDisc);
  for(let i=0;i<10;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(23,11.5),new THREE.MeshBasicMaterial({map:cloudHD(i+39),transparent:true,depthWrite:false,fog:false}));mesh.position.set(-85+i*19,32+(i%3)*9,-40-(i%3)*25);mesh.layers.set(NOINK);this.root.add(mesh);this.clouds.push(mesh);}
  this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:.1,far:200});this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=.02;this.sun.shadow.camera.layers.enable(NOINK);this.root.add(this.sun.target);
  this.paris.add(this.tourist.root,this.guide.root);this.tourist.root.position.set(-1.1,0,19);this.guide.root.position.set(2.0,0,18.5);
  this.friendsStage.add(this.friend.root,this.walker.root);this.friendsStage.position.z=23;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(85,85),mat('#bac8d3',rep(cobbleHD(),12,12)));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.friendsStage.add(floor);
  for(let i=0;i<36;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(.13,16),new THREE.MeshBasicMaterial({color:'#597184',transparent:true,opacity:.35}));m.rotation.x=-Math.PI/2;m.position.y=.006;m.layers.set(NOINK);this.friendsStage.add(m);this.footprints.push(m);}
  // A schematic crystal lattice: fixed-size atoms, growing average spacing, deterministic vibration.
  const atomMat=new THREE.MeshPhongMaterial({color:'#ffb357',specular:'#fff0ca',shininess:55});
  for(let x=-2;x<=2;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const m=new THREE.Mesh(new THREE.SphereGeometry(.34,20,14),atomMat);m.userData.base=V(x*1.7,y*1.7,z*1.7);m.castShadow=true;this.atomStage.add(m);this.atoms.push(m);}
  for(let i=0;i<this.atoms.length;i++)for(let j=i+1;j<this.atoms.length;j++){if(Math.abs((this.atoms[i].userData.base as THREE.Vector3).distanceTo(this.atoms[j].userData.base)-1.7)<.01){const m=new THREE.Mesh(new THREE.CylinderGeometry(.038,.038,1,8),new THREE.MeshBasicMaterial({color:'#6ca5d7',transparent:true,opacity:.55}));m.userData.pair=[i,j];this.atomStage.add(m);this.bonds.push(m);}}
  const points=Array.from({length:90},(_,i)=>new THREE.Vector3(Math.cos(i/89*Math.PI*2)*1.1,32.7,Math.sin(i/89*Math.PI*2)*.75));
  this.trace=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),90,.035,6,false),new THREE.MeshBasicMaterial({color:'#ffe49b',transparent:true,opacity:.8}));this.trace.layers.set(NOINK);this.paris.add(this.trace);
 }
 update(frame:number,camera:THREE.PerspectiveCamera,scene:THREE.Scene){
  const t=storyTime(frame/30),c=cameraAt(t),s=c.s,atom=s.stage==='atoms',friends=s.stage==='friends',gold=s.light==='golden';
  this.paris.visible=!atom;this.atomStage.visible=atom;this.friendsStage.visible=friends;this.tourist.root.visible=!friends;this.guide.root.visible=!friends&&!['tourist','tiny-parasol','last-dodge'].includes(s.id);
  camera.layers.enable(NOINK);camera.position.set(...c.pos);camera.lookAt(...c.look);camera.rotateZ(c.roll);camera.fov=c.fov;if(friends){camera.position.z+=23;const center=V(Math.sin(-.6+(t-s.a)*.15)*3,0,Math.cos(-.6+(t-s.a)*.15)*3-2.1);camera.position.x+=center.x*.7;camera.lookAt(center.x*.7,1.3,23);}camera.updateProjectionMatrix();camera.updateMatrixWorld();
  this.sky.position.copy(camera.position);const skyMat=this.sky.material as THREE.ShaderMaterial;skyMat.uniforms.zenith.value=untone(gold?'#976e8a':'#3d80ce');skyMat.uniforms.horizon.value=untone(gold?'#ffd09a':'#c5d9e9');this.sky.visible=!atom;
  scene.background=new THREE.Color(atom?'#132c50':gold?'#ffc78c':'#b8cfe9');scene.fog=new THREE.Fog(atom?'#132c50':gold?'#e6b296':'#b8cfe9',atom?25:45,atom?60:175);
  const L=LIGHTS[gold?'golden':'day'];TONE.uLitCol.value.set(...L.lit);TONE.uShadeCol.value.set(...L.shade);TONE.uShadeLift.value.set(...L.lift);TONE.uLambert.value=L.lambert;TONE.uSideK.value=L.sideK;TONE.uTerm.value=L.term;TONE.uSat.value=1.08;
  CHAR.uCharTint.value.set(...L.charTint);CHAR.uCharShade.value=L.charShade;CHAR.uGrad.value=L.charGrad;CHAR.uBodyGrad.value=L.bodyGrad;CHAR.uSideTint.value.set(...L.sideTint);
  this.sun.color.set(L.sunCol);this.sun.intensity=L.sunI;this.hemi.color.set(L.sky);this.hemi.groundColor.set(L.ground);
  this.sun.position.set(gold?-35:-35,gold?25:60,35);this.sun.target.position.set(0,5,0);
  const sunAngle=Math.max(0,Math.min(Math.PI,(t-45.03)/7.84*Math.PI));
  this.sunDisc.visible=!atom&&!friends;this.sunDisc.position.set(-14,gold?30:28,-7);if(s.id==='summit-trace'){this.sunDisc.position.set(-5*Math.cos(sunAngle),35+2*Math.sin(sunAngle),-9);this.sunDisc.scale.setScalar(.5);this.sun.position.set(-40*Math.cos(sunAngle),40+20*Math.sin(sunAngle),30);}else this.sunDisc.scale.setScalar(1);this.sunDisc.quaternion.copy(camera.quaternion);
  this.clouds.forEach((cl,i)=>{cl.visible=!atom;cl.position.x=-85+i*19+t*.035;cl.quaternion.copy(camera.quaternion);});
  const warm=smooth((t-12.2)/9.5)*(1-smooth((t-52.87)/2.4));const bend=s.id==='sun-dodge'?.85*smooth(t/2):(.05+.72*warm)*(gold?Math.cos(sunAngle):1);
  this.tower.pose(1+.016*warm,bend,s.id==='summit-trace'?.55*Math.sin(sunAngle):0);this.trace.visible=s.id==='summit-trace';this.trace.position.y=.016*warm*32.7;this.trace.geometry.setDrawRange(0,Math.max(0,Math.floor((t-45.03)/7.84*.8*3240/6)*6));
  const parasol=s.id==='tiny-parasol'||s.id==='last-dodge';
  this.tourist.update(frame,camera,{expression:s.id==='sun-dodge'?'shock':parasol?'nervous':s.id==='tourist'?(t<8?'grin':t<10?'neutral':'nervous'):'relief',prop:parasol?'parasol':s.id==='tourist'?'camera':null,headTilt:parasol?-.1:0,look:parasol?-.5:.2});
  this.guide.update(frame,camera,{expression:parasol?'neutral':'grin',wave:s.id==='tourist'?.4:0,look:-.25});
  if(atom){this.atomStage.rotation.z=Math.PI/2;this.atomStage.rotation.y=.25;const heat=smooth((t-30.5)/4);this.atoms.forEach((a,i)=>{const base=a.userData.base as THREE.Vector3;a.position.copy(base).multiplyScalar(1+heat*.24);const amp=.025+heat*.075;a.position.add(V(Math.sin(frame*.55+i*2.1)*amp,Math.cos(frame*.49+i*3)*amp,Math.sin(frame*.44+i*.7)*amp));});for(const b of this.bonds){const[i,j]=b.userData.pair;const a=this.atoms[i].position,z=this.atoms[j].position;b.position.copy(a).add(z).multiplyScalar(.5);b.scale.y=a.distanceTo(z);b.quaternion.setFromUnitVectors(V(0,1,0),z.clone().sub(a).normalize());}}
  if(friends){const u=t-s.a,ang=-.6+u*.15;const center=V(Math.sin(ang)*3,0,Math.cos(ang)*3-2.1);const across=V(Math.cos(ang),0,-Math.sin(ang));this.walker.root.position.copy(center).addScaledVector(across,-.65);this.friend.root.position.copy(center).addScaledVector(across,.65);this.walker.update(frame,camera,{walking:true,phase:u*1.15,expression:'grin',linked:'right',stride:95,look:.25});this.friend.update(frame,camera,{walking:true,phase:u*1.15,expression:'nervous',linked:'left',stride:55,look:-.25});this.footprints.forEach((f,i)=>{const a=-.6+i*.035,side=i%2?1:-1;f.position.set(Math.sin(a)*(3+side*.65),.006,Math.cos(a)*(3+side*.65)-2.1);f.visible=i*.24<u;});}
  return {focus:camera.position.distanceTo(V(c.look[0],c.look[1],c.look[2]+(friends?23:0))),dof:s.dof,light:s.light,stage:s.stage};
 }
}
