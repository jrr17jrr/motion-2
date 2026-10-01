import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const expected={
 'video/0.mp4':'4EE8DFD4E7D59C21D066D5FE0E5677133ED31AA4FD315EAB81245E0674B8236A',
 'out/technical-test.mp4':'6B993B853C8B7340507033B1E43159DB42E375375350262D762F410800925AB3',
};
for(const [path,hash] of Object.entries(expected)) {
 const actual=createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
 if(actual!==hash)throw new Error(`Integrity mismatch: ${path}`);
 console.log(`${path}: SHA-256 unchanged`);
}
