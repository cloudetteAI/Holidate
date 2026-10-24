/* Aira — Holidate's in-app trip helper.
 *
 * SECURITY DESIGN (read me first)
 *  - 100% local. Aira is a small rule-based helper that reads the trip data already in this
 *    browser. She makes NO network calls, uses NO API keys, and nothing you type leaves the device.
 *  - No innerHTML for messages. Every chat bubble is built with createElement + textContent, so
 *    text from you, your crew, or wishlist names can never turn into markup or script.
 *  - Input is trimmed, stripped of control characters and capped at MAX_LEN characters.
 *  - History is kept per trip in localStorage (capped), re-validated on load, and has a Clear button.
 *
 * WHY THERE IS NO LLM (YET)
 *  Holidate is a public static site on GitHub Pages: anything shipped here, including an API key,
 *  is readable by anyone who opens DevTools. The safe path is Firebase AI Logic (Gemini) called
 *  through the Firebase SDK with App Check (proves the request comes from the real app) plus Auth
 *  and quotas, so no secret ever lives in this file. When that exists, swap ONE thing:
 *      aira.backend = { respond: (msg, ctx) => geminiRespond(msg, ctx) }  // must return the same reply shape
 *  and keep sending only the minimal context from buildContext() (code names, no invite codes).
 */
(function(){
'use strict';
const MAX_LEN=280, MAX_HISTORY=40, MAX_TRIPS=10, STORE='holidate_aira_v1';
const SUGGESTIONS=['When are we all free?','What do we all love?','Any comfort clashes?','Best deal right now?','Plan a 4-day itinerary','Who hasn’t voted?'];
const VIEWS={home:'Trip home',calendar:'Calendars',wishlist:'Wishlist',comfort:'Comfort check',deals:'Flight finder',crew:'Travel Crew'};

/* ---------- context: a read-only snapshot of only what Aira needs ---------- */
function buildContext(){
  const m=members();
  const day0=new Date(today);
  const freeRuns=[];let run=null;
  for(let n=1;n<=60;n++){const d=addD(day0,n);
    if(allFree(d)){if(!run)run={start:d,end:d,len:0};run.end=d;run.len++}
    else if(run){freeRuns.push(run);run=null}}
  if(run)freeRuns.push(run);
  return {
    tripId:S.trip.id, tripName:S.trip.name, me:me().code,
    members:m.map(p=>({id:p.id,code:p.code,style:p.style})),
    freeRuns,
    items:S.items.map(i=>({kind:i.kind,name:i.name,place:i.place,budget:i.budget,votes:{...i.votes}})),
    proposals:S.proposals.map(p=>({title:p.title,start:p.start,end:p.end,price:p.price,votes:{...p.votes},status:p.status})),
    prefs:Object.fromEntries(m.map(p=>[p.id,{...S.prefs[p.id],addins:[...(S.prefs[p.id]?.addins||[])]}])),
    deals:S.deals.filter(d=>d.price>0).map(d=>({dest:d.dest,price:d.price,dates:d.dates,from:d.from}))
  };
}

/* ---------- the local "brain": keyword intents over the context ---------- */
const names=(arr)=>arr.length<=1?arr.join(''):arr.slice(0,-1).join(', ')+' and '+arr[arr.length-1];
const lovedBy=(ctx,i)=>ctx.members.every(p=>i.votes[p.id]===1);
const wd=d=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});

