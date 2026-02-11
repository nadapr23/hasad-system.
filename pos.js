// --- [0] سحب الإعدادات الحقيقية من الذاكرة ---
const settings = JSON.parse(localStorage.getItem('hasad_settings')) || {
    name: "حصاد",
    logo: "./للخلفيه الغامق.png",
    taxPercent: 15,
    currency: "ر.س",
    tax: "0000000000",
    address: "المملكة العربية السعودية",
    footerMsg: "شكراً لزيارتكم"
};

// تحديث الهوية في القائمة الجانبية فوراً
if(settings.name && document.getElementById('side-shop-name')) {
    document.getElementById('side-shop-name').innerText = settings.name;
}
if(settings.logo && document.getElementById('side-logo')) {
    document.getElementById('side-logo').src = settings.logo;
}

// --- [1] تهيئة البيانات الأساسية ---
let products = JSON.parse(localStorage.getItem('hasad_products')) || [];
let categories = JSON.parse(localStorage.getItem('hasad_categories')) || [];
let cart = [];

// --- [2] عرض المنتجات في الشبكة ---
function renderPOS(list = products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-400">لا توجد منتجات مطابقة.</div>';
        return;
    }

    grid.innerHTML = list.map((p) => {
        const isOut = parseInt(p.qty || 0) <= 0;
        const originalIndex = products.indexOf(p);
        return `
            <div onclick="${isOut ? '' : `addToCart(${originalIndex})`}" 
                 class="bg-white p-6 rounded-[30px] shadow-sm border border-slate-50 cursor-pointer hover:border-[#10b981] hover:scale-[1.02] transition-all relative ${isOut ? 'opacity-50 grayscale cursor-not-allowed' : ''}">
                ${isOut ? '<span class="absolute top-4 left-4 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full z-10">نافذ</span>' : ''}
                <div class="text-4xl mb-4">📦</div>
                <h3 class="font-bold text-[#1e293b]">${p.name}</h3>
                <p class="text-slate-400 text-xs mb-3">${p.category}</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-[#10b981] font-bold">${p.price} ${settings.currency}</span>
                    <span class="text-[10px] text-slate-400">المتوفر: ${p.qty}</span>
                </div>
            </div>`;
    }).join('');
}

// --- [3] إدارة السلة والحسابات الديناميكية ---
function addToCart(index) {
    const item = products[index];
    const inCart = cart.find(c => c.barcode === item.barcode);

    if (inCart) {
        if (inCart.count < item.qty) inCart.count++;
        else alert("الكمية المتوفرة لا تكفي! ⚠️");
    } else {
        cart.push({ ...item, count: 1, originalIndex: index });
    }
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.map((item, i) => `
        <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-3">
            <div class="flex-1">
                <h4 class="font-bold text-[#1e293b] text-sm">${item.name}</h4>
                <p class="text-[#10b981] font-bold text-xs">${item.price} ${settings.currency}</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changeQty(${i}, -1)" class="w-8 h-8 bg-white border rounded-lg">-</button>
                <span class="font-bold">${item.count}</span>
                <button onclick="changeQty(${i}, 1)" class="w-8 h-8 bg-white border rounded-lg">+</button>
            </div>
        </div>`).join('');
    
    calculateTotals();
}

function calculateTotals() {
    let sub = cart.reduce((acc, item) => acc + (item.price * item.count), 0);
    let taxPercent = parseFloat(settings.taxPercent) || 15; // الضريبة من الإعدادات
    let tax = (sub * taxPercent) / 100;
    let final = sub + tax;

    document.getElementById('sub-total').innerText = sub.toFixed(2) + " " + settings.currency;
    document.getElementById('tax-amount').innerText = tax.toFixed(2) + " " + settings.currency;
    document.getElementById('final-total').innerText = final.toFixed(2) + " " + settings.currency;
    
    if(document.getElementById('tax-label')) 
        document.getElementById('tax-label').innerText = `الضريبة (${taxPercent}%)`;
}

