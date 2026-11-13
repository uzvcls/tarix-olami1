const crypto=require('crypto'),{connectLambda,getStore}=require('@netlify/blobs'),STUDENTS=require('./students.json');
const SALT='4fd7f5395c6683588f5292ca115abf3e',HASH='c1302e477e1d6b54f5f1fa4564dbcea753615f0d819dc618911f25abf1d9c6aedc6048b4e22167d403b687f5f434c719ccf4af9fa6f9e7c1bf7750a460275902',SECRET=process.env.SESSION_SECRET||HASH;
const R=(c,o)=>({statusCode:c,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(o)});
const sha=s=>crypto.createHash('sha256').update(String(s)).digest(),eq=(a,b)=>crypto.timingSafeEqual(sha(a),sha(b));
const sign=p=>{const b=Buffer.from(JSON.stringify(p)).toString('base64url');return b+'.'+crypto.createHmac('sha256',SECRET).update(b).digest('base64url')};
const unsign=t=>{try{const[b,m]=String(t).split('.'),e=crypto.createHmac('sha256',SECRET).update(b).digest('base64url');if(!eq(m,e))return null;const p=JSON.parse(Buffer.from(b,'base64url'));return p.exp>Date.now()?p:null}catch(e){return null}};
const pbk=(p,s)=>crypto.pbkdf2Sync(p,s,150000,32,'sha256').toString('hex');
const gen=()=>{const al='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';let p='';for(let i=0;i<10;i++)p+=al[crypto.randomInt(al.length)];return p+'@'+crypto.randomInt(10,100)};
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return R(405,{});
 connectLambda(event);
 const st=getStore({name:'tarix',consistency:'strong'}),get=async k=>{try{return await st.get(k,{type:'json'})}catch(e){return null}},put=(k,v)=>st.setJSON(k,v);
 let b;try{b=JSON.parse(event.body||'{}')}catch(e){return R(400,{})}
 const ip=(event.headers&&(event.headers['x-nf-client-connection-ip']||event.headers['client-ip']))||'?';
 const log=async(ev,name,role)=>{console.log(JSON.stringify({ev,name,role,ip}));try{const k='logs/'+new Date().toISOString().slice(0,10),l=(await get(k))||[];l.push({ev,name,role,ts:Date.now(),ip});await put(k,l.slice(-2000))}catch(e){}};
 const getAll=async()=>STUDENTS.concat((await get('students'))||[]),mustChg=async l=>{const p=await get('pw/'+l);return !p||!!p.must};
 const tg=async text=>{if(process.env.TG_TOKEN&&process.env.TG_CHAT)try{await fetch('https://api.telegram.org/bot'+process.env.TG_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:process.env.TG_CHAT,text})})}catch(e){}};
 const allAtt=async()=>{const{blobs}=await st.list({prefix:'att/'});return(await Promise.all(blobs.map(x=>get(x.key)))).filter(Boolean)};
 try{
 if(b.a==='login'){
  const normLogin=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[ʻʼ‘’`]/g,"'").replace(/\s+/g,' ').trim();
  const lg=normLogin(b.login).slice(0,80),pw=String(b.password||'').slice(0,200),fk='fail/'+lg.replace(/[^a-z0-9.]/g,'_');
  const f=(await get(fk))||{c:0};
  if(f.until>Date.now())return R(429,{error:`Ko‘p marta xato kiritildi. ${Math.ceil((f.until-Date.now())/6e4)} daqiqadan keyin urinib ko‘ring.`});
  let ok=false,u=null,role='student';
  if(lg==="jo'rayev murodillo"){role='teacher';const env=process.env.TEACHER_PASSWORD;ok=env?eq(env,pw):crypto.timingSafeEqual(crypto.scryptSync(pw,Buffer.from(SALT,'hex'),64),Buffer.from(HASH,'hex'))}
  else{u=(await getAll()).find(s=>s.login===lg);if(u){const o=await get('pw/'+lg);ok=o?eq(pbk(pw,o.salt),o.hash):eq(pbk(pw,u.salt),u.hash)}}
  const name=role==='teacher'?'Jo‘rayev Murodillo':u&&u.name;
  if(!ok){f.c++;if(f.c>=5){f.until=Date.now()+3e5;f.c=0;await tg('⚠️ Ko‘p marta xato parol kiritildi: '+(name||lg))}await put(fk,f);await log('xato parol',name||'Noma’lum: '+lg.slice(0,40),role);await new Promise(r=>setTimeout(r,800));return R(401,{error:'Login yoki parol noto‘g‘ri.'})}
  await put(fk,{c:0});
  const must=role==='student'&&await mustChg(lg);
  await log('kirdi',name,role);
  return R(200,{token:sign({role,login:lg,name,cls:u&&u.cls,exp:Date.now()+(role==='teacher'?2:5)*36e5}),role,name,cls:u&&u.cls,must});
 }
 const P=unsign(b.token);if(!P)return R(401,{error:'Sessiya tugagan'});
 if(P.role==='parent'){if(b.a!=='pview')return R(403,{});return R(200,{name:P.name,cls:P.cls,items:(await allAtt()).filter(a=>a.login===P.login&&a.submitted).map(a=>({topic:a.topic,score:a.score,total:a.total,ts:a.submitted,comment:a.comment})).sort((x,y)=>y.ts-x.ts)})}
 const T=P.role==='teacher';
 if(b.a==='me')return R(200,{role:P.role,name:P.name,cls:P.cls,must:!T&&await mustChg(P.login)});
 if(b.a==='logout'){await log(b.auto?'avto chiqdi':'chiqdi',P.name,P.role);return R(200,{ok:1})}
 if(!T){
  if(b.a==='chpw'){const p=String(b.newpw||'');if(p.length<8||!/\d/.test(p)||!/[A-Za-z]/.test(p))return R(400,{error:'Parol kamida 8 belgi, harf va raqamdan iborat bo‘lsin.'});const salt=crypto.randomBytes(16).toString('hex');await put('pw/'+P.login,{salt,hash:pbk(p,salt)});await log('parol almashtirdi',P.name,P.role);return R(200,{ok:1})}
  const C=(await get('content'))||{topics:[],banks:{}};
  if(b.a==='topics'){const out=[];for(const t of C.topics.filter(t=>t.cls===P.cls&&!t.draft)){const n=(C.banks[t.id]||[]).length;if(!n)continue;const a=await get(`att/${P.login}/${t.id}`);out.push({id:t.id,name:t.name,n:t.pick>0?Math.min(t.pick,n):n,min:t.min||0,show:!!t.show,open:t.open||0,close:t.close||0,practice:!!t.practice,comment:a&&a.comment,state:a?(a.submitted?'done':'started'):'new',score:a&&a.score,total:a&&a.total})}const an=await get('ann/'+P.cls);return R(200,{topics:out,grades:C.grades,ann:an&&an.text})}
  if(b.a==='start'){
   const t=C.topics.find(x=>x.id===b.id),bank=C.banks[b.id];if(!t||t.draft||t.cls!==P.cls||!bank||!bank.length)return R(404,{error:'Mavzu topilmadi.'});
   if(t.open&&Date.now()<t.open)return R(403,{error:'Bu test hali ochilmagan.'});if(t.close&&Date.now()>t.close)return R(403,{error:'Bu testning vaqti tugagan.'});
   const k=`att/${P.login}/${t.id}`;if(await get(k))return R(409,{error:'Bu testni siz allaqachon boshlagansiz. Qayta topshirib bo‘lmaydi.'});
   const qs=shuf(bank).slice(0,t.pick>0?t.pick:undefined).map(x=>{const o=shuf(x.o.map((t,i)=>({t,c:i===x.c})));return{q:x.q,o:o.map(z=>z.t),c:o.findIndex(z=>z.c),img:x.img}});
   await put(k,{name:P.name,cls:P.cls,login:P.login,topic:t.name,started:Date.now(),qs});await log('test boshladi: '+t.name,P.name,P.role);
   return R(200,{qs:qs.map(x=>({q:x.q,o:x.o,img:x.img})),min:t.min||0});
  }
  if(b.a==='submit'){
   const t=C.topics.find(x=>x.id===b.id),k=`att/${P.login}/${b.id}`,a=await get(k);if(!a)return R(404,{error:'Test boshlanmagan.'});if(a.submitted)return R(409,{error:'Test allaqachon topshirilgan.'});
   const ans=Array.isArray(b.answers)?b.answers:[];let score=0;
   const det=a.qs.map((q,i)=>{const x=Number.isInteger(ans[i])?ans[i]:null,ok=x===q.c;if(ok)score++;return{q:q.q,ans:x==null?null:q.o[x],cor:q.o[q.c],ok}});
   Object.assign(a,{submitted:Date.now(),score,total:a.qs.length,det,tabs:Math.min(999,+b.tabs||0),late:!!(t&&t.min&&Date.now()>a.started+(t.min*60+90)*1e3)});delete a.qs;await put(k,a);
   await log(`test topshirdi: ${a.topic} (${score}/${a.total})`,P.name,P.role);
   if(process.env.TG_TOKEN&&process.env.TG_CHAT)try{await fetch('https://api.telegram.org/bot'+process.env.TG_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:process.env.TG_CHAT,text:`${P.name} (${P.cls}) — ${a.topic}: ${score}/${a.total}`})})}catch(e){}
   return R(200,{score,total:a.total,review:t&&t.show?det:null});
  }
  if(b.a==='review'){const t=C.topics.find(x=>x.id===b.id),a=await get(`att/${P.login}/${b.id}`);if(!a||!a.submitted||!t||!t.show)return R(403,{error:'Ko‘rish mumkin emas.'});return R(200,{review:a.det})}
  if(b.a==='pstart'||b.a==='psubmit'){const t=C.topics.find(x=>x.id===b.id),bank=C.banks[b.id];if(!t||t.cls!==P.cls||!t.practice||!bank||!bank.length)return R(403,{error:'Mashq rejimi yoqilmagan.'});
   if(b.a==='pstart')return R(200,{qs:shuf(bank.map((x,i)=>({x,i}))).slice(0,t.pick>0?t.pick:undefined).map(({x,i})=>{const p=shuf(x.o.map((v,k)=>({v,k})));return{b:i,q:x.q,img:x.img,o:p.map(z=>z.v),p:p.map(z=>z.k)}})});
   const it=(Array.isArray(b.items)?b.items:[]).slice(0,300).filter(z=>bank[z.b]);let score=0;const review=it.map(z=>{const q=bank[z.b],ok=z.x===q.c;if(ok)score++;return{q:q.q,ans:Number.isInteger(z.x)?(q.o[z.x]??null):null,cor:q.o[q.c],ok}});return R(200,{score,total:review.length,review})}
  if(b.a==='rank'){const m={};(await allAtt()).filter(a=>a.submitted&&a.cls===P.cls).forEach(a=>{const x=m[a.login]=m[a.login]||{name:a.name,s:0,n:0};x.s+=a.score/a.total*100;x.n++});return R(200,{rank:Object.values(m).map(x=>({name:x.name,pct:Math.round(x.s/x.n),n:x.n})).sort((p,q)=>q.pct-p.pct)})}
  return R(400,{});
 }
 if(b.a==='content')return R(200,{content:await get('content')});
 if(b.a==='save'){const c=b.content;if(!c||!Array.isArray(c.topics)||typeof c.banks!=='object')return R(400,{error:'Noto‘g‘ri ma’lumot'});await put('content',c);return R(200,{ok:1})}
 if(b.a==='results')return R(200,{students:(await getAll()).map(({login,name,cls,added})=>({login,name,cls,added})),att:await allAtt()});
 if(b.a==='reset'){await st.delete(`att/${String(b.login).replace(/[^a-z0-9.]/g,'')}/${String(b.id).replace(/[^\w-]/g,'')}`);await log('qayta ruxsat: '+b.login,P.name,P.role);return R(200,{ok:1})}
 const mkS=(name,cls,all,add)=>{const base=name.toLowerCase().replace(/[‘’'`]/g,'').replace(/\s+/g,'.').replace(/[^a-z0-9.]/g,'')||'oquvchi';let login=base,n=1;while(all.some(x=>x.login===login))login=base+(++n);const password=gen(),salt=crypto.randomBytes(16).toString('hex'),o={login,name,cls,salt,hash:pbk(password,salt),added:true};add.push(o);all.push(o);return{name,cls,login,password}};
 if(b.a==='addmany'){const cls=String(b.cls||''),names=(Array.isArray(b.names)?b.names:[]).map(x=>String(x).trim().replace(/\s+/g,' ').slice(0,80)).filter(x=>x.split(' ').length>=2).slice(0,60);if(!cls||!names.length)return R(400,{error:'Sinf va “Familiya Ism” ro‘yxatini kiriting.'});const all=await getAll(),add=(await get('students'))||[],list=names.map(n=>mkS(n,cls,all,add));await put('students',add);await log(`${list.length} ta o‘quvchi qo‘shdi (${cls})`,P.name,P.role);return R(200,{list})}
 if(b.a==='resetmany'){const cls=String(b.cls||''),list=[];for(const x of (await getAll()).filter(x=>x.cls===cls)){const password=gen(),salt=crypto.randomBytes(16).toString('hex');await put('pw/'+x.login,{salt,hash:pbk(password,salt),must:true});list.push({name:x.name,cls,login:x.login,password})}await log(`${cls} sinfi parollari tiklandi`,P.name,P.role);return R(200,{list})}
 if(b.a==='plink'){const x=(await getAll()).find(y=>y.login===b.login);if(!x)return R(404,{error:'Topilmadi'});return R(200,{token:sign({role:'parent',login:x.login,name:x.name,cls:x.cls,exp:Date.now()+365*864e5})})}
 if(b.a==='addstudent'){const name=String(b.name||'').trim().replace(/\s+/g,' ').slice(0,80),cls=String(b.cls||'');if(name.split(' ').length<2||!cls)return R(400,{error:'Familiya, ism va sinfni kiriting.'});const all=await getAll();let base=name.toLowerCase().replace(/[‘’'`]/g,'').replace(/\s+/g,'.').replace(/[^a-z0-9.]/g,'')||'oquvchi',login=base,n=1;while(all.some(x=>x.login===login))login=base+(++n);const password=gen(),salt=crypto.randomBytes(16).toString('hex'),add=(await get('students'))||[];add.push({login,name,cls,salt,hash:pbk(password,salt),added:true});await put('students',add);await log('o‘quvchi qo‘shdi: '+name,P.name,P.role);return R(200,{login,password})}
 if(b.a==='resetpw'){const l=String(b.login||'');if(!(await getAll()).some(x=>x.login===l))return R(404,{error:'Topilmadi'});const password=gen(),salt=crypto.randomBytes(16).toString('hex');await put('pw/'+l,{salt,hash:pbk(password,salt),must:true});await put('fail/'+l.replace(/[^a-z0-9.]/g,'_'),{c:0});await log('parol tikladi: '+l,P.name,P.role);return R(200,{password})}
 if(b.a==='delstudent'){await put('students',((await get('students'))||[]).filter(x=>x.login!==b.login));return R(200,{ok:1})}
 if(b.a==='comment'){const k=`att/${String(b.login).replace(/[^a-z0-9.]/g,'')}/${String(b.id).replace(/[^\w-]/g,'')}`,a=await get(k);if(!a)return R(404,{error:'Topilmadi'});a.comment=String(b.text||'').slice(0,500);await put(k,a);return R(200,{ok:1})}
 if(b.a==='setann'){await put('ann/'+String(b.cls).replace(/[^\w-]/g,''),{text:String(b.text||'').slice(0,500)});return R(200,{ok:1})}
 if(b.a==='logs'){let out=[];for(let i=0;i<7;i++)out=out.concat((await get('logs/'+new Date(Date.now()-i*864e5).toISOString().slice(0,10)))||[]);return R(200,{logs:out.sort((x,y)=>y.ts-x.ts)})}
 return R(400,{});
 }catch(e){console.error(e);return R(500,{error:'Server xatosi'})}
};