const answers={
  greet(ctx){return{text:'Hi '+ctx.me+' ✨ I’m Aira, your trip concierge for “'+ctx.tripName+'”. I read your calendars, wishlist, comfort answers and deals, right here on this device. What shall we sort out?',chips:SUGGESTIONS}},
  help(){return{text:'Here’s what I’m good at:',bullets:['Finding dates you’re all free','Spotting what everyone loves','Flagging comfort clashes, gently','Picking the best sample flight deal','Sketching a 2–7 day itinerary','Nudging whoever hasn’t voted'],chips:SUGGESTIONS}},
  free(ctx){
    const runs=ctx.freeRuns.filter(r=>r.len>=3);
    if(!runs.length)return{text:'Hmm, there’s no stretch of 3+ days where everyone’s free in the next two months. Try trimming a busy block or two.',actions:[{label:'Open calendars',view:'calendar'}]};
    const best=[...runs].sort((a,b)=>b.len-a.len)[0];
    return{text:'Good news: you’re all free on these stretches in the next two months. The longest is '+fmtR(best.start,best.end)+' ('+best.len+' days). That one has getaway written all over it.',bullets:runs.slice(0,4).map(r=>fmtR(r.start,r.end)+' · '+r.len+' days'),actions:[{label:'Open calendars',view:'calendar'}]};
  },
  love(ctx){
    const loved=ctx.items.filter(i=>lovedBy(ctx,i));
    const almost=ctx.items.filter(i=>!lovedBy(ctx,i)&&ctx.members.filter(p=>i.votes[p.id]===1).length===ctx.members.length-1&&ctx.members.length>1);
    if(!loved.length)return{text:'Nothing has a unanimous thumbs-up yet.'+(almost.length?' So close on '+names(almost.map(i=>i.name))+' though.':''),actions:[{label:'Go vote',view:'wishlist'}]};
    return{text:'Everyone on this trip loves these:',bullets:loved.map(i=>i.name+(i.place&&i.place!==i.name?' · '+i.place:'')+' ('+i.kind.toLowerCase()+')'),...(almost.length?{after:'Almost there: '+names(almost.map(i=>i.name))+'. One more thumbs-up each.'}:{}),actions:[{label:'Open wishlist',view:'wishlist'}]};
  },
  comfort(ctx){
    const tips={room:'A suite with a separate bedroom keeps everyone happy.',split:'Decide this before booking. It saves a very awkward dinner.',flight:'Book the flight first and plan around it.',seat:'Check in together and trade seats on the way back.',pace:'Alternate a packed day with a slow one.',nightlife:'One big night, the rest golden-hour drinks?',food:'Book two great dinners, keep the rest casual.'};
    const clashes=[];
    COMFORT_FIELDS.forEach(f=>{const vals=ctx.members.map(p=>ctx.prefs[p.id]?.[f[0]]);if(new Set(vals).size>1)clashes.push(f[1]+': '+ctx.members.map((p,k)=>p.code+' → '+vals[k]).join(', ')+'. '+(tips[f[0]]||''))});
    const all=[...new Set(ctx.members.flatMap(p=>ctx.prefs[p.id]?.addins||[]))];
    const split=all.filter(a=>!ctx.members.every(p=>(ctx.prefs[p.id]?.addins||[]).includes(a)));
    split.forEach(a=>clashes.push('Add-in “'+a+'”: wanted by '+names(ctx.members.filter(p=>(ctx.prefs[p.id]?.addins||[]).includes(a)).map(p=>p.code))+'.'));
    if(!clashes.length)return{text:'No clashes at all. You two are beautifully in sync 💛',actions:[{label:'Comfort check',view:'comfort'}]};
    return{text:clashes.length+' little things to settle, ideally over a beach drink:',bullets:clashes.slice(0,8),actions:[{label:'Comfort check',view:'comfort'}]};
  },
  deal(ctx){
    if(!ctx.deals.length)return{text:'No deals yet. Set a finder and tap Find deals, and I’ll pick the best one.',actions:[{label:'Flight finder',view:'deals'}]};
    const best=[...ctx.deals].sort((a,b)=>a.price-b.price)[0];
    const lovedPlaces=ctx.items.filter(i=>i.kind==='Destination'&&lovedBy(ctx,i)).map(i=>i.name.split(',')[0].toLowerCase());
    const loved=ctx.deals.filter(d=>lovedPlaces.some(p=>d.dest.toLowerCase().includes(p))).sort((a,b)=>a.price-b.price)[0];
    return{text:'Cheapest right now: '+best.dest+' at $'+best.price+' from '+best.from+' ('+best.dates+').',...(loved&&loved!==best?{after:'But the one you all love: '+loved.dest+' at $'+loved.price+' ('+loved.dates+'). Worth the splurge?'}:{}),note:'Sample fares. Live prices need a flight API.',actions:[{label:'See all deals',view:'deals'}]};
  },
  plan(ctx,msg){
    const n=Math.min(7,Math.max(2,+((msg.match(/(\d+)\s*-?\s*(day|night)/i)||[])[1])||4));
    const dest=ctx.items.find(i=>i.kind==='Destination'&&lovedBy(ctx,i))||ctx.items.find(i=>i.kind==='Destination');
    if(!dest)return{text:'Add a destination to the wishlist first, then I’ll sketch the days.',actions:[{label:'Open wishlist',view:'wishlist'}]};
    const place=(dest.name.split(',')[0]).toLowerCase();
    const here=ctx.items.filter(i=>i.kind!=='Destination'&&(i.place||'').toLowerCase().includes(place)&&ctx.members.every(p=>i.votes[p.id]!==-1));
    const stay=here.find(i=>i.kind.startsWith('Hotel')),food=here.find(i=>i.kind==='Restaurant'),acts=here.filter(i=>i.kind.startsWith('Activity'));
    const win=ctx.freeRuns.find(r=>r.len>=n)||ctx.freeRuns[0];
    const start=win?win.start:addD(today,21);
    const addins=[...new Set(ctx.members.flatMap(p=>ctx.prefs[p.id]?.addins||[]))];
    const myPrefs=ctx.prefs[ctx.members[0]?.id]||{};
    const middle=[...acts.map(a=>a.name),addins.includes('Spa')?'Spa afternoon, then a slow sunset swim':null,addins.includes('Excursions')?'Island excursion (book a small-group one)':null,addins.includes('Rental car')?'Rental-car day: hidden beaches and a roadside lunch':null,'Beach club day, nothing on the schedule','Market morning and a long lunch'].filter(Boolean);
    const days=[];
    for(let k=0;k<n;k++){const d=wd(addD(new Date(start+'T12:00:00'),k));let t;
      if(k===0)t=(myPrefs.flight&&/Morning|Afternoon|Evening/.test(myPrefs.flight)?myPrefs.flight+' flight in':'Fly in')+', check in to '+(stay?stay.name:'your stay')+', then '+(food?food.name:'a golden-hour dinner by the water');
      else if(k===n-1)t='Slow brunch, one last swim, fly home glowing';
      else t=middle[(k-1)%middle.length]+(k===1&&myPrefs.nightlife?' · evening: '+myPrefs.nightlife.toLowerCase():'');
      days.push('Day '+(k+1)+' · '+d+': '+t)}
    return{text:'Here’s a '+n+'-day sketch for '+dest.name+(win?', in your free window starting '+fmt(start):'')+':',bullets:days,after:'Built from your wishlist and comfort answers. Tweak anything, it’s yours.',actions:[{label:'Proposed getaways',view:'home'}]};
  },
  vote(ctx){
    const lines=[];
    ctx.members.forEach(p=>{
      const items=ctx.items.filter(i=>i.votes[p.id]===undefined).map(i=>i.name);
      const maybes=ctx.items.filter(i=>i.votes[p.id]===0).map(i=>i.name);
      const props=ctx.proposals.filter(x=>!x.votes[p.id]).map(x=>x.title);
      const bits=[];if(items.length)bits.push('wishlist: '+names(items));if(props.length)bits.push('proposals: '+names(props));if(maybes.length)bits.push('still “maybe” on '+names(maybes));
      if(bits.length)lines.push(p.code+' · '+bits.join(' · '))});
    if(!lines.length)return{text:'Everyone’s voted on everything. Look at you, organised queens 👑'};
    return{text:'A gentle nudge list:',bullets:lines,actions:[{label:'Open wishlist',view:'wishlist'},{label:'Proposals',view:'home'}]};
  },
  budget(ctx){
    const dests=ctx.items.filter(i=>i.kind==='Destination'&&i.budget);
    if(!dests.length)return{text:'No budgets on the wishlist yet. Add one to a destination and I’ll compare.'};
    const loved=dests.filter(i=>lovedBy(ctx,i));
    const pick=(loved.length?loved:dests).sort((a,b)=>a.budget-b.budget);
    return{text:(loved.length?'Of the places you all love, ':'Across your destinations, ')+'estimates run from $'+pick[0].budget+' ('+pick[0].name+') to $'+pick[pick.length-1].budget+' ('+pick[pick.length-1].name+') per person.',after:'Split style: '+names([...new Set(ctx.members.map(p=>ctx.prefs[p.id]?.split).filter(Boolean))])+'.'};
  },
  who(ctx){return{text:'On “'+ctx.tripName+'”: ',bullets:ctx.members.map(p=>p.code+' · '+p.style),actions:[{label:'Travel Crew',view:'crew'}]}},
  thanks(){return{text:'Anytime 💛 Go have the best trip.'}},
  fallback(){return{text:'I didn’t quite catch that. I’m a local helper, so I stick to your trip’s dates, wishlist, comfort answers and deals. Try one of these:',chips:SUGGESTIONS}}
};
// Ordered: the first matching intent wins.
const INTENTS=[
  ['thanks',/\b(thanks|thank you|ty|love you)\b/i],
  ['vote',/\b(vote[ds]?|voting|hasn.?t|haven.?t|undecided|maybe)\b/i],
  ['plan',/\b(plan|itinerar\w*|schedule|day[- ]by[- ]day|\d+\s*-?\s*(day|night)s?)\b/i],
  ['deal',/\b(deals?|flights?|fares?|cheap\w*|plane|airfare)\b/i],
  ['comfort',/\b(comfort|clash\w*|disagree\w*|conflict\w*|room|split|seat|pace|nightlife)\b/i],
  ['budget',/\b(budget|cost|price|spend|afford|expensive|\$)\b/i],
  ['love',/\b(love[ds]?|agree|favou?rites?|like|wishlist|match(es)?)\b/i],
  ['free',/\b(free|when|dates?|available|availability|overlap|calendar|weekend)\b/i],
  ['who',/\b(who.?s (on|coming|going)|crew|members?|travel(l)?ers)\b/i],
  ['help',/\b(help|what can you|how do)\b/i],
  ['greet',/^\s*(hi|hey|hello|hiya|yo|good (morning|afternoon|evening))\b/i]
];
const local={respond(msg,ctx){const hit=INTENTS.find(([,re])=>re.test(msg));return (answers[hit?hit[0]:'fallback'])(ctx,msg)}};

