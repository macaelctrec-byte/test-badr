// ===============================================================
// إدارة إعدادات وسائل الدفع والشحن (Payment & Shipping Settings)
// ===============================================================

import { db, doc, onSnapshot, setDoc } from "./firebase-config.js";
import { isUserAdmin } from "./auth.js";
import { showToast } from "./utils.js";

// الإعدادات الافتراضية
const defaultSettings = {
    vodafoneCash: {
        phone: "01146641942",
        accountName: "متجر مكة للأدوات الكهربائية",
        enabled: true
    },
    instapay: {
        address: "01146641942",
        accountName: "متجر مكة للأدوات الكهربائية",
        enabled: true
    },
    shipping: {
        defaultFee: 45,
        freeThreshold: 1500
    }
};

let currentPaymentSettings = { ...defaultSettings };
const listeners = [];

/**
 * جلب الإعدادات الحالية المتزامنة
 */
export function getPaymentSettings() {
    return currentPaymentSettings;
}

/**
 * الاشتراك الحي مع إعدادات الدفع والشحن في فايرستور
 */
export function loadPaymentSettings(callback = null) {
    if (callback && typeof callback === 'function') {
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

        // إخطار المشتركين
        listeners.forEach(fn => {
            try { fn(currentPaymentSettings); } catch (e) { console.error("Payment setting listener error:", e); }
        });

        populateAdminPaymentSettingsForm();
    }, (err) => {
        console.warn("Could not load dynamic payment settings, using defaults:", err);
        if (callback) callback(currentPaymentSettings);
    });
}

/**
 * ملء مدخلات المشرف في لوحة التحكم
 */
function populateAdminPaymentSettingsForm() {
    const vfPhone = document.getElementById('setting-vf-phone');
    const vfName = document.getElementById('setting-vf-name');
    const vfActive = document.getElementById('setting-vf-active');

    const instaAddress = document.getElementById('setting-insta-address');
    const instaName = document.getElementById('setting-insta-name');
    const instaActive = document.getElementById('setting-insta-active');

    const shippingDefault = document.getElementById('setting-shipping-default');
    const shippingFree = document.getElementById('setting-shipping-free-threshold');

    if (vfPhone) vfPhone.value = currentPaymentSettings.vodafoneCash.phone;
    if (vfName) vfName.value = currentPaymentSettings.vodafoneCash.accountName;
    if (vfActive) vfActive.checked = currentPaymentSettings.vodafoneCash.enabled;

    if (instaAddress) instaAddress.value = currentPaymentSettings.instapay.address;
    if (instaName) instaName.value = currentPaymentSettings.instapay.accountName;
    if (instaActive) instaActive.checked = currentPaymentSettings.instapay.enabled;

    if (shippingDefault) shippingDefault.value = currentPaymentSettings.shipping.defaultFee;
    if (shippingFree) shippingFree.value = currentPaymentSettings.shipping.freeThreshold;
}

/**
 * تهيئة مستمع حفظ إعدادات الدفع من لوحة التحكم
 */
export function initPaymentSettingsAdmin() {
    const form = document.getElementById('admin-payment-settings-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isUserAdmin()) {
            showToast("يجب تسجيل الدخول كمسؤول لحفظ إعدادات الدفع.");
            return;
        }

        const submitBtn = document.getElementById('save-payment-settings-btn');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الحفظ...';

        try {
            const newConfig = {
                vodafoneCash: {
                    phone: document.getElementById('setting-vf-phone')?.value.trim() || defaultSettings.vodafoneCash.phone,
                    accountName: document.getElementById('setting-vf-name')?.value.trim() || defaultSettings.vodafoneCash.accountName,
                    enabled: document.getElementById('setting-vf-active')?.checked !== false
                },
                instapay: {
                    address: document.getElementById('setting-insta-address')?.value.trim() || defaultSettings.instapay.address,
                    accountName: document.getElementById('setting-insta-name')?.value.trim() || defaultSettings.instapay.accountName,
                    enabled: document.getElementById('setting-insta-active')?.checked !== false
                },
                shipping: {
                    defaultFee: Number(document.getElementById('setting-shipping-default')?.value) || 45,
                    freeThreshold: Number(document.getElementById('setting-shipping-free-threshold')?.value) || 1500
                }
            };

            await setDoc(doc(db, "config", "payments"), newConfig, { merge: true });
            showToast("تم حفظ إعدادات الدفع والشحن بنجاح وتحديثها في الموقع!");
        } catch (err) {
            console.error("Error saving payment settings:", err);
            showToast("خطأ أثناء حفظ إعدادات الدفع: " + (err.message || ""));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
}
