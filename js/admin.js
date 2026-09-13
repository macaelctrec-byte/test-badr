// ===============================================================
// إعدادات لوحة التحكم والمشرف (Admin Control Panel)
// ===============================================================

import { db, doc, onSnapshot, setDoc } from "./firebase-config.js";
import { isUserAdmin } from "./auth.js";
import { getAllProducts } from "./products.js";
import { getAllArticles } from "./articles.js";
import { showToast, escapeHTML } from "./utils.js";

export function initAdminPanel() {
    loadBrandingConfig();
    loadHeroConfig();
    loadTopBarConfig();
    loadMobileBannerConfig();
    setupAdminForms();
    setupSitemapGenerator();
}

let currentBrandingData = null;

/**
 * تحديث الشعار النشط لحظياً بناءً على وضع الثيم (فاتح / داكن)
 * @param {boolean} [isDark]
 */
export function updateActiveSiteLogo(isDark) {
    if (typeof isDark === 'undefined') {
        isDark = document.documentElement.classList.contains('dark');
    }

    const lightLogo = currentBrandingData?.logoUrlLight || localStorage.getItem('macca_site_logo_light') || '';
    const darkLogo = currentBrandingData?.logoUrlDark || localStorage.getItem('macca_site_logo_dark') || '';
    const fallbackLogo = currentBrandingData?.logoUrl || localStorage.getItem('macca_site_logo') || '';

    // اختيار الشعار الأنسب: الشعار المخصص للوضع النشط، أو البديل، أو الشعار العام
    const chosenLogo = isDark 
        ? (darkLogo || fallbackLogo || lightLogo) 
        : (lightLogo || fallbackLogo || darkLogo);

    const logoSize = currentBrandingData?.logoSize || localStorage.getItem('macca_site_logo_size') || 80;
    const mobileLogoSize = currentBrandingData?.mobileLogoSize || localStorage.getItem('macca_site_logo_mobile_size') || 34;

    const logoImg = document.getElementById('site-logo-img');
    const mobileLogoImg = document.getElementById('mobile-site-logo-img');
    const mobileDefaultPlaceholder = document.getElementById('mobile-default-logo-placeholder');

    if (chosenLogo && chosenLogo.trim() !== '') {
        if (logoImg) {
            logoImg.src = chosenLogo;
            logoImg.classList.remove('hidden');
            logoImg.style.height = `${logoSize}px`;
        }
        if (mobileLogoImg) {
            mobileLogoImg.src = chosenLogo;
            mobileLogoImg.classList.remove('hidden');
            mobileLogoImg.style.height = `${mobileLogoSize}px`;
        }
        if (mobileDefaultPlaceholder) {
            mobileDefaultPlaceholder.classList.add('hidden');
        }
    } else {
        if (logoImg) logoImg.classList.add('hidden');
        if (mobileLogoImg) mobileLogoImg.classList.add('hidden');
        if (mobileDefaultPlaceholder) mobileDefaultPlaceholder.classList.remove('hidden');
    }
}

function loadBrandingConfig() {
    // استعادة فورية للشعار المحفوظ محلياً لمنع أي وميض
    try {
        updateActiveSiteLogo();
    } catch (e) {}

    const brandingRef = doc(db, "config", "branding");
    onSnapshot(brandingRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            applyBranding(data);
        }
    });
}

