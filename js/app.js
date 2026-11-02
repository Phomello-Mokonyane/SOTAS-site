function safeGetStorage(key){
try { return localStorage.getItem(key); } catch (error) { return null; }
}
function safeSetStorage(key, value){
try { localStorage.setItem(key, value); } catch (error) { /* Ignore storage errors in restricted browsers. */ }
}
function safeRemoveStorage(key){
try { localStorage.removeItem(key); } catch (error) { /* Ignore storage errors in restricted browsers. */ }
}

function stockText(v){ return Object.entries(v.sizes).map(([s,q])=>`${s} ×${q}`).join(" • "); }

function createGroupCard(group){
const def = group.variants[0];
const colors = group.variants.map((v,i)=>`<button class="color-dot ${i===0?'active':''}" data-sku="${v.sku}" data-hex="${v.hex}" style="background:${v.hex}" title="${v.color}"></button>`).join("");
const sizes = Object.keys(def.sizes).map((s,i)=>`<button class="size-pill ${i===0?'active':''}" data-size="${s}">${s}<small>×${def.sizes[s]}</small></button>`).join("");
return `<div class="product-card reveal" data-group="${group.groupId}" data-category="${group.category}" data-selected-sku="${def.sku}"><div class="product-img-wrap"><span class="stock-dot limited"></span><img src="${def.image}" alt="${group.name}" onerror="this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'"></div><h3>${group.name}</h3><div class="price-row"><span class="price">R${group.price}</span></div><div class="color-row">${colors}<span class="variant-meta" data-role="meta">${def.color} • ${stockText(def)}</span></div><div class="sizes" data-role="sizes">${sizes}</div><button class="btn-add" onclick="handleAdd(this)">Add to Cart</button></div>`;
}

function createStackCard(group, idx){
const def = group.variants[0];
const colors = group.variants.map((v,i)=>`<button class="color-dot ${i===0?'active':''}" data-sku="${v.sku}" data-hex="${v.hex}" style="background:${v.hex}" title="${v.color}" aria-label="${v.color}"></button>`).join("");
const sizes = Object.keys(def.sizes).map((s,i)=>`<button class="size-pill ${i===0?'active':''}" data-size="${s}">${s}<small>×${def.sizes[s]}</small></button>`).join("");
return `<div class="stack-card reveal" data-group="${group.groupId}" data-selected-sku="${def.sku}"><div class="stack-left"><div class="num">0${idx+1} / ${group.bestseller?'BESTSELLER':'NEW'}</div><h4>${group.name}</h4><div class="price">R${group.price}</div><div class="color-row" data-role="stack-colors">${colors}</div><div class="meta-text" data-role="meta">${def.color} • ${stockText(def)}</div><button class="btn-primary" onclick="handleStackAdd(this)">Add to Cart</button><a href="shop.html" class="btn-outline">View Details</a></div><div class="stack-center"><img data-role="img" src="${def.image}" alt="${group.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'"></div><div class="stack-right"><div class="meta">Details</div><p style="font-size:13px;color:#d8d3ca;line-height:1.6">Heavyweight, oversized fit. Exact units left from poster. When gone, it's gone.</p><div class="meta" style="margin-top:12px">Sizes Left - Tap to select</div><div class="sizes" data-role="sizes">${sizes}</div><div class="meta" style="margin-top:12px">Category</div><div style="font-size:12px;color:#fff;text-transform:uppercase;letter-spacing:1px">${group.category}</div></div></div>`;
}

function attachGroupLogic(root){
root.querySelectorAll(".product-card").forEach(card=>{
const groupId = card.dataset.group;
const group = PRODUCT_GROUPS.find(g=>g.groupId===groupId);
if(!group) return;
card.querySelectorAll(".color-dot").forEach(dot=>{
dot.addEventListener("click", ()=>{
const sku = dot.dataset.sku;
const variant = group.variants.find(v=>v.sku===sku);
if(!variant) return;
card.dataset.selectedSku = sku;
card.querySelectorAll(".color-dot").forEach(d=>d.classList.remove("active")); dot.classList.add("active");
const img = card.querySelector("img");
img.style.opacity=.5;
setTimeout(()=>{ img.src = variant.image; img.style.opacity=1; },150);
card.querySelector('[data-role="meta"]').textContent = `${variant.color} • ${stockText(variant)}`;
const sizesWrap = card.querySelector('[data-role="sizes"]');
sizesWrap.innerHTML = Object.keys(variant.sizes).map((s,i)=>`<button class="size-pill ${i===0?'active':''}" data-size="${s}">${s}<small>×${variant.sizes[s]}</small></button>`).join("");
attachSizePills(sizesWrap);
});
});
attachSizePills(card.querySelector('[data-role="sizes"]'));
});
}

