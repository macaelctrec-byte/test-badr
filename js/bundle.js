var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  increment,
  orderBy,
  limit,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
var firebaseConfig, app, auth, db, provider, ADMIN_EMAIL;
var init_firebase_config = __esm({
  "js/firebase-config.js"() {
    firebaseConfig = {
      apiKey: "AIzaSyBfslkMwWAmFXLPJ_aJZgSA7-59AhoOdUY",
      authDomain: "macaelctrec-f7795.firebaseapp.com",
      projectId: "macaelctrec-f7795",
      storageBucket: "macaelctrec-f7795.firebasestorage.app",
      messagingSenderId: "915102271751",
      appId: "1:915102271751:web:38cf552556f3cc5be15da2",
      measurementId: "G-231CS0RBZD"
    };
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    ADMIN_EMAIL = "macaelctrec@gmail.com";
    setPersistence(auth, browserSessionPersistence).catch(() => {
    });
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Firestore offline persistence: multiple tabs open.");
      } else if (err.code === "unimplemented") {
        console.warn("Firestore offline persistence is not supported in this browser.");
      }
    });
  }
});

// js/utils.js
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  let iconName = "check-circle";
  let iconColor = "text-emerald-400";
  if (type === "error") {
    iconName = "alert-circle";
    iconColor = "text-red-400";
  } else if (type === "warning") {
    iconName = "alert-triangle";
    iconColor = "text-amber-400";
  } else if (type === "info") {
    iconName = "info";
    iconColor = "text-blue-400";
  }
  toast.innerHTML = `
        <div class="flex-shrink-0 ${iconColor}">
            <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <span class="flex-grow text-xs sm:text-sm font-bold leading-snug">${escapeHTML(message)}</span>
    `;
  container.appendChild(toast);
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ root: toast });
  }
  setTimeout(() => {
    toast.style.animation = "toast-fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, 3200);
}
function showCartNotification(productName, quantity = 1) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast-notification toast-success flex items-center justify-between gap-3 shadow-2xl";
  toast.innerHTML = `
        <div class="flex items-center gap-2.5 flex-grow min-w-0">
            <div class="flex-shrink-0 text-emerald-400">
                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
            </div>
            <div class="flex flex-col min-w-0">
                <span class="text-xs sm:text-sm font-bold text-white leading-tight">\u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0633\u0644\u0629 \u0628\u0646\u062C\u0627\u062D!</span>
                <span class="text-[11px] text-gray-300 font-medium truncate">${escapeHTML(productName)}</span>
            </div>
        </div>
        <a href="#cart" class="flex-shrink-0 px-3 py-1.5 bg-[#ffcd00] hover:bg-[#ffda33] active:scale-95 text-gray-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1" data-page="cart">
            <span>\u0639\u0631\u0636 \u0627\u0644\u0633\u0644\u0629</span>
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        </a>
    `;
  container.appendChild(toast);
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ root: toast });
  }
  const cartIcon = document.querySelector('#mobile-bottom-nav [data-page="cart"] .mobile-bottom-icon-wrap') || document.getElementById("mobile-header-cart-badge")?.parentElement;
  if (cartIcon) {
    cartIcon.style.transform = "scale(1.25)";
    setTimeout(() => {
      cartIcon.style.transform = "";
    }, 350);
  }
  setTimeout(() => {
    toast.style.animation = "toast-fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }, 3800);
}
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"']/g, function(match) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[match];
  });
}
function generateShortId(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function validateEgyptianPhone(phone) {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s\-+]/g, "");
  const regex = /^(201|01)[0125][0-9]{8}$/;
  return regex.test(cleanPhone);
}
function isOfferActive(product) {
  if (!product || !product.isOnSale) return false;
  if (!product.saleEndDate) return true;
  const now = /* @__PURE__ */ new Date();
  const endDate = product.saleEndDate.toDate ? product.saleEndDate.toDate() : new Date(product.saleEndDate);
  return now < endDate;
}
function getRemainingTime(product) {
  if (!product || !product.saleEndDate) return null;
  const now = /* @__PURE__ */ new Date();
  const endDate = product.saleEndDate.toDate ? product.saleEndDate.toDate() : new Date(product.saleEndDate);
  const diff = endDate - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
  const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
  if (days > 0) {
    return `${days} \u064A\u0648\u0645`;
  } else {
    return `${hours} \u0633\u0627\u0639\u0629`;
  }
}
function getStarRatingHtml(rating = null, seed = "") {
  let score = rating;
  if (score === null || score === void 0) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
    }
    score = Math.abs(hash % 2) === 0 ? 5 : 4;
  }
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= score) {
      stars += "\u2605";
    } else {
      stars += "\u2606";
    }
  }
  return stars;
}
var init_utils = __esm({
  "js/utils.js"() {
  }
});

// js/auth.js
function isUserAdmin() {
  return currentIsAdmin;
}
function onAdminStateChange(callback) {
  authChangeCallbacks.push(callback);
  callback(currentIsAdmin);
}
function notifyAdminState(isAdmin) {
  currentIsAdmin = isAdmin;
  authChangeCallbacks.forEach((cb) => {
    try {
      cb(isAdmin);
    } catch (e) {
      console.error(e);
    }
  });
}
function initAuth() {
  const loginBtn = document.getElementById("google-login-btn");
  const userInfo = document.getElementById("user-info");
  const userAvatar = document.getElementById("user-avatar");
  const userAvatarBtn = document.getElementById("user-avatar-btn");
  const userDropdownMenu = document.getElementById("user-dropdown-menu");
  const dropdownLogout = document.getElementById("google-logout-btn-dropdown");
  const dropdownAdminLink = document.getElementById("dropdown-admin-link");
  if (loginBtn) loginBtn.addEventListener("click", signInWithGoogle);
  if (dropdownLogout) dropdownLogout.addEventListener("click", signOutGoogle);
  if (userAvatarBtn && userDropdownMenu) {
    userAvatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = userDropdownMenu.dataset.state === "open";
      userDropdownMenu.dataset.state = isOpen ? "closed" : "open";
    });
    window.addEventListener("click", (e) => {
      if (userDropdownMenu.dataset.state === "open") {
        if (!userAvatarBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
          userDropdownMenu.dataset.state = "closed";
        }
      }
    });
  }
  if (dropdownAdminLink && userDropdownMenu) {
    dropdownAdminLink.addEventListener("click", () => {
      userDropdownMenu.dataset.state = "closed";
    });
  }
  onAuthStateChanged(auth, (user) => {
    const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);
    notifyAdminState(isAdmin);
    if (user) {
      const photo = user.photoURL || "https://placehold.co/32x32/eeeeee/777777?text=User";
      if (userInfo) {
        userInfo.classList.remove("hidden");
        userInfo.classList.add("flex");
      }
      if (userAvatar) userAvatar.src = photo;
      if (loginBtn) {
        loginBtn.classList.add("hidden");
        loginBtn.classList.remove("inline-flex");
      }
      if (dropdownAdminLink) {
        if (isAdmin) {
          dropdownAdminLink.classList.remove("hidden");
          dropdownAdminLink.classList.add("flex");
        } else {
          dropdownAdminLink.classList.add("hidden");
          dropdownAdminLink.classList.remove("flex");
        }
      }
      const addProductBtn = document.getElementById("show-add-product-modal-btn");
      const addArticleBtn = document.getElementById("show-add-article-modal-btn");
      if (addProductBtn) addProductBtn.classList.toggle("hidden", !isAdmin);
      if (addArticleBtn) addArticleBtn.classList.toggle("hidden", !isAdmin);
    } else {
      if (userInfo) {
        userInfo.classList.add("hidden");
        userInfo.classList.remove("flex");
      }
      if (userAvatar) userAvatar.src = "";
      if (loginBtn) {
        loginBtn.classList.remove("hidden");
        loginBtn.classList.add("inline-flex");
      }
      if (dropdownAdminLink) {
        dropdownAdminLink.classList.add("hidden");
        dropdownAdminLink.classList.remove("flex");
      }
      const addProductBtn = document.getElementById("show-add-product-modal-btn");
      const addArticleBtn = document.getElementById("show-add-article-modal-btn");
      if (addProductBtn) addProductBtn.classList.add("hidden");
      if (addArticleBtn) addArticleBtn.classList.add("hidden");
    }
    if (window.lucide) window.lucide.createIcons();
  });
}
var currentIsAdmin, authChangeCallbacks, signInWithGoogle, signOutGoogle;
var init_auth = __esm({
  "js/auth.js"() {
    init_firebase_config();
    init_utils();
    currentIsAdmin = false;
    authChangeCallbacks = [];
    signInWithGoogle = async (e) => {
      if (e) e.preventDefault();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const email = user.email;
        if (email === ADMIN_EMAIL) {
          showToast(`\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 ${user.displayName || "\u0623\u062F\u0645\u0646"}! \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0643\u0645\u0633\u0624\u0648\u0644.`);
        } else {
          showToast(`\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 ${user.displayName || "\u0639\u0645\u064A\u0644\u0646\u0627 \u0627\u0644\u0639\u0632\u064A\u0632"}!`);
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        showToast("\u062A\u0639\u0630\u0631 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.");
      }
    };
    signOutGoogle = async (e) => {
      if (e) e.preventDefault();
      try {
        await signOut(auth);
        showToast("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0628\u0646\u062C\u0627\u062D.");
      } catch (error) {
        console.error("Sign Out Error:", error);
      }
    };
  }
});

