// ===============================================================
// نظام إتمام الطلب والدفع اليدوي (Checkout & Manual Payment Flow)
// ===============================================================

import { db, collection, addDoc, Timestamp } from "./firebase-config.js";
import { getCart, clearCart } from "./cart.js";
import { getAllProducts } from "./products.js";
import { getPaymentSettings } from "./payment-settings.js";
import { showToast, validateEgyptianPhone, generateShortId, escapeHTML } from "./utils.js";
import { renderCheckoutSummarySkeleton } from "./skeleton.js";

let currentStep = 1;
let customerData = {};
let selectedPaymentMethod = 'vodafone_cash';
let uploadedProofBase64 = null;
let uploadedProofMeta = null;
let isSubmitting = false;

// حساب مصاريف الشحن استناداً إلى المحافظة وإعدادات المتجر
function calculateShippingFee(subtotal, governorate) {
    const settings = getPaymentSettings();
    const defaultFee = settings.shipping.defaultFee || 45;
    const freeThreshold = settings.shipping.freeThreshold || 1500;

    if (subtotal >= freeThreshold) {
        return 0; // شحن مجاني
    }

    if (!governorate) return defaultFee;

    // محافظات الصعيد والحدودية
    const upperEgypt = ['المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'الوادي الجديد', 'البحر الأحمر', 'مطروح', 'شمال سيناء', 'جنوب سيناء'];
    if (upperEgypt.includes(governorate)) {
        return defaultFee + 25;
    }

    return defaultFee;
}

/**
 * تحديث ملخص الطلب الجانبي مع التحقق من صحة الأسعار من الكتالوج
 */
export function updateCheckoutSummary() {
    const cart = getCart();
    const allProducts = getAllProducts();
    const miniList = document.getElementById('checkout-mini-items-list');
    const countBadge = document.getElementById('checkout-items-count');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const grandTotalEl = document.getElementById('checkout-grand-total');
    const transferAmountEl = document.getElementById('transfer-amount-display');

    if (!miniList) return;

    if (cart.length === 0) {
        miniList.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i data-lucide="shopping-bag" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                <p>سلتك فارغة</p>
                <a href="#products" class="text-xs text-[#ffcd00] font-bold underline mt-1 block">تصفح المنتجات</a>
            </div>
        `;
        if (countBadge) countBadge.textContent = "0 منتجات";
        if (subtotalEl) subtotalEl.textContent = "0.00 EGP";
        if (shippingEl) shippingEl.textContent = "0.00 EGP";
        if (grandTotalEl) grandTotalEl.textContent = "0.00 EGP";
        if (transferAmountEl) transferAmountEl.textContent = "0.00 EGP";
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    if (allProducts.length === 0) {
        miniList.innerHTML = renderCheckoutSummarySkeleton();
        return;
    }

    let subtotal = 0;
    const itemsHtml = cart.map(item => {
        // التحقق من السعر الحقيقي من الكتالوج لمنع التلاعب
        const catalogProduct = allProducts.find(p => p.id === item.id || p.shortId === item.id);
        const verifiedPrice = catalogProduct ? parseFloat(catalogProduct.price) : parseFloat(item.price);
        const itemTotal = verifiedPrice * item.quantity;
        subtotal += itemTotal;

        const colorInfo = item.selectedColor 
            ? `<span class="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 ml-1" style="background-color: ${item.selectedColor.hex}"></span>`
            : '';

        return `
            <div class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <img src="${item.image || 'https://placehold.co/100x100'}" alt="${escapeHTML(item.name)}" class="w-12 h-12 object-contain bg-white dark:bg-[#111] p-1 rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div class="flex-grow min-w-0 text-right">
                    <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">${escapeHTML(item.name)}</h5>
                    <div class="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>الكمية: ${item.quantity}</span>
                        ${colorInfo}
                    </div>
                </div>
                <div class="text-left font-black text-xs text-gray-900 dark:text-white whitespace-nowrap" dir="ltr">
                    ${itemTotal.toFixed(2)} EGP
                </div>
            </div>
        `;
    }).join('');

    const gov = document.getElementById('cust-governorate')?.value || customerData.governorate || '';
    const shippingFee = calculateShippingFee(subtotal, gov);
    const grandTotal = subtotal + shippingFee;

    miniList.innerHTML = itemsHtml;
    if (countBadge) countBadge.textContent = `${cart.reduce((s, i) => s + i.quantity, 0)} منتج`;
    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    if (shippingEl) shippingEl.textContent = shippingFee === 0 ? "شحن مجاني ✓" : `${shippingFee.toFixed(2)} EGP`;
    if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toFixed(2)} EGP`;
    if (transferAmountEl) transferAmountEl.textContent = `${grandTotal.toFixed(2)} EGP`;

    if (window.lucide) window.lucide.createIcons();
}

/**
 * الانتقال بين خطوات الـ Checkout الأربعة
 */
export function goToCheckoutStep(step) {
    currentStep = step;

    // تحديث أشرطة ودوائر التقدم
    for (let i = 1; i <= 4; i++) {
        const navItem = document.getElementById(`step-nav-${i}`);
        const panel = document.getElementById(`checkout-step-${i}`);
        const line = document.getElementById(`step-line-${i}`);

        if (panel) {
            panel.classList.toggle('hidden', i !== step);
        }

        if (navItem) {
            navItem.classList.remove('active', 'completed');
            if (i === step) {
                navItem.classList.add('active');
            } else if (i < step) {
                navItem.classList.add('completed');
                navItem.querySelector('.step-circle').innerHTML = `<i data-lucide="check" class="w-4 h-4"></i>`;
            } else {
                navItem.querySelector('.step-circle').textContent = i;
            }
        }

        if (line) {
            line.classList.toggle('completed', i < step);
        }
    }

    updateCheckoutSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
}

/**
 * تحديث بيانات التحويل عند اختيار وسيلة دفع
 */
function updatePaymentDetailsView() {
    const settings = getPaymentSettings();
    const titleEl = document.getElementById('transfer-method-title');
    const labelEl = document.getElementById('transfer-account-label');
    const valueEl = document.getElementById('transfer-account-value');
    const nameEl = document.getElementById('transfer-account-name');

    if (selectedPaymentMethod === 'vodafone_cash') {
        if (titleEl) titleEl.textContent = "بيانات التحويل عبر فودافون كاش";
        if (labelEl) labelEl.textContent = "رقم محفظة فودافون كاش:";
        if (valueEl) valueEl.textContent = settings.vodafoneCash.phone;
        if (nameEl) nameEl.textContent = `باسم: ${settings.vodafoneCash.accountName}`;
    } else {
        if (titleEl) titleEl.textContent = "بيانات التحويل عبر إنستاباي (InstaPay)";
        if (labelEl) labelEl.textContent = "عنوان أو رقم إنستاباي (IPA):";
        if (valueEl) valueEl.textContent = settings.instapay.address;
        if (nameEl) nameEl.textContent = `باسم: ${settings.instapay.accountName}`;
    }
}

/**
 * ضغط الصورة في المتصفح عبر Canvas لضمان وضوح فائق وحجم صغير جداً (<150KB)
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const maxDim = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // استخراج صورة مضغوطة عالية الجودة
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * معالجة ملف الصورة المرفوع
 */
async function handleProofFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showToast("حجم الصورة كبير جداً (أقصى حد 10MB).");
        return;
    }

    try {
        const compressedBase64 = await compressImage(file);
        uploadedProofBase64 = compressedBase64;
        uploadedProofMeta = {
            name: file.name,
            size: Math.round(file.size / 1024) + ' KB',
            type: file.type
        };

        const previewContainer = document.getElementById('proof-preview-container');
        const placeholder = document.getElementById('proof-dropzone-placeholder');
        const previewImg = document.getElementById('proof-preview-img');
        const previewName = document.getElementById('proof-preview-name');
        const previewSize = document.getElementById('proof-preview-size');

        if (previewImg) previewImg.src = compressedBase64;
        if (previewName) previewName.textContent = file.name;
        if (previewSize) previewSize.textContent = uploadedProofMeta.size;

        if (previewContainer) previewContainer.classList.remove('hidden');
        if (placeholder) placeholder.classList.add('hidden');

        showToast("تم إرفاق إثبات التحويل بنجاح!");
    } catch (err) {
        console.error("Error compressing proof image:", err);
        showToast("حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى.");
    }
}

