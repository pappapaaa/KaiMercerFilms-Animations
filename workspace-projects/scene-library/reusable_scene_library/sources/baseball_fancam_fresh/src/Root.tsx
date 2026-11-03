import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
export const Root:React.FC=()=> <><Composition id="FanCamFresh" component={Film} width={1080} height={1920} fps={30} durationInFrames={2253}/><Composition id="FanCamPreview" component={Film} width={540} height={960} fps={30} durationInFrames={2253}/><Composition id="FanCamRaw" component={Film} width={540} height={960} fps={30} durationInFrames={2253} defaultProps={{post:false}}/></>;
