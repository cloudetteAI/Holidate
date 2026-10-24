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
  const trip={id:'t'+uid(),name:'Winter Sun Escape',type:'Couple',code:'SUN-'+Math.floor(1000+Math.random()*9000),memberIds:['p1','p2'],owner:'p1'};
  return {
    me:'p1',
    trip,
    invites:{[trip.code]:inviteDoc(trip)},
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
// Invite doc — same shape as Firestore /invites/{code}: who minted it and which trip it opens.
function inviteDoc(trip){return {ownerUid:trip.owner,tripId:trip.id,createdAt:Date.now()}}
function load(){try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.trip){
  if(!r.trip.id)r.trip.id='t'+uid();
  if(!r.invites)r.invites={[r.trip.code]:inviteDoc(r.trip)};
  return r}}catch(e){} return seed()}
let S=load();
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function person(id){return S.people.find(p=>p.id===id)||S.people[0]}
function members(){return S.trip.memberIds.map(person)}
function me(){return person(S.me)}
function toast(m){const t=$('#toast');t.textContent=m;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,2600)}
function log(text){S.feed.unshift({id:uid(),text,at:'Just now'});S.feed=S.feed.slice(0,30)}
function isBusy(pid,date){return (S.busy[pid]||[]).some(b=>date>=b.start&&date<=b.end)}
function allFree(date){return members().every(p=>!isBusy(p.id,date))}
// Highlight @CodeName for known crew only (both sides are already HTML-escaped, so this can't inject markup).
function mention(text){const codes=S.people.map(p=>esc(p.code)).sort((a,b)=>b.length-a.length);let out=esc(text).replace(/[\u0000\u0001]/g,"");codes.forEach(c=>{out=out.split('@'+c).join('\u0000'+c+'\u0001')});return out.replace(/\u0000([^\u0001]*)\u0001/g,'<span class="mention">@$1</span>')}
function thumbIcon(v){return v===1?'👍':v===-1?'👎':'👉'}
function thumbCls(v){return v===1?'up':v===-1?'down':'side'}

// ---------- actions (global for inline handlers) ----------
window.setView=v=>{const ch=v!==view;view=v;render();if(ch)window.scrollTo({top:0})};
window.setMe=id=>{S.me=id;save();toast('Now acting as '+person(id).code+' (demo: both sides in this browser)');render()};
// Mirrors firestore.rules: only the owner changes who's on the trip; anyone else may only remove themselves (leave).
window.toggleMember=id=>{const i=S.trip.memberIds.indexOf(id);const isOwner=S.me===S.trip.owner;
  if(id===S.trip.owner&&i>=0)return toast('The trip owner can’t be removed');
  if(!isOwner&&!(i>=0&&id===S.me))return toast('Only the trip owner ('+person(S.trip.owner).code+') can add or remove people — you can leave the trip yourself');
  if(i>=0){if(S.trip.memberIds.length<=2)return toast('A trip needs at least 2 people');S.trip.memberIds.splice(i,1)}else S.trip.memberIds.push(id);log(me().code+(i>=0?' removed ':' added ')+person(id).code+' '+(i>=0?'from':'to')+' the trip');save();render()};
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
// Mirrors firestore.rules: a valid invite for THIS trip lets you add only yourself.
window.joinTrip=()=>{const code=$('#joinCode').value.trim().toUpperCase();const inv=(S.invites||{})[code];
  if(!inv||inv.tripId!==S.trip.id)return toast('That code doesn’t match this demo trip ('+S.trip.code+')');
  if(S.trip.memberIds.includes(S.me))return toast('You’re already on this trip 🌴');
  S.trip.memberIds.push(S.me);log(me().code+' joined via invite code');save();render();toast('You’re in! (Demo joins work in this browser)')};
window.createTrip=()=>{const name=$('#tripName').value.trim();if(!name)return toast('Name the trip');S.trip={id:'t'+uid(),name,type:$('#tripType').value,code:'SUN-'+Math.floor(1000+Math.random()*9000),memberIds:[S.me,members().find(m=>m.id!==S.me)?.id||'p2'],owner:S.me};S.invites=S.invites||{};S.invites[S.trip.code]=inviteDoc(S.trip);S.proposals=[];log(me().code+' created a new invite-only trip: '+name);save();render()};
window.resetDemo=()=>{localStorage.removeItem(KEY);S=seed();save();render();toast('Demo reset with fresh sample data')};
window.loadSample=()=>{S=seed();save();render();toast('Sample data loaded')};

