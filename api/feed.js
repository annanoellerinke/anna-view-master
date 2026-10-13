import {getFeeds} from '../lib/feeds.mjs';
export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const data=await getFeeds();
  const hasFresh=[data.substack,data.instagram].some(feed=>feed.status==='live');
  res.setHeader('Cache-Control',hasFresh?'public, s-maxage=3600, stale-while-revalidate=86400':'public, s-maxage=60');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(200).json(data);
}