/**
 * إرسال وتأكيد الطلب وحفظه في Firestore
 */
async function submitOrder() {
    if (isSubmitting) return;

    const cart = getCart();
    if (cart.length === 0) {
        showToast("سلتك فارغة! أضف منتجات قبل إتمام الطلب.");
        goToCheckoutStep(1);
        return;
    }

    if (!uploadedProofBase64) {
        showToast("يرجى إرفاق صورة إثبات التحويل أولاً لتأكيد طلبك.");
        return;
    }

    const allProducts = getAllProducts();
    let subtotal = 0;
    const verifiedItems = cart.map(item => {
        const catalogProduct = allProducts.find(p => p.id === item.id || p.shortId === item.id);
        const verifiedPrice = catalogProduct ? parseFloat(catalogProduct.price) : parseFloat(item.price);
        const itemTotal = verifiedPrice * item.quantity;
        subtotal += itemTotal;

        return {
            productId: item.id,
            name: item.name,
            price: verifiedPrice,
            quantity: item.quantity,
            selectedColor: item.selectedColor || null,
            image: item.image || '',
            itemTotal
        };
    });

    const shippingFee = calculateShippingFee(subtotal, customerData.governorate);
    const grandTotal = subtotal + shippingFee;

    const submitBtn = document.getElementById('btn-submit-order');
    const submitText = document.getElementById('submit-order-text');
    const spinner = document.getElementById('submit-order-spinner');

    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = "جاري تأكيد الطلب وحفظ الإثبات...";
    if (spinner) spinner.classList.remove('hidden');

    try {
        // توليد رقم طلب فريد بنمط ORD-2026-XXXXXX
        const currentYear = new Date().getFullYear();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const orderNumber = `ORD-${currentYear}-${randomNum}`;

        const transactionRef = document.getElementById('proof-transaction-ref')?.value.trim() || '';
        const paymentNotes = document.getElementById('proof-notes')?.value.trim() || '';

        const orderDoc = {
            orderNumber,
            customer: {
                name: customerData.name || '',
                phone: customerData.phone || '',
                email: customerData.email || '',
                governorate: customerData.governorate || '',
                city: customerData.city || '',
                address: customerData.address || '',
                notes: customerData.notes || ''
            },
            items: verifiedItems,
            subtotal,
            shippingFee,
            totalAmount: grandTotal,
            paymentMethod: selectedPaymentMethod,
            paymentStatus: 'pending_review',
            orderStatus: 'pending_review',
            paymentProof: {
                screenshotUrl: uploadedProofBase64,
                transactionRef,
                notes: paymentNotes,
                uploadedAt: Timestamp.now()
            },
            statusHistory: [
                {
                    status: 'pending_review',
                    title: 'تم استلام الطلب وبانتظار مراجعة الدفع',
                    timestamp: Timestamp.now(),
                    updatedBy: 'customer',
                    note: 'تم تقديم الطلب وإرفاق إثبات التحويل بنجاح من الموقع.'
                }
            ],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, "orders"), orderDoc);
        console.log("Order submitted successfully:", orderNumber, docRef.id);

        // إرسال إشعار فوري لـ Telegram عبر Google Apps Script السحابي و Backend API بالتوازي
        const gasWebhookUrl = "https://script.google.com/macros/s/AKfycby-g5O-K-s_Fjbv3AAjpMWJU3Bv1QhcGKADua0s6hOIm5epuv0puMT_-Q1PKgCtKJN8/exec";
        try {
            // إرسال مباشر إلى Google Apps Script لضمان الإشعار الفوري على الهاتف
            fetch(gasWebhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'notify_new_order', order: orderDoc })
            }).catch(e => console.warn("Telegram GAS notification warning:", e));
        } catch (e) {}

        try {
            // إرسال إلى الخادم الداخلي للتدقيق والتسجيل
            fetch('/api/orders/notify-new-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: orderDoc })
            }).catch(() => {});
        } catch (e) {}

        // حفظ بيانات الطلب الأخير في localStorage للعميل
        try {
            const recentOrders = JSON.parse(localStorage.getItem('macca_recent_orders') || '[]');
            recentOrders.unshift({
                orderNumber,
                phone: customerData.phone,
                total: grandTotal,
                date: new Date().toISOString()
            });
            localStorage.setItem('macca_recent_orders', JSON.stringify(recentOrders.slice(0, 10)));
        } catch (e) {
            console.warn("Could not save to recent orders:", e);
        }

        // تفريغ السلة بعد إتمام الطلب بنجاح
        clearCart();

        // ملء كارت النجاح
        const successOrderNum = document.getElementById('success-order-number');
        const successTotal = document.getElementById('success-order-total');
        const successMethod = document.getElementById('success-payment-method');
        const successTrackBtn = document.getElementById('success-track-btn');

        if (successOrderNum) successOrderNum.textContent = orderNumber;
        if (successTotal) successTotal.textContent = `${grandTotal.toFixed(2)} EGP`;
        if (successMethod) successMethod.textContent = selectedPaymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي (InstaPay)';
        if (successTrackBtn) successTrackBtn.href = `#track-order`;

        // نسخ رقم الطلب
        const copySuccessBtn = document.getElementById('copy-success-order-btn');
        if (copySuccessBtn) {
            copySuccessBtn.onclick = () => {
                navigator.clipboard.writeText(orderNumber).then(() => {
                    showToast("تم نسخ رقم الطلب: " + orderNumber);
                });
            };
        }

        // الانتقال لخطوة النجاح
        goToCheckoutStep(4);
        showToast("تهانينا! تم تسجيل طلبك بنجاح وسنقوم بمراجعته فوراً.");
    } catch (err) {
        console.error("Error creating order:", err);
        showToast("تعذر تأكيد الطلب: " + (err.message || "يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً."));
    } finally {
        isSubmitting = false;
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = "تأكيد الطلب وإرسال الإثبات";
        if (spinner) spinner.classList.add('hidden');
    }
}

