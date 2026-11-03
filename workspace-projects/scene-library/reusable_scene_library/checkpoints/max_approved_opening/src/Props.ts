/** Original Max-story props. Real Three geometry, actual repo Pen ink and twoTone materials. */
import * as THREE from 'three';
import {Pen,INK} from './vendor/toon';
import {twoTone} from './vendor/shade';
export type PhoneMode='off'|'draft'|'saved'|'deleted'|'call';
export function makePhone(){
 const root=new THREE.Group();root.name='Narrator phone / exact hand grip';
 const body=new THREE.Mesh(new THREE.BoxGeometry(.36,.64,.055),twoTone(new THREE.MeshLambertMaterial({color:'#353442'})));body.position.y=.18;body.castShadow=body.receiveShadow=true;root.add(body);
 const c=document.createElement('canvas');c.width=600;c.height=1000;const ctx=c.getContext('2d')!;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.31,.53),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));screen.position.set(0,.18,.030);screen.layers.set(3);root.add(screen);
 const speaker=new THREE.Mesh(new THREE.BoxGeometry(.085,.009,.005),new THREE.MeshBasicMaterial({color:INK}));speaker.position.set(0,.475,.033);speaker.layers.set(3);root.add(speaker);
 let last:PhoneMode|undefined;
 const update=(mode:PhoneMode)=>{if(mode===last)return;last=mode;ctx.fillStyle=mode==='off'?'#363b4b':'#eee2cc';ctx.fillRect(0,0,600,1000);if(mode!=='off'){
  const p=new Pen(ctx);ctx.textAlign='left';ctx.fillStyle='#342d3e';ctx.font='bold 40px Arial';ctx.fillText(mode==='call'?'Emergency call':'My drafts',40,85);p.stroke([[35,120],[565,120]],3,'#a39890');
  if(mode==='call'){ctx.textAlign='center';ctx.font='bold 120px Arial';ctx.fillText('911',300,380);ctx.font='bold 34px Arial';ctx.fillText('Calling…',300,490);p.ell(300,800,70,70,'#bc6359',3);}
  else if(mode==='deleted'){ctx.textAlign='center';ctx.font='bold 56px Arial';ctx.fillText('Draft deleted',300,420);ctx.font='32px Arial';ctx.fillStyle='#696777';ctx.fillText('Nothing was posted.',300,485);}
  else {ctx.font='bold 45px Arial';['Free to a','good home:','one loud dog.'].forEach((s,i)=>ctx.fillText(s,40,245+i*75));p.poly([[35,700],[565,700],[565,815],[35,815]],mode==='saved'?'#779c92':'#d1b06c',3);ctx.textAlign='center';ctx.font='bold 37px Arial';ctx.fillText(mode==='saved'?'Saved as draft':'Save as draft',300,772);ctx.fillStyle='#716975';ctx.font='30px Arial';ctx.fillText('Not published',300,890);}
 }tex.needsUpdate=true;};update('off');
 return {root,screen,update,dispose:()=>{root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});tex.dispose();}};
}
