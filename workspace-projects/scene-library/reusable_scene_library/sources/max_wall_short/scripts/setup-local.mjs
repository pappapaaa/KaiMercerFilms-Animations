// Pinned Remotion's port resolver enumerates interfaces unavailable in this runtime.
// Restrict its local media proxy to loopback; no public bind, OS changes or account access.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const[f,needle]of [['node_modules/@remotion/renderer/dist/port-config.js','const getPortConfig = (preferIpv4) => {'],['node_modules/@remotion/renderer/dist/esm/index.mjs','var getPortConfig = (preferIpv4) => {']]){const p=path.join(root,f),s=await readFile(p,'utf8'),mark='FANCAM_LOOPBACK_ONLY';if(s.includes(mark))continue;if(!s.includes(needle))throw Error('Pinned dependency mismatch: '+f);await writeFile(p,s.replace(needle,needle+'\n // '+mark+'\n return {host:"127.0.0.1",hostsToTry:["127.0.0.1"]};'));console.log('Loopback-only media proxy:',f);}