function attachStackLogic(root){
root.querySelectorAll(".stack-card").forEach(card=>{
const groupId = card.dataset.group;
const group = PRODUCT_GROUPS.find(g=>g.groupId===groupId);
if(!group) return;
const imgEl = card.querySelector('[data-role="img"]');
const metaEl = card.querySelector('[data-role="meta"]');
const sizesWrap = card.querySelector('[data-role="sizes"]');
const colorDots = card.querySelectorAll('[data-role="stack-colors"] .color-dot');
colorDots.forEach(dot=>{
const handler = ()=>{
const sku = dot.dataset.sku;
const variant = group.variants.find(v=>v.sku===sku);
if(!variant) return;
card.dataset.selectedSku = sku;
card.querySelectorAll('[data-role="stack-colors"] .color-dot').forEach(d=>d.classList.remove("active"));
dot.classList.add("active");
if(imgEl){
imgEl.style.opacity=.4;
setTimeout(()=>{ imgEl.src = variant.image; imgEl.style.opacity=1; },180);
}
if(metaEl) metaEl.textContent = `${variant.color} • ${stockText(variant)}`;
if(sizesWrap){
sizesWrap.innerHTML = Object.keys(variant.sizes).map((s,i)=>`<button class="size-pill ${i===0?'active':''}" data-size="${s}">${s}<small>×${variant.sizes[s]}</small></button>`).join("");
attachSizePills(sizesWrap);
}
};
dot.addEventListener("click", handler);
dot.addEventListener("touchstart", handler, {passive:true});
});
if(sizesWrap) attachSizePills(sizesWrap);
});
}

function attachSizePills(wrap){ if(!wrap) return; wrap.querySelectorAll(".size-pill").forEach(p=>{ p.addEventListener("click",()=>{ wrap.querySelectorAll(".size-pill").forEach(x=>x.classList.remove("active")); p.classList.add("active"); }); }); }
function handleAdd(btn){ const card=btn.closest(".product-card"); const sku=card.dataset.selectedSku; const sizeEl=card.querySelector(".size-pill.active"); const size=sizeEl?sizeEl.dataset.size:null; addToCart(sku,size); }
function handleStackAdd(btn){ const card=btn.closest(".stack-card"); const sku=card.dataset.selectedSku; const sizeEl=card.querySelector('[data-role="sizes"] .size-pill.active'); const size=sizeEl?sizeEl.dataset.size:null; addToCart(sku,size); }
function renderGroups(list, containerId){ const el=document.getElementById(containerId); if(!el) return; el.innerHTML=list.map(createGroupCard).join(""); attachGroupLogic(el); observeReveals(); const countEl=document.getElementById('shopCount'); if(countEl) countEl.textContent = `${list.length} items`;
}
function renderStack(list, containerId){ const el=document.getElementById(containerId); if(!el) return; el.innerHTML=list.map((g,i)=>createStackCard(g,i)).join(""); attachStackLogic(el); observeReveals(); }

function createIndividualCard(product){
const sizes = Object.keys(product.stockMap).map((s,i)=>`<button class="size-pill ${i===0?'active':''}" data-size="${s}">${s}<small>×${product.stockMap[s]}</small></button>`).join("");
return `<div class="product-card reveal" data-sku="${product.id}" data-category="${product.category}"><div class="product-img-wrap"><span class="stock-dot limited"></span><img src="${product.image}" alt="${product.name} - ${product.color}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'"></div><h3>${product.name}</h3><div style="font-size:11px;color:#6b6b6b;font-weight:600;margin:2px 0">${product.color}</div><div class="price-row"><span class="price">R${product.price}</span></div><div class="sizes" data-role="sizes">${sizes}</div><button class="btn-add" onclick="handleIndividualAdd(this)">Add to Cart</button></div>`;
}

function handleIndividualAdd(btn){
const card=btn.closest(".product-card");
const sku=card.dataset.sku;
const sizeEl=card.querySelector(".size-pill.active");
const size=sizeEl?sizeEl.dataset.size:null;
addToCart(sku,size);
}

