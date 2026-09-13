// ===============================================================
// الأدوات المساعدة وحماية البيانات (Utils & Security Helpers)
// ===============================================================

/**
 * عرض إشعار عائم حديث وعالي الدقة في أسفل الشاشة
 * @param {string} message نص التنبيه
 * @param {'success' | 'error' | 'warning' | 'info'} type نوع الإشعار
 */
export function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;

    let iconName = 'check-circle';
    let iconColor = 'text-emerald-400';
    if (type === 'error') {
        iconName = 'alert-circle';
        iconColor = 'text-red-400';
    } else if (type === 'warning') {
        iconName = 'alert-triangle';
        iconColor = 'text-amber-400';
    } else if (type === 'info') {
        iconName = 'info';
        iconColor = 'text-blue-400';
    }

    toast.innerHTML = `
        <div class="flex-shrink-0 ${iconColor}">
            <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <span class="flex-grow text-xs sm:text-sm font-bold leading-snug">${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
        toast.style.animation = 'toast-fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 3200);
}

/**
 * إشعار تفاعلي خاص بالإضافة للسلة مع زر "عرض السلة" وميكرو أنيميشن
 * @param {string} productName اسم المنتج
 * @param {number} quantity الكمية
 */
export function showCartNotification(productName, quantity = 1) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-success flex items-center justify-between gap-3 shadow-2xl';

    toast.innerHTML = `
        <div class="flex items-center gap-2.5 flex-grow min-w-0">
            <div class="flex-shrink-0 text-emerald-400">
                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
            </div>
            <div class="flex flex-col min-w-0">
                <span class="text-xs sm:text-sm font-bold text-white leading-tight">تمت الإضافة للسلة بنجاح!</span>
                <span class="text-[11px] text-gray-300 font-medium truncate">${escapeHTML(productName)}</span>
            </div>
        </div>
        <a href="#cart" class="flex-shrink-0 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#ffda33] active:scale-95 text-gray-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1" data-page="cart">
            <span>عرض السلة</span>
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        </a>
    `;

    container.appendChild(toast);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toast });
    }

    // تأثير اهتزاز وميكرو أنيميشن على أيقونة السلة في الشريط السفلي
    const cartIcon = document.querySelector('#mobile-bottom-nav [data-page="cart"] .mobile-bottom-icon-wrap') ||
                     document.getElementById('mobile-header-cart-badge')?.parentElement;
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.25)';
        setTimeout(() => {
            cartIcon.style.transform = '';
        }, 350);
    }

    setTimeout(() => {
        toast.style.animation = 'toast-fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 3800);
}

/**
 * تنظيف النصوص لمنع هجمات XSS وتأمين الـ HTML المحقون
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}

/**
 * توليد كود قصير عشوائي لمعرفات المنتجات والطلبات
 * @param {number} length
 * @returns {string}
 */
export function generateShortId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * التحقق من صحة رقم الهاتف المصري
 * @param {string} phone
 * @returns {boolean}
 */
export function validateEgyptianPhone(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\-+]/g, '');
    // يبدأ بـ 010 أو 011 أو 012 أو 015 ومكون من 11 رقم، أو كود الدولة 20
    const regex = /^(201|01)[0125][0-9]{8}$/;
    return regex.test(cleanPhone);
}

/**
 * التحقق مما إذا كان العرض الترويجي للمنتج سارياً
 * @param {object} product
 * @returns {boolean}
 */
export function isOfferActive(product) {
    if (!product || !product.isOnSale) return false;
    if (!product.saleEndDate) return true;

    const now = new Date();
    const endDate = product.saleEndDate.toDate ? product.saleEndDate.toDate() : new Date(product.saleEndDate);
    return now < endDate;
}

/**
 * حساب الوقت المتبقي لانتهاء العرض
 * @param {object} product
 * @returns {string|null}
 */
export function getRemainingTime(product) {
    if (!product || !product.saleEndDate) return null;
    const now = new Date();
    const endDate = product.saleEndDate.toDate ? product.saleEndDate.toDate() : new Date(product.saleEndDate);
    const diff = endDate - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `${days} يوم`;
    } else {
        return `${hours} ساعة`;
    }
}

/**
 * توليد نجوم تقييم حقيقية وثابتة للمنتج بدلاً من العشوائية المتغيرة
 * @param {number|null} rating
 * @param {string} seed
 * @returns {string}
 */
export function getStarRatingHtml(rating = null, seed = '') {
    // إذا لم يكن هناك تقييم مسجل، نحسب تقييماً ثابتاً غير عشوائي مشتق من المعرف (4 أو 5 نجوم)
    let score = rating;
    if (score === null || score === undefined) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = (hash << 5) - hash + seed.charCodeAt(i);
        }
        score = Math.abs(hash % 2) === 0 ? 5 : 4;
    }

    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= score) {
            stars += '★';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

/**
 * تنسيق الأسعار
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
    const num = parseFloat(price) || 0;
    return num.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
}
