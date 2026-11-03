import * as THREE from 'three';
import {twoTone} from './vendor/shade';
import {Pen,bodyFront,SKINS,Outfit} from './vendor/toon';
import {cardShade} from './vendor/cardshade';
import {planksHD,stoneHD,grassHD,rep,cloudHD,beamHD,roofHD,ctex} from './vendor/paint';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Fresh ballpark/room artwork. No geometry, source or textures from the earlier film.
export const INK=0x241d2b, CREAM=0xffedc7;
const palette={teal:0x277e79,deep:0x174d54,gold:0xf1b64d,coral:0xe96e45,ivory:0xf7dfad,blue:0x4a8fac};
const mats=new Map<string,THREE.Material>();
export function mat(color:number,shininess=8){const key=color+':'+shininess;if(!mats.has(key))mats.set(key,twoTone(new THREE.MeshPhongMaterial({color,shininess,specular:0x253539})));return mats.get(key)!;}
export function box(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,color:number,r=.025){const g=r>0?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.48,h*.48,d*.48)):new THREE.BoxGeometry(w,h,d);const o=new THREE.Mesh(g,mat(color));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
export function cyl(parent:THREE.Object3D,r:number,h:number,x:number,y:number,z:number,color:number,segments=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat(color));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function pole(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,r:number,color:number){const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,a.distanceTo(b),10),mat(color));p.position.copy(a).add(b).multiplyScalar(.5);p.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());p.castShadow=true;parent.add(p);return p;}
/** Label raster aspect matches its physical plane; typography is scaled uniformly, never stretched. */
export function textTexture(lines:string[],opts:{bg?:string,fg?:string,size?:number,w?:number,h?:number,align?:CanvasTextAlign}={}){
 const c=document.createElement('canvas');c.width=opts.w||1024;c.height=opts.h||512;
 const ctx=c.getContext('2d')!;ctx.fillStyle=opts.bg||'#f7dfad';ctx.fillRect(0,0,c.width,c.height);
 const count=Math.max(1,lines.length),pad=c.width*.045;let font=opts.size||c.height*.84/count;
 const measure=()=>{ctx.font=`900 ${font}px Arial`;const ms=lines.map(s=>ctx.measureText(s));return {width:Math.max(1,...ms.map(m=>m.width)),ascent:Math.max(font*.6,...ms.map(m=>m.actualBoundingBoxAscent||0)),descent:Math.max(0,...ms.map(m=>m.actualBoundingBoxDescent||0))};};
 let m=measure();const block=m.ascent+m.descent+(count-1)*font*1.18;
 font*=Math.min(1,(c.width-pad*2)/m.width,c.height*.80/Math.max(1,block));m=measure();
 const lineHeight=font*1.18,total=m.ascent+m.descent+(count-1)*lineHeight;
 ctx.fillStyle=opts.fg||'#1b4b52';ctx.textAlign=opts.align||'center';ctx.textBaseline='alphabetic';
 const xx=ctx.textAlign==='left'?pad:ctx.textAlign==='right'?c.width-pad:c.width/2;
 lines.forEach((line,i)=>ctx.fillText(line,xx,(c.height-total)/2+m.ascent+i*lineHeight));
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function plaque(parent:THREE.Object3D,lines:string[],w:number,h:number,x:number,y:number,z:number,bg='#f7dfad',fg='#174d54',size=70){
 const aspect=w/h;let H=Math.max(96,Math.min(768,Math.round(h*192))),W=Math.round(H*aspect);
 if(W>2048){W=2048;H=Math.max(32,Math.round(W/aspect));}
 const font=H*.84/Math.max(1,lines.length)*THREE.MathUtils.clamp(size/70,.93,1.05);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(lines,{bg,fg,size:font,w:W,h:H}),side:THREE.DoubleSide}));
 mesh.position.set(x,y,z);mesh.layers.set(3);parent.add(mesh);return mesh;
}
function floorTexture(kind:'wood'|'wall'|'turf'){
 if(kind==='wood')return rep(planksHD(),5,5);
 if(kind==='turf')return rep(grassHD(),14,14);
 return ctex('ballpark-warm-plaster',1024,1024,(g,r)=>{g.fillStyle='#e6d2b0';g.fillRect(0,0,1024,1024);for(let i=0;i<65;i++){g.fillStyle=i%2?'rgba(139,108,72,.035)':'rgba(255,250,221,.07)';const x=r()*1024,y=r()*1024;g.beginPath();g.ellipse(x,y,40+r()*100,15+r()*45,r()*.7,0,Math.PI*2);g.fill();}});
}
function shadow(parent:THREE.Object3D,x:number,y:number,z:number,sx:number,sz:number){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(29,29,42,.38)');g.addColorStop(.45,'rgba(29,29,42,.21)');g.addColorStop(1,'rgba(29,29,42,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sz),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.layers.set(3);parent.add(m);return m;}
/** Painted seat enamel: broad brush drift and fine edge seams; no noise/grain or plastic clearcoat. */
function seatMaterial(color:number){
 const m=paintMat('seat-enamel-'+color,()=>ctex('stadium-seat-matte-paint',768,768,(g,r)=>{
  g.fillStyle='#e6e1d5';g.fillRect(0,0,768,768);
  for(let i=0;i<28;i++){const x=r()*768,y=r()*768;g.strokeStyle=i%3?'rgba(74,65,58,.038)':'rgba(255,253,238,.09)';g.lineWidth=4+r()*8;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+32,y+3,x+100,y-4,x+170+r()*140,y+1);g.stroke();}
  const bottom=g.createLinearGradient(0,540,0,768);bottom.addColorStop(0,'rgba(43,40,44,0)');bottom.addColorStop(1,'rgba(43,40,44,.08)');g.fillStyle=bottom;g.fillRect(0,540,768,228);
  g.strokeStyle='rgba(58,52,48,.16)';g.lineWidth=3;g.strokeRect(14,14,740,740);
  g.strokeStyle='rgba(255,252,235,.24)';g.lineWidth=3;g.beginPath();g.moveTo(19,748);g.lineTo(19,20);g.lineTo(749,20);g.stroke();
  // A few tiny worn strokes on the exposed lip, never procedural full-frame grain.
  for(let i=0;i<8;i++){g.fillStyle='rgba(255,247,218,.18)';g.fillRect(45+r()*670,27+r()*6,7+r()*14,2);}
 }),color);m.shininess=3;m.specular.setHex(0x111318);return m;
}
export function stadiumSeat(parent:THREE.Object3D,x:number,y:number,z:number,color=palette.teal){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const seat=box(g,.88,.16,.77,0,.70,.04,color,.065);seat.material=seatMaterial(color);const back=box(g,.9,.77,.16,0,1.15,-.30,color,.075);back.material=seatMaterial(color);box(g,.73,.07,.08,0,1.49,-.195,palette.ivory,.025);for(const a of [-.37,.37]){box(g,.075,.6,.075,a,.32,.05,palette.deep,.02);box(g,.12,.07,.76,a,.035,.03,palette.deep,.025);box(g,.08,.08,.68,a*1.3,1.03,.02,palette.gold,.03);box(g,.05,.3,.055,a*1.3,.87,-.15,palette.deep,.01);}return g;}
/** Repository Batch contract: normalize indexed/non-indexed primitives and attributes before merging.
 * RoundedBoxGeometry, cylinders and extruded arches otherwise cannot share one material batch. */
