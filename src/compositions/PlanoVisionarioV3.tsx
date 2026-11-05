import React from 'react';
import {Audio, staticFile} from 'remotion';
import {PlanoVisionario} from './PlanoVisionario';

/**
 * V3 = the V1 picture (same component, no visual props) + an offline master
 * (scripts/mix-pv-v3.py): original narration PCM + reinforced SFX incl. a real
 * CC0 cash register, gain-staged, ducked and peak-limited. The video's own audio
 * is muted because the master already contains the narration.
 */
export const PlanoVisionarioV3: React.FC = () => (
	<PlanoVisionario muteSource soundtrack={<Audio src={staticFile('assets/pv/v3/master-v3.wav')} />} />
);
