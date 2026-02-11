const settings = JSON.parse(localStorage.getItem('hasad_settings')) || {};
// لو عندك عنصر اسمه side-shop-name غيري نصه
if(settings.name && document.getElementById('side-shop-name')) {
    document.getElementById('side-shop-name').innerText = settings.name;
}

// 1. استدعاء البيانات من الذاكرة
let reports = JSON.parse(localStorage.getItem('hasad_reports')) || [];

// 2. دالة رسم الجدول (تأكدي أن الـ ID مطابق لـ reports-table-body)
function renderReports() {
    const tableBody = document.getElementById('reports-table-body');
    
    if (!tableBody) return; 

    if (reports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-20 text-center text-slate-400 font-bold">لا توجد فواتير مسجلة حتى الآن 🔎</td></tr>`;
        return;
    }

    const displayReports = [...reports].reverse();

    tableBody.innerHTML = displayReports.map((inv) => {
        return `
            <tr class="border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                <td onclick="viewInvoiceDetails(${inv.id})" class="px-8 py-5 font-bold text-[#10b981] cursor-pointer hover:underline decoration-2 underline-offset-4">
                    #${inv.id} 
                </td>
                <td class="px-8 py-5 text-center">
                    <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold">
                        👤 ${inv.seller || 'ندى (المدير)'}
                    </span>
                </td>
                <td class="px-8 py-5 text-slate-500 text-sm">${inv.date}</td>
                <td class="px-8 py-5 font-black text-slate-700">${parseFloat(inv.total).toFixed(2)} ر.س</td>
                <td class="px-8 py-5 text-center">
                    <button onclick="deleteInvoice(${inv.id})" class="text-red-400 hover:text-red-600 text-xs font-bold transition-colors">حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}
// 3. وظيفة عرض التفاصيل (تأكدي من مطابقة ID: modal-content)
function viewInvoiceDetails(id) {
    const inv = reports.find(i => i.id == id);
    if (!inv) return;

    const content = document.getElementById('modal-content');
    const totalEl = document.getElementById('modal-total');
    
    if (!content || !totalEl) return;

    let itemsHtml = inv.items.map(item => `
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
            <div>
                <p class="font-bold text-[#1e293b] text-sm">${item.name}</p>
                <p class="text-[10px] text-slate-400">${item.count || item.qty} وحدة × ${item.price} ر.س</p>
            </div>
            <p class="font-bold text-slate-700 text-sm">${((item.count || item.qty) * item.price).toFixed(2)} ر.س</p>
        </div>
    `).join('');

    itemsHtml += `
        <div class="mt-4 p-3 bg-slate-50 rounded-xl text-center">
            <p class="text-[10px] text-slate-400 font-bold">البائع المسؤول</p>
            <p class="text-sm font-bold text-slate-700">👤 ${inv.seller || 'ندى (المدير)'}</p>
        </div>
    `;

    content.innerHTML = itemsHtml;
    totalEl.innerText = parseFloat(inv.total).toFixed(2) + " ر.س";
    document.getElementById('invoice-modal').classList.remove('hidden');
}

// 4. دالة إغلاق النافذة
function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.add('hidden');
}

// 5. دالة الحذف
function deleteInvoice(id) {
    if(confirm('هل أنتِ متأكدة من حذف هذه الفاتورة؟')) {
        reports = reports.filter(inv => inv.id != id);
        localStorage.setItem('hasad_reports', JSON.stringify(reports));
        renderReports();
    }
}

// 6. تشغيل العرض فور التحميل (هذا هو السطر اللي كان ناقص!)
window.onload = renderReports;