function mergeStatic(root:THREE.Group){
 root.updateWorldMatrix(true,true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
 const buckets=new Map<THREE.Material,THREE.BufferGeometry[]>(),remove:THREE.Mesh[]=[];
 root.traverse(o=>{if(!(o instanceof THREE.Mesh)||o.layers.mask!==1||Array.isArray(o.material))return;
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
  for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);
  if(!g.getAttribute('normal'))g.computeVertexNormals();
  if(!g.getAttribute('uv'))g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));
  g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
  if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material)!.push(g);remove.push(o);
 });
 for(const o of remove){o.removeFromParent();o.geometry.dispose();}
 for(const [m,gs]of buckets){const g=mergeGeometries(gs,false);if(!g)throw new Error('World batch merge failed');const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;mesh.matrixAutoUpdate=false;root.add(mesh);gs.forEach(a=>a.dispose());}
}
/** Background fans use the repository's actual bodyFront/face/hat/ink and cardShade code. */
function crowdTexture(seed:number){
 const c=document.createElement('canvas');c.width=360;c.height=600;const ctx=c.getContext('2d')!;ctx.scale(.6,.6);
 const colors=['#df794c','#337e89','#dfaf54','#e2d4b4','#8cb4b1','#bf655c','#6d8fab','#b0a178'];
 const outfit:Outfit={jacket:colors[seed%colors.length],pants:'#434756',boots:'#302a34',skin:SKINS[seed%SKINS.length],hat:seed%3===1?'hair':'cap',hair:seed%4===0?'#b9b0a0':'#5a443b',cap:colors[(seed+3)%colors.length],build:seed%5===0?'stout':'adult'};
 bodyFront(new Pen(ctx),outfit,{mode:'sit',seated:1,seatedHipDesignY:975-.78/(2.75/1000),expr:seed%3===0?'grin':'neutral',look:(seed%3-1)*.35,seed:seed+29,headTilt:(seed%3-1)*2});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function addCrowd(parent:THREE.Object3D){
 const crowd:{mesh:THREE.Mesh;baseY:number;seed:number}[]=[];
 const materials=Array.from({length:16},(_,i)=>cardShade(new THREE.MeshLambertMaterial({map:crowdTexture(i),transparent:false,alphaTest:.35,side:THREE.DoubleSide})));
 const geo=new THREE.PlaneGeometry(1.65,2.75);
 for(let row=0;row<8;row++)for(let col=-8;col<=8;col++){
  if((row===0&&(col===0||col===1||col===2))||(row===1&&(col===0||col===1||col===-2||col===3))||(row===2&&col===1))continue;
  // Stable small gaps avoid a mechanical wall of faces. The same full-size repo cast is retained.
  const densityKey=((row*53+col*29+(row+col)*(row+col)*7)%101+101)%101;
  if(row>1&&densityKey<(row>4?28:16))continue;
  const seed=((row*11+col*7+row*row*3+col*col*3+250)%16+16)%16,m=new THREE.Mesh(geo,materials[seed]);
  m.position.set(col*1.35,row*.66+2.75*.475,-row*1.9+.17);m.layers.set(3);m.castShadow=false;parent.add(m);crowd.push({mesh:m,baseY:m.position.y,seed});
 }
 return(time:number,energy:number)=>{crowd.forEach((c,i)=>{c.mesh.position.y=c.baseY+energy*.022*Math.sin(time*5+i*.79);c.mesh.rotation.z=energy*.016*Math.sin(time*4.5+i);});};
}

// New world surfaces are authored with the repository's deterministic ctex/paint system, not photo textures.
const painted=new Map<string,THREE.MeshPhongMaterial>();
function paintMat(key:string,texture:()=>THREE.Texture,color=0xffffff){let m=painted.get(key);if(!m){m=twoTone(new THREE.MeshPhongMaterial({map:texture(),color,shininess:5,specular:0x252b30}));painted.set(key,m);}return m;}
function paintedBox(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){const o=box(parent,w,h,d,x,y,z,0xffffff,.018);o.material=m;return o;}
function fieldDirt(){return ctex('ballpark-clay-brushwork',1024,1024,(g,r)=>{g.fillStyle='#be966c';g.fillRect(0,0,1024,1024);for(let n=0;n<190;n++){g.strokeStyle=n%3?'rgba(136,93,57,.09)':'rgba(237,207,160,.16)';g.lineWidth=3+r()*11;g.beginPath();const x=r()*1024,y=r()*1024;g.moveTo(x,y);g.quadraticCurveTo(x+30,y-5,x+60+r()*90,y+r()*8);g.stroke();}for(let n=0;n<180;n++){g.fillStyle=n%2?'rgba(113,80,53,.09)':'rgba(244,218,178,.15)';g.fillRect(r()*1024,r()*1024,2,2);}});}
function fieldGrass(){return ctex('ballpark-striped-repo-grass',1024,1024,(g)=>{g.drawImage(grassHD().image as HTMLCanvasElement,0,0,1024,1024);g.fillStyle='rgba(166,151,112,.36)';g.fillRect(0,0,1024,1024);g.fillStyle='rgba(34,75,37,.06)';g.fillRect(0,0,512,1024);g.fillStyle='rgba(232,225,186,.05)';g.fillRect(512,0,512,1024);});}
function archOpening(root:THREE.Object3D,x:number,y:number,z:number,w:number,h:number){
 const recess=new THREE.Shape();recess.moveTo(-w/2,0);recess.lineTo(w/2,0);recess.lineTo(w/2,h-w/2);recess.absarc(0,h-w/2,w/2,0,Math.PI,false);recess.closePath();
 const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(recess,{depth:.22,bevelEnabled:false,curveSegments:12}),mat(0x31484e));mesh.position.set(x,y,z);root.add(mesh);
 const points:THREE.Vector3[]=[];points.push(new THREE.Vector3(-w/2,0,0),new THREE.Vector3(-w/2,h-w/2,0));for(let i=0;i<=12;i++){const a=Math.PI-i*Math.PI/12;points.push(new THREE.Vector3(Math.cos(a)*w/2,h-w/2+Math.sin(a)*w/2,0));}points.push(new THREE.Vector3(w/2,0,0));
 for(let i=1;i<points.length;i++)pole(root,points[i-1].clone().add(new THREE.Vector3(x,y,z+.25)),points[i].clone().add(new THREE.Vector3(x,y,z+.25)),.075,0xe8cfa9);
 box(root,w+.24,.16,.6,x,y-.05,z+.12,0xceb48f,.015);box(root,.055,h-w/2,.08,x,y+(h-w/2)/2,z+.28,0x69817a,.01);
}
function stadiumDepth(root:THREE.Group){
 const masonry=paintMat('stadium-stone',()=>rep(stoneHD('ballpark-masonry',['#d6c5aa','#cdbb9d','#e1d0b4','#c2aa8a'],'#aa9377'),2,1.3));
 const wood=paintMat('stadium-bench-wood',()=>rep(beamHD(),1.4,.5));
 const roof=paintMat('stadium-roof',()=>rep(roofHD('#956b52'),2.8,.65));
 // Side wings turn in toward the action: true floor/roof/column depth rather than a flat scenic strip.
 for(const side of [-1,1]){
  const wing=new THREE.Group();wing.position.set(side*20.6,0,-10.8);wing.rotation.y=-side*.30;root.add(wing);
  paintedBox(wing,8,6.6,4,0,4.25,-1.6,masonry);box(wing,8.5,.25,4.6,0,7.58,-1.5,0xe2c49b,.035);
  box(wing,8.6,.20,4.8,0,7.82,-1.5,0x426466,.025);
  for(const x of [-2.65,0,2.65]){archOpening(wing,x,2.0,.43,1.65,3.85);box(wing,.29,5.4,.44,x-1.25,4.7,.58,0xdabf94,.025);box(wing,.44,.18,.6,x-1.25,7.34,.58,0xf1dbb7,.02);}
  const canopy=paintedBox(wing,9,.16,4.7,0,8.4,.20,roof);canopy.rotation.x=.14;
  box(wing,9,.19,.18,0,8.06,2.54,0x426466,.02);
  for(const x of [-3.75,0,3.75]){box(wing,.18,6.1,.18,x,4.95,2.26,0x426466,.025);pole(wing,new THREE.Vector3(x,7.7,2.26),new THREE.Vector3(x,7.15,1.15),.05,0x426466);}
  for(let i=-4;i<=4;i++){
   box(wing,.82,.38,.05,i*.96,7.79,2.60,i%2===0?0xe4cba7:0xb86149,.01);
  }
  plaque(wing,[side<0?'COMETS BALLPARK':'HOME RUN TERRACE'],7.3,.55,0,6.62,.78,'#315c60','#efdbb6',65);
 }
 // Low side rails frame the field without crossing the actors' faces or center camera corridor.
 for(const side of [-1,1]){
  const start=side<0?-12.5:5.2,end=side<0?-3.25:12.5,mid=(start+end)/2;
  paintedBox(root,end-start,.48,.42,mid,.16,1.36,masonry);paintedBox(root,end-start+.2,.12,.60,mid,.46,1.36,wood);
  for(let x=start+.3;x<end;x+=1.1){cyl(root,.035,.56,x,.79,1.36,0x37474b,8);box(root,.11,.08,.11,x,.52,1.36,0xc3ab83,.012);}
  pole(root,new THREE.Vector3(start,1.08,1.36),new THREE.Vector3(end,1.08,1.36),.047,0xdcc49d);
 }
 // A painted wood service ledge and section markers add scale in the side foreground.
 for(const side of [-1,1]){paintedBox(root,1.2,.13,.7,side*5.9,1.23,-.35,wood);plaque(root,[side<0?'SECTION 104':'SECTION 105'],1.32,.35,side*5.9,.77,.012,'#e6c89b','#354e53',65);}
}
function diamondDetails(root:THREE.Group){
 const clay=paintMat('infield-dirt',()=>rep(fieldDirt(),2.4,2.4));
 const mound=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.25,.12,48),clay);mound.position.set(0,.015,18);root.add(mound);box(root,.55,.03,.17,0,.092,18.08,0xf8eacb,.007);
 const plateShape=new THREE.Shape();plateShape.moveTo(-.24,.20);plateShape.lineTo(.24,.20);plateShape.lineTo(.24,-.03);plateShape.lineTo(0,-.26);plateShape.lineTo(-.24,-.03);plateShape.closePath();
 const plate=new THREE.Mesh(new THREE.ShapeGeometry(plateShape),mat(0xfff0d5));plate.rotation.x=-Math.PI/2;plate.position.set(0,.013,27.2);root.add(plate);
 for(const sign of [-1,1])for(const z of [26.95,27.75])box(root,.59,.016,.045,sign*.62,.015,z,0xefe4c7,.003);
 for(const sign of [-1,1])for(const x of [.33,.92])box(root,.045,.016,.84,sign*x,.015,27.35,0xefe4c7,.003);
 for(const sign of [-1,1]){const base=box(root,.49,.08,.49,sign*9.2,.012,18,0xf8ead0,.025);base.rotation.y=Math.PI/4;}
 // Distinct circular batting-dirt patches; identical seeded texture keeps surfaces coherent.
 for(const sign of [-1,1]){const d=new THREE.Mesh(new THREE.CircleGeometry(.65,32),clay);d.rotation.x=-Math.PI/2;d.position.set(sign*2.25,-.028,28);root.add(d);}
}

