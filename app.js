"use strict";
const $ = (s) => document.querySelector(s);
const categories = [{name:"全部游戏",icon:"✦"},{name:"动作冒险",icon:"⚔"},{name:"休闲益智",icon:"◈"},{name:"音乐节奏",icon:"♫"},{name:"策略对战",icon:"⚑"},{name:"模拟经营",icon:"⌂"},{name:"反应挑战",icon:"ϟ"}];
const storage = {get(key){try{const v=JSON.parse(localStorage.getItem("shiqu-"+key)||"[]");return Array.isArray(v)?v.filter(x=>typeof x==="string"):[];}catch{return [];}},set(key,value){try{localStorage.setItem("shiqu-"+key,JSON.stringify(value));}catch{}}};
let games=[],favorites=new Set(storage.get("favorites")),recent=storage.get("recent"),view="all",category="全部游戏",selected=null;
const recommended=["blindrain-play","slime-play","beatclimb-play","crayonrub-play","dinodentist-play","bigfish-play","droneshow-play","mutong-play"];
let toastTimer;
function toast(text){$("#toast").textContent=text;$("#toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("#toast").classList.remove("show"),2000);}
function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function toggleFavorite(id){if(favorites.has(id)){favorites.delete(id);toast("已取消收藏");}else{favorites.add(id);toast("已收藏，下次接着玩");}storage.set("favorites",[...favorites]);render();if(selected)updateDialogFavorite();}
function updateDialogFavorite(){const saved=favorites.has(selected.id);$("#dialog-favorite").textContent=saved?"♥ 已收藏":"♡ 收藏游戏";$("#dialog-favorite").setAttribute("aria-pressed",String(saved));}
function openGame(g){selected=g;$("#dialog-title").textContent=g.name;$("#dialog-icon").src=g.icon;$("#dialog-category").textContent=g.category+" · 网页小游戏";$("#dialog-description").textContent=g.description;$("#launch-game").href=g.url;$("#source-link").href="https://github.com/2324621372/"+encodeURIComponent(g.id);updateDialogFavorite();$("#game-dialog").showModal();}
function markPlayed(g){recent=[g.id,...recent.filter(id=>id!==g.id)].slice(0,30);storage.set("recent",recent);render();}
function createCard(g){const card=element("article","game-card");card.style.setProperty("--color",g.color);const open=element("button","card-open");open.type="button";open.setAttribute("aria-label","查看"+g.name+"，开始游戏");open.addEventListener("click",()=>openGame(g));const cover=element("div","cover");const image=element("img","cover-img");image.src=g.cover;image.alt=g.name+"游戏画面";image.loading="lazy";image.width=480;image.height=640;const fallback=element("img","cover-fallback");fallback.src=g.icon;fallback.alt=g.name+"主题图标";image.addEventListener("error",()=>{image.hidden=true;fallback.style.display="block";});cover.append(image,fallback);cover.append(element("span","card-badge",g.category),element("span","card-play","▶"));const body=element("div","card-content");const row=element("div","card-title-row");const icon=element("img","card-icon");icon.src=g.icon;icon.alt="";icon.loading="lazy";row.append(icon,element("h3","",g.name));const footer=element("div","card-footer");footer.append(element("span","",g.category),element("span","","打开即玩 ↗"));body.append(row,element("p","card-description",g.description),footer);open.append(cover,body);const saved=favorites.has(g.id);const fav=element("button","favorite-button"+(saved?" saved":""),saved?"♥":"♡");fav.type="button";fav.setAttribute("aria-label",(saved?"取消收藏":"收藏")+g.name);fav.setAttribute("aria-pressed",String(saved));fav.addEventListener("click",()=>toggleFavorite(g.id));card.append(open,fav);return card;}
function render(){const query=$("#search").value.trim().toLocaleLowerCase();let shown=games.filter(g=>(view!=="favorites"||favorites.has(g.id))&&(view!=="recent"||recent.includes(g.id))&&(category==="全部游戏"||g.category===category)&&(!query||[g.name,g.description,g.category,g.id].some(v=>v.toLocaleLowerCase().includes(query))));const sort=$("#sort").value;shown.sort((a,b)=>{if(sort==="newest")return b.updated.localeCompare(a.updated);if(sort==="name")return a.name.localeCompare(b.name,"zh-Hans-CN");if(view==="recent")return recent.indexOf(a.id)-recent.indexOf(b.id);const ai=recommended.indexOf(a.id),bi=recommended.indexOf(b.id);return (ai<0?999:ai)-(bi<0?999:bi)||b.updated.localeCompare(a.updated);});$("#game-grid").replaceChildren(...shown.map(createCard));$("#results").textContent=(view==="favorites"?"我的收藏":view==="recent"?"最近玩过":"全部灵感，随心挑选")+" · 共 "+shown.length+" 款游戏";$("#favorite-count").textContent=games.filter(g=>favorites.has(g.id)).length;$("#empty").hidden=shown.length>0;$("#empty h3").textContent=view==="favorites"&&!query&&category==="全部游戏"?"把喜欢的游戏留在这里":view==="recent"&&!query&&category==="全部游戏"?"你的冒险，从第一局开始":"还没有找到小游戏";$("#empty p").textContent=view==="favorites"?"点击游戏卡片上的爱心，即可加入收藏。":view==="recent"?"点击开始游戏后，足迹就会出现在这里。":"试试其他关键词，或换个分类逛逛。";$("#clear").hidden=!query&&category==="全部游戏"&&view==="all";document.querySelectorAll(".category").forEach(b=>{b.classList.toggle("active",b.dataset.category===category);b.setAttribute("aria-pressed",String(b.dataset.category===category));});document.querySelectorAll(".nav-item").forEach(b=>{b.classList.toggle("active",b.dataset.view===view);b.setAttribute("aria-pressed",String(b.dataset.view===view));});}
function reset(){view="all";category="全部游戏";$("#search").value="";render();}
for(const c of categories){const b=element("button","category",c.icon+" "+c.name);b.type="button";b.dataset.category=c.name;b.addEventListener("click",()=>{category=c.name;render();});$("#categories").append(b);}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;category="全部游戏";$("#search").value="";render();$("#library").scrollIntoView({behavior:"smooth"});}));
$("#search").addEventListener("input",render);$("#sort").addEventListener("change",render);$("#clear").addEventListener("click",reset);$("#reset").addEventListener("click",reset);$("#random").addEventListener("click",()=>{if(games.length)openGame(games[Math.floor(Math.random()*games.length)]);});$("#close-dialog").addEventListener("click",()=>$("#game-dialog").close());$("#game-dialog").addEventListener("click",e=>{if(e.target===$("#game-dialog")){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});$("#dialog-favorite").addEventListener("click",()=>toggleFavorite(selected.id));$("#launch-game").addEventListener("click",()=>markPlayed(selected));document.addEventListener("keydown",e=>{if(e.key==="/"&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$("#game-dialog").open){e.preventDefault();$("#search").focus();}});
const OWNER="2324621372";
const EXCLUDED_REPOS=new Set(["game-hub","game-hub-play",OWNER+".github.io"]);
const CACHE_KEY="shiqu-live-catalog-v1";
const CACHE_TTL=5*60*1000;
let metadata=new Map(),refreshing=false;
function validGames(data){
  if(!data||!Array.isArray(data.games))throw Error("游戏目录无效");
  const valid=data.games.filter(g=>g&&/^[a-zA-Z0-9_.-]+$/.test(g.id)&&/^https:\/\/2324621372\.github\.io\//.test(g.url)&&[g.name,g.description,g.category,g.updated,g.icon,g.cover].every(v=>typeof v==="string"));
  if(valid.length!==data.games.length)throw Error("游戏目录包含无效条目");
  return valid;
}
function applyCatalog(data){
  games=validGames(data);
  $("#total-count").textContent=games.length;
  $("#hero-count").textContent=games.length;
  $("#sync-date").textContent="游戏目录更新于 "+data.syncedAt;
  $("#load-error").hidden=true;
  render();
}
function status(text){$("#catalog-status").textContent=text;}
function readCache(){try{const cached=JSON.parse(localStorage.getItem(CACHE_KEY));if(cached&&Number.isFinite(cached.savedAt)&&cached.savedAt<=Date.now()){validGames(cached.catalog);return cached;}}catch{}return null;}
function saveCache(catalog){try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),catalog}));}catch{}}
async function requestJSON(url){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(url,{cache:"no-cache",signal:controller.signal});if(!response.ok){const error=Error("请求失败");error.status=response.status;throw error;}return await response.json();}finally{clearTimeout(timeout);}
}
function guessTheme(text){
  const rules=[[/节拍|节奏|音游|音乐/,"音乐节奏","🎵","#9e9bde"],[/农场|种田|种菜|菜园|收获|经营|电梯/,"模拟经营","🌱","#99bd7c"],[/恐龙|雷龙/,"休闲益智","🦖","#8bbb85"],[/飞艇|飞行|气球/,"反应挑战","🎈","#e8b47f"],[/丧尸|僵尸|尸潮|潜入|冒险/,"动作冒险","⚔️","#bb9bd1"],[/守卫|策略|炮台|指令|调度/,"策略对战","🛡️","#8cb5c9"],[/反应|时机|快门/,"反应挑战","⚡","#efb562"]];
  const match=rules.find(([pattern])=>pattern.test(text));return match?{category:match[1],emoji:match[2],color:match[3]}:{category:"休闲益智",emoji:"🎮",color:"#8bc8ac"};
}
function chineseName(repo){
  const description=(repo.description||"").trim();
  const candidate=description.split(/[：:，,。；;（(]|\s+(?:H5|单文件|在线|公开)/i)[0].replace(/\s*[··-]?\s*(?:H5|单文件发布).*$/i,"").trim();
  if(/[\u4e00-\u9fff]/.test(candidate))return candidate.slice(0,32);
  return "新游探索·"+String([...repo.name].reduce((total,ch)=>total+ch.charCodeAt(0),0));
}
function themeIcon(theme){
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" rx="30" fill="'+theme.color+'"/><circle cx="410" cy="50" r="160" fill="white" opacity=".15"/><circle cx="60" cy="350" r="150" fill="white" opacity=".12"/><text x="240" y="235" text-anchor="middle" font-size="155" font-family="Segoe UI Emoji,Apple Color Emoji,sans-serif">'+theme.emoji+'</text></svg>';
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}
function repoToGame(repo){
  const known=metadata.get(repo.name);
  const theme=guessTheme(repo.description||"");const icon=themeIcon(theme);
  return {...(known||{name:chineseName(repo),description:repo.description||"新发现的独立小游戏，打开即可游玩。",...theme,icon,cover:icon}),id:repo.name,url:"https://"+OWNER+".github.io/"+encodeURIComponent(repo.name)+"/",updated:repo.pushed_at||repo.updated_at||"1970-01-01T00:00:00Z"};
}
async function refreshGames(force=false){
  if(refreshing)return;
  const cached=readCache();
  if(!force&&cached&&Date.now()-cached.savedAt<CACHE_TTL){status("已加载最近同步的目录");return;}
  refreshing=true;$("#refresh-games").disabled=true;status("正在查找新游戏…");
  try{
    const repositories=new Map();
    // 逐页完整读取，超过 100 个仓库时同样会继续查找游戏。
    for(let page=1;page<=100;page++){
      const batch=await requestJSON("https://api.github.com/users/"+OWNER+"/repos?per_page=100&type=owner&sort=full_name&direction=asc&page="+page);
      if(!Array.isArray(batch))throw Error("仓库列表无效");
      for(const repo of batch){if(repo&&typeof repo.name==="string"&&/^[a-zA-Z0-9_.-]+$/.test(repo.name)&&!repo.private&&repo.has_pages===true&&/play/i.test(repo.name)&&!EXCLUDED_REPOS.has(repo.name.toLowerCase())&&repo.owner?.login?.toLowerCase()===OWNER){repositories.set(repo.name,repo);}}
      if(batch.length<100)break;
      if(page===100)throw Error("仓库列表未读取完整");
    }
    const catalog={owner:OWNER,syncedAt:new Date().toLocaleDateString("sv-SE",{timeZone:"Asia/Shanghai"}),games:[...repositories.values()].map(repoToGame)};
    const oldIds=new Set(games.map(g=>g.id));const added=catalog.games.filter(g=>!oldIds.has(g.id)).length;
    applyCatalog(catalog);saveCache(catalog);
    status("已同步 "+games.length+" 款"+(added?" · 新增 "+added+" 款":" · 暂无新游戏"));
    if(force)toast(added?"发现 "+added+" 款新游戏":"游戏列表已更新");
  }catch(error){
    status(error.status===403||error.status===429?"同步暂受限，稍后重试":"暂时无法同步，已保留现有游戏");
    if(!games.length){$("#load-error").hidden=false;$("#results").textContent="加载失败";}
  }finally{refreshing=false;$("#refresh-games").disabled=false;}
}
$("#refresh-games").addEventListener("click",()=>refreshGames(true));
async function initializeCatalog(){
  $("#refresh-games").disabled=true;status("正在检查游戏目录…");
  // 先展示内嵌目录或上次成功同步的目录，直接双击 HTML 也能显示游戏。
  try{const embedded=JSON.parse($("#game-catalog").textContent);applyCatalog(embedded);metadata=new Map(games.map(g=>[g.id,g]));}catch{}
  const cached=readCache();if(cached){try{applyCatalog(cached.catalog);}catch{}}
  if(location.protocol!=="file:"){
    try{
      const published=await requestJSON("games.json");
      const entries=validGames(published);for(const g of entries)metadata.set(g.id,g);
      if(!cached){applyCatalog(published);}else{applyCatalog({...cached.catalog,games:games.map(g=>({...g,...(metadata.get(g.id)||{}),updated:g.updated}))});}
    }catch{}
  }
  $("#refresh-games").disabled=false;
  await refreshGames();
}
initializeCatalog();
