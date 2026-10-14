import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeSubstack,normalizeInstagram,getInstagram} from '../lib/feeds.mjs';
import {frameIndices,mod,reelSVG} from '../public/reel.js';
import {instagramPostURL} from '../public/instagram-links.js';
test('top ordering is preserved and untrusted destinations are rejected',()=>{
  const items=normalizeSubstack([{id:1,title:'First',canonical_url:'https://annanoellerinke.substack.com/p/first'},{id:1,title:'Duplicate',canonical_url:'https://annanoellerinke.substack.com/p/first'},{id:2,title:'Wrong source',canonical_url:'https://example.org/x'},{id:3,title:'Third',slug:'third'}]);
  assert.deepEqual(items.map(p=>p.id),['1','3']);
});
test('Instagram sorts newest first, picks video covers, and links to each specific post',()=>{
  const base={media_type:'IMAGE',media_url:'https://cdn.example.com/a.jpg',permalink:'https://www.instagram.com/p/test/',caption:'Title\nBody'};
  const items=normalizeInstagram([{...base,id:'1',timestamp:'2026-01-01'},{...base,id:'2',timestamp:'2026-01-03',media_type:'VIDEO',media_url:'https://cdn.example.com/a.mp4',thumbnail_url:'https://cdn.example.com/cover.jpg',permalink:'https://www.instagram.com/reel/video/'},{...base,id:'3',media_url:'javascript:alert(1)'}]);
  assert.deepEqual(items.map(p=>p.id),['2','1']);assert.equal(items[0].image,'https://cdn.example.com/cover.jpg');
  assert.deepEqual(items.map(p=>p.url),['https://www.instagram.com/p/video/','https://www.instagram.com/p/test/']);
});
test('Instagram destinations remove profile prefixes and Reels routes without changing the post',()=>{
  for(const path of ['p/DeZXoYZOS7x','reel/DeZXoYZOS7x/','reels/DeZXoYZOS7x/','annanoellerinke/reel/DeZXoYZOS7x/','annanoellerinke/p/DeZXoYZOS7x/']){
    for(const host of ['instagram.com','www.instagram.com']){
      assert.equal(instagramPostURL(`https://${host}/${path}?igsh=example#fragment`),'https://www.instagram.com/p/DeZXoYZOS7x/');
    }
  }
  for(const url of ['https://www.instagram.com/annanoellerinke/','https://www.instagram.com/reels/','https://www.instagram.com/p/abc/comments/','https://instagram.com.example.org/p/abc/','http://www.instagram.com/p/abc/','javascript:alert(1)'])assert.equal(instagramPostURL(url),null);
});
test('every bundled Instagram photo opens its matching post',()=>{
  const {items}=JSON.parse(readFileSync(new URL('../public/data/instagram.json',import.meta.url),'utf8'));
  assert.equal(items.length,50);
  for(const item of items){
    const url=new URL(item.url);
    assert.equal(url.origin,'https://www.instagram.com');
    assert.equal(url.pathname,`/p/${item.id}/`);
    assert.equal(url.pathname.split('/').at(-2),item.id);
    assert.equal(item.url,item.postUrl);
  }
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