function applyBranding(data) {
    currentBrandingData = data || {};

    const logoUrlLight = data?.logoUrlLight || data?.logoUrl || '';
    const logoUrlDark = data?.logoUrlDark || data?.logoUrl || '';
    const logoUrl = data?.logoUrl || logoUrlLight || logoUrlDark || '';
    const logoSize = data?.logoSize || 80;
    const mobileLogoSize = data?.mobileLogoSize || 34;

    try { 
        if (logoUrlLight) localStorage.setItem('macca_site_logo_light', logoUrlLight);
        if (logoUrlDark) localStorage.setItem('macca_site_logo_dark', logoUrlDark);
        if (logoUrl) localStorage.setItem('macca_site_logo', logoUrl);
        localStorage.setItem('macca_site_logo_size', logoSize);
        localStorage.setItem('macca_site_logo_mobile_size', mobileLogoSize);
    } catch (e) {}

    updateActiveSiteLogo();

    const adminLogoInput = document.getElementById('admin-logo-url');
    const adminLogoLightInput = document.getElementById('admin-logo-url-light');
    const adminLogoDarkInput = document.getElementById('admin-logo-url-dark');
    const adminLogoSizeInput = document.getElementById('admin-logo-size');
    const adminLogoSizeDisplay = document.getElementById('admin-logo-size-display');
    const adminMobileLogoSizeInput = document.getElementById('admin-mobile-logo-size');
    const adminMobileLogoSizeDisplay = document.getElementById('admin-mobile-logo-size-display');

    if (adminLogoInput) adminLogoInput.value = logoUrl;
    if (adminLogoLightInput) adminLogoLightInput.value = logoUrlLight;
    if (adminLogoDarkInput) adminLogoDarkInput.value = logoUrlDark;
    if (adminLogoSizeInput) adminLogoSizeInput.value = logoSize;
    if (adminLogoSizeDisplay) adminLogoSizeDisplay.textContent = `${logoSize}px`;
    if (adminMobileLogoSizeInput) adminMobileLogoSizeInput.value = mobileLogoSize;
    if (adminMobileLogoSizeDisplay) adminMobileLogoSizeDisplay.textContent = `${mobileLogoSize}px`;
}

function loadHeroConfig() {
    const heroRef = doc(db, "config", "homepage");
    onSnapshot(heroRef, (snap) => {
        if (snap.exists()) {
            applyHero(snap.data());
        }
    });
}

function applyHero(data) {
    const heroContainer = document.getElementById('hero-section-container');
    const videoEl = document.getElementById('hero-video');
    const videoSourceEl = document.getElementById('hero-video-source');
    const imageEl = document.getElementById('hero-bg-image');
    const badgeEl = document.getElementById('hero-badge-text');
    const titleMainEl = document.getElementById('hero-title-main');
    const titleSubEl = document.getElementById('hero-title-sub');
    const descEl = document.getElementById('hero-description');

    const heroType = data.heroType || 'image';
    const videoUrl = data.videoUrl;
    const imageUrl = data.imageUrl;
    const showMobile = data.visibleMobile !== false;
    const showDesktop = data.visibleDesktop !== false;

    if (heroContainer) {
        heroContainer.classList.remove('hidden', 'flex', 'md:hidden', 'md:flex');
        if (showMobile && showDesktop) {
            heroContainer.classList.add('flex');
        } else if (!showMobile && !showDesktop) {
            heroContainer.classList.add('hidden');
        } else if (showMobile && !showDesktop) {
            heroContainer.classList.add('flex', 'md:hidden');
        } else if (!showMobile && showDesktop) {
            heroContainer.classList.add('hidden', 'md:flex');
        }
    }

    if (heroType === 'video' && videoUrl) {
        if (videoSourceEl) videoSourceEl.src = videoUrl;
        if (videoEl) {
            videoEl.load();
            videoEl.classList.remove('hidden');
        }
        if (imageEl) imageEl.classList.add('hidden');
    } else {
        if (imageEl) {
            if (imageUrl) {
                imageEl.src = imageUrl;
                imageEl.classList.remove('hidden');
            } else {
                imageEl.classList.add('hidden');
            }
        }
        if (videoEl) videoEl.classList.add('hidden');
    }

    if (badgeEl && data.badgeText) badgeEl.textContent = data.badgeText;
    if (titleMainEl && data.titleMain) titleMainEl.textContent = data.titleMain;
    if (titleSubEl && data.titleSub) titleSubEl.textContent = data.titleSub;
    if (descEl && data.description) descEl.textContent = data.description;

    // ملء مدخلات الأدمن
    const adminType = document.getElementById('admin-hero-type');
    if (adminType) {
        adminType.value = heroType;
        adminType.dispatchEvent(new Event('change'));
    }
    const adminVideo = document.getElementById('admin-video-url');
    if (adminVideo) adminVideo.value = videoUrl || '';
    const adminImg = document.getElementById('admin-image-url');
    if (adminImg) adminImg.value = imageUrl || '';
    const adminBadge = document.getElementById('admin-hero-badge');
    if (adminBadge) adminBadge.value = data.badgeText || '';
    const adminTitle = document.getElementById('admin-hero-title');
    if (adminTitle) adminTitle.value = data.titleMain || '';
    const adminSub = document.getElementById('admin-hero-subtitle');
    if (adminSub) adminSub.value = data.titleSub || '';
    const adminDesc = document.getElementById('admin-hero-desc');
    if (adminDesc) adminDesc.value = data.description || '';
}

