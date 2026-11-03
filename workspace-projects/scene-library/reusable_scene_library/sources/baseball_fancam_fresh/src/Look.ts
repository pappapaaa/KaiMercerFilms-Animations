/** The actual bridge template light/sky/shading system, fitted only to new world dimensions.
 * Source: mromidev/claude-animated-shorts e3b817b6, MIT. Presets are unchanged.
 */
import * as THREE from 'three';
import {LIGHTS,LOOK} from './vendor/lights';
import {TONE,CHAR,untone} from './vendor/shade';
import {cameraAt,SHOTS} from './Story';
export function createLook(root:THREE.Group){
 const skyMat=new THREE.ShaderMaterial({uniforms:{c0:{value:new THREE.Color()},c1:{value:new THREE.Color()},c2:{value:new THREE.Color()},c3:{value:new THREE.Color()},c4:{value:new THREE.Color()},e:{value:new THREE.Vector4()}},vertexShader:'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',fragmentShader:`uniform vec3 c0,c1,c2,c3,c4; uniform vec4 e; varying vec3 vP; void main(){float el=asin(clamp(normalize(vP).y,-1.0,1.0));vec3 c=mix(c0,c1,smoothstep(0.0,e.x,el));c=mix(c,c2,smoothstep(e.x,e.y,el));c=mix(c,c3,smoothstep(e.y,e.z,el));c=mix(c,c4,smoothstep(e.z,e.w,el));gl_FragColor=vec4(c,1.0);}`,side:THREE.BackSide,depthWrite:false,fog:false});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(1100,48,24),skyMat);sky.renderOrder=-1;sky.frustumCulled=false;sky.layers.set(3);root.add(sky);
 const hemi=new THREE.HemisphereLight('#cfe6ff','#6c5c8c',1.1),sun=new THREE.DirectionalLight('#fff0d6',2.6),fill=new THREE.DirectionalLight('#9fb8ff',.35);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);root.add(hemi,sun,sun.target,fill,fill.target);const fog=new THREE.Fog('#b8d0ec',25,300);
 const sunDirs=new Map<number,THREE.Vector3>();
 function update(id:number,cam:THREE.PerspectiveCamera,scene:THREE.Scene,focus:THREE.Vector3){const L=LIGHTS.day,K=LOOK.day;if(!sunDirs.has(id)){const s=SHOTS.find(s=>s.id===id)!;const c=cameraAt(s.startFrame);const f=new THREE.Vector3(c.aim[0]-c.pos[0],0,c.aim[2]-c.pos[2]).normalize(),right=new THREE.Vector3(-f.z,0,f.x);const az=THREE.MathUtils.degToRad(L.az),el=THREE.MathUtils.degToRad(L.el);sunDirs.set(id,f.multiplyScalar(Math.cos(az)*Math.cos(el)).addScaledVector(right,Math.sin(az)*Math.cos(el)).add(new THREE.Vector3(0,Math.sin(el),0)).normalize());}
  const dir=sunDirs.get(id)!;hemi.color.set(L.sky);hemi.groundColor.set(L.ground);hemi.intensity=L.hemiI;sun.color.set(L.sunCol);sun.intensity=L.sunI;const dist=cam.position.distanceTo(focus),Rr=THREE.MathUtils.clamp(dist*1.15+7,12,95);sun.position.copy(focus).addScaledVector(dir,220);sun.target.position.copy(focus);const sc=sun.shadow.camera;sc.left=-Rr;sc.right=Rr;sc.top=Rr;sc.bottom=-Rr;sc.near=20;sc.far=480;sc.updateProjectionMatrix();sun.shadow.bias=L.bias;sun.shadow.normalBias=L.normalBias*(Rr/12);fill.intensity=0;
  TONE.uLitCol.value.set(...L.lit);TONE.uShadeCol.value.set(...L.shade);TONE.uShadeLift.value.set(...L.lift);TONE.uLambert.value=L.lambert;TONE.uSideK.value=L.sideK;TONE.uTerm.value=L.term;TONE.uBounce.value.set(...K.bounce);TONE.uSat.value=K.sat;CHAR.uCharTint.value.set(...L.charTint);CHAR.uCharShade.value=L.charShade;CHAR.uGrad.value=L.charGrad;CHAR.uBodyGrad.value=L.bodyGrad;CHAR.uSideTint.value.set(...L.sideTint);
  const u=skyMat.uniforms;K.sky.c.forEach((h,i)=>untone(h,u['c'+i].value));const e=K.sky.e.map(THREE.MathUtils.degToRad);u.e.value.set(e[1],e[2],e[3],e[4]);sky.position.copy(cam.position);untone(L.fog,fog.color);fog.near=L.fogNear;fog.far=L.fogFar;scene.fog=fog;scene.background=null;
 }
 return {update,sky,sun,hemi,dispose:()=>{sky.geometry.dispose();skyMat.dispose();sun.shadow.map?.dispose();}};
}
