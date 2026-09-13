// ===============================================================
// إدارة سلة المشتريات والطلبات (Cart & Checkout Manager)
// ===============================================================

import { db, collection, addDoc, Timestamp, auth } from "./firebase-config.js";
import { showToast, showCartNotification, generateShortId, escapeHTML } from "./utils.js";

const CART_STORAGE_KEY = 'macca_cart_v1';
let cart = [];

// استرجاع عناصر السلة من LocalStorage فوراً
try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) cart = JSON.parse(saved);
} catch (e) {
    cart = [];
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
    }
    updateCartView();
}

export function getCart() {
    return cart;
}

export function clearCart() {
    cart = [];
    saveCart();
}

export function addToCart(product, quantity = 1) {
    if (!product || !product.id) return;

    // تمييز المنتج في السلة بناءً على اللون إن وجد
    const safeColorKey = product.selectedColor?.hex 
        ? String(product.selectedColor.hex).replace(/[^a-zA-Z0-9_-]/g, '') 
        : '';
    const cartItemId = safeColorKey ? `${product.id}_${safeColorKey}` : `${product.id}_default`;

    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            cartItemId,
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            image: product.image || (product.imageUrls && product.imageUrls[0]) || 'https://placehold.co/400x400/18181b/71717a?text=Macca',
            selectedColor: product.selectedColor || null,
            quantity: quantity
        });
    }

    saveCart();
    
    showCartNotification(product.name, quantity);
}

export function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
}

export function updateCartQuantity(cartItemId, quantity) {
    if (quantity < 1) {
        removeFromCart(cartItemId);
        return;
    }
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item) {
        item.quantity = quantity;
        saveCart();
    }
}

export function updateCartView() {
    const badge = document.getElementById('cart-count-badge');
    const mobileBadge = document.getElementById('mobile-cart-badge');
    const mobileHeaderBadge = document.getElementById('mobile-header-cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    [badge, mobileBadge, mobileHeaderBadge].forEach(b => {
        if (b) {
            if (totalItems > 0) {
                b.textContent = totalItems;
                b.classList.remove('hidden');
                b.classList.add('flex');
            } else {
                b.classList.add('hidden');
                b.classList.remove('flex');
            }
        }
    });

    if (document.getElementById('page-cart')?.classList.contains('active')) {
        renderCartPage();
    }
}

