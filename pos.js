// --- [1] جلب البيانات من المخزن ---
let products = JSON.parse(localStorage.getItem('hasad_products')) || [];
let categories = JSON.parse(localStorage.getItem('hasad_categories')) || [];
let cart = [];

// --- [2] عرض المنتجات في الشبكة ---
function renderPOS() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-400">لا توجد منتجات.. أضيفيها من صفحة المخزن.</div>';
        return;
    }

    grid.innerHTML = products.map((p, index) => {
        const isOut = parseInt(p.qty || 0) <= 0;
        return `
            <div onclick="${isOut ? '' : `addToCart(${index})`}" 
                 class="bg-white p-6 rounded-[30px] shadow-sm border border-slate-50 cursor-pointer hover:border-[#10b981] hover:scale-[1.02] transition-all relative ${isOut ? 'opacity-50 grayscale cursor-not-allowed' : ''}">
                ${isOut ? '<span class="absolute top-4 left-4 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full z-10">نافذ</span>' : ''}
                <div class="text-4xl mb-4">📦</div>
                <h3 class="font-bold text-[#1e293b]">${p.name}</h3>
                <p class="text-slate-400 text-xs mb-3">${p.category}</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-[#10b981] font-bold">${p.price} ر.س</span>
                    <span class="text-[10px] text-slate-400">المتوفر: ${p.qty}</span>
                </div>
            </div>`;
    }).join('');
}

// --- [3] عرض التصنيفات للفلترة ---
function renderCategories() {
    const container = document.getElementById('dynamic-categories');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <button onclick="filterByCat('${cat}')" class="bg-white text-slate-600 border border-slate-100 px-8 py-3 rounded-full font-bold hover:bg-[#10b981] hover:text-white transition-all flex-shrink-0">
            ${cat}
        </button>
    `).join('');
}

function filterByCat(cat) {
    const grid = document.getElementById('products-grid');
    const filtered = cat === 'الكل' ? products : products.filter(p => p.category === cat);
    // إعادة رسم المنتجات بناءً على الفلتر
    renderProductsList(filtered);
}

function renderProductsList(list) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = list.map((p, index) => {
        const isOut = parseInt(p.qty || 0) <= 0;
        const originalIndex = products.indexOf(p);
        return `
            <div onclick="${isOut ? '' : `addToCart(${originalIndex})`}" class="bg-white p-6 rounded-[30px] shadow-sm border border-slate-50 cursor-pointer hover:border-[#10b981] transition-all ${isOut ? 'opacity-50' : ''}">
                <div class="text-4xl mb-4">📦</div>
                <h3 class="font-bold text-[#1e293b]">${p.name}</h3>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-[#10b981] font-bold">${p.price} ر.س</span>
                </div>
            </div>`;
    }).join('');
}

// --- [4] إدارة السلة (الفاتورة) ---
function addToCart(index) {
    const item = products[index];
    const inCart = cart.find(c => c.name === item.name);

    if (inCart) {
        if (inCart.count < item.qty) inCart.count++;
        else alert("لا توجد كمية كافية بالمخزن!");
    } else {
        cart.push({ ...item, count: 1, originalIndex: index });
    }
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const payBtn = document.getElementById('pay-button');
    
    if (cart.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'flex';
        payBtn.disabled = true;
        payBtn.className = "w-full bg-slate-200 text-slate-400 py-6 rounded-[30px] font-bold text-2xl mt-6 cursor-not-allowed";
    } else {
        if(emptyMsg) emptyMsg.style.display = 'none';
        payBtn.disabled = false;
        payBtn.className = "w-full bg-[#10b981] text-white py-6 rounded-[30px] font-bold text-2xl mt-6 shadow-xl transition-all hover:scale-[1.02]";
    }

    list.innerHTML = cart.map((item, i) => `
        <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-3">
            <div class="flex-1">
                <h4 class="font-bold text-[#1e293b] text-sm">${item.name}</h4>
                <p class="text-[#10b981] font-bold text-xs">${item.price} ر.س</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changeQty(${i}, -1)" class="w-8 h-8 bg-white border rounded-lg">-</button>
                <span class="font-bold">${item.count}</span>
                <button onclick="changeQty(${i}, 1)" class="w-8 h-8 bg-white border rounded-lg">+</button>
            </div>
        </div>
    `).join('');
    
    calculateTotals();
}

function changeQty(index, delta) {
    const item = cart[index];
    if (delta > 0 && item.count < products[item.originalIndex].qty) item.count++;
    else if (delta < 0) item.count--;
    
    if (item.count <= 0) cart.splice(index, 1);
    updateCartUI();
}

function calculateTotals() {
    let sub = cart.reduce((acc, item) => acc + (item.price * item.count), 0);
    let tax = sub * 0.15;
    let final = sub + tax;

    document.getElementById('sub-total').innerText = sub.toFixed(2) + " ر.س";
    document.getElementById('tax-amount').innerText = tax.toFixed(2) + " ر.س";
    document.getElementById('final-total').innerText = final.toFixed(2) + " ر.س";
}

function checkout() {
    if (confirm('تأكيد عملية الدفع والخصم من المخزن؟')) {
        cart.forEach(item => {
            products[item.originalIndex].qty -= item.count;
        });
        localStorage.setItem('hasad_products', JSON.stringify(products));
        alert('تمت العملية بنجاح ✅');
        cart = [];
        updateCartUI();
        renderPOS();
    }
}

function clearCart() { if(confirm('إفراغ السلة؟')) { cart = []; updateCartUI(); } }

// وظيفة البحث
function searchProducts(query) {
    const filtered = products.filter(p => p.name.includes(query) || (p.barcode && p.barcode.includes(query)));
    renderProductsList(filtered);
}

window.onload = () => {
    renderPOS();
    renderCategories();
};