/**
 * تهيئة صفحة الـ Checkout وربط كافة الأحداث
 */
export function initCheckout() {
    // 1. نموذج بيانات الشحن (Step 1)
    const shippingForm = document.getElementById('shipping-details-form');
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('cust-name')?.value.trim();
            const phone = document.getElementById('cust-phone')?.value.trim();
            const email = document.getElementById('cust-email')?.value.trim();
            const governorate = document.getElementById('cust-governorate')?.value;
            const city = document.getElementById('cust-city')?.value.trim();
            const address = document.getElementById('cust-address')?.value.trim();
            const notes = document.getElementById('cust-notes')?.value.trim();

            if (!name || !phone || !governorate || !city || !address) {
                showToast("يرجى ملء جميع الحقول الإلزامية المطلوبة.");
                return;
            }

            if (!validateEgyptianPhone(phone)) {
                showToast("يرجى إدخال رقم هاتف صحيح (مثال: 01xxxxxxxxx)");
                document.getElementById('cust-phone')?.focus();
                return;
            }

            customerData = { name, phone, email, governorate, city, address, notes };
            updateCheckoutSummary();
            updatePaymentDetailsView();
            goToCheckoutStep(2);
        });

        // تحديث الشحن عند تغيير المحافظة
        document.getElementById('cust-governorate')?.addEventListener('change', () => {
            updateCheckoutSummary();
        });
    }

    // 2. أزرار التنقل بين الخطوات
    document.getElementById('btn-back-to-step-1')?.addEventListener('click', () => goToCheckoutStep(1));
    document.getElementById('btn-to-step-3')?.addEventListener('click', () => goToCheckoutStep(3));
    document.getElementById('btn-back-to-step-2')?.addEventListener('click', () => goToCheckoutStep(2));

    // 3. اختيار طريقة الدفع (Step 2)
    document.querySelectorAll('.payment-option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.payment-option-card').forEach(c => {
                c.classList.remove('selected');
                const radio = c.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });

            card.classList.add('selected');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            selectedPaymentMethod = card.dataset.method || 'vodafone_cash';
            updatePaymentDetailsView();
        });
    });

    // 4. زر نسخ رقم/عنوان التحويل
    const copyAccountBtn = document.getElementById('copy-transfer-account-btn');
    if (copyAccountBtn) {
        copyAccountBtn.addEventListener('click', () => {
            const val = document.getElementById('transfer-account-value')?.textContent.trim();
            if (val && val !== 'جاري التحميل...') {
                navigator.clipboard.writeText(val).then(() => {
                    const origHtml = copyAccountBtn.innerHTML;
                    copyAccountBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-600"></i><span class="text-green-600 font-black">تم النسخ!</span>`;
                    if (window.lucide) window.lucide.createIcons();
                    setTimeout(() => {
                        copyAccountBtn.innerHTML = origHtml;
                        if (window.lucide) window.lucide.createIcons();
                    }, 2000);
                });
            }
        });
    }

    // 5. منطقة رفع صورة الإثبات (Step 3)
    const dropzone = document.getElementById('proof-dropzone');
    const fileInput = document.getElementById('proof-file-input');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('#remove-proof-btn')) return;
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleProofFile(e.target.files[0]);
            }
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleProofFile(e.dataTransfer.files[0]);
            }
        });
    }

    // زر إزالة / استبدال الصورة
    document.getElementById('remove-proof-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedProofBase64 = null;
        uploadedProofMeta = null;
        if (fileInput) fileInput.value = '';

        document.getElementById('proof-preview-container')?.classList.add('hidden');
        document.getElementById('proof-dropzone-placeholder')?.classList.remove('hidden');
    });

    // 6. تأكيد الطلب النهائي
    const proofForm = document.getElementById('proof-upload-form');
    if (proofForm) {
        proofForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitOrder();
        });
    }
}

/**
 * فتح صفحة الـ Checkout وتهيئة البيانات
 */
export function openCheckoutPage() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("سلّتك فارغة! أضف منتجات قبل إتمام الطلب.");
        window.location.hash = "#products";
        return;
    }

    uploadedProofBase64 = null;
    uploadedProofMeta = null;
    document.getElementById('proof-preview-container')?.classList.add('hidden');
    document.getElementById('proof-dropzone-placeholder')?.classList.remove('hidden');
    if (document.getElementById('proof-file-input')) {
        document.getElementById('proof-file-input').value = '';
    }

    goToCheckoutStep(1);
    updatePaymentDetailsView();
}
