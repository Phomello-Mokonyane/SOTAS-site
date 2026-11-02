function safeReadCart(){
  try {
    return JSON.parse(localStorage.getItem('sotas_cart') || '[]');
  } catch (error) {
    return [];
  }
}
function safeWriteCart(data){
  try {
    localStorage.setItem('sotas_cart', JSON.stringify(data));
  } catch (error) {
    // Ignore storage errors in restricted or private browsers.
  }
}
let cart = safeReadCart();
function saveCart(){ safeWriteCart(cart); }
function cartCount(){ return cart.reduce((a,c)=>a+c.qty,0); }
function addToCart(sku, size){
if(!size){ alert('Please select a size'); return; }
const product = PRODUCTS.find(p=>p.id===sku);
if(!product) return;
const existing = cart.find(i=>i.id===sku && i.size===size);
const stock = product.stockMap[size] || 0;
const currentQty = existing? existing.qty : 0;
if(currentQty >= stock){ alert(`Only ${stock} left for ${size}`); return; }
if(existing){ existing.qty++; }
else { cart.push({ id:sku, size, qty:1, price:product.price, name:product.name, color:product.color, hex:product.hex, image:product.image }); }
saveCart(); renderCart(); openCart();
}
function removeFromCart(index){ cart.splice(index,1); saveCart(); renderCart(); }
function changeQty(index, delta){
const item = cart[index];
const product = PRODUCTS.find(p=>p.id===item.id);
const stock = product?.stockMap[item.size] || 0;
item.qty += delta;
if(item.qty <=0) cart.splice(index,1);
if(item.qty > stock) item.qty = stock;
saveCart(); renderCart();
}
function renderCart(){
const wrap = document.getElementById('cartItems');
const totalEl = document.getElementById('cartTotal');
const countEl = document.getElementById('cartCount');
if(!wrap) return;
if(countEl) countEl.textContent = cartCount();
if(cart.length===0){
wrap.innerHTML = `<p style="padding:20px;opacity:.6;font-size:14px">Your cart is empty. Add some heat.</p>`;
if(totalEl) totalEl.textContent = 'R0';
return;
}
let total = 0;
wrap.innerHTML = cart.map((item, i)=>{
const itemTotal = item.price * item.qty;
total += itemTotal;
return `
<div class="cart-item">
<img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'">
<div class="cart-item-details">
<div class="cart-item-name">${item.name}</div>
<div class="cart-item-meta"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${item.hex};margin-right:4px"></span>${item.color} • ${item.size} • R${item.price}</div>
<div class="cart-item-controls">
<button class="qty-btn" onclick="changeQty(${i},-1)">-</button>
<span style="font-size:13px;width:16px;text-align:center">${item.qty}</span>
<button class="qty-btn" onclick="changeQty(${i},1)">+</button>
<button class="remove-btn" onclick="removeFromCart(${i})">Remove</button>
</div>
</div>
<div class="cart-item-price">R${itemTotal}</div>
</div>`;
}).join('');
const shipMethod = document.getElementById('shipMethod')?.value || 'standard';
let shipCost = shipMethod==='standard'?80: shipMethod==='express'?150:0;
if(totalEl) totalEl.textContent = `R${total + shipCost}`;
}
function openCart(){ document.getElementById('cartDrawer')?.classList.add('open'); document.getElementById('overlay')?.classList.add('active'); }
function closeCartDrawer(){ document.getElementById('cartDrawer')?.classList.remove('open'); document.getElementById('overlay')?.classList.remove('active'); }
document.addEventListener('DOMContentLoaded', ()=>{
renderCart();
document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('closeCart')?.addEventListener('click', closeCartDrawer);
document.getElementById('overlay')?.addEventListener('click', closeCartDrawer);
document.getElementById('shipMethod')?.addEventListener('change', renderCart);
document.getElementById('checkoutForm')?.addEventListener('submit', (e)=>{
e.preventDefault();
if(cart.length===0){ alert('Cart is empty'); return; }
const name = document.getElementById('custName').value;
const phone = document.getElementById('custPhone').value;
const email = document.getElementById('custEmail').value;
const address = document.getElementById('shipAddress').value;
const city = document.getElementById('shipCity').value;
const province = document.getElementById('shipProvince').value;
const code = document.getElementById('shipCode').value;
const ship = document.getElementById('shipMethod').value;
let msg = `*SOTAS ORDER*%0A%0A`;
cart.forEach(it=>{ msg+=`• ${it.name} - ${it.color} - ${it.size} x${it.qty} = R${it.price*it.qty}%0A`; });
msg+=`%0A*Total:* ${document.getElementById('cartTotal').textContent}%0A%0A`;
msg+=`*Customer:* ${name}%0A${phone}%0A${email}%0A%0A`;
msg+=`*Ship:* ${address}, ${city}, ${province}, ${code} - ${ship}`;
window.open(`https://wa.me/27727811936?text=${msg}`, '_blank');
});
});