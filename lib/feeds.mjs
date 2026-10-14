import {instagramPostURL} from '../public/instagram-links.js';
const PUBLICATION='https://annanoellerinke.substack.com';
export function httpsURL(value,host){
  try{const url=new URL(value);return url.protocol==='https:'&&(!host||url.hostname===host)?url.href:null;}catch{return null;}
}
export function normalizeSubstack(posts){
  if(!Array.isArray(posts))throw Error('Unexpected archive response');
  const seen=new Set();
  return posts.flatMap(post=>{
    const id=String(post.id||'');const url=httpsURL(post.canonical_url||`${PUBLICATION}/p/${post.slug}`,'annanoellerinke.substack.com');
    if(!id||seen.has(id)||!url||!post.title)return[];seen.add(id);
    let image=httpsURL(post.cover_image);
    if(image&&/\.heic(?:\?|$)/i.test(image))image='https://substackcdn.com/image/fetch/w_1000,c_limit,f_jpg,q_auto:good/'+encodeURIComponent(image);
    return[{id,title:String(post.title).trim(),image,url}];
  }).slice(0,20);
}
export function normalizeInstagram(posts){
  if(!Array.isArray(posts))throw Error('Unexpected Instagram response');
  const seen=new Set();
  return [...posts].sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp)).flatMap(post=>{
    const id=String(post.id||'');const image=httpsURL(post.media_type==='VIDEO'?post.thumbnail_url:post.media_url);
    const postUrl=instagramPostURL(post.permalink);
    if(!id||seen.has(id)||!image||!postUrl)return[];seen.add(id);
    const caption=String(post.caption||'');return[{id,title:caption.split('\n').find(line=>line.trim())?.slice(0,160)||'A view from Instagram',caption,image,url:postUrl,postUrl,publishedAt:post.timestamp}];
  }).slice(0,50);
}
async function getJSON(url,headers={}){
  const response=await fetch(url,{headers,signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error(`Source returned ${response.status}`);
  return response.json();
}
export async function getSubstack(){
  const items=normalizeSubstack(await getJSON(`${PUBLICATION}/api/v1/archive?sort=top&limit=20&offset=0`,{'User-Agent':'ViewMaster/1.0'}));
  if(items.length!==20)throw Error('Incomplete top-20 archive');
  return{status:'live',updatedAt:new Date().toISOString(),items};
}
export async function getInstagram(env=process.env){
  if(!env.INSTAGRAM_ACCESS_TOKEN||!/^\d+$/.test(env.INSTAGRAM_USER_ID||''))return{status:'needs-connection'};
  const root=`https://graph.instagram.com/${env.INSTAGRAM_USER_ID}/media`;
  const url=new URL(root);url.searchParams.set('fields','id,caption,media_type,media_url,thumbnail_url,permalink,timestamp');url.searchParams.set('limit','100');
  const headers={Authorization:`Bearer ${env.INSTAGRAM_ACCESS_TOKEN}`};
  let page=await getJSON(url,headers),posts=page.data||[];
  // Read only this account's media. Cursor pagination stays on the same endpoint.
  for(let n=0;n<2&&normalizeInstagram(posts).length<50&&page.paging?.cursors?.after;n++){
    url.searchParams.set('after',page.paging.cursors.after);page=await getJSON(url,headers);posts.push(...(page.data||[]));if(!page.data?.length)break;
  }
  const items=normalizeInstagram(posts);if(!items.length)throw Error('No Instagram photos returned');
  return{status:'live',updatedAt:new Date().toISOString(),items};
}
export async function getFeeds(){
  const results=await Promise.allSettled([getSubstack(),getInstagram()]);
  return Object.fromEntries(['substack','instagram'].map((key,i)=>[key,results[i].status==='fulfilled'?results[i].value:{status:'temporarily-unavailable'}]));
}