function loadTopBarConfig() {
    const topBarRef = doc(db, "config", "top_bar");
    onSnapshot(topBarRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            const bar = document.getElementById('top-notification-bar');
            const content = document.getElementById('top-bar-content');
            const text = document.getElementById('top-bar-text');
            const highlight = document.getElementById('top-bar-highlight');

            if (content) {
                if (data.text || data.highlight) {
                    content.classList.remove('hidden');
                    if (text) text.textContent = data.text || '';
                    if (highlight) highlight.textContent = data.highlight || '';
                } else {
                    content.classList.add('hidden');
                }
            }

            if (bar) {
                if (data.visible === false) {
                    bar.classList.add('hidden');
                } else {
                    bar.classList.remove('hidden');
                }
            }
        }
    });
}

let currentMobileBanners = [];
let mobileBannerAutoplayInterval = null;
let adminBannerControlsInitialized = false;

function normalizeBannerConfig(data) {
    if (!data) {
        return {
            visible: true,
            autoplay: true,
            items: [
                {
                    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
                    layout: 'auto',
                    badge: 'NEW ARRIVAL',
                    title: 'Graphite Trench Coat',
                    price: '$520',
                    btnText: '✦ تسوق الآن',
                    btnLink: '#products'
                }
            ]
        };
    }

    let items = [];
    if (Array.isArray(data.items) && data.items.length > 0) {
        items = data.items;
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
        items = [{
            imageUrl: data.imageUrl,
            layout: data.layout || 'auto',
            badge: data.badge || '',
            title: data.title || '',
            price: data.price || '',
            btnText: data.btnText || '',
            btnLink: data.btnLink || ''
        }];
    } else {
        items = [
            {
                imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
                layout: 'auto',
                badge: 'NEW ARRIVAL',
                title: 'Graphite Trench Coat',
                price: '$520',
                btnText: '✦ تسوق الآن',
                btnLink: '#products'
            }
        ];
    }

    return {
        visible: data.visible !== false,
        autoplay: data.autoplay !== false,
        items
    };
}

function loadMobileBannerConfig() {
    let hasData = false;

    // 1. استعادة فورية من التخزين المحلي لمنع أي وميض
    try {
        const cached = localStorage.getItem('macca_mobile_banner');
        if (cached) {
            const config = normalizeBannerConfig(JSON.parse(cached));
            applyMobileBanners(config);
            hasData = true;
        }
    } catch (e) {}

    // إذا لم يكن هناك كاش، نظهر الاسكليتون لمدة 350ms ليرى الزائر تأثير التحميل ثم نطبق البيانات الافتراضية
    if (!hasData) {
        setTimeout(() => {
            if (!hasData) {
                const def = normalizeBannerConfig(null);
                applyMobileBanners(def);
            }
        }, 350);
    }

    // 2. مزامنة فورية ومباشرة من فايربيس Firestore
    try {
        const bannerRef = doc(db, "config", "mobile_banner");
        onSnapshot(bannerRef, (snap) => {
            hasData = true;
            if (snap.exists()) {
                const data = snap.data();
                const config = normalizeBannerConfig(data);
                try { localStorage.setItem('macca_mobile_banner', JSON.stringify(config)); } catch (e) {}
                applyMobileBanners(config);
            } else {
                const defaultData = normalizeBannerConfig(null);
                applyMobileBanners(defaultData);
            }
        }, (err) => {
            console.warn("Error reading mobile_banner config:", err);
            hasData = true;
            applyMobileBanners(normalizeBannerConfig(null));
        });
    } catch (e) {
        console.warn("Could not attach listener to mobile_banner:", e);
    }

    // 3. صمام أمان حاسم: منع بقاء الاسكليتون معلقاً أبداً تحت أي ظرف
    setTimeout(() => {
        const skeleton = document.getElementById('mobile-featured-banner-skeleton');
        const wrapper = document.getElementById('mobile-banner-carousel-wrapper');
        if (skeleton && !skeleton.classList.contains('hidden') && wrapper && wrapper.classList.contains('hidden')) {
            skeleton.classList.add('hidden');
            wrapper.classList.remove('hidden');
        }
    }, 500);

    setupBannerAdminControls();
}