// Comfort-check questions (shared by the Comfort view and Aira).
const COMFORT_FIELDS=[['room','Room setup',['Shared room','Same room, separate beds','Separate rooms']],['split','Budget split',['50/50','Take turns','One person covers, settle later','One covers flights, other covers stays']],['flight','Flight times',['Morning','Afternoon','Evening','No red-eyes','Cheapest, any time']],['seat','Seat preference',['Window','Aisle','Middle (brave)','Together, wherever']],['pace','Trip pace',['Relaxed','Mix of both','Adventurous / packed']],['nightlife','Nightlife',['Early nights','Golden-hour drinks','One big night out','Out most nights']],['food','Food style',['Foodie — book the good places','Casual & local','Cook some meals in']]];

// ---------- render ----------
// Inline SVG icons (Lucide-style, 24px grid, stroke = currentColor) — crisp at any size, themeable via CSS.
const ICONS={
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  calendar:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6M2 18h20"/>',
  plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search:'<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  list:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  thumb:'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
  ban:'<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  plug:'<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>'
};
const ic=(n,cls='')=>'<svg class="ic '+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+ICONS[n]+'</svg>';
// ---------- brand ----------
// Mark: the "golden-hour horizon" — a papaya half-sun on a honey horizon, a gold arc above, sea below.
// That sun-on-horizon is the signature motif: it repeats in the hero, stamps, stickers, empty states and Aira.
const LOGO='<svg class="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="9" fill="#073B44"/><path d="M6 19.5a10 10 0 0 1 20 0" fill="none" stroke="#E9A93B" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".7"/><path d="M10 19.5a6 6 0 0 1 12 0Z" fill="#FF7452"/><path d="M5 19.5h22" stroke="#E9A93B" stroke-width="1.6" stroke-linecap="round"/><path d="M7 24.6c1.6 0 1.6-1.3 3.2-1.3s1.6 1.3 3.2 1.3 1.6-1.3 3.2-1.3 1.6 1.3 3.2 1.3 1.6-1.3 3.2-1.3" fill="none" stroke="#FBF6EE" stroke-width="1.6" stroke-linecap="round"/></svg>';
// Wordmark: lowercase, tight, with the i's dot replaced by a little papaya sun.
const WORDMARK='<span class="wordmark" role="img" aria-label="Holidate"><span aria-hidden="true">hol<span class="wm-i">ı<i></i></span>date</span></span>';
// Passport-stamp badge (text on a circular path). id must be unique per instance.
function stamp(text,cls=''){const id='stp'+uid();return '<svg class="stamp '+cls+'" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><path id="'+id+'" d="M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0"/></defs><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" stroke-width="1.2"/><text font-size="10.5" font-weight="800" letter-spacing="2.2" fill="currentColor"><textPath href="#'+id+'">'+esc(text)+'</textPath></text><path d="M38 56a12 12 0 0 1 24 0Z" fill="currentColor"/><path d="M33 56h34" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M38 62c2 0 2-1.4 4-1.4s2 1.4 4 1.4 2-1.4 4-1.4 2 1.4 4 1.4 2-1.4 4-1.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'}
// Small horizon used in empty states.
const HORIZON='<svg class="horizon" viewBox="0 0 64 36" aria-hidden="true" focusable="false"><path d="M12 24a20 20 0 0 1 40 0" fill="none" stroke="var(--gold)" stroke-width="1.6" stroke-dasharray="2 4" stroke-linecap="round"/><path d="M22 24a10 10 0 0 1 20 0Z" fill="var(--accent)"/><path d="M6 24h52" stroke="var(--gold)" stroke-width="1.6" stroke-linecap="round"/><path d="M14 30c2.4 0 2.4-1.6 4.8-1.6s2.4 1.6 4.8 1.6 2.4-1.6 4.8-1.6 2.4 1.6 4.8 1.6 2.4-1.6 4.8-1.6 2.4 1.6 4.8 1.6 2.4-1.6 4.8-1.6" fill="none" stroke="var(--primary)" stroke-width="1.6" stroke-linecap="round"/></svg>';
const emptyState=(title,text)=>'<div class="empty">'+HORIZON+'<b>'+title+'</b><span>'+text+'</span></div>';
// Flat sticker illustrations, one per view. Same kit: white disc, honey horizon, papaya sun, lagoon details.
const STK_DISC='<circle cx="48" cy="48" r="44" fill="var(--surface)" stroke="var(--line-2)" stroke-width="1.5"/>';
const STICKERS={
  calendar:'<rect x="24" y="26" width="48" height="44" rx="8" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/><path d="M24 34a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8v4H24Z" fill="var(--primary)"/><path d="M36 21v9M60 21v9" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/><g fill="var(--line-2)"><circle cx="34" cy="47" r="2.6"/><circle cx="43" cy="47" r="2.6"/><circle cx="62" cy="47" r="2.6"/><circle cx="34" cy="58" r="2.6"/><circle cx="62" cy="58" r="2.6"/></g><path d="M45 61a8 8 0 0 1 16 0Z" fill="var(--accent)"/><path d="M41 61h24" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/><circle cx="53" cy="47" r="3.2" fill="var(--good)"/>',
  wishlist:'<path d="M14 64h68" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/><path d="M26 64c4-9 16-12 26-12s20 4 24 12Z" fill="var(--gold-100)"/><path d="M48 54c1-10-1-19-6-26" fill="none" stroke="var(--gold-ink)" stroke-width="3" stroke-linecap="round"/><path d="M42 28c-6-4-15-3-19 2 7-1 13 1 19-2ZM42 28c2-7 9-11 16-10-5 3-9 7-16 10ZM42 28c7-2 15 1 18 7-7-2-12-4-18-7ZM42 28c-3-6-10-9-16-7 5 2 10 4 16 7Z" fill="var(--primary)"/><path d="M68 32c0-3.6 4.6-5 6.5-1.8C76.4 27 81 28.4 81 32c0 4-6.5 8-6.5 8S68 36 68 32Z" fill="var(--accent)"/><path d="M20 72c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>',
  comfort:'<path d="M14 64h68" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/><path d="M30 30a20 20 0 0 1 40 0Z" fill="var(--accent)"/><path d="M40 30a10 10 0 0 1 20 0" fill="var(--surface)" opacity=".55"/><path d="M50 30v34" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/><path d="M22 64l6-12h14l4 6M28 52l-4-6" fill="none" stroke="var(--primary)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 64l-6-12H58l-4 6M72 52l4-6" fill="none" stroke="var(--primary)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 72c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>',
  deals:'<path d="M20 62a28 28 0 0 1 56 0" fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="2.5 5" stroke-linecap="round"/><path d="M34 62a14 14 0 0 1 28 0Z" fill="var(--accent)"/><path d="M14 62h68" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/><path d="M20 70c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/><g transform="translate(52 22) rotate(18)"><path d="M0 8 26 4c3-.4 5 1 5 3s-2 3.4-5 3L0 12Z" fill="var(--primary)"/><path d="M12 6 5-4h5l7 10ZM12 12l-7 10h5l7-10ZM2 8l-4-6h3l5 6Z" fill="var(--primary)"/></g>',
  crew:'<path d="M20 70h56" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/><g transform="rotate(-14 38 46)"><path d="M24 30h26c0 9-6 15-13 15s-13-6-13-15Z" fill="var(--gold)"/><path d="M24 30h26" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><path d="M37 45v18M30 63h14" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/><circle cx="46" cy="27" r="3.4" fill="var(--accent)"/></g><g transform="rotate(14 58 46)"><path d="M46 30h26c0 9-6 15-13 15s-13-6-13-15Z" fill="var(--accent)"/><path d="M46 30h26" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><path d="M59 45v18M52 63h14" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/></g><path d="M48 14v6M41 17l3 4M55 17l-3 4" stroke="var(--gold)" stroke-width="2.2" stroke-linecap="round"/>'
};
const sticker=k=>'<svg class="sticker" viewBox="0 0 96 96" aria-hidden="true" focusable="false">'+STK_DISC+STICKERS[k]+'</svg>';
// Aira's avatar: a honey disc with a midnight sparkle — related to the mark, but clearly "someone".
const AIRA_AVATAR='<svg class="aira-av" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="20" fill="#E9A93B"/><path d="M8 27h24" stroke="#073B44" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".35"/><path d="M19 8.5c.9 5.6 2.9 7.6 8.5 8.5-5.6.9-7.6 2.9-8.5 8.5-.9-5.6-2.9-7.6-8.5-8.5 5.6-.9 7.6-2.9 8.5-8.5Z" fill="#073B44"/><circle cx="28.5" cy="10.5" r="2.4" fill="#FF7452"/></svg>';
const TABS=[['home','Trip home','Home','home'],['calendar','Calendars','Dates','calendar'],['wishlist','Wishlist & votes','Wishlist','heart'],['comfort','Comfort check','Comfort','bed'],['deals','Flight finder','Flights','plane'],['crew','My Travel Crew','Crew','users']];
const sh=(icon,title,extra='')=>'<div class="sh"><h3>'+ic(icon)+'<span>'+title+'</span></h3>'+extra+'</div>';
function thumbBadge(v){return '<span class="vt '+thumbCls(v)+'">'+ic('thumb')+'</span>'}
function commentsHTML(kind,obj){
  const list=(obj.comments||[]).map(c=>'<div class="comment"><div class="who"><b>'+esc(person(c.by).code)+'</b><span class="muted">'+esc(c.at)+'</span></div><div>'+mention(c.text)+'</div></div>').join('');
  return (list?'<div class="comments">'+list+'</div>':'')+'<div class="inputrow"><input id="c-'+kind+'-'+obj.id+'" aria-label="Write a comment" placeholder="Comment… try @'+esc(members()[1]?.code||'friend')+'"><button class="btn ghost small" onclick="addComment(\''+kind+'\',\''+obj.id+'\')">Post</button></div>';
}
function reactionsHTML(kind,obj){
  return '<div class="reacts">'+['❤️','🌴','🔥'].map(e=>'<button class="react" aria-label="React '+e+'" onclick="react(\''+kind+'\',\''+obj.id+'\',\''+e+'\')"><span>'+e+'</span><b>'+((obj.reactions||{})[e]||0)+'</b></button>').join('')+'</div>';
}
function voteRow(it){
  const v=it.votes[S.me]??0, lbl=v===1?'Love it':v===-1?'Pass':'Maybe';
  const match=members().every(p=>it.votes[p.id]===1);
  return '<div class="voterow"><button class="thumb '+thumbCls(v)+'" onclick="cycleVote(\''+it.id+'\')" aria-label="Your vote: '+lbl+'. Tap to change">'+ic('thumb')+'<span>'+lbl+'</span></button>'
    +'<div class="vlist">'+members().map(p=>'<span class="vchip" title="'+esc(p.code)+'">'+thumbBadge(it.votes[p.id]??0)+esc(p.code)+'</span>').join('')+'</div>'
    +(match?'<span class="tag match">'+ic('check')+'Match — everyone loves it</span>':'')+'</div>';
}
function render(){
  const m=members();
  const tab=TABS.find(t=>t[0]===view)||TABS[0];
  let h='<div class="shell">';
  // ---- side nav (desktop) ----
  h+='<aside class="sidenav" aria-label="Main"><div class="brand">'+LOGO+'<div>'+WORDMARK+'<small>Getaways, planned together</small></div></div><nav class="navlist">'
    +TABS.map(t=>'<button class="navitem '+(view===t[0]?'on':'')+'" '+(view===t[0]?'aria-current="page" ':'')+'onclick="setView(\''+t[0]+'\')">'+ic(t[3])+'<span>'+t[1]+'</span></button>').join('')
    +'</nav><div class="sidefoot"><span class="badge">'+ic('lock')+'Invite-only · demo</span><p>Your trip lives only in this browser until Firebase is connected.</p></div></aside>';
  // ---- main ----
  h+='<main class="main"><header class="topbar"><div class="topline"><div class="brand mobile-only">'+LOGO+WORDMARK+'</div><span class="badge mobile-only">Demo</span></div>'
    +'<div class="acting"><span class="eyebrow">Acting as</span><div class="seg scrollx" role="group" aria-label="Acting as">'+S.people.map(p=>'<button class="pill '+(S.me===p.id?'on':'')+'" aria-pressed="'+(S.me===p.id)+'" onclick="setMe(\''+p.id+'\')"><span class="em">'+esc(p.emoji)+'</span>'+esc(p.code)+'</button>').join('')+'</div></div></header><div class="content" data-view="'+view+'">';

  const pageHead=(title,sub,kicker)=>'<div class="banner"><div class="banner-text">'+(kicker?'<span class="eyebrow">'+kicker+'</span>':'')+'<h1>'+title+'</h1>'+(sub?'<p>'+sub+'</p>':'')+'</div>'+sticker(view)+'</div>';

  if(view==='home'){
    h+='<section class="hero" aria-labelledby="trip-title"><div class="hero-body"><span class="eyebrow light">'+ic('lock')+'Invite-only getaway</span><h1 id="trip-title">'+esc(S.trip.name)+'</h1>'
      +'<div class="row"><span class="tag onhero">'+esc(S.trip.type)+'</span><span class="tag onhero">Code '+esc(S.trip.code)+'</span><span class="tag onhero">'+m.length+' travelers</span></div>'
      +'<p>Just you and your people. Only someone holding your invite code can find this trip.</p><div class="row"><button class="btn sun" onclick="copyInvite()">'+ic('send')+'Send the invite</button></div></div>'
      +stamp('INVITE ONLY · HOLIDATE · ','hero-stamp')
      +'<div class="hero-scene" aria-hidden="true"><svg class="hero-sunset" viewBox="0 0 200 100" focusable="false"><path d="M8 100a92 92 0 0 1 184 0" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round" opacity=".7"/><path d="M36 100a64 64 0 0 1 128 0" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round"/><path d="M60 100a40 40 0 0 1 80 0Z" fill="var(--accent)"/></svg>'
      +'<svg class="hero-sea" viewBox="0 0 400 40" preserveAspectRatio="none" focusable="false"><path d="M0 1h400" stroke="var(--gold)" stroke-width="2" vector-effect="non-scaling-stroke"/><path d="M0 14c25 0 25-7 50-7s25 7 50 7 25-7 50-7 25 7 50 7 25-7 50-7 25 7 50 7 25-7 50-7 25 7 50 7V40H0Z" fill="#fff" opacity=".07"/><path d="M0 26c25 0 25-7 50-7s25 7 50 7 25-7 50-7 25 7 50 7 25-7 50-7 25 7 50 7 25-7 50-7 25 7 50 7V40H0Z" fill="#fff" opacity=".08"/></svg></div></section>';

    h+='<div class="grid g2 mt"><section class="card">'+sh('users','Who’s coming?','<span class="count">'+m.length+'</span>')+'<p class="muted">Tap to add your favourite people. Two’s a date; more’s a party.</p><div class="chips">'
      +S.people.map(p=>{const on=S.trip.memberIds.includes(p.id);return '<button class="chip '+(on?'on':'')+'" aria-pressed="'+on+'" onclick="toggleMember(\''+p.id+'\')"><span class="em">'+esc(p.emoji)+'</span>'+esc(p.code)+(on?ic('check','sm'):ic('plus','sm'))+'</button>'}).join('')+'</div></section>'
      +'<section class="card">'+sh('login','Got a code? Or start fresh')+'<label for="joinCode">Join with a code</label><div class="inputrow"><input id="joinCode" placeholder="e.g. '+esc(S.trip.code)+'"><button class="btn ghost" onclick="joinTrip()">Join</button></div>'
      +'<label for="tripName">Start a new trip</label><div class="stack"><input id="tripName" placeholder="Trip name — e.g. Girls’ Beach Week"><div class="inputrow"><select id="tripType" aria-label="Trip type">'+['Couple','Girls trip','Friends','Family','Work crew','Custom'].map(t=>'<option '+(S.trip.type===t?'selected':'')+'>'+t+'</option>').join('')+'</select><button class="btn primary" onclick="createTrip()">Create trip</button></div></div></section></div>';

    h+='<section class="card mt">'+sh('sparkles','Proposed getaways','<button class="btn sun small" onclick="genProposals()">'+ic('sparkles')+'Generate</button>')+'<p class="muted">Matched from everyone’s free days, the places you all love, and your budget. When everyone says yes, it’s a date.</p>';
    if(!S.proposals.length)h+=emptyState('No getaways on the horizon yet','Tap Generate and we’ll match your free days with the places you all love.');
    h+=S.proposals.map(p=>'<article class="inner '+(p.status?'accepted':'')+'"><div class="ihead"><div><h4>'+esc(p.title)+'</h4><span class="date">'+ic('calendar','sm')+fmtR(p.start,p.end)+'</span>'+(p.status?'<span class="tag match status">'+ic('check')+esc(p.status)+'</span>':'')+'</div>'+(p.status?stamp('IT’S A DATE · HOLIDATE · ','date-stamp'):'<span class="price">$'+esc(p.price)+'<small>/person</small></span>')+'</div><p class="muted">'+esc(p.why)+'</p>'
      +'<div class="vlist">'+m.map(x=>'<span class="vchip">'+esc(x.code)+' <b class="st-'+esc((p.votes[x.id]||'none').toLowerCase())+'">'+esc(p.votes[x.id]||'—')+'</b></span>').join('')+'</div>'
      +'<div class="actions three"><button class="btn primary small" onclick="voteProposal(\''+p.id+'\',\'Accept\')">'+ic('check')+'Accept</button><button class="btn ghost small" onclick="voteProposal(\''+p.id+'\',\'Tweak\')">'+ic('pencil')+'Tweak</button><button class="btn ghost small" onclick="voteProposal(\''+p.id+'\',\'Decline\')">'+ic('x')+'Decline</button></div>'
      +'<div class="social">'+reactionsHTML('proposal',p)+commentsHTML('proposal',p)+'</div></article>').join('')+'</section>';

    h+='<div class="grid g2 mt"><section class="card">'+sh('list','Itinerary')+'<div class="list">'+S.itinerary.map(i=>'<div class="li"><b>'+esc(i.title)+'</b><span class="muted">'+esc(i.detail)+'</span></div>').join('')+'</div></section>'
      +'<section class="card">'+sh('activity','The latest')+'<div class="list feed">'+S.feed.slice(0,8).map(f=>'<div class="li"><span>'+esc(f.text)+'</span><span class="muted">'+esc(f.at)+'</span></div>').join('')+'</div></section></div>';

    h+='<section class="card mt">'+sh('camera','Shared moments')+'<p class="muted">Your camera roll, curated. Photos land here once you travel; the demo shows stubs.</p><div class="moments">'+S.moments.map((x,i)=>'<div class="moment t'+(i%3)+'"><span class="em">'+esc(x.emoji)+'</span><span>'+esc(x.label)+'</span></div>').join('')+'</div><label for="momentLabel">Moment label</label><div class="inputrow"><input id="momentLabel" placeholder="Sunset sail, day 3"><button class="btn ghost" onclick="addMoment()">'+ic('plus')+'Add</button></div></section>';
  }

  if(view==='calendar'){
    h+=pageHead('When are we free?','Six weeks of everyone’s calendars, layered. Green means pack your bags.','Calendars');
    const dows=['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>'<div class="dow">'+d+'</div>').join('');
    let days='';for(let k=0;k<today.getDay();k++)days+='<div class="day pad" aria-hidden="true"></div>';
    for(let n=0;n<42;n++){const d=addD(today,n);const freeCount=m.filter(p=>!isBusy(p.id,d)).length;const cls=freeCount===m.length?'free':freeCount===0?'busy':'partial';
      const lbl=cls==='free'?'Free':cls==='busy'?'Busy':freeCount+'/'+m.length;
      days+='<div class="day '+cls+(n===0?' today':'')+'" title="'+fmt(d)+': '+(cls==='free'?'everyone free':cls==='busy'?'everyone busy':freeCount+' of '+m.length+' free')+'"><b>'+new Date(d+'T12:00:00').getDate()+'</b><span>'+lbl+'</span></div>'}
    h+='<section class="card">'+sh('calendar','Group overlap')+'<p class="muted">For '+m.map(p=>esc(p.code)).join(' · ')+'</p><div class="legend"><span><i class="free"></i>Everyone free</span><span><i class="partial"></i>Some free</span><span><i class="busy"></i>All busy</span></div><div class="cal">'+dows+days+'</div></section>';
    h+='<div class="grid g2 mt"><section class="card">'+sh('plus','Add busy time for '+esc(me().code))+'<div class="grid g2 tight"><div><label for="busyStart">Start</label><input type="date" id="busyStart"></div><div><label for="busyEnd">End</label><input type="date" id="busyEnd"></div></div><label for="busyLabel">Label</label><input id="busyLabel" placeholder="Work, family, pet sitting…"><div class="actions"><button class="btn primary" onclick="addBusy()">Save busy block</button></div>'
      +'<div class="divider"></div><label for="icsFile">Upload calendar (.ics)</label><label class="file" for="icsFile">'+ic('upload')+'<span>Choose an .ics file</span><input id="icsFile" type="file" accept=".ics,text/calendar" onchange="handleICS(event)"></label><p class="muted">Export from Google or Apple Calendar as .ics — we parse busy events right here in your browser.</p>'
      +'<label for="pasteBox">Paste availability</label><textarea id="pasteBox" rows="3" placeholder="Paste text with busy dates like 2026-12-05 …"></textarea><div class="actions"><button class="btn ghost" onclick="pasteAvail()">Add pasted busy dates</button></div>'
      +'<p class="note">'+ic('plug','sm')+'Coming soon: direct Google & Apple Calendar sync.</p></section>'
      +'<section class="card">'+sh('ban',esc(me().code)+'’s busy blocks')+((S.busy[S.me]||[]).length?'<div class="list">'+S.busy[S.me].map(b=>'<div class="li row-li"><div><b>'+esc(b.label)+'</b><span class="muted">'+fmtR(b.start,b.end)+'</span></div><button class="iconbtn" aria-label="Remove '+esc(b.label)+'" onclick="delBusy(\''+b.id+'\')">'+ic('trash')+'</button></div>').join('')+'</div>':emptyState('Wide open','No busy blocks yet. Your calendar is all horizon.'))+'</section></div>';
  }

  if(view==='wishlist'){
    h+=pageHead('Wishlist & votes','Dream out loud: stays, bites, places and add-ins. Then vote with your thumbs.','Wishlist');
    h+='<section class="card">'+sh('plus','Add a little dream')+'<div class="grid g2 tight"><div><label for="itKind">Type</label><select id="itKind"><option>Destination</option><option>Hotel / Airbnb</option><option>Restaurant</option><option>Activity / add-in</option></select></div><div><label for="itName">Name</label><input id="itName" placeholder="Overwater bungalow, taco tour…"></div><div><label for="itPlace">Place</label><input id="itPlace" placeholder="Aruba"></div><div><label for="itBudget">Budget ($ per person / night)</label><input id="itBudget" type="number" placeholder="200"></div></div><label for="itVibes">Vibe tags (comma separated)</label><input id="itVibes" placeholder="beach, spa, sunset"><div class="actions"><button class="btn sun" onclick="addItem()">'+ic('plus')+'Add to wishlist</button></div></section>';
    h+=(S.items.length?'':'<div class="mt">'+emptyState('Your wishlist is a blank postcard','Add the first place, stay or bite you’re dreaming about.')+'</div>')+'<div class="grid g2 mt">'+S.items.map(it=>'<article class="card item"><div class="biz"><div class="avatar">'+(it.kind==='Destination'?'🏝️':it.kind==='Restaurant'?'🍽️':it.kind.startsWith('Hotel')?'🏨':'🤿')+'</div><div class="bizbody"><span class="eyebrow">'+esc(it.kind)+'</span><h3>'+esc(it.name)+'</h3><div class="meta">'+(it.place?'<span>'+ic('pin','sm')+esc(it.place)+'</span>':'')+'<span>$'+esc(it.budget)+'</span><span>by '+esc(person(it.by).code)+'</span></div></div></div>'
      +(it.vibes.length?'<div class="chips sm">'+it.vibes.map(v=>'<span class="tag">'+esc(v)+'</span>').join('')+'</div>':'')+voteRow(it)+'<div class="social">'+reactionsHTML('item',it)+commentsHTML('item',it)+'</div></article>').join('')+'</div>';
  }

  if(view==='comfort'){
    const fields=COMFORT_FIELDS;
    const addins=['Spa','Excursions','Rental car','Childcare','Pet care','Airport lounge','Travel insurance'];
    const mine=S.prefs[S.me];
    h+=pageHead('Comfort check','The little things that make a trip feel easy. Answering as <b>'+esc(me().code)+'</b>; switch “Acting as” to fill in each person’s, just like The Roster.','Comfort');
    h+='<section class="card"><div class="prefs">'
      +fields.map(f=>'<div class="pref"><div class="plabel">'+f[1]+'</div><div class="chips">'+f[2].map(o=>'<button class="chip '+(mine[f[0]]===o?'on':'')+'" aria-pressed="'+(mine[f[0]]===o)+'" onclick="setPref(\''+f[0]+'\',\''+esc(o).replace(/'/g,"\\'")+'\')">'+esc(o)+'</button>').join('')+'</div></div>').join('')
      +'<div class="pref"><div class="plabel">Add-ins I want</div><div class="chips">'+addins.map(a=>{const on=mine.addins.includes(a);return '<button class="chip gold '+(on?'on':'')+'" aria-pressed="'+on+'" onclick="toggleAddin(\''+a+'\')">'+(on?ic('check','sm'):'')+a+'</button>'}).join('')+'</div></div></div></section>';
    const diffs=[];fields.forEach(f=>{const vals=[...new Set(m.map(p=>S.prefs[p.id][f[0]]))];if(vals.length>1)diffs.push('<div class="li"><b>'+f[1]+'</b><span class="muted">'+m.map(p=>esc(p.code)+': '+esc(S.prefs[p.id][f[0]])).join(' · ')+'</span></div>')});
    const addDiff=(()=>{const all=[...new Set(m.flatMap(p=>S.prefs[p.id].addins))];return all.filter(a=>!m.every(p=>S.prefs[p.id].addins.includes(a))).map(a=>'<div class="li"><b>Add-in: '+esc(a)+'</b><span class="muted">Wanted by '+m.filter(p=>S.prefs[p.id].addins.includes(a)).map(p=>esc(p.code)).join(', ')+'</span></div>').join('')})();
    const agree=fields.filter(f=>new Set(m.map(p=>S.prefs[p.id][f[0]])).size===1);
    h+='<div class="grid g2 mt"><section class="card">'+sh('heart','To talk about','<span class="count">'+(diffs.length+(addDiff?addDiff.split('class="li"').length-1:0))+'</span>')+'<p class="muted">'+(diffs.length||addDiff?'A few things to settle over a beach drink 🍹':'You’re beautifully in sync — book the trip! 🌴')+'</p><div class="list">'+diffs.join('')+addDiff+'</div></section>'
      +'<section class="card">'+sh('check','Where you already agree','<span class="count">'+agree.length+'</span>')+(agree.length?'<div class="list">'+agree.map(f=>'<div class="li"><b>'+f[1]+'</b><span class="muted">'+esc(S.prefs[m[0].id][f[0]])+'</span></div>').join('')+'</div>':emptyState('Nothing matched yet','Pick a few answers each and your common ground shows up here.'))+'</section></div>';
  }

  if(view==='deals'){
    h+=pageHead('Flight finder','Tell us where the sun is calling. We’ll surface sample deals; live fares arrive once a flight API is connected (see README).','Flights');
    h+='<section class="card">'+sh('search','New finder')+'<div class="grid g2 tight"><div><label for="fOrigin">From</label><input id="fOrigin" placeholder="Home airport (e.g. DEN)"></div><div><label for="fDest">To</label><input id="fDest" placeholder="Anywhere warm, or Aruba"></div><div><label for="fMax">Max price ($)</label><input id="fMax" type="number" value="1200"></div><div><label for="fWindow">Date window</label><select id="fWindow"><option>Next 3 months</option><option>Next 6 months</option><option>School holidays</option></select></div><div><label for="fDays">Min trip days</label><input id="fDays" type="number" value="5"></div></div><div class="actions"><button class="btn sun" onclick="findDeals()">'+ic('search')+'Find deals</button><button class="btn ghost" onclick="addFinder()">'+ic('bell')+'Save alert</button></div>'
      +'<div class="divider"></div><div class="plabel">Your alerts</div><div class="list">'+S.finders.map(f=>'<div class="li row-li"><div><b>'+esc(f.origin)+' → '+esc(f.dest)+'</b><span class="muted">Under $'+esc(f.max)+' · '+esc(f.window)+' · '+esc(f.days)+'+ days</span></div>'+ic('bell','muted-ic')+'</div>').join('')+'</div></section>';
    h+='<div class="deals mt">'+S.deals.map(d=>'<article class="card deal"><div class="ihead"><span class="eyebrow">'+ic('plane','sm')+'Sample deal</span>'+(/Well under/.test(d.note)?'<span class="tag hot">Great price</span>':'')+'</div><h3>'+esc(d.dest)+'</h3><div class="kpi">'+(d.price?'$'+esc(d.price):'—')+'</div><div class="meta col"><span>From '+esc(d.from)+'</span><span>'+esc(d.dates)+'</span></div><p class="muted">'+esc(d.note.replace(/^🔥 /,''))+'</p></article>').join('')+'</div>';
    h+='<section class="card mt">'+sh('list','Itinerary stubs')+'<div class="list">'+S.itinerary.map(i=>'<div class="li"><b>'+esc(i.title)+'</b><span class="muted">'+esc(i.detail)+'</span></div>').join('')+'</div></section>';
  }

  if(view==='crew'){
    h+=pageHead('My Travel Crew','Your favourite people: code names, travel styles, past trips and what makes them comfy.','Crew');
    h+='<div class="grid g2">'+S.people.map(p=>{const on=S.trip.memberIds.includes(p.id);return '<article class="card person '+(on?'ontrip':'')+'"><div class="biz"><div class="avatar">'+esc(p.emoji)+'</div><div class="bizbody">'+(on?'<span class="eyebrow gold">'+ic('check','sm')+'On this trip</span>':'<span class="eyebrow">Travel crew</span>')+'<h3>'+esc(p.code)+'</h3><div class="sub">'+esc(p.name)+'</div></div></div>'
      +'<p class="style">“'+esc(p.style)+'”</p><div class="chips sm">'+p.tags.map(t=>'<span class="tag tq">'+esc(t)+'</span>').join('')+'</div>'
      +'<dl class="facts"><div><dt>Past trips</dt><dd>'+esc(p.past)+'</dd></div><div><dt>Comfort</dt><dd>'+esc(S.prefs[p.id].room)+' · '+esc(S.prefs[p.id].pace)+' · '+esc(S.prefs[p.id].split)+'</dd></div></dl>'
      +'<div class="actions"><button class="btn '+(on?'ghost':'primary')+' small" onclick="toggleMember(\''+p.id+'\')">'+(on?ic('x')+'Remove':ic('plus')+'Add to trip')+'</button><button class="btn ghost small" onclick="setMe(\''+p.id+'\');setView(\'comfort\')">'+ic('bed')+'View comfort</button></div></article>'}).join('')+'</div>';
  }

  h+='<footer class="demo"><div>'+ic('info')+'<span><b>Demo mode.</b> Everything stays in this browser. Switch “Acting as” to play each side; the Firebase setup in the README turns on real invite-only sharing.</span></div><div class="actions"><button class="btn ghost small" onclick="loadSample()">Load sample data</button><button class="btn ghost small" onclick="resetDemo()">'+ic('refresh')+'Reset demo</button></div></footer>';
  h+='</div></main></div><nav class="bottombar" aria-label="Main">'+TABS.map(t=>'<button class="'+(view===t[0]?'on':'')+'" '+(view===t[0]?'aria-current="page" ':'')+'onclick="setView(\''+t[0]+'\')"><span class="bi">'+ic(t[3])+'</span><span>'+t[2]+'</span></button>').join('')+'</nav>';
  $('#app').innerHTML=h;
  // hash invite prefill
  if(location.hash.startsWith('#join=')){$('#joinCode')&&( $('#joinCode').value=location.hash.slice(6) )}
}
save();render();
// if no proposals/deals on first load, make the demo feel alive
if(!S.proposals.length){window.genProposals();window.findDeals(1);}
