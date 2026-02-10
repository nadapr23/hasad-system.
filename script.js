// --- [1] تهيئة البيانات الأساسية ---
// جلب البيانات من ذاكرة المتصفح أو بدء مصفوفات فارغة
let categories = JSON.parse(localStorage.getItem('hasad_categories')) || [];
let products = JSON.parse(localStorage.getItem('hasad_products')) || [];
let activeFilter = 'الكل'; // الحالة الافتراضية للفلترة

// --- [2] إدارة النوافذ (Modals) ---
// تم إضافة سطر الـ focus لضمان ظهور سهم الكتابة فوراً
function openModal() {
    document.getElementById('add-modal').classList.remove('hidden');
    updateCatSelect();
    setTimeout(() => document.getElementById('prod-name').focus(), 100);
}

function closeModal() {
    document.getElementById('add-modal').classList.add('hidden');
}

function openCatModal() {
    document.getElementById('cat-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('cat-name-input').focus(), 100);
}

function closeCatModal() {
    document.getElementById('cat-modal').classList.add('hidden');
}

// دالة فتح نافذة الإدارة وتعبئتها بالتصنيفات
function openManageCatsModal() {
    document.getElementById('manage-cats-modal').classList.remove('hidden');
    renderManageCatsList(); // تعبئة القائمة داخل النافذة
}

function closeManageCatsModal() {
    document.getElementById('manage-cats-modal').classList.add('hidden');
}

// --- [3] إدارة الفلترة والإحصائيات ---
// الرجوع للكل عند الضغط على كرت "إجمالي الأصناف"
function setFilter(cat) {
    activeFilter = cat;
    renderTable();
    renderCategoryFilters();
}

// فلترة النواقص عند الضغط على الكرت الأحمر
function filterOutOfStock() {
    activeFilter = 'outOfStock';
    renderTable();
    renderCategoryFilters();
}

function updateStats() {
    const catTotal = document.getElementById('total-categories');
    const prodTotal = document.getElementById('total-products');
    const outStockTotal = document.getElementById('out-of-stock');

    if (catTotal) catTotal.innerText = categories.length;
    if (prodTotal) prodTotal.innerText = products.length;
    if (outStockTotal) outStockTotal.innerText = products.filter(p => parseInt(p.qty || 0) === 0).length;
    
    renderCategoryFilters();
}

// عرض أزرار التصنيفات تحت كرت الإحصائية
function renderCategoryFilters() {
    const container = document.getElementById('categories-filter-container');
    if (!container) return;

    let html = `<button onclick="setFilter('الكل')" class="px-4 py-1 rounded-full text-sm transition ${activeFilter === 'الكل' ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-600'}">الكل</button>`;
    
    categories.forEach((cat) => {
        html += `<button onclick="setFilter('${cat}')" class="px-4 py-1 rounded-full text-sm transition ${activeFilter === cat ? 'bg-[#10b981] text-white font-bold' : 'bg-slate-100 text-slate-600'}">${cat}</button>`;
    });
    container.innerHTML = html;
}

// --- [4] إدارة الجدول والعمليات ---
function renderTable() {
    const tableBody = document.getElementById('inventory-table');
    if (!tableBody) return;

    let filtered;
    if (activeFilter === 'outOfStock') {
        filtered = products.filter(p => parseInt(p.qty || 0) === 0);
    } else if (activeFilter === 'الكل') {
        filtered = products;
    } else {
        filtered = products.filter(p => p.category === activeFilter);
    }

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        const msg = activeFilter === 'outOfStock' ? "لا توجد منتجات نافذة 🎉" : "لا توجد منتجات لعرضها";
        tableBody.innerHTML = `<tr><td colspan="6" class="p-24 text-center text-slate-400"><div class="text-7xl mb-4 opacity-10">🔍</div>${msg}</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map((p) => {
        const originalIndex = products.indexOf(p);
        return `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition-all">
                <td class="p-6 font-bold text-[#1e293b]">${p.name}</td>
                <td class="p-6 text-slate-500">${p.category}</td>
                <td class="p-6 text-slate-400 font-mono">${p.barcode || '---'}</td>
                <td class="p-6 font-bold text-[#10b981]">${p.price} ر.س</td>
                <td class="p-6">
                    <input type="number" onchange="updateQty(${originalIndex}, this.value)" value="${p.qty || 0}" 
                           class="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center focus:border-[#10b981] outline-none">
                </td>
                <td class="p-6 text-center">
                    <button onclick="deleteProduct(${originalIndex})" class="text-red-400 hover:scale-110 transition-transform">🗑️ حذف</button>
                </td>
            </tr>`;
    }).join('');
}

function updateQty(index, val) {
    products[index].qty = parseInt(val) || 0;
    localStorage.setItem('hasad_products', JSON.stringify(products));
    updateStats();
    if (activeFilter === 'outOfStock' && parseInt(val) > 0) renderTable();
}

function deleteProduct(index) {
    if (confirm('هل أنتِ متأكدة من حذف هذا المنتج؟')) {
        products.splice(index, 1);
        saveAndSync();
    }
}

// --- [5] إدارة التصنيفات (تعديل وحذف) ---
// الدالة التي كانت مفقودة وتسببت في اختفاء التصنيفات داخل النافذة
function renderManageCatsList() {
    const list = document.getElementById('cats-management-list');
    if (!list) return;

    if (categories.length === 0) {
        list.innerHTML = '<p class="text-center text-slate-400 py-6 text-sm">لا توجد تصنيفات مضافة</p>';
        return;
    }

    list.innerHTML = categories.map((cat, index) => `
        <div class="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group mb-2 transition-all hover:bg-slate-100">
            <input type="text" value="${cat}" onchange="editCatName(${index}, this.value)" 
                   class="flex-1 bg-transparent border-none outline-none font-bold text-[#1e293b] focus:text-[#10b981]">
            <button onclick="deleteCategory(${index})" class="text-red-400 hover:text-red-600 transition p-1">🗑️</button>
        </div>`).join('');
}

function editCatName(index, newName) {
    const oldName = categories[index];
    const trimmed = newName.trim();
    if (trimmed === "" || trimmed === oldName) return;

    categories[index] = trimmed;
    // تحديث تصنيف المنتجات المرتبطة تلقائياً
    products.forEach(p => { if (p.category === oldName) p.category = trimmed; });
    
    saveAndSync();
    renderManageCatsList();
}

function deleteCategory(index) {
    if (confirm('حذف التصنيف؟ (المنتجات ستبقى بدون تصنيف)')) {
        categories.splice(index, 1);
        saveAndSync();
        renderManageCatsList();
    }
}

// دالة موحدة لحفظ البيانات وتحديث الواجهة
function saveAndSync() {
    localStorage.setItem('hasad_categories', JSON.stringify(categories));
    localStorage.setItem('hasad_products', JSON.stringify(products));
    updateStats();
    renderTable();
    updateCatSelect();
}

// --- [6] استماع للنماذج وتحديث القوائم ---
const categoryForm = document.getElementById('category-form');
if (categoryForm) {
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const val = document.getElementById('cat-name-input').value.trim();
        if (val) {
            categories.push(val);
            saveAndSync();
            document.getElementById('cat-name-input').value = "";
            closeCatModal();
        }
    });
}

const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        products.push({
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: document.getElementById('prod-price').value,
            barcode: document.getElementById('prod-barcode').value,
            qty: document.getElementById('prod-qty').value || 0
        });
        saveAndSync();
        closeModal();
        this.reset();
    });
}

function updateCatSelect() {
    const select = document.getElementById('prod-category');
    if (!select) return;
    select.innerHTML = '<option value="">اختر تصنيف...</option>' + 
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

// تشغيل النظام فور تحميل الصفحة
window.onload = () => {
    updateStats();
    renderTable();
    updateCatSelect();
};