function applyMobileBanners(config) {
    const container = document.getElementById('mobile-featured-banner-section');
    const skeleton = document.getElementById('mobile-featured-banner-skeleton');
    const wrapper = document.getElementById('mobile-banner-carousel-wrapper');
    const track = document.getElementById('mobile-banner-track');
    const dotsContainer = document.getElementById('mobile-banner-dots');

    if (!container || !wrapper || !track) return;

    currentMobileBanners = config.items || [];

    if (!config.visible || currentMobileBanners.length === 0) {
        container.classList.add('hidden');
        if (skeleton) skeleton.classList.add('hidden');
        wrapper.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    // بناء شرائح السلايدر ديناميكياً
    track.innerHTML = currentMobileBanners.map((slide, idx) => {
        const hasText = (slide.title && slide.title.trim() !== '') || (slide.badge && slide.badge.trim() !== '');
        const isFull = slide.layout === 'full' || (slide.layout !== 'card' && !hasText && !!slide.imageUrl);
        const imgUrl = slide.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80';
        const link = slide.btnLink || '#products';

        if (isFull) {
            return `
                <div class="w-full flex-shrink-0 snap-center px-0.5" data-slide-index="${idx}">
                    <a href="${link}" class="block w-full overflow-hidden rounded-[1.75rem] shadow-lg active:scale-[0.99] transition-transform">
                        <img src="${imgUrl}" alt="بانر العروض" class="w-full h-auto max-h-[220px] object-cover rounded-[1.75rem] drop-shadow-md" loading="eager" decoding="async">
                    </a>
                </div>
            `;
        } else {
            return `
                <div class="w-full flex-shrink-0 snap-center px-0.5" data-slide-index="${idx}">
                    <div class="mobile-banner-peach-card relative w-full rounded-[1.75rem] overflow-hidden shadow-lg transition-all active:scale-[0.99]">
                        <div class="flex items-center justify-between p-4 sm:p-5 w-full">
                            <div class="relative z-10 flex-1 pr-1 text-right flex flex-col items-start justify-center">
                                ${slide.badge ? `<span class="text-[10px] font-black tracking-wider uppercase text-gray-800/80 dark:text-gray-200/90 mb-1">${escapeHTML(slide.badge)}</span>` : ''}
                                <h2 class="text-base sm:text-lg font-black text-gray-950 dark:text-white leading-snug mb-1">${escapeHTML(slide.title || 'أحدث العروض')}</h2>
                                ${slide.price ? `<p class="text-sm sm:text-base font-black text-gray-900/90 dark:text-amber-300 mb-3">${escapeHTML(slide.price)}</p>` : ''}
                                <a href="${link}" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/85 hover:bg-black text-white text-xs font-bold shadow-sm active:scale-95 transition-all">
                                    <span>${escapeHTML(slide.btnText || '✦ تسوق الآن')}</span>
                                </a>
                            </div>
                            <div class="relative z-10 w-32 sm:w-36 h-32 sm:h-36 flex-shrink-0 flex items-center justify-center">
                                <img src="${imgUrl}" alt="بانر الموبايل" class="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105" loading="eager" decoding="async">
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/20 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');

    // نقاط الترقيم (Pagination Dots)
    if (dotsContainer) {
        if (currentMobileBanners.length > 1) {
            dotsContainer.innerHTML = currentMobileBanners.map((_, i) =>
                `<button type="button" class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="شريحة ${i + 1}"></button>`
            ).join('');
            dotsContainer.classList.remove('hidden');
        } else {
            dotsContainer.innerHTML = '';
            dotsContainer.classList.add('hidden');
        }
    }

    // إظهار السلايدر وإخفاء الاسكليتون
    if (skeleton) skeleton.classList.add('hidden');
    wrapper.classList.remove('hidden');

    // تهيئة التفاعل والتقليب التلقائي
    initMobileBannerCarousel(track, dotsContainer, currentMobileBanners.length, config.autoplay);

    // ملء بيانات لوحة التحكم
    populateBannerAdminForm(config);
}

function initMobileBannerCarousel(track, dotsContainer, itemCount, autoplay) {
    if (mobileBannerAutoplayInterval) {
        clearInterval(mobileBannerAutoplayInterval);
        mobileBannerAutoplayInterval = null;
    }

    if (!track || itemCount <= 1) return;

    let currentIndex = 0;

    const updateActiveDot = () => {
        const slides = track.querySelectorAll('[data-slide-index]');
        if (!slides.length) return 0;
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let activeIdx = 0;
        let minDiff = Infinity;
        slides.forEach((sl, idx) => {
            const rect = sl.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const diff = Math.abs(trackCenter - center);
            if (diff < minDiff) {
                minDiff = diff;
                activeIdx = idx;
            }
        });

        currentIndex = activeIdx;
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.banner-dot');
            dots.forEach((d, idx) => {
                if (idx === activeIdx) d.classList.add('active');
                else d.classList.remove('active');
            });
        }
        return activeIdx;
    };

    track.onscroll = () => {
        requestAnimationFrame(updateActiveDot);
    };

    // تمرير أفقي داخلي فقط للبانر دون أي تأثير على موضع الصفحة الرأسي
    const scrollToSlide = (idx) => {
        const slides = track.querySelectorAll('[data-slide-index]');
        if (!slides[idx]) return;
        const trackRect = track.getBoundingClientRect();
        const slideRect = slides[idx].getBoundingClientRect();
        const diff = (slideRect.left + slideRect.width / 2) - (trackRect.left + trackRect.width / 2);
        if (Math.abs(diff) > 2) {
            track.scrollBy({ left: diff, behavior: 'smooth' });
        }
    };

    if (dotsContainer) {
        dotsContainer.onclick = (e) => {
            const dot = e.target.closest('.banner-dot');
            if (!dot) return;
            const idx = parseInt(dot.dataset.index);
            scrollToSlide(idx);
        };
    }

    // التقليب التلقائي (يعمل فقط إذا كان البانر مرئياً أمام عين المستخدم)
    if (autoplay !== false && itemCount > 1) {
        const startAutoplay = () => {
            if (mobileBannerAutoplayInterval) clearInterval(mobileBannerAutoplayInterval);
            mobileBannerAutoplayInterval = setInterval(() => {
                // صمام أمان: التحقق من أن البانر معروض في الشاشة الحالية
                const trackRect = track.getBoundingClientRect();
                if (trackRect.bottom <= 50 || trackRect.top >= (window.innerHeight - 50)) return;

                const nextIdx = (currentIndex + 1) % itemCount;
                scrollToSlide(nextIdx);
            }, 4500);
        };

        startAutoplay();

        track.addEventListener('pointerenter', () => clearInterval(mobileBannerAutoplayInterval));
        track.addEventListener('pointerleave', startAutoplay);
        track.addEventListener('touchstart', () => clearInterval(mobileBannerAutoplayInterval), { passive: true });
        track.addEventListener('touchend', startAutoplay, { passive: true });
    }
}

function populateBannerAdminForm(config) {
    const adminVis = document.getElementById('admin-mobile-banner-visible');
    const adminAutoplay = document.getElementById('admin-mobile-banner-autoplay');
    if (adminVis) adminVis.checked = config.visible !== false;
    if (adminAutoplay) adminAutoplay.checked = config.autoplay !== false;

    // فقط إذا لم يكن المستخدم يكتب حالياً في حقول الإدخال
    const activeEl = document.activeElement;
    const listContainer = document.getElementById('admin-mobile-banners-list');
    if (listContainer && (!activeEl || !listContainer.contains(activeEl))) {
        renderAdminBannerSlides(config.items || []);
    }
}

function renderAdminBannerSlides(items) {
    const listContainer = document.getElementById('admin-mobile-banners-list');
    if (!listContainer) return;

    if (!items || items.length === 0) {
        items = [{
            imageUrl: '',
            layout: 'auto',
            badge: '',
            title: '',
            price: '',
            btnText: '✦ تسوق الآن',
            btnLink: '#products'
        }];
    }

    listContainer.innerHTML = items.map((slide, index) => `
        <div class="admin-banner-slide-item p-3.5 bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-gray-700/80 space-y-3 relative group" data-slide-index="${index}">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                <span class="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <i data-lucide="layers" class="w-3.5 h-3.5 text-[#ffcd00]"></i>
                    بانر رقم <span class="slide-num font-mono text-[#ffcd00]">#${index + 1}</span>
                </span>
                <button type="button" class="admin-remove-slide-btn text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-lg transition-colors cursor-pointer" title="حذف هذا البانر">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    <span>حذف</span>
                </button>
            </div>

            <!-- طريقة العرض -->
            <div>
                <label class="block text-[11px] text-gray-400 mb-1 font-bold">نوع العرض:</label>
                <select class="slide-layout w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl">
                    <option value="auto" ${slide.layout === 'auto' ? 'selected' : ''}>تلقائي ذكي (حسب توفر النصوص)</option>
                    <option value="full" ${slide.layout === 'full' ? 'selected' : ''}>بانر عريض كامل (صورة عريضة)</option>
                    <option value="card" ${slide.layout === 'card' ? 'selected' : ''}>كارت أنيق (نص + صورة جانبية)</option>
                </select>
            </div>

            <!-- رابط الصورة -->
            <div>
                <label class="block text-[11px] text-gray-400 mb-1 font-bold">رابط صورة البانر (URL) *</label>
                <input type="url" class="slide-img w-full text-xs px-3 py-2 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-[11px]" placeholder="https://..." value="${escapeHTML(slide.imageUrl || '')}">
            </div>

            <!-- تفاصيل الكارت (اختيارية في حال البانر العريض) -->
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">الشارة العلوية (Badge)</label>
                    <input type="text" class="slide-badge w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="NEW ARRIVAL" value="${escapeHTML(slide.badge || '')}">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">السعر / الخصم</label>
                    <input type="text" class="slide-price w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="$520 أو خصم 30%" value="${escapeHTML(slide.price || '')}">
                </div>
                <div class="col-span-2">
                    <label class="block text-[11px] text-gray-400 mb-1">العنوان الرئيسي</label>
                    <input type="text" class="slide-title w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="Graphite Trench Coat" value="${escapeHTML(slide.title || '')}">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">نص الزر</label>
                    <input type="text" class="slide-btn-text w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="تسوق الآن ✦" value="${escapeHTML(slide.btnText || '')}">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">رابط الزر</label>
                    <input type="text" class="slide-btn-link w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="#products" value="${escapeHTML(slide.btnLink || '')}">
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: listContainer });
    }
}

function setupBannerAdminControls() {
    if (adminBannerControlsInitialized) return;
    adminBannerControlsInitialized = true;

    const addBtn = document.getElementById('admin-add-mobile-banner-btn');
    const listContainer = document.getElementById('admin-mobile-banners-list');

    if (addBtn && listContainer) {
        addBtn.addEventListener('click', () => {
            const currentItems = collectAdminBannerSlides();
            currentItems.push({
                imageUrl: '',
                layout: 'auto',
                badge: '',
                title: '',
                price: '',
                btnText: '✦ تسوق الآن',
                btnLink: '#products'
            });
            renderAdminBannerSlides(currentItems);
            // التركيز على حقل الصورة الجديد
            const lastCard = listContainer.querySelector('.admin-banner-slide-item:last-child');
            lastCard?.querySelector('.slide-img')?.focus();
        });

        listContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.admin-remove-slide-btn');
            if (removeBtn) {
                const card = removeBtn.closest('.admin-banner-slide-item');
                if (card) {
                    const allCards = listContainer.querySelectorAll('.admin-banner-slide-item');
                    if (allCards.length <= 1) {
                        showToast("يجب أن يحتوي السلايدر على بانر واحد على الأقل.", "warning");
                        return;
                    }
                    card.remove();
                    // تحديث أرقام الشرائح
                    listContainer.querySelectorAll('.admin-banner-slide-item').forEach((c, idx) => {
                        const numEl = c.querySelector('.slide-num');
                        if (numEl) numEl.textContent = `#${idx + 1}`;
                        c.dataset.slideIndex = idx;
                    });
                }
            }
        });
    }
}