// js/cart.js
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
  updateCartView();
}
function getCart() {
  return cart;
}
function clearCart() {
  cart = [];
  saveCart();
}
function addToCart(product, quantity = 1) {
  if (!product || !product.id) return;
  const safeColorKey = product.selectedColor?.hex ? String(product.selectedColor.hex).replace(/[^a-zA-Z0-9_-]/g, "") : "";
  const cartItemId = safeColorKey ? `${product.id}_${safeColorKey}` : `${product.id}_default`;
  const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      cartItemId,
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      image: product.image || product.imageUrls && product.imageUrls[0] || "https://placehold.co/400x400/18181b/71717a?text=Macca",
      selectedColor: product.selectedColor || null,
      quantity
    });
  }
  saveCart();
  showCartNotification(product.name, quantity);
}
function removeFromCart(cartItemId) {
  cart = cart.filter((item) => item.cartItemId !== cartItemId);
  saveCart();
}
function updateCartQuantity(cartItemId, quantity) {
  if (quantity < 1) {
    removeFromCart(cartItemId);
    return;
  }
  const item = cart.find((i) => i.cartItemId === cartItemId);
  if (item) {
    item.quantity = quantity;
    saveCart();
  }
}
function updateCartView() {
  const badge = document.getElementById("cart-count-badge");
  const mobileBadge = document.getElementById("mobile-cart-badge");
  const mobileHeaderBadge = document.getElementById("mobile-header-cart-badge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  [badge, mobileBadge, mobileHeaderBadge].forEach((b) => {
    if (b) {
      if (totalItems > 0) {
        b.textContent = totalItems;
        b.classList.remove("hidden");
        b.classList.add("flex");
      } else {
        b.classList.add("hidden");
        b.classList.remove("flex");
      }
    }
  });
  if (document.getElementById("page-cart")?.classList.contains("active")) {
    renderCartPage();
  }
}
function renderCartPage() {
  const container = document.getElementById("cart-items-container");
  const emptyMsg = document.getElementById("cart-empty-message");
  const summary = document.getElementById("cart-summary");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  const freeShippingCard = document.getElementById("free-shipping-card");
  const freeShippingText = document.getElementById("free-shipping-text");
  const freeShippingFill = document.getElementById("free-shipping-fill");
  if (!container || !emptyMsg || !summary) return;
  if (cart.length === 0) {
    container.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    summary.classList.add("hidden");
    if (freeShippingCard) freeShippingCard.classList.add("hidden");
  } else {
    emptyMsg.classList.add("hidden");
    summary.classList.remove("hidden");
    if (freeShippingCard) freeShippingCard.classList.remove("hidden");
    container.innerHTML = cart.map((item) => `
            <div class="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-all" data-cart-item-id="${item.cartItemId}">
                <img src="${item.image || "https://placehold.co/400x400/18181b/71717a?text=Macca"}" onerror="this.src='https://placehold.co/400x400/18181b/71717a?text=Macca'" alt="${escapeHTML(item.name)}" class="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-white dark:bg-[#111] p-1 rounded-xl shadow-sm">
                
                <div class="flex-grow text-center sm:text-right">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">${escapeHTML(item.name)}</h3>
                    ${item.selectedColor ? `
                        <div class="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span class="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm" style="background-color: ${item.selectedColor.hex};"></span>
                            <span>${escapeHTML(item.selectedColor.name || "\u0644\u0648\u0646 \u0645\u062E\u0635\u0635")}</span>
                        </div>
                    ` : ""}
                    <div class="text-sm font-bold text-[#ffcd00] mt-1">
                        ${parseFloat(item.price).toFixed(2)} \u062C.\u0645 \u0644\u0644\u0642\u0637\u0639\u0629
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

                    <button class="remove-from-cart-btn p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" data-cart-item-id="${item.cartItemId}" title="\u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `).join("");
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    if (totalEl) totalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    const FREE_SHIPPING_THRESHOLD = 1e3;
    if (freeShippingText && freeShippingFill) {
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        freeShippingText.innerHTML = `\u{1F389} <strong>\u0645\u0628\u0631\u0648\u0643!</strong> \u0637\u0644\u0628\u0643 \u0645\u0624\u0647\u0644 \u0627\u0644\u0622\u0646 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062C\u0627\u0646\u064A \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u0642\u0637\u0645!`;
        freeShippingFill.style.width = "100%";
      } else {
        const diff = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
        const pct = Math.min(100, Math.round(subtotal / FREE_SHIPPING_THRESHOLD * 100));
        freeShippingText.innerHTML = `\u0623\u0636\u0641 \u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0642\u064A\u0645\u0629 <strong>${diff} EGP</strong> \u0623\u062E\u0631\u0649 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A!`;
        freeShippingFill.style.width = `${pct}%`;
      }
    }
    addCartItemListeners();
  }
  if (window.lucide) window.lucide.createIcons();
}
function addCartItemListeners() {
  document.querySelectorAll(".remove-from-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cartItemId = e.currentTarget.dataset.cartItemId;
      removeFromCart(cartItemId);
    });
  });
  document.querySelectorAll(".cart-item-quantity").forEach((input) => {
    input.addEventListener("change", (e) => {
      const cartItemId = e.currentTarget.dataset.cartItemId;
      const newQuantity = parseInt(e.currentTarget.value, 10) || 1;
      updateCartQuantity(cartItemId, newQuantity);
    });
  });
  document.querySelectorAll(".change-qty-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cartItemId = e.currentTarget.dataset.cartItemId;
      const delta = parseInt(e.currentTarget.dataset.delta, 10);
      const item = cart.find((i) => i.cartItemId === cartItemId);
      if (item) {
        updateCartQuantity(cartItemId, item.quantity + delta);
      }
    });
  });
}
async function generateWhatsAppInvoice(customerData2 = null) {
  if (cart.length === 0) {
    showToast("\u0633\u0644\u0651\u062A\u0643 \u0641\u0627\u0631\u063A\u0629.");
    return;
  }
  const storePhone = "201146641942";
  const orderRefId = generateShortId(6).toUpperCase();
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.toLocaleDateString("ar-EG");
  const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  let subtotal = 0;
  const orderItems = cart.map((item) => {
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
  try {
    await addDoc(collection(db, "orders"), {
      orderRefId,
      customerName: customerData2?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      customerPhone: customerData2?.phone || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      customerAddress: customerData2?.address || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
      customerNotes: customerData2?.notes || "",
      items: orderItems,
      totalAmount: subtotal,
      status: "pending",
      createdAt: Timestamp.now(),
      userEmail: auth.currentUser?.email || null
    });
    console.log("Order saved to Firestore successfully, ref:", orderRefId);
  } catch (err) {
    console.warn("Non-critical: Failed to save order to Firestore:", err);
  }
  let message = `\u{1F44B} \u0645\u0631\u062D\u0628\u0627\u064B \u0645\u062A\u062C\u0631 \u0645\u0643\u0629\u060C \u0623\u0648\u062F \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u062C\u062F\u064A\u062F:

`;
  if (customerData2) {
    message += `\u{1F464} *\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644:*
`;
    message += `\u25AA \u0627\u0644\u0627\u0633\u0645: ${customerData2.name}
`;
    message += `\u25AA \u0627\u0644\u0647\u0627\u062A\u0641: ${customerData2.phone}
`;
    message += `\u25AA \u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${customerData2.address}
`;
    if (customerData2.notes) {
      message += `\u{1F4DD} \u0645\u0644\u0627\u062D\u0638\u0627\u062A: ${customerData2.notes}
`;
    }
    message += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

`;
  }
  message += `\u{1F9FE} *\u0641\u0627\u062A\u0648\u0631\u0629 \u0637\u0644\u0628 \u0645\u0628\u062F\u0626\u064A\u0629*
`;
  message += `\u{1F516} \u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062C\u0639: #${orderRefId}
`;
  message += `\u{1F4C5} \u0627\u0644\u062A\u0627\u0631\u064A\u062E: ${dateStr} - ${timeStr}
`;
  message += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

`;
  message += `\u{1F4E6} *\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629:*
`;
  orderItems.forEach((item, index) => {
    const colorInfo = item.selectedColor ? ` (\u0644\u0648\u0646: ${item.selectedColor.name || "\u0645\u062E\u0635\u0635"})` : "";
    message += `${index + 1}\uFE0F\u20E3 *${item.name}${colorInfo}*
`;
    message += `   \u25AA \u0627\u0644\u0643\u0645\u064A\u0629: ${item.quantity}
`;
    message += `   \u25AA \u0633\u0639\u0631 \u0627\u0644\u0648\u062D\u062F\u0629: ${parseFloat(item.price).toFixed(2)} \u062C.\u0645
`;
    message += `   \u25AA \u0627\u0644\u0645\u062C\u0645\u0648\u0639: ${item.itemTotal.toFixed(2)} \u062C.\u0645
`;
    if (index < orderItems.length - 1) {
      message += `   --------------------
`;
    }
  });
  message += `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`;
  message += `\u{1F4B0} *\u0645\u0644\u062E\u0635 \u0627\u0644\u062F\u0641\u0639:*
`;
  message += `\u25AB \u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A: ${subtotal.toFixed(2)} \u062C.\u0645
`;
  message += `\u{1F69A} \u0627\u0644\u0634\u062D\u0646: \u064A\u062A\u0645 \u062A\u062D\u062F\u064A\u062F\u0647 \u0639\u0646\u062F \u0627\u0644\u062A\u0623\u0643\u064A\u062F
`;
  message += `\u{1F4E2} *\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0646\u0647\u0627\u0626\u064A: ${subtotal.toFixed(2)} \u062C.\u0645*
`;
  message += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

`;
  message += `\u{1F4CD} *\u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0637\u0644\u0628 \u0648\u062A\u0623\u0643\u064A\u062F\u0647 \u0645\u0639 \u0627\u0644\u0641\u0646\u064A.* \u0634\u0643\u0631\u0627\u064B \u0644\u0643\u0645!`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodedMessage}`;
  cart = [];
  saveCart();
  window.open(whatsappUrl, "_blank");
}
function initCart() {
  updateCartView();
  const orderModal = document.getElementById("order-details-modal");
  const closeOrderModalBtn = document.getElementById("close-order-modal-btn");
  const cancelOrderBtn = document.getElementById("cancel-order-btn");
  const orderForm = document.getElementById("order-details-form");
  const checkoutBtn = document.getElementById("whatsapp-checkout-btn");
  const proceedCheckoutBtn = document.getElementById("proceed-to-checkout-btn");
  if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener("click", (e) => {
      if (cart.length === 0) {
        e.preventDefault();
        showToast("\u0633\u0644\u0651\u062A\u0643 \u0641\u0627\u0631\u063A\u0629! \u064A\u0631\u062C\u0649 \u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C\u0627\u062A \u0623\u0648\u0644\u0627\u064B.");
      }
    });
  }
  const openOrderModal = () => {
    if (cart.length === 0) {
      showToast("\u0633\u0644\u0651\u062A\u0643 \u0641\u0627\u0631\u063A\u0629.");
      return;
    }
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.displayName) {
      const nameInput = document.getElementById("order-customer-name");
      if (nameInput && !nameInput.value) {
        nameInput.value = currentUser.displayName;
      }
    }
    if (orderModal) orderModal.classList.remove("hidden");
  };
  const closeOrderModal = () => {
    if (orderModal) orderModal.classList.add("hidden");
  };
  if (checkoutBtn) checkoutBtn.addEventListener("click", openOrderModal);
  if (closeOrderModalBtn) closeOrderModalBtn.addEventListener("click", closeOrderModal);
  if (cancelOrderBtn) cancelOrderBtn.addEventListener("click", closeOrderModal);
  if (orderModal) {
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const customerData2 = {
        name: document.getElementById("order-customer-name").value.trim(),
        phone: document.getElementById("order-customer-phone").value.trim(),
        address: document.getElementById("order-customer-address").value.trim(),
        notes: document.getElementById("order-notes").value.trim()
      };
      closeOrderModal();
      generateWhatsAppInvoice(customerData2);
    });
  }
}
var CART_STORAGE_KEY, cart;
var init_cart = __esm({
  "js/cart.js"() {
    init_firebase_config();
    init_utils();
    CART_STORAGE_KEY = "macca_cart_v1";
    cart = [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
});

// js/skeleton.js
function renderProductCardSkeleton(count = 4) {
  const cardHtml = `
        <div class="product-card-wrapper">
            <div class="product-card bg-white dark:bg-[#202124] rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden p-2.5 sm:p-3 flex flex-col h-full">
                <!-- \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C (\u0646\u0633\u0628\u0629 1:1) -->
                <div class="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3">
                    <div class="skeleton-shimmer skeleton-img w-full h-full"></div>
                    <!-- \u0634\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0648\u0647\u0645\u064A\u0629 -->
                    <div class="absolute top-2.5 right-2.5 w-14 h-5 rounded-full skeleton-shimmer"></div>
                    <!-- \u0632\u0631 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 -->
                    <div class="absolute top-2.5 left-2.5 w-8 h-8 rounded-full skeleton-shimmer"></div>
                </div>

                <!-- \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C -->
                <div class="flex-grow flex flex-col">
                    <!-- \u0627\u0644\u0645\u0627\u0631\u0643\u0629 \u0648\u0627\u0644\u0642\u0633\u0645 -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="w-16 h-3.5 rounded skeleton-shimmer"></div>
                        <div class="w-12 h-3.5 rounded skeleton-shimmer"></div>
                    </div>

                    <!-- \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0633\u0637\u0631\u064A\u0646 -->
                    <div class="w-11/12 h-4 rounded skeleton-shimmer mb-1.5"></div>
                    <div class="w-3/4 h-4 rounded skeleton-shimmer mb-3"></div>

                    <!-- \u0627\u0644\u0633\u0639\u0631 \u0648\u0632\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 -->
                    <div class="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <div class="w-20 h-5 rounded skeleton-shimmer mb-1"></div>
                            <div class="w-12 h-3 rounded skeleton-shimmer"></div>
                        </div>
                        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl skeleton-shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
  return Array(count).fill(cardHtml).join("");
}
function renderProductDetailsSkeleton() {
  return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- \u0645\u0633\u0627\u0631 \u0627\u0644\u062A\u0646\u0642\u0644 Breadcrumbs -->
            <div class="flex items-center gap-2 mb-6">
                <div class="w-16 h-4 rounded skeleton-shimmer"></div>
                <div class="w-4 h-4 rounded skeleton-shimmer"></div>
                <div class="w-24 h-4 rounded skeleton-shimmer"></div>
                <div class="w-4 h-4 rounded skeleton-shimmer"></div>
                <div class="w-32 h-4 rounded skeleton-shimmer"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <!-- \u0645\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631 (5 \u0623\u0639\u0645\u062F\u0629) -->
                <div class="lg:col-span-5 space-y-4">
                    <div class="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5">
                        <div class="skeleton-shimmer w-full h-full"></div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-20 h-20 rounded-2xl skeleton-shimmer"></div>
                        <div class="w-20 h-20 rounded-2xl skeleton-shimmer"></div>
                        <div class="w-20 h-20 rounded-2xl skeleton-shimmer"></div>
                    </div>
                </div>

                <!-- \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A (7 \u0623\u0639\u0645\u062F\u0629) -->
                <div class="lg:col-span-7 space-y-5">
                    <!-- \u0627\u0644\u0634\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0627\u0631\u0643\u0629 -->
                    <div class="flex items-center gap-3">
                        <div class="w-24 h-6 rounded-full skeleton-shimmer"></div>
                        <div class="w-20 h-6 rounded-full skeleton-shimmer"></div>
                    </div>

                    <!-- \u0627\u0644\u0639\u0646\u0648\u0627\u0646 -->
                    <div class="space-y-2">
                        <div class="w-5/6 h-7 rounded-xl skeleton-shimmer"></div>
                        <div class="w-2/3 h-7 rounded-xl skeleton-shimmer"></div>
                    </div>

                    <!-- \u0643\u0627\u0631\u062A \u0627\u0644\u0633\u0639\u0631 \u0648\u0627\u0644\u062E\u0635\u0645 -->
                    <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div class="space-y-2">
                            <div class="w-28 h-7 rounded skeleton-shimmer"></div>
                            <div class="w-20 h-4 rounded skeleton-shimmer"></div>
                        </div>
                        <div class="w-24 h-8 rounded-full skeleton-shimmer"></div>
                    </div>

                    <!-- \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u062A\u062D\u062F\u064A\u062F -->
                    <div class="space-y-2">
                        <div class="w-28 h-4 rounded skeleton-shimmer"></div>
                        <div class="flex gap-2">
                            <div class="w-8 h-8 rounded-full skeleton-shimmer"></div>
                            <div class="w-8 h-8 rounded-full skeleton-shimmer"></div>
                            <div class="w-8 h-8 rounded-full skeleton-shimmer"></div>
                        </div>
                    </div>

                    <!-- \u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0633\u0644\u0629 \u0648\u0627\u0644\u0643\u0645\u064A\u0629 -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <div class="w-full sm:w-36 h-14 rounded-2xl skeleton-shimmer"></div>
                        <div class="flex-grow h-14 rounded-2xl skeleton-shimmer"></div>
                    </div>

                    <!-- \u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0635\u0641\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629 -->
                    <div class="pt-6 space-y-3">
                        <div class="w-32 h-5 rounded skeleton-shimmer mb-4"></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                            <div class="h-12 rounded-xl skeleton-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function renderCheckoutSummarySkeleton() {
  const miniItemsHtml = Array(3).fill(`
        <div class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div class="w-12 h-12 rounded-lg skeleton-shimmer flex-shrink-0"></div>
            <div class="flex-grow space-y-1.5">
                <div class="w-32 h-3.5 rounded skeleton-shimmer"></div>
                <div class="w-16 h-3 rounded skeleton-shimmer"></div>
            </div>
            <div class="w-16 h-4 rounded skeleton-shimmer"></div>
        </div>
    `).join("");
  return `
        <div class="space-y-4">
            <div class="space-y-2.5">
                ${miniItemsHtml}
            </div>
            <div class="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2.5 text-xs">
                <div class="flex justify-between items-center">
                    <div class="w-20 h-4 rounded skeleton-shimmer"></div>
                    <div class="w-16 h-4 rounded skeleton-shimmer"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="w-24 h-4 rounded skeleton-shimmer"></div>
                    <div class="w-16 h-4 rounded skeleton-shimmer"></div>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                    <div class="w-24 h-5 rounded skeleton-shimmer"></div>
                    <div class="w-20 h-5 rounded skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    `;
}
function renderOrderTrackingSkeleton() {
  const timelineStepsHtml = Array(7).fill(`
        <div class="tracking-step flex items-start gap-4">
            <div class="w-9 h-9 rounded-full skeleton-shimmer flex-shrink-0"></div>
            <div class="flex-grow space-y-1 pt-1">
                <div class="w-32 h-4 rounded skeleton-shimmer"></div>
                <div class="w-56 h-3 rounded skeleton-shimmer"></div>
                <div class="w-24 h-2.5 rounded skeleton-shimmer mt-1"></div>
            </div>
        </div>
    `).join("");
  return `
        <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#202124] border border-gray-100 dark:border-white/5 shadow-xl space-y-8">
            <!-- \u0627\u0644\u0647\u064A\u062F\u0631: \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u0629 -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div class="space-y-2">
                    <div class="w-44 h-6 rounded-lg skeleton-shimmer"></div>
                    <div class="w-32 h-3.5 rounded skeleton-shimmer"></div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-24 h-8 rounded-full skeleton-shimmer"></div>
                    <div class="w-24 h-8 rounded-full skeleton-shimmer"></div>
                </div>
            </div>

            <!-- \u0627\u0644\u062E\u0637 \u0627\u0644\u0632\u0645\u0646\u064A \u0644\u0644\u0637\u0644\u0628 (Timeline) -->
            <div class="space-y-4">
                <div class="w-36 h-5 rounded skeleton-shimmer mb-6"></div>
                <div class="space-y-6">
                    ${timelineStepsHtml}
                </div>
            </div>

            <!-- \u0634\u0628\u0643\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0627\u0644\u062F\u0641\u0639 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <!-- \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0627\u0644\u0634\u062D\u0646 -->
                <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                    <div class="w-32 h-4 rounded skeleton-shimmer mb-3"></div>
                    <div class="w-40 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-32 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-48 h-3.5 rounded skeleton-shimmer"></div>
                </div>

                <!-- \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0648\u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 -->
                <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                    <div class="w-32 h-4 rounded skeleton-shimmer mb-3"></div>
                    <div class="w-36 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-28 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="h-28 w-full rounded-xl skeleton-shimmer mt-2"></div>
                </div>
            </div>
        </div>
    `;
}
function renderAdminOrdersTableSkeleton(rows = 6) {
  const rowHtml = `
        <tr class="border-b border-gray-100 dark:border-white/5">
            <td class="py-3.5 px-3"><div class="w-24 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-24 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-16 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-16 h-4 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-6 rounded-full skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-24 h-6 rounded-full skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3"><div class="w-20 h-3.5 rounded skeleton-shimmer"></div></td>
            <td class="py-3.5 px-3 text-center"><div class="w-16 h-7 rounded-lg skeleton-shimmer mx-auto"></div></td>
        </tr>
    `;
  return Array(rows).fill(rowHtml).join("");
}
function renderArticleCardSkeleton(count = 3) {
  const cardHtml = `
        <article class="bg-white dark:bg-[#202124] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-full">
            <div class="h-56 w-full skeleton-shimmer relative">
                <div class="absolute top-4 right-4 w-20 h-6 rounded-full skeleton-shimmer"></div>
            </div>
            <div class="p-6 flex-grow flex flex-col space-y-3">
                <div class="flex items-center gap-3">
                    <div class="w-24 h-3.5 rounded skeleton-shimmer"></div>
                    <div class="w-16 h-3.5 rounded skeleton-shimmer"></div>
                </div>
                <div class="w-5/6 h-6 rounded-lg skeleton-shimmer"></div>
                <div class="w-full h-4 rounded skeleton-shimmer"></div>
                <div class="w-4/5 h-4 rounded skeleton-shimmer"></div>
                <div class="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div class="w-28 h-4 rounded skeleton-shimmer"></div>
                    <div class="w-5 h-5 rounded-full skeleton-shimmer"></div>
                </div>
            </div>
        </article>
    `;
  return Array(count).fill(cardHtml).join("");
}
var init_skeleton = __esm({
  "js/skeleton.js"() {
  }
});

// js/products.js
var products_exports = {};
__export(products_exports, {
  CART_PLUS_ICON_SVG: () => CART_PLUS_ICON_SVG,
  addColorVariantRow: () => addColorVariantRow,
  getAllProducts: () => getAllProducts,
  initAllMobilePeekCarousels: () => initAllMobilePeekCarousels,
  initMobileCatalogControls: () => initMobileCatalogControls,
  initMobileOffersPeekCarousel: () => initMobileOffersPeekCarousel,
  initMobilePeekCarousel: () => initMobilePeekCarousel,
  initProductForm: () => initProductForm,
  loadProducts: () => loadProducts,
  openProductModal: () => openProductModal,
  renderAllProductViews: () => renderAllProductViews,
  renderOffersPage: () => renderOffersPage,
  renderProductCard: () => renderProductCard,
  renderProductDetails: () => renderProductDetails,
  resetModalToAddMode: () => resetModalToAddMode,
  setPreFilterType: () => setPreFilterType,
  setupAddToCartButtons: () => setupAddToCartButtons,
  setupAdminProductButtons: () => setupAdminProductButtons,
  showProductsSkeletons: () => showProductsSkeletons
});
function getAllProducts() {
  return allProducts;
}
function setPreFilterType(type) {
  preFilterType = type;
}
function renderProductCard(product) {
  if (!product) return "";
  const mainImg = product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : product.imageUrl || "https://placehold.co/400x400/18181b/71717a?text=Macca";
  const offerActive = isOfferActive(product);
  const inWishlist = isInWishlist(product.shortId || product.id);
  let badgesHTML = "";
  let discountPercent = 0;
  if (product.isAvailable !== false && offerActive) {
    if (product.originalPrice && product.originalPrice > product.price) {
      discountPercent = Math.round((product.originalPrice - product.price) / product.originalPrice * 100);
      badgesHTML += `<div class="sale-badge">\u062E\u0635\u0645 ${discountPercent}%</div>`;
    } else {
      badgesHTML += `<div class="sale-badge">\u0639\u0631\u0636</div>`;
    }
  }
  let imageClass = "h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105 p-2";
  let addToCartBtnState = "";
  let addToCartBtnTitle = "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0633\u0644\u0629";
  if (product.isAvailable === false) {
    badgesHTML += `<div class="mb-1 px-2.5 py-1 bg-gray-800 text-white text-[10px] font-bold rounded-full shadow-sm w-fit backdrop-blur-sm bg-opacity-90">\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631</div>`;
    imageClass += " grayscale opacity-60";
    addToCartBtnState = "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-400 shadow-none pointer-events-none";
    addToCartBtnTitle = "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u062D\u0627\u0644\u064A\u0627\u064B";
  } else {
    addToCartBtnState = "bg-[#ffcd00] text-gray-900 shadow-md shadow-[#ffcd00]/20 hover:bg-[#ffda33] hover:scale-110 active:scale-95";
  }
  let countdownHTML = "";
  const remaining = getRemainingTime(product);
  if (remaining && product.isAvailable !== false && offerActive) {
    countdownHTML = `
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6 flex items-end justify-center pointer-events-none z-10">
                <div class="px-2 py-0.5 bg-[#ffcd00]/95 backdrop-blur-sm text-gray-900 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                    <i data-lucide="timer" class="w-3 h-3"></i>
                    <span>\u0645\u062A\u0628\u0642\u064A ${remaining}</span>
                </div>
            </div>`;
  }
  const isAdmin = isUserAdmin();
  const adminButtonsHTML = isAdmin ? `
        <div class="absolute top-2 right-2 z-30 flex flex-col gap-1.5">
            <button class="edit-product-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white shadow-md transition-colors" title="\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C" data-product-id="${product.id}">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="delete-product-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-md transition-colors" title="\u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C" data-product-id="${product.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>` : "";
  const pIdentifier = product.shortId || product.id;
  return `
    <div class="product-card-wrapper group relative bg-white dark:bg-[#202124] rounded-[1.5rem] border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 flex flex-col h-full"
         data-product-id="${product.id}"
         data-product-name="${escapeHTML(product.name)}"
         data-product-price="${product.price}"
         data-product-image="${mainImg}">

        <!-- \u0642\u0633\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0644\u0634\u0627\u0631\u0627\u062A -->
        <div class="product-image-container relative h-36 sm:h-56 overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <div class="absolute top-2.5 left-2.5 z-20 flex flex-col items-start gap-1">
                ${badgesHTML}
            </div>

            <!-- \u0632\u0631 \u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629 -->
            <button class="wishlist-toggle-btn absolute top-2.5 ${isAdmin ? "left-14" : "left-2.5"} z-20 p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-[#202124]/80 backdrop-blur-md hover:bg-white dark:hover:bg-[#202124] shadow-sm transition-all text-gray-400 active:scale-90 ${inWishlist ? "active" : ""}" 
                    title="${inWishlist ? "\u0625\u0632\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629" : "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629"}"
                    data-product-id="${pIdentifier}"
                    data-product-name="${escapeHTML(product.name)}"
                    data-product-price="${product.price}"
                    data-product-image="${mainImg}">
                <i data-lucide="heart" class="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${inWishlist ? "fill-red-500 text-red-500" : ""}"></i>
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

        <!-- \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C -->
        <div class="product-info-box p-2.5 sm:p-5 flex flex-col flex-grow relative">
            ${product.isBestSeller ? `
                <div class="bestseller-crown-badge absolute top-[-14px] right-3 w-7 h-7 sm:w-9 sm:h-9 bg-white dark:bg-[#2c2f38] rounded-full flex items-center justify-center shadow-md border-2 border-amber-400 z-10" title="\u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u0627\u064B">
                    <i data-lucide="crown" class="w-3 h-3 sm:w-4 sm:h-4 text-[#ffcd00] fill-current"></i>
                </div>
            ` : ""}

            <div class="capsule-tags-row flex justify-between items-center mb-1.5">
                 <div class="flex items-center gap-1">
                    ${product.company ? `
                        <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-[90px]">${escapeHTML(product.company)}</span>
                    ` : ""}
                    ${discountPercent > 0 ? `
                        <span class="capsule-discount-tag text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 px-1.5 py-0.5 rounded-full hidden">\u062E\u0635\u0645 ${discountPercent}%</span>
                    ` : ""}
                 </div>
                 <div class="text-[#ffcd00] text-[10px] sm:text-xs flex gap-0.5" title="\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621">
                     ${getStarRatingHtml(product.rating, product.id)}
                 </div>
            </div>

            <a href="#product/${pIdentifier}" class="product-details-link block mb-1.5" data-product-id="${product.id}">
                <h3 class="text-xs sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#ffcd00] transition-colors h-[2.1rem] sm:h-[2.8rem]" title="${escapeHTML(product.name)}">
                    ${escapeHTML(product.name)}
                </h3>
            </a>

            <!-- \u0627\u0644\u0633\u0639\u0631 \u0648\u0632\u0631 \u0627\u0644\u0633\u0644\u0629 -->
            <div class="mt-auto pt-2 sm:pt-3 flex items-end justify-between gap-1.5 sm:gap-2 border-t border-dashed border-gray-100 dark:border-white/10">
                <div class="flex flex-col">
                    ${offerActive && product.isAvailable !== false ? `
                        <span class="text-[10px] sm:text-[11px] text-gray-400 line-through mb-0.5 font-medium">${parseFloat(product.originalPrice).toFixed(2)}</span>
                        <div class="flex items-baseline gap-0.5 sm:gap-1">
                            <span class="price-number text-base sm:text-2xl font-black text-red-600 dark:text-red-500">${parseFloat(product.price).toFixed(0)}</span>
                            <span class="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">\u062C.\u0645</span>
                        </div>
                    ` : `
                        <span class="text-[10px] sm:text-[11px] text-transparent select-none mb-0.5">.</span>
                        <div class="flex items-baseline gap-0.5 sm:gap-1">
                            <span class="price-number text-base sm:text-2xl font-black text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(0)}</span>
                            <span class="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">\u062C.\u0645</span>
                        </div>
                    `}
                </div>

                <button class="add-to-cart-btn h-8 w-8 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${addToCartBtnState}" title="${addToCartBtnTitle}">
                    ${product.isAvailable !== false ? CART_PLUS_ICON_SVG : `<i data-lucide="bell-off" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"></i>`}
                </button>
            </div>
        </div>
    </div>`;
}
function renderAllProductViews() {
  if (document.getElementById("page-offers")?.classList.contains("active")) {
    renderOffersPage();
  }
  const searchInput = document.getElementById("product-search-input");
  const searchTerm = (searchInput?.value || "").toLowerCase().trim();
  const category = document.getElementById("product-category-filter")?.value || "all";
  const brand = document.getElementById("product-brand-filter")?.value || "all";
  const sort = document.getElementById("product-sort-filter")?.value || "default";
  const minPrice = parseFloat(document.getElementById("product-min-price")?.value) || 0;
  const maxPrice = parseFloat(document.getElementById("product-max-price")?.value) || 999999;
  let filtered = [...allProducts];
  if (preFilterType === "sale") {
    filtered = filtered.filter((p) => isOfferActive(p));
  } else if (preFilterType === "bestseller") {
    filtered = filtered.filter((p) => p.isBestSeller);
  }
  if (searchTerm) {
    filtered = filtered.filter(
      (p) => p.name && p.name.toLowerCase().includes(searchTerm) || p.company && p.company.toLowerCase().includes(searchTerm) || p.model && p.model.toLowerCase().includes(searchTerm)
    );
  }
  if (category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (brand !== "all") {
    filtered = filtered.filter((p) => p.company === brand);
  }
  filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }
  const offersGrid = document.getElementById("home-offers-grid");
  const bestsellersGrid = document.getElementById("home-bestsellers-grid");
  const productsGrid = document.getElementById("products-grid");
  const noProductsMsg = document.getElementById("no-products-message");
  const homeOffersSection = document.getElementById("home-offers-section");
  const homeBestsellersSection = document.getElementById("home-bestsellers-section");
  const offers = allProducts.filter((p) => isOfferActive(p));
  const bestsellers = allProducts.filter((p) => p.isBestSeller);
  if (offersGrid && homeOffersSection) {
    const topOffers = offers.slice(0, 12);
    if (topOffers.length > 0) {
      offersGrid.innerHTML = topOffers.map((p) => renderProductCard(p)).join("");
      homeOffersSection.classList.remove("hidden");
    } else {
      homeOffersSection.classList.add("hidden");
    }
  }
  if (bestsellersGrid && homeBestsellersSection) {
    const topBestsellers = bestsellers.slice(0, 8);
    if (topBestsellers.length > 0) {
      bestsellersGrid.innerHTML = topBestsellers.map((p) => renderProductCard(p)).join("");
      homeBestsellersSection.classList.remove("hidden");
    } else {
      homeBestsellersSection.classList.add("hidden");
    }
  }
  const newArrivalsGrid = document.getElementById("home-newarrivals-grid");
  const homeNewArrivalsSection = document.getElementById("home-newarrivals-section");
  if (newArrivalsGrid && homeNewArrivalsSection) {
    const latest = [...allProducts].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    }).slice(0, 8);
    if (latest.length > 0) {
      newArrivalsGrid.innerHTML = latest.map((p) => renderProductCard(p)).join("");
      homeNewArrivalsSection.classList.remove("hidden");
    } else {
      homeNewArrivalsSection.classList.add("hidden");
    }
  }
  if (productsGrid && noProductsMsg) {
    if (filtered.length === 0) {
      productsGrid.innerHTML = "";
      productsGrid.classList.add("hidden");
      noProductsMsg.classList.remove("hidden");
    } else {
      noProductsMsg.classList.add("hidden");
      productsGrid.classList.remove("hidden");
      productsGrid.innerHTML = filtered.map((p) => renderProductCard(p)).join("");
    }
  }
  const activeDot = document.getElementById("mobile-filter-active-dot");
  const headerActiveDot = document.getElementById("mobile-header-filter-active-dot");
  const hasFilters = category !== "all" || brand !== "all" || sort !== "default" || minPrice > 0 || maxPrice < 999999;
  if (activeDot) {
    if (hasFilters) {
      activeDot.classList.remove("hidden");
    } else {
      activeDot.classList.add("hidden");
    }
  }
  if (headerActiveDot) {
    if (hasFilters) {
      headerActiveDot.classList.remove("hidden");
    } else {
      headerActiveDot.classList.add("hidden");
    }
  }
  setupAddToCartButtons();
  setupAdminProductButtons();
  setupWishlistButtons();
  setupSliderControls("home-offers-grid", "slider-prev-offers", "slider-next-offers");
  setupSliderControls("home-bestsellers-grid", "slider-prev-bestsellers", "slider-next-bestsellers");
  setupSliderControls("home-newarrivals-grid", "slider-prev-newarrivals", "slider-next-newarrivals");
  initAllMobilePeekCarousels();
  if (window.lucide) window.lucide.createIcons();
}
function initMobileCatalogControls() {
  const expandBtn = document.getElementById("mobile-search-expand-btn");
  const collapseBtn = document.getElementById("mobile-search-collapse-btn");
  const inputWrapper = document.getElementById("mobile-search-input-wrapper");
  const mobileSearchInput = document.getElementById("mobile-catalog-search-input");
  const desktopSearchInput = document.getElementById("product-search-input");
  const placeholderText = document.getElementById("mobile-search-placeholder-text");
  const headerSearchTrigger = document.getElementById("mobile-search-trigger-btn");
  const headerSearchInputBox = document.getElementById("mobile-header-search-input-box");
  const headerSearchInput = document.getElementById("mobile-header-search-input");
  const headerSearchClose = document.getElementById("mobile-header-search-close");
  const headerSearchLabel = document.getElementById("mobile-header-search-label");
  const filterTriggerBtn = document.getElementById("mobile-filter-trigger-btn");
  const headerFilterBtn = document.getElementById("mobile-header-filter-btn");
  const filterSheet = document.getElementById("mobile-filter-sheet");
  const filterOverlay = document.getElementById("mobile-filter-overlay");
  const filterCloseBtn = document.getElementById("mobile-filter-close-btn");
  const filterApplyBtn = document.getElementById("mobile-filter-apply-btn");
  const filterResetBtn = document.getElementById("mobile-filter-reset-btn");
  const categoryFilter = document.getElementById("product-category-filter");
  const sortFilter = document.getElementById("product-sort-filter");
  const minPriceFilter = document.getElementById("product-min-price");
  const maxPriceFilter = document.getElementById("product-max-price");
  const sheetMinPrice = document.getElementById("mobile-sheet-min-price");
  const sheetMaxPrice = document.getElementById("mobile-sheet-max-price");
  const categoryChips = document.querySelectorAll("#mobile-category-chips .cat-chip");
  const sortChips = document.querySelectorAll("#mobile-sort-chips .sort-chip");
  if (expandBtn && inputWrapper && mobileSearchInput) {
    expandBtn.addEventListener("click", () => {
      inputWrapper.classList.remove("hidden");
      inputWrapper.classList.add("flex");
      mobileSearchInput.focus();
    });
  }
  if (collapseBtn && inputWrapper && mobileSearchInput) {
    collapseBtn.addEventListener("click", () => {
      mobileSearchInput.value = "";
      if (desktopSearchInput) desktopSearchInput.value = "";
      if (placeholderText) placeholderText.textContent = "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      inputWrapper.classList.add("hidden");
      inputWrapper.classList.remove("flex");
      setPreFilterType("all");
      renderAllProductViews();
    });
  }
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (desktopSearchInput) desktopSearchInput.value = val;
      if (headerSearchInput) headerSearchInput.value = val;
      if (placeholderText) placeholderText.textContent = val.trim() ? val : "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      if (headerSearchLabel) headerSearchLabel.textContent = val.trim() ? val : "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      setPreFilterType("all");
      renderAllProductViews();
    });
  }
  if (headerSearchTrigger && headerSearchInputBox && headerSearchInput) {
    headerSearchTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      headerSearchInputBox.classList.remove("hidden");
      headerSearchInputBox.classList.add("is-expanded");
      headerSearchInput.focus();
    });
  }
  if (headerSearchClose && headerSearchInputBox && headerSearchInput) {
    headerSearchClose.addEventListener("click", (e) => {
      e.stopPropagation();
      headerSearchInput.value = "";
      if (desktopSearchInput) desktopSearchInput.value = "";
      if (mobileSearchInput) mobileSearchInput.value = "";
      if (headerSearchLabel) headerSearchLabel.textContent = "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      if (placeholderText) placeholderText.textContent = "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      headerSearchInputBox.classList.add("hidden");
      headerSearchInputBox.classList.remove("is-expanded");
      setPreFilterType("all");
      renderAllProductViews();
    });
  }
  if (headerSearchInput) {
    headerSearchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (desktopSearchInput) desktopSearchInput.value = val;
      if (mobileSearchInput) mobileSearchInput.value = val;
      if (headerSearchLabel) headerSearchLabel.textContent = val.trim() ? val : "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      if (placeholderText) placeholderText.textContent = val.trim() ? val : "\u0627\u0628\u062D\u062B \u0639\u0646 \u0645\u0646\u062A\u062C\u060C \u0643\u0648\u062F...";
      setPreFilterType("all");
      renderAllProductViews();
    });
    headerSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (window.location.hash !== "#products") {
          window.location.hash = "#products";
        }
      }
    });
  }
  function openSheet() {
    if (!filterSheet || !filterOverlay) return;
    const currentCat = categoryFilter?.value || "all";
    categoryChips.forEach((chip) => {
      if (chip.dataset.val === currentCat) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
    const currentSort = sortFilter?.value || "default";
    sortChips.forEach((chip) => {
      if (chip.dataset.sort === currentSort) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
    if (sheetMinPrice) sheetMinPrice.value = minPriceFilter?.value || "";
    if (sheetMaxPrice) sheetMaxPrice.value = maxPriceFilter?.value || "";
    filterOverlay.classList.remove("opacity-0", "pointer-events-none");
    filterOverlay.classList.add("opacity-100", "pointer-events-auto");
    filterSheet.classList.remove("translate-y-full");
    filterSheet.classList.add("translate-y-0");
    document.body.classList.add("overflow-hidden");
  }
  function closeSheet() {
    if (!filterSheet || !filterOverlay) return;
    filterOverlay.classList.add("opacity-0", "pointer-events-none");
    filterOverlay.classList.remove("opacity-100", "pointer-events-auto");
    filterSheet.classList.add("translate-y-full");
    filterSheet.classList.remove("translate-y-0");
    document.body.classList.remove("overflow-hidden");
  }
  if (filterTriggerBtn) {
    filterTriggerBtn.addEventListener("click", openSheet);
  }
  if (headerFilterBtn) {
    headerFilterBtn.addEventListener("click", openSheet);
  }
  if (filterCloseBtn) {
    filterCloseBtn.addEventListener("click", closeSheet);
  }
  if (filterOverlay) {
    filterOverlay.addEventListener("click", closeSheet);
  }
  categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      categoryChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });
  sortChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sortChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });
  if (filterApplyBtn) {
    filterApplyBtn.addEventListener("click", () => {
      const activeCatChip = document.querySelector("#mobile-category-chips .cat-chip.active");
      const selectedCat = activeCatChip ? activeCatChip.dataset.val : "all";
      if (categoryFilter) categoryFilter.value = selectedCat;
      const activeSortChip = document.querySelector("#mobile-sort-chips .sort-chip.active");
      const selectedSort = activeSortChip ? activeSortChip.dataset.sort : "default";
      if (sortFilter) sortFilter.value = selectedSort;
      if (minPriceFilter && sheetMinPrice) minPriceFilter.value = sheetMinPrice.value;
      if (maxPriceFilter && sheetMaxPrice) maxPriceFilter.value = sheetMaxPrice.value;
      closeSheet();
      if (window.location.hash !== "#products") {
        window.location.hash = "#products";
      }
      setPreFilterType("all");
      renderAllProductViews();
    });
  }
  if (filterResetBtn) {
    filterResetBtn.addEventListener("click", () => {
      categoryChips.forEach((c) => c.classList.remove("active"));
      const defaultCat = document.querySelector('#mobile-category-chips .cat-chip[data-val="all"]');
      if (defaultCat) defaultCat.classList.add("active");
      if (categoryFilter) categoryFilter.value = "all";
      sortChips.forEach((c) => c.classList.remove("active"));
      const defaultSort = document.querySelector('#mobile-sort-chips .sort-chip[data-sort="default"]');
      if (defaultSort) defaultSort.classList.add("active");
      if (sortFilter) sortFilter.value = "default";
      if (minPriceFilter) minPriceFilter.value = "";
      if (maxPriceFilter) maxPriceFilter.value = "";
      if (sheetMinPrice) sheetMinPrice.value = "";
      if (sheetMaxPrice) sheetMaxPrice.value = "";
      closeSheet();
      setPreFilterType("all");
      renderAllProductViews();
    });
  }
}
function renderOffersPage() {
  const grid = document.getElementById("offers-page-grid");
  const noOffersMsg = document.getElementById("no-offers-message");
  const daysEl = document.getElementById("offer-timer-days");
  const hoursEl = document.getElementById("offer-timer-hours");
  const minutesEl = document.getElementById("offer-timer-minutes");
  const avgTimerEl = document.getElementById("average-offer-timer");
  if (!grid || !noOffersMsg) return;
  const offers = allProducts.filter((p) => isOfferActive(p) && p.isAvailable !== false);
  if (avgTimerEl && daysEl && hoursEl && minutesEl) {
    const offersWithDate = offers.filter((p) => p.saleEndDate);
    if (offersWithDate.length > 0) {
      const totalMs = offersWithDate.reduce((sum, p) => {
        const endDate = p.saleEndDate.toDate ? p.saleEndDate.toDate() : new Date(p.saleEndDate);
        return sum + endDate.getTime();
      }, 0);
      const avgMs = totalMs / offersWithDate.length;
      const diff = avgMs - (/* @__PURE__ */ new Date()).getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
        const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
        const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
        daysEl.textContent = String(days).padStart(2, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minutesEl.textContent = String(minutes).padStart(2, "0");
        avgTimerEl.classList.remove("hidden");
        avgTimerEl.classList.add("flex");
      } else {
        avgTimerEl.classList.add("hidden");
      }
    } else {
      avgTimerEl.classList.add("hidden");
    }
  }
  if (allProducts.length === 0) {
    grid.innerHTML = renderProductCardSkeleton(6);
    grid.classList.remove("hidden");
    noOffersMsg.classList.add("hidden");
    return;
  }
  if (offers.length === 0) {
    grid.innerHTML = "";
    grid.classList.add("hidden");
    noOffersMsg.classList.remove("hidden");
  } else {
    noOffersMsg.classList.add("hidden");
    grid.classList.remove("hidden");
    grid.innerHTML = offers.map((p) => renderProductCard(p)).join("");
  }
  setupAddToCartButtons();
  setupAdminProductButtons();
  setupWishlistButtons();
  if (window.lucide) window.lucide.createIcons();
}
function renderProductDetails(productId) {
  const skeletonEl = document.getElementById("product-details-skeleton");
  const contentEl = document.getElementById("product-details-content");
  const product = allProducts.find((p) => p.shortId === productId || p.id === productId);
  if (!product) {
    if (allProducts.length === 0) {
      if (skeletonEl) {
        skeletonEl.innerHTML = renderProductDetailsSkeleton();
        skeletonEl.classList.remove("hidden");
      }
      if (contentEl) contentEl.classList.add("hidden");
      return;
    }
    console.warn("Product not found:", productId);
    window.location.hash = "#products";
    return;
  }
  if (skeletonEl) skeletonEl.classList.add("hidden");
  if (contentEl) contentEl.classList.remove("hidden");
  const breadcrumbCategory = document.getElementById("details-breadcrumb-category");
  const breadcrumbProduct = document.getElementById("details-breadcrumb-product");
  const categoryTranslations = {
    "Lighting": "\u0625\u0636\u0627\u0621\u0629",
    "Cables": "\u0643\u0627\u0628\u0644\u0627\u062A",
    "Switches": "\u0645\u0641\u0627\u062A\u064A\u062D",
    "Paints": "\u062F\u0647\u0627\u0646\u0627\u062A",
    "Parts": "\u0642\u0637\u0639 \u063A\u064A\u0627\u0631",
    "Ironmongery": "\u062D\u062F\u0627\u064A\u062F",
    "Showers": "\u0627\u0644\u062F\u0634",
    "Electronics": "\u0627\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A",
    "OpticalPanels": "\u0644\u0648\u062D\u0627\u062A",
    "BuildingMaterials": "\u0645\u0648\u0627\u062F \u0628\u0646\u0627\u0621",
    "Other": "\u0623\u062E\u0631\u0649"
  };
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = categoryTranslations[product.category] || product.category || "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A";
    breadcrumbCategory.href = `#products`;
  }
  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = product.name;
  }
  const placeholder = "https://placehold.co/600x600/18181b/71717a?text=Macca";
  const mainImgEl = document.getElementById("main-product-image");
  const thumbnailContainer = document.getElementById("details-thumbnail-container");
  const imageUrls = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl || placeholder];
  currentGalleryImages = imageUrls;
  currentGalleryIndex = 0;
  currentSelectedColor = null;
  if (mainImgEl) {
    mainImgEl.src = imageUrls[0];
    mainImgEl.alt = product.name;
  }
  if (thumbnailContainer) {
    thumbnailContainer.innerHTML = "";
    imageUrls.forEach((url, index) => {
      const thumb = document.createElement("div");
      thumb.className = `cursor-pointer rounded-xl overflow-hidden h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 border-2 transition-all p-1 bg-white dark:bg-[#202124] ${index === 0 ? "border-[#ffcd00] ring-2 ring-[#ffcd00]/30" : "border-transparent hover:border-gray-300"}`;
      thumb.innerHTML = `<img src="${url}" alt="\u0635\u0648\u0631\u0629 \u0645\u0635\u063A\u0631\u0629 ${index + 1}" class="w-full h-full object-contain" onerror="this.src='${placeholder}'">`;
      thumb.onclick = () => {
        currentGalleryIndex = index;
        if (mainImgEl) mainImgEl.src = url;
        Array.from(thumbnailContainer.children).forEach((c) => {
          c.classList.remove("border-[#ffcd00]", "ring-2", "ring-[#ffcd00]/30");
          c.classList.add("border-transparent");
        });
        thumb.classList.remove("border-transparent");
        thumb.classList.add("border-[#ffcd00]", "ring-2", "ring-[#ffcd00]/30");
      };
      thumbnailContainer.appendChild(thumb);
    });
  }
  const nameEl = document.getElementById("details-product-name");
  const descEl = document.getElementById("details-product-description");
  const priceEl = document.getElementById("details-product-price");
  const categoryEl = document.getElementById("details-product-category");
  const companyEl = document.getElementById("details-product-company");
  const ratingEl = document.getElementById("details-star-rating");
  if (nameEl) nameEl.textContent = product.name;
  if (descEl) descEl.textContent = product.description || "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0641 \u0625\u0636\u0627\u0641\u064A \u0645\u062A\u0648\u0641\u0631 \u062D\u0627\u0644\u064A\u0627\u064B \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C.";
  if (categoryEl) categoryEl.textContent = categoryTranslations[product.category] || product.category;
  if (companyEl) {
    if (product.company) {
      companyEl.textContent = product.company;
      companyEl.classList.remove("hidden");
    } else {
      companyEl.classList.add("hidden");
    }
  }
  if (ratingEl) {
    ratingEl.innerHTML = getStarRatingHtml(product.rating, product.id) + '<span class="text-xs text-gray-400 font-medium mr-2">(\u062A\u0642\u064A\u064A\u0645 \u0645\u0639\u062A\u0645\u062F)</span>';
  }
  if (priceEl) {
    if (isOfferActive(product) && product.originalPrice && product.originalPrice > product.price) {
      const discountPercent = Math.round((product.originalPrice - product.price) / product.originalPrice * 100);
      priceEl.innerHTML = `
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(0)} <span class="text-base font-bold text-gray-500">\u062C.\u0645</span></span>
                        <span class="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">\u062E\u0635\u0645 ${discountPercent}%</span>
                    </div>
                    <span class="text-sm text-gray-400 line-through">\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A: ${parseFloat(product.originalPrice).toFixed(2)} \u062C.\u0645</span>
                </div>
            `;
    } else {
      priceEl.innerHTML = `
                <div class="flex items-baseline gap-1">
                    <span class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(0)}</span>
                    <span class="text-base font-bold text-gray-500">\u062C.\u0645</span>
                </div>
            `;
    }
  }
  const colorSection = document.getElementById("details-color-options");
  const swatchesContainer = document.getElementById("color-swatches-container");
  if (colorSection && swatchesContainer) {
    if (product.colorOptions && Array.isArray(product.colorOptions) && product.colorOptions.length > 0) {
      swatchesContainer.innerHTML = "";
      product.colorOptions.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md hover:scale-110 transition-transform focus:outline-none";
        btn.style.backgroundColor = opt.hex;
        btn.title = opt.name || opt.hex;
        btn.onclick = () => {
          currentSelectedColor = opt;
          if (opt.imageUrl && mainImgEl) mainImgEl.src = opt.imageUrl;
          Array.from(swatchesContainer.children).forEach((b) => b.classList.remove("ring-2", "ring-[#ffcd00]"));
          btn.classList.add("ring-2", "ring-[#ffcd00]");
        };
        swatchesContainer.appendChild(btn);
      });
      colorSection.classList.remove("hidden");
    } else {
      colorSection.classList.add("hidden");
    }
  }
  const cartWrapper = document.getElementById("details-add-to-cart-wrapper");
  if (cartWrapper) {
    cartWrapper.dataset.productId = product.id;
    cartWrapper.dataset.productName = product.name;
    cartWrapper.dataset.productPrice = product.price;
    cartWrapper.dataset.productImage = imageUrls[0];
    if (product.isAvailable === false) {
      cartWrapper.innerHTML = `
                <div class="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-center font-bold text-gray-500">
                    \u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u062D\u0627\u0644\u064A\u0627\u064B
                </div>
                <a href="https://wa.me/201146641942?text=${encodeURIComponent("\u0623\u0631\u063A\u0628 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646 \u0645\u0648\u0639\u062F \u062A\u0648\u0641\u0631: " + product.name)}" target="_blank" class="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-black transition-colors">
                    <i data-lucide="message-circle" class="w-5 h-5"></i>
                    <span>\u062A\u0646\u0628\u064A\u0647\u064A \u0639\u0646\u062F \u0627\u0644\u062A\u0648\u0641\u0631 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628</span>
                </a>
            `;
    } else {
      cartWrapper.innerHTML = `
                <div class="flex gap-3">
                    <div class="w-28 relative">
                        <input type="number" id="details-quantity-input" value="1" min="1" class="w-full text-center py-3.5 px-2 bg-gray-100 dark:bg-white/5 rounded-xl font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#ffcd00]" aria-label="\u0627\u0644\u0643\u0645\u064A\u0629">
                    </div>
                    <button id="details-add-cart-btn" class="flex-1 bg-[#ffcd00] hover:bg-[#ffda33] text-gray-900 font-black text-lg py-3.5 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="11.5" y1="9" x2="16.5" y2="9"></line><line x1="14" y1="6.5" x2="14" y2="11.5"></line></svg>
                        <span>\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629</span>
                    </button>
                </div>
                <a href="https://wa.me/201146641942?text=${encodeURIComponent("\u0623\u0648\u062F \u0637\u0644\u0628 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0628\u0627\u0634\u0631\u0629: " + product.name)}" target="_blank" class="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/15 rounded-xl hover:bg-green-100 transition-colors">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span>\u0637\u0644\u0628 \u0645\u0628\u0627\u0634\u0631 \u0648\u0633\u0631\u064A\u0639 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628</span>
                </a>
            `;
      const addBtn = document.getElementById("details-add-cart-btn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const qty = parseInt(document.getElementById("details-quantity-input")?.value, 10) || 1;
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
  const specsContainer = document.getElementById("specs-list-container");
  if (specsContainer) {
    specsContainer.innerHTML = "";
    const specs = [
      { label: "\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0635\u0646\u0639\u0629", value: product.company },
      { label: "\u0627\u0644\u062C\u0647\u062F \u0627\u0644\u0643\u0647\u0631\u0628\u064A", value: product.volts, unit: "\u0641\u0648\u0644\u062A" },
      { label: "\u0627\u0644\u0642\u062F\u0631\u0629", value: product.watt, unit: "\u0648\u0627\u0637" },
      { label: "\u0634\u062F\u0629 \u0627\u0644\u0625\u0636\u0627\u0621\u0629", value: product.lumens, unit: "\u0644\u0648\u0645\u0646" },
      { label: "\u0627\u0644\u0636\u0645\u0627\u0646", value: product.warranty },
      { label: "\u0628\u0644\u062F \u0627\u0644\u0645\u0646\u0634\u0623", value: product.madeIn },
      { label: "\u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u062F\u064A\u0644", value: product.model },
      { label: "\u0627\u0644\u0639\u0645\u0631 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A", value: product.lifespan },
      { label: "\u0634\u062F\u0629 \u0627\u0644\u062A\u064A\u0627\u0631", value: product.currentIntensity },
      { label: "\u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A", value: product.sizes },
      { label: "\u0627\u0644\u0648\u0632\u0646", value: product.weight },
      { label: "\u0627\u0644\u0623\u0628\u0639\u0627\u062F", value: product.size },
      { label: "\u0627\u0644\u0637\u0648\u0644", value: product.length, unit: "\u0645\u062A\u0631" }
    ];
    let hasSpecs = false;
    specs.forEach((s) => {
      if (s.value && String(s.value).trim() !== "") {
        hasSpecs = true;
        specsContainer.innerHTML += `
                    <li class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${s.label}</span>
                        <span class="text-xs font-bold text-gray-900 dark:text-white" dir="ltr">${s.value} ${s.unit || ""}</span>
                    </li>
                `;
      }
    });
    if (!hasSpecs) {
      specsContainer.innerHTML = '<li class="py-3 text-center text-gray-400 text-xs">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0648\u0627\u0635\u0641\u0627\u062A \u0641\u0646\u064A\u0629 \u0625\u0636\u0627\u0641\u064A\u0629 \u0645\u0633\u062C\u0644\u0629.</li>';
    }
  }
  fetchProductSuggestions(product.id, product.category);
  if (window.lucide) window.lucide.createIcons();
}
function fetchProductSuggestions(productId, category) {
  const desktopGrid = document.getElementById("ai-suggestions-grid-desktop");
  const mobileGrid = document.getElementById("ai-suggestions-grid-mobile");
  const similar = allProducts.filter((p) => p.id !== productId && p.shortId !== productId && p.category === category && p.isAvailable !== false).slice(0, 4);
  const fallback = similar.length < 4 ? allProducts.filter((p) => p.id !== productId && p.isAvailable !== false).slice(0, 4) : similar;
  const html = fallback.map((p) => renderProductCard(p)).join("");
  if (desktopGrid) desktopGrid.innerHTML = html;
  if (mobileGrid) mobileGrid.innerHTML = html;
  setupAddToCartButtons();
  setupWishlistButtons();
  if (window.lucide) window.lucide.createIcons();
}
function setupAddToCartButtons() {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") return;
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const card = btn.closest(".product-card-wrapper");
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
function setupAdminProductButtons() {
  document.querySelectorAll(".delete-product-btn").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") return;
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.dataset.productId;
      if (!id) return;
      if (confirm("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u063A\u0628\u062A\u0643 \u0641\u064A \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0646\u0647\u0627\u0626\u064A\u0627\u064B\u061F")) {
        try {
          await deleteDoc(doc(db, "products", id));
          showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0646\u062C\u0627\u062D.");
        } catch (err) {
          console.error("Error deleting product:", err);
          showToast("\u062E\u0637\u0623: " + (err.message || "\u062A\u0639\u0630\u0631 \u0627\u0644\u062D\u0630\u0641"));
        }
      }
    });
  });
  document.querySelectorAll(".edit-product-btn").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") return;
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.dataset.productId;
      const product = allProducts.find((p) => p.id === id);
      if (product) openProductModal(product);
    });
  });
}
function addColorVariantRow(color = "#000000", name = "", imageUrl = "") {
  const container = document.getElementById("color-variants-container");
  if (!container) return;
  const row = document.createElement("div");
  row.className = "color-variant-row flex items-center gap-2 p-2 bg-white dark:bg-[#202124] rounded-xl border border-gray-200 dark:border-gray-700";
  row.innerHTML = `
        <input type="color" class="color-input w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent" value="${color}">
        <input type="text" class="color-name-input flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-600" placeholder="\u0627\u0633\u0645 \u0627\u0644\u0644\u0648\u0646 (\u0645\u062B\u0627\u0644: \u0623\u0628\u064A\u0636\u060C \u0630\u0647\u0628\u064A)" value="${escapeHTML(name)}">
        <input type="url" class="color-image-input flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-600" placeholder="\u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u0647\u0630\u0627 \u0627\u0644\u0644\u0648\u0646 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" value="${escapeHTML(imageUrl)}" dir="ltr">
        <button type="button" class="remove-color-btn p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
  row.querySelector(".remove-color-btn").onclick = () => row.remove();
  container.appendChild(row);
  if (window.lucide) window.lucide.createIcons();
}
function resetModalToAddMode() {
  const modalTitle = document.getElementById("modal-title");
  const modalSubmitBtn = document.getElementById("modal-submit-btn");
  const form = document.getElementById("add-product-form");
  const originalPriceContainer = document.getElementById("original-price-container");
  const colorContainer = document.getElementById("color-variants-container");
  if (modalTitle) modalTitle.textContent = "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F";
  if (modalSubmitBtn) modalSubmitBtn.textContent = "\u062D\u0641\u0638 \u0627\u0644\u0645\u0646\u062A\u062C";
  if (form) {
    form.reset();
    delete form.dataset.editingId;
  }
  if (originalPriceContainer) originalPriceContainer.classList.add("hidden");
  if (colorContainer) colorContainer.innerHTML = "";
  const availCheck = document.getElementById("isAvailable");
  if (availCheck) availCheck.checked = true;
  const savedBaseUrl = localStorage.getItem("admin_img_base_url");
  const baseInput = document.getElementById("imgBaseUrl");
  if (baseInput) {
    baseInput.value = savedBaseUrl || "https://i.postimg.cc/";
  }
}
function openProductModal(product = null) {
  const modal = document.getElementById("add-product-modal");
  const form = document.getElementById("add-product-form");
  const title = document.getElementById("modal-title");
  const submitBtn = document.getElementById("modal-submit-btn");
  const onSaleCheck = document.getElementById("isOnSale");
  const originalPriceContainer = document.getElementById("original-price-container");
  const colorContainer = document.getElementById("color-variants-container");
  if (!modal || !form) return;
  if (product) {
    if (title) title.textContent = "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C";
    if (submitBtn) submitBtn.textContent = "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0646\u062A\u062C";
    form.dataset.editingId = product.id;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== void 0 ? val : "";
    };
    setVal("productName", product.name);
    setVal("productPrice", product.price);
    setVal("productCategory", product.category || "Lighting");
    setVal("productDescription", product.description);
    setVal("productCompany", product.company);
    setVal("productVolts", product.volts);
    setVal("productLength", product.length);
    setVal("productWarranty", product.warranty);
    setVal("productMadeIn", product.madeIn);
    setVal("productModel", product.model);
    setVal("productLumens", product.lumens);
    setVal("productLifespan", product.lifespan);
    setVal("productCurrent", product.currentIntensity);
    setVal("productWatt", product.watt);
    setVal("productSizes", product.sizes);
    setVal("productWeight", product.weight);
    setVal("productSize", product.size);
    const allImages = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
    const mainUrl = allImages.length > 0 ? allImages[0] : "";
    if (mainUrl) {
      const matchExt = mainUrl.match(/(\.jpg|\.png|\.jpeg|\.webp)$/i);
      const ext = matchExt ? matchExt[0].toLowerCase() : "";
      const extSelect = document.getElementById("imgExtension");
      if (extSelect && ext) extSelect.value = ext;
      let urlWithoutExt = mainUrl;
      if (matchExt) {
        urlWithoutExt = mainUrl.substring(0, mainUrl.lastIndexOf(ext));
      }
      const savedBase = localStorage.getItem("admin_img_base_url") || "https://i.postimg.cc/";
      if (savedBase && urlWithoutExt.startsWith(savedBase)) {
        setVal("imgBaseUrl", savedBase);
        setVal("imgName", urlWithoutExt.substring(savedBase.length));
      } else {
        setVal("imgBaseUrl", "");
        setVal("imgName", mainUrl);
      }
    } else {
      setVal("imgBaseUrl", localStorage.getItem("admin_img_base_url") || "https://i.postimg.cc/");
      setVal("imgName", "");
    }
    setVal("productGalleryImages", allImages.slice(1).join(", "));
    const availCheck = document.getElementById("isAvailable");
    if (availCheck) availCheck.checked = product.isAvailable !== false;
    const bestCheck = document.getElementById("isBestSeller");
    if (bestCheck) bestCheck.checked = Boolean(product.isBestSeller);
    if (onSaleCheck) {
      onSaleCheck.checked = Boolean(product.isOnSale);
      if (product.isOnSale) {
        originalPriceContainer?.classList.remove("hidden");
        setVal("originalPrice", product.originalPrice);
        if (product.saleEndDate) {
          const d = product.saleEndDate.toDate ? product.saleEndDate.toDate() : new Date(product.saleEndDate);
          setVal("saleEndDate", d.toISOString().slice(0, 16));
        }
      } else {
        originalPriceContainer?.classList.add("hidden");
      }
    }
    if (colorContainer) {
      colorContainer.innerHTML = "";
      if (product.colorOptions && Array.isArray(product.colorOptions)) {
        product.colorOptions.forEach((opt) => {
          addColorVariantRow(opt.hex, opt.name, opt.imageUrl);
        });
      }
    }
  } else {
    resetModalToAddMode();
  }
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  if (window.lucide) window.lucide.createIcons();
}
function initProductForm() {
  const form = document.getElementById("add-product-form");
  const modal = document.getElementById("add-product-modal");
  const closeModalBtn = document.getElementById("close-add-product-modal-btn");
  const cancelModalBtn = document.getElementById("cancel-add-product-btn");
  const isOnSaleCheckbox = document.getElementById("isOnSale");
  const originalPriceContainer = document.getElementById("original-price-container");
  const addColorBtn = document.getElementById("add-color-variant-btn");
  const closeModal = () => {
    resetModalToAddMode();
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "";
    }
  };
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  if (isOnSaleCheckbox && originalPriceContainer) {
    isOnSaleCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        originalPriceContainer.classList.remove("hidden");
      } else {
        originalPriceContainer.classList.add("hidden");
      }
    });
  }
  if (addColorBtn) {
    addColorBtn.addEventListener("click", () => addColorVariantRow());
  }
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("modal-submit-btn");
      const originalBtnText = submitBtn ? submitBtn.textContent : "\u062D\u0641\u0638";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...";
      }
      const editingId = form.dataset.editingId;
      const baseUrl = document.getElementById("imgBaseUrl")?.value.trim() || "";
      const imgName = document.getElementById("imgName")?.value.trim() || "";
      const imgExt = document.getElementById("imgExtension")?.value || "";
      if (baseUrl) {
        localStorage.setItem("admin_img_base_url", baseUrl);
      }
      let mainImageUrl = "";
      if (imgName.startsWith("http://") || imgName.startsWith("https://")) {
        mainImageUrl = imgName;
      } else if (baseUrl && imgName) {
        mainImageUrl = baseUrl + imgName + imgExt;
      } else {
        mainImageUrl = imgName;
      }
      const galleryString = document.getElementById("productGalleryImages")?.value || "";
      const galleryUrls = galleryString.split(",").map((u) => u.trim()).filter((u) => u.length > 0);
      const finalImageUrls = [];
      if (mainImageUrl) finalImageUrls.push(mainImageUrl);
      finalImageUrls.push(...galleryUrls);
      const colorVariants = [];
      document.querySelectorAll(".color-variant-row").forEach((row) => {
        const color = row.querySelector(".color-input")?.value;
        const name = row.querySelector(".color-name-input")?.value.trim();
        const image = row.querySelector(".color-image-input")?.value.trim();
        if (color) {
          colorVariants.push({ hex: color, name, imageUrl: image });
        }
      });
      const isOnSale = document.getElementById("isOnSale")?.checked || false;
      const originalPriceVal = parseFloat(document.getElementById("originalPrice")?.value) || 0;
      const saleEndDateVal = document.getElementById("saleEndDate")?.value;
      const productData = {
        name: document.getElementById("productName")?.value.trim() || "",
        price: parseFloat(document.getElementById("productPrice")?.value) || 0,
        imageUrls: finalImageUrls,
        category: document.getElementById("productCategory")?.value || "Lighting",
        description: document.getElementById("productDescription")?.value.trim() || "",
        isOnSale,
        isBestSeller: document.getElementById("isBestSeller")?.checked || false,
        isAvailable: document.getElementById("isAvailable")?.checked !== false,
        originalPrice: isOnSale ? originalPriceVal : 0,
        saleEndDate: isOnSale && saleEndDateVal ? Timestamp.fromDate(new Date(saleEndDateVal)) : null,
        company: document.getElementById("productCompany")?.value.trim() || "",
        volts: document.getElementById("productVolts")?.value.trim() || "",
        length: document.getElementById("productLength")?.value.trim() || "",
        warranty: document.getElementById("productWarranty")?.value.trim() || "",
        madeIn: document.getElementById("productMadeIn")?.value.trim() || "",
        model: document.getElementById("productModel")?.value.trim() || "",
        lumens: document.getElementById("productLumens")?.value.trim() || "",
        lifespan: document.getElementById("productLifespan")?.value.trim() || "",
        currentIntensity: document.getElementById("productCurrent")?.value.trim() || "",
        watt: document.getElementById("productWatt")?.value.trim() || "",
        sizes: document.getElementById("productSizes")?.value.trim() || "",
        weight: document.getElementById("productWeight")?.value.trim() || "",
        size: document.getElementById("productSize")?.value.trim() || "",
        colorOptions: colorVariants
      };
      try {
        if (editingId) {
          const productRef = doc(db, "products", editingId);
          await updateDoc(productRef, productData);
          showToast("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0646\u062C\u0627\u062D!");
        } else {
          productData.createdAt = Timestamp.now();
          productData.shortId = generateShortId(5);
          await addDoc(collection(db, "products"), productData);
          showToast("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u062C\u062F\u064A\u062F \u0628\u0646\u062C\u0627\u062D!");
        }
        closeModal();
      } catch (error) {
        console.error("Error saving product:", error);
        showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0641\u0638: " + (error.message || "\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0648\u0627\u0644\u0627\u062A\u0635\u0627\u0644"));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
}
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
  container.onmouseleave = () => {
    isDown = false;
  };
  container.onmouseup = () => {
    isDown = false;
  };
  container.onmousemove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  };
  if (prevBtn && nextBtn) {
    prevBtn.onclick = () => container.scrollBy({ left: 300, behavior: "smooth" });
    nextBtn.onclick = () => container.scrollBy({ left: -300, behavior: "smooth" });
  }
}
function initMobilePeekCarousel(gridId, dotsId, activeColorClass = "bg-[#ffcd00]", alignMode = "center", itemsPerColumn = 1) {
  const container = document.getElementById(gridId);
  const dotsContainer = document.getElementById(dotsId);
  if (!container) return;
  const cards = container.querySelectorAll(".product-card-wrapper");
  if (cards.length === 0) {
    if (dotsContainer) dotsContainer.innerHTML = "";
    return;
  }
  const totalColumns = Math.ceil(cards.length / itemsPerColumn);
  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from({ length: totalColumns }).map((_, i) => `
            <button type="button" class="peek-dot-indicator h-1.5 rounded-full transition-all duration-300 ${i === 0 ? `w-5 ${activeColorClass}` : "w-1.5 bg-gray-300 dark:bg-white/20"}"
                    data-index="${i}" aria-label="\u0639\u0631\u0636 \u0634\u0631\u064A\u062D\u0629 ${i + 1}"></button>
        `).join("");
    const dots = dotsContainer.querySelectorAll(".peek-dot-indicator");
    dots.forEach((dot) => {
      dot.onclick = (e) => {
        e.preventDefault();
        const colIdx = parseInt(dot.dataset.index, 10);
        const targetCardIdx = colIdx * itemsPerColumn;
        if (cards[targetCardIdx]) {
          const containerRect = container.getBoundingClientRect();
          const cardRect = cards[targetCardIdx].getBoundingClientRect();
          let diff = 0;
          if (alignMode === "center") {
            diff = cardRect.left + cardRect.width / 2 - (containerRect.left + containerRect.width / 2);
          } else {
            diff = cardRect.right - containerRect.right;
          }
          if (Math.abs(diff) > 2) {
            container.scrollBy({ left: diff, behavior: "smooth" });
          }
        }
      };
    });
    let isTicking = false;
    container.addEventListener("scroll", () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          const isStart = alignMode === "start";
          const containerRect = container.getBoundingClientRect();
          const targetPos = isStart ? containerRect.right - 24 : containerRect.left + container.offsetWidth / 2;
          let closestCol = 0;
          let minDiff = Infinity;
          for (let col = 0; col < totalColumns; col++) {
            const card = cards[col * itemsPerColumn];
            if (!card) continue;
            const cardRect = card.getBoundingClientRect();
            const cardPos = isStart ? cardRect.right : cardRect.left + cardRect.width / 2;
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
              d.className = "peek-dot-indicator h-1.5 rounded-full transition-all duration-300 w-1.5 bg-gray-300 dark:bg-white/20";
            }
          });
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });
  }
}
function initAllMobilePeekCarousels() {
  initMobilePeekCarousel("home-offers-grid", "home-offers-dots", "bg-[#ffcd00]", "start", 3);
  initMobilePeekCarousel("home-bestsellers-grid", "home-bestsellers-dots", "bg-amber-500", "start", 1);
  initMobilePeekCarousel("home-newarrivals-grid", "home-newarrivals-dots", "bg-blue-500", "start", 1);
}
function showProductsSkeletons() {
  const productsGrid = document.getElementById("products-grid");
  const offersGrid = document.getElementById("home-offers-grid");
  const bestsellersGrid = document.getElementById("home-bestsellers-grid");
  const newArrivalsGrid = document.getElementById("home-newarrivals-grid");
  const offersSection = document.getElementById("home-offers-section");
  const bestsellersSection = document.getElementById("home-bestsellers-section");
  const newArrivalsSection = document.getElementById("home-newarrivals-section");
  if (productsGrid && (!productsGrid.children.length || productsGrid.classList.contains("hidden"))) {
    productsGrid.innerHTML = renderProductCardSkeleton(8);
    productsGrid.classList.remove("hidden");
  }
  if (offersGrid && offersSection) {
    offersGrid.innerHTML = renderProductCardSkeleton(4);
    offersSection.classList.remove("hidden");
  }
  if (bestsellersGrid && bestsellersSection) {
    bestsellersGrid.innerHTML = renderProductCardSkeleton(4);
    bestsellersSection.classList.remove("hidden");
  }
  if (newArrivalsGrid && newArrivalsSection) {
    newArrivalsGrid.innerHTML = renderProductCardSkeleton(4);
    newArrivalsSection.classList.remove("hidden");
  }
  initAllMobilePeekCarousels();
}
function loadProducts(onInitialLoadComplete) {
  initProductForm();
  onAdminStateChange(() => {
    renderAllProductViews();
  });
  if (allProducts.length === 0) {
    showProductsSkeletons();
  }
  const cached = localStorage.getItem("macca_products_cache_v2");
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
  const q = query(collection(db, "products"));
  onSnapshot(q, (snapshot) => {
    allProducts = [];
    snapshot.forEach((d) => {
      allProducts.push({ id: d.id, ...d.data() });
    });
    localStorage.setItem("macca_products_cache_v2", JSON.stringify(allProducts));
    populateBrandsFilter();
    renderAllProductViews();
    if (onInitialLoadComplete) onInitialLoadComplete();
    const hash = window.location.hash;
    if (hash.startsWith("#product/")) {
      const rawId = decodeURIComponent(hash.substring("#product/".length)).replace(/\/$/, "").trim();
      renderProductDetails(rawId);
    }
  }, (err) => {
    console.error("Error loading products:", err);
    if (onInitialLoadComplete) onInitialLoadComplete();
  });
}
function populateBrandsFilter() {
  const select = document.getElementById("product-brand-filter");
  if (!select) return;
  const brands = [...new Set(
    allProducts.map((p) => p.company).filter((c) => c && c.trim() !== "")
  )].sort();
  while (select.options.length > 1) {
    select.remove(1);
  }
  brands.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
}
var allProducts, preFilterType, currentGalleryImages, currentGalleryIndex, currentSelectedColor, CART_PLUS_ICON_SVG, initMobileOffersPeekCarousel;
var init_products = __esm({
  "js/products.js"() {
    init_firebase_config();
    init_auth();
    init_cart();
    init_wishlist();
    init_utils();
    init_skeleton();
    allProducts = [];
    preFilterType = "all";
    currentGalleryImages = [];
    currentGalleryIndex = 0;
    currentSelectedColor = null;
    CART_PLUS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-900"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="11.5" y1="9" x2="16.5" y2="9"></line><line x1="14" y1="6.5" x2="14" y2="11.5"></line></svg>`;
    initMobileOffersPeekCarousel = initAllMobilePeekCarousels;
  }
});

