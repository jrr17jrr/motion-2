import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

// Technical baseline only: original picture and sound, no creative edits.
export const VideoBase = () => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <OffthreadVideo
      src={staticFile('0.mp4')}
      volume={1}
      style={{width: '100%', height: '100%', objectFit: 'contain'}}
    />
  </AbsoluteFill>
);
