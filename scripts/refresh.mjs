import fs from 'node:fs/promises';
import {getFeeds} from '../lib/feeds.mjs';
const feeds=await getFeeds();
let updates=0;
for(const [key,feed] of Object.entries(feeds)){
  if(feed.status!=='live'){console.log(`${key}: ${feed.status}; preserving saved collection`);continue;}
  const old=JSON.parse(await fs.readFile(`public/data/${key}.json`,'utf8'));
  // Retain durable local covers for unchanged articles/posts. New items use current source URLs.
  for(const item of feed.items){const existing=old.items.find(p=>p.id===item.id);if(existing?.image?.startsWith('/assets/'))item.image=existing.image;}
  await fs.writeFile(`public/data/${key}.json`,JSON.stringify(feed,null,2)+'\n');console.log(`${key}: refreshed ${feed.items.length}`);updates++;
}
if(!updates)process.exitCode=1;
