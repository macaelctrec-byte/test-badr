// ===============================================================
// إدارة المنتجات والعرض والتفاصيل (Products Manager)
// ===============================================================

import { 
    db, 
    collection, 
    onSnapshot, 
    query, 
    doc, 
    updateDoc, 
    addDoc, 
    deleteDoc, 
    Timestamp 
} from "./firebase-config.js";
import { isUserAdmin, onAdminStateChange } from "./auth.js";
import { addToCart } from "./cart.js";
import { isInWishlist, setupWishlistButtons } from "./wishlist.js";
import { 
    showToast, 
    escapeHTML, 
    generateShortId, 
    isOfferActive, 
    getRemainingTime, 
    getStarRatingHtml 
} from "./utils.js";
import { renderProductCardSkeleton, renderProductDetailsSkeleton } from "./skeleton.js";

let allProducts = [];
let preFilterType = 'all';
let currentGalleryImages = [];
let currentGalleryIndex = 0;
let currentSelectedColor = null;

export function getAllProducts() {
    return allProducts;
}

export function setPreFilterType(type) {
    preFilterType = type;
}

/**
 * أيقونة إضافة للسلة العصرية (عربة تسوق + علامة زائد)
 */
export const CART_PLUS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-900"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="11.5" y1="9" x2="16.5" y2="9"></line><line x1="14" y1="6.5" x2="14" y2="11.5"></line></svg>`;

/**
 * توليد كود HTML لكارت المنتج بتصميم حديث ومتكامل مع شارات العروض والمفضلة
 */
