import {Composition} from 'remotion';
import {VideoBase} from './compositions/VideoBase';
import metadata from './media/source-metadata.json';
import {OticaDescontao} from './compositions/OticaDescontao';

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
 </>
);
