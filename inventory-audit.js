// 1. تشغيل الدالة فور تحميل الصفحة لضمان ظهور البيانات
document.addEventListener('DOMContentLoaded', () => {
    renderAuditTable();
});

// 2. دالة جلب البيانات من الذاكرة وعرضها في الجدول
function renderAuditTable() {
    // جلب المنتجات من localStorage (تأكدي من توحيد الاسم في كل الصفحات)
    let products = JSON.parse(localStorage.getItem('hasad_products')) || [];
    const tableBody = document.getElementById('audit-table-body');
    
    // في حال كان المخزن فارغاً
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="p-12 text-center text-slate-400 font-bold text-xl">
                    لا توجد منتجات في مخزن Sunshine حالياً.. أضيفي أصنافاً أولاً 🔍
                </td>
            </tr>`;
        return;
    }

    // بناء صفوف الجدول
    tableBody.innerHTML = products.map((item, index) => `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-all group">
            <td class="p-6 font-bold text-slate-700">${item.name || 'منتج بدون اسم'}</td>
            <td class="p-6 text-slate-400 font-mono tracking-wider">${item.barcode || '---'}</td>
            <td class="p-6 text-center">
                <span class="bg-emerald-50 text-[#10b981] px-4 py-2 rounded-xl font-black">
                    ${item.qty || 0}
                </span>
            </td>
            <td class="p-6 flex justify-center">
                <input type="number" 
                       value="${item.qty || 0}" 
                       onchange="updateAuditQty(${index}, this.value)"
                       class="w-24 p-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#10b981] focus:ring-4 focus:ring-emerald-50 outline-none text-center font-black text-slate-700 transition-all">
            </td>
        </tr>
    `).join('');
}

// 3. دالة تحديث الكمية في المصفوفة وحفظها فوراً
function updateAuditQty(index, newVal) {
    let products = JSON.parse(localStorage.getItem('hasad_products')) || [];
    
    // تحويل القيمة لرقم صحيح
    products[index].qty = parseInt(newVal) || 0;
    
    // حفظ التغيير في الذاكرة
    localStorage.setItem('hasad_products', JSON.stringify(products));
    console.log(`تم تحديث كمية ${products[index].name} إلى ${newVal}`);
}

// 4. دالة البحث السريع (التي برمجناها في الهيدر)
function searchAudit() {
    let input = document.getElementById('audit-search').value.toLowerCase();
    let rows = document.querySelectorAll('#audit-table-body tr');
    
    rows.forEach(row => {
        let text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

// 5. دالة زر الحفظ النهائي
function saveAudit() {
    // إظهار رسالة نجاح لمسة Sunshine ☀️
    alert('تم اعتماد الجرد وتحديث مخزون Sunshine بنجاح! ☀️✅');
    location.reload(); // إعادة تحميل الصفحة لتأكيد البيانات
}