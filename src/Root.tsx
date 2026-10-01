import {OticaDescontaoV6} from './compositions/OticaDescontaoV6';
import {duration as durationV6} from './v6/timeline';
import {Composition} from 'remotion';
import {VideoBase} from './compositions/VideoBase';
import metadata from './media/source-metadata.json';
import {OticaDescontao} from './compositions/OticaDescontao';
import {OticaDescontaoV3} from './compositions/OticaDescontaoV3';
import {OticaDescontaoV4} from './compositions/OticaDescontaoV4';
import {duration as durationV4} from './v4/timeline';
import {OticaDescontaoV5} from './compositions/OticaDescontaoV5';
import {duration as durationV5} from './v5/timeline';

export const RemotionRoot = () => (
 <>
  <Composition
    id="VideoBase"
    component={VideoBase}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={Math.ceil(metadata.durationSeconds * 30)}
  />
  <Composition id="OticaDescontaoMotionV2" component={OticaDescontao} width={1080} height={1920} fps={30} durationInFrames={Math.ceil(metadata.durationSeconds * 30)}/>
  <Composition id="OticaDescontaoMotionV3" component={OticaDescontaoV3} width={1080} height={1920} fps={30} durationInFrames={Math.ceil(metadata.durationSeconds * 30)}/>
  <Composition id="OticaDescontaoMotionV4" component={OticaDescontaoV4} width={1080} height={1920} fps={30} durationInFrames={durationV4}/>
  <Composition id="OticaDescontaoMotionV5" component={OticaDescontaoV5} width={1080} height={1920} fps={30} durationInFrames={durationV5}/>
 <Composition id="OticaDescontaoMotionV6" component={OticaDescontaoV6} durationInFrames={durationV6} fps={30} width={1080} height={1920}/></>
);
