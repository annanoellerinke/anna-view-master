import {reelSVG,frameIndices,mod,FRAME_COUNT} from './reel.js';
const $ = selector => document.querySelector(selector);
const homebody={key:'homebody',label:'HOMEBODY',subtitle:'STUDIO LOCATIONS',number:1,action:'Visit this studio',sceneLabels:['Austin','Montecito','Culver City','Newport Beach'],items:[]};
const substack={key:'substack',label:'LE INDEX',subtitle:'SUBSTACK · TOP 20',number:2,action:'Read on Substack',sceneLabels:['From Le Index','On building','On life','On writing'],items:[]};
const instagram={key:'instagram',label:'INSTAGRAM',subtitle:'LATEST 50',number:3,action:'View on Instagram',sceneLabels:['From the feed','Life & work','A little look'],items:[]};
const collections=[homebody,substack,instagram];
let active=substack, step=0, start=1, busy=false, interacted=false, queuedReel=null, queuedDirection=0;
const pendingFeeds={};
const positions={homebody:0,substack:1,instagram:0};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,reduced?0:ms));
const headline=text=>String(text||'A view from the reel').replace(/\\U[0-9a-fA-F]{8}/g,'').trim();
const safeURL=url=>{try{const u=new URL(url,location.origin);return ['https:','http:'].includes(u.protocol)?u.href:'#';}catch{return '#'}};

