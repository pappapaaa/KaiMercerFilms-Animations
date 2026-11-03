import React,{useLayoutEffect,useMemo} from 'react';
import * as THREE from 'three';
import {Composition,useCurrentFrame,useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {makeCharacter} from '../../templates/bridge/Character';
import {PALETTES,LIGHTING} from '../../templates/bridge/Design';
import {paintedPanel} from '../../templates/bridge/Paint';
import {outlinedBox} from '../../templates/bridge/Props';
import {interval,smooth,poseFrame} from '../../templates/bridge/Motion';
import {makeNotebook} from './Notebook';

/** Original two-second silent reuse test: worry -> notice -> held concerned look.
 * A new desk set and elevated locked composition replace the proof's parcel action. */
function NotebookScene({frame}:{frame:number}) {
  const {camera,gl,scene}=useThree();
  const built=useMemo(()=>{
    const root=new THREE.Group(),p=PALETTES.day;
    const actor=makeCharacter({bodyDepth:.12,holdFrames:2});
    actor.root.position.set(-.57,0,-.1);
    actor.root.rotation.y=.08;
    root.add(actor.root);

    const wallTex=paintedPanel({...p,wall:'#c6c5b6',wallShade:'#b0b6ac'},'wall',112);
    const floorTex=paintedPanel({...p,floor:'#c7b69c',floorShade:'#9f998a'},'floor',67);
    const wall=new THREE.Mesh(new THREE.PlaneGeometry(10,6),new THREE.MeshBasicMaterial({map:wallTex}));
    wall.position.set(0,3,-1.5);root.add(wall);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(10,8),new THREE.MeshBasicMaterial({map:floorTex}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-.012;root.add(floor);
    const rail=outlinedBox(10,.065,.04,'#7e8a85','#69736e',.003);
    rail.position.set(0,.05,-1.45);root.add(rail);

    const desk=new THREE.Group();desk.name='New small writing desk';desk.position.set(.45,0,.62);root.add(desk);
    const top=outlinedBox(1.38,.10,.96,'#9a725c','#5e4a43',.006);
    top.position.y=.83;desk.add(top);
    for(const x of [-.54,.54])for(const z of [-.34,.34]){
      const leg=outlinedBox(.075,.78,.075,'#7e6558','#5e4a43',.004);leg.position.set(x,.39,z);desk.add(leg);
    }
    const notebook=makeNotebook();notebook.position.set(.12,.88,.03);notebook.rotation.y=-.24;desk.add(notebook);
    // A background notice sheet frames the setting without competing with the actor's face.
    const pinboard=outlinedBox(.63,.54,.04,'#979d8b','#727c70',.003);
    pinboard.position.set(1.34,2.18,-1.45);root.add(pinboard);
    const paper=new THREE.Mesh(new THREE.PlaneGeometry(.29,.35),new THREE.MeshBasicMaterial({color:'#e7e7d4'}));
    paper.position.set(1.32,2.19,-1.423);paper.rotation.z=-.06;root.add(paper);

    const light=LIGHTING.day;
    const ambient=new THREE.AmbientLight(light.ambientColor,1.1);
    const key=new THREE.DirectionalLight(light.keyColor,1.7);key.position.set(-3,5,4);
    root.add(ambient,key);
    return {root,actor,dispose:()=>{
      actor.dispose();
      const geo=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>();
      root.traverse(o=>{if(o instanceof THREE.Mesh && !isDescendant(o,actor.root)){
        geo.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);
      }});
      geo.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());wallTex.dispose();floorTex.dispose();key.dispose();
    }};
  },[]);

  useLayoutEffect(()=>{
    gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMapping=THREE.NoToneMapping;
    scene.background=new THREE.Color('#c6c5b6');
    const cam=camera as THREE.PerspectiveCamera;
    cam.position.set(.28,2.8,6.0);cam.lookAt(0,1.15,.12);cam.fov=42;cam.updateProjectionMatrix();
    return()=>built.dispose();
  },[built,camera,gl,scene]);

  useLayoutEffect(()=>{
    const f=poseFrame(frame,2),notice=smooth(interval(f,6,14));
    built.actor.update({
      frame,mood:'worried',gesture:frame<18?'rest':'hold',talking:0,walk:0,
      gaze:[-.15+notice*.95,-notice*.85],lean:notice*-.045,headTurn:notice*.09,
    });
  },[frame,built]);
  return <primitive object={built.root}/>;
}

function isDescendant(object:THREE.Object3D,parent:THREE.Object3D):boolean {
  for(let p:THREE.Object3D|null=object;p;p=p.parent)if(p===parent)return true;
  return false;
}

const NotebookMoment:React.FC=()=>{
  const frame=useCurrentFrame(),{width,height}=useVideoConfig();
  return <ThreeCanvas width={width} height={height} gl={{antialias:true}} camera={{near:.1,far:40}}>
    <NotebookScene frame={frame}/>
  </ThreeCanvas>;
};

export const ForwardTestRoot:React.FC=()=> <Composition id="NotebookMoment" component={NotebookMoment}
  width={1440} height={2560} fps={24} durationInFrames={48}/>;