// js/wishlist.js
function saveWishlist() {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (e) {
    console.error("Failed to save wishlist to localStorage", e);
  }
  updateWishlistBadge();
}
function isInWishlist(productId) {
  return wishlist.some((item) => item.id === productId || item.shortId === productId);
}
function toggleWishlist(product) {
  if (!product || !product.id) return;
  const index = wishlist.findIndex((item) => item.id === product.id || item.shortId === product.id);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`\u062A\u0645\u062A \u0625\u0632\u0627\u0644\u0629 "${product.name}" \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629.`);
  } else {
    wishlist.push({
      id: product.id,
      shortId: product.shortId || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      isOnSale: Boolean(product.isOnSale),
      imageUrls: product.imageUrls || (product.imageUrl ? [product.imageUrl] : []),
      category: product.category || "Other",
      isAvailable: product.isAvailable !== false
    });
    showToast(`\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 "${product.name}" \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u2764\uFE0F`);
  }
  saveWishlist();
  updateAllWishlistButtons();
  if (document.getElementById("page-wishlist")?.classList.contains("active")) {
    renderWishlistPage();
  }
}
function updateWishlistBadge() {
  const badge = document.getElementById("wishlist-count-badge");
  const mobileBadge = document.getElementById("mobile-wishlist-badge");
  const mobileHeaderBadge = document.getElementById("mobile-header-wishlist-badge");
  const total = wishlist.length;
  [badge, mobileBadge, mobileHeaderBadge].forEach((b) => {
    if (b) {
      if (total > 0) {
        b.textContent = total;
        b.classList.remove("hidden");
        b.classList.add("flex");
      } else {
        b.classList.add("hidden");
        b.classList.remove("flex");
      }
    }
  });
}
function updateAllWishlistButtons() {
  document.querySelectorAll(".wishlist-toggle-btn").forEach((btn) => {
    const id = btn.dataset.productId;
    const active = isInWishlist(id);
    btn.classList.toggle("active", active);
    const icon = btn.querySelector("i");
    if (icon) {
      if (active) {
        icon.classList.add("fill-red-500", "text-red-500");
      } else {
        icon.classList.remove("fill-red-500", "text-red-500");
      }
    }
  });
}
function renderWishlistPage() {
  const container = document.getElementById("wishlist-items-grid");
  const emptyMsg = document.getElementById("wishlist-empty-message");
  if (!container || !emptyMsg) return;
  if (wishlist.length === 0) {
    container.innerHTML = "";
    container.classList.add("hidden");
    emptyMsg.classList.remove("hidden");
  } else {
    emptyMsg.classList.add("hidden");
    container.classList.remove("hidden");
    Promise.resolve().then(() => (init_products(), products_exports)).then(({ renderProductCard: renderProductCard2, setupAddToCartButtons: setupAddToCartButtons2 }) => {
      container.innerHTML = wishlist.map((p) => renderProductCard2(p)).join("");
      setupAddToCartButtons2();
      setupWishlistButtons();
      if (window.lucide) window.lucide.createIcons();
    });
  }
}
function setupWishlistButtons() {
  document.querySelectorAll(".wishlist-toggle-btn").forEach((btn) => {
    if (btn.dataset.wishlistAttached === "true") return;
    btn.dataset.wishlistAttached = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const card = btn.closest(".product-card-wrapper");
      const pId = btn.dataset.productId;
      const pName = card?.dataset.productName || btn.dataset.productName || "\u0645\u0646\u062A\u062C";
      const pPrice = parseFloat(card?.dataset.productPrice || btn.dataset.productPrice || 0);
      const pImage = card?.dataset.productImage || btn.dataset.productImage || "";
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
function initWishlist() {
  updateWishlistBadge();
}
var WISHLIST_STORAGE_KEY, wishlist;
var init_wishlist = __esm({
  "js/wishlist.js"() {
    init_utils();
    WISHLIST_STORAGE_KEY = "macca_wishlist_v1";
    wishlist = [];
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) wishlist = JSON.parse(stored);
    } catch (e) {
      wishlist = [];
    }
  }
});

// js/app.js
init_firebase_config();
init_auth();
init_cart();
init_wishlist();
init_products();

// js/articles.js
init_firebase_config();
init_auth();
init_utils();
init_skeleton();
var allArticles = [];
function getAllArticles() {
  return allArticles;
}
function renderArticleCard(article) {
  if (!article) return "";
  const isAdmin = isUserAdmin();
  const adminButtonsHTML = isAdmin ? `
        <div class="absolute top-3 left-3 z-30 flex gap-2">
            <button class="edit-article-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white shadow-md transition-colors" title="\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0642\u0627\u0644\u0629" data-article-id="${article.id}">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button class="delete-article-btn p-2 bg-white/90 dark:bg-[#2c2f38]/90 text-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-md transition-colors" title="\u062D\u0630\u0641 \u0627\u0644\u0645\u0642\u0627\u0644\u0629" data-article-id="${article.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>` : "";
  let previewText = "\u0627\u0636\u063A\u0637 \u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0642\u0627\u0644...";
  if (Array.isArray(article.content) && article.content.length > 0) {
    const firstBlock = article.content.find((b) => b.body);
    if (firstBlock) {
      previewText = firstBlock.body.substring(0, 140) + "...";
    } else if (article.content[0].title) {
      previewText = article.content[0].title;
    }
  } else if (typeof article.content === "string") {
    previewText = (article.content.replace(/<[^>]+>/g, "").substring(0, 140) || "\u0627\u0636\u063A\u0637 \u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0632\u064A\u062F") + "...";
  }
  let dateStr = "\u062D\u062F\u064A\u062B\u0627\u064B";
  if (article.createdAt) {
    const d = article.createdAt.toDate ? article.createdAt.toDate() : new Date(article.createdAt);
    dateStr = d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  }
  const imgUrl = article.imageUrl || "https://placehold.co/600x400/202124/ffcd00?text=Macca+Blog";
  const aId = article.shortId || article.id;
  return `
    <article class="group bg-white dark:bg-[#202124] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full relative">
        <div class="relative h-56 overflow-hidden bg-gray-100 dark:bg-white/5">
            ${adminButtonsHTML}
            <a href="#blog/${aId}" class="block h-full w-full">
                <img class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                     src="${imgUrl}" 
                     onerror="this.src='https://placehold.co/600x400/202124/ffcd00?text=Image+Error'" 
                     alt="${escapeHTML(article.title)}" 
                     loading="lazy">
            </a>
            <span class="absolute top-4 right-4 z-20 px-3 py-1 bg-[#ffcd00]/95 text-gray-900 text-xs font-bold rounded-full shadow-md">
                \u0646\u0635\u0627\u0626\u062D \u0648\u0645\u0639\u0644\u0648\u0645\u0627\u062A
            </span>
        </div>

        <div class="p-6 flex-grow flex flex-col">
            <div class="flex items-center gap-3 text-xs text-gray-400 mb-3 font-medium">
                <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5 text-[#ffcd00]"></i> ${dateStr}</span>
                <span>\u2022</span>
                <span class="flex items-center gap-1"><i data-lucide="user" class="w-3.5 h-3.5 text-[#ffcd00]"></i> \u0641\u0631\u064A\u0642 \u0645\u0643\u0629</span>
            </div>

            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-[#ffcd00] transition-colors">
                <a href="#blog/${aId}">${escapeHTML(article.title)}</a>
            </h2>

            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                ${escapeHTML(previewText)}
            </p>

            <div class="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <a href="#blog/${aId}" class="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-[#ffcd00] transition-colors">
                    <span>\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0642\u0627\u0644 \u0643\u0627\u0645\u0644\u0627\u064B</span>
                    <i data-lucide="arrow-left" class="w-4 h-4 transition-transform group-hover:-translate-x-1"></i>
                </a>
            </div>
        </div>
    </article>
    `;
}
function renderArticles() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;
  if (allArticles.length === 0) {
    grid.innerHTML = '<p class="text-gray-400 col-span-full text-center py-12">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0642\u0627\u0644\u0627\u062A \u0645\u0646\u0634\u0648\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.</p>';
    return;
  }
  grid.innerHTML = allArticles.map((a) => renderArticleCard(a)).join("");
  setupAdminArticleButtons();
  if (window.lucide) window.lucide.createIcons();
}
function renderArticleDetails(articleId) {
  const article = allArticles.find((a) => a.shortId === articleId || a.id === articleId);
  if (!article) {
    if (allArticles.length === 0) {
      const titleEl2 = document.getElementById("blog-post-title");
      if (titleEl2) titleEl2.textContent = "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0642\u0627\u0644\u0629...";
      return;
    }
    window.location.hash = "#blog";
    return;
  }
  const titleEl = document.getElementById("blog-post-title");
  const imageEl = document.getElementById("blog-post-image");
  const contentEl = document.getElementById("blog-post-content-wrapper");
  if (titleEl) titleEl.textContent = article.title;
  if (imageEl) {
    imageEl.src = article.imageUrl || "https://placehold.co/1200x600/202124/ffcd00?text=Macca+Blog";
    imageEl.alt = article.title;
  }
  if (contentEl) {
    let html = "";
    if (Array.isArray(article.content)) {
      let paragraphCounter = 1;
      article.content.forEach((b) => {
        if (b.type === "paragraph") {
          if (b.title) html += `<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">${paragraphCounter++}. ${escapeHTML(b.title)}</h2>`;
          if (b.body) {
            const lines = b.body.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.length > 0) {
              html += '<ul class="list-disc pr-6 space-y-2 mb-4 text-gray-700 dark:text-gray-300">';
              lines.forEach((line) => {
                html += `<li>${escapeHTML(line)}</li>`;
              });
              html += "</ul>";
            }
          }
        } else if (b.type === "gallery" && b.images) {
          html += '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">';
          b.images.forEach((img) => {
            html += `<img src="${escapeHTML(img)}" class="w-full h-48 object-cover rounded-xl shadow-md">`;
          });
          html += "</div>";
        }
      });
    } else if (typeof article.content === "string") {
      html = article.content;
    }
    contentEl.innerHTML = html || "<p>\u0644\u0627 \u064A\u062A\u0648\u0641\u0631 \u0645\u062D\u062A\u0648\u0649 \u0644\u0644\u0645\u0642\u0627\u0644\u0629.</p>";
  }
  if (window.lucide) window.lucide.createIcons();
}
function setupAdminArticleButtons() {
  document.querySelectorAll(".delete-article-btn").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") return;
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.dataset.articleId;
      if (confirm("\u0647\u0644 \u062A\u0631\u064A\u062F \u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0642\u0627\u0644\u0629\u061F")) {
        try {
          await deleteDoc(doc(db, "articles", id));
          showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0628\u0646\u062C\u0627\u062D.");
        } catch (err) {
          console.error("Error deleting article:", err);
          showToast("\u062A\u0639\u0630\u0631 \u062D\u0630\u0641 \u0627\u0644\u0645\u0642\u0627\u0644\u0629: " + (err.message || "\u062E\u0637\u0623"));
        }
      }
    });
  });
  document.querySelectorAll(".edit-article-btn").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") return;
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.dataset.articleId;
      const article = allArticles.find((a) => a.id === id);
      if (article) openArticleModal(article);
    });
  });
}
function openArticleModal(article = null) {
  const modal = document.getElementById("add-article-modal");
  const form = document.getElementById("add-article-form");
  const titleEl = document.getElementById("article-modal-title");
  const submitBtn = document.getElementById("article-modal-submit-btn");
  const container = document.getElementById("article-paragraphs-container");
  if (!modal || !form) return;
  if (article) {
    titleEl.textContent = "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0642\u0627\u0644\u0629";
    submitBtn.textContent = "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0642\u0627\u0644\u0629";
    form.dataset.editingId = article.id;
    document.getElementById("articleTitle").value = article.title || "";
    document.getElementById("articleImageUrl").value = article.imageUrl || "";
    if (container) {
      container.innerHTML = "";
      if (Array.isArray(article.content) && article.content.length > 0) {
        article.content.forEach((b) => {
          if (b.type === "paragraph") addParagraphBlock(b.title, b.body);
        });
      } else {
        addParagraphBlock("", typeof article.content === "string" ? article.content : "");
      }
    }
  } else {
    titleEl.textContent = "\u0625\u0636\u0627\u0641\u0629 \u0645\u0642\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629";
    submitBtn.textContent = "\u0646\u0634\u0631 \u0627\u0644\u0645\u0642\u0627\u0644\u0629";
    form.reset();
    delete form.dataset.editingId;
    if (container) {
      container.innerHTML = "";
      addParagraphBlock();
    }
  }
  modal.classList.remove("hidden");
  modal.style.display = "flex";
}
function addParagraphBlock(title = "", body = "") {
  const container = document.getElementById("article-paragraphs-container");
  if (!container) return;
  const block = document.createElement("div");
  block.className = "content-block paragraph-block bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative";
  block.dataset.type = "paragraph";
  block.innerHTML = `
        <button type="button" class="remove-block-btn absolute top-3 left-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
        <div class="mb-3">
            <label class="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0642\u0631\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)</label>
            <input type="text" class="paragraph-title w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-600" value="${escapeHTML(title)}">
        </div>
        <div>
            <label class="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">\u0646\u0635 \u0627\u0644\u0641\u0642\u0631\u0629 (\u0646\u0642\u0627\u0637 \u0623\u0648 \u0641\u0642\u0631\u0629 \u0643\u0627\u0645\u0644\u0629)</label>
            <textarea class="paragraph-body w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-[#333] border border-gray-200 dark:border-gray-600" rows="3">${escapeHTML(body)}</textarea>
        </div>
    `;
  block.querySelector(".remove-block-btn").onclick = () => block.remove();
  container.appendChild(block);
  if (window.lucide) window.lucide.createIcons();
}
function initArticleForm() {
  const form = document.getElementById("add-article-form");
  const modal = document.getElementById("add-article-modal");
  const closeBtn = document.getElementById("close-add-article-modal-btn");
  const cancelBtn = document.getElementById("cancel-add-article-btn");
  const closeModal = () => {
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "";
    }
  };
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("article-modal-submit-btn");
      const originalBtnText = submitBtn ? submitBtn.textContent : "\u0646\u0634\u0631";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u0646\u0634\u0631...";
      }
      const editingId = form.dataset.editingId;
      const contentArray = [];
      document.querySelectorAll("#article-paragraphs-container .content-block").forEach((b) => {
        if (b.dataset.type === "paragraph") {
          const title = b.querySelector(".paragraph-title")?.value.trim() || "";
          const body = b.querySelector(".paragraph-body")?.value.trim() || "";
          if (title || body) {
            contentArray.push({ type: "paragraph", title, body });
          }
        }
      });
      const articleData = {
        title: document.getElementById("articleTitle")?.value.trim() || "",
        imageUrl: document.getElementById("articleImageUrl")?.value.trim() || "",
        content: contentArray
      };
      try {
        if (editingId) {
          const articleRef = doc(db, "articles", editingId);
          await updateDoc(articleRef, articleData);
          showToast("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0628\u0646\u062C\u0627\u062D!");
        } else {
          articleData.createdAt = Timestamp.now();
          articleData.shortId = generateShortId(5);
          await addDoc(collection(db, "articles"), articleData);
          showToast("\u062A\u0645 \u0646\u0634\u0631 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0628\u0646\u062C\u0627\u062D!");
        }
        closeModal();
      } catch (error) {
        console.error("Error saving article:", error);
        showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0645\u0642\u0627\u0644\u0629: " + (error.message || ""));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
}
function loadArticles() {
  initArticleForm();
  onAdminStateChange(() => {
    renderArticles();
  });
  if (allArticles.length === 0) {
    const grid = document.getElementById("blog-articles-grid");
    if (grid && !grid.children.length) {
      grid.innerHTML = renderArticleCardSkeleton(3);
    }
  }
  const cached = localStorage.getItem("macca_articles_cache_v2");
  if (cached) {
    try {
      allArticles = JSON.parse(cached);
      renderArticles();
    } catch (e) {
    }
  }
  const q = query(collection(db, "articles"));
  onSnapshot(q, (snapshot) => {
    allArticles = [];
    snapshot.forEach((d) => {
      allArticles.push({ id: d.id, ...d.data() });
    });
    localStorage.setItem("macca_articles_cache_v2", JSON.stringify(allArticles));
    renderArticles();
    const hash = window.location.hash;
    if (hash.startsWith("#blog/")) {
      const rawId = decodeURIComponent(hash.substring("#blog/".length)).replace(/\/$/, "").trim();
      renderArticleDetails(rawId);
    }
  }, (err) => {
    console.error("Error fetching articles:", err);
  });
}