export function renderProductCard(product) {
    if (!product) return '';

    const mainImg = (product.imageUrls && product.imageUrls[0]) 
        ? product.imageUrls[0] 
        : (product.imageUrl || 'https://placehold.co/400x400/18181b/71717a?text=Macca');

    const offerActive = isOfferActive(product);
    const inWishlist = isInWishlist(product.shortId || product.id);

    // 1. شارات الخصم وحالة التوفر
    let badgesHTML = '';
    let discountPercent = 0;
    if (product.isAvailable !== false && offerActive) {
        if (product.originalPrice && product.originalPrice > product.price) {
            discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            badgesHTML += `<div class="sale-badge">خصم ${discountPercent}%</div>`;
        } else {
            badgesHTML += `<div class="sale-badge">عرض</div>`;
        }
    }

    let imageClass = 'h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105 p-2';
    let addToCartBtnState = '';
    let addToCartBtnTitle = 'إضافة للسلة';

    if (product.isAvailable === false) {
        badgesHTML += `<div class="mb-1 px-2.5 py-1 bg-gray-800 text-white text-[10px] font-bold rounded-full shadow-sm w-fit backdrop-blur-sm bg-opacity-90">غير متوفر</div>`;
        imageClass += ' grayscale opacity-60';
        addToCartBtnState = 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-400 shadow-none pointer-events-none';
        addToCartBtnTitle = 'غير متوفر حالياً';
    } else {
        addToCartBtnState = 'bg-[#ffcd00] text-gray-900 shadow-md shadow-[#ffcd00]/20 hover:bg-[#ffda33] hover:scale-110 active:scale-95';
    }

    // 2. العداد التنازلي لانتهاء العرض
    let countdownHTML = '';
    const remaining = getRemainingTime(product);
    if (remaining && product.isAvailable !== false && offerActive) {
        countdownHTML = `
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6 flex items-end justify-center pointer-events-none z-10">
                <div class="px-2 py-0.5 bg-[#ffcd00]/95 backdrop-blur-sm text-gray-900 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                    <i data-lucide="timer" class="w-3 h-3"></i>
                    <span>متبقي ${remaining}</span>
                </div>
            </div>`;
    }

    // 3. أزرار التحكم للأدمن فقط
    const isAdmin = isUserAdmin();
    const adminButtonsHTML = isAdmin ? `
        <div class="absolute top-2 right-2 z-30 flex flex-col gap-1.5">
            <button class="edit-product-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white shadow-md transition-colors" title="تعديل المنتج" data-product-id="${product.id}">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="delete-product-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-md transition-colors" title="حذف المنتج" data-product-id="${product.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>` : '';

    const pIdentifier = product.shortId || product.id;

    return `
    <div class="product-card-wrapper group relative bg-white dark:bg-[#202124] rounded-[1.5rem] border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 flex flex-col h-full"
         data-product-id="${product.id}"
         data-product-name="${escapeHTML(product.name)}"
         data-product-price="${product.price}"
         data-product-image="${mainImg}">

        <!-- قسم الصورة والشارات -->
        <div class="product-image-container relative h-36 sm:h-56 overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <div class="absolute top-2.5 left-2.5 z-20 flex flex-col items-start gap-1">
                ${badgesHTML}
            </div>

            <!-- زر إضافة للمفضلة -->
            <button class="wishlist-toggle-btn absolute top-2.5 ${isAdmin ? 'left-14' : 'left-2.5'} z-20 p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-[#202124]/80 backdrop-blur-md hover:bg-white dark:hover:bg-[#202124] shadow-sm transition-all text-gray-400 active:scale-90 ${inWishlist ? 'active' : ''}" 
                    title="${inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                    data-product-id="${pIdentifier}"
                    data-product-name="${escapeHTML(product.name)}"
                    data-product-price="${product.price}"
                    data-product-image="${mainImg}">
                <i data-lucide="heart" class="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : ''}"></i>
            </button>

            ${adminButtonsHTML}

            <a href="#product/${pIdentifier}" class="product-details-link block h-full w-full" data-product-id="${product.id}">
                <img class="${imageClass}" 
                     src="${mainImg}" 
                     onerror="this.src='https://placehold.co/400x400/18181b/71717a?text=Macca'"
                     alt="${escapeHTML(product.name)}"
                     loading="lazy">
            </a>
            
            ${countdownHTML}
        </div>

        <!-- تفاصيل المنتج -->
        <div class="product-info-box p-2.5 sm:p-5 flex flex-col flex-grow relative">
            ${product.isBestSeller ? `
                <div class="bestseller-crown-badge absolute top-[-14px] right-3 w-7 h-7 sm:w-9 sm:h-9 bg-white dark:bg-[#2c2f38] rounded-full flex items-center justify-center shadow-md border-2 border-amber-400 z-10" title="الأكثر مبيعاً">
                    <i data-lucide="crown" class="w-3 h-3 sm:w-4 sm:h-4 text-[#ffcd00] fill-current"></i>
                </div>
            ` : ''}

            <div class="capsule-tags-row flex justify-between items-center mb-1.5">
                 <div class="flex items-center gap-1">
                    ${product.company ? `
                        <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-[90px]">${escapeHTML(product.company)}</span>
                    ` : ''}
                    ${discountPercent > 0 ? `
                        <span class="capsule-discount-tag text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 px-1.5 py-0.5 rounded-full hidden">خصم ${discountPercent}%</span>
                    ` : ''}
                 </div>
                 <div class="text-[#ffcd00] text-[10px] sm:text-xs flex gap-0.5" title="تقييم العملاء">
                     ${getStarRatingHtml(product.rating, product.id)}
                 </div>
            </div>

            <a href="#product/${pIdentifier}" class="product-details-link block mb-1.5" data-product-id="${product.id}">
                <h3 class="text-xs sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#ffcd00] transition-colors h-[2.1rem] sm:h-[2.8rem]" title="${escapeHTML(product.name)}">
                    ${escapeHTML(product.name)}
                </h3>
            </a>

            <!-- السعر وزر السلة -->
            <div class="mt-auto pt-2 sm:pt-3 flex items-end justify-between gap-1.5 sm:gap-2 border-t border-dashed border-gray-100 dark:border-white/10">
                <div class="flex flex-col">
                    ${offerActive && product.isAvailable !== false ? `
                        <span class="text-[10px] sm:text-[11px] text-gray-400 line-through mb-0.5 font-medium">${parseFloat(product.originalPrice).toFixed(2)}</span>
                        <div class="flex items-baseline gap-0.5 sm:gap-1">
                            <span class="price-number text-base sm:text-2xl font-black text-red-600 dark:text-red-500">${parseFloat(product.price).toFixed(0)}</span>
                            <span class="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">ج.م</span>
                        </div>
                    ` : `
                        <span class="text-[10px] sm:text-[11px] text-transparent select-none mb-0.5">.</span>
                        <div class="flex items-baseline gap-0.5 sm:gap-1">
                            <span class="price-number text-base sm:text-2xl font-black text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(0)}</span>
                            <span class="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">ج.م</span>
                        </div>
                    `}
                </div>

                <button class="add-to-cart-btn h-8 w-8 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${addToCartBtnState}" title="${addToCartBtnTitle}">
                    ${product.isAvailable !== false 
                        ? CART_PLUS_ICON_SVG 
                        : `<i data-lucide="bell-off" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"></i>`}
                </button>
            </div>
        </div>
    </div>`;
}

/**
 * تحديث كافة واجهات عرض المنتجات
 */
export function renderAllProductViews() {
    if (document.getElementById('page-offers')?.classList.contains('active')) {
        renderOffersPage();
    }

    const searchInput = document.getElementById('product-search-input');
    const searchTerm = (searchInput?.value || '').toLowerCase().trim();
    const category = document.getElementById('product-category-filter')?.value || 'all';
    const brand = document.getElementById('product-brand-filter')?.value || 'all';
    const sort = document.getElementById('product-sort-filter')?.value || 'default';
    
    const minPrice = parseFloat(document.getElementById('product-min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('product-max-price')?.value) || 999999;

    let filtered = [...allProducts];

    // فلترة العروض أو الأكثر مبيعاً المسبقة
    if (preFilterType === 'sale') {
        filtered = filtered.filter(p => isOfferActive(p));
    } else if (preFilterType === 'bestseller') {
        filtered = filtered.filter(p => p.isBestSeller);
    }

    // البحث بالاسم والموديل والشركة
    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.company && p.company.toLowerCase().includes(searchTerm)) ||
            (p.model && p.model.toLowerCase().includes(searchTerm))
        );
    }

    // القسم والماركة
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (brand !== 'all') {
        filtered = filtered.filter(p => p.company === brand);
    }

    // نطاق السعر
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // الترتيب
    if (sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    // حقن المنتجات في الأقسام
    const offersGrid = document.getElementById('home-offers-grid');
    const bestsellersGrid = document.getElementById('home-bestsellers-grid');
    const productsGrid = document.getElementById('products-grid');
    const noProductsMsg = document.getElementById('no-products-message');
    const homeOffersSection = document.getElementById('home-offers-section');
    const homeBestsellersSection = document.getElementById('home-bestsellers-section');

    const offers = allProducts.filter(p => isOfferActive(p));
    const bestsellers = allProducts.filter(p => p.isBestSeller);

    if (offersGrid && homeOffersSection) {
        const topOffers = offers.slice(0, 12);
        if (topOffers.length > 0) {
            offersGrid.innerHTML = topOffers.map(p => renderProductCard(p)).join('');
            homeOffersSection.classList.remove('hidden');
        } else {
            homeOffersSection.classList.add('hidden');
        }
    }

    if (bestsellersGrid && homeBestsellersSection) {
        const topBestsellers = bestsellers.slice(0, 8);
        if (topBestsellers.length > 0) {
            bestsellersGrid.innerHTML = topBestsellers.map(p => renderProductCard(p)).join('');
            homeBestsellersSection.classList.remove('hidden');
        } else {
            homeBestsellersSection.classList.add('hidden');
        }
    }

    const newArrivalsGrid = document.getElementById('home-newarrivals-grid');
    const homeNewArrivalsSection = document.getElementById('home-newarrivals-section');
    if (newArrivalsGrid && homeNewArrivalsSection) {
        const latest = [...allProducts].sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        }).slice(0, 8);
        if (latest.length > 0) {
            newArrivalsGrid.innerHTML = latest.map(p => renderProductCard(p)).join('');
            homeNewArrivalsSection.classList.remove('hidden');
        } else {
            homeNewArrivalsSection.classList.add('hidden');
        }
    }

    if (productsGrid && noProductsMsg) {
        if (filtered.length === 0) {
            productsGrid.innerHTML = '';
            productsGrid.classList.add('hidden');
            noProductsMsg.classList.remove('hidden');
        } else {
            noProductsMsg.classList.add('hidden');
            productsGrid.classList.remove('hidden');
            productsGrid.innerHTML = filtered.map(p => renderProductCard(p)).join('');
        }
    }

    // تحديث مؤشر الفلاتر النشطة للموبايل
    const activeDot = document.getElementById('mobile-filter-active-dot');
    const headerActiveDot = document.getElementById('mobile-header-filter-active-dot');
    const hasFilters = (category !== 'all') || (brand !== 'all') || (sort !== 'default') || (minPrice > 0) || (maxPrice < 999999);
    if (activeDot) {
        if (hasFilters) {
            activeDot.classList.remove('hidden');
        } else {
            activeDot.classList.add('hidden');
        }
    }
    if (headerActiveDot) {
        if (hasFilters) {
            headerActiveDot.classList.remove('hidden');
        } else {
            headerActiveDot.classList.add('hidden');
        }
    }

    setupAddToCartButtons();
    setupAdminProductButtons();
    setupWishlistButtons();

    setupSliderControls('home-offers-grid', 'slider-prev-offers', 'slider-next-offers');
    setupSliderControls('home-bestsellers-grid', 'slider-prev-bestsellers', 'slider-next-bestsellers');
    setupSliderControls('home-newarrivals-grid', 'slider-prev-newarrivals', 'slider-next-newarrivals');
    initAllMobilePeekCarousels();

    if (window.lucide) window.lucide.createIcons();
}

/**
 * نظام التحكم السلس في البحث والفلترة للموبايل (Mobile Catalog Controls)
 */
export function initMobileCatalogControls() {
    const expandBtn = document.getElementById('mobile-search-expand-btn');
    const collapseBtn = document.getElementById('mobile-search-collapse-btn');
    const inputWrapper = document.getElementById('mobile-search-input-wrapper');
    const mobileSearchInput = document.getElementById('mobile-catalog-search-input');
    const desktopSearchInput = document.getElementById('product-search-input');
    const placeholderText = document.getElementById('mobile-search-placeholder-text');

    // عناصر شريط البحث بهيدر الموبايل
    const headerSearchTrigger = document.getElementById('mobile-search-trigger-btn');
    const headerSearchInputBox = document.getElementById('mobile-header-search-input-box');
    const headerSearchInput = document.getElementById('mobile-header-search-input');
    const headerSearchClose = document.getElementById('mobile-header-search-close');
    const headerSearchLabel = document.getElementById('mobile-header-search-label');

    const filterTriggerBtn = document.getElementById('mobile-filter-trigger-btn');
    const headerFilterBtn = document.getElementById('mobile-header-filter-btn');
    const filterSheet = document.getElementById('mobile-filter-sheet');
    const filterOverlay = document.getElementById('mobile-filter-overlay');
    const filterCloseBtn = document.getElementById('mobile-filter-close-btn');
    const filterApplyBtn = document.getElementById('mobile-filter-apply-btn');
    const filterResetBtn = document.getElementById('mobile-filter-reset-btn');

    const categoryFilter = document.getElementById('product-category-filter');
    const sortFilter = document.getElementById('product-sort-filter');
    const minPriceFilter = document.getElementById('product-min-price');
    const maxPriceFilter = document.getElementById('product-max-price');

    const sheetMinPrice = document.getElementById('mobile-sheet-min-price');
    const sheetMaxPrice = document.getElementById('mobile-sheet-max-price');
    const categoryChips = document.querySelectorAll('#mobile-category-chips .cat-chip');
    const sortChips = document.querySelectorAll('#mobile-sort-chips .sort-chip');

    // 1. البحث المتوسع للموبايل (صفحة المنتجات)
    if (expandBtn && inputWrapper && mobileSearchInput) {
        expandBtn.addEventListener('click', () => {
            inputWrapper.classList.remove('hidden');
            inputWrapper.classList.add('flex');
            mobileSearchInput.focus();
        });
    }

    if (collapseBtn && inputWrapper && mobileSearchInput) {
        collapseBtn.addEventListener('click', () => {
            mobileSearchInput.value = '';
            if (desktopSearchInput) desktopSearchInput.value = '';
            if (placeholderText) placeholderText.textContent = 'ابحث عن منتج، كود...';
            inputWrapper.classList.add('hidden');
            inputWrapper.classList.remove('flex');
            setPreFilterType('all');
            renderAllProductViews();
        });
    }

    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (desktopSearchInput) desktopSearchInput.value = val;
            if (headerSearchInput) headerSearchInput.value = val;
            if (placeholderText) placeholderText.textContent = val.trim() ? val : 'ابحث عن منتج، كود...';
            if (headerSearchLabel) headerSearchLabel.textContent = val.trim() ? val : 'ابحث عن منتج، كود...';
            setPreFilterType('all');
            renderAllProductViews();
        });
    }

    // 1.1. البحث المتوسع للموبايل (شريط هيدر التطبيق)
    if (headerSearchTrigger && headerSearchInputBox && headerSearchInput) {
        headerSearchTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            headerSearchInputBox.classList.remove('hidden');
            headerSearchInputBox.classList.add('is-expanded');
            headerSearchInput.focus();
        });
    }

    if (headerSearchClose && headerSearchInputBox && headerSearchInput) {
        headerSearchClose.addEventListener('click', (e) => {
            e.stopPropagation();
            headerSearchInput.value = '';
            if (desktopSearchInput) desktopSearchInput.value = '';
            if (mobileSearchInput) mobileSearchInput.value = '';
            if (headerSearchLabel) headerSearchLabel.textContent = 'ابحث عن منتج، كود...';
            if (placeholderText) placeholderText.textContent = 'ابحث عن منتج، كود...';
            headerSearchInputBox.classList.add('hidden');
            headerSearchInputBox.classList.remove('is-expanded');
            setPreFilterType('all');
            renderAllProductViews();
        });
    }

    if (headerSearchInput) {
        headerSearchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (desktopSearchInput) desktopSearchInput.value = val;
            if (mobileSearchInput) mobileSearchInput.value = val;
            if (headerSearchLabel) headerSearchLabel.textContent = val.trim() ? val : 'ابحث عن منتج، كود...';
            if (placeholderText) placeholderText.textContent = val.trim() ? val : 'ابحث عن منتج، كود...';
            setPreFilterType('all');
            renderAllProductViews();
        });

        headerSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (window.location.hash !== '#products') {
                    window.location.hash = '#products';
                }
            }
        });
    }

    // 2. شيت الفلاتر المنبثق من الأسفل (Bottom Sheet)
    function openSheet() {
        if (!filterSheet || !filterOverlay) return;
        const currentCat = categoryFilter?.value || 'all';
        categoryChips.forEach(chip => {
            if (chip.dataset.val === currentCat) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        const currentSort = sortFilter?.value || 'default';
        sortChips.forEach(chip => {
            if (chip.dataset.sort === currentSort) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        if (sheetMinPrice) sheetMinPrice.value = minPriceFilter?.value || '';
        if (sheetMaxPrice) sheetMaxPrice.value = maxPriceFilter?.value || '';

        filterOverlay.classList.remove('opacity-0', 'pointer-events-none');
        filterOverlay.classList.add('opacity-100', 'pointer-events-auto');
        filterSheet.classList.remove('translate-y-full');
        filterSheet.classList.add('translate-y-0');
        document.body.classList.add('overflow-hidden');
    }

    function closeSheet() {
        if (!filterSheet || !filterOverlay) return;
        filterOverlay.classList.add('opacity-0', 'pointer-events-none');
        filterOverlay.classList.remove('opacity-100', 'pointer-events-auto');
        filterSheet.classList.add('translate-y-full');
        filterSheet.classList.remove('translate-y-0');
        document.body.classList.remove('overflow-hidden');
    }

    if (filterTriggerBtn) {
        filterTriggerBtn.addEventListener('click', openSheet);
    }
    if (headerFilterBtn) {
        headerFilterBtn.addEventListener('click', openSheet);
    }
    if (filterCloseBtn) {
        filterCloseBtn.addEventListener('click', closeSheet);
    }
    if (filterOverlay) {
        filterOverlay.addEventListener('click', closeSheet);
    }

    // تحديد الأقسام والترتيب عبر الشرائح
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    sortChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sortChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // تطبيق الفلاتر
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener('click', () => {
            const activeCatChip = document.querySelector('#mobile-category-chips .cat-chip.active');
            const selectedCat = activeCatChip ? activeCatChip.dataset.val : 'all';
            if (categoryFilter) categoryFilter.value = selectedCat;

            const activeSortChip = document.querySelector('#mobile-sort-chips .sort-chip.active');
            const selectedSort = activeSortChip ? activeSortChip.dataset.sort : 'default';
            if (sortFilter) sortFilter.value = selectedSort;

            if (minPriceFilter && sheetMinPrice) minPriceFilter.value = sheetMinPrice.value;
            if (maxPriceFilter && sheetMaxPrice) maxPriceFilter.value = sheetMaxPrice.value;

            closeSheet();
            if (window.location.hash !== '#products') {
                window.location.hash = '#products';
            }
            setPreFilterType('all');
            renderAllProductViews();
        });
    }

    // إعادة ضبط الفلاتر
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            const defaultCat = document.querySelector('#mobile-category-chips .cat-chip[data-val="all"]');
            if (defaultCat) defaultCat.classList.add('active');
            if (categoryFilter) categoryFilter.value = 'all';

            sortChips.forEach(c => c.classList.remove('active'));
            const defaultSort = document.querySelector('#mobile-sort-chips .sort-chip[data-sort="default"]');
            if (defaultSort) defaultSort.classList.add('active');
            if (sortFilter) sortFilter.value = 'default';

            if (minPriceFilter) minPriceFilter.value = '';
            if (maxPriceFilter) maxPriceFilter.value = '';
            if (sheetMinPrice) sheetMinPrice.value = '';
            if (sheetMaxPrice) sheetMaxPrice.value = '';

            closeSheet();
            setPreFilterType('all');
            renderAllProductViews();
        });
    }
}

/**
 * صفحة العروض المخصصة (#offers)
 */
export function renderOffersPage() {
    const grid = document.getElementById('offers-page-grid');
    const noOffersMsg = document.getElementById('no-offers-message');
    const daysEl = document.getElementById('offer-timer-days');
    const hoursEl = document.getElementById('offer-timer-hours');
    const minutesEl = document.getElementById('offer-timer-minutes');
    const avgTimerEl = document.getElementById('average-offer-timer');

    if (!grid || !noOffersMsg) return;

    const offers = allProducts.filter(p => isOfferActive(p) && p.isAvailable !== false);

    if (avgTimerEl && daysEl && hoursEl && minutesEl) {
        const offersWithDate = offers.filter(p => p.saleEndDate);
        if (offersWithDate.length > 0) {
            const totalMs = offersWithDate.reduce((sum, p) => {
                const endDate = p.saleEndDate.toDate ? p.saleEndDate.toDate() : new Date(p.saleEndDate);
                return sum + endDate.getTime();
            }, 0);
            const avgMs = totalMs / offersWithDate.length;
            const diff = avgMs - new Date().getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                daysEl.textContent = String(days).padStart(2, '0');
                hoursEl.textContent = String(hours).padStart(2, '0');
                minutesEl.textContent = String(minutes).padStart(2, '0');
                avgTimerEl.classList.remove('hidden');
                avgTimerEl.classList.add('flex');
            } else {
                avgTimerEl.classList.add('hidden');
            }
        } else {
            avgTimerEl.classList.add('hidden');
        }
    }

    if (allProducts.length === 0) {
        grid.innerHTML = renderProductCardSkeleton(6);
        grid.classList.remove('hidden');
        noOffersMsg.classList.add('hidden');
        return;
    }

    if (offers.length === 0) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
        noOffersMsg.classList.remove('hidden');
    } else {
        noOffersMsg.classList.add('hidden');
        grid.classList.remove('hidden');
        grid.innerHTML = offers.map(p => renderProductCard(p)).join('');
    }

    setupAddToCartButtons();
    setupAdminProductButtons();
    setupWishlistButtons();
    if (window.lucide) window.lucide.createIcons();
}

/**
 * عرض صفحة تفاصيل المنتج كاملة
 */
export function renderProductDetails(productId) {
    const skeletonEl = document.getElementById('product-details-skeleton');
    const contentEl = document.getElementById('product-details-content');

    const product = allProducts.find(p => p.shortId === productId || p.id === productId);

    if (!product) {
        if (allProducts.length === 0) {
            if (skeletonEl) {
                skeletonEl.innerHTML = renderProductDetailsSkeleton();
                skeletonEl.classList.remove('hidden');
            }
            if (contentEl) contentEl.classList.add('hidden');
            return;
        }
        console.warn("Product not found:", productId);
        window.location.hash = '#products';
        return;
    }

    if (skeletonEl) skeletonEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');

    // تحديث مسار التنقل Breadcrumbs
    const breadcrumbCategory = document.getElementById('details-breadcrumb-category');
    const breadcrumbProduct = document.getElementById('details-breadcrumb-product');
    const categoryTranslations = {
        'Lighting': 'إضاءة', 'Cables': 'كابلات', 'Switches': 'مفاتيح',
        'Paints': 'دهانات', 'Parts': 'قطع غيار', 'Ironmongery': 'حدايد',
        'Showers': 'الدش', 'Electronics': 'الكترونيات',
        'OpticalPanels': 'لوحات', 'BuildingMaterials': 'مواد بناء', 'Other': 'أخرى'
    };

    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = categoryTranslations[product.category] || product.category || 'المنتجات';
        breadcrumbCategory.href = `#products`;
    }
    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = product.name;
    }

    const placeholder = 'https://placehold.co/600x600/18181b/71717a?text=Macca';
    const mainImgEl = document.getElementById('main-product-image');
    const thumbnailContainer = document.getElementById('details-thumbnail-container');

    const imageUrls = (product.imageUrls && product.imageUrls.length > 0) 
        ? product.imageUrls 
        : [product.imageUrl || placeholder];

    currentGalleryImages = imageUrls;
    currentGalleryIndex = 0;
    currentSelectedColor = null;

    if (mainImgEl) {
        mainImgEl.src = imageUrls[0];
        mainImgEl.alt = product.name;
    }

    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = '';
        imageUrls.forEach((url, index) => {
            const thumb = document.createElement('div');
            thumb.className = `cursor-pointer rounded-xl overflow-hidden h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 border-2 transition-all p-1 bg-white dark:bg-[#202124] ${index === 0 ? 'border-[#ffcd00] ring-2 ring-[#ffcd00]/30' : 'border-transparent hover:border-gray-300'}`;
            thumb.innerHTML = `<img src="${url}" alt="صورة مصغرة ${index + 1}" class="w-full h-full object-contain" onerror="this.src='${placeholder}'">`;
            
            thumb.onclick = () => {
                currentGalleryIndex = index;
                if (mainImgEl) mainImgEl.src = url;
                Array.from(thumbnailContainer.children).forEach(c => {
                    c.classList.remove('border-[#ffcd00]', 'ring-2', 'ring-[#ffcd00]/30');
                    c.classList.add('border-transparent');
                });
                thumb.classList.remove('border-transparent');
                thumb.classList.add('border-[#ffcd00]', 'ring-2', 'ring-[#ffcd00]/30');
            };
            thumbnailContainer.appendChild(thumb);
        });
    }

    // معلومات وتصنيف
    const nameEl = document.getElementById('details-product-name');
    const descEl = document.getElementById('details-product-description');
    const priceEl = document.getElementById('details-product-price');
    const categoryEl = document.getElementById('details-product-category');
    const companyEl = document.getElementById('details-product-company');
    const ratingEl = document.getElementById('details-star-rating');

    if (nameEl) nameEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description || "لا يوجد وصف إضافي متوفر حالياً لهذا المنتج.";
    if (categoryEl) categoryEl.textContent = categoryTranslations[product.category] || product.category;
    if (companyEl) {
        if (product.company) {
            companyEl.textContent = product.company;
            companyEl.classList.remove('hidden');
        } else {
            companyEl.classList.add('hidden');
        }
    }
    if (ratingEl) {
        ratingEl.innerHTML = getStarRatingHtml(product.rating, product.id) + '<span class="text-xs text-gray-400 font-medium mr-2">(تقييم معتمد)</span>';
    }

    // السعر
    if (priceEl) {
        if (isOfferActive(product) && product.originalPrice && product.originalPrice > product.price) {
            const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            priceEl.innerHTML = `
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(0)} <span class="text-base font-bold text-gray-500">ج.م</span></span>
                        <span class="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">خصم ${discountPercent}%</span>
                    </div>
                    <span class="text-sm text-gray-400 line-through">السعر الأصلي: ${parseFloat(product.originalPrice).toFixed(2)} ج.م</span>
                </div>
            `;
        } else {
            priceEl.innerHTML = `
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(0)}</span>
                    <span class="text-base font-bold text-gray-500">ج.م</span>
                </div>
            `;
        }
    }

    // الألوان
    const colorSection = document.getElementById('details-color-options');
    const swatchesContainer = document.getElementById('color-swatches-container');
    if (colorSection && swatchesContainer) {
        if (product.colorOptions && Array.isArray(product.colorOptions) && product.colorOptions.length > 0) {
            swatchesContainer.innerHTML = '';
            product.colorOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md hover:scale-110 transition-transform focus:outline-none';
                btn.style.backgroundColor = opt.hex;
                btn.title = opt.name || opt.hex;
                btn.onclick = () => {
                    currentSelectedColor = opt;
                    if (opt.imageUrl && mainImgEl) mainImgEl.src = opt.imageUrl;
                    Array.from(swatchesContainer.children).forEach(b => b.classList.remove('ring-2', 'ring-[#ffcd00]'));
                    btn.classList.add('ring-2', 'ring-[#ffcd00]');
                };
                swatchesContainer.appendChild(btn);
            });
            colorSection.classList.remove('hidden');
        } else {
            colorSection.classList.add('hidden');
        }
    }

    // زر الشراء والسلة
    const cartWrapper = document.getElementById('details-add-to-cart-wrapper');
    if (cartWrapper) {
        cartWrapper.dataset.productId = product.id;
        cartWrapper.dataset.productName = product.name;
        cartWrapper.dataset.productPrice = product.price;
        cartWrapper.dataset.productImage = imageUrls[0];

        if (product.isAvailable === false) {
            cartWrapper.innerHTML = `
                <div class="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-center font-bold text-gray-500">
                    المنتج غير متوفر في المخزون حالياً
                </div>
                <a href="https://wa.me/201146641942?text=${encodeURIComponent('أرغب في الاستفسار عن موعد توفر: ' + product.name)}" target="_blank" class="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-colors">
                    <i data-lucide="message-circle" class="w-5 h-5"></i>
                    <span>تنبيهي عند التوفر عبر واتساب</span>
                </a>
            `;
        } else {
            cartWrapper.innerHTML = `
                <div class="flex gap-3">
                    <div class="w-28 relative">
                        <input type="number" id="details-quantity-input" value="1" min="1" class="w-full text-center py-3.5 px-2 bg-gray-100 dark:bg-white/5 rounded-xl font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#ffcd00]" aria-label="الكمية">
                    </div>
                    <button id="details-add-cart-btn" class="flex-1 bg-[#ffcd00] hover:bg-[#ffda33] text-gray-900 font-black text-lg py-3.5 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="11.5" y1="9" x2="16.5" y2="9"></line><line x1="14" y1="6.5" x2="14" y2="11.5"></line></svg>
                        <span>أضف إلى السلة</span>
                    </button>
                </div>
                <a href="https://wa.me/201146641942?text=${encodeURIComponent('أود طلب المنتج مباشرة: ' + product.name)}" target="_blank" class="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/15 rounded-xl hover:bg-green-100 transition-colors">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span>طلب مباشر وسريع عبر واتساب</span>
                </a>
            `;

            const addBtn = document.getElementById('details-add-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    const qty = parseInt(document.getElementById('details-quantity-input')?.value, 10) || 1;
                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: imageUrls[0],
                        selectedColor: currentSelectedColor
                    }, qty);
                });
            }
        }
    }

    // المواصفات الفنية
    const specsContainer = document.getElementById('specs-list-container');
    if (specsContainer) {
        specsContainer.innerHTML = '';
        const specs = [
            { label: 'الشركة المصنعة', value: product.company },
            { label: 'الجهد الكهربي', value: product.volts, unit: 'فولت' },
            { label: 'القدرة', value: product.watt, unit: 'واط' },
            { label: 'شدة الإضاءة', value: product.lumens, unit: 'لومن' },
            { label: 'الضمان', value: product.warranty },
            { label: 'بلد المنشأ', value: product.madeIn },
            { label: 'رقم الموديل', value: product.model },
            { label: 'العمر الافتراضي', value: product.lifespan },
            { label: 'شدة التيار', value: product.currentIntensity },
            { label: 'المقاسات', value: product.sizes },
            { label: 'الوزن', value: product.weight },
            { label: 'الأبعاد', value: product.size },
            { label: 'الطول', value: product.length, unit: 'متر' }
        ];

        let hasSpecs = false;
        specs.forEach(s => {
            if (s.value && String(s.value).trim() !== '') {
                hasSpecs = true;
                specsContainer.innerHTML += `
                    <li class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${s.label}</span>
                        <span class="text-xs font-bold text-gray-900 dark:text-white" dir="ltr">${s.value} ${s.unit || ''}</span>
                    </li>
                `;
            }
        });

        if (!hasSpecs) {
            specsContainer.innerHTML = '<li class="py-3 text-center text-gray-400 text-xs">لا توجد مواصفات فنية إضافية مسجلة.</li>';
        }
    }

    fetchProductSuggestions(product.id, product.category);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * اقتراحات منتجات مشابهة في صفحة التفاصيل
 */
