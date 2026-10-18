// Holidate — demo mode (localStorage) until Firebase config is filled in.
const KEY='holidate_v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const today=new Date(); today.setHours(0,0,0,0);
const iso=d=>{const x=new Date(d);return x.toISOString().slice(0,10)};
const addD=(base,n)=>{const x=new Date(base);x.setDate(x.getDate()+n);return iso(x)};
const fmt=s=>new Date(s+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
const fmtR=(a,b)=>fmt(a)+' – '+fmt(b);
let view='home';

function seed(){
  const people=[
    {id:'p1',code:'Golden Hour',name:'Cloudette (You)',emoji:'🌅',tags:['beach luxe','spa','good food'],past:'Sample: Lisbon ’22 · Banff ’23',style:'Relaxed pace, golden-hour dinners'},
    {id:'p2',code:'Coral Queen',name:'Sasha (Sample)',emoji:'🪸',tags:['adventure','nightlife','snorkel'],past:'Sample: Lisbon ’22',style:'Up early, plans the excursions'},
    {id:'p3',code:'Palm Reader',name:'Indigo (Sample)',emoji:'🔮',tags:['witchy','markets','photography'],past:'Sample: Kyoto ’21 · Marrakech ’24',style:'Finds the hidden-gem spots'},
    {id:'p4',code:'Low Tide',name:'Rowan (Sample)',emoji:'🐾',tags:['chill','budget-smart','road trips'],past:'Sample: Lake Placid ’23',style:'Easygoing, naps are an activity'}
  ];
  return {
    me:'p1',
    trip:{name:'Winter Sun Escape',type:'Couple',code:'SUN-'+Math.floor(1000+Math.random()*9000),memberIds:['p1','p2'],owner:'p1'},
    people,
    busy:{
      p1:[{id:uid(),start:addD(today,12),end:addD(today,15),label:'Work deadline'},{id:uid(),start:addD(today,28),end:addD(today,31),label:'Family thing'}],
      p2:[{id:uid(),start:addD(today,18),end:addD(today,20),label:'Conference'},{id:uid(),start:addD(today,36),end:addD(today,38),label:'Dentist + travel'}],
      p3:[],p4:[]
    },
    paste:{},
    items:[
      {id:'i1',kind:'Destination',name:'Aruba',place:'Southern Caribbean',budget:1100,vibes:['beach','snorkel','seafood'],by:'p1',votes:{p1:1,p2:1},comments:[{by:'p2',text:'@Golden Hour the snorkel day sold me 🌊',at:'Just now'}],reactions:{'❤️':2,'🌴':1}},
      {id:'i2',kind:'Destination',name:'Maui, Hawaii',place:'Hawaii',budget:1800,vibes:['sunset','snorkel','luxe'],by:'p2',votes:{p1:1,p2:0},comments:[],reactions:{'🔥':1}},
      {id:'i3',kind:'Hotel / Airbnb',name:'Beach casita with plunge pool',place:'Aruba',budget:220,vibes:['private','romantic'],by:'p2',votes:{p1:1,p2:1},comments:[],reactions:{'❤️':1}},
      {id:'i4',kind:'Restaurant',name:'Sunset raw bar on the sand',place:'Aruba',budget:90,vibes:['golden hour','seafood'],by:'p1',votes:{p1:1,p2:1},comments:[],reactions:{}},
      {id:'i5',kind:'Activity / add-in',name:'Private reef snorkel morning',place:'Aruba',budget:140,vibes:['adventure','early'],by:'p2',votes:{p1:0,p2:1},comments:[],reactions:{}},
      {id:'i6',kind:'Destination',name:'Key West, Florida',place:'Florida Keys',budget:800,vibes:['road trip','sunsets','key lime'],by:'p1',votes:{p1:0,p2:-1},comments:[],reactions:{}}
    ],
    prefs:{
      p1:{room:'Shared room',split:'50/50',flight:'Morning',seat:'Window',pace:'Relaxed',nightlife:'Golden-hour drinks',food:'Foodie — book the good places',addins:['Spa','Excursions','Rental car']},
      p2:{room:'Shared room',split:'Take turns',flight:'Morning',seat:'Aisle',pace:'Mix of both',nightlife:'One big night out',food:'Foodie — book the good places',addins:['Excursions','Rental car']},
      p3:{room:'Same room, separate beds',split:'50/50',flight:'No red-eyes',seat:'Window',pace:'Mix of both',nightlife:'Golden-hour drinks',food:'Casual & local',addins:['Spa','Pet care']},
      p4:{room:'Separate rooms',split:'One person covers, settle later',flight:'Cheapest, any time',seat:'Aisle',pace:'Relaxed',nightlife:'Early nights',food:'Casual & local',addins:['Pet care','Childcare']}
    },
    finders:[{id:uid(),origin:'Denver (DEN)',dest:'Anywhere warm',max:1200,window:'Next 3 months',days:5}],
    deals:[],
    proposals:[],
    itinerary:[{id:uid(),title:'Sample: Aruba golden-hour week',detail:'Accept a proposal and it becomes an itinerary stub here — flights, stays and add-ins to fill in together.'}],
    moments:[{id:uid(),emoji:'🌅',label:'Golden-hour toast (sample)'},{id:uid(),emoji:'🌊',label:'First swim (sample)'},{id:uid(),emoji:'🍹',label:'Best beach bar (sample)'}],
    feed:[
      {id:uid(),text:'Coral Queen voted 👍 on Aruba',at:'2h ago'},
      {id:uid(),text:'Golden Hour added Sunset raw bar on the sand',at:'3h ago'},
      {id:uid(),text:'Coral Queen commented on Aruba',at:'3h ago'},
      {id:uid(),text:'Golden Hour created Winter Sun Escape · invite-only',at:'Yesterday'}
    ]
  };
}
function load(){try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.trip)return r}catch(e){} return seed()}
let S=load();
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function person(id){return S.people.find(p=>p.id===id)||S.people[0]}
function members(){return S.trip.memberIds.map(person)}
function me(){return person(S.me)}
function toast(m){const t=$('#toast');t.textContent=m;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,2600)}
function log(text){S.feed.unshift({id:uid(),text,at:'Just now'});S.feed=S.feed.slice(0,30)}
function isBusy(pid,date){return (S.busy[pid]||[]).some(b=>date>=b.start&&date<=b.end)}
function allFree(date){return members().every(p=>!isBusy(p.id,date))}
function mention(text){return esc(text).replace(/@([\w ’']+)/g,'<span class="mention">@$1</span>')}
function thumbIcon(v){return v===1?'👍':v===-1?'👎':'👉'}
function thumbCls(v){return v===1?'up':v===-1?'down':'side'}

// ---------- actions (global for inline handlers) ----------
window.setView=v=>{view=v;render()};
window.setMe=id=>{S.me=id;save();toast('Now acting as '+person(id).code+' (demo: both sides in this browser)');render()};
window.toggleMember=id=>{const i=S.trip.memberIds.indexOf(id);if(i>=0){if(S.trip.memberIds.length<=2)return toast('A trip needs at least 2 people');S.trip.memberIds.splice(i,1)}else S.trip.memberIds.push(id);log(me().code+(i>=0?' removed ':' added ')+person(id).code+' '+(i>=0?'from':'to')+' the trip');save();render()};
window.cycleVote=(itemId)=>{const it=S.items.find(x=>x.id===itemId);const cur=it.votes[S.me]??0;it.votes[S.me]=cur===1?0:cur===0?-1:1;log(me().code+' voted '+thumbIcon(it.votes[S.me])+' on '+it.name);save();render()};
window.react=(kind,id,emoji)=>{const obj=kind==='item'?S.items.find(x=>x.id===id):S.proposals.find(x=>x.id===id);obj.reactions=obj.reactions||{};obj.reactions[emoji]=(obj.reactions[emoji]||0)+1;log(me().code+' reacted '+emoji+' to '+(obj.name||obj.title));save();render()};
window.addComment=(kind,id)=>{const inp=document.getElementById('c-'+kind+'-'+id);const text=inp.value.trim();if(!text)return;const obj=kind==='item'?S.items.find(x=>x.id===id):S.proposals.find(x=>x.id===id);obj.comments=obj.comments||[];obj.comments.push({by:S.me,text,at:'Just now'});log(me().code+' commented on '+(obj.name||obj.title));save();render()};
window.addBusy=()=>{const s=$('#busyStart').value,e=$('#busyEnd').value,l=$('#busyLabel').value.trim()||'Busy';if(!s||!e)return toast('Pick start and end dates');S.busy[S.me]=S.busy[S.me]||[];S.busy[S.me].push({id:uid(),start:s,end:e,label:l});log(me().code+' added a busy block: '+l);save();render()};
window.delBusy=id=>{S.busy[S.me]=(S.busy[S.me]||[]).filter(b=>b.id!==id);save();render()};
window.pasteAvail=()=>{const t=$('#pasteBox').value;const dates=[...t.matchAll(/20\d\d-\d\d-\d\d/g)].map(m=>m[0]);if(!dates.length)return toast('No YYYY-MM-DD dates found in that paste');dates.forEach(d=>{S.busy[S.me]=S.busy[S.me]||[];S.busy[S.me].push({id:uid(),start:d,end:d,label:'Pasted busy day'})});log(me().code+' pasted '+dates.length+' busy day(s)');save();render()};
window.handleICS=ev=>{const f=ev.target.files[0];if(!f)return;f.text().then(txt=>{
  const unfolded=txt.replace(/\r?\n[ \t]/g,'');
  const events=[...unfolded.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)];
  let n=0;
  events.forEach(m=>{const b=m[1];const sum=(b.match(/SUMMARY:(.*)/)||[])[1]||'Calendar event';
    const raw=(b.match(/DTSTART[^:\r\n]*:([0-9TZ]+)/)||[])[1];const rawE=(b.match(/DTEND[^:\r\n]*:([0-9TZ]+)/)||[])[1];
    const conv=v=>v? v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8):null;
    const st=conv(raw);if(!st)return;let en=conv(rawE)||st;
    // DTEND for all-day events is exclusive
    if(raw && raw.length===8 && rawE && rawE.length===8) en=addD(new Date(en+'T12:00:00'),-1);
    S.busy[S.me]=S.busy[S.me]||[];S.busy[S.me].push({id:uid(),start:st,end:en,label:sum.trim()});n++;});
  log(me().code+' uploaded a calendar (.ics) — '+n+' busy event(s)');save();toast('Imported '+n+' busy event(s) from '+f.name);render();});};
window.addItem=()=>{const name=$('#itName').value.trim();if(!name)return toast('Give it a name');const it={id:uid(),kind:$('#itKind').value,name,place:$('#itPlace').value.trim(),budget:+$('#itBudget').value||0,vibes:$('#itVibes').value.split(',').map(x=>x.trim()).filter(Boolean),by:S.me,votes:{[S.me]:1},comments:[],reactions:{}};S.items.unshift(it);log(me().code+' added '+it.name);save();render()};
window.setPref=(field,val)=>{S.prefs[S.me][field]=val;save();render()};
window.toggleAddin=a=>{const arr=S.prefs[S.me].addins;const i=arr.indexOf(a);if(i>=0)arr.splice(i,1);else arr.push(a);save();render()};
window.addFinder=()=>{S.finders.unshift({id:uid(),origin:$('#fOrigin').value.trim()||'Anywhere',dest:$('#fDest').value.trim()||'Anywhere warm',max:+$('#fMax').value||1000,window:$('#fWindow').value,days:+$('#fDays').value||5});log(me().code+' set a flight finder');save();render()};
window.findDeals=(quiet)=>{const pool=[['Tulum, Mexico',640],['Maui, Hawaii',1150],['Key West, FL',420],['Cabo, Mexico',780],['Aruba',890],['San Juan, PR',510],['Santorini, Greece',1340],['Bali, Indonesia',1420],['Cancún, Mexico',580],['Barbados',960]];
  S.deals=S.finders.flatMap(f=>pool.filter(([d,p])=>p<=f.max&&(f.dest==='Anywhere warm'||d.toLowerCase().includes(f.dest.toLowerCase().split(',')[0]))).map(([d,p],i)=>({id:uid(),dest:d,price:p,from:f.origin,dates:fmtR(addD(today,20+i*7),addD(today,20+i*7+f.days)),note:p<f.max*0.7?'🔥 Well under your max':'Under your max · '+f.window})));
  if(!S.deals.length)S.deals=[{id:uid(),dest:'No exact matches — try raising the max price',price:0,from:'—',dates:'—',note:'Demo deals are sample data'}];
  log(me().code+' ran the flight finder — '+S.deals.length+' sample deal(s)');save();render();if(!quiet)toast('Sample deals generated (demo — real flight APIs need keys, see README)')};
window.genProposals=()=>{const matched=S.items.filter(i=>i.kind==='Destination'&&members().every(p=>i.votes[p.id]===1));
  const windows=[];let start=null;
  for(let n=7;n<97;n++){const d=addD(today,n);if(allFree(d)){if(!start)start=d;const len=(new Date(d)-new Date(start))/86400000+1;if(len>=5&&n>7&&!allFree(addD(today,n+1)))windows.push([start,d])}else start=null}
  if(start)windows.push([start,addD(today,96)]);
  const dests=matched.length?matched:[S.items.find(i=>i.kind==='Destination')];
  S.proposals=dests.slice(0,3).map((d,i)=>{const w=windows[i]||windows[0]||[addD(today,21),addD(today,26)];return{id:uid(),title:d.name,start:w[0],end:w[1],price:d.budget||900,why:'You’re all free '+fmtR(w[0],w[1])+' · everyone in the trip loved '+d.name+' · est. $'+(d.budget||900)+' per person',votes:{},comments:[{by:'p2',text:'@Golden Hour this window works for me! 🌴',at:'Sample'}],reactions:{'🌴':1}}});
  log(me().code+' generated '+S.proposals.length+' proposed holiday(s)');save();render()};
window.voteProposal=(id,v)=>{const p=S.proposals.find(x=>x.id===id);p.votes[S.me]=v;log(me().code+' marked '+v+' on '+p.title);
  if(members().every(m=>p.votes[m.id]==='Accept')){p.status='Accepted 🎉';if(!S.itinerary.some(x=>x.title===p.title))S.itinerary.unshift({id:uid(),title:p.title,detail:fmtR(p.start,p.end)+' · est. $'+p.price+'/person · '+p.why})}else p.status='';
  save();render()};
window.addMoment=()=>{const label=$('#momentLabel').value.trim()||'New shared moment';S.moments.unshift({id:uid(),emoji:'📸',label:label+' (photo stub — demo)'});log(me().code+' added a shared moment: '+label);save();render()};
window.copyInvite=()=>{const link=location.origin+location.pathname+'#join='+S.trip.code;const txt='🌴 You’re invited to Holidate: “'+S.trip.name+'” ('+S.trip.type+')\nJoin code: '+S.trip.code+'\n'+link+'\nInvite-only — no public link, just us.';
  if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>toast('Invite copied — send it to your person'));else toast(txt);log(me().code+' copied the invite for '+S.trip.name)};
window.joinTrip=()=>{const code=$('#joinCode').value.trim().toUpperCase();if(code===S.trip.code){toast('You’re in! (Demo joins work in this browser)');log(me().code+' joined via invite code')}else toast('That code doesn’t match this demo trip ('+S.trip.code+')')};
window.createTrip=()=>{const name=$('#tripName').value.trim();if(!name)return toast('Name the trip');S.trip={name,type:$('#tripType').value,code:'SUN-'+Math.floor(1000+Math.random()*9000),memberIds:[S.me,members().find(m=>m.id!==S.me)?.id||'p2'],owner:S.me};S.proposals=[];log(me().code+' created a new invite-only trip: '+name);save();render()};
window.resetDemo=()=>{localStorage.removeItem(KEY);S=seed();save();render();toast('Demo reset with fresh sample data')};
window.loadSample=()=>{S=seed();save();render();toast('Sample data loaded')};

// ---------- render ----------
function commentsHTML(kind,obj){
  const list=(obj.comments||[]).map(c=>'<div class="comment"><b>'+esc(person(c.by).code)+'</b> <span class="muted">'+esc(c.at)+'</span><br>'+mention(c.text)+'</div>').join('');
  return list+'<div class="row"><input id="c-'+kind+'-'+obj.id+'" placeholder="Comment… try @'+esc(members()[1]?.code||'friend')+'"><button class="btn ghost small" onclick="addComment(\''+kind+'\',\''+obj.id+'\')">Post</button></div>';
}
function reactionsHTML(kind,obj){
  return '<div class="row">'+['❤️','🌴','🔥'].map(e=>'<button class="react" onclick="react(\''+kind+'\',\''+obj.id+'\',\''+e+'\')">'+e+' '+((obj.reactions||{})[e]||0)+'</button>').join('')+'</div>';
}
function voteRow(it){
  return '<div class="row spread"><div><div class="muted">Tap your thumb — 👍 love · 👉 sideways / maybe · 👎 pass</div><div class="row" style="margin-top:6px"><button class="thumb '+thumbCls(it.votes[S.me]??0)+'" onclick="cycleVote(\''+it.id+'\')" aria-label="cycle vote">'+thumbIcon(it.votes[S.me]??0)+'</button><span class="votes">'+members().map(p=>esc(p.code)+': '+thumbIcon(it.votes[p.id]??0)).join(' · ')+'</span></div></div>'+(members().every(p=>it.votes[p.id]===1)?'<span class="tag tq">💚 MATCH — everyone loves it</span>':'')+'</div>';
}
function render(){
  const m=members();
  let h='';
  h+='<div class="hero"><span class="badge">DEMO MODE · localStorage · invite-only</span><h1>🏝️ Holidate</h1><p>Plan a holiday <em>together</em> — calendars, wishlists, comfort checks & flight deals, in one sunny place. 🌅🍹</p><p class="wave">〰️ 🌊 〰️ 🐚 〰️ 🌊 〰️</p></div>';
  h+='<div class="wrap"><div class="sticky"><div class="switcher"><b style="white-space:nowrap">Acting as:</b>'+S.people.map(p=>'<button class="pill '+(S.me===p.id?'on':'')+'" onclick="setMe(\''+p.id+'\')">'+p.emoji+' '+esc(p.code)+'</button>').join('')+'<span class="muted">Demo: both sides live in this browser — switch to answer/vote as each person.</span></div>';
  const tabs=[['home','🏠 Trip home'],['calendar','📅 Calendars'],['wishlist','💛 Wishlist & votes'],['comfort','🛏️ Comfort check'],['deals','✈️ Flight finder'],['crew','🌴 My Travel Crew']];
  h+='<div class="tabs">'+tabs.map(t=>'<button class="tab '+(view===t[0]?'on':'')+'" onclick="setView(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div></div>';

  if(view==='home'){
    h+='<div class="grid g2"><section class="card goldframe"><h2 style="margin-top:0">'+esc(S.trip.name)+'</h2><div class="row"><span class="tag">'+esc(S.trip.type)+'</span><span class="tag tq">🔒 Invite-only · code '+esc(S.trip.code)+'</span><span class="tag plum">No public discovery</span></div>'
      +'<p class="muted">Only people with the invite link/code can join. Share it with your person — nobody else can find this trip.</p><div class="row"><button class="btn sun" onclick="copyInvite()">📩 Copy invite link + code</button></div>'
      +'<label>Join with a code</label><div class="row"><input id="joinCode" placeholder="e.g. '+esc(S.trip.code)+'"><button class="btn ghost" onclick="joinTrip()">Join</button></div>'
      +'<label>Start a new trip</label><div class="row"><input id="tripName" placeholder="Trip name — e.g. Girls’ Beach Week"><select id="tripType" style="max-width:190px">'+['Couple','Girls trip','Friends','Family','Work crew','Custom'].map(t=>'<option '+(S.trip.type===t?'selected':'')+'>'+t+'</option>').join('')+'</select><button class="btn tq" onclick="createTrip()">Create trip</button></div></section>'
      +'<section class="card"><h3 style="margin-top:0">👥 Who’s on this trip?</h3><p class="muted">Tap to add/remove from your Travel Crew. Trips can be 2+ people — not just couples.</p><div class="row">'+S.people.map(p=>'<button class="chip gold '+(S.trip.memberIds.includes(p.id)?'on':'')+'" onclick="toggleMember(\''+p.id+'\')">'+p.emoji+' '+esc(p.code)+(S.trip.memberIds.includes(p.id)?' ✓':'')+'</button>').join('')+'</div><p class="muted" style="margin-top:10px">On this trip: '+m.map(p=>esc(p.code)).join(' · ')+'</p></section></div>';

    // proposals
    h+='<section class="card" style="margin-top:14px"><div class="row spread"><h2 style="margin:0">✨ Proposed holidays</h2><button class="btn sun" onclick="genProposals()">Generate proposals</button></div><p class="muted">Built from everyone’s overlapping free days + destinations everyone loved + budget. Each person accepts, tweaks or declines — when everyone accepts, it becomes your itinerary.</p>';
    if(!S.proposals.length)h+='<p class="muted">No proposals yet — tap <b>Generate proposals</b> (we seeded a free overlap + an Aruba match 💚).</p>';
    h+=S.proposals.map(p=>'<article class="card '+(p.status?'goldframe':'')+'" style="margin-top:12px"><div class="row spread"><h3 style="margin:0">🌴 '+esc(p.title)+'</h3><b>'+fmtR(p.start,p.end)+'</b></div><p class="muted">'+esc(p.why)+'</p>'+(p.status?'<span class="tag tq">'+esc(p.status)+'</span> ':'')+'<span class="votes">'+m.map(x=>esc(x.code)+': '+(p.votes[x.id]||'—')).join(' · ')+'</span><div class="row" style="margin-top:10px"><button class="btn tq small" onclick="voteProposal(\''+p.id+'\',\'Accept\')">✅ Accept</button><button class="btn ghost small" onclick="voteProposal(\''+p.id+'\',\'Tweak\')">🛠️ Tweak</button><button class="btn ghost small" onclick="voteProposal(\''+p.id+'\',\'Decline\')">Decline</button></div><div style="margin-top:10px">'+reactionsHTML('proposal',p)+commentsHTML('proposal',p)+'</div></article>').join('')+'</section>';

    h+='<div class="grid g2" style="margin-top:14px"><section class="card"><h3 style="margin-top:0">🧾 Itinerary</h3>'+S.itinerary.map(i=>'<div class="feeditem"><b>'+esc(i.title)+'</b><br><span class="muted">'+esc(i.detail)+'</span></div>').join('')+'</section>'
      +'<section class="card"><h3 style="margin-top:0">📣 Trip activity</h3>'+S.feed.slice(0,10).map(f=>'<div class="feeditem">'+esc(f.text)+'<br><span class="muted">'+esc(f.at)+'</span></div>').join('')+'</section></div>';

    h+='<section class="card" style="margin-top:14px"><h3 style="margin-top:0">📸 Shared moments</h3><p class="muted">Photos live here once you travel — demo shows pretty stubs.</p><div class="grid g3">'+S.moments.map(x=>'<div class="moment"><div>'+x.emoji+'<div style="font-size:13px;font-weight:800">'+esc(x.label)+'</div></div></div>').join('')+'</div><label>Moment label</label><div class="row"><input id="momentLabel" placeholder="Sunset sail, day 3"><button class="btn ghost" onclick="addMoment()">Add moment stub</button></div></section>';
  }

  if(view==='calendar'){
    // next 42 days starting today (aligned Mon-ish simple)
    let days='';const dows=['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>'<div class="dow">'+d+'</div>').join('');
    for(let n=0;n<42;n++){const d=addD(today,n);const freeCount=m.filter(p=>!isBusy(p.id,d)).length;const cls=freeCount===m.length?'free':freeCount===0?'busy':'partial';days+='<div class="day '+cls+'"><b>'+new Date(d+'T12:00:00').getDate()+'</b><br>'+(cls==='free'?'💚 all free':cls==='busy'?'🔴 all busy':'🟡 '+freeCount+'/'+m.length+' free')+'</div>'}
    h+='<section class="card"><h2 style="margin-top:0">📅 Combined availability — next 6 weeks</h2><p class="muted">Group overlap for: '+m.map(p=>esc(p.code)).join(' · ')+'. 💚 = everyone free — that’s where proposals come from.</p><div class="cal">'+dows+days+'</div></section>';
    h+='<div class="grid g2" style="margin-top:14px"><section class="card"><h3 style="margin-top:0">➕ Add busy time for '+esc(me().code)+'</h3><label>Start</label><input type="date" id="busyStart"><label>End</label><input type="date" id="busyEnd"><label>Label</label><input id="busyLabel" placeholder="Work, family, pet sitting…"><div class="row" style="margin-top:12px"><button class="btn sun" onclick="addBusy()">Save busy block</button></div>'
      +'<label>Upload calendar (.ics)</label><input type="file" accept=".ics,text/calendar" onchange="handleICS(event)"><p class="muted">Export from Google/Apple Calendar as .ics, then upload — we parse busy events here in your browser.</p>'
      +'<label>Paste availability</label><textarea id="pasteBox" rows="3" placeholder="Paste text with busy dates like 2026-12-05 …"></textarea><div class="row" style="margin-top:8px"><button class="btn ghost" onclick="pasteAvail()">Add pasted busy dates</button></div>'
      +'<p class="muted">🔌 Coming soon: direct Google Calendar & Apple Calendar sync (needs OAuth — see README).</p></section>'
      +'<section class="card"><h3 style="margin-top:0">🚫 '+esc(me().code)+'’s busy blocks</h3>'+((S.busy[S.me]||[]).length?(S.busy[S.me].map(b=>'<div class="feeditem"><b>'+esc(b.label)+'</b><br><span class="muted">'+fmtR(b.start,b.end)+'</span> <button class="btn ghost small" onclick="delBusy(\''+b.id+'\')">Remove</button></div>').join('')):'<p class="muted">Nothing yet — wide open 🌊</p>')+'</section></div>';
  }

  if(view==='wishlist'){
    h+='<section class="card"><h2 style="margin-top:0">💛 Add a dream, stay, bite or add-in</h2><div class="grid g2"><div><label>Type</label><select id="itKind"><option>Destination</option><option>Hotel / Airbnb</option><option>Restaurant</option><option>Activity / add-in</option></select><label>Name</label><input id="itName" placeholder="Overwater bungalow, taco tour…"></div><div><label>Place</label><input id="itPlace" placeholder="Aruba"><label>Budget ($ per person / per night)</label><input id="itBudget" type="number" placeholder="200"><label>Vibe tags (comma separated)</label><input id="itVibes" placeholder="beach, spa, sunset"></div></div><div class="row" style="margin-top:12px"><button class="btn sun" onclick="addItem()">Add to wishlist</button></div></section>';
    h+='<div class="grid g2" style="margin-top:14px">'+S.items.map(it=>'<article class="card"><div class="biz"><div class="avatar">'+(it.kind==='Destination'?'🏝️':it.kind==='Restaurant'?'🍽️':it.kind.startsWith('Hotel')?'🏨':'🤿')+'</div><div><h3>'+esc(it.name)+'</h3><div class="sub">'+esc(it.kind)+' · '+esc(it.place||'')+' · $'+esc(it.budget)+' · added by '+esc(person(it.by).code)+'</div><div class="row" style="margin-top:6px">'+it.vibes.map(v=>'<span class="tag">'+esc(v)+'</span>').join('')+'</div></div></div><div style="margin-top:12px">'+voteRow(it)+'</div><div style="margin-top:10px">'+reactionsHTML('item',it)+commentsHTML('item',it)+'</div></article>').join('')+'</div>';
  }

  if(view==='comfort'){
    const fields=[['room','Room setup',['Shared room','Same room, separate beds','Separate rooms']],['split','Budget split',['50/50','Take turns','One person covers, settle later','One covers flights, other covers stays']],['flight','Flight times',['Morning','Afternoon','Evening','No red-eyes','Cheapest, any time']],['seat','Seat preference',['Window','Aisle','Middle (brave)','Together, wherever']],['pace','Trip pace',['Relaxed','Mix of both','Adventurous / packed']],['nightlife','Nightlife',['Early nights','Golden-hour drinks','One big night out','Out most nights']],['food','Food style',['Foodie — book the good places','Casual & local','Cook some meals in']]];
    const addins=['Spa','Excursions','Rental car','Childcare','Pet care','Airport lounge','Travel insurance'];
    const mine=S.prefs[S.me];
    h+='<section class="card"><h2 style="margin-top:0">🛏️ Comfort check — '+esc(me().code)+'</h2><p class="muted">Answer as whoever is selected up top. Switch people to fill in theirs — just like The Roster, but for holidays.</p><div class="grid g2">'
      +fields.map(f=>'<div><label>'+f[1]+'</label><div class="row">'+f[2].map(o=>'<button class="chip '+(mine[f[0]]===o?'on':'')+'" onclick="setPref(\''+f[0]+'\',\''+esc(o).replace(/'/g,"\\'")+'\')">'+o+'</button>').join('')+'</div></div>').join('')
      +'<div><label>Add-ins I want</label><div class="row">'+addins.map(a=>'<button class="chip gold '+(mine.addins.includes(a)?'on':'')+'" onclick="toggleAddin(\''+a+'\')">'+a+'</button>').join('')+'</div></div></div></section>';
    // compatibility
    const diffs=[];fields.forEach(f=>{const vals=[...new Set(m.map(p=>S.prefs[p.id][f[0]]))];if(vals.length>1)diffs.push('<div class="feeditem"><b>'+f[1]+':</b> '+m.map(p=>esc(p.code)+' — '+esc(S.prefs[p.id][f[0]])).join(' · ')+'</div>')});
    const addDiff=(()=>{const all=[...new Set(m.flatMap(p=>S.prefs[p.id].addins))];return all.filter(a=>!m.every(p=>S.prefs[p.id].addins.includes(a))).map(a=>'<div class="feeditem"><b>Add-in '+esc(a)+':</b> wanted by '+m.filter(p=>S.prefs[p.id].addins.includes(a)).map(p=>esc(p.code)).join(', ')+'</div>').join('')})();
    h+='<section class="card" style="margin-top:14px"><h3 style="margin-top:0">💞 Group compatibility</h3><p class="muted">'+(diffs.length||addDiff?'A few things to talk about over a beach drink 🍹:':'You’re beautifully in sync — book the trip! 🌴')+'</p>'+diffs.join('')+addDiff
      +'<h4>Where you already agree</h4><p class="muted">'+fields.filter(f=>new Set(m.map(p=>S.prefs[p.id][f[0]])).size===1).map(f=>f[1]+': '+esc(S.prefs[m[0].id][f[0]])).join(' · ')+'</p></section>';
  }

  if(view==='deals'){
    h+='<section class="card"><h2 style="margin-top:0">✈️ Flight price finder</h2><p class="muted">Set a finder and we’ll surface sample deals in demo. Real alerts need a flight API key later (Skyscanner / Amadeus — see README).</p><div class="grid g2"><div><label>From</label><input id="fOrigin" placeholder="Your home airport (e.g. DEN)"><label>To</label><input id="fDest" placeholder="Anywhere warm, or Aruba"></div><div><label>Max price ($)</label><input id="fMax" type="number" value="1200"><label>Date window</label><select id="fWindow"><option>Next 3 months</option><option>Next 6 months</option><option>School holidays</option></select><label>Min trip days</label><input id="fDays" type="number" value="5"></div></div><div class="row" style="margin-top:12px"><button class="btn ghost" onclick="addFinder()">Save finder / alert</button><button class="btn sun" onclick="findDeals()">🔎 Find deals</button></div>'
      +'<h4>Your alerts</h4>'+S.finders.map(f=>'<div class="feeditem">🔔 '+esc(f.origin)+' → '+esc(f.dest)+' · under $'+f.max+' · '+esc(f.window)+' · '+f.days+'+ days</div>').join('')+'</section>';
    h+='<div class="grid g3" style="margin-top:14px">'+S.deals.map(d=>'<article class="card goldframe"><h3 style="margin:0">✈️ '+esc(d.dest)+'</h3><div class="kpi">'+(d.price?'$'+d.price:'—')+'</div><p class="muted">From '+esc(d.from)+'<br>'+esc(d.dates)+'<br>'+esc(d.note)+'</p><span class="tag tq">Sample deal · demo</span></article>').join('')+'</div>';
    h+='<section class="card" style="margin-top:14px"><h3 style="margin-top:0">🧾 Itinerary stubs</h3>'+S.itinerary.map(i=>'<div class="feeditem"><b>'+esc(i.title)+'</b><br><span class="muted">'+esc(i.detail)+'</span></div>').join('')+'</section>';
  }

  if(view==='crew'){
    h+='<section class="card"><h2 style="margin-top:0">🌴 My Travel Crew</h2><p class="muted">Your roster of travel partners — code names, travel styles, past trips and comfort at a glance. Tap people on the Trip home to add them to a trip.</p></section><div class="grid g2" style="margin-top:14px">'
      +S.people.map(p=>'<article class="card '+(S.trip.memberIds.includes(p.id)?'goldframe':'')+'"><div class="biz"><div class="avatar">'+p.emoji+'</div><div><h3>'+esc(p.code)+'</h3><div class="sub">'+esc(p.name)+' · '+esc(p.style)+'</div><div class="row" style="margin-top:6px">'+p.tags.map(t=>'<span class="tag tq">'+esc(t)+'</span>').join('')+'</div><p class="muted">Past trips: '+esc(p.past)+'<br>Comfort: '+esc(S.prefs[p.id].room)+' · '+esc(S.prefs[p.id].pace)+' · '+esc(S.prefs[p.id].split)+'</p></div></div><div class="row"><button class="btn '+(S.trip.memberIds.includes(p.id)?'ghost':'sun')+' small" onclick="toggleMember(\''+p.id+'\')">'+(S.trip.memberIds.includes(p.id)?'On this trip ✓ — tap to remove':'Add to this trip')+'</button><button class="btn ghost small" onclick="setMe(\''+p.id+'\');setView(\'comfort\')">View comfort</button></div></article>').join('')+'</div>';
  }

  h+='<section class="card" style="margin-top:14px"><div class="row spread"><span class="muted">Holidate demo · data lives only in this browser (localStorage). Firebase setup in the README turns on real invite-only sharing.</span><span><button class="btn ghost small" onclick="loadSample()">Load sample data</button> <button class="btn ghost small" onclick="resetDemo()">Reset demo</button></span></div></section>';
  h+='</div><nav class="bottombar">'+tabs.map(t=>'<button class="'+(view===t[0]?'on':'')+'" onclick="setView(\''+t[0]+'\')">'+t[1].split(' ')[0]+'<br>'+t[1].split(' ').slice(1).join(' ')+'</button>').join('')+'</nav>';
  $('#app').innerHTML=h;
  // hash invite prefill
  if(location.hash.startsWith('#join=')){$('#joinCode')&&( $('#joinCode').value=location.hash.slice(6) )}
}
save();render();
// if no proposals/deals on first load, make the demo feel alive
if(!S.proposals.length){window.genProposals();window.findDeals(1);}
