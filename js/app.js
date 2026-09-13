// ===============================================================
// متجر مكة للأدوات الكهربائية | تطبيق الويب الرئيسي (Main App Entry)
// ===============================================================

import { db, doc, onSnapshot, setDoc, addDoc, collection, increment, Timestamp } from "./firebase-config.js";
import { initAuth, onAdminStateChange } from "./auth.js";
import { initCart, renderCartPage, addToCart } from "./cart.js";
import { initWishlist, renderWishlistPage } from "./wishlist.js";
import { 
    loadProducts, 
    renderAllProductViews, 
    renderProductDetails, 
    renderOffersPage, 
    openProductModal,
    setPreFilterType,
    getAllProducts,
    initMobileCatalogControls
} from "./products.js";
import { 
    loadArticles, 
    renderArticles, 
    renderArticleDetails, 
    openArticleModal 
} from "./articles.js";
import { initAdminPanel, updateActiveSiteLogo } from "./admin.js";
import { initCheckout, openCheckoutPage } from "./checkout.js";
import { initOrderTracking, trackOrder } from "./tracking.js";
import { loadPaymentSettings, initPaymentSettingsAdmin } from "./payment-settings.js";
import { initOrdersAdmin } from "./orders-admin.js";
import { showToast, validateEgyptianPhone, escapeHTML } from "./utils.js";

// إخفاء شاشة التحميل الأولية
let isInitialLoaded = false;
export function hideGlobalLoader() {
    if (isInitialLoaded) return;
    isInitialLoaded = true;
    const loader = document.getElementById('global-loader');
    const app = document.getElementById('app');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
    if (app) {
        app.style.opacity = '1';
    }
    document.body.classList.remove('overflow-hidden');
}
window.hideGlobalLoader = hideGlobalLoader;

// 1. نظام التوجيه والروابط (Router)
export function showPage(pageId, itemId = null) {
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(p => p.classList.remove('active'));

    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.add('active');
        if (pageId === 'cart') {
            renderCartPage();
        } else if (pageId === 'checkout') {
            openCheckoutPage();
        } else if (pageId === 'wishlist') {
            renderWishlistPage();
        } else if (pageId === 'details' && itemId) {
            renderProductDetails(itemId);
        } else if (pageId === 'blog-post' && itemId) {
            renderArticleDetails(itemId);
        } else if (pageId === 'offers') {
            renderOffersPage();
        }
    } else {
        document.getElementById('page-home')?.classList.add('active');
    }

    // تحديث حالة الأزرار في القوائم
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    const simplePages = ['home', 'products', 'offers', 'blog', 'contact', 'cart', 'checkout', 'track-order', 'wishlist', 'admin', 'about', 'terms'];

    if (hash.startsWith('#product/')) {
        const id = decodeURIComponent(hash.substring('#product/'.length)).replace(/\/$/, '').trim();
        showPage('details', id);
    } else if (hash.startsWith('#blog/')) {
        const id = decodeURIComponent(hash.substring('#blog/'.length)).replace(/\/$/, '').trim();
        showPage('blog-post', id);
    } else if (hash.startsWith('#track-order')) {
        showPage('track-order');
        const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
        if (queryPart) {
            const params = new URLSearchParams(queryPart);
            const oNum = params.get('orderNumber');
            const ph = params.get('phone');
            if (oNum && ph) {
                const oInput = document.getElementById('track-order-number-input');
                const pInput = document.getElementById('track-order-phone-input');
                if (oInput) oInput.value = oNum;
                if (pInput) pInput.value = ph;
                trackOrder(oNum, ph);
            }
        }
    } else {
        const page = hash.substring(1).split('?')[0];
        if (simplePages.includes(page)) {
            showPage(page);
        } else {
            showPage('home');
        }
    }
}

