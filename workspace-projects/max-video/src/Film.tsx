import React from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import {Scene} from './Scene';
export const Film:React.FC<{post?:boolean;audio?:string}>=({post=true,audio='narration.mp3'})=>{
 const frame=useCurrentFrame();
 return <AbsoluteFill style={{background:'#343d59'}}><Scene frame={frame} post={post}/><Audio src={staticFile(audio)}/></AbsoluteFill>;
};
