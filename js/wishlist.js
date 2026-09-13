// ===============================================================
// إدارة قائمة المفضلة والرغبات (Wishlist Manager)
// ===============================================================

import { showToast } from "./utils.js";

const WISHLIST_STORAGE_KEY = 'macca_wishlist_v1';
let wishlist = [];

// تحميل المفضلة من التخزين المحلي فوراً
try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) wishlist = JSON.parse(stored);
} catch (e) {
    wishlist = [];
}

function saveWishlist() {
    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
        console.error("Failed to save wishlist to localStorage", e);
    }
    updateWishlistBadge();
}

export function getWishlist() {
    return wishlist;
}

export function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId || item.shortId === productId);
}

export function toggleWishlist(product) {
    if (!product || !product.id) return;

    const index = wishlist.findIndex(item => item.id === product.id || item.shortId === product.id);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`تمت إزالة "${product.name}" من قائمة المفضلة.`);
    } else {
        wishlist.push({
            id: product.id,
            shortId: product.shortId || product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || 0,
            isOnSale: Boolean(product.isOnSale),
            imageUrls: product.imageUrls || (product.imageUrl ? [product.imageUrl] : []),
            category: product.category || 'Other',
            isAvailable: product.isAvailable !== false
        });
        showToast(`تمت إضافة "${product.name}" إلى قائمة المفضلة ❤️`);
    }

    saveWishlist();
    updateAllWishlistButtons();

    if (document.getElementById('page-wishlist')?.classList.contains('active')) {
        renderWishlistPage();
    }
}

export function updateWishlistBadge() {
    const badge = document.getElementById('wishlist-count-badge');
    const mobileBadge = document.getElementById('mobile-wishlist-badge');
    const mobileHeaderBadge = document.getElementById('mobile-header-wishlist-badge');
    const total = wishlist.length;

    [badge, mobileBadge, mobileHeaderBadge].forEach(b => {
        if (b) {
            if (total > 0) {
                b.textContent = total;
                b.classList.remove('hidden');
                b.classList.add('flex');
            } else {
                b.classList.add('hidden');
                b.classList.remove('flex');
            }
        }
    });
}

export function updateAllWishlistButtons() {
    document.querySelectorAll('.wishlist-toggle-btn').forEach(btn => {
        const id = btn.dataset.productId;
        const active = isInWishlist(id);
        btn.classList.toggle('active', active);
        const icon = btn.querySelector('i');
        if (icon) {
            if (active) {
                icon.classList.add('fill-red-500', 'text-red-500');
            } else {
                icon.classList.remove('fill-red-500', 'text-red-500');
            }
        }
    });
}

export function renderWishlistPage() {
    const container = document.getElementById('wishlist-items-grid');
    const emptyMsg = document.getElementById('wishlist-empty-message');

    if (!container || !emptyMsg) return;

    if (wishlist.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        container.classList.remove('hidden');

        // Dynamic import to render standard product cards
        import("./products.js").then(({ renderProductCard, setupAddToCartButtons }) => {
            container.innerHTML = wishlist.map(p => renderProductCard(p)).join('');
            setupAddToCartButtons();
            setupWishlistButtons();
            if (window.lucide) window.lucide.createIcons();
        });
    }
}

export function setupWishlistButtons() {
    document.querySelectorAll('.wishlist-toggle-btn').forEach(btn => {
        if (btn.dataset.wishlistAttached === 'true') return;
        btn.dataset.wishlistAttached = 'true';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const card = btn.closest('.product-card-wrapper');
            const pId = btn.dataset.productId;
            const pName = card?.dataset.productName || btn.dataset.productName || 'منتج';
            const pPrice = parseFloat(card?.dataset.productPrice || btn.dataset.productPrice || 0);
            const pImage = card?.dataset.productImage || btn.dataset.productImage || '';

            toggleWishlist({
                id: pId,
                shortId: pId,
                name: pName,
                price: pPrice,
                imageUrls: [pImage]
            });
        });
    });
}

export function initWishlist() {
    updateWishlistBadge();
}