function renderIndividual(list, containerId){
const el=document.getElementById(containerId); if(!el) return;
if(!list.length){
el.innerHTML = `
<div class="empty-state reveal">
  <h3>No products match this filter.</h3>
  <p>Try a different category or browse the full SOTAS collection.</p>
  <button class="btn-primary" onclick="location.href='shop.html'">View all stock</button>
</div>`;
return;
}
el.innerHTML=list.map(createIndividualCard).join("");
el.querySelectorAll(".product-card").forEach(card=>{
const wrap=card.querySelector('[data-role="sizes"]')||card.querySelector(".sizes");
if(wrap){
wrap.querySelectorAll(".size-pill").forEach(p=>{
p.addEventListener("click",()=>{
wrap.querySelectorAll(".size-pill").forEach(x=>x.classList.remove("active"));
p.classList.add("active");
});
});
}
});
observeReveals();
}


function openModal(t,h){
const ex=document.querySelector(".sotas-modal"); if(ex) ex.remove();
const d=document.createElement("div"); d.className="sotas-modal";
d.innerHTML=`<div class="sotas-modal-backdrop"></div><div class="sotas-modal-card"><h3>${t}</h3><div style="margin-top:10px;line-height:1.6">${h}</div><button class="btn-primary" style="margin-top:18px" onclick="this.closest('.sotas-modal').remove()">Close</button></div>`;
d.querySelector(".sotas-modal-backdrop").onclick=()=>d.remove();
document.body.appendChild(d);
}

function openCareersModal(){
const ex=document.querySelector(".sotas-modal"); if(ex) ex.remove();
const d=document.createElement("div"); d.className="sotas-modal";
d.innerHTML=`
<div class="sotas-modal-backdrop"></div>
<div class="sotas-modal-card" style="max-width:520px">
<h3>Join SOTAS - Careers</h3>
<p style="margin-top:8px;color:#6b6b6b;font-size:13px;line-height:1.5">Drop your portfolio, CV and links. It will be forwarded directly to SOTAS email: hello@sotas.co.za</p>
<form id="careersForm" action="https://formsubmit.co/hello@sotas.co.za" method="POST" enctype="multipart/form-data" style="margin-top:16px;display:flex;flex-direction:column;gap:10px">
<input type="hidden" name="_subject" value="New SOTAS Careers Application">
<input type="hidden" name="_captcha" value="false">
<input type="hidden" name="_template" value="table">
<input type="text" name="name" placeholder="Full Name" required style="height:44px;padding:0 12px;border:1px solid #e5e7eb;border-radius:10px">
<input type="email" name="email" placeholder="Email Address" required style="height:44px;padding:0 12px;border:1px solid #e5e7eb;border-radius:10px">
<input type="text" name="role" placeholder="Role you want (Designer, Model, etc)" required style="height:44px;padding:0 12px;border:1px solid #e5e7eb;border-radius:10px">
<textarea name="message" placeholder="Tell us why you want to join SOTAS..." rows="3" style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;resize:vertical"></textarea>
<label style="font-size:11px;font-weight:700;letter-spacing:.5px">UPLOAD PORTFOLIO (PDF, JPG, PNG, DOC)</label>
<input type="file" name="attachment" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required style="padding:8px;border:1px dashed #e5e7eb;border-radius:10px">
<button type="submit" class="btn-primary" style="width:100%">Send Portfolio to SOTAS</button>
<p style="font-size:10px;color:#9a9590;margin-top:4px">Your portfolio will be forwarded to hello@sotas.co.za</p>
</form>
<button class="btn-outline" style="width:100%;margin-top:10px" onclick="this.closest('.sotas-modal').remove()">Close</button>
</div>`;
d.querySelector(".sotas-modal-backdrop").onclick=()=>d.remove();
document.body.appendChild(d);
}

function initShop(){
const grid=document.getElementById("shopGrid"); if(!grid) return;
const btns=document.querySelectorAll(".filter-btn");
const apply=(f)=>{
btns.forEach(b=>b.classList.toggle("active",b.dataset.filter===f));
let out=[...PRODUCTS];
if(f!=="all"){
if(["tshirt","hoodie","sweater","track","jacket"].includes(f)) out=out.filter(p=>p.category===f);
else if(f==="new") out=PRODUCTS.filter(p=>p.isNew);
else if(f==="best") out=PRODUCTS.filter(p=>p.bestseller);
else if(f==="sale") out=PRODUCTS;
else if(f==="apparel") out=PRODUCTS.filter(p=>p.category!=="headwear");
else if(f==="headwear") out=[];
}
renderIndividual(out,"shopGrid");
const countEl=document.getElementById('shopCount'); if(countEl) countEl.textContent = `${out.length} items`;
};
btns.forEach(b=>b.addEventListener("click",()=>apply(b.dataset.filter)));
const params=new URLSearchParams(location.search).get("filter")||safeGetStorage("sotas_filter")||"all"; apply(params); safeRemoveStorage("sotas_filter");
}