// js/admin.js
init_firebase_config();
init_auth();
init_products();
init_utils();
function initAdminPanel() {
  loadBrandingConfig();
  loadHeroConfig();
  loadTopBarConfig();
  loadMobileBannerConfig();
  setupAdminForms();
  setupSitemapGenerator();
}
var currentBrandingData = null;
function updateActiveSiteLogo(isDark) {
  if (typeof isDark === "undefined") {
    isDark = document.documentElement.classList.contains("dark");
  }
  const lightLogo = currentBrandingData?.logoUrlLight || localStorage.getItem("macca_site_logo_light") || "";
  const darkLogo = currentBrandingData?.logoUrlDark || localStorage.getItem("macca_site_logo_dark") || "";
  const fallbackLogo = currentBrandingData?.logoUrl || localStorage.getItem("macca_site_logo") || "";
  const chosenLogo = isDark ? darkLogo || fallbackLogo || lightLogo : lightLogo || fallbackLogo || darkLogo;
  const logoSize = currentBrandingData?.logoSize || localStorage.getItem("macca_site_logo_size") || 80;
  const mobileLogoSize = currentBrandingData?.mobileLogoSize || localStorage.getItem("macca_site_logo_mobile_size") || 34;
  const logoImg = document.getElementById("site-logo-img");
  const mobileLogoImg = document.getElementById("mobile-site-logo-img");
  const mobileDefaultPlaceholder = document.getElementById("mobile-default-logo-placeholder");
  if (chosenLogo && chosenLogo.trim() !== "") {
    if (logoImg) {
      logoImg.src = chosenLogo;
      logoImg.classList.remove("hidden");
      logoImg.style.height = `${logoSize}px`;
    }
    if (mobileLogoImg) {
      mobileLogoImg.src = chosenLogo;
      mobileLogoImg.classList.remove("hidden");
      mobileLogoImg.style.height = `${mobileLogoSize}px`;
    }
    if (mobileDefaultPlaceholder) {
      mobileDefaultPlaceholder.classList.add("hidden");
    }
  } else {
    if (logoImg) logoImg.classList.add("hidden");
    if (mobileLogoImg) mobileLogoImg.classList.add("hidden");
    if (mobileDefaultPlaceholder) mobileDefaultPlaceholder.classList.remove("hidden");
  }
}
function loadBrandingConfig() {
  try {
    updateActiveSiteLogo();
  } catch (e) {
  }
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
  const logoUrlLight = data?.logoUrlLight || data?.logoUrl || "";
  const logoUrlDark = data?.logoUrlDark || data?.logoUrl || "";
  const logoUrl = data?.logoUrl || logoUrlLight || logoUrlDark || "";
  const logoSize = data?.logoSize || 80;
  const mobileLogoSize = data?.mobileLogoSize || 34;
  try {
    if (logoUrlLight) localStorage.setItem("macca_site_logo_light", logoUrlLight);
    if (logoUrlDark) localStorage.setItem("macca_site_logo_dark", logoUrlDark);
    if (logoUrl) localStorage.setItem("macca_site_logo", logoUrl);
    localStorage.setItem("macca_site_logo_size", logoSize);
    localStorage.setItem("macca_site_logo_mobile_size", mobileLogoSize);
  } catch (e) {
  }
  updateActiveSiteLogo();
  const adminLogoInput = document.getElementById("admin-logo-url");
  const adminLogoLightInput = document.getElementById("admin-logo-url-light");
  const adminLogoDarkInput = document.getElementById("admin-logo-url-dark");
  const adminLogoSizeInput = document.getElementById("admin-logo-size");
  const adminLogoSizeDisplay = document.getElementById("admin-logo-size-display");
  const adminMobileLogoSizeInput = document.getElementById("admin-mobile-logo-size");
  const adminMobileLogoSizeDisplay = document.getElementById("admin-mobile-logo-size-display");
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
  const heroContainer = document.getElementById("hero-section-container");
  const videoEl = document.getElementById("hero-video");
  const videoSourceEl = document.getElementById("hero-video-source");
  const imageEl = document.getElementById("hero-bg-image");
  const badgeEl = document.getElementById("hero-badge-text");
  const titleMainEl = document.getElementById("hero-title-main");
  const titleSubEl = document.getElementById("hero-title-sub");
  const descEl = document.getElementById("hero-description");
  const heroType = data.heroType || "image";
  const videoUrl = data.videoUrl;
  const imageUrl = data.imageUrl;
  const showMobile = data.visibleMobile !== false;
  const showDesktop = data.visibleDesktop !== false;
  if (heroContainer) {
    heroContainer.classList.remove("hidden", "flex", "md:hidden", "md:flex");
    if (showMobile && showDesktop) {
      heroContainer.classList.add("flex");
    } else if (!showMobile && !showDesktop) {
      heroContainer.classList.add("hidden");
    } else if (showMobile && !showDesktop) {
      heroContainer.classList.add("flex", "md:hidden");
    } else if (!showMobile && showDesktop) {
      heroContainer.classList.add("hidden", "md:flex");
    }
  }
  if (heroType === "video" && videoUrl) {
    if (videoSourceEl) videoSourceEl.src = videoUrl;
    if (videoEl) {
      videoEl.load();
      videoEl.classList.remove("hidden");
    }
    if (imageEl) imageEl.classList.add("hidden");
  } else {
    if (imageEl) {
      if (imageUrl) {
        imageEl.src = imageUrl;
        imageEl.classList.remove("hidden");
      } else {
        imageEl.classList.add("hidden");
      }
    }
    if (videoEl) videoEl.classList.add("hidden");
  }
  if (badgeEl && data.badgeText) badgeEl.textContent = data.badgeText;
  if (titleMainEl && data.titleMain) titleMainEl.textContent = data.titleMain;
  if (titleSubEl && data.titleSub) titleSubEl.textContent = data.titleSub;
  if (descEl && data.description) descEl.textContent = data.description;
  const adminType = document.getElementById("admin-hero-type");
  if (adminType) {
    adminType.value = heroType;
    adminType.dispatchEvent(new Event("change"));
  }
  const adminVideo = document.getElementById("admin-video-url");
  if (adminVideo) adminVideo.value = videoUrl || "";
  const adminImg = document.getElementById("admin-image-url");
  if (adminImg) adminImg.value = imageUrl || "";
  const adminBadge = document.getElementById("admin-hero-badge");
  if (adminBadge) adminBadge.value = data.badgeText || "";
  const adminTitle = document.getElementById("admin-hero-title");
  if (adminTitle) adminTitle.value = data.titleMain || "";
  const adminSub = document.getElementById("admin-hero-subtitle");
  if (adminSub) adminSub.value = data.titleSub || "";
  const adminDesc = document.getElementById("admin-hero-desc");
  if (adminDesc) adminDesc.value = data.description || "";
}
function loadTopBarConfig() {
  const topBarRef = doc(db, "config", "top_bar");
  onSnapshot(topBarRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const bar = document.getElementById("top-notification-bar");
      const content = document.getElementById("top-bar-content");
      const text = document.getElementById("top-bar-text");
      const highlight = document.getElementById("top-bar-highlight");
      if (content) {
        if (data.text || data.highlight) {
          content.classList.remove("hidden");
          if (text) text.textContent = data.text || "";
          if (highlight) highlight.textContent = data.highlight || "";
        } else {
          content.classList.add("hidden");
        }
      }
      if (bar) {
        if (data.visible === false) {
          bar.classList.add("hidden");
        } else {
          bar.classList.remove("hidden");
        }
      }
    }
  });
}
var currentMobileBanners = [];
var mobileBannerAutoplayInterval = null;
var adminBannerControlsInitialized = false;
function normalizeBannerConfig(data) {
  if (!data) {
    return {
      visible: true,
      autoplay: true,
      items: [
        {
          imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
          layout: "auto",
          badge: "NEW ARRIVAL",
          title: "Graphite Trench Coat",
          price: "$520",
          btnText: "\u2726 \u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646",
          btnLink: "#products"
        }
      ]
    };
  }
  let items = [];
  if (Array.isArray(data.items) && data.items.length > 0) {
    items = data.items;
  } else if (data.imageUrl && data.imageUrl.trim() !== "") {
    items = [{
      imageUrl: data.imageUrl,
      layout: data.layout || "auto",
      badge: data.badge || "",
      title: data.title || "",
      price: data.price || "",
      btnText: data.btnText || "",
      btnLink: data.btnLink || ""
    }];
  } else {
    items = [
      {
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
        layout: "auto",
        badge: "NEW ARRIVAL",
        title: "Graphite Trench Coat",
        price: "$520",
        btnText: "\u2726 \u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646",
        btnLink: "#products"
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
  try {
    const cached = localStorage.getItem("macca_mobile_banner");
    if (cached) {
      const config = normalizeBannerConfig(JSON.parse(cached));
      applyMobileBanners(config);
      hasData = true;
    }
  } catch (e) {
  }
  if (!hasData) {
    setTimeout(() => {
      if (!hasData) {
        const def = normalizeBannerConfig(null);
        applyMobileBanners(def);
      }
    }, 350);
  }
  try {
    const bannerRef = doc(db, "config", "mobile_banner");
    onSnapshot(bannerRef, (snap) => {
      hasData = true;
      if (snap.exists()) {
        const data = snap.data();
        const config = normalizeBannerConfig(data);
        try {
          localStorage.setItem("macca_mobile_banner", JSON.stringify(config));
        } catch (e) {
        }
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
  setTimeout(() => {
    const skeleton = document.getElementById("mobile-featured-banner-skeleton");
    const wrapper = document.getElementById("mobile-banner-carousel-wrapper");
    if (skeleton && !skeleton.classList.contains("hidden") && wrapper && wrapper.classList.contains("hidden")) {
      skeleton.classList.add("hidden");
      wrapper.classList.remove("hidden");
    }
  }, 500);
  setupBannerAdminControls();
}
function applyMobileBanners(config) {
  const container = document.getElementById("mobile-featured-banner-section");
  const skeleton = document.getElementById("mobile-featured-banner-skeleton");
  const wrapper = document.getElementById("mobile-banner-carousel-wrapper");
  const track = document.getElementById("mobile-banner-track");
  const dotsContainer = document.getElementById("mobile-banner-dots");
  if (!container || !wrapper || !track) return;
  currentMobileBanners = config.items || [];
  if (!config.visible || currentMobileBanners.length === 0) {
    container.classList.add("hidden");
    if (skeleton) skeleton.classList.add("hidden");
    wrapper.classList.add("hidden");
    return;
  }
  container.classList.remove("hidden");
  track.innerHTML = currentMobileBanners.map((slide, idx) => {
    const hasText = slide.title && slide.title.trim() !== "" || slide.badge && slide.badge.trim() !== "";
    const isFull = slide.layout === "full" || slide.layout !== "card" && !hasText && !!slide.imageUrl;
    const imgUrl = slide.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80";
    const link = slide.btnLink || "#products";
    if (isFull) {
      return `
                <div class="w-full flex-shrink-0 snap-center px-0.5" data-slide-index="${idx}">
                    <a href="${link}" class="block w-full overflow-hidden rounded-[1.75rem] shadow-lg active:scale-[0.99] transition-transform">
                        <img src="${imgUrl}" alt="\u0628\u0627\u0646\u0631 \u0627\u0644\u0639\u0631\u0648\u0636" class="w-full h-auto max-h-[220px] object-cover rounded-[1.75rem] drop-shadow-md" loading="eager" decoding="async">
                    </a>
                </div>
            `;
    } else {
      return `
                <div class="w-full flex-shrink-0 snap-center px-0.5" data-slide-index="${idx}">
                    <div class="mobile-banner-peach-card relative w-full rounded-[1.75rem] overflow-hidden shadow-lg transition-all active:scale-[0.99]">
                        <div class="flex items-center justify-between p-4 sm:p-5 w-full">
                            <div class="relative z-10 flex-1 pr-1 text-right flex flex-col items-start justify-center">
                                ${slide.badge ? `<span class="text-[10px] font-black tracking-wider uppercase text-gray-800/80 dark:text-gray-200/90 mb-1">${escapeHTML(slide.badge)}</span>` : ""}
                                <h2 class="text-base sm:text-lg font-black text-gray-950 dark:text-white leading-snug mb-1">${escapeHTML(slide.title || "\u0623\u062D\u062F\u062B \u0627\u0644\u0639\u0631\u0648\u0636")}</h2>
                                ${slide.price ? `<p class="text-sm sm:text-base font-black text-gray-900/90 dark:text-amber-300 mb-3">${escapeHTML(slide.price)}</p>` : ""}
                                <a href="${link}" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/85 hover:bg-black text-white text-xs font-bold shadow-sm active:scale-95 transition-all">
                                    <span>${escapeHTML(slide.btnText || "\u2726 \u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646")}</span>
                                </a>
                            </div>
                            <div class="relative z-10 w-32 sm:w-36 h-32 sm:h-36 flex-shrink-0 flex items-center justify-center">
                                <img src="${imgUrl}" alt="\u0628\u0627\u0646\u0631 \u0627\u0644\u0645\u0648\u0628\u0627\u064A\u0644" class="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105" loading="eager" decoding="async">
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/20 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            `;
    }
  }).join("");
  if (dotsContainer) {
    if (currentMobileBanners.length > 1) {
      dotsContainer.innerHTML = currentMobileBanners.map(
        (_, i) => `<button type="button" class="banner-dot ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="\u0634\u0631\u064A\u062D\u0629 ${i + 1}"></button>`
      ).join("");
      dotsContainer.classList.remove("hidden");
    } else {
      dotsContainer.innerHTML = "";
      dotsContainer.classList.add("hidden");
    }
  }
  if (skeleton) skeleton.classList.add("hidden");
  wrapper.classList.remove("hidden");
  initMobileBannerCarousel(track, dotsContainer, currentMobileBanners.length, config.autoplay);
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
    const slides = track.querySelectorAll("[data-slide-index]");
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
      const dots = dotsContainer.querySelectorAll(".banner-dot");
      dots.forEach((d, idx) => {
        if (idx === activeIdx) d.classList.add("active");
        else d.classList.remove("active");
      });
    }
    return activeIdx;
  };
  track.onscroll = () => {
    requestAnimationFrame(updateActiveDot);
  };
  const scrollToSlide = (idx) => {
    const slides = track.querySelectorAll("[data-slide-index]");
    if (!slides[idx]) return;
    const trackRect = track.getBoundingClientRect();
    const slideRect = slides[idx].getBoundingClientRect();
    const diff = slideRect.left + slideRect.width / 2 - (trackRect.left + trackRect.width / 2);
    if (Math.abs(diff) > 2) {
      track.scrollBy({ left: diff, behavior: "smooth" });
    }
  };
  if (dotsContainer) {
    dotsContainer.onclick = (e) => {
      const dot = e.target.closest(".banner-dot");
      if (!dot) return;
      const idx = parseInt(dot.dataset.index);
      scrollToSlide(idx);
    };
  }
  if (autoplay !== false && itemCount > 1) {
    const startAutoplay = () => {
      if (mobileBannerAutoplayInterval) clearInterval(mobileBannerAutoplayInterval);
      mobileBannerAutoplayInterval = setInterval(() => {
        const trackRect = track.getBoundingClientRect();
        if (trackRect.bottom <= 50 || trackRect.top >= window.innerHeight - 50) return;
        const nextIdx = (currentIndex + 1) % itemCount;
        scrollToSlide(nextIdx);
      }, 4500);
    };
    startAutoplay();
    track.addEventListener("pointerenter", () => clearInterval(mobileBannerAutoplayInterval));
    track.addEventListener("pointerleave", startAutoplay);
    track.addEventListener("touchstart", () => clearInterval(mobileBannerAutoplayInterval), { passive: true });
    track.addEventListener("touchend", startAutoplay, { passive: true });
  }
}
function populateBannerAdminForm(config) {
  const adminVis = document.getElementById("admin-mobile-banner-visible");
  const adminAutoplay = document.getElementById("admin-mobile-banner-autoplay");
  if (adminVis) adminVis.checked = config.visible !== false;
  if (adminAutoplay) adminAutoplay.checked = config.autoplay !== false;
  const activeEl = document.activeElement;
  const listContainer = document.getElementById("admin-mobile-banners-list");
  if (listContainer && (!activeEl || !listContainer.contains(activeEl))) {
    renderAdminBannerSlides(config.items || []);
  }
}
function renderAdminBannerSlides(items) {
  const listContainer = document.getElementById("admin-mobile-banners-list");
  if (!listContainer) return;
  if (!items || items.length === 0) {
    items = [{
      imageUrl: "",
      layout: "auto",
      badge: "",
      title: "",
      price: "",
      btnText: "\u2726 \u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646",
      btnLink: "#products"
    }];
  }
  listContainer.innerHTML = items.map((slide, index) => `
        <div class="admin-banner-slide-item p-3.5 bg-white dark:bg-[#202124] rounded-2xl border border-gray-200 dark:border-gray-700/80 space-y-3 relative group" data-slide-index="${index}">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                <span class="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <i data-lucide="layers" class="w-3.5 h-3.5 text-[#ffcd00]"></i>
                    \u0628\u0627\u0646\u0631 \u0631\u0642\u0645 <span class="slide-num font-mono text-[#ffcd00]">#${index + 1}</span>
                </span>
                <button type="button" class="admin-remove-slide-btn text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-lg transition-colors cursor-pointer" title="\u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0628\u0627\u0646\u0631">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    <span>\u062D\u0630\u0641</span>
                </button>
            </div>

            <!-- \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0639\u0631\u0636 -->
            <div>
                <label class="block text-[11px] text-gray-400 mb-1 font-bold">\u0646\u0648\u0639 \u0627\u0644\u0639\u0631\u0636:</label>
                <select class="slide-layout w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl">
                    <option value="auto" ${slide.layout === "auto" ? "selected" : ""}>\u062A\u0644\u0642\u0627\u0626\u064A \u0630\u0643\u064A (\u062D\u0633\u0628 \u062A\u0648\u0641\u0631 \u0627\u0644\u0646\u0635\u0648\u0635)</option>
                    <option value="full" ${slide.layout === "full" ? "selected" : ""}>\u0628\u0627\u0646\u0631 \u0639\u0631\u064A\u0636 \u0643\u0627\u0645\u0644 (\u0635\u0648\u0631\u0629 \u0639\u0631\u064A\u0636\u0629)</option>
                    <option value="card" ${slide.layout === "card" ? "selected" : ""}>\u0643\u0627\u0631\u062A \u0623\u0646\u064A\u0642 (\u0646\u0635 + \u0635\u0648\u0631\u0629 \u062C\u0627\u0646\u0628\u064A\u0629)</option>
                </select>
            </div>

            <!-- \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 -->
            <div>
                <label class="block text-[11px] text-gray-400 mb-1 font-bold">\u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u0627\u0644\u0628\u0627\u0646\u0631 (URL) *</label>
                <input type="url" class="slide-img w-full text-xs px-3 py-2 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-[11px]" placeholder="https://..." value="${escapeHTML(slide.imageUrl || "")}">
            </div>

            <!-- \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0631\u062A (\u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629 \u0641\u064A \u062D\u0627\u0644 \u0627\u0644\u0628\u0627\u0646\u0631 \u0627\u0644\u0639\u0631\u064A\u0636) -->
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">\u0627\u0644\u0634\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u0648\u064A\u0629 (Badge)</label>
                    <input type="text" class="slide-badge w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="NEW ARRIVAL" value="${escapeHTML(slide.badge || "")}">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">\u0627\u0644\u0633\u0639\u0631 / \u0627\u0644\u062E\u0635\u0645</label>
                    <input type="text" class="slide-price w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="$520 \u0623\u0648 \u062E\u0635\u0645 30%" value="${escapeHTML(slide.price || "")}">
                </div>
                <div class="col-span-2">
                    <label class="block text-[11px] text-gray-400 mb-1">\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A</label>
                    <input type="text" class="slide-title w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="Graphite Trench Coat" value="${escapeHTML(slide.title || "")}">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">\u0646\u0635 \u0627\u0644\u0632\u0631</label>
                    <input type="text" class="slide-btn-text w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="\u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646 \u2726" value="${escapeHTML(slide.btnText || "")}">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">\u0631\u0627\u0628\u0637 \u0627\u0644\u0632\u0631</label>
                    <input type="text" class="slide-btn-link w-full text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-[#2c2f38] border border-gray-200 dark:border-gray-700 rounded-xl" placeholder="#products" value="${escapeHTML(slide.btnLink || "")}">
                </div>
            </div>
        </div>
    `).join("");
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ root: listContainer });
  }
}
function setupBannerAdminControls() {
  if (adminBannerControlsInitialized) return;
  adminBannerControlsInitialized = true;
  const addBtn = document.getElementById("admin-add-mobile-banner-btn");
  const listContainer = document.getElementById("admin-mobile-banners-list");
  if (addBtn && listContainer) {
    addBtn.addEventListener("click", () => {
      const currentItems = collectAdminBannerSlides();
      currentItems.push({
        imageUrl: "",
        layout: "auto",
        badge: "",
        title: "",
        price: "",
        btnText: "\u2726 \u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646",
        btnLink: "#products"
      });
      renderAdminBannerSlides(currentItems);
      const lastCard = listContainer.querySelector(".admin-banner-slide-item:last-child");
      lastCard?.querySelector(".slide-img")?.focus();
    });
    listContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".admin-remove-slide-btn");
      if (removeBtn) {
        const card = removeBtn.closest(".admin-banner-slide-item");
        if (card) {
          const allCards = listContainer.querySelectorAll(".admin-banner-slide-item");
          if (allCards.length <= 1) {
            showToast("\u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0627\u0644\u0633\u0644\u0627\u064A\u062F\u0631 \u0639\u0644\u0649 \u0628\u0627\u0646\u0631 \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.", "warning");
            return;
          }
          card.remove();
          listContainer.querySelectorAll(".admin-banner-slide-item").forEach((c, idx) => {
            const numEl = c.querySelector(".slide-num");
            if (numEl) numEl.textContent = `#${idx + 1}`;
            c.dataset.slideIndex = idx;
          });
        }
      }
    });
  }
}
function collectAdminBannerSlides() {
  const listContainer = document.getElementById("admin-mobile-banners-list");
  if (!listContainer) return [];
  const cards = listContainer.querySelectorAll(".admin-banner-slide-item");
  const items = [];
  cards.forEach((card) => {
    const layout = card.querySelector(".slide-layout")?.value || "auto";
    const imageUrl = card.querySelector(".slide-img")?.value?.trim() || "";
    const badge = card.querySelector(".slide-badge")?.value || "";
    const title = card.querySelector(".slide-title")?.value || "";
    const price = card.querySelector(".slide-price")?.value || "";
    const btnText = card.querySelector(".slide-btn-text")?.value || "";
    const btnLink = card.querySelector(".slide-btn-link")?.value || "";
    items.push({ layout, imageUrl, badge, title, price, btnText, btnLink });
  });
  return items;
}
function setupAdminForms() {
  const form = document.getElementById("admin-settings-form");
  if (!form) return;
  const mobileLogoSlider = document.getElementById("admin-mobile-logo-size");
  const mobileLogoDisplay = document.getElementById("admin-mobile-logo-size-display");
  const mobileLogoImg = document.getElementById("mobile-site-logo-img");
  if (mobileLogoSlider) {
    mobileLogoSlider.addEventListener("input", (e) => {
      const val = e.target.value;
      if (mobileLogoDisplay) mobileLogoDisplay.textContent = `${val}px`;
      if (mobileLogoImg) mobileLogoImg.style.height = `${val}px`;
    });
  }
  const desktopLogoSlider = document.getElementById("admin-logo-size");
  const desktopLogoDisplay = document.getElementById("admin-logo-size-display");
  const desktopLogoImg = document.getElementById("site-logo-img");
  if (desktopLogoSlider) {
    desktopLogoSlider.addEventListener("input", (e) => {
      const val = e.target.value;
      if (desktopLogoDisplay) desktopLogoDisplay.textContent = `${val}px`;
      if (desktopLogoImg) desktopLogoImg.style.height = `${val}px`;
    });
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isUserAdmin()) {
      showToast("\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0634\u0631\u0641 (macaelctrec@gmail.com) \u0623\u0648\u0644\u0627\u064B \u0645\u0646 \u0632\u0631 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0627\u0644\u0623\u0639\u0644\u0649.");
      return;
    }
    const submitBtn = document.getElementById("save-admin-settings-btn");
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...";
    try {
      const logoUrlLight = document.getElementById("admin-logo-url-light")?.value.trim() || "";
      const logoUrlDark = document.getElementById("admin-logo-url-dark")?.value.trim() || "";
      const logoUrl = logoUrlLight || logoUrlDark || document.getElementById("admin-logo-url")?.value.trim() || "";
      const logoSize = parseInt(document.getElementById("admin-logo-size")?.value || 80);
      const mobileLogoSize = parseInt(document.getElementById("admin-mobile-logo-size")?.value || 34);
      await setDoc(doc(db, "config", "branding"), {
        logoUrl,
        logoUrlLight,
        logoUrlDark,
        logoSize,
        mobileLogoSize
      }, { merge: true });
      if (logoUrlLight) localStorage.setItem("macca_site_logo_light", logoUrlLight);
      if (logoUrlDark) localStorage.setItem("macca_site_logo_dark", logoUrlDark);
      if (logoUrl) localStorage.setItem("macca_site_logo", logoUrl);
      localStorage.setItem("macca_site_logo_size", logoSize);
      localStorage.setItem("macca_site_logo_mobile_size", mobileLogoSize);
      updateActiveSiteLogo();
      const heroType = document.getElementById("admin-hero-type")?.value || "image";
      const videoUrl = document.getElementById("admin-video-url")?.value || "";
      const imageUrl = document.getElementById("admin-image-url")?.value || "";
      const badgeText = document.getElementById("admin-hero-badge")?.value || "";
      const titleMain = document.getElementById("admin-hero-title")?.value || "";
      const titleSub = document.getElementById("admin-hero-subtitle")?.value || "";
      const description = document.getElementById("admin-hero-desc")?.value || "";
      const visibleMobile = document.getElementById("admin-hero-vis-mobile")?.checked !== false;
      const visibleDesktop = document.getElementById("admin-hero-vis-desktop")?.checked !== false;
      await setDoc(doc(db, "config", "homepage"), {
        heroType,
        videoUrl,
        imageUrl,
        badgeText,
        titleMain,
        titleSub,
        description,
        visibleMobile,
        visibleDesktop
      }, { merge: true });
      const topText = document.getElementById("admin-topbar-text")?.value || "";
      const topHighlight = document.getElementById("admin-topbar-highlight")?.value || "";
      const topVisible = document.getElementById("admin-topbar-visible")?.checked !== false;
      await setDoc(doc(db, "config", "top_bar"), {
        text: topText,
        highlight: topHighlight,
        visible: topVisible
      }, { merge: true });
      const mobileBannerVisible = document.getElementById("admin-mobile-banner-visible")?.checked !== false;
      const mobileBannerAutoplay = document.getElementById("admin-mobile-banner-autoplay")?.checked !== false;
      const bannerItems = collectAdminBannerSlides();
      const bannerConfig = {
        visible: mobileBannerVisible,
        autoplay: mobileBannerAutoplay,
        items: bannerItems
      };
      await setDoc(doc(db, "config", "mobile_banner"), bannerConfig, { merge: true });
      localStorage.setItem("macca_mobile_banner", JSON.stringify(bannerConfig));
      applyMobileBanners(bannerConfig);
      showToast("\u062A\u0645 \u062D\u0641\u0638 \u062C\u0645\u064A\u0639 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0628\u0646\u062C\u0627\u062D!");
    } catch (err) {
      console.error("Error saving admin config:", err);
      showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A: " + (err.message || ""));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  });
}
function setupSitemapGenerator() {
  const genBtn = document.getElementById("generate-sitemap-btn");
  const resultBox = document.getElementById("sitemap-result-container");
  const output = document.getElementById("sitemap-output");
  const copyBtn = document.getElementById("copy-sitemap-btn");
  if (!genBtn) return;
  genBtn.addEventListener("click", () => {
    if (!isUserAdmin()) {
      showToast("\u0645\u064A\u0632\u0629 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062E\u0631\u064A\u0637\u0629 \u0644\u0644\u0645\u0634\u0631\u0641 \u0641\u0642\u0637.");
      return;
    }
    const baseUrl = "https://macca3.shop/";
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    xml += `    <url><loc>${baseUrl}</loc><lastmod>${date}</lastmod><priority>1.0</priority></url>
`;
    xml += `    <url><loc>${baseUrl}#products</loc><lastmod>${date}</lastmod><priority>0.9</priority></url>
`;
    xml += `    <url><loc>${baseUrl}#offers</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>
`;
    xml += `    <url><loc>${baseUrl}#blog</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>
`;
    xml += `    <url><loc>${baseUrl}#contact</loc><lastmod>${date}</lastmod><priority>0.6</priority></url>
`;
    const products = getAllProducts();
    products.forEach((p) => {
      const id = p.shortId || p.id;
      xml += `    <url><loc>${baseUrl}#product/${id}</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>
`;
    });
    const articles = getAllArticles();
    articles.forEach((a) => {
      const id = a.shortId || a.id;
      xml += `    <url><loc>${baseUrl}#blog/${id}</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>
`;
    });
    xml += `</urlset>`;
    if (output) output.value = xml;
    if (resultBox) resultBox.classList.remove("hidden");
    showToast("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0646\u062C\u0627\u062D!");
  });
  if (copyBtn && output) {
    copyBtn.addEventListener("click", () => {
      output.select();
      navigator.clipboard.writeText(output.value).then(() => {
        showToast("\u062A\u0645 \u0646\u0633\u062E \u0643\u0648\u062F \u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0648\u0642\u0639!");
      });
    });
  }
}

// js/checkout.js
init_firebase_config();
init_cart();
init_products();

// js/payment-settings.js
init_firebase_config();
init_auth();
init_utils();
var defaultSettings = {
  vodafoneCash: {
    phone: "01146641942",
    accountName: "\u0645\u062A\u062C\u0631 \u0645\u0643\u0629 \u0644\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629",
    enabled: true
  },
  instapay: {
    address: "01146641942",
    accountName: "\u0645\u062A\u062C\u0631 \u0645\u0643\u0629 \u0644\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629",
    enabled: true
  },
  shipping: {
    defaultFee: 45,
    freeThreshold: 1500
  }
};
var currentPaymentSettings = { ...defaultSettings };
var listeners = [];
function getPaymentSettings() {
  return currentPaymentSettings;
}
function loadPaymentSettings(callback = null) {
  if (callback && typeof callback === "function") {
    listeners.push(callback);
  }
  const docRef = doc(db, "config", "payments");
  onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      currentPaymentSettings = {
        vodafoneCash: {
          phone: data.vodafoneCash?.phone || defaultSettings.vodafoneCash.phone,
          accountName: data.vodafoneCash?.accountName || defaultSettings.vodafoneCash.accountName,
          enabled: data.vodafoneCash?.enabled !== false
        },
        instapay: {
          address: data.instapay?.address || defaultSettings.instapay.address,
          accountName: data.instapay?.accountName || defaultSettings.instapay.accountName,
          enabled: data.instapay?.enabled !== false
        },
        shipping: {
          defaultFee: Number(data.shipping?.defaultFee) || defaultSettings.shipping.defaultFee,
          freeThreshold: Number(data.shipping?.freeThreshold) || defaultSettings.shipping.freeThreshold
        }
      };
    } else {
      currentPaymentSettings = { ...defaultSettings };
    }
    listeners.forEach((fn) => {
      try {
        fn(currentPaymentSettings);
      } catch (e) {
        console.error("Payment setting listener error:", e);
      }
    });
    populateAdminPaymentSettingsForm();
  }, (err) => {
    console.warn("Could not load dynamic payment settings, using defaults:", err);
    if (callback) callback(currentPaymentSettings);
  });
}
function populateAdminPaymentSettingsForm() {
  const vfPhone = document.getElementById("setting-vf-phone");
  const vfName = document.getElementById("setting-vf-name");
  const vfActive = document.getElementById("setting-vf-active");
  const instaAddress = document.getElementById("setting-insta-address");
  const instaName = document.getElementById("setting-insta-name");
  const instaActive = document.getElementById("setting-insta-active");
  const shippingDefault = document.getElementById("setting-shipping-default");
  const shippingFree = document.getElementById("setting-shipping-free-threshold");
  if (vfPhone) vfPhone.value = currentPaymentSettings.vodafoneCash.phone;
  if (vfName) vfName.value = currentPaymentSettings.vodafoneCash.accountName;
  if (vfActive) vfActive.checked = currentPaymentSettings.vodafoneCash.enabled;
  if (instaAddress) instaAddress.value = currentPaymentSettings.instapay.address;
  if (instaName) instaName.value = currentPaymentSettings.instapay.accountName;
  if (instaActive) instaActive.checked = currentPaymentSettings.instapay.enabled;
  if (shippingDefault) shippingDefault.value = currentPaymentSettings.shipping.defaultFee;
  if (shippingFree) shippingFree.value = currentPaymentSettings.shipping.freeThreshold;
}
function initPaymentSettingsAdmin() {
  const form = document.getElementById("admin-payment-settings-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isUserAdmin()) {
      showToast("\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0643\u0645\u0633\u0624\u0648\u0644 \u0644\u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639.");
      return;
    }
    const submitBtn = document.getElementById("save-payment-settings-btn");
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...";
    try {
      const newConfig = {
        vodafoneCash: {
          phone: document.getElementById("setting-vf-phone")?.value.trim() || defaultSettings.vodafoneCash.phone,
          accountName: document.getElementById("setting-vf-name")?.value.trim() || defaultSettings.vodafoneCash.accountName,
          enabled: document.getElementById("setting-vf-active")?.checked !== false
        },
        instapay: {
          address: document.getElementById("setting-insta-address")?.value.trim() || defaultSettings.instapay.address,
          accountName: document.getElementById("setting-insta-name")?.value.trim() || defaultSettings.instapay.accountName,
          enabled: document.getElementById("setting-insta-active")?.checked !== false
        },
        shipping: {
          defaultFee: Number(document.getElementById("setting-shipping-default")?.value) || 45,
          freeThreshold: Number(document.getElementById("setting-shipping-free-threshold")?.value) || 1500
        }
      };
      await setDoc(doc(db, "config", "payments"), newConfig, { merge: true });
      showToast("\u062A\u0645 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0634\u062D\u0646 \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u062D\u062F\u064A\u062B\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639!");
    } catch (err) {
      console.error("Error saving payment settings:", err);
      showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639: " + (err.message || ""));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  });
}

// js/checkout.js
init_utils();
init_skeleton();
var currentStep = 1;
var customerData = {};
var selectedPaymentMethod = "vodafone_cash";
var uploadedProofBase64 = null;
var uploadedProofMeta = null;
var isSubmitting = false;
function calculateShippingFee(subtotal, governorate) {
  const settings = getPaymentSettings();
  const defaultFee = settings.shipping.defaultFee || 45;
  const freeThreshold = settings.shipping.freeThreshold || 1500;
  if (subtotal >= freeThreshold) {
    return 0;
  }
  if (!governorate) return defaultFee;
  const upperEgypt = ["\u0627\u0644\u0645\u0646\u064A\u0627", "\u0623\u0633\u064A\u0648\u0637", "\u0633\u0648\u0647\u0627\u062C", "\u0642\u0646\u0627", "\u0627\u0644\u0623\u0642\u0635\u0631", "\u0623\u0633\u0648\u0627\u0646", "\u0627\u0644\u0648\u0627\u062F\u064A \u0627\u0644\u062C\u062F\u064A\u062F", "\u0627\u0644\u0628\u062D\u0631 \u0627\u0644\u0623\u062D\u0645\u0631", "\u0645\u0637\u0631\u0648\u062D", "\u0634\u0645\u0627\u0644 \u0633\u064A\u0646\u0627\u0621", "\u062C\u0646\u0648\u0628 \u0633\u064A\u0646\u0627\u0621"];
  if (upperEgypt.includes(governorate)) {
    return defaultFee + 25;
  }
  return defaultFee;
}
function updateCheckoutSummary() {
  const cart2 = getCart();
  const allProducts2 = getAllProducts();
  const miniList = document.getElementById("checkout-mini-items-list");
  const countBadge = document.getElementById("checkout-items-count");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const grandTotalEl = document.getElementById("checkout-grand-total");
  const transferAmountEl = document.getElementById("transfer-amount-display");
  if (!miniList) return;
  if (cart2.length === 0) {
    miniList.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i data-lucide="shopping-bag" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                <p>\u0633\u0644\u062A\u0643 \u0641\u0627\u0631\u063A\u0629</p>
                <a href="#products" class="text-xs text-[#ffcd00] font-bold underline mt-1 block">\u062A\u0635\u0641\u062D \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A</a>
            </div>
        `;
    if (countBadge) countBadge.textContent = "0 \u0645\u0646\u062A\u062C\u0627\u062A";
    if (subtotalEl) subtotalEl.textContent = "0.00 EGP";
    if (shippingEl) shippingEl.textContent = "0.00 EGP";
    if (grandTotalEl) grandTotalEl.textContent = "0.00 EGP";
    if (transferAmountEl) transferAmountEl.textContent = "0.00 EGP";
    if (window.lucide) window.lucide.createIcons();
    return;
  }
  if (allProducts2.length === 0) {
    miniList.innerHTML = renderCheckoutSummarySkeleton();
    return;
  }
  let subtotal = 0;
  const itemsHtml = cart2.map((item) => {
    const catalogProduct = allProducts2.find((p) => p.id === item.id || p.shortId === item.id);
    const verifiedPrice = catalogProduct ? parseFloat(catalogProduct.price) : parseFloat(item.price);
    const itemTotal = verifiedPrice * item.quantity;
    subtotal += itemTotal;
    const colorInfo = item.selectedColor ? `<span class="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 ml-1" style="background-color: ${item.selectedColor.hex}"></span>` : "";
    return `
            <div class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <img src="${item.image || "https://placehold.co/100x100"}" alt="${escapeHTML(item.name)}" class="w-12 h-12 object-contain bg-white dark:bg-[#111] p-1 rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div class="flex-grow min-w-0 text-right">
                    <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">${escapeHTML(item.name)}</h5>
                    <div class="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>\u0627\u0644\u0643\u0645\u064A\u0629: ${item.quantity}</span>
                        ${colorInfo}
                    </div>
                </div>
                <div class="text-left font-black text-xs text-gray-900 dark:text-white whitespace-nowrap" dir="ltr">
                    ${itemTotal.toFixed(2)} EGP
                </div>
            </div>
        `;
  }).join("");
  const gov = document.getElementById("cust-governorate")?.value || customerData.governorate || "";
  const shippingFee = calculateShippingFee(subtotal, gov);
  const grandTotal = subtotal + shippingFee;
  miniList.innerHTML = itemsHtml;
  if (countBadge) countBadge.textContent = `${cart2.reduce((s, i) => s + i.quantity, 0)} \u0645\u0646\u062A\u062C`;
  if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
  if (shippingEl) shippingEl.textContent = shippingFee === 0 ? "\u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A \u2713" : `${shippingFee.toFixed(2)} EGP`;
  if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toFixed(2)} EGP`;
  if (transferAmountEl) transferAmountEl.textContent = `${grandTotal.toFixed(2)} EGP`;
  if (window.lucide) window.lucide.createIcons();
}
function goToCheckoutStep(step) {
  currentStep = step;
  for (let i = 1; i <= 4; i++) {
    const navItem = document.getElementById(`step-nav-${i}`);
    const panel = document.getElementById(`checkout-step-${i}`);
    const line = document.getElementById(`step-line-${i}`);
    if (panel) {
      panel.classList.toggle("hidden", i !== step);
    }
    if (navItem) {
      navItem.classList.remove("active", "completed");
      if (i === step) {
        navItem.classList.add("active");
      } else if (i < step) {
        navItem.classList.add("completed");
        navItem.querySelector(".step-circle").innerHTML = `<i data-lucide="check" class="w-4 h-4"></i>`;
      } else {
        navItem.querySelector(".step-circle").textContent = i;
      }
    }
    if (line) {
      line.classList.toggle("completed", i < step);
    }
  }
  updateCheckoutSummary();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) window.lucide.createIcons();
}
function updatePaymentDetailsView() {
  const settings = getPaymentSettings();
  const titleEl = document.getElementById("transfer-method-title");
  const labelEl = document.getElementById("transfer-account-label");
  const valueEl = document.getElementById("transfer-account-value");
  const nameEl = document.getElementById("transfer-account-name");
  if (selectedPaymentMethod === "vodafone_cash") {
    if (titleEl) titleEl.textContent = "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0639\u0628\u0631 \u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634";
    if (labelEl) labelEl.textContent = "\u0631\u0642\u0645 \u0645\u062D\u0641\u0638\u0629 \u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634:";
    if (valueEl) valueEl.textContent = settings.vodafoneCash.phone;
    if (nameEl) nameEl.textContent = `\u0628\u0627\u0633\u0645: ${settings.vodafoneCash.accountName}`;
  } else {
    if (titleEl) titleEl.textContent = "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0639\u0628\u0631 \u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A (InstaPay)";
    if (labelEl) labelEl.textContent = "\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0631\u0642\u0645 \u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A (IPA):";
    if (valueEl) valueEl.textContent = settings.instapay.address;
    if (nameEl) nameEl.textContent = `\u0628\u0627\u0633\u0645: ${settings.instapay.accountName}`;
  }
}
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
            height = Math.round(height * maxDim / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round(width * maxDim / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
async function handleProofFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0644\u0641 \u0635\u0648\u0631\u0629 \u0635\u0627\u0644\u062D (JPG, PNG, WEBP).");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast("\u062D\u062C\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B (\u0623\u0642\u0635\u0649 \u062D\u062F 10MB).");
    return;
  }
  try {
    const compressedBase64 = await compressImage(file);
    uploadedProofBase64 = compressedBase64;
    uploadedProofMeta = {
      name: file.name,
      size: Math.round(file.size / 1024) + " KB",
      type: file.type
    };
    const previewContainer = document.getElementById("proof-preview-container");
    const placeholder = document.getElementById("proof-dropzone-placeholder");
    const previewImg = document.getElementById("proof-preview-img");
    const previewName = document.getElementById("proof-preview-name");
    const previewSize = document.getElementById("proof-preview-size");
    if (previewImg) previewImg.src = compressedBase64;
    if (previewName) previewName.textContent = file.name;
    if (previewSize) previewSize.textContent = uploadedProofMeta.size;
    if (previewContainer) previewContainer.classList.remove("hidden");
    if (placeholder) placeholder.classList.add("hidden");
    showToast("\u062A\u0645 \u0625\u0631\u0641\u0627\u0642 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u062C\u0627\u062D!");
  } catch (err) {
    console.error("Error compressing proof image:", err);
    showToast("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0635\u0648\u0631\u0629\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.");
  }
}
async function submitOrder() {
  if (isSubmitting) return;
  const cart2 = getCart();
  if (cart2.length === 0) {
    showToast("\u0633\u0644\u062A\u0643 \u0641\u0627\u0631\u063A\u0629! \u0623\u0636\u0641 \u0645\u0646\u062A\u062C\u0627\u062A \u0642\u0628\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628.");
    goToCheckoutStep(1);
    return;
  }
  if (!uploadedProofBase64) {
    showToast("\u064A\u0631\u062C\u0649 \u0625\u0631\u0641\u0627\u0642 \u0635\u0648\u0631\u0629 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0623\u0648\u0644\u0627\u064B \u0644\u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628\u0643.");
    return;
  }
  const allProducts2 = getAllProducts();
  let subtotal = 0;
  const verifiedItems = cart2.map((item) => {
    const catalogProduct = allProducts2.find((p) => p.id === item.id || p.shortId === item.id);
    const verifiedPrice = catalogProduct ? parseFloat(catalogProduct.price) : parseFloat(item.price);
    const itemTotal = verifiedPrice * item.quantity;
    subtotal += itemTotal;
    return {
      productId: item.id,
      name: item.name,
      price: verifiedPrice,
      quantity: item.quantity,
      selectedColor: item.selectedColor || null,
      image: item.image || "",
      itemTotal
    };
  });
  const shippingFee = calculateShippingFee(subtotal, customerData.governorate);
  const grandTotal = subtotal + shippingFee;
  const submitBtn = document.getElementById("btn-submit-order");
  const submitText = document.getElementById("submit-order-text");
  const spinner = document.getElementById("submit-order-spinner");
  isSubmitting = true;
  if (submitBtn) submitBtn.disabled = true;
  if (submitText) submitText.textContent = "\u062C\u0627\u0631\u064A \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628 \u0648\u062D\u0641\u0638 \u0627\u0644\u0625\u062B\u0628\u0627\u062A...";
  if (spinner) spinner.classList.remove("hidden");
  try {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const randomNum = Math.floor(1e5 + Math.random() * 9e5);
    const orderNumber = `ORD-${currentYear}-${randomNum}`;
    const transactionRef = document.getElementById("proof-transaction-ref")?.value.trim() || "";
    const paymentNotes = document.getElementById("proof-notes")?.value.trim() || "";
    const orderDoc = {
      orderNumber,
      customer: {
        name: customerData.name || "",
        phone: customerData.phone || "",
        email: customerData.email || "",
        governorate: customerData.governorate || "",
        city: customerData.city || "",
        address: customerData.address || "",
        notes: customerData.notes || ""
      },
      items: verifiedItems,
      subtotal,
      shippingFee,
      totalAmount: grandTotal,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: "pending_review",
      orderStatus: "pending_review",
      paymentProof: {
        screenshotUrl: uploadedProofBase64,
        transactionRef,
        notes: paymentNotes,
        uploadedAt: Timestamp.now()
      },
      statusHistory: [
        {
          status: "pending_review",
          title: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0641\u0639",
          timestamp: Timestamp.now(),
          updatedBy: "customer",
          note: "\u062A\u0645 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0625\u0631\u0641\u0627\u0642 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u062C\u0627\u062D \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639."
        }
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, "orders"), orderDoc);
    console.log("Order submitted successfully:", orderNumber, docRef.id);
    const gasWebhookUrl = "https://script.google.com/macros/s/AKfycby-g5O-K-s_Fjbv3AAjpMWJU3Bv1QhcGKADua0s6hOIm5epuv0puMT_-Q1PKgCtKJN8/exec";
    try {
      fetch(gasWebhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "notify_new_order", order: orderDoc })
      }).catch((e) => console.warn("Telegram GAS notification warning:", e));
    } catch (e) {
    }
    try {
      fetch("/api/orders/notify-new-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderDoc })
      }).catch(() => {
      });
    } catch (e) {
    }
    try {
      const recentOrders = JSON.parse(localStorage.getItem("macca_recent_orders") || "[]");
      recentOrders.unshift({
        orderNumber,
        phone: customerData.phone,
        total: grandTotal,
        date: (/* @__PURE__ */ new Date()).toISOString()
      });
      localStorage.setItem("macca_recent_orders", JSON.stringify(recentOrders.slice(0, 10)));
    } catch (e) {
      console.warn("Could not save to recent orders:", e);
    }
    clearCart();
    const successOrderNum = document.getElementById("success-order-number");
    const successTotal = document.getElementById("success-order-total");
    const successMethod = document.getElementById("success-payment-method");
    const successTrackBtn = document.getElementById("success-track-btn");
    if (successOrderNum) successOrderNum.textContent = orderNumber;
    if (successTotal) successTotal.textContent = `${grandTotal.toFixed(2)} EGP`;
    if (successMethod) successMethod.textContent = selectedPaymentMethod === "vodafone_cash" ? "\u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634" : "\u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A (InstaPay)";
    if (successTrackBtn) successTrackBtn.href = `#track-order`;
    const copySuccessBtn = document.getElementById("copy-success-order-btn");
    if (copySuccessBtn) {
      copySuccessBtn.onclick = () => {
        navigator.clipboard.writeText(orderNumber).then(() => {
          showToast("\u062A\u0645 \u0646\u0633\u062E \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628: " + orderNumber);
        });
      };
    }
    goToCheckoutStep(4);
    showToast("\u062A\u0647\u0627\u0646\u064A\u0646\u0627! \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D \u0648\u0633\u0646\u0642\u0648\u0645 \u0628\u0645\u0631\u0627\u062C\u0639\u062A\u0647 \u0641\u0648\u0631\u0627\u064B.");
  } catch (err) {
    console.error("Error creating order:", err);
    showToast("\u062A\u0639\u0630\u0631 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628: " + (err.message || "\u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B."));
  } finally {
    isSubmitting = false;
    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.textContent = "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628 \u0648\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u062B\u0628\u0627\u062A";
    if (spinner) spinner.classList.add("hidden");
  }
}
function initCheckout() {
  const shippingForm = document.getElementById("shipping-details-form");
  if (shippingForm) {
    shippingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cust-name")?.value.trim();
      const phone = document.getElementById("cust-phone")?.value.trim();
      const email = document.getElementById("cust-email")?.value.trim();
      const governorate = document.getElementById("cust-governorate")?.value;
      const city = document.getElementById("cust-city")?.value.trim();
      const address = document.getElementById("cust-address")?.value.trim();
      const notes = document.getElementById("cust-notes")?.value.trim();
      if (!name || !phone || !governorate || !city || !address) {
        showToast("\u064A\u0631\u062C\u0649 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629.");
        return;
      }
      if (!validateEgyptianPhone(phone)) {
        showToast("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0635\u062D\u064A\u062D (\u0645\u062B\u0627\u0644: 01xxxxxxxxx)");
        document.getElementById("cust-phone")?.focus();
        return;
      }
      customerData = { name, phone, email, governorate, city, address, notes };
      updateCheckoutSummary();
      updatePaymentDetailsView();
      goToCheckoutStep(2);
    });
    document.getElementById("cust-governorate")?.addEventListener("change", () => {
      updateCheckoutSummary();
    });
  }
  document.getElementById("btn-back-to-step-1")?.addEventListener("click", () => goToCheckoutStep(1));
  document.getElementById("btn-to-step-3")?.addEventListener("click", () => goToCheckoutStep(3));
  document.getElementById("btn-back-to-step-2")?.addEventListener("click", () => goToCheckoutStep(2));
  document.querySelectorAll(".payment-option-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-option-card").forEach((c) => {
        c.classList.remove("selected");
        const radio2 = c.querySelector('input[type="radio"]');
        if (radio2) radio2.checked = false;
      });
      card.classList.add("selected");
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      selectedPaymentMethod = card.dataset.method || "vodafone_cash";
      updatePaymentDetailsView();
    });
  });
  const copyAccountBtn = document.getElementById("copy-transfer-account-btn");
  if (copyAccountBtn) {
    copyAccountBtn.addEventListener("click", () => {
      const val = document.getElementById("transfer-account-value")?.textContent.trim();
      if (val && val !== "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...") {
        navigator.clipboard.writeText(val).then(() => {
          const origHtml = copyAccountBtn.innerHTML;
          copyAccountBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-600"></i><span class="text-green-600 font-black">\u062A\u0645 \u0627\u0644\u0646\u0633\u062E!</span>`;
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            copyAccountBtn.innerHTML = origHtml;
            if (window.lucide) window.lucide.createIcons();
          }, 2e3);
        });
      }
    });
  }
  const dropzone = document.getElementById("proof-dropzone");
  const fileInput = document.getElementById("proof-file-input");
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", (e) => {
      if (e.target.closest("#remove-proof-btn")) return;
      fileInput.click();
    });
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleProofFile(e.target.files[0]);
      }
    });
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleProofFile(e.dataTransfer.files[0]);
      }
    });
  }
  document.getElementById("remove-proof-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    uploadedProofBase64 = null;
    uploadedProofMeta = null;
    if (fileInput) fileInput.value = "";
    document.getElementById("proof-preview-container")?.classList.add("hidden");
    document.getElementById("proof-dropzone-placeholder")?.classList.remove("hidden");
  });
  const proofForm = document.getElementById("proof-upload-form");
  if (proofForm) {
    proofForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitOrder();
    });
  }
}
function openCheckoutPage() {
  const cart2 = getCart();
  if (cart2.length === 0) {
    showToast("\u0633\u0644\u0651\u062A\u0643 \u0641\u0627\u0631\u063A\u0629! \u0623\u0636\u0641 \u0645\u0646\u062A\u062C\u0627\u062A \u0642\u0628\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628.");
    window.location.hash = "#products";
    return;
  }
  uploadedProofBase64 = null;
  uploadedProofMeta = null;
  document.getElementById("proof-preview-container")?.classList.add("hidden");
  document.getElementById("proof-dropzone-placeholder")?.classList.remove("hidden");
  if (document.getElementById("proof-file-input")) {
    document.getElementById("proof-file-input").value = "";
  }
  goToCheckoutStep(1);
  updatePaymentDetailsView();
}