function collectAdminBannerSlides() {
    const listContainer = document.getElementById('admin-mobile-banners-list');
    if (!listContainer) return [];
    const cards = listContainer.querySelectorAll('.admin-banner-slide-item');
    const items = [];
    cards.forEach(card => {
        const layout = card.querySelector('.slide-layout')?.value || 'auto';
        const imageUrl = card.querySelector('.slide-img')?.value?.trim() || '';
        const badge = card.querySelector('.slide-badge')?.value || '';
        const title = card.querySelector('.slide-title')?.value || '';
        const price = card.querySelector('.slide-price')?.value || '';
        const btnText = card.querySelector('.slide-btn-text')?.value || '';
        const btnLink = card.querySelector('.slide-btn-link')?.value || '';
        items.push({ layout, imageUrl, badge, title, price, btnText, btnLink });
    });
    return items;
}

function setupAdminForms() {
    const form = document.getElementById('admin-settings-form');
    if (!form) return;

    // مستمعات التحديث اللحظي لحجم اللوجو
    const mobileLogoSlider = document.getElementById('admin-mobile-logo-size');
    const mobileLogoDisplay = document.getElementById('admin-mobile-logo-size-display');
    const mobileLogoImg = document.getElementById('mobile-site-logo-img');
    if (mobileLogoSlider) {
        mobileLogoSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (mobileLogoDisplay) mobileLogoDisplay.textContent = `${val}px`;
            if (mobileLogoImg) mobileLogoImg.style.height = `${val}px`;
        });
    }

    const desktopLogoSlider = document.getElementById('admin-logo-size');
    const desktopLogoDisplay = document.getElementById('admin-logo-size-display');
    const desktopLogoImg = document.getElementById('site-logo-img');
    if (desktopLogoSlider) {
        desktopLogoSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (desktopLogoDisplay) desktopLogoDisplay.textContent = `${val}px`;
            if (desktopLogoImg) desktopLogoImg.style.height = `${val}px`;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isUserAdmin()) {
            showToast("يرجى تسجيل الدخول بحساب المشرف (macaelctrec@gmail.com) أولاً من زر الحساب بالأعلى.");
            return;
        }

        const submitBtn = document.getElementById('save-admin-settings-btn');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الحفظ...';

        try {
            // 1. الهوية والشعار
            const logoUrlLight = document.getElementById('admin-logo-url-light')?.value.trim() || '';
            const logoUrlDark = document.getElementById('admin-logo-url-dark')?.value.trim() || '';
            const logoUrl = logoUrlLight || logoUrlDark || document.getElementById('admin-logo-url')?.value.trim() || '';
            const logoSize = parseInt(document.getElementById('admin-logo-size')?.value || 80);
            const mobileLogoSize = parseInt(document.getElementById('admin-mobile-logo-size')?.value || 34);

            await setDoc(doc(db, "config", "branding"), { 
                logoUrl, 
                logoUrlLight, 
                logoUrlDark, 
                logoSize, 
                mobileLogoSize 
            }, { merge: true });

            if (logoUrlLight) localStorage.setItem('macca_site_logo_light', logoUrlLight);
            if (logoUrlDark) localStorage.setItem('macca_site_logo_dark', logoUrlDark);
            if (logoUrl) localStorage.setItem('macca_site_logo', logoUrl);
            localStorage.setItem('macca_site_logo_size', logoSize);
            localStorage.setItem('macca_site_logo_mobile_size', mobileLogoSize);

            updateActiveSiteLogo();

            // 2. الواجهة الرئيسية
            const heroType = document.getElementById('admin-hero-type')?.value || 'image';
            const videoUrl = document.getElementById('admin-video-url')?.value || '';
            const imageUrl = document.getElementById('admin-image-url')?.value || '';
            const badgeText = document.getElementById('admin-hero-badge')?.value || '';
            const titleMain = document.getElementById('admin-hero-title')?.value || '';
            const titleSub = document.getElementById('admin-hero-subtitle')?.value || '';
            const description = document.getElementById('admin-hero-desc')?.value || '';
            const visibleMobile = document.getElementById('admin-hero-vis-mobile')?.checked !== false;
            const visibleDesktop = document.getElementById('admin-hero-vis-desktop')?.checked !== false;

            await setDoc(doc(db, "config", "homepage"), {
                heroType, videoUrl, imageUrl, badgeText,
                titleMain, titleSub, description,
                visibleMobile, visibleDesktop
            }, { merge: true });

            // 3. الشريط العلوي
            const topText = document.getElementById('admin-topbar-text')?.value || '';
            const topHighlight = document.getElementById('admin-topbar-highlight')?.value || '';
            const topVisible = document.getElementById('admin-topbar-visible')?.checked !== false;

            await setDoc(doc(db, "config", "top_bar"), {
                text: topText,
                highlight: topHighlight,
                visible: topVisible
            }, { merge: true });

            // 4. سلايدر بانرات الموبايل الحصري (أسفل شريط البحث)
            const mobileBannerVisible = document.getElementById('admin-mobile-banner-visible')?.checked !== false;
            const mobileBannerAutoplay = document.getElementById('admin-mobile-banner-autoplay')?.checked !== false;
            const bannerItems = collectAdminBannerSlides();

            const bannerConfig = {
                visible: mobileBannerVisible,
                autoplay: mobileBannerAutoplay,
                items: bannerItems
            };

            await setDoc(doc(db, "config", "mobile_banner"), bannerConfig, { merge: true });
            localStorage.setItem('macca_mobile_banner', JSON.stringify(bannerConfig));
            applyMobileBanners(bannerConfig);

            showToast("تم حفظ جميع إعدادات المتجر بنجاح!");
        } catch (err) {
            console.error("Error saving admin config:", err);
            showToast("خطأ أثناء حفظ الإعدادات: " + (err.message || ""));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
}

