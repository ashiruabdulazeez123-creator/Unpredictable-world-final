const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const money=n=>"$"+n.toFixed(2);

const PRODUCTS=[
{id:1,n:"Gravity Boots",c:"Wear",p:129,e:"🥾",r:4.8,d:"Cushioned boots with a floating sole. Waterproof and ready for any dimension."},
{id:2,n:"Nebula Hoodie",c:"Wear",p:79,e:"🧥",r:4.6,d:"Heavyweight organic cotton hoodie with a colour-shifting galaxy print."},
{id:3,n:"Quantum Cap",c:"Wear",p:34,e:"🧢",r:4.3,d:"Adjustable cap with a reflective stitched logo that glows under light."},
{id:4,n:"Aurora Lamp",c:"Home",p:89,e:"💡",r:4.9,d:"Touch-controlled mood lamp with 16 million colours and a soft glow."},
{id:5,n:"Orbit Mug",c:"Home",p:24,e:"☕",r:4.5,d:"Double-walled ceramic mug that keeps drinks hot for three hours."},
{id:6,n:"Cosmic Blanket",c:"Home",p:99,e:"🛏️",r:4.7,d:"Ultra-soft fleece throw printed with a deep-space star map."},
{id:7,n:"Pulse Earbuds",c:"Tech",p:149,e:"🎧",r:4.7,d:"Noise-cancelling wireless earbuds with 30 hours of battery life."},
{id:8,n:"Warp Charger",c:"Tech",p:59,e:"🔋",r:4.4,d:"65W fast charger that powers a phone and laptop at the same time."},
{id:9,n:"Hologram Speaker",c:"Tech",p:119,e:"🔊",r:4.6,d:"360° speaker with reactive light show and 12 hours of playtime."},
{id:10,n:"Stellar Backpack",c:"Gear",p:109,e:"🎒",r:4.8,d:"Weatherproof 28L pack with a hidden pocket and padded laptop sleeve."},
{id:11,n:"Void Bottle",c:"Gear",p:39,e:"🧴",r:4.5,d:"Insulated steel bottle: cold for 24 hours, hot for 12."},
{id:12,n:"Compass Watch",c:"Gear",p:179,e:"⌚",r:4.9,d:"Rugged smartwatch with GPS, compass and a 10-day battery."}
];
const WORLDS=[
{n:"Deep Blue",m:"stars",b1:"#020b2a",b2:"#0a2a6b",ac:"#4fc3ff"},
{n:"Purple Nebula",m:"bubbles",b1:"#12002b",b2:"#4b1189",ac:"#d58bff"},
{n:"Green Matrix",m:"matrix",b1:"#000d04",b2:"#02351a",ac:"#3dff8a"},
{n:"Ember Storm",m:"embers",b1:"#1a0500",b2:"#6b1b00",ac:"#ffa13d"},
{n:"Ocean Pulse",m:"rings",b1:"#001a24",b2:"#005b73",ac:"#5ef2ff"}
];
const state={cart:store.get("pg_cart",{}),wish:store.get("pg_wish",[]),cat:"All",q:"",sort:"",promo:store.get("pg_promo",""),world:store.get("pg_world",-1)};
const save=()=>{store.set("pg_cart",state.cart);store.set("pg_wish",state.wish);store.set("pg_promo",state.promo)};

function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2400)}

/* worlds */
function setWorld(i){
  const w=WORLDS[i],r=document.documentElement.style;
  r.setProperty("--b1",w.b1);r.setProperty("--b2",w.b2);r.setProperty("--ac",w.ac);
  $("#worldName").textContent="Now visiting: "+w.n;FX.set(w.m,w.ac);
  state.world=i;store.set("pg_world",i);
}
function warp(){
  let i;do{i=Math.random()*WORLDS.length|0}while(i===state.world);
  setWorld(i);toast("Dimension: "+WORLDS[i].n);
}