function fetchProductSuggestions(productId, category) {
    const desktopGrid = document.getElementById('ai-suggestions-grid-desktop');
    const mobileGrid = document.getElementById('ai-suggestions-grid-mobile');

    const similar = allProducts
        .filter(p => p.id !== productId && p.shortId !== productId && p.category === category && p.isAvailable !== false)
        .slice(0, 4);

    const fallback = similar.length < 4 
        ? allProducts.filter(p => p.id !== productId && p.isAvailable !== false).slice(0, 4)
        : similar;

    const html = fallback.map(p => renderProductCard(p)).join('');
    if (desktopGrid) desktopGrid.innerHTML = html;
    if (mobileGrid) mobileGrid.innerHTML = html;

    setupAddToCartButtons();
    setupWishlistButtons();
    if (window.lucide) window.lucide.createIcons();
}

/**
 * إعداد أزرار إضافة للسلة في جميع الكروت
 */
export function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        if (btn.dataset.listenerAttached === 'true') return;
        btn.dataset.listenerAttached = 'true';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const card = btn.closest('.product-card-wrapper');
            if (!card) return;

            addToCart({
                id: card.dataset.productId,
                name: card.dataset.productName,
                price: parseFloat(card.dataset.productPrice) || 0,
                image: card.dataset.productImage
            }, 1);
        });
    });
}