// 2. نموذج التواصل الحقيقي مع فايرستور
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');
        const submitBtn = form.querySelector('button[type="submit"]');

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const message = messageInput.value.trim();

        if (!validateEgyptianPhone(phone)) {
            showToast("يرجى إدخال رقم هاتف صحيح (مثال: 011xxxxxxxx)");
            phoneInput.focus();
            return;
        }

        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';

        try {
            await addDoc(collection(db, "contacts"), {
                name,
                phone,
                message,
                createdAt: Timestamp.now(),
                status: 'unread'
            });

            form.reset();
            showToast("شكراً لك! تم إرسال رسالتك بنجاح وسيتواصل معك فريقنا قريباً.");
        } catch (err) {
            console.error("Error submitting contact message:", err);
            showToast("تعذر إرسال الرسالة، يرجى المحاولة عبر الواتساب.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
}

// 3. عداد الزوار الحقيقي والآمن
function initVisitorCounter() {
    const visitorRef = doc(db, "site_stats", "visitor_counter");
    const countEl = document.getElementById('visitor-count-number');
    const statCountEl = document.getElementById('happy-customer-stat');
    const headerBadge = document.getElementById('header-visitor-counter');

    onSnapshot(visitorRef, (snap) => {
        if (snap.exists()) {
            const count = snap.data().count || 0;
            const formatted = count.toLocaleString('en-US');
            if (countEl) countEl.textContent = formatted;
            if (statCountEl) statCountEl.textContent = `${formatted}+`;
            if (headerBadge) headerBadge.classList.remove('hidden');
        }
    }, () => {});

    try {
        if (!localStorage.getItem('macca_store_visited_v2')) {
            setDoc(visitorRef, { count: increment(1) }, { merge: true }).then(() => {
                localStorage.setItem('macca_store_visited_v2', 'true');
            }).catch(() => {});
        }
    } catch (e) {}
}

// 4. آراء العملاء
const testimonialsData = [
    { name: "محمد أحمد", text: "اشتريت دهانات جوتن، الألوان طلعت زي الكتالوج بالظبط، وفريق مكة ساعدني اختار الدرجات المناسبة." },
    { name: "سارة علي", text: "خدمة تركيب الدش ممتازة، الفني جه في ميعاده وظبط الإشارة بسرعة واحترافية." },
    { name: "خالد حسن", text: "أسعار العدد الكهربائية (شنيور وصاروخ) عندهم أقل من السوق، والمنتجات أصلية بضمان." },
    { name: "منى إبراهيم", text: "جبت كل مفاتيح الكهرباء والبرايز لشقتي الجديدة، تشكيلة وموديلات شيك جداً." },
    { name: "يوسف محمود", text: "احتجت حدايد ومسامير لشغل في البيت، لقيت كل المقاسات اللي عايزها وبأسعار ممتازة." },
    { name: "رانيا كمال", text: "الموقع سهل جداً في الطلب، طلبت لمبات ليد ووصلتني تاني يوم مع التغليف الممتاز." }
];

function renderTestimonials() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;

    const cards = testimonialsData.map(t => `
        <div class="inline-block w-64 sm:w-80 p-5 mx-2 bg-white dark:bg-[#2c2f38] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 whitespace-normal align-top">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-[#ffcd00]/10 text-[#ffcd00] flex items-center justify-center font-bold">
                    ${t.name.charAt(0)}
                </div>
                <div>
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white">${t.name}</h4>
                    <div class="text-[#ffcd00] text-xs">★★★★★</div>
                </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                "${t.text}"
            </p>
        </div>
    `).join('');

    track.innerHTML = cards + cards;
}