/* products */
const stars=r=>"★".repeat(Math.round(r))+"☆".repeat(5-Math.round(r));
function visible(){
  let l=PRODUCTS.filter(p=>(state.cat==="All"||p.c===state.cat)&&(p.n+p.c+p.d).toLowerCase().includes(state.q));
  if(state.sort==="lo")l.sort((a,b)=>a.p-b.p);
  if(state.sort==="hi")l.sort((a,b)=>b.p-a.p);
  if(state.sort==="rate")l.sort((a,b)=>b.r-a.r);
  return l;
}
function renderChips(){
  const cats=["All",...new Set(PRODUCTS.map(p=>p.c))];
  $("#chips").innerHTML=cats.map(c=>`<button class="chip ${c===state.cat?"on":""}" data-c="${c}">${c}</button>`).join("");
}
function renderGrid(){
  const l=visible();
  $("#grid").innerHTML=l.map(p=>`<div class="card" data-id="${p.id}">
    <button class="heart ${state.wish.includes(p.id)?"on":""}" data-w="${p.id}" aria-label="Wishlist">${state.wish.includes(p.id)?"♥":"♡"}</button>
    <div class="thumb">${p.e}</div>
    <div class="info"><h3>${p.n}</h3>
    <div class="meta"><span class="price">${money(p.p)}</span><span title="${p.r}">${stars(p.r)}</span></div>
    <button class="btn" data-add="${p.id}">Add to cart</button></div></div>`).join("");
  $("#empty").hidden=l.length>0;
}
function openModal(id){
  const p=PRODUCTS.find(x=>x.id===id),m=$("#modal");
  m.innerHTML=`<div class="big">${p.e}</div><h2 style="text-align:left;margin:8px 0">${p.n}</h2>
  <p>${stars(p.r)} ${p.r} · ${p.c}</p><p>${p.d}</p><p class="price">${money(p.p)}</p>
  <div class="cta" style="justify-content:flex-start"><button class="btn" data-add="${p.id}">Add to cart</button><button class="btn alt" id="closeModal">Close</button></div>`;
  m.showModal();
  $("#closeModal").onclick=()=>m.close();
}

/* cart */
const cartCount=()=>Object.values(state.cart).reduce((a,b)=>a+b,0);
function totals(){
  const sub=Object.entries(state.cart).reduce((s,[id,q])=>s+PRODUCTS.find(p=>p.id==id).p*q,0);
  const disc=state.promo==="WORLD10"?sub*.1:0;
  const ship=sub-disc>=150||sub===0?0:9;
  return{sub,disc,ship,total:sub-disc+ship};
}
function renderCart(){
  const ids=Object.keys(state.cart);
  $("#count").textContent=cartCount();
  $("#items").innerHTML=ids.length?ids.map(id=>{const p=PRODUCTS.find(x=>x.id==id),q=state.cart[id];
    return`<div class="row"><span class="e">${p.e}</span><div class="t"><b>${p.n}</b><br><small>${money(p.p)}</small>
    <div class="qty"><button data-dec="${id}">−</button><span>${q}</span><button data-inc="${id}">+</button></div></div>
    <button class="ghost" data-rm="${id}">✕</button></div>`}).join(""):`<p style="opacity:.7;text-align:center;margin-top:40px">Your cart is empty.</p>`;
  const t=totals();
  $("#totals").innerHTML=`<div class="tot"><span>Subtotal</span><span>${money(t.sub)}</span></div>
  ${t.disc?`<div class="tot"><span>Promo WORLD10</span><span>−${money(t.disc)}</span></div>`:""}
  <div class="tot"><span>Shipping</span><span>${t.ship?money(t.ship):"Free"}</span></div>
  <div class="tot g"><span>Total</span><span>${money(t.total)}</span></div>`;
  $("#checkoutBtn").disabled=!ids.length;
  save();
}
const addToCart=id=>{state.cart[id]=(state.cart[id]||0)+1;renderCart();toast("Added "+PRODUCTS.find(p=>p.id==id).n)};
const toggleCart=o=>{$("#cart").classList.toggle("open",o);$("#shade").classList.toggle("on",o)};

