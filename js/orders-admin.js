// ===============================================================
// إدارة ومراجعة الطلبات للمشرف (Admin Orders Management & Review)
// ===============================================================

import { db, collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, auth } from "./firebase-config.js";
import { isUserAdmin } from "./auth.js";
import { showToast, escapeHTML } from "./utils.js";
import { renderAdminOrdersTableSkeleton, renderAdminStatsSkeleton } from "./skeleton.js";

let allOrders = [];
let filteredOrders = [];
let currentOrderPage = 1;
const ORDERS_PER_PAGE = 12;
let activeOrderForModal = null;
let isUnsubscribeListening = null;

const STATUS_LABELS = {
    'pending_review': { label: 'بانتظار مراجعة الدفع', class: 'order-badge-pending_review' },
    'payment_confirmed': { label: 'تم تأكيد الدفع', class: 'order-badge-payment_confirmed' },
    'processing': { label: 'جاري تجهيز الطلب', class: 'order-badge-processing' },
    'ready_to_ship': { label: 'تم تجهيز الطلب', class: 'order-badge-ready_to_ship' },
    'shipped': { label: 'تم الشحن', class: 'order-badge-shipped' },
    'delivered': { label: 'تم التسليم', class: 'order-badge-delivered' },
    'payment_rejected': { label: 'مرفوض إثبات الدفع', class: 'order-badge-payment_rejected' },
    'cancelled': { label: 'تم إلغاء الطلب', class: 'order-badge-cancelled' }
};

const PAYMENT_LABELS = {
    'pending_review': { label: 'دفع معلق للمراجعة', class: 'order-badge-pending_review' },
    'paid': { label: 'تم السداد بنجاح', class: 'order-badge-paid' },
    'rejected': { label: 'تحويل مرفوض', class: 'order-badge-payment_rejected' }
};

function getBadge(status, isPayment = false) {
    const dict = isPayment ? PAYMENT_LABELS : STATUS_LABELS;
    const item = dict[status] || { label: status || 'غير محدد', class: 'order-badge-pending_review' };
    return `<span class="order-badge ${item.class}">${escapeHTML(item.label)}</span>`;
}

/**
 * تحديث لوحة المؤشرات والإحصائيات
 */
function updateAdminStats() {
    const totalOrders = allOrders.length;
    const pendingReview = allOrders.filter(o => o.orderStatus === 'payment_review' || o.paymentStatus === 'pending_review');
    const processing = allOrders.filter(o => o.orderStatus === 'processing');
    const shipped = allOrders.filter(o => o.orderStatus === 'shipped');
    const delivered = allOrders.filter(o => o.orderStatus === 'delivered');
    
    // المبيعات المؤكدة (المدفوعة أو المسلمة)
    const totalRevenue = allOrders
        .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered' || o.orderStatus === 'payment_confirmed')
        .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

    // تحديث الكروت
    const statTotalEl = document.getElementById('stat-total-orders');
    const statPendingEl = document.getElementById('stat-pending-review');
    const statProcEl = document.getElementById('stat-processing');
    const statShipEl = document.getElementById('stat-shipped');
    const statDelivEl = document.getElementById('stat-delivered');
    const statRevEl = document.getElementById('stat-total-revenue');
    const tabPendingBadge = document.getElementById('admin-pending-badge');
    const alertBanner = document.getElementById('admin-proofs-alert-banner');
    const alertCountEl = document.getElementById('admin-proofs-alert-count');

    if (statTotalEl) statTotalEl.textContent = totalOrders;
    if (statPendingEl) statPendingEl.textContent = pendingReview.length;
    if (statProcEl) statProcEl.textContent = processing.length;
    if (statShipEl) statShipEl.textContent = shipped.length;
    if (statDelivEl) statDelivEl.textContent = delivered.length;
    if (statRevEl) statRevEl.textContent = `${totalRevenue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} EGP`;

    // شارة الطلبات المعلقة في التبويب
    if (tabPendingBadge) {
        if (pendingReview.length > 0) {
            tabPendingBadge.textContent = pendingReview.length;
            tabPendingBadge.classList.remove('hidden');
        } else {
            tabPendingBadge.classList.add('hidden');
        }
    }

    // بانر التنبيه بوجود إثباتات غير مراجعة
    if (alertBanner && alertCountEl) {
        if (pendingReview.length > 0) {
            alertBanner.classList.remove('hidden');
            alertCountEl.textContent = `يوجد ${pendingReview.length} طلبات جديدة بانتظار مراجعة وفحص سكرين شوت التحويل.`;
        } else {
            alertBanner.classList.add('hidden');
        }
    }

    renderRecentOrdersOverview();
}