// js/tracking.js
init_firebase_config();
init_utils();
init_skeleton();
var currentTrackedOrder = null;
var currentTrackedDocId = null;
var TIMELINE_STEPS = [
  { key: "received", title: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628", desc: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0628\u064A\u0627\u0646\u0627\u062A \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u0633\u062C\u064A\u0644\u0647 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645." },
  { key: "payment_review", title: "\u062C\u0627\u0631\u064A \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0641\u0639", desc: "\u0641\u0631\u064A\u0642 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u064A\u0642\u0648\u0645 \u0628\u0645\u0637\u0627\u0628\u0642\u0629 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0645\u0639 \u0627\u0644\u062D\u0633\u0627\u0628." },
  { key: "payment_confirmed", title: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639", desc: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0648\u062A\u0623\u0643\u064A\u062F \u0633\u062F\u0627\u062F \u0642\u064A\u0645\u0629 \u0627\u0644\u0637\u0644\u0628." },
  { key: "processing", title: "\u062C\u0627\u0631\u064A \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628", desc: "\u064A\u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0645\u0646 \u0627\u0644\u0645\u062E\u0632\u0646." },
  { key: "ready_to_ship", title: "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628", desc: "\u0627\u0644\u0637\u0644\u0628 \u0645\u063A\u0644\u0641 \u0648\u062C\u0627\u0647\u0632 \u0644\u0644\u062A\u0633\u0644\u064A\u0645 \u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0634\u062D\u0646." },
  { key: "shipped", title: "\u062E\u0631\u062C \u0644\u0644\u0634\u062D\u0646", desc: "\u0627\u0644\u0634\u062D\u0646\u0629 \u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642 \u0625\u0644\u0649 \u0639\u0646\u0648\u0627\u0646\u0643 \u0645\u0639 \u0645\u0646\u062F\u0648\u0628 \u0627\u0644\u062A\u0648\u0635\u064A\u0644." },
  { key: "delivered", title: "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0628\u0646\u062C\u0627\u062D", desc: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0628\u0646\u062C\u0627\u062D." }
];
function getStageIndex(order) {
  const status = order.orderStatus;
  const payStatus = order.paymentStatus;
  if (status === "delivered") return 6;
  if (status === "shipped") return 5;
  if (status === "ready_to_ship") return 4;
  if (status === "processing") return 3;
  if (status === "payment_confirmed" || payStatus === "paid") return 2;
  if (status === "payment_review" || payStatus === "pending_review") return 1;
  return 0;
}
function getStatusBadgeHtml(status, type = "order") {
  const orderLabels = {
    "pending_review": { label: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0641\u0639", class: "order-badge-pending_review" },
    "payment_confirmed": { label: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639", class: "order-badge-payment_confirmed" },
    "processing": { label: "\u062C\u0627\u0631\u064A \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628", class: "order-badge-processing" },
    "ready_to_ship": { label: "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628", class: "order-badge-ready_to_ship" },
    "shipped": { label: "\u062A\u0645 \u0627\u0644\u0634\u062D\u0646", class: "order-badge-shipped" },
    "delivered": { label: "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645", class: "order-badge-delivered" },
    "payment_rejected": { label: "\u0645\u0631\u0641\u0648\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639", class: "order-badge-payment_rejected" },
    "cancelled": { label: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628", class: "order-badge-cancelled" }
  };
  const paymentLabels = {
    "pending_review": { label: "\u062F\u0641\u0639 \u0645\u0639\u0644\u0642 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629", class: "order-badge-pending_review" },
    "paid": { label: "\u062A\u0645 \u0627\u0644\u0633\u062F\u0627\u062F \u0628\u0646\u062C\u0627\u062D", class: "order-badge-paid" },
    "rejected": { label: "\u062A\u062D\u0648\u064A\u0644 \u0645\u0631\u0641\u0648\u0636", class: "order-badge-payment_rejected" }
  };
  const dict = type === "payment" ? paymentLabels : orderLabels;
  const item = dict[status] || { label: status || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F", class: "order-badge-pending_review" };
  return `<span class="order-badge ${item.class}">${escapeHTML(item.label)}</span>`;
}
function renderTimeline(order) {
  const container = document.getElementById("tracking-timeline-steps");
  if (!container) return;
  const currentStage = getStageIndex(order);
  const isRejected = order.orderStatus === "payment_rejected";
  const isCancelled = order.orderStatus === "cancelled";
  container.innerHTML = TIMELINE_STEPS.map((step, index) => {
    let stepClass = "";
    let iconHtml = "";
    let dateStr = "";
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      const histItem = order.statusHistory.find((h) => {
        if (index === 0) return true;
        if (index === 1 && h.status === "payment_review") return true;
        if (index === 2 && h.status === "payment_confirmed") return true;
        if (index === 3 && h.status === "processing") return true;
        if (index === 4 && h.status === "ready_to_ship") return true;
        if (index === 5 && h.status === "shipped") return true;
        if (index === 6 && h.status === "delivered") return true;
        return false;
      });
      if (histItem && histItem.timestamp) {
        const dateObj = histItem.timestamp.toDate ? histItem.timestamp.toDate() : new Date(histItem.timestamp);
        dateStr = dateObj.toLocaleDateString("ar-EG", { month: "short", day: "numeric" }) + " - " + dateObj.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      }
    }
    if (index < currentStage) {
      stepClass = "completed";
      iconHtml = `<i data-lucide="check" class="w-5 h-5"></i>`;
    } else if (index === currentStage) {
      if (isRejected) {
        stepClass = "current";
        iconHtml = `<i data-lucide="alert-circle" class="w-5 h-5 text-red-600"></i>`;
      } else if (isCancelled) {
        stepClass = "current";
        iconHtml = `<i data-lucide="x" class="w-5 h-5 text-red-600"></i>`;
      } else {
        stepClass = "current";
        iconHtml = `<i data-lucide="loader" class="w-5 h-5 animate-spin text-gray-900"></i>`;
      }
    } else {
      stepClass = "";
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
                        ${dateStr ? `<span class="text-[11px] font-bold text-gray-400" dir="ltr">${dateStr}</span>` : ""}
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">${escapeHTML(step.desc)}</p>
                </div>
            </div>
        `;
  }).join("");
  if (window.lucide) window.lucide.createIcons();
}
function displayTrackedOrder(order, docId) {
  currentTrackedOrder = order;
  currentTrackedDocId = docId;
  const resultBox = document.getElementById("track-result-container");
  if (!resultBox) return;
  const orderIdEl = document.getElementById("track-order-id");
  const orderDateEl = document.getElementById("track-order-date");
  const orderBadgeEl = document.getElementById("track-order-status-badge");
  const payBadgeEl = document.getElementById("track-payment-status-badge");
  const addressEl = document.getElementById("track-delivery-address");
  const totalEl = document.getElementById("track-total-amount");
  if (orderIdEl) orderIdEl.textContent = order.orderNumber;
  if (orderDateEl && order.createdAt) {
    const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    orderDateEl.textContent = `\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0637\u0644\u0628: ${d.toLocaleDateString("ar-EG")} - ${d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (orderBadgeEl) orderBadgeEl.outerHTML = getStatusBadgeHtml(order.orderStatus, "order");
  if (payBadgeEl) payBadgeEl.outerHTML = getStatusBadgeHtml(order.paymentStatus, "payment");
  if (addressEl && order.customer) {
    addressEl.textContent = `${order.customer.name} - ${order.customer.governorate}\u060C ${order.customer.city} - ${order.customer.address} (\u0647\u0627\u062A\u0641: ${order.customer.phone})`;
  }
  if (totalEl) totalEl.textContent = `${parseFloat(order.totalAmount || 0).toFixed(2)} EGP`;
  const rejectionBox = document.getElementById("track-rejection-alert");
  const rejectionReasonEl = document.getElementById("track-rejection-reason");
  if (order.orderStatus === "payment_rejected" || order.paymentStatus === "rejected") {
    if (rejectionBox) rejectionBox.classList.remove("hidden");
    if (rejectionReasonEl) {
      const reason = order.rejectionReason || order.statusHistory && order.statusHistory.slice(-1)[0]?.note || "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0637\u0627\u0628\u0642 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0645\u0639 \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0637\u0644\u0648\u0628.";
      rejectionReasonEl.textContent = `\u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636: ${reason}`;
    }
  } else {
    if (rejectionBox) rejectionBox.classList.add("hidden");
  }
  renderTimeline(order);
  const historyContainer = document.getElementById("track-history-logs");
  if (historyContainer && order.statusHistory) {
    historyContainer.innerHTML = order.statusHistory.map((h) => {
      const d = h.timestamp ? h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp) : /* @__PURE__ */ new Date();
      const dateStr = d.toLocaleDateString("ar-EG") + " " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      return `
                <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                        <span class="font-bold text-gray-800 dark:text-gray-200">${escapeHTML(h.title || h.status)}</span>
                        ${h.note ? `<p class="text-[11px] text-gray-500 mt-0.5">${escapeHTML(h.note)}</p>` : ""}
                    </div>
                    <span class="text-[10px] text-gray-400 whitespace-nowrap" dir="ltr">${dateStr}</span>
                </div>
            `;
    }).join("");
  }
  resultBox.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}
async function trackOrder(orderNumber, phone) {
  if (!orderNumber || !phone) {
    showToast("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641.");
    return;
  }
  const cleanOrderNum = orderNumber.trim().toUpperCase();
  const cleanPhone = phone.trim();
  const submitBtn = document.getElementById("track-submit-btn");
  const btnText = document.getElementById("track-btn-text");
  const spinner = document.getElementById("track-spinner");
  const resultBox = document.getElementById("track-result-container");
  const skeletonBox = document.getElementById("track-result-skeleton");
  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.textContent = "\u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628...";
  if (spinner) spinner.classList.remove("hidden");
  if (skeletonBox) {
    skeletonBox.innerHTML = renderOrderTrackingSkeleton();
    skeletonBox.classList.remove("hidden");
  }
  if (resultBox) resultBox.classList.add("hidden");
  try {
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", cleanOrderNum)
    );
    const querySnap = await getDocs(q);
    if (querySnap.empty) {
      if (skeletonBox) skeletonBox.classList.add("hidden");
      showToast("\u0644\u0645 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0628\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0631\u0642\u0645 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B.");
      if (resultBox) resultBox.classList.add("hidden");
      return;
    }
    let matchedDoc = null;
    querySnap.forEach((d) => {
      const data = d.data();
      const regPhone = data.customer?.phone ? String(data.customer.phone).replace(/\s+/g, "") : "";
      if (regPhone.endsWith(cleanPhone.slice(-9)) || cleanPhone.endsWith(regPhone.slice(-9))) {
        matchedDoc = { id: d.id, data };
      }
    });
    if (!matchedDoc) {
      if (skeletonBox) skeletonBox.classList.add("hidden");
      showToast("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0645\u0633\u062C\u0644 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.");
      if (resultBox) resultBox.classList.add("hidden");
      return;
    }
    if (skeletonBox) skeletonBox.classList.add("hidden");
    displayTrackedOrder(matchedDoc.data, matchedDoc.id);
    showToast("\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u062C\u0627\u062D!");
  } catch (err) {
    console.error("Error tracking order:", err);
    if (skeletonBox) skeletonBox.classList.add("hidden");
    showToast("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0637\u0644\u0628: " + (err.message || "\u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B."));
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = "\u062A\u062A\u0628\u0639 \u0627\u0644\u0637\u0644\u0628";
    if (spinner) spinner.classList.add("hidden");
  }
}
function initOrderTracking() {
  const form = document.getElementById("track-order-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const orderNum = document.getElementById("track-order-number-input")?.value;
      const phone = document.getElementById("track-order-phone-input")?.value;
      trackOrder(orderNum, phone);
    });
  }
  const reuploadForm = document.getElementById("reupload-proof-form");
  if (reuploadForm) {
    reuploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentTrackedDocId) return;
      const fileInput = document.getElementById("reupload-proof-input");
      const file = fileInput?.files?.[0];
      if (!file) {
        showToast("\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0635\u0648\u0631\u0629 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062C\u062F\u064A\u062F \u0623\u0648\u0644\u0627\u064B.");
        return;
      }
      const submitBtn = document.getElementById("reupload-submit-btn");
      const origText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "\u062C\u0627\u0631\u064A \u0631\u0641\u0639 \u0627\u0644\u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F...";
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = reader.result;
          const orderRef = doc(db, "orders", currentTrackedDocId);
          const newHistory = currentTrackedOrder.statusHistory || [];
          newHistory.push({
            status: "payment_review",
            title: "\u0625\u0639\u0627\u062F\u0629 \u0625\u0631\u0641\u0627\u0642 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639",
            timestamp: Timestamp.now(),
            updatedBy: "customer",
            note: "\u0642\u0627\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0625\u0639\u0627\u062F\u0629 \u0631\u0641\u0639 \u0625\u062B\u0628\u0627\u062A \u062A\u062D\u0648\u064A\u0644 \u062C\u062F\u064A\u062F \u0628\u0639\u062F \u0627\u0644\u0631\u0641\u0636 \u0627\u0644\u0633\u0627\u0628\u0642."
          });
          await updateDoc(orderRef, {
            "paymentProof.screenshotUrl": base64,
            "paymentProof.uploadedAt": Timestamp.now(),
            paymentStatus: "pending_review",
            orderStatus: "payment_review",
            statusHistory: newHistory,
            updatedAt: Timestamp.now()
          });
          currentTrackedOrder.paymentStatus = "pending_review";
          currentTrackedOrder.orderStatus = "payment_review";
          currentTrackedOrder.statusHistory = newHistory;
          displayTrackedOrder(currentTrackedOrder, currentTrackedDocId);
          showToast("\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062C\u062F\u064A\u062F \u0628\u0646\u062C\u0627\u062D \u0648\u0633\u064A\u0642\u0648\u0645 \u0627\u0644\u0645\u0634\u0631\u0641 \u0628\u0645\u0631\u0627\u062C\u0639\u062A\u0647 \u0641\u0648\u0631\u0627\u064B!");
        };
      } catch (err) {
        console.error("Error re-uploading proof:", err);
        showToast("\u062A\u0639\u0630\u0631 \u0625\u0639\u0627\u062F\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u062B\u0628\u0627\u062A: " + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }
    });
  }
  try {
    const lastOrders = JSON.parse(localStorage.getItem("macca_recent_orders") || "[]");
    if (lastOrders.length > 0) {
      const last = lastOrders[0];
      const orderInput = document.getElementById("track-order-number-input");
      const phoneInput = document.getElementById("track-order-phone-input");
      if (orderInput && !orderInput.value) orderInput.value = last.orderNumber || "";
      if (phoneInput && !phoneInput.value) phoneInput.value = last.phone || "";
    }
  } catch (e) {
  }
}