function setupSitemapGenerator() {
    const genBtn = document.getElementById('generate-sitemap-btn');
    const resultBox = document.getElementById('sitemap-result-container');
    const output = document.getElementById('sitemap-output');
    const copyBtn = document.getElementById('copy-sitemap-btn');

    if (!genBtn) return;

    genBtn.addEventListener('click', () => {
        if (!isUserAdmin()) {
            showToast("ميزة توليد الخريطة للمشرف فقط.");
            return;
        }

        const baseUrl = "https://macca3.shop/";
        const date = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        xml += `    <url><loc>${baseUrl}</loc><lastmod>${date}</lastmod><priority>1.0</priority></url>\n`;
        xml += `    <url><loc>${baseUrl}#products</loc><lastmod>${date}</lastmod><priority>0.9</priority></url>\n`;
        xml += `    <url><loc>${baseUrl}#offers</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>\n`;
        xml += `    <url><loc>${baseUrl}#blog</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>\n`;
        xml += `    <url><loc>${baseUrl}#contact</loc><lastmod>${date}</lastmod><priority>0.6</priority></url>\n`;

        const products = getAllProducts();
        products.forEach(p => {
            const id = p.shortId || p.id;
            xml += `    <url><loc>${baseUrl}#product/${id}</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>\n`;
        });

        const articles = getAllArticles();
        articles.forEach(a => {
            const id = a.shortId || a.id;
            xml += `    <url><loc>${baseUrl}#blog/${id}</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>\n`;
        });

        xml += `</urlset>`;

        if (output) output.value = xml;
        if (resultBox) resultBox.classList.remove('hidden');
        showToast("تم إنشاء خريطة الموقع بنجاح!");
    });

    if (copyBtn && output) {
        copyBtn.addEventListener('click', () => {
            output.select();
            navigator.clipboard.writeText(output.value).then(() => {
                showToast("تم نسخ كود خريطة الموقع!");
            });
        });
    }
}
