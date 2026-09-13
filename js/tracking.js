// ===============================================================
// نظام تتبع الطلبات والخط الزمني (Order Tracking & Timeline System)
// ===============================================================

import { db, collection, query, where, getDocs, doc, updateDoc, Timestamp } from "./firebase-config.js";
import { showToast, escapeHTML } from "./utils.js";
import { renderOrderTrackingSkeleton } from "./skeleton.js";

let currentTrackedOrder = null;
let currentTrackedDocId = null;

// المراحل السبعة القياسية للخط الزمني
const TIMELINE_STEPS = [
    { key: 'received', title: 'تم استلام الطلب', desc: 'تم استلام بيانات طلبك بنجاح وتسجيله في النظام.' },
    { key: 'payment_review', title: 'جاري مراجعة الدفع', desc: 'فريق الإدارة يقوم بمطابقة إثبات التحويل مع الحساب.' },
    { key: 'payment_confirmed', title: 'تم تأكيد الدفع', desc: 'تم اعتماد التحويل وتأكيد سداد قيمة الطلب.' },
    { key: 'processing', title: 'جاري تجهيز الطلب', desc: 'يتم فحص وتغليف المنتجات المطلوبة من المخزن.' },
    { key: 'ready_to_ship', title: 'تم تجهيز الطلب', desc: 'الطلب مغلف وجاهز للتسليم لشركة الشحن.' },
    { key: 'shipped', title: 'خرج للشحن', desc: 'الشحنة في الطريق إلى عنوانك مع مندوب التوصيل.' },
    { key: 'delivered', title: 'تم التسليم بنجاح', desc: 'تم استلام الشحنة وتأكيد التسليم بنجاح.' }
];

/**
 * تحديد مؤشر الخطوة الحالية بناءً على حالة الطلب وحالة الدفع
 */
function getStageIndex(order) {
    const status = order.orderStatus;
    const payStatus = order.paymentStatus;

    if (status === 'delivered') return 6;
    if (status === 'shipped') return 5;
    if (status === 'ready_to_ship') return 4;
    if (status === 'processing') return 3;
    if (status === 'payment_confirmed' || payStatus === 'paid') return 2;
    if (status === 'payment_review' || payStatus === 'pending_review') return 1;
    return 0;
}

/**
 * ترجمة حالات الطلب والدفع إلى شارات عربية أنيقة
 */
function getStatusBadgeHtml(status, type = 'order') {
    const orderLabels = {
        'pending_review': { label: 'بانتظار مراجعة الدفع', class: 'order-badge-pending_review' },
        'payment_confirmed': { label: 'تم تأكيد الدفع', class: 'order-badge-payment_confirmed' },
        'processing': { label: 'جاري تجهيز الطلب', class: 'order-badge-processing' },
        'ready_to_ship': { label: 'تم تجهيز الطلب', class: 'order-badge-ready_to_ship' },
        'shipped': { label: 'تم الشحن', class: 'order-badge-shipped' },
        'delivered': { label: 'تم التسليم', class: 'order-badge-delivered' },
        'payment_rejected': { label: 'مرفوض إثبات الدفع', class: 'order-badge-payment_rejected' },
        'cancelled': { label: 'تم إلغاء الطلب', class: 'order-badge-cancelled' }
    };

    const paymentLabels = {
        'pending_review': { label: 'دفع معلق للمراجعة', class: 'order-badge-pending_review' },
        'paid': { label: 'تم السداد بنجاح', class: 'order-badge-paid' },
        'rejected': { label: 'تحويل مرفوض', class: 'order-badge-payment_rejected' }
    };

    const dict = type === 'payment' ? paymentLabels : orderLabels;
    const item = dict[status] || { label: status || 'غير محدد', class: 'order-badge-pending_review' };
    return `<span class="order-badge ${item.class}">${escapeHTML(item.label)}</span>`;
}

/**
 * رسم الخط الزمني للطلب على نمط أمازون (Amazon-style Timeline)
 */