// js/orders-admin.js
init_firebase_config();
init_auth();
init_utils();
init_skeleton();
var allOrders = [];
var filteredOrders = [];
var currentOrderPage = 1;
var ORDERS_PER_PAGE = 12;
var activeOrderForModal = null;
var isUnsubscribeListening = null;
var STATUS_LABELS = {
  "pending_review": { label: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0641\u0639", class: "order-badge-pending_review" },
  "payment_confirmed": { label: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639", class: "order-badge-payment_confirmed" },
  "processing": { label: "\u062C\u0627\u0631\u064A \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628", class: "order-badge-processing" },
  "ready_to_ship": { label: "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628", class: "order-badge-ready_to_ship" },
  "shipped": { label: "\u062A\u0645 \u0627\u0644\u0634\u062D\u0646", class: "order-badge-shipped" },
  "delivered": { label: "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645", class: "order-badge-delivered" },
  "payment_rejected": { label: "\u0645\u0631\u0641\u0648\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639", class: "order-badge-payment_rejected" },
  "cancelled": { label: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628", class: "order-badge-cancelled" }
};
var PAYMENT_LABELS = {
  "pending_review": { label: "\u062F\u0641\u0639 \u0645\u0639\u0644\u0642 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629", class: "order-badge-pending_review" },
  "paid": { label: "\u062A\u0645 \u0627\u0644\u0633\u062F\u0627\u062F \u0628\u0646\u062C\u0627\u062D", class: "order-badge-paid" },
  "rejected": { label: "\u062A\u062D\u0648\u064A\u0644 \u0645\u0631\u0641\u0648\u0636", class: "order-badge-payment_rejected" }
};
function getBadge(status, isPayment = false) {
  const dict = isPayment ? PAYMENT_LABELS : STATUS_LABELS;
  const item = dict[status] || { label: status || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F", class: "order-badge-pending_review" };
  return `<span class="order-badge ${item.class}">${escapeHTML(item.label)}</span>`;
}
function updateAdminStats() {
  const totalOrders = allOrders.length;
  const pendingReview = allOrders.filter((o) => o.orderStatus === "payment_review" || o.paymentStatus === "pending_review");
  const processing = allOrders.filter((o) => o.orderStatus === "processing");
  const shipped = allOrders.filter((o) => o.orderStatus === "shipped");
  const delivered = allOrders.filter((o) => o.orderStatus === "delivered");
  const totalRevenue = allOrders.filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered" || o.orderStatus === "payment_confirmed").reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const statTotalEl = document.getElementById("stat-total-orders");
  const statPendingEl = document.getElementById("stat-pending-review");
  const statProcEl = document.getElementById("stat-processing");
  const statShipEl = document.getElementById("stat-shipped");
  const statDelivEl = document.getElementById("stat-delivered");
  const statRevEl = document.getElementById("stat-total-revenue");
  const tabPendingBadge = document.getElementById("admin-pending-badge");
  const alertBanner = document.getElementById("admin-proofs-alert-banner");
  const alertCountEl = document.getElementById("admin-proofs-alert-count");
  if (statTotalEl) statTotalEl.textContent = totalOrders;
  if (statPendingEl) statPendingEl.textContent = pendingReview.length;
  if (statProcEl) statProcEl.textContent = processing.length;
  if (statShipEl) statShipEl.textContent = shipped.length;
  if (statDelivEl) statDelivEl.textContent = delivered.length;
  if (statRevEl) statRevEl.textContent = `${totalRevenue.toLocaleString("ar-EG", { minimumFractionDigits: 2 })} EGP`;
  if (tabPendingBadge) {
    if (pendingReview.length > 0) {
      tabPendingBadge.textContent = pendingReview.length;
      tabPendingBadge.classList.remove("hidden");
    } else {
      tabPendingBadge.classList.add("hidden");
    }
  }
  if (alertBanner && alertCountEl) {
    if (pendingReview.length > 0) {
      alertBanner.classList.remove("hidden");
      alertCountEl.textContent = `\u064A\u0648\u062C\u062F ${pendingReview.length} \u0637\u0644\u0628\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0641\u062D\u0635 \u0633\u0643\u0631\u064A\u0646 \u0634\u0648\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644.`;
    } else {
      alertBanner.classList.add("hidden");
    }
  }
  renderRecentOrdersOverview();
}
function renderRecentOrdersOverview() {
  const tbody = document.getElementById("admin-recent-orders-tbody");
  if (!tbody) return;
  const recent = allOrders.slice(0, 6);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400">\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0645\u0633\u062C\u0644\u0629 \u0628\u0639\u062F.</td></tr>`;
    return;
  }
  tbody.innerHTML = recent.map((order) => {
    return `
            <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td class="py-3 font-mono font-bold text-[#ffcd00]" dir="ltr">${escapeHTML(order.orderNumber)}</td>
                <td class="py-3 font-bold">${escapeHTML(order.customer?.name || "\u0639\u0645\u064A\u0644")}</td>
                <td class="py-3 font-black" dir="ltr">${parseFloat(order.totalAmount || 0).toFixed(2)} EGP</td>
                <td class="py-3 font-bold">${order.paymentMethod === "vodafone_cash" ? "\u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634" : "\u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A"}</td>
                <td class="py-3">${getBadge(order.paymentStatus, true)}</td>
                <td class="py-3">${getBadge(order.orderStatus, false)}</td>
                <td class="py-3">
                    <button type="button" class="admin-view-order-btn px-3 py-1.5 bg-[#ffcd00]/20 hover:bg-[#ffcd00] text-gray-900 dark:text-white font-bold rounded-lg transition-colors" data-order-id="${order.id}">
                        \u0641\u062D\u0635
                    </button>
                </td>
            </tr>
        `;
  }).join("");
  tbody.querySelectorAll(".admin-view-order-btn").forEach((btn) => {
    btn.onclick = () => openAdminOrderModal(btn.dataset.orderId);
  });
}
function filterAndRenderAdminOrders() {
  const searchTerm = (document.getElementById("admin-orders-search")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("admin-orders-filter-status")?.value || "all";
  const methodFilter = document.getElementById("admin-orders-filter-method")?.value || "all";
  const sortBy = document.getElementById("admin-orders-sort")?.value || "newest";
  filteredOrders = allOrders.filter((order) => {
    const matchSearch = !searchTerm || order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm) || order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm) || order.customer?.phone && order.customer.phone.includes(searchTerm);
    const matchStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    const matchMethod = methodFilter === "all" || order.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });
  if (sortBy === "oldest") {
    filteredOrders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  } else if (sortBy === "highest_total") {
    filteredOrders.sort((a, b) => (parseFloat(b.totalAmount) || 0) - (parseFloat(a.totalAmount) || 0));
  } else {
    filteredOrders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }
  renderOrdersTable();
}
function renderOrdersTable() {
  const tbody = document.getElementById("admin-orders-tbody");
  const countLabel = document.getElementById("admin-orders-count-label");
  const pageNumEl = document.getElementById("admin-orders-page-num");
  const prevBtn = document.getElementById("admin-orders-prev-page");
  const nextBtn = document.getElementById("admin-orders-next-page");
  if (!tbody) return;
  if (countLabel) countLabel.textContent = `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629: ${filteredOrders.length}`;
  if (filteredOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-10 text-gray-400">\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0628\u062D\u062B \u0627\u0644\u062D\u0627\u0644\u064A\u0629.</td></tr>`;
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
  tbody.innerHTML = pageItems.map((order) => {
    const d = order.createdAt ? order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt) : /* @__PURE__ */ new Date();
    const dateFormatted = d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    return `
            <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                <td class="py-3 font-mono font-bold text-[#ffcd00]" dir="ltr">${escapeHTML(order.orderNumber)}</td>
                <td class="py-3 font-bold">${escapeHTML(order.customer?.name || "\u0639\u0645\u064A\u0644")}</td>
                <td class="py-3 font-bold text-gray-500 dark:text-gray-400" dir="ltr">${escapeHTML(order.customer?.phone || "")}</td>
                <td class="py-3">${escapeHTML(order.customer?.governorate || "-")}</td>
                <td class="py-3 font-black" dir="ltr">${parseFloat(order.totalAmount || 0).toFixed(2)} EGP</td>
                <td class="py-3 font-bold text-xs">${order.paymentMethod === "vodafone_cash" ? "\u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634" : "\u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A"}</td>
                <td class="py-3">${getBadge(order.paymentStatus, true)}</td>
                <td class="py-3">${getBadge(order.orderStatus, false)}</td>
                <td class="py-3 text-[11px] text-gray-400 whitespace-nowrap" dir="ltr">${dateFormatted}</td>
                <td class="py-3 text-center">
                    <button type="button" class="admin-view-order-btn px-3.5 py-1.5 bg-[#ffcd00] hover:bg-[#ffda33] text-gray-900 font-bold rounded-xl shadow-sm transition-transform hover:scale-105" data-order-id="${order.id}">
                        \u0639\u0631\u0636 \u0648\u062A\u0639\u062F\u064A\u0644
                    </button>
                </td>
            </tr>
        `;
  }).join("");
  if (pageNumEl) pageNumEl.textContent = `${currentOrderPage} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = currentOrderPage <= 1;
  if (nextBtn) nextBtn.disabled = currentOrderPage >= totalPages;
  tbody.querySelectorAll(".admin-view-order-btn").forEach((btn) => {
    btn.onclick = () => openAdminOrderModal(btn.dataset.orderId);
  });
  if (window.lucide) window.lucide.createIcons();
}
function openAdminOrderModal(orderDocId) {
  const order = allOrders.find((o) => o.id === orderDocId);
  if (!order) return;
  activeOrderForModal = order;
  const modal = document.getElementById("admin-order-details-modal");
  if (!modal) return;
  const numEl = document.getElementById("modal-order-number");
  const createdEl = document.getElementById("modal-order-created");
  if (numEl) numEl.textContent = order.orderNumber;
  if (createdEl && order.createdAt) {
    const d = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    createdEl.textContent = `\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621: ${d.toLocaleDateString("ar-EG")} - ${d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`;
  }
  const cust = order.customer || {};
  document.getElementById("modal-cust-name").textContent = cust.name || "-";
  document.getElementById("modal-cust-phone").textContent = cust.phone || "-";
  document.getElementById("modal-cust-email").textContent = cust.email || "\u063A\u064A\u0631 \u0645\u0633\u062C\u0644";
  document.getElementById("modal-cust-gov").textContent = cust.governorate || "-";
  document.getElementById("modal-cust-city").textContent = cust.city || "-";
  document.getElementById("modal-cust-address").textContent = cust.address || "-";
  const notesRow = document.getElementById("modal-cust-notes-row");
  const notesEl = document.getElementById("modal-cust-notes");
  if (cust.notes) {
    if (notesRow) notesRow.classList.remove("hidden");
    if (notesEl) notesEl.textContent = cust.notes;
  } else {
    if (notesRow) notesRow.classList.add("hidden");
  }
  const tbody = document.getElementById("modal-items-tbody");
  const countEl = document.getElementById("modal-items-count");
  const subtotalEl = document.getElementById("modal-subtotal");
  const shippingEl = document.getElementById("modal-shipping");
  const totalEl = document.getElementById("modal-total");
  const items = order.items || [];
  if (countEl) countEl.textContent = items.reduce((s, i) => s + (i.quantity || 1), 0);
  if (tbody) {
    tbody.innerHTML = items.map((it) => `
            <tr>
                <td class="p-2.5 flex items-center gap-2">
                    <img src="${it.image || "https://placehold.co/60x60"}" class="w-9 h-9 object-contain bg-white dark:bg-[#111] rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white">${escapeHTML(it.name)}</p>
                        ${it.selectedColor ? `<span class="text-[10px] text-gray-400">\u0644\u0648\u0646: ${escapeHTML(it.selectedColor.name || it.selectedColor.hex)}</span>` : ""}
                    </div>
                </td>
                <td class="p-2.5 text-center font-bold">${it.quantity}</td>
                <td class="p-2.5 font-bold" dir="ltr">${parseFloat(it.price || 0).toFixed(2)}</td>
                <td class="p-2.5 text-left font-black" dir="ltr">${parseFloat(it.itemTotal || it.price * it.quantity).toFixed(2)} EGP</td>
            </tr>
        `).join("");
  }
  if (subtotalEl) subtotalEl.textContent = `${parseFloat(order.subtotal || 0).toFixed(2)} EGP`;
  if (shippingEl) shippingEl.textContent = `${parseFloat(order.shippingFee || 0).toFixed(2)} EGP`;
  if (totalEl) totalEl.textContent = `${parseFloat(order.totalAmount || 0).toFixed(2)} EGP`;
  document.getElementById("modal-pay-method").textContent = order.paymentMethod === "vodafone_cash" ? "\u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634" : "\u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A";
  document.getElementById("modal-pay-ref").textContent = order.paymentProof?.transactionRef || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
  document.getElementById("modal-pay-notes").textContent = order.paymentProof?.notes || "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0644\u0627\u062D\u0638\u0627\u062A";
  const payBadge = document.getElementById("modal-payment-status-badge");
  if (payBadge) payBadge.outerHTML = getBadge(order.paymentStatus, true);
  const screenshotImg = document.getElementById("modal-screenshot-img");
  const screenshotWrapper = document.getElementById("modal-screenshot-wrapper");
  const proofUrl = order.paymentProof?.screenshotUrl;
  if (screenshotImg && screenshotWrapper) {
    if (proofUrl) {
      screenshotImg.src = proofUrl;
      screenshotWrapper.classList.remove("hidden");
      screenshotWrapper.onclick = () => openImageLightbox(proofUrl);
    } else {
      screenshotImg.src = "";
      screenshotWrapper.classList.add("hidden");
    }
  }
  const payActions = document.getElementById("modal-payment-actions");
  if (payActions) {
    if (order.paymentStatus === "pending_review") {
      payActions.classList.remove("hidden");
    } else {
      payActions.classList.add("hidden");
    }
  }
  const statusSelect = document.getElementById("admin-change-status-select");
  if (statusSelect) statusSelect.value = order.orderStatus || "pending_review";
  const noteInput = document.getElementById("admin-status-note-input");
  if (noteInput) noteInput.value = "";
  const historyTimeline = document.getElementById("modal-history-timeline");
  if (historyTimeline && order.statusHistory) {
    historyTimeline.innerHTML = order.statusHistory.map((h) => {
      const d = h.timestamp ? h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp) : /* @__PURE__ */ new Date();
      const dateStr = d.toLocaleDateString("ar-EG") + " " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      return `
                <div class="p-2 rounded-lg bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-800 text-[11px] space-y-0.5">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-gray-800 dark:text-gray-200">${escapeHTML(h.title || h.status)}</span>
                        <span class="text-gray-400 text-[10px]" dir="ltr">${dateStr}</span>
                    </div>
                    ${h.note ? `<p class="text-gray-500">${escapeHTML(h.note)}</p>` : ""}
                    <span class="text-[9px] text-gray-400 block">\u0628\u0648\u0627\u0633\u0637\u0629: ${escapeHTML(h.updatedBy || "\u0627\u0644\u0645\u0634\u0631\u0641")}</span>
                </div>
            `;
    }).join("");
  }
  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}
function openImageLightbox(imgSrc) {
  const lightbox = document.getElementById("image-lightbox-modal");
  const img = document.getElementById("lightbox-img");
  if (!lightbox || !img) return;
  img.src = imgSrc;
  img.classList.remove("zoomed");
  lightbox.classList.remove("hidden");
  img.onclick = () => {
    img.classList.toggle("zoomed");
  };
}
async function approveCurrentPayment() {
  if (!activeOrderForModal) return;
  const currentUser = auth.currentUser;
  const adminEmail = currentUser?.email || "admin@macca";
  try {
    let notifyTelegramReverseSync2 = function(orderNumber, newStatus, statusTitle, adminEmail2) {
      try {
        fetch("/api/orders/reverse-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber, newStatus, statusTitle, adminEmail: adminEmail2 })
        }).catch(() => {
        });
      } catch (e) {
      }
    };
    const orderRef = doc(db, "orders", activeOrderForModal.id);
    const newHistory = activeOrderForModal.statusHistory || [];
    newHistory.push({
      status: "payment_confirmed",
      title: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0648\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639",
      timestamp: Timestamp.now(),
      updatedBy: adminEmail,
      note: "\u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0633\u0643\u0631\u064A\u0646 \u0634\u0648\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0648\u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0628\u0644\u063A \u0628\u0646\u062C\u0627\u062D."
    });
    await updateDoc(orderRef, {
      paymentStatus: "paid",
      orderStatus: "payment_confirmed",
      statusHistory: newHistory,
      updatedAt: Timestamp.now()
    });
    notifyTelegramReverseSync2(activeOrderForModal.orderNumber, "payment_confirmed", "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639", adminEmail);
    showToast(`\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062F\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 ${activeOrderForModal.orderNumber} \u0628\u0646\u062C\u0627\u062D!`);
    document.getElementById("admin-order-details-modal")?.classList.add("hidden");
  } catch (err) {
    console.error("Error approving payment:", err);
    showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062F\u0641\u0639: " + err.message);
  }
}
async function rejectCurrentPayment() {
  if (!activeOrderForModal) return;
  const reason = prompt("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0633\u0628\u0628 \u0631\u0641\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 (\u0633\u064A\u0638\u0647\u0631 \u0644\u0644\u0639\u0645\u064A\u0644 \u0641\u064A \u0634\u0627\u0634\u0629 \u0627\u0644\u062A\u062A\u0628\u0639 \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0631\u0641\u0639):", "\u0635\u0648\u0631\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629 \u0623\u0648 \u0627\u0644\u0645\u0628\u0644\u063A \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642");
  if (!reason || !reason.trim()) {
    showToast("\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0631\u0641\u0636 (\u0627\u0644\u0633\u0628\u0628 \u0645\u0637\u0644\u0648\u0628).");
    return;
  }
  const currentUser = auth.currentUser;
  const adminEmail = currentUser?.email || "admin@macca";
  try {
    const orderRef = doc(db, "orders", activeOrderForModal.id);
    const newHistory = activeOrderForModal.statusHistory || [];
    newHistory.push({
      status: "payment_rejected",
      title: "\u062A\u0645 \u0631\u0641\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644",
      timestamp: Timestamp.now(),
      updatedBy: adminEmail,
      note: reason.trim()
    });
    await updateDoc(orderRef, {
      paymentStatus: "rejected",
      orderStatus: "payment_rejected",
      rejectionReason: reason.trim(),
      statusHistory: newHistory,
      updatedAt: Timestamp.now()
    });
    notifyTelegramReverseSync(activeOrderForModal.orderNumber, "payment_rejected", "\u0645\u0631\u0641\u0648\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639 (\u0633\u0628\u0628: " + reason.trim() + ")", adminEmail);
    showToast(`\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0631\u0641\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0644\u0644\u0637\u0644\u0628 ${activeOrderForModal.orderNumber}.`);
    document.getElementById("admin-order-details-modal")?.classList.add("hidden");
  } catch (err) {
    console.error("Error rejecting payment:", err);
    showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0631\u0641\u0636 \u0627\u0644\u062F\u0641\u0639: " + err.message);
  }
}
async function saveOrderStatusTransition() {
  if (!activeOrderForModal) return;
  const newStatus = document.getElementById("admin-change-status-select")?.value;
  const note = document.getElementById("admin-status-note-input")?.value.trim();
  if (!newStatus) return;
  const currentUser = auth.currentUser;
  const adminEmail = currentUser?.email || "admin@macca";
  const statusTitleMap = {
    "pending_review": "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0641\u0639",
    "payment_confirmed": "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639",
    "processing": "\u062C\u0627\u0631\u064A \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0646",
    "ready_to_ship": "\u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u0634\u062D\u0646",
    "shipped": "\u062E\u0631\u062C \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u062A\u0648\u0635\u064A\u0644 \u0645\u0639 \u0634\u0631\u0643\u0629 \u0627\u0644\u0634\u062D\u0646",
    "delivered": "\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u0639\u0645\u064A\u0644 \u0628\u0646\u062C\u0627\u062D",
    "payment_rejected": "\u0645\u0631\u0641\u0648\u0636 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639",
    "cancelled": "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628"
  };
  try {
    const orderRef = doc(db, "orders", activeOrderForModal.id);
    const newHistory = activeOrderForModal.statusHistory || [];
    newHistory.push({
      status: newStatus,
      title: statusTitleMap[newStatus] || newStatus,
      timestamp: Timestamp.now(),
      updatedBy: adminEmail,
      note: note || `\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0649 "${statusTitleMap[newStatus] || newStatus}".`
    });
    const updateData = {
      orderStatus: newStatus,
      statusHistory: newHistory,
      updatedAt: Timestamp.now()
    };
    if (newStatus === "payment_confirmed") {
      updateData.paymentStatus = "paid";
    }
    await updateDoc(orderRef, updateData);
    notifyTelegramReverseSync(activeOrderForModal.orderNumber, newStatus, statusTitleMap[newStatus] || newStatus, adminEmail);
    showToast("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u062C\u0627\u062D!");
    document.getElementById("admin-order-details-modal")?.classList.add("hidden");
  } catch (err) {
    console.error("Error updating order status:", err);
    showToast("\u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628: " + err.message);
  }
}
function initOrdersAdmin() {
  const ordersTbody = document.getElementById("admin-orders-tbody");
  const recentTbody = document.getElementById("admin-recent-orders-tbody");
  if (ordersTbody && allOrders.length === 0) {
    ordersTbody.innerHTML = renderAdminOrdersTableSkeleton(6);
  }
  if (recentTbody && allOrders.length === 0) {
    recentTbody.innerHTML = renderAdminOrdersTableSkeleton(3);
  }
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  if (isUnsubscribeListening) {
    try {
      isUnsubscribeListening();
    } catch (e) {
    }
  }
  isUnsubscribeListening = onSnapshot(ordersQuery, (snapshot) => {
    allOrders = [];
    snapshot.forEach((docSnap) => {
      allOrders.push({ id: docSnap.id, ...docSnap.data() });
    });
    updateAdminStats();
    filterAndRenderAdminOrders();
  }, (err) => {
    console.error("Error listening to orders snapshot:", err);
  });
  document.getElementById("admin-orders-search")?.addEventListener("input", () => {
    currentOrderPage = 1;
    filterAndRenderAdminOrders();
  });
  document.getElementById("admin-orders-filter-status")?.addEventListener("change", () => {
    currentOrderPage = 1;
    filterAndRenderAdminOrders();
  });
  document.getElementById("admin-orders-filter-method")?.addEventListener("change", () => {
    currentOrderPage = 1;
    filterAndRenderAdminOrders();
  });
  document.getElementById("admin-orders-sort")?.addEventListener("change", () => {
    filterAndRenderAdminOrders();
  });
  document.getElementById("admin-orders-prev-page")?.addEventListener("click", () => {
    if (currentOrderPage > 1) {
      currentOrderPage--;
      renderOrdersTable();
    }
  });
  document.getElementById("admin-orders-next-page")?.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    if (currentOrderPage < totalPages) {
      currentOrderPage++;
      renderOrdersTable();
    }
  });
  document.getElementById("admin-view-pending-btn")?.addEventListener("click", () => {
    const tabBtn = document.querySelector('[data-tab="orders"]');
    if (tabBtn) tabBtn.click();
    const statusFilter = document.getElementById("admin-orders-filter-status");
    if (statusFilter) {
      statusFilter.value = "payment_review";
      filterAndRenderAdminOrders();
    }
  });
  document.getElementById("close-admin-order-modal-btn")?.addEventListener("click", () => {
    document.getElementById("admin-order-details-modal")?.classList.add("hidden");
  });
  document.getElementById("admin-approve-payment-btn")?.addEventListener("click", approveCurrentPayment);
  document.getElementById("admin-reject-payment-btn")?.addEventListener("click", rejectCurrentPayment);
  document.getElementById("admin-save-status-btn")?.addEventListener("click", saveOrderStatusTransition);
  document.getElementById("close-lightbox-btn")?.addEventListener("click", () => {
    document.getElementById("image-lightbox-modal")?.classList.add("hidden");
  });
  document.getElementById("image-lightbox-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "image-lightbox-modal") {
      document.getElementById("image-lightbox-modal")?.classList.add("hidden");
    }
  });
  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.remove("active", "bg-white", "dark:bg-[#2c2f38]", "shadow-sm", "text-[#ffcd00]"));
      btn.classList.add("active", "bg-white", "dark:bg-[#2c2f38]", "shadow-sm", "text-[#ffcd00]");
      document.querySelectorAll(".admin-tab-pane").forEach((pane) => pane.classList.add("hidden"));
      const targetPane = document.getElementById(`admin-tab-content-${targetTab}`);
      if (targetPane) targetPane.classList.remove("hidden");
      if (targetTab === "orders") {
        filterAndRenderAdminOrders();
      } else if (targetTab === "products") {
        renderAdminProductsTable();
      }
      if (window.lucide) window.lucide.createIcons();
    });
  });
}
function renderAdminProductsTable() {
  Promise.resolve().then(() => (init_products(), products_exports)).then(({ getAllProducts: getAllProducts2, openProductModal: openProductModal2 }) => {
    const tbody = document.getElementById("admin-products-table-tbody");
    if (!tbody) return;
    const products = getAllProducts2();
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-400">\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0633\u062C\u0644\u0629.</td></tr>`;
      return;
    }
    tbody.innerHTML = products.map((p) => {
      const img = p.imageUrl || p.imageUrls && p.imageUrls[0] || "https://placehold.co/50x50";
      const isAvail = p.isAvailable !== false;
      return `
                <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                    <td class="py-2.5">
                        <img src="${img}" class="w-10 h-10 object-contain rounded-lg bg-white dark:bg-[#111] p-1 border border-gray-200 dark:border-gray-700">
                    </td>
                    <td class="py-2.5 font-bold text-gray-900 dark:text-white max-w-[200px] truncate">${escapeHTML(p.name)}</td>
                    <td class="py-2.5 text-gray-500">${escapeHTML(p.category || "-")}</td>
                    <td class="py-2.5 font-black text-xs" dir="ltr">${parseFloat(p.price || 0).toFixed(2)} EGP</td>
                    <td class="py-2.5">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isAvail ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}">
                            ${isAvail ? "\u0645\u062A\u0648\u0641\u0631" : "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"}
                        </span>
                    </td>
                    <td class="py-2.5 text-center">
                        <button type="button" class="admin-edit-prod-row px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors" data-prod-id="${p.id}">
                            \u062A\u0639\u062F\u064A\u0644
                        </button>
                    </td>
                </tr>
            `;
    }).join("");
    tbody.querySelectorAll(".admin-edit-prod-row").forEach((btn) => {
      btn.onclick = () => openProductModal2(btn.dataset.prodId);
    });
    document.getElementById("admin-quick-add-product-btn")?.addEventListener("click", () => {
      openProductModal2();
    });
    if (window.lucide) window.lucide.createIcons();
  });
}