/**
 * عرض أحدث 5 طلبات في تبويب النظرة العامة
 */
function renderRecentOrdersOverview() {
    const tbody = document.getElementById('admin-recent-orders-tbody');
    if (!tbody) return;

    const recent = allOrders.slice(0, 6);
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400">لا توجد طلبات مسجلة بعد.</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(order => {
        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td class="py-3 font-mono font-bold text-[#ffcd00]" dir="ltr">${escapeHTML(order.orderNumber)}</td>
                <td class="py-3 font-bold">${escapeHTML(order.customer?.name || 'عميل')}</td>
                <td class="py-3 font-black" dir="ltr">${parseFloat(order.totalAmount || 0).toFixed(2)} EGP</td>
                <td class="py-3 font-bold">${order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي'}</td>
                <td class="py-3">${getBadge(order.paymentStatus, true)}</td>
                <td class="py-3">${getBadge(order.orderStatus, false)}</td>
                <td class="py-3">
                    <button type="button" class="admin-view-order-btn px-3 py-1.5 bg-[#ffcd00]/20 hover:bg-[#ffcd00] text-gray-900 dark:text-white font-bold rounded-lg transition-colors" data-order-id="${order.id}">
                        فحص
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.admin-view-order-btn').forEach(btn => {
        btn.onclick = () => openAdminOrderModal(btn.dataset.orderId);
    });
}

/**
 * تطبيق الفلترة والفرز على قائمة الطلبات
 */
export function filterAndRenderAdminOrders() {
    const searchTerm = (document.getElementById('admin-orders-search')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('admin-orders-filter-status')?.value || 'all';
    const methodFilter = document.getElementById('admin-orders-filter-method')?.value || 'all';
    const sortBy = document.getElementById('admin-orders-sort')?.value || 'newest';

    filteredOrders = allOrders.filter(order => {
        // بحث بالرقم، الاسم، أو الهاتف
        const matchSearch = !searchTerm || 
            (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm)) ||
            (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm)) ||
            (order.customer?.phone && order.customer.phone.includes(searchTerm));

        // فلترة الحالة
        const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

        // فلترة طريقة الدفع
        const matchMethod = methodFilter === 'all' || order.paymentMethod === methodFilter;

        return matchSearch && matchStatus && matchMethod;
    });

    // الفرز
    if (sortBy === 'oldest') {
        filteredOrders.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
            return timeA - timeB;
        });
    } else if (sortBy === 'highest_total') {
        filteredOrders.sort((a, b) => (parseFloat(b.totalAmount) || 0) - (parseFloat(a.totalAmount) || 0));
    } else {
        // newest (default)
        filteredOrders.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
            return timeB - timeA;
        });
    }

    renderOrdersTable();
}

/**
 * رسم جدول الطلبات الرئيسي مع الترقيم
 */
function renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    const countLabel = document.getElementById('admin-orders-count-label');
    const pageNumEl = document.getElementById('admin-orders-page-num');
    const prevBtn = document.getElementById('admin-orders-prev-page');
    const nextBtn = document.getElementById('admin-orders-next-page');

    if (!tbody) return;

    if (countLabel) countLabel.textContent = `إجمالي الطلبات المعروضة: ${filteredOrders.length}`;

    if (filteredOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-10 text-gray-400">لا توجد طلبات مطابقة لمعايير البحث الحالية.</td></tr>`;
        if (pageNumEl) pageNumEl.textContent = "1";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
    if (currentOrderPage > totalPages) currentOrderPage = totalPages;
    if (currentOrderPage < 1) currentOrderPage = 1;

    const startIdx = (currentOrderPage - 1) * ORDERS_PER_PAGE;
    const pageItems = filteredOrders.slice(startIdx, startIdx + ORDERS_PER_PAGE);

    tbody.innerHTML = pageItems.map(order => {
        const d = order.createdAt ? (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)) : new Date();
        const dateFormatted = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                <td class="py-3 font-mono font-bold text-[#ffcd00]" dir="ltr">${escapeHTML(order.orderNumber)}</td>
                <td class="py-3 font-bold">${escapeHTML(order.customer?.name || 'عميل')}</td>
                <td class="py-3 font-bold text-gray-500 dark:text-gray-400" dir="ltr">${escapeHTML(order.customer?.phone || '')}</td>
                <td class="py-3">${escapeHTML(order.customer?.governorate || '-')}</td>
                <td class="py-3 font-black" dir="ltr">${parseFloat(order.totalAmount || 0).toFixed(2)} EGP</td>
                <td class="py-3 font-bold text-xs">${order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي'}</td>
                <td class="py-3">${getBadge(order.paymentStatus, true)}</td>
                <td class="py-3">${getBadge(order.orderStatus, false)}</td>
                <td class="py-3 text-[11px] text-gray-400 whitespace-nowrap" dir="ltr">${dateFormatted}</td>
                <td class="py-3 text-center">
                    <button type="button" class="admin-view-order-btn px-3.5 py-1.5 bg-[#ffcd00] hover:bg-[#ffda33] text-gray-900 font-bold rounded-xl shadow-sm transition-transform hover:scale-105" data-order-id="${order.id}">
                        عرض وتعديل
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (pageNumEl) pageNumEl.textContent = `${currentOrderPage} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentOrderPage <= 1;
    if (nextBtn) nextBtn.disabled = currentOrderPage >= totalPages;

    tbody.querySelectorAll('.admin-view-order-btn').forEach(btn => {
        btn.onclick = () => openAdminOrderModal(btn.dataset.orderId);
    });

    if (window.lucide) window.lucide.createIcons();
}

/**
 * فتح نافذة تفاصيل الطلب للمشرف
 */
export function openAdminOrderModal(orderDocId) {
    const order = allOrders.find(o => o.id === orderDocId);
    if (!order) return;

    activeOrderForModal = order;
    const modal = document.getElementById('admin-order-details-modal');
    if (!modal) return;

    // رأس المودال
    const numEl = document.getElementById('modal-order-number');
    const createdEl = document.getElementById('modal-order-created');
    if (numEl) numEl.textContent = order.orderNumber;
    if (createdEl && order.createdAt) {
        const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        createdEl.textContent = `تاريخ الإنشاء: ${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // بيانات العميل
    const cust = order.customer || {};
    document.getElementById('modal-cust-name').textContent = cust.name || '-';
    document.getElementById('modal-cust-phone').textContent = cust.phone || '-';
    document.getElementById('modal-cust-email').textContent = cust.email || 'غير مسجل';
    document.getElementById('modal-cust-gov').textContent = cust.governorate || '-';
    document.getElementById('modal-cust-city').textContent = cust.city || '-';
    document.getElementById('modal-cust-address').textContent = cust.address || '-';
    
    const notesRow = document.getElementById('modal-cust-notes-row');
    const notesEl = document.getElementById('modal-cust-notes');
    if (cust.notes) {
        if (notesRow) notesRow.classList.remove('hidden');
        if (notesEl) notesEl.textContent = cust.notes;
    } else {
        if (notesRow) notesRow.classList.add('hidden');
    }

    // المنتجات والمجاميع
    const tbody = document.getElementById('modal-items-tbody');
    const countEl = document.getElementById('modal-items-count');
    const subtotalEl = document.getElementById('modal-subtotal');
    const shippingEl = document.getElementById('modal-shipping');
    const totalEl = document.getElementById('modal-total');

    const items = order.items || [];
    if (countEl) countEl.textContent = items.reduce((s, i) => s + (i.quantity || 1), 0);
    if (tbody) {
        tbody.innerHTML = items.map(it => `
            <tr>
                <td class="p-2.5 flex items-center gap-2">
                    <img src="${it.image || 'https://placehold.co/60x60'}" class="w-9 h-9 object-contain bg-white dark:bg-[#111] rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white">${escapeHTML(it.name)}</p>
                        ${it.selectedColor ? `<span class="text-[10px] text-gray-400">لون: ${escapeHTML(it.selectedColor.name || it.selectedColor.hex)}</span>` : ''}
                    </div>
                </td>
                <td class="p-2.5 text-center font-bold">${it.quantity}</td>
                <td class="p-2.5 font-bold" dir="ltr">${parseFloat(it.price || 0).toFixed(2)}</td>
                <td class="p-2.5 text-left font-black" dir="ltr">${parseFloat(it.itemTotal || (it.price * it.quantity)).toFixed(2)} EGP</td>
            </tr>
        `).join('');
    }

    if (subtotalEl) subtotalEl.textContent = `${parseFloat(order.subtotal || 0).toFixed(2)} EGP`;
    if (shippingEl) shippingEl.textContent = `${parseFloat(order.shippingFee || 0).toFixed(2)} EGP`;
    if (totalEl) totalEl.textContent = `${parseFloat(order.totalAmount || 0).toFixed(2)} EGP`;

    // بيانات الدفع والإثبات
    document.getElementById('modal-pay-method').textContent = order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي';
    document.getElementById('modal-pay-ref').textContent = order.paymentProof?.transactionRef || 'غير محدد';
    document.getElementById('modal-pay-notes').textContent = order.paymentProof?.notes || 'لا توجد ملاحظات';

    const payBadge = document.getElementById('modal-payment-status-badge');
    if (payBadge) payBadge.outerHTML = getBadge(order.paymentStatus, true);

    // صورة الإثبات القابلة للتكبير
    const screenshotImg = document.getElementById('modal-screenshot-img');
    const screenshotWrapper = document.getElementById('modal-screenshot-wrapper');
    const proofUrl = order.paymentProof?.screenshotUrl;

    if (screenshotImg && screenshotWrapper) {
        if (proofUrl) {
            screenshotImg.src = proofUrl;
            screenshotWrapper.classList.remove('hidden');
            screenshotWrapper.onclick = () => openImageLightbox(proofUrl);
        } else {
            screenshotImg.src = '';
            screenshotWrapper.classList.add('hidden');
        }
    }

    // أزرار اعتماد / رفض الدفع
    const payActions = document.getElementById('modal-payment-actions');
    if (payActions) {
        if (order.paymentStatus === 'pending_review') {
            payActions.classList.remove('hidden');
        } else {
            payActions.classList.add('hidden');
        }
    }

    // قائمة تحديد الحالة الجديدة
    const statusSelect = document.getElementById('admin-change-status-select');
    if (statusSelect) statusSelect.value = order.orderStatus || 'pending_review';

    const noteInput = document.getElementById('admin-status-note-input');
    if (noteInput) noteInput.value = '';

    // سجل الحالات السابقة
    const historyTimeline = document.getElementById('modal-history-timeline');
    if (historyTimeline && order.statusHistory) {
        historyTimeline.innerHTML = order.statusHistory.map(h => {
            const d = h.timestamp ? (h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp)) : new Date();
            const dateStr = d.toLocaleDateString('ar-EG') + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="p-2 rounded-lg bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-800 text-[11px] space-y-0.5">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-gray-800 dark:text-gray-200">${escapeHTML(h.title || h.status)}</span>
                        <span class="text-gray-400 text-[10px]" dir="ltr">${dateStr}</span>
                    </div>
                    ${h.note ? `<p class="text-gray-500">${escapeHTML(h.note)}</p>` : ''}
                    <span class="text-[9px] text-gray-400 block">بواسطة: ${escapeHTML(h.updatedBy || 'المشرف')}</span>
                </div>
            `;
        }).join('');
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
}

/**
 * فتح عارض الصور المكبر (Image Lightbox)
 */
export function openImageLightbox(imgSrc) {
    const lightbox = document.getElementById('image-lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (!lightbox || !img) return;

    img.src = imgSrc;
    img.classList.remove('zoomed');
    lightbox.classList.remove('hidden');

    img.onclick = () => {
        img.classList.toggle('zoomed');
    };
}

/**
 * اعتماد الدفع للطلب النشط
 */
async function approveCurrentPayment() {
    if (!activeOrderForModal) return;

    const currentUser = auth.currentUser;
    const adminEmail = currentUser?.email || 'admin@macca';

    try {
        const orderRef = doc(db, "orders", activeOrderForModal.id);
        const newHistory = activeOrderForModal.statusHistory || [];
        newHistory.push({
            status: 'payment_confirmed',
            title: 'تم اعتماد وتأكيد الدفع',
            timestamp: Timestamp.now(),
            updatedBy: adminEmail,
            note: 'تمت مراجعة سكرين شوت التحويل والتأكد من مطابقة المبلغ بنجاح.'
        });

function notifyTelegramReverseSync(orderNumber, newStatus, statusTitle, adminEmail) {
    try {
        fetch('/api/orders/reverse-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber, newStatus, statusTitle, adminEmail })
        }).catch(() => {});
    } catch (e) {}
}

        await updateDoc(orderRef, {
            paymentStatus: 'paid',
            orderStatus: 'payment_confirmed',
            statusHistory: newHistory,
            updatedAt: Timestamp.now()
        });

        notifyTelegramReverseSync(activeOrderForModal.orderNumber, 'payment_confirmed', 'تم تأكيد الدفع', adminEmail);

        showToast(`تم تأكيد دفع الطلب ${activeOrderForModal.orderNumber} بنجاح!`);
        document.getElementById('admin-order-details-modal')?.classList.add('hidden');
    } catch (err) {
        console.error("Error approving payment:", err);
        showToast("خطأ أثناء اعتماد الدفع: " + err.message);
    }
}

/**
 * رفض إثبات الدفع مع تسجيل السبب
 */
async function rejectCurrentPayment() {
    if (!activeOrderForModal) return;

    const reason = prompt("يرجى إدخال سبب رفض إثبات التحويل (سيظهر للعميل في شاشة التتبع لإعادة الرفع):", "صورة التحويل غير واضحة أو المبلغ غير مطابق");
    if (!reason || !reason.trim()) {
        showToast("تم إلغاء عملية الرفض (السبب مطلوب).");
        return;
    }

    const currentUser = auth.currentUser;
    const adminEmail = currentUser?.email || 'admin@macca';

    try {
        const orderRef = doc(db, "orders", activeOrderForModal.id);
        const newHistory = activeOrderForModal.statusHistory || [];
        newHistory.push({
            status: 'payment_rejected',
            title: 'تم رفض إثبات التحويل',
            timestamp: Timestamp.now(),
            updatedBy: adminEmail,
            note: reason.trim()
        });

        await updateDoc(orderRef, {
            paymentStatus: 'rejected',
            orderStatus: 'payment_rejected',
            rejectionReason: reason.trim(),
            statusHistory: newHistory,
            updatedAt: Timestamp.now()
        });

        notifyTelegramReverseSync(activeOrderForModal.orderNumber, 'payment_rejected', 'مرفوض إثبات الدفع (سبب: ' + reason.trim() + ')', adminEmail);

        showToast(`تم تسجيل رفض إثبات الدفع للطلب ${activeOrderForModal.orderNumber}.`);
        document.getElementById('admin-order-details-modal')?.classList.add('hidden');
    } catch (err) {
        console.error("Error rejecting payment:", err);
        showToast("خطأ أثناء رفض الدفع: " + err.message);
    }
}

/**
 * تحديث مرحلة الطلب يدوياً من المشرف
 */
async function saveOrderStatusTransition() {
    if (!activeOrderForModal) return;

    const newStatus = document.getElementById('admin-change-status-select')?.value;
    const note = document.getElementById('admin-status-note-input')?.value.trim();

    if (!newStatus) return;

    const currentUser = auth.currentUser;
    const adminEmail = currentUser?.email || 'admin@macca';

    const statusTitleMap = {
        'pending_review': 'بانتظار مراجعة الدفع',
        'payment_confirmed': 'تم تأكيد الدفع',
        'processing': 'جاري تجهيز الطلب في المخزن',
        'ready_to_ship': 'تم تجهيز الطلب للشحن',
        'shipped': 'خرج الطلب للتوصيل مع شركة الشحن',
        'delivered': 'تم تسليم الطلب للعميل بنجاح',
        'payment_rejected': 'مرفوض إثبات الدفع',
        'cancelled': 'تم إلغاء الطلب'
    };

    try {
        const orderRef = doc(db, "orders", activeOrderForModal.id);
        const newHistory = activeOrderForModal.statusHistory || [];
        newHistory.push({
            status: newStatus,
            title: statusTitleMap[newStatus] || newStatus,
            timestamp: Timestamp.now(),
            updatedBy: adminEmail,
            note: note || `تم تغيير حالة الطلب إلى "${statusTitleMap[newStatus] || newStatus}".`
        });

        const updateData = {
            orderStatus: newStatus,
            statusHistory: newHistory,
            updatedAt: Timestamp.now()
        };

        if (newStatus === 'payment_confirmed') {
            updateData.paymentStatus = 'paid';
        }

        await updateDoc(orderRef, updateData);
        notifyTelegramReverseSync(activeOrderForModal.orderNumber, newStatus, statusTitleMap[newStatus] || newStatus, adminEmail);
        showToast("تم تحديث مرحلة الطلب بنجاح!");
        document.getElementById('admin-order-details-modal')?.classList.add('hidden');
    } catch (err) {
        console.error("Error updating order status:", err);
        showToast("خطأ أثناء تحديث حالة الطلب: " + err.message);
    }
}

/**
 * إعداد اشتراك فايرستور الحي مع الطلبات
 */
export function initOrdersAdmin() {
    // إظهار هياكل الـ Skeleton فورياً في جداول الطلبات قبل اكتمال الاستعلام السحابي
    const ordersTbody = document.getElementById('admin-orders-tbody');
    const recentTbody = document.getElementById('admin-recent-orders-tbody');
    if (ordersTbody && allOrders.length === 0) {
        ordersTbody.innerHTML = renderAdminOrdersTableSkeleton(6);
    }
    if (recentTbody && allOrders.length === 0) {
        recentTbody.innerHTML = renderAdminOrdersTableSkeleton(3);
    }

    // 1. اشتراك حي مع مجموعة الطلبات (Orders)
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    if (isUnsubscribeListening) {
        try { isUnsubscribeListening(); } catch (e) {}
    }

    isUnsubscribeListening = onSnapshot(ordersQuery, (snapshot) => {
        allOrders = [];
        snapshot.forEach(docSnap => {
            allOrders.push({ id: docSnap.id, ...docSnap.data() });
        });

        updateAdminStats();
        filterAndRenderAdminOrders();
    }, (err) => {
        console.error("Error listening to orders snapshot:", err);
    });

    // 2. مستمعات أدوات الفلترة والبحث
    document.getElementById('admin-orders-search')?.addEventListener('input', () => {
        currentOrderPage = 1;
        filterAndRenderAdminOrders();
    });

    document.getElementById('admin-orders-filter-status')?.addEventListener('change', () => {
        currentOrderPage = 1;
        filterAndRenderAdminOrders();
    });

    document.getElementById('admin-orders-filter-method')?.addEventListener('change', () => {
        currentOrderPage = 1;
        filterAndRenderAdminOrders();
    });

    document.getElementById('admin-orders-sort')?.addEventListener('change', () => {
        filterAndRenderAdminOrders();
    });

    // 3. أزرار الترقيم (Pagination)
    document.getElementById('admin-orders-prev-page')?.addEventListener('click', () => {
        if (currentOrderPage > 1) {
            currentOrderPage--;
            renderOrdersTable();
        }
    });

    document.getElementById('admin-orders-next-page')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
        if (currentOrderPage < totalPages) {
            currentOrderPage++;
            renderOrdersTable();
        }
    });

    // 4. زر التنبيه لمراجعة المعلق
    document.getElementById('admin-view-pending-btn')?.addEventListener('click', () => {
        const tabBtn = document.querySelector('[data-tab="orders"]');
        if (tabBtn) tabBtn.click();
        const statusFilter = document.getElementById('admin-orders-filter-status');
        if (statusFilter) {
            statusFilter.value = 'payment_review';
            filterAndRenderAdminOrders();
        }
    });

    // 5. أحداث مودال تفاصيل الطلب
    document.getElementById('close-admin-order-modal-btn')?.addEventListener('click', () => {
        document.getElementById('admin-order-details-modal')?.classList.add('hidden');
    });

    document.getElementById('admin-approve-payment-btn')?.addEventListener('click', approveCurrentPayment);
    document.getElementById('admin-reject-payment-btn')?.addEventListener('click', rejectCurrentPayment);
    document.getElementById('admin-save-status-btn')?.addEventListener('click', saveOrderStatusTransition);

    // 6. أحداث عارض الصور (Lightbox)
    document.getElementById('close-lightbox-btn')?.addEventListener('click', () => {
        document.getElementById('image-lightbox-modal')?.classList.add('hidden');
    });

    document.getElementById('image-lightbox-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'image-lightbox-modal') {
            document.getElementById('image-lightbox-modal')?.classList.add('hidden');
        }
    });

    // 7. تبويبات لوحة التحكم
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active', 'bg-white', 'dark:bg-[#2c2f38]', 'shadow-sm', 'text-[#ffcd00]'));
            btn.classList.add('active', 'bg-white', 'dark:bg-[#2c2f38]', 'shadow-sm', 'text-[#ffcd00]');

            document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.add('hidden'));
            const targetPane = document.getElementById(`admin-tab-content-${targetTab}`);
            if (targetPane) targetPane.classList.remove('hidden');

            if (targetTab === 'orders') {
                filterAndRenderAdminOrders();
            } else if (targetTab === 'products') {
                renderAdminProductsTable();
            }

            if (window.lucide) window.lucide.createIcons();
        });
    });
}

/**
 * رسم جدول المنتجات السريع في تبويب إدارة المنتجات
 */
export function renderAdminProductsTable() {
    import("./products.js").then(({ getAllProducts, openProductModal }) => {
        const tbody = document.getElementById('admin-products-table-tbody');
        if (!tbody) return;

        const products = getAllProducts();
        if (products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-400">لا توجد منتجات مسجلة.</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => {
            const img = p.imageUrl || (p.imageUrls && p.imageUrls[0]) || 'https://placehold.co/50x50';
            const isAvail = p.isAvailable !== false;
            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                    <td class="py-2.5">
                        <img src="${img}" class="w-10 h-10 object-contain rounded-lg bg-white dark:bg-[#111] p-1 border border-gray-200 dark:border-gray-700">
                    </td>
                    <td class="py-2.5 font-bold text-gray-900 dark:text-white max-w-[200px] truncate">${escapeHTML(p.name)}</td>
                    <td class="py-2.5 text-gray-500">${escapeHTML(p.category || '-')}</td>
                    <td class="py-2.5 font-black text-xs" dir="ltr">${parseFloat(p.price || 0).toFixed(2)} EGP</td>
                    <td class="py-2.5">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isAvail ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}">
                            ${isAvail ? 'متوفر' : 'غير متوفر'}
                        </span>
                    </td>
                    <td class="py-2.5 text-center">
                        <button type="button" class="admin-edit-prod-row px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors" data-prod-id="${p.id}">
                            تعديل
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.admin-edit-prod-row').forEach(btn => {
            btn.onclick = () => openProductModal(btn.dataset.prodId);
        });

        document.getElementById('admin-quick-add-product-btn')?.addEventListener('click', () => {
            openProductModal();
        });

        if (window.lucide) window.lucide.createIcons();
    });
}
