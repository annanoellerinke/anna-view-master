// Use a direct post address instead of profile-prefixed or Reels routes.
// The shortcode identifies the same media for photos, carousels, and reels.
export function instagramPostURL(value){
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(url.hostname)||url.port||url.username||url.password)return null;
    const match=url.pathname.match(/^\/(?:[A-Za-z0-9._]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/);
    return match?`https://www.instagram.com/p/${match[1]}/`:null;
  }catch{return null;}
}
