import React,{useLayoutEffect,useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useVideoConfig} from 'remotion';
import {makeCharacter,CharacterPose} from './Characters';
import {makeMax,MaxPose} from './DogMax';
import {makePhone} from './Props';
import {buildApartmentWorld,buildApartment} from './Worlds';
import {createLook,LightMode} from './Look';
import {Post} from './Post';
import {noInkFallback} from './vendor/ink';
import {Pen,fxContact,INK} from './vendor/toon';
import {blobMaterial} from './vendor/cardshade';
import {cameraAt,shotProgress,smooth,mix} from './Story';
import captions from './captions.json';
const words=captions.flatMap(c=>c.words);
const speech=(time:number)=>{const w=words.find(w=>time>=w.start&&time<w.end);return w?.text?.length ? .3+.22*Math.abs(Math.sin((time-w.start)*18)):.02;};
function makeScene(set:string,mode:LightMode){
 const root=new THREE.Group();root.name='Max story / actual MIT repository look';
 const env:any=set==='bedroom'?buildApartment(mode==='morning'?'morning':'night'):buildApartmentWorld(set as any);root.add(env.root);
 const narrator=makeCharacter('narrator','pajamas',13),girlfriend=makeCharacter('girlfriend','pajamas',27),harlan=makeCharacter('harlan','cardigan',42),medic=makeCharacter('paramedic','medic',51),medic2=makeCharacter('paramedic','medic',52),max=makeMax(41),phone=makePhone();
 root.add(narrator.root,girlfriend.root,harlan.root,medic.root,medic2.root,max.root);narrator.rightHand.add(phone.root);
 const sc=document.createElement('canvas');sc.width=sc.height=128;fxContact(new Pen(sc.getContext('2d')!),'#7c7e9b');const shadowMap=new THREE.CanvasTexture(sc);shadowMap.colorSpace=THREE.SRGBColorSpace;const proneShadow=new THREE.Mesh(new THREE.PlaneGeometry(2.35,.78),blobMaterial(shadowMap));proneShadow.rotation.x=-Math.PI/2;proneShadow.position.set(4.95,.022,-2.60);proneShadow.layers.set(3);proneShadow.renderOrder=.5;proneShadow.visible=false;root.add(proneShadow);
 const gripDot=new THREE.Mesh(new THREE.CircleGeometry(.047,24),new THREE.MeshBasicMaterial({color:INK,toneMapped:false}));gripDot.name='Collar grip / original hand-dot accent';gripDot.layers.set(3);gripDot.visible=false;root.add(gripDot);
 const look=createLook(root,mode);
 return {root,env,narrator,girlfriend,harlan,medic,medic2,max,phone,look,proneShadow,gripDot,dispose:()=>{[narrator,girlfriend,harlan,medic,medic2,max].forEach(c=>c.dispose());phone.dispose();look.dispose();gripDot.geometry.dispose();(gripDot.material as THREE.Material).dispose();proneShadow.geometry.dispose();(proneShadow.material as THREE.Material).dispose();shadowMap.dispose();}};
}
function Layer({frame,post}:{frame:number;post:boolean}){
 const state=useThree(),time=frame/30,{shot,p}=shotProgress(frame),s:any=shot,action:string=({barkwall:'dog_hook',clocknight:'clock_3am',giveaway:'rehome_threat',firstnightmouse:'first_night',earwall:'ear_to_wall'} as Record<string,string>)[s.action]||s.action||'dog_hook';
 const set=s.set==='apartment'?'bedroom':s.set,mode:LightMode=s.mode??(set==='sunday'?'sunday':set==='bathroom'?'bathroom':set==='hallway'?'hallway':/write_post|draft_text|save_draft|delete_post/.test(action)?'morning':'night');
 const built=useMemo(()=>makeScene(set,mode),[set,mode]);const camData=cameraAt(frame);
 const direction=new THREE.Vector3(...camData.aim).sub(new THREE.Vector3(...camData.pos)).normalize(),distance=new THREE.Vector3(...camData.aim).sub(new THREE.Vector3(...camData.pos)).dot(direction);
 useLayoutEffect(()=>{state.gl.outputColorSpace=THREE.SRGBColorSpace;state.gl.toneMapping=post?THREE.NoToneMapping:THREE.NeutralToneMapping;state.gl.toneMappingExposure=1;state.gl.shadowMap.enabled=true;state.gl.shadowMap.type=THREE.PCFShadowMap;state.gl.shadowMap.autoUpdate=false;return()=>built.dispose();},[built,state,post]);
 useLayoutEffect(()=>{
  const{narrator:n,girlfriend:g,harlan:h,medic:m,medic2:m2,max:d,phone,env}=built,q=smooth(p),local=time-(s.startSeconds??s.startFrame/30);
  n.root.visible=true;g.root.visible=h.root.visible=m.root.visible=m2.root.visible=false;d.root.visible=true;phone.root.visible=false;
  [n,g,h,m,m2].forEach(r=>{r.root.rotation.set(0,0,0);r.root.scale.setScalar(1);});
  n.root.position.set(.3,0,-2.6);g.root.position.set(-3.05,.16,-3.3);h.root.position.set(4.4,0,-2.6);m.root.position.set(5.6,0,-1.5);m2.root.position.set(7.2,0,-2.9);
  d.root.position.set(1.68,0,-2.6);d.root.rotation.set(0,0,0);d.root.scale.setScalar(1);
  const np:CharacterPose={time,expression:'tired',gaze:[.7,.25],headView:1,headYaw:.18,handL:[-.45,1.19,.065],handR:[.45,1.19,.065],mouth:.02};
  const gp:CharacterPose={time:time+.3,seated:1,expression:'tired',gaze:[1,0],headView:1,handL:[-.42,1.1,.065],handR:[.45,1.25,.065]};
  const hp:CharacterPose={time:time+.7,expression:'pained',gaze:[-.6,0],handL:[-.45,1.1,.065],handR:[.45,1.2,.065]};
  const mp:CharacterPose={time:time+.15,expression:'concerned',gaze:[-.8,0],headView:-1,handL:[-.5,1.25,.065],handR:[.45,1.45,.065]};
  const dp:MaxPose={time,action:'bark',phase:local+time*.15,earAlert:1};
  if(action==='dog_hook'){n.root.position.set(-2.55,.265,-2.38);np.seated=1;np.groundShadow=false;np.expression='pained';np.headView=1;np.headTilt=-5;np.handR=[.33,2.1,.065];dp.bark=.85;}
  if(action==='clock_3am'||action==='week_exhaustion'){np.expression='pained';np.headView=0;np.gaze=[.8,.25];np.handL=[-.35,2.2,.065];dp.bark=.8;}
  if(action==='rehome_threat'){np.expression='nervous';np.headView=0;np.gaze=[.55,.1];np.handL=[-.43,1.2,.065];np.handR=[.36,1.45,.065];np.headTilt=2+3*q;dp.action='whine';dp.bark=0;dp.whine=.45;}
  if(action==='first_night'){n.root.position.set(.62,0,-2.65);np.expression='curious';np.handR=[.2,2.15,.065];np.gaze=[1,0];dp.action='alert';}
  if(action==='ear_to_wall'){const approach=smooth(p/.45);n.root.position.x=mix(2.17,2.14,approach);np.headView=0;np.headTilt=6*approach;np.lean=0;np.gaze=[.2,0];np.blink=.35;np.expression='neutral';np.handR=[.49,1.95,.065];np.handL=[-.43,1.2,.065];dp.action='alert';d.root.position.z=-1.6;}
  if(action==='go_to_sleep'){n.root.position.set(.5,0,-2.6);np.expression='stern';np.mouth=speech(time);np.handR=[.72,1.15,.065];np.gaze=[1,.2];dp.action='whine';}
  if(action==='claw_paint'){n.root.position.set(-.2,0,-3.2);np.expression='pained';d.root.position.x=1.68;dp.action='scratch';dp.whine=.65;dp.scratch=1;}
  if(action==='sleepless'){np.expression='pained';np.headView=0;np.gaze=[0,.4];np.handL=[-.32,2.17,.065];np.headTilt=4;dp.action='alert';}
  if(action==='girlfriend_roll'||action==='girlfriend_scold'){g.root.visible=true;np.gaze=[-1,0];np.headView=-1;np.expression='nervous';gp.expression=action==='girlfriend_scold'?'stern':'pained';gp.headTilt=action==='girlfriend_roll'?mix(8,-3,q):-3;gp.mouth=action==='girlfriend_scold'?speech(time):.03;gp.handR=[.57,1.75,.065];dp.action='alert';}
  if(action==='girlfriend_roll'){const roll=.04+.48*q,half=.49*.96;g.root.scale.setScalar(.96);g.root.rotation.set(-Math.PI/2+.04,roll,0);g.root.position.set(-2.91-half*Math.cos(roll),1.08+half*Math.sin(roll),-1.42);gp.seated=0;gp.groundShadow=false;gp.expression='pained';gp.blink=p<.2?1:.3;gp.headView=0;gp.headTilt=0;gp.handL=[-.28,1.75,.065];gp.handR=[.28,1.68,.065];}
  if(action==='girlfriend_scold'){g.root.position.set(-2.55,.265,-2.38);gp.seated=1;gp.groundShadow=false;gp.headView=1;}
  if(action==='neighbor_excuse'){g.root.visible=true;np.expression='stern';np.headView=0;np.gaze=[-.5,0];np.mouth=speech(time);np.handR=[.72,1.8,.065];dp.action='bark';}
  if(action==='collar_drag'){const pull=smooth((p-.18)/.60),dist=.58*pull;d.root.position.set(1.68-dist,0,-2.6);dp.action='walk';dp.facing=1;dp.travel=-dist;dp.walk=p>.16&&p<.82?1:0;dp.whine=.30;dp.earAlert=.35;np.expression='nervous';np.seated=.80;np.lean=.24;n.root.position.set(1.18-dist,0,-2.962);np.handL=[-.43,1.0,.065];}
  if(action==='break_free'){const run=smooth((p-.14)/.70);d.root.position.set(1.10+.58*run,0,-2.6);dp.facing=1;dp.action=run>=1?'alert':'return';dp.travel=.58*run;dp.walk=p>.12&&p<.86?1:0;dp.earAlert=1;np.expression='surprise';np.seated=.80*(1-smooth(p/.48));np.lean=.18*(1-smooth(p/.48));np.handR=[mix(.92,.55,smooth(p/.14)),mix(.65,1.15,smooth(p/.3)),.065];n.root.position.set(.60,0,-2.61-.44*(np.seated??0));}
  if(action==='write_post'||action==='draft_text'||action==='save_draft'||action==='delete_post'){phone.root.visible=true;phone.root.rotation.set(0,0,-.1);n.root.rotation.y=-.48;phone.root.scale.setScalar(1.65);np.headView=0;np.gaze=[.3,.7];np.handR=[.32,1.7,.065];const tap=(action==='save_draft'||action==='delete_post')?Math.exp(-Math.pow((frame-(action==='save_draft'?1202:2605))/5,2)):0;np.handL=[mix(-.08,.32,tap),mix(1.35,1.76,tap),.065];np.expression=action==='delete_post'?'relief':'stern';n.root.position.set(.15,0,-2.3);dp.action=action==='delete_post'?'happy':'whine';dp.whine=action==='delete_post'?0:.6;phone.update(action==='save_draft'&&frame>=1202?'saved':action==='delete_post'&&frame>=2605?'deleted':'draft');}
  if(action==='alarm_again'||action==='ominous_quiet'||action==='howl')n.root.position.x=-.65;
  if(action==='alarm_again'){np.handL=[-.34,2.18,.065];np.headView=0;np.expression='pained';dp.action='alert';}
  if(action==='ominous_quiet'){np.headView=1;np.expression='curious';dp.action='alert';dp.earAlert=1;}
  if(action==='howl'){dp.action='howl';np.expression='stern';}
  if(action==='body_wall'){const hop=Math.max(0,Math.min(1,(frame-s.startFrame-8)/8));d.root.rotation.y=-Math.PI/2;d.root.position.set(2.385+.045*smooth(hop),.045*4*hop*(1-hop),-2.55);dp.action='howl';dp.howl=.6;dp.earAlert=1;np.expression='stern';np.handR=[.65,1.5,.065];}
  if(action==='yell_abort'){np.expression=p<.42?'stern':'shock';np.mouth=p<.42?.45:.02;np.handR=[.70,mix(1.65,1.25,q),.065];dp.action='alert';}
  if(action==='hear_wall'||action==='thumps'||action==='stomach_drop'){np.expression=action==='stomach_drop'?'shock':'curious';np.gaze=[1,0];np.headView=1;np.blink=0;np.handL=[-.45,1.22,.065];np.handR=[.40,1.3,.065];dp.action='alert';dp.bark=0;dp.earAlert=1;}
  if(action==='hear_wall'||action==='thumps'){n.root.position.set(2.14,0,-2.6);np.headView=0;np.headTilt=6;np.lean=0;np.handR=[.49,1.95,.065];np.expression=action==='thumps'&&time>55.9?'shock':'neutral';np.gaze=[.2,0];np.blink=action==='thumps'&&time>55.9?0:.35;np.mouth=0;}
  if(set==='hallway'){
   if(env.door)env.door.rotation.y=0; // Deterministic when Remotion seeks backward across rescue_entry.
   n.root.position.set(7.05,0,4.25);n.root.rotation.y=-Math.PI/2;d.root.position.set(6.40,0,4.65);d.root.rotation.y=-Math.PI/2;np.expression='worried';np.headView=-1;np.gaze=[-1,0];dp.action='alert';dp.facing=-1;
   if(action==='hallway_run'){const run=q;n.root.rotation.y=0;n.root.position.set(mix(-1.2,6.25,run),0,4.55);d.root.rotation.y=-Math.PI/2;d.root.position.set(6.4,0,4.65);np.profileBody=true;np.profileStride=1;np.walk=1;np.travel=7.45*run;np.headView=1;np.gaze=[1,0];np.lean=-.07;np.handL=undefined;np.handR=undefined;dp.facing=-1;dp.action='alert';dp.walk=0;dp.earAlert=1;}
   if(action==='pound_door'||action==='call_harlan'){const pulse=Math.max(0,Math.sin(local*11))*Math.exp(-.25*local);np.handL=[-.50-.11*pulse,2.0,.065];np.handR=[.40,1.2,.065];np.mouth=action==='call_harlan'?speech(time):.02;np.expression='worried';}
   if(action==='no_answer'||action==='tap_back'){np.handL=[-.54,1.95,.065];np.expression=action==='tap_back'?'shock':'worried';np.blink=0;dp.earAlert=1;}
   if(action==='call_911'){n.root.rotation.y=.18;n.root.position.set(6.3,0,4.2);np.headView=0;np.gaze=[.3,0];phone.root.visible=true;phone.root.scale.setScalar(1);phone.update('call');np.handR=[.47,2.23,.065];np.mouth=speech(time);}
   if(action==='rescue_entry'){m.root.visible=m2.root.visible=true;m.root.position.set(7.20,0,4.1);m.root.rotation.y=-.85;m2.root.position.set(8.1,0,4.8);n.root.position.set(5.45,0,4.35);n.root.rotation.y=.1;np.headView=1;np.expression='worried';mp.expression='stern';mp.handL=[-.60,1.6,.065];mp.lean=.12*q;dp.action='walk';dp.facing=-1;d.root.rotation.y=-Math.PI/2;d.root.position.set(6.40,0,4.65-3.45*q);dp.travel=3.45*q;dp.walk=1;}
  }
  if(set==='bathroom'){
   n.root.position.set(7.05,0,-.3);n.root.visible=action!=='bath_scratch';d.root.position.set(6.55,0,1.07);d.root.rotation.y=Math.PI/2;m.root.position.set(4.05,0,-1.96);m2.root.position.set(5.75,0,-1.85);h.root.position.set(6.35,.43,-2.62);h.root.scale.setScalar(.82);h.root.rotation.z=Math.PI/2;h.root.visible=m.root.visible=m2.root.visible=action!=='bath_scratch';
   np.expression='worried';np.headView=-1;np.gaze=[-1,0];dp.action=action==='bath_scratch'?'scratch':'alert';dp.facing=1;dp.scratch=action==='bath_scratch'?1:0;if(action==='bath_scratch')dp.scratchReach=.96;hp.expression='pained';hp.blink=.35;hp.handR=[-.28,1.24,.065];hp.handL=[-.35,1.80,.065];hp.lean=.02;hp.headTilt=-2;hp.groundShadow=false;mp.expression='concerned';mp.seated=.8;mp.gaze=[0,.5];mp.headView=0;mp.handR=[.47,1.15,.065];
   if(action==='fallen_harlan'||action==='unreachable_phone'){m.root.visible=m2.root.visible=false;}
   if(action!=='bath_scratch'){d.root.position.set(6.35,0,-.9);d.root.rotation.y=0;dp.facing=-1;}
   if(action==='paramedic'||action==='warning'){m.root.position.set(4.7,0,-2.3);n.root.position.set(6.1,0,-2.3);m2.root.visible=false;d.root.visible=false;mp.seated=0;mp.expression='stern';mp.gaze=[1,0];mp.headView=1;mp.handR=[.65,1.7,.065];mp.mouth=action==='warning'?speech(time):.02;np.expression=action==='warning'&&p>.7?'relief':'shock';np.blink=0;}
  }
  if(action==='steak'){n.root.position.set(-.1,0,-2.2);np.expression='relief';np.gaze=[1,.5];np.headView=1;d.root.position.set(1.1,0,-2.0);dp.action='eat';dp.happy=.7;dp.eat=.94;}
  if(set==='sunday'){
   env.setSide?.(action==='bark_back'?'narrator':'harlan');
   n.root.visible=action==='bark_back';d.root.visible=action==='bark_back';n.root.position.set(.3,0,-2.6);np.expression='relief';np.headView=1;np.gaze=[1,.2];dp.action='happy';dp.happy=.7;
   if(action==='harlan_payoff'||action==='sunday'||action==='two_knocks'){h.root.visible=true;h.root.position.set(3.65,0,-2.6);hp.expression='smile';hp.headView=-1;hp.gaze=[-1,0];const k1=Math.exp(-Math.pow((time-93.24)/.12,2)),k2=Math.exp(-Math.pow((time-94.05)/.12,2));hp.handL=[-.60-.095*Math.max(k1,k2),1.95,.065];}
   if(action==='bark_back'){h.root.visible=false;dp.action='bark';dp.bark=.8;dp.happy=1;np.expression='happy';}
  }
  built.proneShadow.visible=set==='bathroom'&&h.root.visible;
  d.pose(dp);
  built.gripDot.visible=action==='collar_drag';
  if(action==='collar_drag'){const point=d.collar.getWorldPosition(new THREE.Vector3());built.gripDot.position.copy(point);built.gripDot.position.z+=.045;n.root.updateMatrixWorld(true);n.root.worldToLocal(point);np.handR=[point.x,point.y,.065];}
  if(n.root.visible)n.pose(np);if(g.root.visible)g.pose(gp);if(h.root.visible)h.pose(hp);if(m.root.visible)m.pose(mp);if(m2.root.visible)m2.pose({...mp,time:time+.5,expression:'concerned',mouth:0});
  if(env.update)env.update(time);if(env.steak)env.steak.visible=action==='steak';if(env.wallKnock)env.wallKnock.visible=false;if(env.door&&action==='rescue_entry')env.door.rotation.y=-1.45*q;if(set==='bathroom'&&env.door)env.door.rotation.y=action==='bath_scratch'?0:-1.25;
  noInkFallback(built.root);const cam=state.camera as THREE.PerspectiveCamera;cam.position.set(...camData.pos);cam.up.set(0,1,0);cam.lookAt(...camData.aim);cam.rotateZ(camData.roll);cam.fov=camData.fov;cam.near=.2;cam.far=1500;cam.layers.enable(3);cam.updateProjectionMatrix();cam.updateMatrixWorld();built.look.update(s.id,cam,state.scene,new THREE.Vector3(...camData.aim));built.root.updateMatrixWorld(true);state.gl.shadowMap.needsUpdate=true;
  (window as any).__MAX__={frame,shot:s,rigs:{narrator:n,max:d,harlan:h},env,camera:cam,renderer:state.gl};
  if([0,42,80,120,180,240,299].includes(frame))console.info('MAX_FRAME',JSON.stringify({frame,shot:s.id,action,repo:'e3b817b6',native:'1080x1920',look:'actual cardShade ink lens grade with derived night light'}));
 },[frame,time,shot,p,action,set,mode,built,state,camData]);
 return <><primitive object={built.root}/>{post&&<Post focus={distance} blur={camData.blur}/>}</>;
}
export const Scene:React.FC<{frame:number;post:boolean}>=({frame,post})=>{const{width,height}=useVideoConfig();return <ThreeCanvas width={width} height={height} shadows="percentage" gl={{antialias:false,stencil:false,preserveDrawingBuffer:true,powerPreference:'high-performance',toneMappingExposure:1}} camera={{fov:40,near:.2,far:1500}}><Layer frame={frame} post={post}/></ThreeCanvas>;};
