import {Config} from '@remotion/cli/config';

// Serve the original media directly, without copying or rewriting it.
Config.setPublicDir('./video');
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setOverwriteOutput(false);