// --- [4] إتمام البيع والطباعة ---
function checkout() {
    if (cart.length === 0) return;
    
    if (confirm('تأكيد الدفع وطباعة الفاتورة؟')) {
        const subTotal = cart.reduce((acc, item) => acc + (item.price * item.count), 0);
        const taxPercent = parseFloat(settings.taxPercent) || 15;
        const tax = (subTotal * taxPercent) / 100;
        const finalTotal = subTotal + tax;

        const newInvoice = {
            id: Math.floor(Math.random() * 900000) + 100000,
            date: new Date().toLocaleString('ar-SA'),
            seller: "ندى (المدير)", 
            items: [...cart],
            subTotal: subTotal.toFixed(2),
            tax: tax.toFixed(2),
            total: finalTotal.toFixed(2)
        };

        let reports = JSON.parse(localStorage.getItem('hasad_reports')) || [];
        reports.push(newInvoice);
        localStorage.setItem('hasad_reports', JSON.stringify(reports));

        printReceipt(cart, newInvoice.id);

        cart.forEach(item => {
            const product = products.find(p => p.barcode === item.barcode);
            if (product) product.qty = parseInt(product.qty) - item.count;
        });

        localStorage.setItem('hasad_products', JSON.stringify(products));
        cart = [];
        updateCartUI();
        renderPOS();
    }
}

// دالة الطباعة الاحترافية بالهوية الجديدة
function printReceipt(cartData, invoiceNum) {
    const subTotal = cartData.reduce((acc, item) => acc + (item.price * item.count), 0);
    const taxPercent = parseFloat(settings.taxPercent) || 15;
    const tax = (subTotal * taxPercent) / 100;
    const finalTotal = subTotal + tax;

    const win = window.open('', '', 'height=600,width=400');
    win.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة - ${settings.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                body { font-family: 'Cairo', sans-serif; width: 80mm; margin: 0 auto; padding: 10px; }
                .header { text-align: center; margin-bottom: 15px; }
                .logo { max-width: 60px; margin-bottom: 5px; }
                table { width: 100%; font-size: 11px; margin-top: 10px; border-top: 1px solid #000; }
                th { text-align: right; padding: 5px 0; border-bottom: 1px dashed #ccc; }
                .final { font-size: 16px; font-weight: bold; border-top: 2px solid #000; }
                .footer { text-align: center; font-size: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${settings.logo}" class="logo">
                <div style="font-size: 20px; font-weight: bold;">${settings.name}</div>
                <div style="font-size: 10px;">${settings.address}</div>
                <div style="font-size: 10px;">الرقم الضريبي: ${settings.tax}</div>
            </div>
            <table>
                <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr></thead>
                <tbody>
                    ${cartData.map(item => `<tr><td>${item.name}</td><td>${item.count}</td><td>${(item.price * item.count).toFixed(2)}</td></tr>`).join('')}
                </tbody>
            </table>
            <div style="margin-top: 10px;">
                <div style="display:flex; justify-content:space-between"><span>المجموع:</span> <span>${subTotal.toFixed(2)}</span></div>
                <div style="display:flex; justify-content:space-between"><span>الضريبة (${taxPercent}%):</span> <span>${tax.toFixed(2)}</span></div>
                <div style="display:flex; justify-content:space-between" class="final"><span>الإجمالي:</span> <span>${finalTotal.toFixed(2)} ${settings.currency}</span></div>
            </div>
            <div class="footer"><p>${settings.footerMsg}</p></div>
            <script>window.onload = function() { window.print(); setTimeout(() => { window.close(); }, 500); }</script>
        </body></html>
    `);
    win.document.close();
}

function changeQty(index, delta) {
    const item = cart[index];
    const originalProd = products[item.originalIndex];
    if (delta > 0 && item.count < originalProd.qty) item.count++;
    else if (delta < 0) item.count--;
    if (item.count <= 0) cart.splice(index, 1);
    updateCartUI();
}

window.onload = () => { renderPOS(); };