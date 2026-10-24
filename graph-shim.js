/* Microsoft sign-in + SharePoint storage. Provides the same window.claude.use(...) interface the app already calls. */
(function(){
const C = window.APT_CONFIG, SC = ["User.Read","User.ReadBasic.All","Sites.ReadWrite.All"], GR = "https://graph.microsoft.com/v1.0";
const ROOT = C.folder || "AptData", enc = a => a.map(encodeURIComponent).join("/");
const of = window.fetch.bind(window);
let app, acct, authP, driveId, meCache, me_;

function authOnce(){ return authP || (authP = (async()=>{
  app = new msal.PublicClientApplication({auth:{clientId:C.clientId, authority:"https://login.microsoftonline.com/"+C.tenantId, redirectUri:C.redirectUri||location.origin+"/"}, cache:{cacheLocation:"localStorage"}});
  const r = await app.handleRedirectPromise();
  acct = (r && r.account) || app.getAllAccounts()[0];
  if(!acct){ await app.loginRedirect({scopes:SC}); await new Promise(()=>{}); }
})()); }
async function tok(){
  try{ return (await app.acquireTokenSilent({scopes:SC, account:acct})).accessToken; }
  catch(e){ await app.acquireTokenRedirect({scopes:SC}); await new Promise(()=>{}); }
}
async function g(p, o={}, raw){
  const r = await of(p.startsWith("http") ? p : GR+p, {...o, headers:{Authorization:"Bearer "+await tok(), ...(o.headers||{})}});
  if(r.status===404) return null;
  if(!r.ok) throw Object.assign(new Error("Graph "+r.status), {code:r.status});
  return raw ? r : (r.status===204 ? {} : r.json());
}
async function drive(){
  if(driveId) return driveId;
  const s = await g(`/sites/${C.siteHost}:${C.sitePath}`); if(!s) throw new Error("SharePoint site not found");
  return driveId = (await g(`/sites/${s.id}/drive`)).id;
}

/* Collections are folders of .json files in the SharePoint document library. */
const colls = {};
function coll(name){
  const parts = [ROOT, ...name.split("/")], cache = {}, subs = new Set(); let loaded = false, timer;
  const snap = () => ({docs:Object.entries(cache).map(([id,v])=>({id, data:()=>v.data}))});
  const notify = () => subs.forEach(s=>s.cb(snap()));
  async function refresh(force){
    const d = await drive(); let url = `/drives/${d}/root:/${enc(parts)}:/children?$top=200`, files = [];
    while(url){ const r = await g(url); if(!r) break; files.push(...r.value.filter(f=>/\.json$/.test(f.name))); url = r["@odata.nextLink"]; }
    const ids = new Set(files.map(f=>f.name.slice(0,-5))); let changed = force || !loaded;
    for(const id in cache) if(!ids.has(id)){ delete cache[id]; changed = true; }
    const todo = files.filter(f=>!cache[f.name.slice(0,-5)] || cache[f.name.slice(0,-5)].etag !== f.eTag);
    for(let i=0;i<todo.length;i+=6) await Promise.all(todo.slice(i,i+6).map(async f=>{
      try{ cache[f.name.slice(0,-5)] = {etag:f.eTag, data:await (await of(f["@microsoft.graph.downloadUrl"])).json()}; changed = true; }catch(e){}
    }));
    loaded = true; if(changed) notify();
  }
  const c = {
    doc: id => {
      const path = () => drive().then(d=>`/drives/${d}/root:/${enc([...parts, id+".json"])}:`);
      return {
        async get(){ const r = await g(await path()+"/content", {}, true); if(!r) return {exists:false, id, data:()=>null}; const v = await r.json(); return {exists:true, id, data:()=>v}; },
        async set(v){ await g(await path()+"/content", {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(v)}); cache[id] = {etag:"", data:v}; if(loaded) notify(); },
        async update(p){ const s = await this.get(); await this.set({...(s.exists ? s.data() : {}), ...p}); },
        async delete(){ await g(await path(), {method:"DELETE"}); delete cache[id]; if(loaded) notify(); }
      };
    },
    onSnapshot(cb, err){
      const s = {cb, err}; subs.add(s);
      if(loaded) cb(snap()); else refresh(true).catch(e=>err&&err(e));
      if(!timer) timer = setInterval(()=>refresh().catch(()=>{}), 15000);
      return ()=>subs.delete(s);
    },
    orderBy: (f, dir) => ({limit: n => ({onSnapshot:(cb, err)=>c.onSnapshot(s=>cb({docs:[...s.docs].sort((a,b)=>(a.data()[f]>b.data()[f] ? 1 : -1)*(dir==="desc"?-1:1)).slice(0,n)}), err)})})
  };
  return c;
}
const db = {collection: n => colls[n] || (colls[n] = coll(n))};

/* People: signed-in user, profiles, and search for the "add user" box. */
const av = n => { const t = (n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase().replace(/[<&>]/g,""); return "data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b5a30"/><text x="32" y="41" font-family="Arial,sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="#fff">${t}</text></svg>`); };
const mapU = u => ({id:u.id, name:u.displayName, displayName:u.displayName, email:u.mail||u.userPrincipalName||"", avatarUrl:av(u.displayName), isMe:u.id===me_?.id, guest:false});
const userCap = {
  async me(){
    const u = await g("/me?$select=id,displayName,mail,userPrincipalName"), mine = [u.mail, u.userPrincipalName, u.id].filter(Boolean).map(x=>x.toLowerCase());
    return me_ = {...mapU(u), isOwner:(C.admins||[]).some(a=>mine.includes(String(a).trim().toLowerCase())), canEdit:false};
  },
  async profiles(ids){ const o = {}; await Promise.all(ids.map(async id=>{ try{ const u = await g(`/users/${id}?$select=id,displayName,mail,userPrincipalName`); if(u) o[id] = mapU(u); }catch(e){} })); return o; },
  async search(q){ q = q.replace(/'/g,"''"); const r = await g(`/users?$filter=startswith(displayName,'${q}') or startswith(mail,'${q}')&$top=10&$select=id,displayName,mail,userPrincipalName`); return (r?.value||[]).map(mapU); }
};

/* Uploaded files go to a "files" folder in the same library. */
const assets = {async upload(file){
  const d = await drive(), p = enc([ROOT, "files", crypto.randomUUID()+"-"+file.name.replace(/[\\/:*?"<>|#%]/g,"_")]); let it;
  if(file.size < 4e6) it = await g(`/drives/${d}/root:/${p}:/content`, {method:"PUT", headers:{"Content-Type":file.type||"application/octet-stream"}, body:file});
  else{ const s = await g(`/drives/${d}/root:/${p}:/createUploadSession`, {method:"POST", headers:{"Content-Type":"application/json"}, body:"{}"});
    it = await (await of(s.uploadUrl, {method:"PUT", headers:{"Content-Range":`bytes 0-${file.size-1}/${file.size}`}, body:file})).json(); }
  return {id:it.id, url:"gp:"+it.id, webUrl:it.webUrl};
}};
window.fetch = async (u, o) => String(u).startsWith("gp:") ? of((await g(`/drives/${await drive()}/items/${String(u).slice(3)}`))["@microsoft.graph.downloadUrl"]) : of(u, o);

const downloads = {async save({filename, data}){
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data])); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
}};

window.claude = {use: async n => {
  if(n==="downloads") return downloads;
  if(n==="sample") return {local:true};   // local document reader only, no AI
  if(n==="mcp") return null;
  await authOnce();
  return n==="db" ? db : n==="user" ? userCap : n==="assets" ? assets : null;
}};
})();
