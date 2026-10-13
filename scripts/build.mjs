import fs from 'node:fs/promises';
for(const name of ['homebody','substack','instagram']){
  const feed=JSON.parse(await fs.readFile(`public/data/${name}.json`,'utf8'));
  if(!feed.items?.length)throw Error(`${name}: no items`);
  if(new Set(feed.items.map(p=>p.id)).size!==feed.items.length)throw Error(`${name}: duplicate items`);
  for(const item of feed.items){
    if(!item.title||!item.url.startsWith('https://'))throw Error(`${name}: invalid content`);
    if(item.image?.startsWith('/'))await fs.access(`public${item.image}`);
  }
  console.log(`${name}: ${feed.items.length} valid items (${feed.status})`);
}
await fs.access('public/assets/viewer-source.png');
console.log('Static site ready in public/; Vercel builds api/feed.js separately.');