function renderTimeline(order) {
    const container = document.getElementById('tracking-timeline-steps');
    if (!container) return;

    const currentStage = getStageIndex(order);
    const isRejected = order.orderStatus === 'payment_rejected';
    const isCancelled = order.orderStatus === 'cancelled';

    container.innerHTML = TIMELINE_STEPS.map((step, index) => {
        let stepClass = '';
        let iconHtml = '';
        let dateStr = '';

        // استخراج تاريخ المرحلة من سجل التحديثات
        if (order.statusHistory && Array.isArray(order.statusHistory)) {
            const histItem = order.statusHistory.find(h => {
                if (index === 0) return true;
                if (index === 1 && (h.status === 'payment_review')) return true;
                if (index === 2 && (h.status === 'payment_confirmed')) return true;
                if (index === 3 && (h.status === 'processing')) return true;
                if (index === 4 && (h.status === 'ready_to_ship')) return true;
                if (index === 5 && (h.status === 'shipped')) return true;
                if (index === 6 && (h.status === 'delivered')) return true;
                return false;
            });

            if (histItem && histItem.timestamp) {
                const dateObj = histItem.timestamp.toDate ? histItem.timestamp.toDate() : new Date(histItem.timestamp);
                dateStr = dateObj.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) + ' - ' + dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            }
        }

        if (index < currentStage) {
            stepClass = 'completed';
            iconHtml = `<i data-lucide="check" class="w-5 h-5"></i>`;
        } else if (index === currentStage) {
            if (isRejected) {
                stepClass = 'current';
                iconHtml = `<i data-lucide="alert-circle" class="w-5 h-5 text-red-600"></i>`;
            } else if (isCancelled) {
                stepClass = 'current';
                iconHtml = `<i data-lucide="x" class="w-5 h-5 text-red-600"></i>`;
            } else {
                stepClass = 'current';
                iconHtml = `<i data-lucide="loader" class="w-5 h-5 animate-spin text-gray-900"></i>`;
            }
        } else {
            stepClass = '';
            iconHtml = `<span class="text-xs font-bold">${index + 1}</span>`;
        }

        return `
            <div class="timeline-step ${stepClass}">
                <div class="timeline-step-icon">
                    ${iconHtml}
                </div>
                <div class="timeline-content text-right flex-grow">
                    <div class="flex items-center justify-between">
                        <h4 class="text-sm font-black text-gray-900 dark:text-white">${escapeHTML(step.title)}</h4>
                        ${dateStr ? `<span class="text-[11px] font-bold text-gray-400" dir="ltr">${dateStr}</span>` : ''}
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">${escapeHTML(step.desc)}</p>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
}

/**
 * رسم تفاصيل الطلب بالكامل في صفحة التتبع
 */
function displayTrackedOrder(order, docId) {
    currentTrackedOrder = order;
    currentTrackedDocId = docId;

    const resultBox = document.getElementById('track-result-container');
    if (!resultBox) return;

    // رأس الطلب
    const orderIdEl = document.getElementById('track-order-id');
    const orderDateEl = document.getElementById('track-order-date');
    const orderBadgeEl = document.getElementById('track-order-status-badge');
    const payBadgeEl = document.getElementById('track-payment-status-badge');
    const addressEl = document.getElementById('track-delivery-address');
    const totalEl = document.getElementById('track-total-amount');

    if (orderIdEl) orderIdEl.textContent = order.orderNumber;
    
    if (orderDateEl && order.createdAt) {
        const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        orderDateEl.textContent = `تاريخ الطلب: ${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (orderBadgeEl) orderBadgeEl.outerHTML = getStatusBadgeHtml(order.orderStatus, 'order');
    if (payBadgeEl) payBadgeEl.outerHTML = getStatusBadgeHtml(order.paymentStatus, 'payment');

    if (addressEl && order.customer) {
        addressEl.textContent = `${order.customer.name} - ${order.customer.governorate}، ${order.customer.city} - ${order.customer.address} (هاتف: ${order.customer.phone})`;
    }

    if (totalEl) totalEl.textContent = `${parseFloat(order.totalAmount || 0).toFixed(2)} EGP`;

    // معالجة حالة رفض إثبات الدفع (Rejection Alert & Re-upload Form)
    const rejectionBox = document.getElementById('track-rejection-alert');
    const rejectionReasonEl = document.getElementById('track-rejection-reason');

    if (order.orderStatus === 'payment_rejected' || order.paymentStatus === 'rejected') {
        if (rejectionBox) rejectionBox.classList.remove('hidden');
        if (rejectionReasonEl) {
            const reason = order.rejectionReason || (order.statusHistory && order.statusHistory.slice(-1)[0]?.note) || "لم يتم تطابق تفاصيل التحويل مع المبلغ المطلوب.";
            rejectionReasonEl.textContent = `سبب الرفض: ${reason}`;
        }
    } else {
        if (rejectionBox) rejectionBox.classList.add('hidden');
    }

    // رسم الخط الزمني (Timeline)
    renderTimeline(order);

    // رسم سجل التحديثات
    const historyContainer = document.getElementById('track-history-logs');
    if (historyContainer && order.statusHistory) {
        historyContainer.innerHTML = order.statusHistory.map(h => {
            const d = h.timestamp ? (h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp)) : new Date();
            const dateStr = d.toLocaleDateString('ar-EG') + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                        <span class="font-bold text-gray-800 dark:text-gray-200">${escapeHTML(h.title || h.status)}</span>
                        ${h.note ? `<p class="text-[11px] text-gray-500 mt-0.5">${escapeHTML(h.note)}</p>` : ''}
                    </div>
                    <span class="text-[10px] text-gray-400 whitespace-nowrap" dir="ltr">${dateStr}</span>
                </div>
            `;
        }).join('');
    }

    resultBox.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
}

/**
 * البحث عن الطلب في فايرستور
 */
export async function trackOrder(orderNumber, phone) {
    if (!orderNumber || !phone) {
        showToast("يرجى إدخال رقم الطلب ورقم الهاتف.");
        return;
    }

    const cleanOrderNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim();

    const submitBtn = document.getElementById('track-submit-btn');
    const btnText = document.getElementById('track-btn-text');
    const spinner = document.getElementById('track-spinner');
    const resultBox = document.getElementById('track-result-container');
    const skeletonBox = document.getElementById('track-result-skeleton');

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = "جاري جلب تفاصيل الطلب...";
    if (spinner) spinner.classList.remove('hidden');

    // إظهار هيكل الـ Skeleton فورياً بأبعاد مطابقة
    if (skeletonBox) {
        skeletonBox.innerHTML = renderOrderTrackingSkeleton();
        skeletonBox.classList.remove('hidden');
    }
    if (resultBox) resultBox.classList.add('hidden');

    try {
        const q = query(
            collection(db, "orders"),
            where("orderNumber", "==", cleanOrderNum)
        );

        const querySnap = await getDocs(q);

        if (querySnap.empty) {
            if (skeletonBox) skeletonBox.classList.add('hidden');
            showToast("لم نتمكن من العثور على طلب بهذا الرقم، يرجى التأكد من الرقم والمحاولة مجدداً.");
            if (resultBox) resultBox.classList.add('hidden');
            return;
        }

        let matchedDoc = null;
        querySnap.forEach(d => {
            const data = d.data();
            // التحقق من تطابق رقم الهاتف المسجل
            const regPhone = data.customer?.phone ? String(data.customer.phone).replace(/\s+/g, '') : '';
            if (regPhone.endsWith(cleanPhone.slice(-9)) || cleanPhone.endsWith(regPhone.slice(-9))) {
                matchedDoc = { id: d.id, data };
            }
        });

        if (!matchedDoc) {
            if (skeletonBox) skeletonBox.classList.add('hidden');
            showToast("رقم الهاتف المدخل غير مطابق للهاتف المسجل في هذا الطلب.");
            if (resultBox) resultBox.classList.add('hidden');
            return;
        }

        if (skeletonBox) skeletonBox.classList.add('hidden');
        displayTrackedOrder(matchedDoc.data, matchedDoc.id);
        showToast("تم العثور على بيانات الطلب بنجاح!");
    } catch (err) {
        console.error("Error tracking order:", err);
        if (skeletonBox) skeletonBox.classList.add('hidden');
        showToast("حدث خطأ أثناء البحث عن الطلب: " + (err.message || "يرجى المحاولة لاحقاً."));
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = "تتبع الطلب";
        if (spinner) spinner.classList.add('hidden');
    }
}

/**
 * تهيئة مستمعات صفحة التتبع
 */
export function initOrderTracking() {
    const form = document.getElementById('track-order-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const orderNum = document.getElementById('track-order-number-input')?.value;
            const phone = document.getElementById('track-order-phone-input')?.value;
            trackOrder(orderNum, phone);
        });
    }

    // معالجة نموذج إعادة رفع الإثبات في حال الرفض
    const reuploadForm = document.getElementById('reupload-proof-form');
    if (reuploadForm) {
        reuploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentTrackedDocId) return;
            const fileInput = document.getElementById('reupload-proof-input');
            const file = fileInput?.files?.[0];

            if (!file) {
                showToast("يرجى اختيار صورة إثبات التحويل الجديد أولاً.");
                return;
            }

            const submitBtn = document.getElementById('reupload-submit-btn');
            const origText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'جاري رفع الإثبات الجديد...';

            try {
                // ضغط الصورة
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64 = reader.result;
                    const orderRef = doc(db, "orders", currentTrackedDocId);

                    const newHistory = currentTrackedOrder.statusHistory || [];
                    newHistory.push({
                        status: 'payment_review',
                        title: 'إعادة إرفاق إثبات الدفع',
                        timestamp: Timestamp.now(),
                        updatedBy: 'customer',
                        note: 'قام العميل بإعادة رفع إثبات تحويل جديد بعد الرفض السابق.'
                    });

                    await updateDoc(orderRef, {
                        'paymentProof.screenshotUrl': base64,
                        'paymentProof.uploadedAt': Timestamp.now(),
                        paymentStatus: 'pending_review',
                        orderStatus: 'payment_review',
                        statusHistory: newHistory,
                        updatedAt: Timestamp.now()
                    });

                    currentTrackedOrder.paymentStatus = 'pending_review';
                    currentTrackedOrder.orderStatus = 'payment_review';
                    currentTrackedOrder.statusHistory = newHistory;

                    displayTrackedOrder(currentTrackedOrder, currentTrackedDocId);
                    showToast("تم إرسال إثبات التحويل الجديد بنجاح وسيقوم المشرف بمراجعته فوراً!");
                };
            } catch (err) {
                console.error("Error re-uploading proof:", err);
                showToast("تعذر إعادة إرسال الإثبات: " + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // محاولة ملء آخر طلب مسجل للعميل تلقائياً
    try {
        const lastOrders = JSON.parse(localStorage.getItem('macca_recent_orders') || '[]');
        if (lastOrders.length > 0) {
            const last = lastOrders[0];
            const orderInput = document.getElementById('track-order-number-input');
            const phoneInput = document.getElementById('track-order-phone-input');
            if (orderInput && !orderInput.value) orderInput.value = last.orderNumber || '';
            if (phoneInput && !phoneInput.value) phoneInput.value = last.phone || '';
        }
    } catch (e) {}
}
