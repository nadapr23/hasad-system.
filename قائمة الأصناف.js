// --- [1] تهيئة البيانات ---
let categories = JSON.parse(localStorage.getItem('hasad_categories')) || [];
let products = JSON.parse(localStorage.getItem('hasad_products')) || [];
let activeFilter = 'الكل'; 

// --- [2] إدارة النوافذ ---
function openModal() { document.getElementById('add-modal').classList.remove('hidden'); updateCatSelect(); setTimeout(() => document.getElementById('prod-name').focus(), 100); }
function closeModal() { document.getElementById('add-modal').classList.add('hidden'); }
function openCatModal() { document.getElementById('cat-modal').classList.remove('hidden'); setTimeout(() => document.getElementById('cat-name-input').focus(), 100); }
function closeCatModal() { document.getElementById('cat-modal').classList.add('hidden'); }
function openManageCatsModal() { document.getElementById('manage-cats-modal').classList.remove('hidden'); renderManageCatsList(); }
function closeManageCatsModal() { document.getElementById('manage-cats-modal').classList.add('hidden'); }

// --- [3] الفلترة والإحصائيات ---
function setFilter(cat) { activeFilter = cat; renderTable(); renderCategoryFilters(); }
function filterOutOfStock() { activeFilter = 'outOfStock'; renderTable(); renderCategoryFilters(); }

function updateStats() {
    document.getElementById('total-categories').innerText = categories.length;
    document.getElementById('total-products').innerText = products.length;
    document.getElementById('out-of-stock').innerText = products.filter(p => parseInt(p.qty || 0) === 0).length;
    renderCategoryFilters();
}

function renderCategoryFilters() {
    const container = document.getElementById('categories-filter-container');
    if(!container) return;
    let html = `<button onclick="setFilter('الكل')" class="px-4 py-1 rounded-full text-sm transition ${activeFilter === 'الكل' ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-600'}">الكل</button>`;
    categories.forEach(cat => {
        html += `<button onclick="setFilter('${cat}')" class="px-4 py-1 rounded-full text-sm transition ${activeFilter === cat ? 'bg-[#10b981] text-white font-bold' : 'bg-slate-100 text-slate-600'}">${cat}</button>`;
    });
    container.innerHTML = html;
}