export function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('cart-empty-message');
    const summary = document.getElementById('cart-summary');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const freeShippingCard = document.getElementById('free-shipping-card');
    const freeShippingText = document.getElementById('free-shipping-text');
    const freeShippingFill = document.getElementById('free-shipping-fill');

    if (!container || !emptyMsg || !summary) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyMsg.classList.remove('hidden');
        summary.classList.add('hidden');
        if (freeShippingCard) freeShippingCard.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        summary.classList.remove('hidden');
        if (freeShippingCard) freeShippingCard.classList.remove('hidden');

        container.innerHTML = cart.map(item => `
            <div class="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-all" data-cart-item-id="${item.cartItemId}">
                <img src="${item.image || 'https://placehold.co/400x400/18181b/71717a?text=Macca'}" onerror="this.src='https://placehold.co/400x400/18181b/71717a?text=Macca'" alt="${escapeHTML(item.name)}" class="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-white dark:bg-[#111] p-1 rounded-xl shadow-sm">
                
                <div class="flex-grow text-center sm:text-right">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">${escapeHTML(item.name)}</h3>
                    ${item.selectedColor ? `
                        <div class="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span class="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm" style="background-color: ${item.selectedColor.hex};"></span>
                            <span>${escapeHTML(item.selectedColor.name || 'لون مخصص')}</span>
                        </div>
                    ` : ''}
                    <div class="text-sm font-bold text-[#ffcd00] mt-1">
                        ${parseFloat(item.price).toFixed(2)} ج.م للقطعة
                    </div>
                </div>

                <div class="flex items-center gap-3 sm:gap-6">
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-[#202124]">
                        <button class="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 font-bold change-qty-btn" data-cart-item-id="${item.cartItemId}" data-delta="-1">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="cart-item-quantity w-12 text-center py-1 bg-transparent font-bold text-sm focus:outline-none" data-cart-item-id="${item.cartItemId}">
                        <button class="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 font-bold change-qty-btn" data-cart-item-id="${item.cartItemId}" data-delta="1">+</button>
                    </div>

                    <p class="text-base sm:text-lg font-black text-gray-900 dark:text-white w-28 text-left" dir="ltr">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)} EGP
                    </p>

                    <button class="remove-from-cart-btn p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" data-cart-item-id="${item.cartItemId}" title="حذف المنتج">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
        if (totalEl) totalEl.textContent = `${subtotal.toFixed(2)} EGP`;

        // حساب شريط الشحن المجاني
        const FREE_SHIPPING_THRESHOLD = 1000;
        if (freeShippingText && freeShippingFill) {
            if (subtotal >= FREE_SHIPPING_THRESHOLD) {
                freeShippingText.innerHTML = `🎉 <strong>مبروك!</strong> طلبك مؤهل الآن للشحن المجاني داخل المقطم!`;
                freeShippingFill.style.width = '100%';
            } else {
                const diff = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
                const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
                freeShippingText.innerHTML = `أضف منتجات بقيمة <strong>${diff} EGP</strong> أخرى للحصول على شحن مجاني!`;
                freeShippingFill.style.width = `${pct}%`;
            }
        }

        addCartItemListeners();
    }
    if (window.lucide) window.lucide.createIcons();
}

function addCartItemListeners() {
    document.querySelectorAll('.remove-from-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItemId = e.currentTarget.dataset.cartItemId;
            removeFromCart(cartItemId);
        });
    });

    document.querySelectorAll('.cart-item-quantity').forEach(input => {
        input.addEventListener('change', (e) => {
            const cartItemId = e.currentTarget.dataset.cartItemId;
            const newQuantity = parseInt(e.currentTarget.value, 10) || 1;
            updateCartQuantity(cartItemId, newQuantity);
        });
    });

    document.querySelectorAll('.change-qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItemId = e.currentTarget.dataset.cartItemId;
            const delta = parseInt(e.currentTarget.dataset.delta, 10);
            const item = cart.find(i => i.cartItemId === cartItemId);
            if (item) {
                updateCartQuantity(cartItemId, item.quantity + delta);
            }
        });
    });
}

/**
 * تسجيل الطلب في فايرستور ثم فتح واتساب مباشرة
 */
export async function generateWhatsAppInvoice(customerData = null) {
    if (cart.length === 0) {
        showToast("سلّتك فارغة.");
        return;
    }

    const storePhone = "201146641942";
    const orderRefId = generateShortId(6).toUpperCase();
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG');
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    let subtotal = 0;
    const orderItems = cart.map(item => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        subtotal += itemTotal;
        return {
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedColor: item.selectedColor || null,
            itemTotal
        };
    });

    // 1. حفظ الطلب في Firestore لأرشفته وإدارته من قبل المشرف
    try {
        await addDoc(collection(db, "orders"), {
            orderRefId,
            customerName: customerData?.name || 'غير محدد',
            customerPhone: customerData?.phone || 'غير محدد',
            customerAddress: customerData?.address || 'غير محدد',
            customerNotes: customerData?.notes || '',
            items: orderItems,
            totalAmount: subtotal,
            status: 'pending',
            createdAt: Timestamp.now(),
            userEmail: auth.currentUser?.email || null
        });
        console.log("Order saved to Firestore successfully, ref:", orderRefId);
    } catch (err) {
        console.warn("Non-critical: Failed to save order to Firestore:", err);
    }

    // 2. إعداد رسالة الواتساب المنسقة
    let message = `👋 مرحباً متجر مكة، أود تأكيد طلب جديد:\n\n`;
    
    if (customerData) {
        message += `👤 *بيانات العميل:*\n`;
        message += `▪ الاسم: ${customerData.name}\n`;
        message += `▪ الهاتف: ${customerData.phone}\n`;
        message += `▪ العنوان: ${customerData.address}\n`;
        if (customerData.notes) {
            message += `📝 ملاحظات: ${customerData.notes}\n`;
        }
        message += `━━━━━━━━━━━━━━\n\n`;
    }

    message += `🧾 *فاتورة طلب مبدئية*\n`;
    message += `🔖 رقم المرجع: #${orderRefId}\n`;
    message += `📅 التاريخ: ${dateStr} - ${timeStr}\n`;
    message += `━━━━━━━━━━━━━━\n\n`;
    
    message += `📦 *المنتجات المطلوبة:*\n`;
    orderItems.forEach((item, index) => {
        const colorInfo = item.selectedColor ? ` (لون: ${item.selectedColor.name || 'مخصص'})` : '';
        message += `${index + 1}️⃣ *${item.name}${colorInfo}*\n`;
        message += `   ▪ الكمية: ${item.quantity}\n`;
        message += `   ▪ سعر الوحدة: ${parseFloat(item.price).toFixed(2)} ج.م\n`;
        message += `   ▪ المجموع: ${item.itemTotal.toFixed(2)} ج.م\n`;
        if (index < orderItems.length - 1) {
            message += `   --------------------\n`;
        }
    });

    message += `\n━━━━━━━━━━━━━━\n`;
    message += `💰 *ملخص الدفع:*\n`;
    message += `▫ المجموع الفرعي: ${subtotal.toFixed(2)} ج.م\n`;
    message += `🚚 الشحن: يتم تحديده عند التأكيد\n`;
    message += `📢 *الإجمالي النهائي: ${subtotal.toFixed(2)} ج.م*\n`;
    message += `━━━━━━━━━━━━━━\n\n`;
    message += `📍 *يرجى مراجعة الطلب وتأكيده مع الفني.* شكراً لكم!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodedMessage}`;

    // تفريغ السلة بعد إتمام الطلب بنجاح
    cart = [];
    saveCart();

    window.open(whatsappUrl, '_blank');
}