function observeReveals(){
const obs = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } }) },{threshold:.12, rootMargin:"0px 0px -60px 0px"});
document.querySelectorAll('.reveal:not(.in)').forEach(el=>obs.observe(el));
}


function initStackParallax(){
const cards = document.querySelectorAll('.stack-card');
if(!cards.length) return;
let ticking = false;
function update(){
const vh = window.innerHeight;
cards.forEach((card, i)=>{
const rect = card.getBoundingClientRect();
const progress = (rect.top - 100) / vh; // 0 when at sticky top
if(progress < 0.2 && progress > -1){
const scale = 1 - Math.min(Math.abs(progress)*0.05, 0.08);
const nextCards = Array.from(cards).slice(i+1);
// previous cards scale down slightly like video
if(rect.top < 120){
card.style.transform = `scale(${0.96 + progress*0.04})`;
card.style.filter = `brightness(${1 - Math.abs(progress)*0.2})`;
}
} else {
card.style.transform = '';
card.style.filter = '';
}
});
ticking = false;
}
window.addEventListener('scroll', ()=>{
if(!ticking){
requestAnimationFrame(update);
ticking = true;
}
}, {passive:true});
}

function initSmoothScroll(){
function update(){ document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 12); }
window.addEventListener('scroll', update, {passive:true}); update();
}

function initStripAutoRotate(){
const track = document.querySelector('.strip-track');
const strip = document.querySelector('.hero-strip');
if(!track || !strip) return;
if(!track.dataset.duplicated){
const originals = Array.from(track.children);
originals.forEach(card=>{
const clone = card.cloneNode(true);
clone.setAttribute('aria-hidden','true');
track.appendChild(clone);
});
originals.forEach(card=>{
const clone = card.cloneNode(true);
clone.setAttribute('aria-hidden','true');
track.appendChild(clone);
});
track.dataset.duplicated = "1";
}
let x = 0;
let speed = 1.1;
let paused = false;
function animate(){
if(!paused){
x -= speed;
const resetPoint = track.scrollWidth / 3;
if(Math.abs(x) >= resetPoint){
x = 0;
}
track.style.transform = `translateX(${x}px)`;
}
requestAnimationFrame(animate);
}
strip.addEventListener('mouseenter', ()=> paused = true);
strip.addEventListener('mouseleave', ()=> paused = false);
strip.addEventListener('touchstart', ()=> paused = true, {passive:true});
strip.addEventListener('touchend', ()=> setTimeout(()=> paused = false, 1200), {passive:true});
animate();
}

let fitState = { top: null, bottom: null };
function initFitMatcher(){
const topWrap = document.getElementById('fitTopOptions');
const bottomWrap = document.getElementById('fitBottomOptions');
const topImg = document.getElementById('fitTopImg');
const bottomImg = document.getElementById('fitBottomImg');
const totalEl = document.getElementById('fitTotal');
const addBtn = document.getElementById('fitAddBtn');
if(!topWrap || !bottomWrap) return;
const tops = PRODUCT_GROUPS.filter(g=>['hoodie','sweater','tshirt','jacket'].includes(g.category));
const bottoms = PRODUCT_GROUPS.filter(g=>g.category==='track');
function renderOptions(){
topWrap.innerHTML = tops.map(g=>{
const def = g.variants[0];
return `<button class="fit-option ${fitState.top && fitState.top.groupId===g.groupId?'active':''}" data-group="${g.groupId}" data-type="top"><img src="${def.image}" alt="${g.name}" onerror="this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'"><span>${g.name}</span><small>R${g.price}</small></button>`;
}).join('');
bottomWrap.innerHTML = bottoms.map(g=>{
const def = g.variants[0];
return `<button class="fit-option ${fitState.bottom && fitState.bottom.groupId===g.groupId?'active':''}" data-group="${g.groupId}" data-type="bottom"><img src="${def.image}" alt="${g.name}" onerror="this.src='https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'"><span>${g.name}</span><small>R${g.price}</small></button>`;
}).join('');
topWrap.querySelectorAll('.fit-option').forEach(btn=>{
btn.addEventListener('click', ()=>{
const g = PRODUCT_GROUPS.find(x=>x.groupId===btn.dataset.group);
if(!g) return;
fitState.top = { groupId:g.groupId, price:g.price, image:g.variants[0].image, sku:g.variants[0].sku, name:g.name };
if(topImg){ topImg.src = g.variants[0].image; topImg.style.display='block'; }
renderOptions(); updateTotal();
});
});
bottomWrap.querySelectorAll('.fit-option').forEach(btn=>{
btn.addEventListener('click', ()=>{
const g = PRODUCT_GROUPS.find(x=>x.groupId===btn.dataset.group);
if(!g) return;
fitState.bottom = { groupId:g.groupId, price:g.price, image:g.variants[0].image, sku:g.variants[0].sku, name:g.name };
if(bottomImg){ bottomImg.src = g.variants[0].image; bottomImg.style.display='block'; }
renderOptions(); updateTotal();
});
});
}
function updateTotal(){
const total = (fitState.top?.price||0) + (fitState.bottom?.price||0);
if(totalEl) totalEl.textContent = total ? `R${total}` : 'R0';
if(addBtn) addBtn.disabled = !fitState.top || !fitState.bottom;
}
if(addBtn){
addBtn.addEventListener('click', ()=>{
if(!fitState.top || !fitState.bottom){ alert('Pick a top and bottom to make a match'); return; }
const topProd = PRODUCTS.find(p=>p.groupId===fitState.top.groupId);
const bottomProd = PRODUCTS.find(p=>p.groupId===fitState.bottom.groupId);
const topSize = topProd ? Object.keys(topProd.stockMap)[0] : 'M';
const bottomSize = bottomProd ? Object.keys(bottomProd.stockMap)[0] : 'M';
if(topProd) addToCart(topProd.id, topSize);
setTimeout(()=>{ if(bottomProd) addToCart(bottomProd.id, bottomSize); }, 300);
});
}
if(tops[0]){ fitState.top = { groupId:tops[0].groupId, price:tops[0].price, image:tops[0].variants[0].image, sku:tops[0].variants[0].sku, name:tops[0].name }; if(topImg) topImg.src = tops[0].variants[0].image; }
if(bottoms[0]){ fitState.bottom = { groupId:bottoms[0].groupId, price:bottoms[0].price, image:bottoms[0].variants[0].image, sku:bottoms[0].variants[0].sku, name:bottoms[0].name }; if(bottomImg) bottomImg.src = bottoms[0].variants[0].image; }
renderOptions(); updateTotal();
}

