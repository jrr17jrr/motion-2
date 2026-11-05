import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {PlanoVisionario} from './PlanoVisionario';
import {sfxV2, volumeFor} from '../pv/sfx-v2';

/** V2 = the V1 picture, byte-for-byte the same component, with the reworked SFX layer. */
const SoundDesignV2: React.FC = () => (
	<>
		{sfxV2.map((e, i) => (
			<Sequence key={i} from={Math.max(0, e.from)} layout="none">
				<Audio src={staticFile(`assets/pv/sfx-v2/${e.file}.wav`)} volume={volumeFor(e)} />
			</Sequence>
		))}
	</>
);

export const PlanoVisionarioV2: React.FC = () => <PlanoVisionario soundtrack={<SoundDesignV2 />} />;
/** QA only: SFX stems without the original audio, to measure effects vs. voice. */
export const PlanoVisionarioV1SfxStem: React.FC = () => <PlanoVisionario muteSource />;
export const PlanoVisionarioV2SfxStem: React.FC = () => <PlanoVisionario soundtrack={<SoundDesignV2 />} muteSource />;