/**
 * أزرار تعديل وحذف المنتجات للمشرف
 */
export function setupAdminProductButtons() {
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        if (btn.dataset.listenerAttached === 'true') return;
        btn.dataset.listenerAttached = 'true';

        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            const id = btn.dataset.productId;
            if (!id) return;
            if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟")) {
                try {
                    await deleteDoc(doc(db, "products", id));
                    showToast("تم حذف المنتج بنجاح.");
                } catch (err) {
                    console.error("Error deleting product:", err);
                    showToast("خطأ: " + (err.message || "تعذر الحذف"));
                }
            }
        });
    });

    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        if (btn.dataset.listenerAttached === 'true') return;
        btn.dataset.listenerAttached = 'true';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const id = btn.dataset.productId;
            const product = allProducts.find(p => p.id === id);
            if (product) openProductModal(product);
        });
    });
}

/**
 * إضافة صف لاختيار لون إضافي في النافذة المنبثقة
 */
export function addColorVariantRow(color = '#000000', name = '', imageUrl = '') {
    const container = document.getElementById('color-variants-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'color-variant-row flex items-center gap-2 p-2 bg-white dark:bg-[#202124] rounded-xl border border-gray-200 dark:border-gray-700';

    row.innerHTML = `
        <input type="color" class="color-input w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent" value="${color}">
        <input type="text" class="color-name-input flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-600" placeholder="اسم اللون (مثال: أبيض، ذهبي)" value="${escapeHTML(name)}">
        <input type="url" class="color-image-input flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-600" placeholder="رابط صورة هذا اللون (اختياري)" value="${escapeHTML(imageUrl)}" dir="ltr">
        <button type="button" class="remove-color-btn p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;

    row.querySelector('.remove-color-btn').onclick = () => row.remove();
    container.appendChild(row);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * إعادة تهيئة نافذة إضافة المنتج لوضع الإضافة الجديد
 */
export function resetModalToAddMode() {
    const modalTitle = document.getElementById('modal-title');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
    const form = document.getElementById('add-product-form');
    const originalPriceContainer = document.getElementById('original-price-container');
    const colorContainer = document.getElementById('color-variants-container');

    if (modalTitle) modalTitle.textContent = "إضافة منتج جديد";
    if (modalSubmitBtn) modalSubmitBtn.textContent = "حفظ المنتج";

    if (form) {
        form.reset();
        delete form.dataset.editingId;
    }

    if (originalPriceContainer) originalPriceContainer.classList.add('hidden');
    if (colorContainer) colorContainer.innerHTML = '';

    const availCheck = document.getElementById('isAvailable');
    if (availCheck) availCheck.checked = true;

    const savedBaseUrl = localStorage.getItem('admin_img_base_url');
    const baseInput = document.getElementById('imgBaseUrl');
    if (baseInput) {
        baseInput.value = savedBaseUrl || 'https://i.postimg.cc/';
    }
}

/**
 * فتح نافذة إضافة أو تعديل المنتج
 */
export function openProductModal(product = null) {
    const modal = document.getElementById('add-product-modal');
    const form = document.getElementById('add-product-form');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');
    const onSaleCheck = document.getElementById('isOnSale');
    const originalPriceContainer = document.getElementById('original-price-container');
    const colorContainer = document.getElementById('color-variants-container');

    if (!modal || !form) return;

    if (product) {
        if (title) title.textContent = "تعديل المنتج";
        if (submitBtn) submitBtn.textContent = "تحديث المنتج";
        form.dataset.editingId = product.id;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val !== undefined ? val : '';
        };

        setVal('productName', product.name);
        setVal('productPrice', product.price);
        setVal('productCategory', product.category || 'Lighting');
        setVal('productDescription', product.description);
        setVal('productCompany', product.company);
        setVal('productVolts', product.volts);
        setVal('productLength', product.length);
        setVal('productWarranty', product.warranty);
        setVal('productMadeIn', product.madeIn);
        setVal('productModel', product.model);
        setVal('productLumens', product.lumens);
        setVal('productLifespan', product.lifespan);
        setVal('productCurrent', product.currentIntensity);
        setVal('productWatt', product.watt);
        setVal('productSizes', product.sizes);
        setVal('productWeight', product.weight);
        setVal('productSize', product.size);

        // تحليل الصورة الرئيسية
        const allImages = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
        const mainUrl = allImages.length > 0 ? allImages[0] : '';

        if (mainUrl) {
            const matchExt = mainUrl.match(/(\.jpg|\.png|\.jpeg|\.webp)$/i);
            const ext = matchExt ? matchExt[0].toLowerCase() : '';
            const extSelect = document.getElementById('imgExtension');
            if (extSelect && ext) extSelect.value = ext;

            let urlWithoutExt = mainUrl;
            if (matchExt) {
                urlWithoutExt = mainUrl.substring(0, mainUrl.lastIndexOf(ext));
            }

            const savedBase = localStorage.getItem('admin_img_base_url') || 'https://i.postimg.cc/';
            if (savedBase && urlWithoutExt.startsWith(savedBase)) {
                setVal('imgBaseUrl', savedBase);
                setVal('imgName', urlWithoutExt.substring(savedBase.length));
            } else {
                setVal('imgBaseUrl', '');
                setVal('imgName', mainUrl);
            }
        } else {
            setVal('imgBaseUrl', localStorage.getItem('admin_img_base_url') || 'https://i.postimg.cc/');
            setVal('imgName', '');
        }

        setVal('productGalleryImages', allImages.slice(1).join(', '));

        const availCheck = document.getElementById('isAvailable');
        if (availCheck) availCheck.checked = product.isAvailable !== false;

        const bestCheck = document.getElementById('isBestSeller');
        if (bestCheck) bestCheck.checked = Boolean(product.isBestSeller);

        if (onSaleCheck) {
            onSaleCheck.checked = Boolean(product.isOnSale);
            if (product.isOnSale) {
                originalPriceContainer?.classList.remove('hidden');
                setVal('originalPrice', product.originalPrice);
                if (product.saleEndDate) {
                    const d = product.saleEndDate.toDate ? product.saleEndDate.toDate() : new Date(product.saleEndDate);
                    setVal('saleEndDate', d.toISOString().slice(0, 16));
                }
            } else {
                originalPriceContainer?.classList.add('hidden');
            }
        }

        // الألوان المخصصة
        if (colorContainer) {
            colorContainer.innerHTML = '';
            if (product.colorOptions && Array.isArray(product.colorOptions)) {
                product.colorOptions.forEach(opt => {
                    addColorVariantRow(opt.hex, opt.name, opt.imageUrl);
                });
            }
        }

    } else {
        resetModalToAddMode();
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
}

/**
 * ربط وتفعيل نموذج إضافة وتعديل المنتج (Submit Handler)
 */
export function initProductForm() {
    const form = document.getElementById('add-product-form');
    const modal = document.getElementById('add-product-modal');
    const closeModalBtn = document.getElementById('close-add-product-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-add-product-btn');
    const isOnSaleCheckbox = document.getElementById('isOnSale');
    const originalPriceContainer = document.getElementById('original-price-container');
    const addColorBtn = document.getElementById('add-color-variant-btn');

    // إغلاق النافذة
    const closeModal = () => {
        resetModalToAddMode();
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = '';
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // تفعيل / إخفاء حقل السعر قبل الخصم
    if (isOnSaleCheckbox && originalPriceContainer) {
        isOnSaleCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                originalPriceContainer.classList.remove('hidden');
            } else {
                originalPriceContainer.classList.add('hidden');
            }
        });
    }

    // زر إضافة لون
    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => addColorVariantRow());
    }

    // إرسال وحفظ النموذج في فايرستور
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('modal-submit-btn');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'حفظ';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'جاري الحفظ...';
            }

            const editingId = form.dataset.editingId;

            // تركيب رابط الصورة
            const baseUrl = document.getElementById('imgBaseUrl')?.value.trim() || '';
            const imgName = document.getElementById('imgName')?.value.trim() || '';
            const imgExt = document.getElementById('imgExtension')?.value || '';

            if (baseUrl) {
                localStorage.setItem('admin_img_base_url', baseUrl);
            }

            let mainImageUrl = '';
            if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
                mainImageUrl = imgName;
            } else if (baseUrl && imgName) {
                mainImageUrl = baseUrl + imgName + imgExt;
            } else {
                mainImageUrl = imgName;
            }

            // صور المعرض
            const galleryString = document.getElementById('productGalleryImages')?.value || '';
            const galleryUrls = galleryString.split(',')
                .map(u => u.trim())
                .filter(u => u.length > 0);

            const finalImageUrls = [];
            if (mainImageUrl) finalImageUrls.push(mainImageUrl);
            finalImageUrls.push(...galleryUrls);

            // استخراج الألوان
            const colorVariants = [];
            document.querySelectorAll('.color-variant-row').forEach(row => {
                const color = row.querySelector('.color-input')?.value;
                const name = row.querySelector('.color-name-input')?.value.trim();
                const image = row.querySelector('.color-image-input')?.value.trim();
                if (color) {
                    colorVariants.push({ hex: color, name: name, imageUrl: image });
                }
            });

            const isOnSale = document.getElementById('isOnSale')?.checked || false;
            const originalPriceVal = parseFloat(document.getElementById('originalPrice')?.value) || 0;
            const saleEndDateVal = document.getElementById('saleEndDate')?.value;

            const productData = {
                name: document.getElementById('productName')?.value.trim() || '',
                price: parseFloat(document.getElementById('productPrice')?.value) || 0,
                imageUrls: finalImageUrls,
                category: document.getElementById('productCategory')?.value || 'Lighting',
                description: document.getElementById('productDescription')?.value.trim() || '',
                isOnSale: isOnSale,
                isBestSeller: document.getElementById('isBestSeller')?.checked || false,
                isAvailable: document.getElementById('isAvailable')?.checked !== false,
                originalPrice: isOnSale ? originalPriceVal : 0,
                saleEndDate: (isOnSale && saleEndDateVal) ? Timestamp.fromDate(new Date(saleEndDateVal)) : null,
                company: document.getElementById('productCompany')?.value.trim() || '',
                volts: document.getElementById('productVolts')?.value.trim() || '',
                length: document.getElementById('productLength')?.value.trim() || '',
                warranty: document.getElementById('productWarranty')?.value.trim() || '',
                madeIn: document.getElementById('productMadeIn')?.value.trim() || '',
                model: document.getElementById('productModel')?.value.trim() || '',
                lumens: document.getElementById('productLumens')?.value.trim() || '',
                lifespan: document.getElementById('productLifespan')?.value.trim() || '',
                currentIntensity: document.getElementById('productCurrent')?.value.trim() || '',
                watt: document.getElementById('productWatt')?.value.trim() || '',
                sizes: document.getElementById('productSizes')?.value.trim() || '',
                weight: document.getElementById('productWeight')?.value.trim() || '',
                size: document.getElementById('productSize')?.value.trim() || '',
                colorOptions: colorVariants
            };

            try {
                if (editingId) {
                    const productRef = doc(db, "products", editingId);
                    await updateDoc(productRef, productData);
                    showToast("تم تحديث بيانات المنتج بنجاح!");
                } else {
                    productData.createdAt = Timestamp.now();
                    productData.shortId = generateShortId(5);
                    await addDoc(collection(db, "products"), productData);
                    showToast("تمت إضافة المنتج الجديد بنجاح!");
                }

                closeModal();
            } catch (error) {
                console.error("Error saving product:", error);
                showToast("خطأ أثناء الحفظ: " + (error.message || "تأكد من الصلاحيات والاتصال"));
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
}

/**
 * تحكم التمرير بالسحب والمؤشر للسلايدرات
 */
function setupSliderControls(containerId, prevBtnId, nextBtnId) {
    const container = document.getElementById(containerId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    container.onmousedown = (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    };
    container.onmouseleave = () => { isDown = false; };
    container.onmouseup = () => { isDown = false; };
    container.onmousemove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    };

    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => container.scrollBy({ left: 300, behavior: 'smooth' });
        nextBtn.onclick = () => container.scrollBy({ left: -300, behavior: 'smooth' });
    }
}

/**
 * تهيئة سلايدرات الموبايل بنظام Peek Carousel (بطاقة رئيسية بالمنتصف مع ظهور حواف الكروت السابقة واللاحقة)
 */
export function initMobilePeekCarousel(gridId, dotsId, activeColorClass = 'bg-[#ffcd00]', alignMode = 'center', itemsPerColumn = 1) {
    const container = document.getElementById(gridId);
    const dotsContainer = document.getElementById(dotsId);
    if (!container) return;

    const cards = container.querySelectorAll('.product-card-wrapper');
    if (cards.length === 0) {
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    const totalColumns = Math.ceil(cards.length / itemsPerColumn);

    // بناء مؤشرات النقاط السفلية الحصرية للموبايل (نقطة لكل شريحة/عمود)
    if (dotsContainer) {
        dotsContainer.innerHTML = Array.from({ length: totalColumns }).map((_, i) => `
            <button type="button" class="peek-dot-indicator h-1.5 rounded-full transition-all duration-300 ${i === 0 ? `w-5 ${activeColorClass}` : 'w-1.5 bg-gray-300 dark:bg-white/20'}"
                    data-index="${i}" aria-label="عرض شريحة ${i + 1}"></button>
        `).join('');

        const dots = dotsContainer.querySelectorAll('.peek-dot-indicator');
        dots.forEach(dot => {
            dot.onclick = (e) => {
                e.preventDefault();
                const colIdx = parseInt(dot.dataset.index, 10);
                const targetCardIdx = colIdx * itemsPerColumn;
                if (cards[targetCardIdx]) {
                    const containerRect = container.getBoundingClientRect();
                    const cardRect = cards[targetCardIdx].getBoundingClientRect();
                    let diff = 0;
                    if (alignMode === 'center') {
                        diff = (cardRect.left + cardRect.width / 2) - (containerRect.left + containerRect.width / 2);
                    } else {
                        // في نمط البداية (RTL)، المحاذاة لليمين
                        diff = cardRect.right - containerRect.right;
                    }
                    if (Math.abs(diff) > 2) {
                        container.scrollBy({ left: diff, behavior: 'smooth' });
                    }
                }
            };
        });

        // متابعة التمرير لتحديث النقطة النشطة بانسيابية
        let isTicking = false;
        container.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    const isStart = alignMode === 'start';
                    const containerRect = container.getBoundingClientRect();
                    const targetPos = isStart 
                        ? (containerRect.right - 24) 
                        : (containerRect.left + container.offsetWidth / 2);

                    let closestCol = 0;
                    let minDiff = Infinity;

                    for (let col = 0; col < totalColumns; col++) {
                        const card = cards[col * itemsPerColumn];
                        if (!card) continue;
                        const cardRect = card.getBoundingClientRect();
                        const cardPos = isStart ? cardRect.right : (cardRect.left + cardRect.width / 2);
                        const diff = Math.abs(targetPos - cardPos);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestCol = col;
                        }
                    }

                    dots.forEach((d, idx) => {
                        if (idx === closestCol) {
                            d.className = `peek-dot-indicator h-1.5 rounded-full transition-all duration-300 w-5 ${activeColorClass}`;
                        } else {
                            d.className = 'peek-dot-indicator h-1.5 rounded-full transition-all duration-300 w-1.5 bg-gray-300 dark:bg-white/20';
                        }
                    });

                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });
    }
}

export function initAllMobilePeekCarousels() {
    initMobilePeekCarousel('home-offers-grid', 'home-offers-dots', 'bg-[#ffcd00]', 'start', 3);
    initMobilePeekCarousel('home-bestsellers-grid', 'home-bestsellers-dots', 'bg-amber-500', 'start', 1);
    initMobilePeekCarousel('home-newarrivals-grid', 'home-newarrivals-dots', 'bg-blue-500', 'start', 1);
}
export const initMobileOffersPeekCarousel = initAllMobilePeekCarousels;

/**
 * إظهار هياكل الـ Skeleton لكروت المنتجات في كافة الأقسام الرئيسية
 */
export function showProductsSkeletons() {
    const productsGrid = document.getElementById('products-grid');
    const offersGrid = document.getElementById('home-offers-grid');
    const bestsellersGrid = document.getElementById('home-bestsellers-grid');
    const newArrivalsGrid = document.getElementById('home-newarrivals-grid');
    const offersSection = document.getElementById('home-offers-section');
    const bestsellersSection = document.getElementById('home-bestsellers-section');
    const newArrivalsSection = document.getElementById('home-newarrivals-section');

    if (productsGrid && (!productsGrid.children.length || productsGrid.classList.contains('hidden'))) {
        productsGrid.innerHTML = renderProductCardSkeleton(8);
        productsGrid.classList.remove('hidden');
    }
    if (offersGrid && offersSection) {
        offersGrid.innerHTML = renderProductCardSkeleton(4);
        offersSection.classList.remove('hidden');
    }
    if (bestsellersGrid && bestsellersSection) {
        bestsellersGrid.innerHTML = renderProductCardSkeleton(4);
        bestsellersSection.classList.remove('hidden');
    }
    if (newArrivalsGrid && newArrivalsSection) {
        newArrivalsGrid.innerHTML = renderProductCardSkeleton(4);
        newArrivalsSection.classList.remove('hidden');
    }
    initAllMobilePeekCarousels();
}

/**
 * بدء وتحميل المنتجات من الكاش ثم المزامنة الحية مع فايرستور
 */
export function loadProducts(onInitialLoadComplete) {
    initProductForm();

    // متابعة تسجيل دخول الأدمن لتحديث أزرار التعديل والحذف فوراً
    onAdminStateChange(() => {
        renderAllProductViews();
    });

    // إظهار هياكل الـ Skeleton فورياً عند بدء التحميل
    if (allProducts.length === 0) {
        showProductsSkeletons();
    }

    // 1. قراءة فورية من التخزين المؤقت
    const cached = localStorage.getItem('macca_products_cache_v2');
    if (cached) {
        try {
            allProducts = JSON.parse(cached);
            populateBrandsFilter();
            renderAllProductViews();
            if (onInitialLoadComplete) onInitialLoadComplete();
        } catch (e) {
            console.error("Cache load error", e);
        }
    }

    // 2. اشتراك حي مع فايرستور
    const q = query(collection(db, "products"));
    onSnapshot(q, (snapshot) => {
        allProducts = [];
        snapshot.forEach(d => {
            allProducts.push({ id: d.id, ...d.data() });
        });

        localStorage.setItem('macca_products_cache_v2', JSON.stringify(allProducts));
        populateBrandsFilter();
        renderAllProductViews();

        if (onInitialLoadComplete) onInitialLoadComplete();

        // التوجيه التلقائي في حال الرابط المباشر
        const hash = window.location.hash;
        if (hash.startsWith('#product/')) {
            const rawId = decodeURIComponent(hash.substring('#product/'.length)).replace(/\/$/, '').trim();
            renderProductDetails(rawId);
        }
    }, (err) => {
        console.error("Error loading products:", err);
        if (onInitialLoadComplete) onInitialLoadComplete();
    });
}

function populateBrandsFilter() {
    const select = document.getElementById('product-brand-filter');
    if (!select) return;

    const brands = [...new Set(
        allProducts.map(p => p.company).filter(c => c && c.trim() !== '')
    )].sort();

    while (select.options.length > 1) {
        select.remove(1);
    }

    brands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        select.appendChild(opt);
    });
}