// --- [4] إدارة الجدول والعمليات ---
function renderTable() {
    const tableBody = document.getElementById('inventory-table');
    if(!tableBody) return;
    
    let filtered;
    if (activeFilter === 'outOfStock') filtered = products.filter(p => parseInt(p.qty || 0) === 0);
    else if (activeFilter === 'الكل') filtered = products;
    else filtered = products.filter(p => p.category === activeFilter);

    tableBody.innerHTML = filtered.length === 0 ? `<tr><td colspan="6" class="p-24 text-center text-slate-400">لا توجد منتجات</td></tr>` : 
        filtered.map(p => {
            const idx = products.indexOf(p);
            return `<tr class="border-b border-slate-50 hover:bg-slate-50 transition-all">
                <td class="p-6 font-bold text-[#1e293b]">${p.name}</td>
                <td class="p-6 text-slate-500">${p.category}</td>
                <td class="p-6 text-slate-400 font-mono">${p.barcode || '---'}</td>
                <td class="p-6 font-bold text-[#10b981]">${p.price} ر.س</td>
                <td class="p-6">
                    <input type="number" onchange="updateQty(${idx}, this.value)" value="${p.qty || 0}" 
                           class="w-20 p-2 bg-slate-50 border rounded-xl text-center outline-none focus:border-[#10b981]">
                </td>
                <td class="p-6 text-center">
                    <div class="flex items-center justify-center gap-4">
                        <button onclick="printPriceTag(${idx})" class="text-[#10b981] hover:scale-110 transition-transform flex items-center gap-1 font-bold text-sm">
                            🏷️ طباعة
                        </button>
                        <button onclick="deleteProduct(${idx})" class="text-red-400 hover:scale-110 transition-transform flex items-center gap-1 font-bold text-sm">
                            🗑️ حذف
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
}

// --- [5] دالة طباعة التسعيرة (الجديدة) ---
function printPriceTag(index) {
    const p = products[index];
    const printWindow = window.open('', '', 'width=600,height=400');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة تسعيرة - ${p.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                body { font-family: 'Cairo', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: white; }
                .tag-container { border: 3px solid #10b981; padding: 30px; border-radius: 20px; text-align: center; width: 350px; }
                .logo-text { color: #10b981; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
                .product-name { font-size: 28px; font-weight: bold; color: #1e293b; margin: 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .product-price { font-size: 40px; color: #10b981; font-weight: 900; }
                .currency { font-size: 18px; color: #64748b; }
                .barcode-area { margin-top: 20px; font-size: 12px; color: #94a3b8; letter-spacing: 2px; }
            </style>
        </head>
        <body>
            <div class="tag-container">
                <div class="logo-text">🌿 نظام حصاد</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${p.price} <span class="currency">ر.س</span></div>
                <div class="barcode-area">|||| || |||| ||| <br> ${p.barcode || '000000'}</div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => { window.close(); }, 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// باقي الدوال الخاصة بالتصنيفات والمستمعات كما هي...
function renderManageCatsList() {
    const list = document.getElementById('cats-management-list');
    if (!list) return;
    list.innerHTML = categories.length === 0 ? '<p class="text-center text-slate-400 py-4">لا توجد تصنيفات</p>' : 
        categories.map((cat, index) => `
            <div class="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group mb-2">
                <input type="text" value="${cat}" onchange="editCat(${index}, this.value)" class="flex-1 bg-transparent border-none outline-none font-bold text-[#1e293b] focus:text-[#10b981]">
                <button onclick="deleteCategory(${index})" class="text-red-400">🗑️</button>
            </div>`).join('');
}

function editCat(index, newName) {
    const oldName = categories[index];
    categories[index] = newName.trim();
    products.forEach(p => { if (p.category === oldName) p.category = newName.trim(); });
    saveAndRefresh();
    renderManageCatsList();
}

function deleteCategory(index) {
    if(confirm('حذف التصنيف؟')) { categories.splice(index, 1); saveAndRefresh(); renderManageCatsList(); }
}

function updateQty(idx, val) { 
    products[idx].qty = parseInt(val) || 0; 
    localStorage.setItem('hasad_products', JSON.stringify(products)); 
    updateStats(); 
    if(activeFilter === 'outOfStock' && parseInt(val) > 0) renderTable();
}

function deleteProduct(idx) { if(confirm('حذف؟')) { products.splice(idx, 1); saveAndRefresh(); } }

function saveAndRefresh() {
    localStorage.setItem('hasad_categories', JSON.stringify(categories));
    localStorage.setItem('hasad_products', JSON.stringify(products));
    updateStats(); renderTable(); updateCatSelect();
}

document.addEventListener('DOMContentLoaded', () => {
    const catForm = document.getElementById('category-form');
    if(catForm) {
        catForm.addEventListener('submit', function(e) {
            e.preventDefault();
            categories.push(document.getElementById('cat-name-input').value.trim());
            saveAndRefresh();
            document.getElementById('cat-name-input').value = ""; closeCatModal();
        });
    }

    const prodForm = document.getElementById('product-form');
    if(prodForm) {
        prodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            products.push({
                name: document.getElementById('prod-name').value, category: document.getElementById('prod-category').value,
                price: document.getElementById('prod-price').value, barcode: document.getElementById('prod-barcode').value,
                qty: document.getElementById('prod-qty').value || 0
            });
            saveAndRefresh(); closeModal(); this.reset();
        });
    }
    renderTable(); updateStats(); updateCatSelect();
});

function updateCatSelect() {
    const select = document.getElementById('prod-category');
    if(select) select.innerHTML = '<option value="">اختر...</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}