/* ---------- the one swap point ---------- */
const aira={
  backend:local,
  async respond(msg,ctx){return this.backend.respond(msg,ctx)}
};
window.aira=aira;

/* ---------- history (per trip, validated on load) ---------- */
const clean=(t,max=MAX_LEN*4)=>String(t??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').slice(0,max);
function loadAll(){try{const raw=JSON.parse(localStorage.getItem(STORE));return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{}}catch(e){return{}}}
function sanitizeMsg(x){if(!x||typeof x!=='object')return null;const role=x.role==='user'?'user':'aira';
  const out={role,text:clean(x.text)};
  ['bullets','chips'].forEach(k=>{if(Array.isArray(x[k]))out[k]=x[k].slice(0,10).map(v=>clean(v,400))});
  ['after','note'].forEach(k=>{if(typeof x[k]==='string')out[k]=clean(x[k],400)});
  if(Array.isArray(x.actions))out.actions=x.actions.filter(a=>a&&VIEWS[a.view]).slice(0,3).map(a=>({label:clean(a.label,40),view:a.view}));
  return out}
function getHistory(tripId){const all=loadAll();return Array.isArray(all[tripId])?all[tripId].map(sanitizeMsg).filter(Boolean).slice(-MAX_HISTORY):[]}
function setHistory(tripId,list){const all=loadAll();delete all[tripId];all[tripId]=list.slice(-MAX_HISTORY);
  const keys=Object.keys(all);keys.slice(0,Math.max(0,keys.length-MAX_TRIPS)).forEach(k=>delete all[k]);
  try{localStorage.setItem(STORE,JSON.stringify(all))}catch(e){}}

/* ---------- UI (static shell markup only; messages are DOM + textContent) ---------- */
const root=document.getElementById('aira-root');
root.innerHTML='<button type="button" class="aira-fab" aria-haspopup="dialog" aria-expanded="false" aria-controls="aira-panel" aria-label="Ask Aira, your trip helper">'+AIRA_AVATAR+'<span class="aira-fab-label">Ask Aira</span></button>'
 +'<section id="aira-panel" class="aira-panel" role="dialog" aria-modal="false" aria-labelledby="aira-title" aria-describedby="aira-fine" hidden>'
 +'<header class="aira-head">'+AIRA_AVATAR+'<div class="aira-id"><h2 id="aira-title">Aira</h2><span>Trip concierge · on this device</span></div>'
 +'<button type="button" class="iconbtn aira-clear" aria-label="Clear chat">'+ic('trash')+'</button><button type="button" class="iconbtn aira-close" aria-label="Close Aira">'+ic('x')+'</button></header>'
 +'<div class="aira-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation with Aira" tabindex="0"></div>'
 +'<form class="aira-form" autocomplete="off"><label class="sr-only" for="aira-input">Message Aira</label><input id="aira-input" type="text" maxlength="'+MAX_LEN+'" placeholder="Ask about dates, deals, vibes…" enterkeyhint="send"><button type="submit" class="aira-send" aria-label="Send">'+ic('send')+'</button></form>'
 +'<p id="aira-fine" class="aira-fine">'+ic('lock','sm')+'Aira answers from this trip’s data in your browser. Nothing you type is sent anywhere.</p></section>';
const fab=root.querySelector('.aira-fab'),panel=root.querySelector('#aira-panel'),logEl=root.querySelector('.aira-log'),form=root.querySelector('.aira-form'),input=root.querySelector('#aira-input');
let history=[],tripId=null,busy=false;

function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function bubble(msg){
  const row=el('div','aira-msg '+msg.role);
  if(msg.role==='aira'){const av=el('span','aira-msg-av');av.innerHTML=AIRA_AVATAR;row.appendChild(av)} // constant SVG, no data
  const b=el('div','aira-bubble');
  const who=el('span','sr-only',msg.role==='user'?'You said: ':'Aira: ');b.appendChild(who);
  b.appendChild(el('p',null,msg.text));
  if(msg.bullets&&msg.bullets.length){const ul=el('ul');msg.bullets.forEach(t=>ul.appendChild(el('li',null,t)));b.appendChild(ul)}
  if(msg.after)b.appendChild(el('p',null,msg.after));
  if(msg.note)b.appendChild(el('p','aira-note',msg.note));
  if(msg.actions&&msg.actions.length){const a=el('div','aira-actions');msg.actions.forEach(x=>{const btn=el('button','aira-link',x.label+' →');btn.type='button';btn.addEventListener('click',()=>{setView(x.view);if(matchMedia('(max-width:959px)').matches)close()});a.appendChild(btn)});b.appendChild(a)}
  row.appendChild(b);
  if(msg.chips&&msg.chips.length){const wrap=el('div','aira-chips');msg.chips.forEach(c=>{const btn=el('button','chip',c);btn.type='button';btn.addEventListener('click',()=>send(c));wrap.appendChild(btn)});row.appendChild(wrap)}
  return row}
function paint(){logEl.replaceChildren(...history.map(bubble));logEl.scrollTop=logEl.scrollHeight}
function sync(){if(S.trip.id!==tripId){tripId=S.trip.id;history=getHistory(tripId);if(!history.length)history=[{role:'aira',...answers.greet(buildContext())}];paint()}}
function push(msg){history.push(msg);history=history.slice(-MAX_HISTORY);setHistory(tripId,history);logEl.appendChild(bubble(msg));logEl.scrollTop=logEl.scrollHeight}
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

async function send(raw){
  if(busy)return;sync();
  const text=clean(raw,MAX_LEN).trim();if(!text)return;
  busy=true;input.value='';
  push({role:'user',text});
  const typing=el('div','aira-typing');typing.setAttribute('aria-hidden','true');typing.append(el('i'),el('i'),el('i'));logEl.appendChild(typing);logEl.scrollTop=logEl.scrollHeight;
  let reply;
  try{reply=sanitizeMsg({role:'aira',...await aira.respond(text,buildContext())})}
  catch(e){reply={role:'aira',text:'Something went sideways on my end. Mind asking that another way?'}}
  await new Promise(r=>setTimeout(r,reduced()?0:420));
  typing.remove();push(reply);busy=false;input.focus();
}
function open(){sync();panel.hidden=false;fab.setAttribute('aria-expanded','true');document.body.classList.add('aira-open');logEl.scrollTop=logEl.scrollHeight;input.focus()}
function close(){panel.hidden=true;fab.setAttribute('aria-expanded','false');document.body.classList.remove('aira-open');fab.focus()}
fab.addEventListener('click',()=>panel.hidden?open():close());
root.querySelector('.aira-close').addEventListener('click',close);
root.querySelector('.aira-clear').addEventListener('click',()=>{sync();history=[{role:'aira',...answers.greet(buildContext())}];setHistory(tripId,[]);paint();input.focus()});
form.addEventListener('submit',e=>{e.preventDefault();send(input.value)});
panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
window.openAira=open;
})();