function selected(){return active.items[mod(start+step,active.items.length)];}
function updateSelection(announce=true){
  const item=selected(), index=mod(start+step,active.items.length);
  $('#counter').textContent=`${String(index+1).padStart(2,'0')} / ${String(active.items.length).padStart(2,'0')}`;
  $('#viewer-label').textContent=active.label;
  $('#viewer-frame').textContent=String(index+1).padStart(2,'0');
  $('#selected-title').textContent=headline(item.title);
  const image=$('#selected-image');
  $('#photo-link').classList.toggle('natural-size',active.key==='instagram'&&!!item.image);
  image.hidden=!item.image;
  $('#empty-photo').hidden=!!item.image;
  if(item.image){image.src=safeURL(item.image);image.alt=item.imageAlt||headline(item.title);image.classList.toggle('portrait',active.key==='instagram'||item.portrait===true);}
  else{$('#empty-location').textContent=item.title.replace('Homebody ','');}
  $('#photo-link').href=safeURL(item.url);
  $('#photo-link').setAttribute('aria-label',`${active.action}: ${headline(item.title)} (opens in a new tab)`);
  $('#destination').href=safeURL(item.url);
  $('#destination').replaceChildren(document.createTextNode(`${active.action} `),Object.assign(document.createElement('span'),{textContent:'↗'}));
  $('#destination').lastChild.setAttribute('aria-hidden','true');
  $('#collection-note').textContent=active.key==='instagram'&&active.status!=='live'?`Collection · ${new Date(active.updatedAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}`:'';
  $('#empty-photo small').textContent='Studio photographs coming soon';
  if(announce)$('#announcement').textContent=`${active.label}. Picture ${index+1} of ${active.items.length}. ${headline(item.title)}`;
  positions[active.key]=index;
  const next=active.items[mod(index+1,active.items.length)];if(next?.image){const preload=new Image();preload.src=next.image;}
}
function renderSpareReels(){
  const holder=$('#spare-reels');holder.replaceChildren();
  // The far reel is Instagram initially; the nearest is Homebody, matching the approved mockup.
  const spare=collections.filter(c=>c!==active).sort((a,b)=>b.number-a.number);
  for(const collection of spare){
    const button=document.createElement('button');button.className='spare';
    button.setAttribute('aria-label',`Load ${collection.label==='LE INDEX'?'Substack':collection.label} reel`);
    button.dataset.collection=collection.key;
    button.innerHTML=reelSVG(collection,`spare-${collection.key}`,positions[collection.key]);
    button.addEventListener('click',()=>loadReel(collection.key));holder.append(button);
  }
}
function mountReel(){
  $('#loaded-reel').innerHTML=reelSVG(active,'active',start,true);
  renderSpareReels();updateSelection(false);
}
async function advance(direction=1){
  if(!active.items.length)return;
  if(busy){queuedDirection=direction;return;}
  interacted=true;
  busy=true;$('#advance').setAttribute('aria-disabled','true');
  step+=direction;
  // Only the slot on the hidden, lower part of the disc is reassigned as the collection loops.
  const indices=frameIndices(step,start,active.items.length);
  document.querySelectorAll('#loaded-reel [data-slot]').forEach((node,i)=>node.setAttribute('href',active.items[indices[i]].image||'/assets/unexposed.svg'));
  $('#loaded-reel .rotor').style.transform=`rotate(${-step*360/FRAME_COUNT}deg)`;
  $('.viewer').classList.add('advancing');$('.selected-view').classList.add('changing');
  await sleep(160);updateSelection();$('.selected-view').classList.remove('changing');
  await sleep(380);$('.viewer').classList.remove('advancing');busy=false;$('#advance').removeAttribute('aria-disabled');drainQueue();
}
function drainQueue(){if(queuedReel){const key=queuedReel;queuedReel=null;queuedDirection=0;loadReel(key);}else if(queuedDirection){const direction=queuedDirection;queuedDirection=0;advance(direction);}}
async function loadReel(key){
  const target=collections.find(c=>c.key===key);if(target===active||!target?.items.length)return;
  if(busy){queuedReel=key;return;}
  interacted=true;
  if(pendingFeeds[key]){Object.assign(target,pendingFeeds[key]);delete pendingFeeds[key];positions[key]=Math.min(positions[key],target.items.length-1);}
  busy=true;$('.viewer').classList.add('swapping');$('.selected-view').classList.add('changing');
  await sleep(280);active=target;step=0;start=positions[key];mountReel();
  $('.viewer').classList.remove('swapping');$('.selected-view').classList.remove('changing');
  updateSelection();await sleep(300);busy=false;$('#advance').focus({preventScroll:true});drainQueue();
}
$('#advance').addEventListener('click',()=>advance());$('#next').addEventListener('click',()=>advance());$('#previous').addEventListener('click',()=>advance(-1));
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}
});
$('#selected-image').addEventListener('error',()=>{
  // Keep the selected link usable even if a remote image has expired.
  $('#selected-image').hidden=true;$('#empty-photo').hidden=false;$('#empty-location').textContent=headline(selected().title);$('#empty-photo small').textContent='Open the original to see this picture';
});
let pointerStart=null;
$('.viewer').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')pointerStart={x:e.clientX,y:e.clientY};});
$('.viewer').addEventListener('pointerup',e=>{if(!pointerStart)return;const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)advance(dx<0?1:-1);});
async function init(){
  const data=await Promise.all(collections.map(c=>fetch(`/data/${c.key}.json`).then(r=>{if(!r.ok)throw Error('Collection unavailable');return r.json()})));
  collections.forEach((c,i)=>Object.assign(c,{items:data[i].items,status:data[i].status,updatedAt:data[i].updatedAt}));
  const params=new URLSearchParams(location.search);const requested=collections.find(c=>c.key===params.get('reel'));if(requested){active=requested;start=positions[active.key]||0;}
  mountReel();
  // Refresh public metadata automatically; never interrupt a reel already being explored.
  fetch('/api/feed').then(r=>r.ok?r.json():null).then(fresh=>{
    if(!fresh)return;
    for(const key of ['substack','instagram']){const update=fresh[key],c=collections.find(c=>c.key===key);if(!update?.items?.length)continue;
      for(const item of update.items){const existing=c.items.find(p=>p.id===item.id);if(existing?.image?.startsWith('/assets/'))item.image=existing.image;}
      if(c===active&&!interacted&&!busy){const id=selected().id;Object.assign(c,update);start=Math.max(0,c.items.findIndex(p=>p.id===id));step=0;mountReel();}
      else if(c!==active&&!busy){Object.assign(c,update);positions[key]=Math.min(positions[key],c.items.length-1);renderSpareReels();}
      else pendingFeeds[key]=update;
    }
  }).catch(()=>{});
}
init().catch(()=>{$('#selected-title').textContent='The reels are taking a moment to load.';$('#collection-note').textContent='Please refresh to try again.';});