// 5. أكورديون الأسئلة الشائعة FAQ
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const header = item.querySelector('.faq-header');
        const content = item.querySelector('.faq-content');
        if (!header || !content) return;

        if (item.getAttribute('data-open') === 'true') {
            content.style.maxHeight = content.scrollHeight + "px";
        }

        header.addEventListener('click', () => {
            const isOpen = item.getAttribute('data-open') === 'true';
            if (isOpen) {
                item.setAttribute('data-open', 'false');
                content.style.maxHeight = null;
            } else {
                item.setAttribute('data-open', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

// 6. البحث الموحد والتنقل
function initSearch() {
    const globalInput = document.getElementById('global-search-input');
    const productInput = document.getElementById('product-search-input');

    if (globalInput) {
        globalInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (productInput) productInput.value = val;

            if (document.getElementById('page-products')?.classList.contains('active')) {
                setPreFilterType('all');
                renderAllProductViews();
            } else if (val.length > 2) {
                window.location.hash = '#products';
                setTimeout(() => {
                    setPreFilterType('all');
                    renderAllProductViews();
                }, 50);
            }
        });
    }

    if (productInput && globalInput) {
        productInput.addEventListener('input', (e) => {
            globalInput.value = e.target.value;
            setPreFilterType('all');
            renderAllProductViews();
        });
    }

    // فلتر الأقسام والماركات والترتيب
    document.getElementById('product-category-filter')?.addEventListener('change', () => {
        setPreFilterType('all');
        renderAllProductViews();
    });

    document.getElementById('product-brand-filter')?.addEventListener('change', () => {
        setPreFilterType('all');
        renderAllProductViews();
    });

    document.getElementById('product-sort-filter')?.addEventListener('change', () => {
        setPreFilterType('all');
        renderAllProductViews();
    });

    document.getElementById('product-min-price')?.addEventListener('input', () => {
        setPreFilterType('all');
        renderAllProductViews();
    });

    document.getElementById('product-max-price')?.addEventListener('input', () => {
        setPreFilterType('all');
        renderAllProductViews();
    });
}

// 7. قائمة الأقسام في الموبايل
function initMobileNavigation() {
    const deptBtn = document.getElementById('mobile-departments-btn');
    const deptMenu = document.getElementById('mobile-departments-menu');
    const deptIcon = document.getElementById('mobile-departments-icon');

    if (deptBtn && deptMenu) {
        deptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = deptMenu.classList.toggle('hidden');
            if (deptIcon) deptIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        document.addEventListener('click', (e) => {
            if (!deptBtn.contains(e.target) && !deptMenu.contains(e.target)) {
                deptMenu.classList.add('hidden');
                if (deptIcon) deptIcon.style.transform = 'rotate(0deg)';
            }
        });

        deptMenu.querySelectorAll('.mobile-dept-item').forEach(item => {
            item.addEventListener('click', () => {
                deptMenu.classList.add('hidden');
                if (deptIcon) deptIcon.style.transform = 'rotate(0deg)';
            });
        });
    }

    // 7.1. درج قائمة الموبايل الجانبية (Mobile Side Navigation Drawer)
    const drawerBtn = document.getElementById('mobile-menu-drawer-btn');
    const drawer = document.getElementById('mobile-side-drawer');
    const drawerOverlay = document.getElementById('mobile-drawer-overlay');
    const drawerCloseBtn = document.getElementById('mobile-drawer-close-btn');

    function openDrawer() {
        if (!drawer || !drawerOverlay) return;
        drawer.classList.add('is-open');
        drawerOverlay.classList.add('is-open');
        document.body.classList.add('overflow-hidden');
    }

    function closeDrawer() {
        if (!drawer || !drawerOverlay) return;
        drawer.classList.remove('is-open');
        drawerOverlay.classList.remove('is-open');
        document.body.classList.remove('overflow-hidden');
    }

    if (drawerBtn) drawerBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    document.querySelectorAll('.mobile-drawer-link').forEach(link => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });

    // زر العودة للأعلى
    const topBtn = document.getElementById('scroll-to-top-btn');
    if (topBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                topBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                topBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            } else {
                topBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                topBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        }, { passive: true });

        topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 7.1. نافذة البحث السريع للموبايل (Mobile Search Sheet)
function initMobileSearchSheet() {
    const sheet = document.getElementById('mobile-search-sheet');
    const input = document.getElementById('mobile-search-input');
    const closeBtn = document.getElementById('close-mobile-search-btn');
    const clearBtn = document.getElementById('clear-mobile-search-btn');
    const listEl = document.getElementById('mobile-search-results-list');
    const countEl = document.getElementById('mobile-results-count');
    const viewAllLink = document.getElementById('mobile-view-all-results-link');
    const bottomBar = document.getElementById('mobile-bottom-nav');

    function openSearch() {
        if (!sheet) return;
        sheet.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        if (bottomBar) bottomBar.classList.add('hidden-keyboard');
        if (input) {
            setTimeout(() => input.focus(), 60);
            renderResults(input.value);
        }
    }

    function closeSearch() {
        if (!sheet) return;
        sheet.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        if (bottomBar) bottomBar.classList.remove('hidden-keyboard');
    }

    document.getElementById('mobile-search-trigger-btn')?.addEventListener('click', openSearch);
    document.getElementById('bottom-bar-search-btn')?.addEventListener('click', openSearch);
    closeBtn?.addEventListener('click', closeSearch);

    clearBtn?.addEventListener('click', () => {
        if (input) {
            input.value = '';
            input.focus();
            renderResults('');
        }
    });

    // البحث بالوسوم الشائعة
    document.querySelectorAll('.search-tag-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const tag = pill.dataset.tag;
            if (input && tag) {
                input.value = tag;
                renderResults(tag);
            }
        });
    });

    input?.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    function renderResults(query) {
        if (!listEl) return;
        const q = (query || '').trim().toLowerCase();

        if (clearBtn) {
            clearBtn.classList.toggle('hidden', q.length === 0);
        }

        if (q.length === 0) {
            listEl.innerHTML = `
                <div class="text-center py-10 text-gray-400">
                    <i data-lucide="search" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>
                    <p class="text-xs font-bold">اكتب اسم المنتج أو القسم للبحث الفوري</p>
                </div>
            `;
            if (countEl) countEl.textContent = 'النتائج';
            if (viewAllLink) viewAllLink.classList.add('hidden');
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const products = getAllProducts();
        const matches = products.filter(p => {
            const name = (p.name || '').toLowerCase();
            const category = (p.category || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const company = (p.company || '').toLowerCase();
            return name.includes(q) || category.includes(q) || desc.includes(q) || company.includes(q);
        });

        if (countEl) countEl.textContent = `${matches.length} منتج`;
        if (viewAllLink) {
            viewAllLink.classList.remove('hidden');
            viewAllLink.onclick = () => {
                closeSearch();
                const globalInput = document.getElementById('global-search-input');
                const productInput = document.getElementById('product-search-input');
                if (globalInput) globalInput.value = query;
                if (productInput) productInput.value = query;
                window.location.hash = '#products';
                setPreFilterType('all');
                renderAllProductViews();
            };
        }

        if (matches.length === 0) {
            listEl.innerHTML = `
                <div class="text-center py-10 text-gray-400">
                    <i data-lucide="package-x" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>
                    <p class="text-xs font-bold">لا توجد نتائج مطابقة لـ "${escapeHTML(query)}"</p>
                    <p class="text-[11px] text-gray-400 mt-1">جرب كلمات أخرى مثل لمبات، كابلات، أو مفاتيح</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        listEl.innerHTML = matches.slice(0, 15).map(p => {
            const pIdentifier = p.shortId || p.id;
            const mainImg = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : (p.imageUrl || 'https://placehold.co/100x100/18181b/71717a?text=Macca');
            return `
                <div class="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#ffcd00]/40 transition-all">
                    <a href="#product/${pIdentifier}" class="mobile-search-item-link flex items-center gap-3 flex-grow min-w-0" data-product-id="${p.id}">
                        <img src="${mainImg}" alt="${escapeHTML(p.name)}" class="w-12 h-12 rounded-xl object-contain bg-white dark:bg-[#111] p-1 flex-shrink-0 shadow-sm" onerror="this.src='https://placehold.co/100x100/18181b/71717a?text=Macca'">
                        <div class="flex flex-col min-w-0">
                            <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">${escapeHTML(p.name)}</h5>
                            <div class="flex items-baseline gap-1 mt-0.5">
                                <span class="text-xs font-black text-[#ffcd00]">${parseFloat(p.price).toFixed(0)}</span>
                                <span class="text-[10px] text-gray-400">ج.م</span>
                            </div>
                        </div>
                    </a>
                    <button class="mobile-quick-add-btn w-8 h-8 rounded-full bg-[#ffcd00] hover:bg-[#ffda33] active:scale-90 text-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform" data-product-id="${p.id}" title="أضف للسلة">
                        <i data-lucide="plus" class="w-4 h-4 stroke-[3]"></i>
                    </button>
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();

        listEl.querySelectorAll('.mobile-search-item-link').forEach(link => {
            link.addEventListener('click', () => closeSearch());
        });
        listEl.querySelectorAll('.mobile-quick-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pid = btn.dataset.productId;
                const p = products.find(item => item.id === pid || item.shortId === pid);
                if (p) {
                    addToCart(p, 1);
                }
            });
        });
    }
}

