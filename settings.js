// 1. جلب العناصر من الصفحة
const settingsForm = document.getElementById('settings-form');
const logoInput = document.getElementById('logo-input');
const logoPreview = document.getElementById('logo-preview');

// 2. تحميل البيانات المحفوظة عند فتح الصفحة
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem('hasad_settings')) || {};
    if (saved.name) document.getElementById('shop-name').value = saved.name;
    if (saved.tax) document.getElementById('tax-number').value = saved.tax;
    if (saved.taxPercent) document.getElementById('tax-percent').value = saved.taxPercent;
    if (saved.currency) document.getElementById('currency').value = saved.currency;
    if (saved.address) document.getElementById('shop-address').value = saved.address;
    if (saved.footerMsg) document.getElementById('footer-msg').value = saved.footerMsg;
    if (saved.logo) logoPreview.src = saved.logo;
};

// 3. معالجة تغيير اللوجو
logoInput.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => { logoPreview.src = reader.result; };
    if (file) reader.readAsDataURL(file);
};

// 4. دالة حفظ التغييرات (التي ستحدث الفاتورة فوراً)
settingsForm.onsubmit = (e) => {
    e.preventDefault();

    const newSettings = {
        name: document.getElementById('shop-name').value || "حصاد",
        tax: document.getElementById('tax-number').value || "0000000000",
        taxPercent: document.getElementById('tax-percent').value || 15,
        currency: document.getElementById('currency').value || "ر.س",
        address: document.getElementById('shop-address').value || "",
        footerMsg: document.getElementById('footer-msg').value || "شكراً لزيارتكم",
        logo: logoPreview.src
    };

    // حفظ في الذاكرة المركزية
    localStorage.setItem('hasad_settings', JSON.stringify(newSettings));

    alert('تم حفظ الإعدادات بنجاح! الفاتورة وشاشة البيع الآن تعمل بالبيانات الجديدة 🚀');
};