/* events */
document.addEventListener("click",e=>{
  const t=e.target;
  if(t.dataset.add){e.stopPropagation();addToCart(+t.dataset.add);return}
  if(t.dataset.w){e.stopPropagation();const id=+t.dataset.w;state.wish=state.wish.includes(id)?state.wish.filter(x=>x!==id):[...state.wish,id];save();renderGrid();return}
  if(t.dataset.c){state.cat=t.dataset.c;renderChips();renderGrid();return}
  if(t.dataset.inc){state.cart[t.dataset.inc]++;renderCart();return}
  if(t.dataset.dec){if(--state.cart[t.dataset.dec]<=0)delete state.cart[t.dataset.dec];renderCart();return}
  if(t.dataset.rm){delete state.cart[t.dataset.rm];renderCart();return}
  const c=t.closest(".card");if(c)openModal(+c.dataset.id);
});
$("#search").oninput=e=>{state.q=e.target.value.toLowerCase().trim();renderGrid()};
$("#sort").onchange=e=>{state.sort=e.target.value;renderGrid()};
$("#warp").onclick=warp;$("#warp2").onclick=warp;
$("#cartBtn").onclick=()=>toggleCart(true);
$("#closeCart").onclick=()=>toggleCart(false);
$("#shade").onclick=()=>toggleCart(false);
document.addEventListener("keydown",e=>{if(e.key==="Escape")toggleCart(false)});
$("#applyPromo").onclick=()=>{
  const v=$("#promo").value.trim().toUpperCase();
  if(v==="WORLD10"){state.promo=v;toast("Promo applied: 10% off")}else toast("Invalid code");
  renderCart();
};
$("#checkoutBtn").onclick=()=>{toggleCart(false);$("#err").textContent="";$("#checkout").showModal()};
$("#cancelPay").onclick=()=>$("#checkout").close();
$("#fCard").oninput=e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim()};
$("#payForm").onsubmit=e=>{
  e.preventDefault();
  const name=$("#fName").value.trim(),email=$("#fEmail").value.trim(),addr=$("#fAddr").value.trim(),card=$("#fCard").value.replace(/\s/g,"");
  if(name.length<2)return $("#err").textContent="Please enter your full name.";
  if(!/^\S+@\S+\.\S+$/.test(email))return $("#err").textContent="Enter a valid email.";
  if(addr.length<5)return $("#err").textContent="Enter your delivery address.";
  if(card.length!==16)return $("#err").textContent="Card number must be 16 digits.";
  const total=totals().total,id="PG-"+Math.random().toString(36).slice(2,8).toUpperCase();
  state.cart={};state.promo="";renderCart();$("#checkout").close();$("#payForm").reset();
  const m=$("#modal");
  m.innerHTML=`<div class="big">🎉</div><h2>Order confirmed!</h2><p style="text-align:center">Thanks ${name.split(" ")[0]}. Order <b>${id}</b> for ${money(total)} is on its way to another dimension.<br><small>(Demo store, no payment was taken.)</small></p><div class="cta"><button class="btn" id="closeModal">Keep exploring</button></div>`;
  m.showModal();$("#closeModal").onclick=()=>m.close();
};
$("#newsForm").onsubmit=e=>{e.preventDefault();toast("Subscribed! Welcome to the multiverse.");e.target.reset()};

/* countdown (resets each day) */
let end=store.get("pg_end",0);
if(end<Date.now()){end=Date.now()+86400000;store.set("pg_end",end)}
setInterval(()=>{
  const s=Math.max(0,end-Date.now())/1000|0,f=n=>String(n).padStart(2,"0");
  $("#timer").textContent=f(s/3600|0)+":"+f(s%3600/60|0)+":"+f(s%60);
},1000);

/* scroll reveal + stat counters */
const io=new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting)return;
  en.target.classList.add("in");io.unobserve(en.target);
  en.target.querySelectorAll("[data-n]").forEach(el=>{
    const to=+el.dataset.n,d=+el.dataset.d||0,t0=performance.now();
    (function step(t){const k=Math.min(1,(t-t0)/1400);el.textContent=(to*k).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g,",");if(k<1)requestAnimationFrame(step)})(t0);
  });
}),{threshold:.15});
$$(".reveal").forEach(el=>io.observe(el));

/* init: new world each visit, never the same twice in a row */
let first;do{first=Math.random()*WORLDS.length|0}while(first===state.world);
setWorld(first);renderChips();renderGrid();renderCart();