// 7.2. حماية الشريط السفلي العائم من التداخل مع لوحة المفاتيح
function initKeyboardSafeBottomBar() {
    const bottomBar = document.getElementById('mobile-bottom-nav');
    if (!bottomBar) return;

    if (window.visualViewport) {
        let initialHeight = window.visualViewport.height;
        window.visualViewport.addEventListener('resize', () => {
            if (window.visualViewport.height < initialHeight * 0.78) {
                bottomBar.classList.add('hidden-keyboard');
            } else {
                bottomBar.classList.remove('hidden-keyboard');
            }
        });
    }

    document.addEventListener('focusin', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            bottomBar.classList.add('hidden-keyboard');
        }
    });

    document.addEventListener('focusout', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            setTimeout(() => {
                const active = document.activeElement;
                if (!active || !['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) {
                    bottomBar.classList.remove('hidden-keyboard');
                }
            }, 100);
        }
    });
}

/**
 * 7.5 نظام تبديل الوضع الليلي / النهاري (Dark/Light Mode Switcher)
 */
export function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn, #mobile-theme-toggle-btn, #desktop-theme-toggle-btn');
    if (!toggleBtns.length) return;

    function applyTheme(isDark) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#000000');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff');
        }
        if (typeof updateActiveSiteLogo === 'function') {
            updateActiveSiteLogo(isDark);
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isCurrentlyDark = document.documentElement.classList.contains('dark');
            applyTheme(!isCurrentlyDark);
        });
    });
}

