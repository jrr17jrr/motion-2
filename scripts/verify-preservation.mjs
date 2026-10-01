import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';

const expected={
 'video/0.mp4':'4EE8DFD4E7D59C21D066D5FE0E5677133ED31AA4FD315EAB81245E0674B8236A',
 'out/technical-test.mp4':'6B993B853C8B7340507033B1E43159DB42E375375350262D762F410800925AB3',
 'out/otica-descontao-motion-v2.mp4':'82F08C2342E4F906BE3E5362F0A0CCE0E82D9DA3B2A9AC0CED2BD271F693EB7B',
 'video/assets/brand/logo.png':'83B483B8BCECA229930C3CFE91EE094CDA63B771513058A40153169A7FD0A561',
 'out/otica-descontao-motion-v3.mp4':'C8CAAD259A838CF07ABF18FD1F1DC68435304BF72C94A3F638BCB68A328847A9',
 'referencias/ref.mp4':'74672A2ED72AE38411D3738E7F0005045714D450AA9DC5F6BCB374F71EDD57CE',
 'logonova.png':'DAE053B4495CF23D82AC340AC878DCDDFA10FF105FA428B90D183B2530ACD3DF',
 'video/assets/v4/logonova.png':'DAE053B4495CF23D82AC340AC878DCDDFA10FF105FA428B90D183B2530ACD3DF',
};
// The user replaced the root logo with logonova before V4. Keep checking the
// old copy used by V3; check the old root too if it is present.
if(existsSync('logo.png'))expected['logo.png']='83B483B8BCECA229930C3CFE91EE094CDA63B771513058A40153169A7FD0A561';
for(const [path,hash] of Object.entries(expected)) {
 const actual=createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
 if(actual!==hash)throw new Error(`Integrity mismatch: ${path}`);
 console.log(`${path}: SHA-256 unchanged`);
}
