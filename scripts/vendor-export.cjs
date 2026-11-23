// Export only the release reachable through the configured delivery code.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'vendor-staging/snapshot'));
const config = JSON.parse(fs.readFileSync(path.join(root, 'public/config.json')));
const hashes = new Set();
const external = new Set();
function inspect(value) {
  if (typeof value === 'string') {
    if (/^[a-f0-9]{64}$/.test(value)) hashes.add(value);
    if (value.startsWith('http:') || value.startsWith('https:') || value.startsWith('//')) external.add(value);
  } else if (Array.isArray(value)) value.forEach(inspect);
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key,item])=>{if(key!=='packageSha256')inspect(item);});
}
async function main() {
  fs.mkdirSync(path.join(out, 'objects'), {recursive:true});
  async function request(p, init={}) {
    const r = await fetch(config.serverUrl+p, {...init,signal:AbortSignal.timeout(120000)});
    if (!r.ok) throw Error(`${p}: HTTP ${r.status}`);
    return r;
  }
  const auth=await (await request('/delivery/token',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:config.deliveryCode})})).json();
  const headers={authorization:`Bearer ${auth.token}`};
  const release=await (await request('/delivery/release',{headers})).json();
  const apis=await (await request('/delivery/custom-apis',{headers})).json();
  if (release.revision!==apis.revision) throw Error('Release changed during export; retry with a frozen revision');
  for(const [name,value] of [['release',release],['custom-apis',apis]]) {
    fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2));inspect(value);
  }
  const done=new Set();const objects=[];
  while([...hashes].some(h=>!done.has(h))) {
    for(const h of [...hashes].filter(h=>!done.has(h))) {
      const data=Buffer.from(await (await request('/objects/'+h,{headers})).arrayBuffer());
      if(crypto.createHash('sha256').update(data).digest('hex')!==h) throw Error('Hash mismatch: '+h);
      fs.writeFileSync(path.join(out,'objects',h),data);done.add(h);
      let kind='binary';
      if(data.subarray(0,4).toString()==='glTF') {
        kind='glb';let offset=12;
        while(offset+8<=data.length) {const length=data.readUInt32LE(offset);const type=data.readUInt32LE(offset+4);if(type===0x4e4f534a){const gltf=JSON.parse(data.subarray(offset+8,offset+8+length).toString().trim());inspect(gltf);const uris=[...(gltf.buffers||[]),...(gltf.images||[])].map(x=>x.uri).filter(x=>x&&!x.startsWith('data:'));if(uris.length)throw Error('GLB external resources require export adaptation: '+JSON.stringify(uris));}offset+=8+length;}
      } else {try {inspect(JSON.parse(data.toString()));kind='json';}catch(e){kind='javascript';const body=data.toString(); if(body.includes('fetch(')||body.includes('https:')||body.includes('http:')||body.includes('import(')) external.add('REVIEW_DYNAMIC_CODE:'+h);}}
      objects.push({hash:h,bytes:data.length,kind});
    }
  }
  const latest=await (await request('/delivery/status',{headers})).json();
  if(latest.revision!==release.revision)throw Error('Release updated during export; re-export');
  const report={sceneId:release.sceneId,name:release.name,revision:release.revision,exportedAt:new Date().toISOString(),customApiCount:apis.definitions.length,objects,externalReferences:[...external]};
  fs.writeFileSync(path.join(out,'snapshot-info.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
