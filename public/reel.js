export const FRAME_COUNT = 14;
export const mod = (value, total) => ((value % total) + total) % total;
export function frameIndices(step, start, count) {
  return Array.from({ length: FRAME_COUNT }, (_, slot) => {
    let distance = mod(slot - step, FRAME_COUNT);
    if (distance > 6) distance -= FRAME_COUNT;
    return mod(start + step + distance, count);
  });
}
const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function reelSVG(collection, prefix, start=0, active=false) {
  const frames=Array.from({length:FRAME_COUNT},(_,i)=>{
    const item=collection.items[mod(start+i,collection.items.length)];
    return `<g transform="rotate(${i*360/FRAME_COUNT} 250 250)"><clipPath id="${prefix}-frame-${i}"><rect x="217" y="38" width="66" height="83" rx="8"/></clipPath><rect x="216" y="37" width="68" height="85" rx="8" fill="#686b61"/><image data-slot="${i}" href="${esc(item.image||'/assets/unexposed.svg')}" x="217" y="38" width="66" height="83" preserveAspectRatio="xMidYMid slice" clip-path="url(#${prefix}-frame-${i})"/><rect x="217" y="38" width="66" height="83" rx="8" fill="#483908" opacity=".1"/><rect x="244" y="9" width="12" height="26" fill="white"/></g>`;
  }).join('');
  const captions=Array.from({length:7},(_,i)=>{
    const text=collection.sceneLabels[i%collection.sceneLabels.length];
    return `<g transform="rotate(${i*360/7} 250 250)"><text x="250" y="144" text-anchor="middle" font-size="16" font-weight="800">${i+1}</text><text x="250" y="161" text-anchor="middle" font-size="10">${esc(text)}</text></g>`;
  }).join('');
  const yy=active?156:218;
  return `<svg class="reel-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${prefix}-paper"><stop stop-color="#c5c6c0"/><stop offset="1" stop-color="#b6b8b2"/></radialGradient><filter id="${prefix}-grain"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" seed="8"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".11"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter><mask id="${prefix}-holes"><circle cx="250" cy="250" r="245" fill="white"/><circle cx="250" cy="250" r="14" fill="black"/>${Array.from({length:7},(_,i)=>`<g transform="rotate(${i*360/7} 250 250)"><path d="M241 3 L245 10 L254 10 L259 3 Z" fill="black"/><rect x="244" y="13" width="12" height="23" fill="black"/></g>`).join('')}</mask></defs><g class="rotor"><g mask="url(#${prefix}-holes)"><circle cx="250" cy="250" r="245" fill="url(#${prefix}-paper)" stroke="#969990" stroke-width="1" filter="url(#${prefix}-grain)"/>${frames}<g font-family="'Arial Narrow',Impact,Arial,sans-serif" fill="#1c2119">${active?'':captions}<text x="250" y="${yy}" text-anchor="middle" font-size="22" font-weight="800" letter-spacing=".6">${esc(collection.label)}</text><text x="250" y="${yy+21}" text-anchor="middle" font-size="14" font-weight="700">${esc(collection.subtitle)}</text>${active?'':`<text x="250" y="284" text-anchor="middle" font-size="11" font-weight="700">ANNA NOELLE RINKE</text><text x="250" y="302" text-anchor="middle" font-size="10">VIEW-MASTER · Reel ${collection.number}</text><g transform="translate(0 0)"><path d="M245 185 V173 H239 L250 156 L261 173 H255 V185 Z" fill="#1c2119"/><text x="250" y="196" text-anchor="middle" font-size="10" font-weight="800">UP FOR VIEWER</text></g>`}</g></g></g></svg>`;
}
