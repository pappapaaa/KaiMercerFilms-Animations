import React from 'react';
import {Composition} from 'remotion';
import {EiffelShort} from './videos/eiffel/Eiffel';
import {TOTAL,FPS} from './videos/eiffel/story';
export const Root:React.FC=()=> <Composition id="EiffelShort" component={EiffelShort} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920}/>;
