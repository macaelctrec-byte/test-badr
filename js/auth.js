// ===============================================================
// إدارة المصادقة وتسجيل الدخول (Authentication & Roles)
// ===============================================================

import { 
    auth, 
    provider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    ADMIN_EMAIL 
} from "./firebase-config.js";
import { showToast } from "./utils.js";

let currentIsAdmin = false;
let authChangeCallbacks = [];

export function isUserAdmin() {
    return currentIsAdmin;
}

export function onAdminStateChange(callback) {
    authChangeCallbacks.push(callback);
    callback(currentIsAdmin);
}

function notifyAdminState(isAdmin) {
    currentIsAdmin = isAdmin;
    authChangeCallbacks.forEach(cb => {
        try { cb(isAdmin); } catch(e) { console.error(e); }
    });
}

export const signInWithGoogle = async (e) => {
    if (e) e.preventDefault();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const email = user.email;

        if (email === ADMIN_EMAIL) {
            showToast(`أهلاً بك يا ${user.displayName || 'أدمن'}! تم تسجيل الدخول كمسؤول.`);
        } else {
            // السماح للعميل العادي بتسجيل الدخول للاحتفاظ ببياناته واسمه عند الطلب
            showToast(`أهلاً بك يا ${user.displayName || 'عميلنا العزيز'}!`);
        }
    } catch (error) {
        console.error('Google Sign-In Error:', error.message);
        showToast('تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
};

export const signOutGoogle = async (e) => {
    if (e) e.preventDefault();
    try {
        await signOut(auth);
        showToast('تم تسجيل الخروج بنجاح.');
    } catch (error) {
        console.error('Sign Out Error:', error);
    }
};

export function initAuth() {
    const loginBtn = document.getElementById('google-login-btn');
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userAvatarBtn = document.getElementById('user-avatar-btn');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const dropdownLogout = document.getElementById('google-logout-btn-dropdown');
    const dropdownAdminLink = document.getElementById('dropdown-admin-link');

    if (loginBtn) loginBtn.addEventListener('click', signInWithGoogle);
    if (dropdownLogout) dropdownLogout.addEventListener('click', signOutGoogle);

    // إدارة القائمة المنسدلة للأفاتار
    if (userAvatarBtn && userDropdownMenu) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userDropdownMenu.dataset.state === 'open';
            userDropdownMenu.dataset.state = isOpen ? 'closed' : 'open';
        });

        window.addEventListener('click', (e) => {
            if (userDropdownMenu.dataset.state === 'open') {
                if (!userAvatarBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                    userDropdownMenu.dataset.state = 'closed';
                }
            }
        });
    }

    if (dropdownAdminLink && userDropdownMenu) {
        dropdownAdminLink.addEventListener('click', () => {
            userDropdownMenu.dataset.state = 'closed';
        });
    }

    // متابعة حالة المستخدم
    onAuthStateChanged(auth, (user) => {
        const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);
        notifyAdminState(isAdmin);

        if (user) {
            const photo = user.photoURL || 'https://placehold.co/32x32/eeeeee/777777?text=User';
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
            }
            if (userAvatar) userAvatar.src = photo;
            if (loginBtn) {
                loginBtn.classList.add('hidden');
                loginBtn.classList.remove('inline-flex');
            }

            // إظهار رابط لوحة التحكم في القائمة المنسدلة فقط للأدمن
            if (dropdownAdminLink) {
                if (isAdmin) {
                    dropdownAdminLink.classList.remove('hidden');
                    dropdownAdminLink.classList.add('flex');
                } else {
                    dropdownAdminLink.classList.add('hidden');
                    dropdownAdminLink.classList.remove('flex');
                }
            }

            // إظهار أزرار إضافة المنتجات والمقالات في الأقسام
            const addProductBtn = document.getElementById('show-add-product-modal-btn');
            const addArticleBtn = document.getElementById('show-add-article-modal-btn');
            if (addProductBtn) addProductBtn.classList.toggle('hidden', !isAdmin);
            if (addArticleBtn) addArticleBtn.classList.toggle('hidden', !isAdmin);

        } else {
            if (userInfo) {
                userInfo.classList.add('hidden');
                userInfo.classList.remove('flex');
            }
            if (userAvatar) userAvatar.src = '';
            if (loginBtn) {
                loginBtn.classList.remove('hidden');
                loginBtn.classList.add('inline-flex');
            }
            if (dropdownAdminLink) {
                dropdownAdminLink.classList.add('hidden');
                dropdownAdminLink.classList.remove('flex');
            }

            const addProductBtn = document.getElementById('show-add-product-modal-btn');
            const addArticleBtn = document.getElementById('show-add-article-modal-btn');
            if (addProductBtn) addProductBtn.classList.add('hidden');
            if (addArticleBtn) addArticleBtn.classList.add('hidden');
        }

        // تحديث أيقونات lucide إذا كانت متاحة
        if (window.lucide) window.lucide.createIcons();
    });
}