export function buildStadium(){const root=new THREE.Group(),fixed=new THREE.Group();root.add(fixed);const grass=new THREE.Mesh(new THREE.PlaneGeometry(80,70),twoTone(new THREE.MeshPhongMaterial({map:rep(fieldGrass(),9,7),color:0xd4d0be,shininess:2})));grass.rotation.x=-Math.PI/2;grass.position.set(0,-.11,15);grass.receiveShadow=true;fixed.add(grass);for(let row=0;row<8;row++){box(fixed,25,.66,1.9,0,row*.66-.33,-row*1.9,0xbfa586,.015);box(fixed,25,.07,.12,0,row*.66+.015,-row*1.9+.92,0xf5c04f,.01);for(let col=-8;col<=8;col++){if(row===0&&(col===1||col===2))continue;stadiumSeat(fixed,col*1.35,row*.66,-row*1.9,(col+row)%5===0?palette.gold:palette.teal);}}
 for(const side of [-1,1]){for(let k=0;k<16;k++){box(fixed,1.0,.33,1,side*12.8,k*.33-.16,-k*.95+.35,0xddc4a3,.01);box(fixed,1.05,.04,.15,side*12.8,k*.33+.012,-k*.95+.86,palette.gold,.005);}for(let k=0;k<9;k++){cyl(fixed,.055,1.2,side*13.4,k*.66+.6,-k*1.9,INK,10);}pole(fixed,new THREE.Vector3(side*13.4,1.2,.2),new THREE.Vector3(side*13.4,6.5,-15),.07,INK);}
 // A real baseball diamond is in the forward establishing view.
 const dirt=new THREE.Mesh(new THREE.PlaneGeometry(13,13),paintMat('infield-dirt',()=>rep(fieldDirt(),2.4,2.4)));dirt.rotation.set(-Math.PI/2,0,Math.PI/4);dirt.position.set(0,-.075,18);fixed.add(dirt);const infield=new THREE.Mesh(new THREE.PlaneGeometry(8.3,8.3),paintMat('infield-grass',()=>rep(fieldGrass(),2,2),0xd4d0be));infield.rotation.set(-Math.PI/2,0,Math.PI/4);infield.position.set(0,-.06,18);fixed.add(infield);for(const [x,z]of [[0,8.8]])box(fixed,.47,.05,.47,x,-.02,z,0xfff0d3,.01);for(const s of [-1,1])pole(fixed,new THREE.Vector3(0,-.025,27.2),new THREE.Vector3(s*28,-.025,-.8),.035,0xffffff);
 box(fixed,35,1.45,.45,0,5.7,-16.5,palette.deep,.06);for(let i=-4;i<=4;i++)plaque(fixed,[i%2?'HOME OF THE COMETS':'PLAY BALL'],3.2,.6,i*3.7,5.85,-16.24,i%2?'#f1b64d':'#df6f49','#fff4d5',74);
 for(const s of [-1,1]){pole(fixed,new THREE.Vector3(s*15,0,-16),new THREE.Vector3(s*15,16,-16),.13,palette.deep);box(fixed,4.2,1.1,.38,s*15,16,-16,INK,.05);for(let k=-3;k<=3;k++){const lamp=box(fixed,.44,.7,.12,s*15+k*.55,16,-15.74,0xffefb3,.1);lamp.material=new THREE.MeshBasicMaterial({color:0xffe8a2});}}
 const board=new THREE.Group();board.position.set(0,10.2,-18.2);root.add(board);box(board,13.7,7.65,.5,0,0,0,palette.deep,.15);box(board,13.18,6.68,.1,0,.2,.31,INK,.03);const screen=new THREE.Mesh(new THREE.PlaneGeometry(12.8,6.32),new THREE.MeshBasicMaterial({color:0xffffff}));screen.position.set(0,.2,.38);screen.layers.set(3);board.add(screen);plaque(board,['FAN CAM  •  LIVE'],8.0,.68,0,4.22,.33,'#efaa45','#22333c',74);plaque(board,['COMETS  3     •     VISITORS  2     •     5TH'],12.6,.62,0,-3.37,.33,'#153f47','#fff0be',54);for(const x of [-6.65,6.65])for(let y=-3.25;y<3.7;y+=.55){const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),new THREE.MeshBasicMaterial({color:0xffd987}));bulb.position.set(x,y,.4);board.add(bulb);}for(const x of [-5.6,5.6])box(fixed,.35,8,.35,x,4,-18.2,palette.deep,.03);
 for(let i=-4;i<=4;i++){const p=new THREE.Group();p.position.set(i*3.15,7.15,-16.8);fixed.add(p);cyl(p,.035,2.5,0,0,0,palette.deep,8);const flag=new THREE.Mesh(new THREE.PlaneGeometry(.9,.45),mat(i%2?palette.coral:palette.gold));flag.position.set(.43,.7,.03);p.add(flag);}
 for(let i=-3;i<=3;i++){
  const x=i*8,stone=paintMat('stadium-back-concourse',()=>rep(stoneHD('ballpark-masonry',['#d6c5aa','#cdbb9d','#e1d0b4','#c2aa8a'],'#aa9377'),2,1.3));
  paintedBox(fixed,7.7,5.2,3.5,x,8.6,-21.2,stone);
  box(fixed,8.1,.30,3.9,x,11.28,-21.2,0x466c68,.035);box(fixed,8.3,.15,4.0,x,11.48,-21.2,0xc3a77c,.025);
  for(const j of [-1,0,1]){archOpening(fixed,x+j*2.38,6.85,-19.39,1.68,3.55);box(fixed,.28,4.75,.42,x+j*2.38-1.11,8.65,-19.23,0xe6cba4,.02);box(fixed,.48,.14,.58,x+j*2.38-1.11,10.95,-19.15,0xf1dab7,.015);}
  // A shallow pitched roof reveals a lit upper face, shadowed fascia and real overhang.
  const canopy=paintedBox(fixed,8.45,.13,3.4,x,11.75,-20.85,paintMat('backroof',()=>rep(roofHD('#9b7057'),3,1)));canopy.rotation.x=.17;
  box(fixed,8.5,.19,.19,x,11.47,-19.15,0x466c68,.025);
 }
 for(let i=0;i<7;i++){const cloud=new THREE.Mesh(new THREE.PlaneGeometry(16+i%3*3,6.4),new THREE.MeshBasicMaterial({map:cloudHD(i%4),transparent:true,depthWrite:false,fog:false}));cloud.layers.set(3);cloud.position.set(-55+i*18,22+i%3*4,-65-i%2*15);root.add(cloud);}
 stadiumDepth(fixed);diamondDetails(fixed);mergeStatic(fixed);const crowdUpdate=addCrowd(root);shadow(root,0,.017,.14,1.15,.9);shadow(root,1.35,.677,-1.76,1.15,.9);return {root,board,screen,crowdUpdate};}