document.addEventListener("DOMContentLoaded",()=>{
initSmoothScroll();
initStackParallax();
initStripAutoRotate();
initFitMatcher();
if(document.getElementById("featuredGrid")) renderGroups(PRODUCT_GROUPS.filter(g=>g.bestseller).slice(0,4),"featuredGrid");
if(document.getElementById("stackGrid")) renderStack(PRODUCT_GROUPS.filter(g=>g.bestseller).slice(0,4),"stackGrid");
initShop();
observeReveals();
document.querySelectorAll("[data-shop]").forEach(a=>a.addEventListener("click",e=>{ e.preventDefault(); const v=e.currentTarget.dataset.shop; if(location.pathname.includes("shop.html")){ safeSetStorage("sotas_filter",v); location.search=`?filter=${v}`; } else location.href=`shop.html?filter=${v}`; }));
document.querySelectorAll("[data-company]").forEach(a=>a.addEventListener("click",e=>{
e.preventDefault(); const v=e.currentTarget.dataset.company;
if(v==="story"){ const s=document.querySelector("#story"); if(s) s.scrollIntoView({behavior:"smooth"}); else location.href="index.html#story"; }
else if(v==="journal") openModal("Journal","Lookbooks and drops coming soon. Follow @sotas on Instagram.");
else if(v==="stockists") openModal("Stockists","Online only. Nationwide delivery. WhatsApp +27 72 781 1936 for wholesale.");
else if(v==="careers") openCareersModal();
}));
document.querySelectorAll("[data-support]").forEach(a=>a.addEventListener("click",e=>{ e.preventDefault(); const v=e.currentTarget.dataset.support; if(v==="contact") openModal("Contact","WhatsApp: +27 72 781 1936<br>Email: hello@sotas.co.za<br>Hours: Mon-Sat 9am-6pm"); else if(v==="shipping") openModal("Shipping & Returns","Standard R80 (2-5 days), Express R150 (1-2 days), Collection Free in Pretoria. 14 day returns if unworn with tags. Customer pays return shipping unless faulty."); else if(v==="size") openModal("Size Guide","S 92cm chest, M 98cm, L 104cm, XL 112cm, 2XL 120cm, 3XL 128cm, 4XL 136cm. Oversized fit. Size up for extra oversized. Model 180cm wearing L."); else if(v==="faq") document.querySelector("#faq")?.scrollIntoView({behavior:"smooth"}); }));
document.querySelectorAll(".faq-q").forEach(q=>{ q.addEventListener("click",()=>{ const item = q.closest(".faq-item"); item.classList.toggle("open"); }); });
});
