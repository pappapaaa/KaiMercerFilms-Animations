import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
export const Root:React.FC=()=> <>
 <Composition id="MaxWall2K" component={Film} width={1440} height={2560} fps={30} durationInFrames={2887} defaultProps={{audio:'mix.wav'}}/>
 <Composition id="MaxWall" component={Film} width={1080} height={1920} fps={30} durationInFrames={2887}/>
 <Composition id="MaxWallDiagnostic" component={Film} width={540} height={960} fps={30} durationInFrames={2887}/>
 <Composition id="MaxWallRaw" component={Film} width={540} height={960} fps={30} durationInFrames={2887} defaultProps={{post:false}}/>
</>;