function windowSet(root:THREE.Group,x:number,y:number,z:number,w=3.4,h=3.2){box(root,w+.35,h+.35,.2,x,y,z,palette.ivory,.06);const view=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture([''],{bg:'#94cbd3'})}));view.position.set(x,y,z+.12);root.add(view);for(const t of [-.22,.22])box(root,w,.08,.08,x,y+t*h,z+.17,palette.ivory,.02);box(root,.10,h,.08,x,y,z+.17,palette.ivory,.02);box(root,w+.55,.13,.4,x,y-h/2-.08,z+.1,palette.gold,.025);for(const s of [-1,1])for(let k=0;k<4;k++)box(root,.18,h+.55,.16,x+s*(w/2+.2)+k*.065*s,y,z+.16,0xd5965f,.05);}
function roomBase(type:'bedroom'|'office'|'meeting'){const root=new THREE.Group();const floor=new THREE.Mesh(new THREE.BoxGeometry(15,.16,14),twoTone(new THREE.MeshPhongMaterial({map:floorTexture('wood'),color:0xf7e5c5,shininess:12})));floor.position.set(0,-.1,-1);floor.receiveShadow=true;root.add(floor);const wall=new THREE.Mesh(new THREE.BoxGeometry(15,7,.2),twoTone(new THREE.MeshLambertMaterial({map:floorTexture('wall')})));wall.position.set(0,3.4,-5.5);root.add(wall);box(root,15,1.45,.14,0,.71,-5.34,palette.teal,.025);box(root,15,.075,.14,0,1.48,-5.25,palette.gold,.01);box(root,.2,7,14,-7.5,3.4,-1,palette.ivory,.01);windowSet(root,type==='bedroom'?-.7:3.5,3.75,-5.35,type==='meeting'?2.4:3.6,3.25);return root;}
function plant(root:THREE.Object3D,x:number,y:number,z:number){cyl(root,.32,.55,x,y+.28,z,palette.coral);cyl(root,.27,.08,x,y+.58,z,0x553d39);for(let j=0;j<7;j++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat(j%2?0x4a8468:0x67915b));leaf.scale.set(.14,.72,.1);leaf.position.set(x+Math.sin(j)*.30,y+1+Math.abs(Math.cos(j))*.15,z+Math.cos(j)*.25);leaf.rotation.z=Math.sin(j)*.5;root.add(leaf);}}
function mug(root:THREE.Object3D,x:number,y:number,z:number,col=palette.coral){cyl(root,.16,.28,x,y+.14,z,col,20);const top=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.015,20),mat(0x624735));top.position.set(x,y+.29,z);root.add(top);const handle=new THREE.Mesh(new THREE.TorusGeometry(.11,.04,8,16),mat(col));handle.position.set(x+.16,y+.16,z);root.add(handle);}
function chair(root:THREE.Object3D,x:number,z:number){const g=new THREE.Group();g.position.set(x,0,z);root.add(g);stadiumSeat(g,0,0,0,palette.teal);return g;}
export function buildBedroom(){const root=roomBase('bedroom');box(root,2.9,.46,4,-2.8,.38,-2,0xb67f51,.14);box(root,2.75,.38,3.8,-2.8,.77,-2,palette.ivory,.16);box(root,2.74,.12,2.6,-2.8,1.01,-1.45,palette.coral,.07);for(let k=0;k<10;k++)box(root,.028,.02,2.6,-4.05+k*.28,1.08,-1.45,0xf4b387,.005);box(root,2.9,1.6,.16,-2.8,1.1,-4.07,palette.teal,.10);box(root,1.7,.22,.65,-2.8,1.1,-3.4,0xfff0d4,.12);box(root,1.12,1.05,1.12,-.56,.52,-3.6,0xb98c5c,.06);for(let k=0;k<2;k++){box(root,1,.035,.05,-.56,.35+k*.4,-3.01,palette.deep,.01);cyl(root,.04,.13,-.56,.39+k*.4,-2.98,palette.gold,8).rotation.x=Math.PI/2;}cyl(root,.055,.64,-.56,1.39,-3.6,palette.deep);const shade=new THREE.Mesh(new THREE.CylinderGeometry(.3,.45,.48,24),mat(palette.gold));shade.position.set(-.56,1.88,-3.6);root.add(shade);plant(root,4.5,0,-4.4);const rug=box(root,3.5,.025,3.4,1.4,.005,.25,0xd3b370,.03);plaque(root,['FRIDAY'],1.45,.6,3.05,3.65,-5.16,'#e8774e','#fff3d0',108);shadow(root,1.4,.025,.2,1.2,.9);return {root};}
export function buildOffice(boss=false){const root=roomBase('office');box(root,4.7,.19,1.9,0,1.04,-.65,0xe4b977,.08);for(const x of [-1.95,1.95])box(root,.20,1.0,1.55,x,.5,-.65,palette.deep,.025);box(root,1.18,.8,1.65,1.42,.55,-.62,0xbf9667,.04);for(let j=0;j<3;j++){box(root,1.04,.045,.04,1.42,.30+j*.24,.23,palette.ivory,.015);}const monitor=new THREE.Group();monitor.position.set(-1.45,1.15,-.8);root.add(monitor);box(monitor,1.30,.82,.13,0,.59,0,palette.deep,.04);plaque(monitor,['COMETS CO.'],1.15,.65,0,.59,.076,'#a8c2bd','#f0e8cd',70);box(monitor,.10,.27,.10,0,.05,0,palette.deep);box(monitor,.61,.04,.39,0,-.1,.1,palette.deep);box(root,.95,.055,.38,-1.38,1.17,.02,palette.ivory,.015);for(let k=0;k<8;k++)box(root,.055,.02,.24,-1.75+k*.1,1.21,.02,palette.deep,.003);mug(root,.95,1.15,.0);box(root,.7,.06,.45,-.2,1.17,-.8,palette.ivory,.015);plant(root,-4.9,0,-4.65);chair(root,.5,-2.25);plaque(root,[boss?'DIRECTOR':'MONDAY'],1.65,.68,-3.1,3.35,-5.13,'#e27750','#fff1d0',95);const clock=new THREE.Group();clock.position.set(0,4.35,-5.1);root.add(clock);const disk=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.08,48),mat(palette.gold));disk.rotation.x=Math.PI/2;clock.add(disk);const face=new THREE.Mesh(new THREE.CircleGeometry(.49,48),mat(palette.ivory));face.position.z=.05;clock.add(face);box(clock,.035,.31,.03,0,.12,.08,palette.deep,.006);box(clock,.26,.035,.03,.11,0,.08,palette.deep,.006);const note=plaque(root,["You didn't see me.","I didn't see you.",'Feel better soon.'],.91,.72,.35,1.17,.15,'#ffdd6b','#294541',48);note.rotation.x=-Math.PI/2;shadow(root,.5,.025,-2.2,1.25,.9);return{root,note};}
export function buildMeeting(){const root=roomBase('meeting');box(root,3.25,.22,5.15,0,1.0,-.65,0xe5b77b,.09);box(root,.34,.92,3.9,0,.46,-.65,palette.deep,.04);box(root,2.2,.13,3.8,0,.09,-.65,palette.deep,.04);for(const x of [-2.0,2.0])for(const z of [1.0,-1.1]){const c=chair(root,x,z);c.rotation.y=x<0?Math.PI/2:-Math.PI/2;box(root,.55,.05,.7,x*.56,1.14,z,palette.ivory,.015);mug(root,x*.49,1.12,z-.4,x<0?palette.teal:palette.coral);}chair(root,0,-3.9);box(root,4.4,2.25,.14,-1.0,3.65,-5.13,palette.deep,.04);plaque(root,['TEAM UPDATE'],4.2,.42,-1.0,4.45,-5.04,'#f4e5c6','#24616a',72);const announce=plaque(root,['ONE EXTRA','PERSONAL DAY'],4.1,1.55,-1.0,3.55,-5.04,'#f4e5c6','#24616a',85);announce.visible=false;plant(root,-5.45,0,-4.6);for(const x of [-2.7,2.7]){cyl(root,.022,2,x,5.5,-.8,palette.deep,8);const lamp=new THREE.Mesh(new THREE.ConeGeometry(.49,.5,24,1,true),mat(palette.gold));lamp.position.set(x,4.35,-.8);root.add(lamp);}shadow(root,0,.025,-3.9,1.15,.9);return{root,announce};}