// js/app.js
init_utils();
var isInitialLoaded = false;
function hideGlobalLoader() {
  if (isInitialLoaded) return;
  isInitialLoaded = true;
  const loader = document.getElementById("global-loader");
  const app2 = document.getElementById("app");
  if (loader) {
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }
  if (app2) {
    app2.style.opacity = "1";
  }
  document.body.classList.remove("overflow-hidden");
}
window.hideGlobalLoader = hideGlobalLoader;
function showPage(pageId, itemId = null) {
  const pages = document.querySelectorAll(".page-section");
  pages.forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.add("active");
    if (pageId === "cart") {
      renderCartPage();
    } else if (pageId === "checkout") {
      openCheckoutPage();
    } else if (pageId === "wishlist") {
      renderWishlistPage();
    } else if (pageId === "details" && itemId) {
      renderProductDetails(itemId);
    } else if (pageId === "blog-post" && itemId) {
      renderArticleDetails(itemId);
    } else if (pageId === "offers") {
      renderOffersPage();
    }
  } else {
    document.getElementById("page-home")?.classList.add("active");
  }
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) window.lucide.createIcons();
}
function handleRouting() {
  const hash = window.location.hash || "#home";
  const simplePages = ["home", "products", "offers", "blog", "contact", "cart", "checkout", "track-order", "wishlist", "admin", "about", "terms"];
  if (hash.startsWith("#product/")) {
    const id = decodeURIComponent(hash.substring("#product/".length)).replace(/\/$/, "").trim();
    showPage("details", id);
  } else if (hash.startsWith("#blog/")) {
    const id = decodeURIComponent(hash.substring("#blog/".length)).replace(/\/$/, "").trim();
    showPage("blog-post", id);
  } else if (hash.startsWith("#track-order")) {
    showPage("track-order");
    const queryPart = hash.includes("?") ? hash.split("?")[1] : "";
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const oNum = params.get("orderNumber");
      const ph = params.get("phone");
      if (oNum && ph) {
        const oInput = document.getElementById("track-order-number-input");
        const pInput = document.getElementById("track-order-phone-input");
        if (oInput) oInput.value = oNum;
        if (pInput) pInput.value = ph;
        trackOrder(oNum, ph);
      }
    }
  } else {
    const page = hash.substring(1).split("?")[0];
    if (simplePages.includes(page)) {
      showPage(page);
    } else {
      showPage("home");
    }
  }
}
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();
    if (!validateEgyptianPhone(phone)) {
      showToast("\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0635\u062D\u064A\u062D (\u0645\u062B\u0627\u0644: 011xxxxxxxx)");
      phoneInput.focus();
      return;
    }
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "\u062C\u0627\u0631\u064A \u0627\u0644\u0625\u0631\u0633\u0627\u0644...";
    try {
      await addDoc(collection(db, "contacts"), {
        name,
        phone,
        message,
        createdAt: Timestamp.now(),
        status: "unread"
      });
      form.reset();
      showToast("\u0634\u0643\u0631\u0627\u064B \u0644\u0643! \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u062A\u0643 \u0628\u0646\u062C\u0627\u062D \u0648\u0633\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0641\u0631\u064A\u0642\u0646\u0627 \u0642\u0631\u064A\u0628\u0627\u064B.");
    } catch (err) {
      console.error("Error submitting contact message:", err);
      showToast("\u062A\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0639\u0628\u0631 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  });
}
function initVisitorCounter() {
  const visitorRef = doc(db, "site_stats", "visitor_counter");
  const countEl = document.getElementById("visitor-count-number");
  const statCountEl = document.getElementById("happy-customer-stat");
  const headerBadge = document.getElementById("header-visitor-counter");
  onSnapshot(visitorRef, (snap) => {
    if (snap.exists()) {
      const count = snap.data().count || 0;
      const formatted = count.toLocaleString("en-US");
      if (countEl) countEl.textContent = formatted;
      if (statCountEl) statCountEl.textContent = `${formatted}+`;
      if (headerBadge) headerBadge.classList.remove("hidden");
    }
  }, () => {
  });
  try {
    if (!localStorage.getItem("macca_store_visited_v2")) {
      setDoc(visitorRef, { count: increment(1) }, { merge: true }).then(() => {
        localStorage.setItem("macca_store_visited_v2", "true");
      }).catch(() => {
      });
    }
  } catch (e) {
  }
}
var testimonialsData = [
  { name: "\u0645\u062D\u0645\u062F \u0623\u062D\u0645\u062F", text: "\u0627\u0634\u062A\u0631\u064A\u062A \u062F\u0647\u0627\u0646\u0627\u062A \u062C\u0648\u062A\u0646\u060C \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0637\u0644\u0639\u062A \u0632\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0628\u0627\u0644\u0638\u0628\u0637\u060C \u0648\u0641\u0631\u064A\u0642 \u0645\u0643\u0629 \u0633\u0627\u0639\u062F\u0646\u064A \u0627\u062E\u062A\u0627\u0631 \u0627\u0644\u062F\u0631\u062C\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629." },
  { name: "\u0633\u0627\u0631\u0629 \u0639\u0644\u064A", text: "\u062E\u062F\u0645\u0629 \u062A\u0631\u0643\u064A\u0628 \u0627\u0644\u062F\u0634 \u0645\u0645\u062A\u0627\u0632\u0629\u060C \u0627\u0644\u0641\u0646\u064A \u062C\u0647 \u0641\u064A \u0645\u064A\u0639\u0627\u062F\u0647 \u0648\u0638\u0628\u0637 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0628\u0633\u0631\u0639\u0629 \u0648\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629." },
  { name: "\u062E\u0627\u0644\u062F \u062D\u0633\u0646", text: "\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0639\u062F\u062F \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629 (\u0634\u0646\u064A\u0648\u0631 \u0648\u0635\u0627\u0631\u0648\u062E) \u0639\u0646\u062F\u0647\u0645 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0633\u0648\u0642\u060C \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0623\u0635\u0644\u064A\u0629 \u0628\u0636\u0645\u0627\u0646." },
  { name: "\u0645\u0646\u0649 \u0625\u0628\u0631\u0627\u0647\u064A\u0645", text: "\u062C\u0628\u062A \u0643\u0644 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0628\u0631\u0627\u064A\u0632 \u0644\u0634\u0642\u062A\u064A \u0627\u0644\u062C\u062F\u064A\u062F\u0629\u060C \u062A\u0634\u0643\u064A\u0644\u0629 \u0648\u0645\u0648\u062F\u064A\u0644\u0627\u062A \u0634\u064A\u0643 \u062C\u062F\u0627\u064B." },
  { name: "\u064A\u0648\u0633\u0641 \u0645\u062D\u0645\u0648\u062F", text: "\u0627\u062D\u062A\u062C\u062A \u062D\u062F\u0627\u064A\u062F \u0648\u0645\u0633\u0627\u0645\u064A\u0631 \u0644\u0634\u063A\u0644 \u0641\u064A \u0627\u0644\u0628\u064A\u062A\u060C \u0644\u0642\u064A\u062A \u0643\u0644 \u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A \u0627\u0644\u0644\u064A \u0639\u0627\u064A\u0632\u0647\u0627 \u0648\u0628\u0623\u0633\u0639\u0627\u0631 \u0645\u0645\u062A\u0627\u0632\u0629." },
  { name: "\u0631\u0627\u0646\u064A\u0627 \u0643\u0645\u0627\u0644", text: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0633\u0647\u0644 \u062C\u062F\u0627\u064B \u0641\u064A \u0627\u0644\u0637\u0644\u0628\u060C \u0637\u0644\u0628\u062A \u0644\u0645\u0628\u0627\u062A \u0644\u064A\u062F \u0648\u0648\u0635\u0644\u062A\u0646\u064A \u062A\u0627\u0646\u064A \u064A\u0648\u0645 \u0645\u0639 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u0645\u0645\u062A\u0627\u0632." }
];
function renderTestimonials() {
  const track = document.getElementById("testimonials-track");
  if (!track) return;
  const cards = testimonialsData.map((t) => `
        <div class="inline-block w-64 sm:w-80 p-5 mx-2 bg-white dark:bg-[#2c2f38] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 whitespace-normal align-top">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-[#ffcd00]/10 text-[#ffcd00] flex items-center justify-center font-bold">
                    ${t.name.charAt(0)}
                </div>
                <div>
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white">${t.name}</h4>
                    <div class="text-[#ffcd00] text-xs">\u2605\u2605\u2605\u2605\u2605</div>
                </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                "${t.text}"
            </p>
        </div>
    `).join("");
  track.innerHTML = cards + cards;
}
function initFAQ() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const header = item.querySelector(".faq-header");
    const content = item.querySelector(".faq-content");
    if (!header || !content) return;
    if (item.getAttribute("data-open") === "true") {
      content.style.maxHeight = content.scrollHeight + "px";
    }
    header.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      if (isOpen) {
        item.setAttribute("data-open", "false");
        content.style.maxHeight = null;
      } else {
        item.setAttribute("data-open", "true");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}
function initSearch() {
  const globalInput = document.getElementById("global-search-input");
  const productInput = document.getElementById("product-search-input");
  if (globalInput) {
    globalInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (productInput) productInput.value = val;
      if (document.getElementById("page-products")?.classList.contains("active")) {
        setPreFilterType("all");
        renderAllProductViews();
      } else if (val.length > 2) {
        window.location.hash = "#products";
        setTimeout(() => {
          setPreFilterType("all");
          renderAllProductViews();
        }, 50);
      }
    });
  }
  if (productInput && globalInput) {
    productInput.addEventListener("input", (e) => {
      globalInput.value = e.target.value;
      setPreFilterType("all");
      renderAllProductViews();
    });
  }
  document.getElementById("product-category-filter")?.addEventListener("change", () => {
    setPreFilterType("all");
    renderAllProductViews();
  });
  document.getElementById("product-brand-filter")?.addEventListener("change", () => {
    setPreFilterType("all");
    renderAllProductViews();
  });
  document.getElementById("product-sort-filter")?.addEventListener("change", () => {
    setPreFilterType("all");
    renderAllProductViews();
  });
  document.getElementById("product-min-price")?.addEventListener("input", () => {
    setPreFilterType("all");
    renderAllProductViews();
  });
  document.getElementById("product-max-price")?.addEventListener("input", () => {
    setPreFilterType("all");
    renderAllProductViews();
  });
}
function initMobileNavigation() {
  const deptBtn = document.getElementById("mobile-departments-btn");
  const deptMenu = document.getElementById("mobile-departments-menu");
  const deptIcon = document.getElementById("mobile-departments-icon");
  if (deptBtn && deptMenu) {
    deptBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = deptMenu.classList.toggle("hidden");
      if (deptIcon) deptIcon.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";
    });
    document.addEventListener("click", (e) => {
      if (!deptBtn.contains(e.target) && !deptMenu.contains(e.target)) {
        deptMenu.classList.add("hidden");
        if (deptIcon) deptIcon.style.transform = "rotate(0deg)";
      }
    });
    deptMenu.querySelectorAll(".mobile-dept-item").forEach((item) => {
      item.addEventListener("click", () => {
        deptMenu.classList.add("hidden");
        if (deptIcon) deptIcon.style.transform = "rotate(0deg)";
      });
    });
  }
  const drawerBtn = document.getElementById("mobile-menu-drawer-btn");
  const drawer = document.getElementById("mobile-side-drawer");
  const drawerOverlay = document.getElementById("mobile-drawer-overlay");
  const drawerCloseBtn = document.getElementById("mobile-drawer-close-btn");
  function openDrawer() {
    if (!drawer || !drawerOverlay) return;
    drawer.classList.add("is-open");
    drawerOverlay.classList.add("is-open");
    document.body.classList.add("overflow-hidden");
  }
  function closeDrawer() {
    if (!drawer || !drawerOverlay) return;
    drawer.classList.remove("is-open");
    drawerOverlay.classList.remove("is-open");
    document.body.classList.remove("overflow-hidden");
  }
  if (drawerBtn) drawerBtn.addEventListener("click", openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);
  document.querySelectorAll(".mobile-drawer-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });
  const topBtn = document.getElementById("scroll-to-top-btn");
  if (topBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        topBtn.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
        topBtn.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
      } else {
        topBtn.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
        topBtn.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
      }
    }, { passive: true });
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function initMobileSearchSheet() {
  const sheet = document.getElementById("mobile-search-sheet");
  const input = document.getElementById("mobile-search-input");
  const closeBtn = document.getElementById("close-mobile-search-btn");
  const clearBtn = document.getElementById("clear-mobile-search-btn");
  const listEl = document.getElementById("mobile-search-results-list");
  const countEl = document.getElementById("mobile-results-count");
  const viewAllLink = document.getElementById("mobile-view-all-results-link");
  const bottomBar = document.getElementById("mobile-bottom-nav");
  function openSearch() {
    if (!sheet) return;
    sheet.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    if (bottomBar) bottomBar.classList.add("hidden-keyboard");
    if (input) {
      setTimeout(() => input.focus(), 60);
      renderResults(input.value);
    }
  }
  function closeSearch() {
    if (!sheet) return;
    sheet.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    if (bottomBar) bottomBar.classList.remove("hidden-keyboard");
  }
  document.getElementById("mobile-search-trigger-btn")?.addEventListener("click", openSearch);
  document.getElementById("bottom-bar-search-btn")?.addEventListener("click", openSearch);
  closeBtn?.addEventListener("click", closeSearch);
  clearBtn?.addEventListener("click", () => {
    if (input) {
      input.value = "";
      input.focus();
      renderResults("");
    }
  });
  document.querySelectorAll(".search-tag-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const tag = pill.dataset.tag;
      if (input && tag) {
        input.value = tag;
        renderResults(tag);
      }
    });
  });
  input?.addEventListener("input", (e) => {
    renderResults(e.target.value);
  });
  function renderResults(query2) {
    if (!listEl) return;
    const q = (query2 || "").trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle("hidden", q.length === 0);
    }
    if (q.length === 0) {
      listEl.innerHTML = `
                <div class="text-center py-10 text-gray-400">
                    <i data-lucide="search" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>
                    <p class="text-xs font-bold">\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0623\u0648 \u0627\u0644\u0642\u0633\u0645 \u0644\u0644\u0628\u062D\u062B \u0627\u0644\u0641\u0648\u0631\u064A</p>
                </div>
            `;
      if (countEl) countEl.textContent = "\u0627\u0644\u0646\u062A\u0627\u0626\u062C";
      if (viewAllLink) viewAllLink.classList.add("hidden");
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    const products = getAllProducts();
    const matches = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const company = (p.company || "").toLowerCase();
      return name.includes(q) || category.includes(q) || desc.includes(q) || company.includes(q);
    });
    if (countEl) countEl.textContent = `${matches.length} \u0645\u0646\u062A\u062C`;
    if (viewAllLink) {
      viewAllLink.classList.remove("hidden");
      viewAllLink.onclick = () => {
        closeSearch();
        const globalInput = document.getElementById("global-search-input");
        const productInput = document.getElementById("product-search-input");
        if (globalInput) globalInput.value = query2;
        if (productInput) productInput.value = query2;
        window.location.hash = "#products";
        setPreFilterType("all");
        renderAllProductViews();
      };
    }
    if (matches.length === 0) {
      listEl.innerHTML = `
                <div class="text-center py-10 text-gray-400">
                    <i data-lucide="package-x" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>
                    <p class="text-xs font-bold">\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0640 "${escapeHTML(query2)}"</p>
                    <p class="text-[11px] text-gray-400 mt-1">\u062C\u0631\u0628 \u0643\u0644\u0645\u0627\u062A \u0623\u062E\u0631\u0649 \u0645\u062B\u0644 \u0644\u0645\u0628\u0627\u062A\u060C \u0643\u0627\u0628\u0644\u0627\u062A\u060C \u0623\u0648 \u0645\u0641\u0627\u062A\u064A\u062D</p>
                </div>
            `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    listEl.innerHTML = matches.slice(0, 15).map((p) => {
      const pIdentifier = p.shortId || p.id;
      const mainImg = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : p.imageUrl || "https://placehold.co/100x100/18181b/71717a?text=Macca";
      return `
                <div class="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#ffcd00]/40 transition-all">
                    <a href="#product/${pIdentifier}" class="mobile-search-item-link flex items-center gap-3 flex-grow min-w-0" data-product-id="${p.id}">
                        <img src="${mainImg}" alt="${escapeHTML(p.name)}" class="w-12 h-12 rounded-xl object-contain bg-white dark:bg-[#111] p-1 flex-shrink-0 shadow-sm" onerror="this.src='https://placehold.co/100x100/18181b/71717a?text=Macca'">
                        <div class="flex flex-col min-w-0">
                            <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">${escapeHTML(p.name)}</h5>
                            <div class="flex items-baseline gap-1 mt-0.5">
                                <span class="text-xs font-black text-[#ffcd00]">${parseFloat(p.price).toFixed(0)}</span>
                                <span class="text-[10px] text-gray-400">\u062C.\u0645</span>
                            </div>
                        </div>
                    </a>
                    <button class="mobile-quick-add-btn w-8 h-8 rounded-full bg-[#ffcd00] hover:bg-[#ffda33] active:scale-90 text-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform" data-product-id="${p.id}" title="\u0623\u0636\u0641 \u0644\u0644\u0633\u0644\u0629">
                        <i data-lucide="plus" class="w-4 h-4 stroke-[3]"></i>
                    </button>
                </div>
            `;
    }).join("");
    if (window.lucide) window.lucide.createIcons();
    listEl.querySelectorAll(".mobile-search-item-link").forEach((link) => {
      link.addEventListener("click", () => closeSearch());
    });
    listEl.querySelectorAll(".mobile-quick-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const pid = btn.dataset.productId;
        const p = products.find((item) => item.id === pid || item.shortId === pid);
        if (p) {
          addToCart(p, 1);
        }
      });
    });
  }
}
function initKeyboardSafeBottomBar() {
  const bottomBar = document.getElementById("mobile-bottom-nav");
  if (!bottomBar) return;
  if (window.visualViewport) {
    let initialHeight = window.visualViewport.height;
    window.visualViewport.addEventListener("resize", () => {
      if (window.visualViewport.height < initialHeight * 0.78) {
        bottomBar.classList.add("hidden-keyboard");
      } else {
        bottomBar.classList.remove("hidden-keyboard");
      }
    });
  }
  document.addEventListener("focusin", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
      bottomBar.classList.add("hidden-keyboard");
    }
  });
  document.addEventListener("focusout", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || !["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) {
          bottomBar.classList.remove("hidden-keyboard");
        }
      }, 100);
    }
  });
}
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll(".theme-toggle-btn, #mobile-theme-toggle-btn, #desktop-theme-toggle-btn");
  if (!toggleBtns.length) return;
  function applyTheme(isDark) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#000000");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      if (metaThemeColor) metaThemeColor.setAttribute("content", "#ffffff");
    }
    if (typeof updateActiveSiteLogo === "function") {
      updateActiveSiteLogo(isDark);
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      applyTheme(!isCurrentlyDark);
    });
  });
}
function initHowItWorksMobileSlider() {
  const track = document.getElementById("home-how-it-works-track");
  const dotsContainer = document.getElementById("home-how-it-works-dots");
  if (!track) return;
  const cards = track.querySelectorAll(".how-step-card");
  const totalSteps = cards.length;
  if (totalSteps <= 1) return;
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `how-step-dot ${i === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `\u0627\u0644\u062E\u0637\u0648\u0629 ${i + 1}`);
      dot.dataset.stepIndex = i;
      dotsContainer.appendChild(dot);
    }
  }
  let currentStep2 = 0;
  let autoplayTimer = null;
  let isUserInteracting = false;
  let resumeTimeout = null;
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
    currentStep2 = activeIdx;
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".how-step-dot");
      dots.forEach((dot, idx) => {
        if (idx === activeIdx) dot.classList.add("active");
        else dot.classList.remove("active");
      });
    }
  };
  track.addEventListener("scroll", () => {
    requestAnimationFrame(updateActiveDot);
  }, { passive: true });
  const scrollToStep = (idx) => {
    if (!cards[idx]) return;
    const trackRect = track.getBoundingClientRect();
    const cardRect = cards[idx].getBoundingClientRect();
    const diff = cardRect.left + cardRect.width / 2 - (trackRect.left + trackRect.width / 2);
    if (Math.abs(diff) > 2) {
      track.scrollBy({ left: diff, behavior: "smooth" });
    }
  };
  if (dotsContainer) {
    dotsContainer.addEventListener("click", (e) => {
      const dot = e.target.closest(".how-step-dot");
      if (!dot) return;
      const idx = parseInt(dot.dataset.stepIndex);
      scrollToStep(idx);
    });
  }
  const startAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      if (isUserInteracting || window.innerWidth >= 768) return;
      const trackRect = track.getBoundingClientRect();
      if (trackRect.bottom <= 50 || trackRect.top >= window.innerHeight - 50) return;
      const nextStep = (currentStep2 + 1) % totalSteps;
      scrollToStep(nextStep);
    }, 3500);
  };
  const pauseTemporarily = () => {
    isUserInteracting = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      isUserInteracting = false;
    }, 5e3);
  };
  track.addEventListener("touchstart", pauseTemporarily, { passive: true });
  track.addEventListener("touchmove", pauseTemporarily, { passive: true });
  track.addEventListener("pointerdown", pauseTemporarily, { passive: true });
  track.addEventListener("mouseenter", () => {
    isUserInteracting = true;
  });
  track.addEventListener("mouseleave", () => {
    isUserInteracting = false;
  });
  startAutoplay();
}
document.addEventListener("DOMContentLoaded", () => {
  try {
    initThemeToggle();
    if (typeof updateActiveSiteLogo === "function") updateActiveSiteLogo();
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
    document.querySelectorAll("[data-category-filter]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const cat = link.dataset.categoryFilter;
        const filterDropdown = document.getElementById("product-category-filter");
        if (filterDropdown && cat) {
          filterDropdown.value = cat;
          setPreFilterType("all");
          renderAllProductViews();
        }
      });
    });
    document.querySelectorAll(".see-all-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const type = link.dataset.filterType;
        if (type) {
          setPreFilterType(type);
          renderAllProductViews();
        }
      });
    });
    const addProductBtn = document.getElementById("show-add-product-modal-btn");
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => openProductModal());
    }
    const addArticleBtn = document.getElementById("show-add-article-modal-btn");
    if (addArticleBtn) {
      addArticleBtn.addEventListener("click", () => openArticleModal());
    }
    document.getElementById("close-add-product-modal-btn")?.addEventListener("click", () => {
      document.getElementById("add-product-modal")?.classList.add("hidden");
    });
    document.getElementById("cancel-add-product-btn")?.addEventListener("click", () => {
      document.getElementById("add-product-modal")?.classList.add("hidden");
    });
    document.getElementById("close-add-article-modal-btn")?.addEventListener("click", () => {
      document.getElementById("add-article-modal")?.classList.add("hidden");
    });
    document.getElementById("cancel-add-article-btn")?.addEventListener("click", () => {
      document.getElementById("add-article-modal")?.classList.add("hidden");
    });
    window.addEventListener("hashchange", handleRouting);
    loadProducts(() => {
      hideGlobalLoader();
    });
    loadArticles();
    handleRouting();
  } catch (err) {
    console.error("Initialization error:", err);
  } finally {
    setTimeout(hideGlobalLoader, 1500);
  }
});
export {
  hideGlobalLoader,
  initHowItWorksMobileSlider,
  initThemeToggle,
  showPage
};
