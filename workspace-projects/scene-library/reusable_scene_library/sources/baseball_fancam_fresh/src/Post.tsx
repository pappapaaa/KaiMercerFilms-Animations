/** Faithful template composer: ink -> lens pre -> lens main -> bloom -> NEUTRAL -> grade. */
import React,{useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {EffectComposer} from '@react-three/postprocessing';
import {BloomEffect,BlendFunction,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass} from './vendor/ink';
import {LensBlur} from './vendor/lensblur';
import {GradeEffect,GRADES,GRADE_STRENGTH} from './vendor/grade';
const makeBloom=()=>{const b=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.5,luminanceThreshold:1,luminanceSmoothing:.2,mipmapBlur:true,levels:6,radius:.6});const mip=b.mipmapBlurPass,setSize=mip.setSize.bind(mip);mip.setSize=(w:number,h:number)=>setSize(Math.round((1920*w)/Math.max(h,1)),1920);return b;};
export function Post({focus,blur}:{focus:number;blur:number}){const{scene,camera}=useThree();const fx=useMemo(()=>({ink:new InkPass(scene,camera as THREE.PerspectiveCamera),lens:new LensBlur({maxCoC:24,nearScale:1.2}),bloom:makeBloom(),tone:new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),grade:new GradeEffect(GRADES.day,GRADE_STRENGTH.day)}),[scene,camera]);fx.lens.focus=focus;fx.lens.cInf=blur;useEffect(()=>()=>{fx.ink.dispose();fx.lens.dispose();fx.bloom.dispose();fx.tone.dispose();fx.grade.dispose();},[fx]);return <EffectComposer multisampling={4}><primitive object={fx.ink} dispose={null}/><primitive object={fx.lens.pre} dispose={null}/><primitive object={fx.lens.main} dispose={null}/><primitive object={fx.bloom} dispose={null}/><primitive object={fx.tone} dispose={null}/><primitive object={fx.grade} dispose={null}/></EffectComposer>;}