/**
 * 7.6 تهيئة سلايدر خطوات كيف تطلب للموبايل (Auto-moving RTL Carousel with Dots)
 */
export function initHowItWorksMobileSlider() {
    const track = document.getElementById('home-how-it-works-track');
    const dotsContainer = document.getElementById('home-how-it-works-dots');
    if (!track) return;

    const cards = track.querySelectorAll('.how-step-card');
    const totalSteps = cards.length;
    if (totalSteps <= 1) return;

    // 1. توليد نقاط الترقيم التفاعلية
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSteps; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = `how-step-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `الخطوة ${i + 1}`);
            dot.dataset.stepIndex = i;
            dotsContainer.appendChild(dot);
        }
    }

    let currentStep = 0;
    let autoplayTimer = null;
    let isUserInteracting = false;
    let resumeTimeout = null;

    // 2. تحديث النقطة النشطة بدقة في اتجاه اليمين لليسار (RTL Center Tracking)
    const updateActiveDot = () => {
        if (window.innerWidth >= 768) return;
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let activeIdx = 0;
        let minDiff = Infinity;

        cards.forEach((card, idx) => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const diff = Math.abs(trackCenter - cardCenter);
            if (diff < minDiff) {
                minDiff = diff;
                activeIdx = idx;
            }
        });

        currentStep = activeIdx;
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.how-step-dot');
            dots.forEach((dot, idx) => {
                if (idx === activeIdx) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }
    };

    track.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveDot);
    }, { passive: true });

    // 3. النقر على النقطة للانتقال المباشر للخطوة (تمرير أفقي حصري داخل السلايدر فقط)
    const scrollToStep = (idx) => {
        if (!cards[idx]) return;
        const trackRect = track.getBoundingClientRect();
        const cardRect = cards[idx].getBoundingClientRect();
        const diff = (cardRect.left + cardRect.width / 2) - (trackRect.left + trackRect.width / 2);
        if (Math.abs(diff) > 2) {
            track.scrollBy({ left: diff, behavior: 'smooth' });
        }
    };

    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            const dot = e.target.closest('.how-step-dot');
            if (!dot) return;
            const idx = parseInt(dot.dataset.stepIndex);
            scrollToStep(idx);
        });
    }

    // 4. التقليب التلقائي الانسيابي من اليمين لليسار (يعمل فقط إذا كان القسم ظاهراً أمام عين المستخدم)
    const startAutoplay = () => {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => {
            if (isUserInteracting || window.innerWidth >= 768) return;
            // صمام أمان: لا تقلب السلايدر إطلاقاً إذا كان المستخدم يتصفح قسماً آخر في الصفحة
            const trackRect = track.getBoundingClientRect();
            if (trackRect.bottom <= 50 || trackRect.top >= (window.innerHeight - 50)) return;

            const nextStep = (currentStep + 1) % totalSteps;
            scrollToStep(nextStep);
        }, 3500);
    };

    const pauseTemporarily = () => {
        isUserInteracting = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            isUserInteracting = false;
        }, 5000);
    };

    track.addEventListener('touchstart', pauseTemporarily, { passive: true });
    track.addEventListener('touchmove', pauseTemporarily, { passive: true });
    track.addEventListener('pointerdown', pauseTemporarily, { passive: true });
    track.addEventListener('mouseenter', () => { isUserInteracting = true; });
    track.addEventListener('mouseleave', () => { isUserInteracting = false; });

    // تشغيل السلايدر التلقائي
    startAutoplay();
}

// 8. تهيئة التطبيق بالكامل
document.addEventListener('DOMContentLoaded', () => {
    try {
        initThemeToggle();
        if (typeof updateActiveSiteLogo === 'function') updateActiveSiteLogo();
        initAuth();
        loadPaymentSettings();
        initCart();
        initWishlist();
        initCheckout();
        initOrderTracking();
        initPaymentSettingsAdmin();
        initOrdersAdmin();
        initAdminPanel();
        initContactForm();
        initVisitorCounter();
        renderTestimonials();
        initFAQ();
        initSearch();
        initMobileNavigation();
        initMobileSearchSheet();
        initKeyboardSafeBottomBar();
        initMobileCatalogControls();
        initHowItWorksMobileSlider();

        // روابط التنقل ذات الفلاتر المخصصة
        document.querySelectorAll('[data-category-filter]').forEach(link => {
            link.addEventListener('click', (e) => {
                const cat = link.dataset.categoryFilter;
                const filterDropdown = document.getElementById('product-category-filter');
                if (filterDropdown && cat) {
                    filterDropdown.value = cat;
                    setPreFilterType('all');
                    renderAllProductViews();
                }
            });
        });

        document.querySelectorAll('.see-all-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const type = link.dataset.filterType;
                if (type) {
                    setPreFilterType(type);
                    renderAllProductViews();
                }
            });
        });

        // أزرار إضافة منتج / مقالة للأدمن
        const addProductBtn = document.getElementById('show-add-product-modal-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => openProductModal());
        }

        const addArticleBtn = document.getElementById('show-add-article-modal-btn');
        if (addArticleBtn) {
            addArticleBtn.addEventListener('click', () => openArticleModal());
        }

        // إغلاق النوافذ المنبثقة
        document.getElementById('close-add-product-modal-btn')?.addEventListener('click', () => {
            document.getElementById('add-product-modal')?.classList.add('hidden');
        });
        document.getElementById('cancel-add-product-btn')?.addEventListener('click', () => {
            document.getElementById('add-product-modal')?.classList.add('hidden');
        });

        document.getElementById('close-add-article-modal-btn')?.addEventListener('click', () => {
            document.getElementById('add-article-modal')?.classList.add('hidden');
        });
        document.getElementById('cancel-add-article-btn')?.addEventListener('click', () => {
            document.getElementById('add-article-modal')?.classList.add('hidden');
        });

        // استماع للتغييرات في الرابط
        window.addEventListener('hashchange', handleRouting);

        // بدء تحميل البيانات
        loadProducts(() => {
            hideGlobalLoader();
        });
        loadArticles();

        // تشغيل الراوتر
        handleRouting();
    } catch (err) {
        console.error("Initialization error:", err);
    } finally {
        // أقصى مهلة لإخفاء اللودر
        setTimeout(hideGlobalLoader, 1500);
    }
});