export function initCart() {
    updateCartView();

    // نافذة إتمام الطلب وتفاصيل العميل
    const orderModal = document.getElementById('order-details-modal');
    const closeOrderModalBtn = document.getElementById('close-order-modal-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    const orderForm = document.getElementById('order-details-form');
    const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
    const proceedCheckoutBtn = document.getElementById('proceed-to-checkout-btn');

    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', (e) => {
            if (cart.length === 0) {
                e.preventDefault();
                showToast("سلّتك فارغة! يرجى إضافة منتجات أولاً.");
            }
        });
    }

    const openOrderModal = () => {
        if (cart.length === 0) {
            showToast("سلّتك فارغة.");
            return;
        }
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.displayName) {
            const nameInput = document.getElementById('order-customer-name');
            if (nameInput && !nameInput.value) {
                nameInput.value = currentUser.displayName;
            }
        }
        if (orderModal) orderModal.classList.remove('hidden');
    };

    const closeOrderModal = () => {
        if (orderModal) orderModal.classList.add('hidden');
    };

    if (checkoutBtn) checkoutBtn.addEventListener('click', openOrderModal);
    if (closeOrderModalBtn) closeOrderModalBtn.addEventListener('click', closeOrderModal);
    if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', closeOrderModal);

    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) closeOrderModal();
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const customerData = {
                name: document.getElementById('order-customer-name').value.trim(),
                phone: document.getElementById('order-customer-phone').value.trim(),
                address: document.getElementById('order-customer-address').value.trim(),
                notes: document.getElementById('order-notes').value.trim()
            };

            closeOrderModal();
            generateWhatsAppInvoice(customerData);
        });
    }
}
