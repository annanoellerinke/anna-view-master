import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSubstack,normalizeInstagram,getInstagram} from '../lib/feeds.mjs';
import {frameIndices,mod,reelSVG} from '../public/reel.js';
test('top ordering is preserved and untrusted destinations are rejected',()=>{
  const items=normalizeSubstack([{id:1,title:'First',canonical_url:'https://annanoellerinke.substack.com/p/first'},{id:1,title:'Duplicate',canonical_url:'https://annanoellerinke.substack.com/p/first'},{id:2,title:'Wrong source',canonical_url:'https://example.org/x'},{id:3,title:'Third',slug:'third'}]);
  assert.deepEqual(items.map(p=>p.id),['1','3']);
});
test('Instagram sorts newest first, picks video covers, and keeps profile destination',()=>{
  const base={media_type:'IMAGE',media_url:'https://cdn.example.com/a.jpg',permalink:'https://www.instagram.com/p/test/',caption:'Title\nBody'};
  const items=normalizeInstagram([{...base,id:'1',timestamp:'2026-01-01'},{...base,id:'2',timestamp:'2026-01-03',media_type:'VIDEO',media_url:'https://cdn.example.com/a.mp4',thumbnail_url:'https://cdn.example.com/cover.jpg'},{...base,id:'3',media_url:'javascript:alert(1)'}]);
  assert.deepEqual(items.map(p=>p.id),['2','1']);assert.equal(items[0].image,'https://cdn.example.com/cover.jpg');assert.equal(items[0].url,'https://www.instagram.com/annanoellerinke/');
});
test('missing Instagram connection is explicit',async()=>assert.deepEqual(await getInstagram({}),{status:'needs-connection'}));
test('reel traverses every item over repeated turns and backwards, including seam',()=>{
  for(const count of [4,10,20,50]){
    const items=Array.from({length:count},(_,id)=>({image:`/photo-${id}.jpg`}));
    const mounted=[...reelSVG({items,sceneLabels:['Studio']},'test',1,true).matchAll(/data-slot="\d+" href="\/photo-(\d+)\.jpg"/g)].map(match=>Number(match[1]));
    assert.deepEqual(mounted,frameIndices(0,1,count),'the mounted reel must start in the same arrangement as its first rotation');
    for(let step=-100;step<=150;step++){
    const indices=frameIndices(step,1,count);assert.equal(indices[mod(step,14)],mod(1+step,count));assert.ok(indices.every(n=>n>=0&&n<count));
    const next=frameIndices(step+1,1,count);const changed=indices.flatMap((v,i)=>v!==next[i]?[i]:[]);
    assert.ok(changed.length<=1,'only one hidden frame may be rebound');
    }
  }
});
