import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {getFeeds} from '../lib/feeds.mjs';
const root=path.resolve('public'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
let feeds=null,feedAt=0;
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/feed'){
      if(req.method!=='GET'){res.writeHead(405);return res.end();}
      if(!feeds||Date.now()-feedAt>3600000){feeds=await getFeeds();feedAt=Date.now();}
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(feeds));
    }
    const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!filename.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    const data=await fs.readFile(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
