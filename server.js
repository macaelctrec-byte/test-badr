// ===============================================================
// متجر مكة للأدوات الكهربائية | خادم الويب وواجهة الـ Backend API
// Macca Store - Production Web Server & Telegram Bot Backend API
// ===============================================================

const http = require('http');
const https = require('https');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const url = require('url');

// إعطاء أولوية لـ IPv4 لتجنب بطء أو انقطاع استجابة تليجرام على نظام ويندوز
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const PORT = process.env.PORT || 3000;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'macaelctrec-f7795';

// تحميل إعدادات تليجرام وسرية الـ API
function getTelegramConfig() {
    let config = {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
        allowedChatIds: [],
        apiSecret: process.env.API_SECRET_KEY || 'macca_telegram_secret_key_2026',
        googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
        storeUrl: process.env.STORE_URL || 'https://macca3.shop'
    };

    const configPath = path.join(__dirname, 'telegram-config.json');
    if (fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, 'utf8');
            const fileCfg = JSON.parse(raw);
            config = { ...config, ...fileCfg };
        } catch (e) {
            console.warn('Warning: Could not parse telegram-config.json:', e.message);
        }
    }
    return config;
}

// ---------------------------------------------------------------
// أدوات Firestore REST API المدمجة (Zero Dependencies)
// ---------------------------------------------------------------

function fromFirestore(fields) {
    if (!fields) return {};
    const result = {};
    for (const [key, val] of Object.entries(fields)) {
        if ('stringValue' in val) result[key] = val.stringValue;
        else if ('integerValue' in val) result[key] = parseInt(val.integerValue, 10);
        else if ('doubleValue' in val) result[key] = parseFloat(val.doubleValue);
        else if ('booleanValue' in val) result[key] = val.booleanValue;
        else if ('timestampValue' in val) result[key] = val.timestampValue;
        else if ('mapValue' in val) result[key] = fromFirestore(val.mapValue.fields);
        else if ('arrayValue' in val) {
            result[key] = (val.arrayValue.values || []).map(v => {
                if ('mapValue' in v) return fromFirestore(v.mapValue.fields);
                if ('stringValue' in v) return v.stringValue;
                if ('integerValue' in v) return parseInt(v.integerValue, 10);
                if ('doubleValue' in v) return parseFloat(v.doubleValue);
                if ('booleanValue' in v) return v.booleanValue;
                return v;
            });
        } else if ('nullValue' in val) result[key] = null;
    }
    return result;
}

function toFirestore(obj) {
    const fields = {};
    for (const [key, val] of Object.entries(obj)) {
        if (val === null || val === undefined) {
            fields[key] = { nullValue: null };
        } else if (typeof val === 'string') {
            fields[key] = { stringValue: val };
        } else if (typeof val === 'number') {
            if (Number.isInteger(val)) fields[key] = { integerValue: val.toString() };
            else fields[key] = { doubleValue: val };
        } else if (typeof val === 'boolean') {
            fields[key] = { booleanValue: val };
        } else if (val instanceof Date) {
            fields[key] = { timestampValue: val.toISOString() };
        } else if (Array.isArray(val)) {
            fields[key] = {
                arrayValue: {
                    values: val.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return { mapValue: { fields: toFirestore(item) } };
                        }
                        if (typeof item === 'string') return { stringValue: item };
                        if (typeof item === 'number') return Number.isInteger(item) ? { integerValue: item.toString() } : { doubleValue: item };
                        if (typeof item === 'boolean') return { booleanValue: item };
                        return { nullValue: null };
                    })
                }
            };
        } else if (typeof val === 'object') {
            fields[key] = { mapValue: { fields: toFirestore(val) } };
        }
    }
    return fields;
}

// البحث عن طلب برقم الطلب (Order Number)
function findOrderByNumber(orderNumber) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            structuredQuery: {
                from: [{ collectionId: 'orders' }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: 'orderNumber' },
                        op: 'EQUAL',
                        value: { stringValue: orderNumber }
                    }
                },
                limit: 1
            }
        });

        const req = https.request(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (Array.isArray(json) && json[0]?.document) {
                        const doc = json[0].document;
                        const docId = doc.name.split('/').pop();
                        const parsed = fromFirestore(doc.fields);
                        resolve({ id: docId, docName: doc.name, ...parsed });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// جلب طلب بالـ Document ID
function getOrderById(docId) {
    return new Promise((resolve, reject) => {
        https.get(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${encodeURIComponent(docId)}`, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const doc = JSON.parse(data);
                        const id = doc.name.split('/').pop();
                        resolve({ id, docName: doc.name, ...fromFirestore(doc.fields) });
                    } catch (e) { reject(e); }
                } else {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

// تحديث حقول الطلب في Firestore باستخدام updateMask
function patchOrder(docId, fieldsToUpdate) {
    return new Promise((resolve, reject) => {
        const updateMaskParams = Object.keys(fieldsToUpdate)
            .map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k))
            .join('&');

        const postData = JSON.stringify({
            fields: toFirestore(fieldsToUpdate)
        });

        const req = https.request(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${encodeURIComponent(docId)}?${updateMaskParams}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const doc = JSON.parse(data);
                        resolve({ id: docId, ...fromFirestore(doc.fields) });
                    } catch (e) { reject(e); }
                } else {
                    reject(new Error(`Firestore error ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// تسجيل إجراء المشرف في سجل التدقيق (Audit Log)
function logAudit(orderNumber, action, adminUser, source, details = {}) {
    return new Promise((resolve) => {
        const auditDoc = {
            orderNumber: orderNumber || '',
            action: action || '',
            adminUser: adminUser || 'System',
            source: source || 'telegram',
            timestamp: new Date().toISOString(),
            details: details
        };

        const postData = JSON.stringify({
            fields: toFirestore(auditDoc)
        });

        const req = https.request(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/audit_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, res => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.write(postData);
        req.end();
    });
}

// ---------------------------------------------------------------
// دوال Telegram Bot API المباشرة
// ---------------------------------------------------------------

// دوال Telegram Bot API المباشرة
// ---------------------------------------------------------------

function callTelegram(method, payload, config) {
    return new Promise((resolve) => {
        if (!config || !config.botToken) return resolve({ ok: false, description: 'No botToken' });
        const postData = JSON.stringify(payload);
        const req = https.request(`https://api.telegram.org/bot${config.botToken}/${method}`, {
            method: 'POST',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(postData, 'utf8')
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve({ ok: false, error: data }); }
            });
        });
        req.on('error', (err) => resolve({ ok: false, error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
        req.write(postData);
        req.end();
    });
}

// تعديل رسالة تليجرام سواء كانت صورة أو نصية عادية
async function editTelegramMessage(chatId, messageId, text, replyMarkup, isPhoto, config) {
    if (!chatId || !messageId) return { ok: false };
    
    // إذا كانت الرسالة بها صورة، نقوم بتعديل الـ Caption
    if (isPhoto) {
        const captionRes = await callTelegram('editMessageCaption', {
            chat_id: chatId,
            message_id: messageId,
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        }, config);
        if (captionRes && captionRes.ok) return captionRes;
    }

    // تجربة تعديل النص
    const textRes = await callTelegram('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
    }, config);
    if (textRes && textRes.ok) return textRes;

    // محاولة بديلة إذا كان نوع الرسالة غير محدد
    if (!isPhoto) {
        return await callTelegram('editMessageCaption', {
            chat_id: chatId,
            message_id: messageId,
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup
        }, config);
    }
    return textRes;
}

// خريطة لتخزين الجلسات التفاعلية للمشرفين (كتابة ملاحظات الرفض والتسليم في رسائل)
const adminChatSessions = new Map();

// تنظيف النصوص لمنع أخطاء Markdown في تليجرام
function safeMarkdown(text) {
    if (!text) return '';
    return String(text).replace(/([_*`\[\]])/g, '');
}

// قائمة أسباب الرفض المحددة مسبقاً لمنع تجاوز حد 64 بايت لـ callback_data في تليجرام
const REJECT_REASONS = {
    '1': 'المبلغ المحول غير صحيح',
    '2': 'إثبات الدفع غير واضح أو مقصوص',
    '3': 'لم يتم استلام التحويل في الحساب',
    '4': 'بيانات التحويل غير مطابقة للطلب'
};

// معالجة كافة أحداث وتفاعلات تليجرام المباشرة
async function handleTelegramUpdate(update, config) {
    if (!update) return;

    if (update.callback_query) {
        const cq = update.callback_query;
        const cqId = cq.id;
        const chatId = cq.message ? cq.message.chat.id : config.adminChatId;
        const messageId = cq.message ? cq.message.message_id : null;
        const isPhoto = !!(cq.message && (cq.message.photo || cq.message.document));
        const parts = (cq.data || '').split(':');
        const action = parts[0];
        const orderNumber = parts[1];

        console.log(`[Telegram Bot] 🔔 زر تم الضغط عليه: ${action} | الطلب: #${orderNumber}`);

        try {
            if (action === 'confirm_pay') {
                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order && order.paymentStatus === 'paid') {
                    await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: 'ℹ️ الدفع مؤكد بالفعل لهذا الطلب.', show_alert: true }, config);
                    return;
                }

                if (order) {
                    const nowIso = new Date().toISOString();
                    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
                    history.push({
                        status: 'payment_confirmed',
                        title: 'تم اعتماد وتأكيد الدفع',
                        timestamp: nowIso,
                        updatedBy: 'Telegram Admin',
                        note: 'تم تأكيد الدفع عبر Telegram Bot.'
                    });
                    await patchOrder(order.id, {
                        paymentStatus: 'paid',
                        orderStatus: 'payment_confirmed',
                        statusHistory: history,
                        updatedAt: nowIso
                    });
                    await logAudit(order.orderNumber, 'confirm_payment', 'Telegram Admin', 'telegram', {
                        previousPaymentStatus: order.paymentStatus,
                        previousOrderStatus: order.orderStatus
                    });
                }

                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: '✅ تم تأكيد الدفع بنجاح!' }, config);

                const custName = order?.customer?.name || 'العميل';
                const totalText = order ? `\n💵 *المبلغ:* ${order.totalAmount} EGP` : '';
                const confirmText = 
                    `✅ *تم تأكيد الدفع بنجاح*\n` +
                    `━━━━━━━━━━━━━━━━\n\n` +
                    `📦 *Order:* \`#${orderNumber}\`\n` +
                    `👤 *العميل:* ${custName}${totalText}\n` +
                    `💳 *Payment:* PAID\n` +
                    `📊 *Status:* Payment Confirmed\n\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `📌 *الخطوة التالية:* ابدأ تجهيز الطلب في المخزن`;

                await editTelegramMessage(chatId, messageId, confirmText, {
                    inline_keyboard: [
                        [{ text: "📦 بدء تجهيز الطلب", callback_data: `advance_status:${orderNumber}:processing` }],
                        [
                            { text: "📝 إضافة ملاحظة للطلب", callback_data: `prompt_general_note:${orderNumber}` },
                            { text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }
                        ]
                    ]
                }, isPhoto, config);

            } else if (action === 'reject_prompt') {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: 'اختر سبب الرفض أو اكتب ملاحظة مخصصة' }, config);
                await callTelegram('editMessageReplyMarkup', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "❌ المبلغ غير صحيح", callback_data: `rej_r:${orderNumber}:1` }],
                            [{ text: "❌ إثبات الدفع غير واضح", callback_data: `rej_r:${orderNumber}:2` }],
                            [{ text: "❌ لم يتم استلام التحويل", callback_data: `rej_r:${orderNumber}:3` }],
                            [{ text: "❌ بيانات التحويل غير مطابقة", callback_data: `rej_r:${orderNumber}:4` }],
                            [{ text: "✍️ كتابة سبب / ملاحظة مخصصة", callback_data: `prompt_reject_note:${orderNumber}` }],
                            [{ text: "🔙 تراجع / إلغاء", callback_data: `cancel_reject:${orderNumber}` }]
                        ]
                    }
                }, config);

            } else if (action === 'prompt_reject_note') {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: '✏️ تم فتح خانة كتابة سبب الرفض' }, config);
                adminChatSessions.set(String(chatId), {
                    action: 'awaiting_reject_note',
                    orderNumber: orderNumber,
                    messageId: messageId,
                    isPhoto: isPhoto,
                    expiresAt: Date.now() + 15 * 60 * 1000
                });

                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: `⚠️ *طلب سبب رفض الدفع للطلب:* \`#${orderNumber}\`\n\n` +
                          `اكتب الآن سبب الرفض في الخانة المفتوحة بالأسفل (سيظهر للعميل في صفحة التتبع):\n\n` +
                          `📌 *أمثلة:*\n` +
                          `• التحويل واصل ناقص 45 جنيهاً\n` +
                          `• صورة الإيصال غير واضحة يرجى إعادة رفعها كاملة\n` +
                          `• رقم العملية غير موجود في كشف الحساب`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        force_reply: true,
                        input_field_placeholder: "اكتب سبب الرفض هنا..."
                    }
                }, config);

            } else if (action === 'prompt_delivery_note') {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: '✏️ تم فتح خانة ملاحظة التسليم' }, config);
                adminChatSessions.set(String(chatId), {
                    action: 'awaiting_delivery_note',
                    orderNumber: orderNumber,
                    messageId: messageId,
                    isPhoto: isPhoto,
                    expiresAt: Date.now() + 15 * 60 * 1000
                });

                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: `🚚 *توثيق ملاحظة تسليم الطلب:* \`#${orderNumber}\`\n\n` +
                          `اكتب الآن ملاحظة التسليم في الخانة المفتوحة بالأسفل لحفظها في سجل الطلب:\n\n` +
                          `📌 *أمثلة:*\n` +
                          `• تم الاستلام باليد من العميل شخصياً\n` +
                          `• تم تسليم الشحنة في الاستقبال مع حارس العقار\n` +
                          `• تم تحصيل 400 جنيهاً نقداً بنجاح`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        force_reply: true,
                        input_field_placeholder: "اكتب ملاحظة التسليم هنا..."
                    }
                }, config);

            } else if (action === 'prompt_general_note') {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: '✏️ تم فتح خانة إضافة الملاحظة' }, config);
                adminChatSessions.set(String(chatId), {
                    action: 'awaiting_general_note',
                    orderNumber: orderNumber,
                    messageId: messageId,
                    isPhoto: isPhoto,
                    expiresAt: Date.now() + 15 * 60 * 1000
                });

                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: `📝 *إضافة ملاحظة على الطلب:* \`#${orderNumber}\`\n\n` +
                          `اكتب الآن أي ملاحظة تريد توثيقها في سجل هذا الطلب في الخانة بالأسفل:\n\n` +
                          `📌 *أمثلة:*\n` +
                          `• تم التواصل هاتفياً مع العميل وتأكيد المقاس\n` +
                          `• المندوب خرج للتوصيل ومعاد الوصول خلال ساعتين`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        force_reply: true,
                        input_field_placeholder: "اكتب ملاحظتك هنا..."
                    }
                }, config);

            } else if (action === 'cancel_reject') {
                adminChatSessions.delete(String(chatId));
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: 'تم التراجع' }, config);
                await callTelegram('editMessageReplyMarkup', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "✅ تأكيد الدفع", callback_data: `confirm_pay:${orderNumber}` },
                                { text: "❌ رفض الدفع", callback_data: `reject_prompt:${orderNumber}` }
                            ],
                            [
                                { text: "📦 بدء تجهيز الطلب", callback_data: `advance_status:${orderNumber}:processing` },
                                { text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }
                            ]
                        ]
                    }
                }, config);

            } else if (action === 'reject_reason' || action === 'rej_r') {
                const codeOrText = parts.slice(2).join(':') || '1';
                const reason = REJECT_REASONS[codeOrText] || codeOrText || 'إثبات الدفع غير مطابق';
                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order) {
                    const nowIso = new Date().toISOString();
                    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
                    history.push({
                        status: 'payment_rejected',
                        title: 'تم رفض إثبات التحويل',
                        timestamp: nowIso,
                        updatedBy: 'Telegram Admin',
                        note: reason
                    });
                    await patchOrder(order.id, {
                        paymentStatus: 'rejected',
                        orderStatus: 'payment_rejected',
                        rejectionReason: reason,
                        statusHistory: history,
                        updatedAt: nowIso
                    });
                    await logAudit(order.orderNumber, 'reject_payment', 'Telegram Admin', 'telegram', {
                        reason,
                        previousPaymentStatus: order.paymentStatus
                    });
                }

                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: '❌ تم رفض إثبات الدفع' }, config);

                const custName = order?.customer?.name || 'العميل';
                const rejectText = 
                    `❌ *تم رفض الدفع*\n` +
                    `━━━━━━━━━━━━━━━━\n\n` +
                    `📦 *Order:* \`#${orderNumber}\`\n` +
                    `👤 *العميل:* ${custName}\n` +
                    `⚠️ *سبب الرفض:* ${reason}\n` +
                    `💳 *Payment:* Rejected\n\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `ℹ️ سيظهر سبب الرفض للعميل في شاشة التتبع لإعادة الرفع.`;

                await editTelegramMessage(chatId, messageId, rejectText, {
                    inline_keyboard: [
                        [{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }],
                        [{ text: "♻️ إعادة قبول وتأكيد الدفع", callback_data: `confirm_pay:${orderNumber}` }]
                    ]
                }, isPhoto, config);

            } else if (action === 'advance_status') {
                const newStatus = parts[2];
                const statusTitles = {
                    'processing': 'جاري تجهيز الطلب في المخزن',
                    'ready_to_ship': 'تم تجهيز الطلب للشحن',
                    'shipped': 'خرج للتوصيل مع مندوب الشحن',
                    'delivered': 'تم التسليم بنجاح'
                };

                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order) {
                    const nowIso = new Date().toISOString();
                    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
                    history.push({
                        status: newStatus,
                        title: statusTitles[newStatus] || newStatus,
                        timestamp: nowIso,
                        updatedBy: 'Telegram Admin',
                        note: `تم التحديث إلى ${statusTitles[newStatus] || newStatus}.`
                    });
                    await patchOrder(order.id, {
                        orderStatus: newStatus,
                        statusHistory: history,
                        updatedAt: nowIso
                    });
                    await logAudit(order.orderNumber, 'advance_status', 'Telegram Admin', 'telegram', {
                        newStatus,
                        previousOrderStatus: order.orderStatus
                    });
                }

                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: `📦 ${statusTitles[newStatus] || newStatus}` }, config);

                let nextBtn = null;
                if (newStatus === 'processing') nextBtn = [{ text: "📦 تم تجهيز الطلب للشحن", callback_data: `advance_status:${orderNumber}:ready_to_ship` }];
                if (newStatus === 'ready_to_ship') nextBtn = [{ text: "🚚 تم الشحن مع المندوب", callback_data: `advance_status:${orderNumber}:shipped` }];
                if (newStatus === 'shipped') nextBtn = [
                    { text: "🚀 تسليم فوري", callback_data: `advance_status:${orderNumber}:delivered` },
                    { text: "✍️ تسليم مع ملاحظة", callback_data: `prompt_delivery_note:${orderNumber}` }
                ];

                const rows = [];
                if (nextBtn) rows.push(nextBtn);
                if (newStatus !== 'delivered') {
                    rows.push([
                        { text: "📝 إضافة ملاحظة للطلب", callback_data: `prompt_general_note:${orderNumber}` },
                        { text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }
                    ]);
                } else {
                    rows.push([{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }]);
                }

                const advanceText = 
                    `📦 *تحديث حالة الطلب*\n` +
                    `━━━━━━━━━━━━━━━━\n\n` +
                    `📦 *Order:* \`#${orderNumber}\`\n` +
                    `📊 *الحالة الحالية:* *${statusTitles[newStatus] || newStatus}*\n` +
                    `🕒 *التوقيت:* ${new Date().toLocaleTimeString('ar-EG')}\n\n` +
                    `━━━━━━━━━━━━━━━━`;

                await editTelegramMessage(chatId, messageId, advanceText, { inline_keyboard: rows }, isPhoto, config);

            } else if (action === 'order_details') {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: 'جاري جلب التفاصيل...' }, config);

                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order) {
                    const o = order;
                    const itemsText = (o.items || []).map(i => `• ${i.name} (${i.quantity} × ${i.price} EGP)`).join('\n') || 'لا توجد منتجات مسجلة';
                    const detailsText = 
                        `📋 *تفاصيل الطلب:* \`#${o.orderNumber}\`\n` +
                        `━━━━━━━━━━━━━━━━\n` +
                        `👤 *الاسم:* ${o.customer?.name || '-'}\n` +
                        `📱 *الهاتف:* \`${o.customer?.phone || '-'}\`\n` +
                        `🏠 *العنوان:* ${o.customer?.governorate || ''} - ${o.customer?.city || ''} ${o.customer?.address || ''}\n\n` +
                        `🛒 *المنتجات:*\n${itemsText}\n\n` +
                        `💵 *الإجمالي النهائي:* *${o.totalAmount || 0} EGP*\n` +
                        `💳 *طريقة الدفع:* ${o.paymentMethod || '-'}\n` +
                        `📊 *حالة الطلب:* ${o.orderStatus || '-'}\n` +
                        `💳 *حالة الدفع:* ${o.paymentStatus || '-'}\n` +
                        `━━━━━━━━━━━━━━━━`;

                    await callTelegram('sendMessage', {
                        chat_id: chatId,
                        text: detailsText,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [[{ text: "🌐 فتح الطلب في لوحة التحكم", url: config.storeUrl + "/#admin-orders" }]]
                        }
                    }, config);
                } else {
                    await callTelegram('sendMessage', {
                        chat_id: chatId,
                        text: `📋 *تفاصيل الطلب:* \`#${orderNumber}\` (طلب تجريبي)\n━━━━━━━━━━━━━━━━\n👤 العميل: تجريبي\n💵 الإجمالي: 625 EGP\n💳 الدفع: مدفوع`,
                        parse_mode: 'Markdown'
                    }, config);
                }
            } else {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: 'تم استلام الإجراء بنجاح' }, config);
            }
        } catch (err) {
            console.error('[Telegram Bot] Callback query handling error:', err);
            try {
                await callTelegram('answerCallbackQuery', { callback_query_id: cqId, text: '⚠️ حدث خطأ في معالجة الإجراء: ' + err.message, show_alert: true }, config);
            } catch (_) {}
        }
    }

    // معالجة الرسائل النصية المباشرة من المشرف (تسجيل الملاحظات المخصصة)
    if (update.message && update.message.text) {
        const msg = update.message;
        const chatId = String(msg.chat.id);
        const text = msg.text.trim();
        const fromId = String(msg.from?.id || chatId);

        // التحقق من أن المرسل مشرف معتمد
        const targetAdmin = String(config.adminChatId || '');
        const allowedChats = (config.allowedChatIds || []).map(String);
        const isAuthorized = !targetAdmin || fromId === targetAdmin || chatId === targetAdmin || allowedChats.includes(chatId);

        if (!isAuthorized) {
            console.log(`[Telegram Bot] تجاهل رسالة من مستخدم غير مصرح: ${fromId}`);
            return;
        }

        const session = adminChatSessions.get(chatId);

        // إلغاء الجلسة عند كتابة أمر إلغاء
        if (text === '/cancel' || text === 'تراجع' || text === 'إلغاء' || text === 'الغاء') {
            if (session) {
                adminChatSessions.delete(chatId);
                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: '✅ تم إلغاء كتابة الملاحظة بنجاح.'
                }, config);
            }
            return;
        }

        if (session && session.expiresAt > Date.now()) {
            adminChatSessions.delete(chatId);
            const orderNumber = session.orderNumber;
            const nowIso = new Date().toISOString();

            if (session.action === 'awaiting_reject_note') {
                const rejectReason = text;
                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order) {
                    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
                    history.push({
                        status: 'payment_rejected',
                        title: 'تم رفض إثبات التحويل',
                        timestamp: nowIso,
                        updatedBy: 'Telegram Admin',
                        note: rejectReason
                    });
                    await patchOrder(order.id, {
                        paymentStatus: 'rejected',
                        orderStatus: 'payment_rejected',
                        rejectionReason: rejectReason,
                        statusHistory: history,
                        updatedAt: nowIso
                    });
                    await logAudit(order.orderNumber, 'reject_payment', 'Telegram Admin', 'telegram', {
                        reason: rejectReason,
                        previousPaymentStatus: order.paymentStatus
                    });
                }

                // إشعار تأكيد حفظ سبب الرفض
                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: `❌ *تم تسجيل رفض الدفع للطلب:* \`#${orderNumber}\`\n━━━━━━━━━━━━━━━━\n\n` +
                          `📝 *السبب المسجل للعميل:*\n${safeMarkdown(rejectReason)}\n\n` +
                          `ℹ️ تم تحديث حالة الطلب فوراً وسيظهر هذا السبب للعميل في صفحة التتبع لإعادة رفع الإثبات.`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }],
                            [{ text: "♻️ إعادة قبول وتأكيد الدفع", callback_data: `confirm_pay:${orderNumber}` }]
                        ]
                    }
                }, config);

                // تعديل الرسالة الأصلية
                if (session.messageId) {
                    const rejectText = 
                        `❌ *تم رفض الدفع*\n` +
                        `━━━━━━━━━━━━━━━━\n\n` +
                        `📦 *Order:* \`#${orderNumber}\`\n` +
                        `⚠️ *سبب الرفض:* ${safeMarkdown(rejectReason)}\n` +
                        `💳 *Payment:* Rejected\n\n` +
                        `━━━━━━━━━━━━━━━━\n` +
                        `ℹ️ تم توثيق الملاحظة في سجل الطلب وشاشة التتبع.`;

                    await editTelegramMessage(chatId, session.messageId, rejectText, {
                        inline_keyboard: [
                            [{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }],
                            [{ text: "♻️ إعادة قبول وتأكيد الدفع", callback_data: `confirm_pay:${orderNumber}` }]
                        ]
                    }, session.isPhoto, config);
                }

            } else if (session.action === 'awaiting_delivery_note') {
                const deliveryNote = text;
                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order) {
                    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
                    history.push({
                        status: 'delivered',
                        title: 'تم تسليم الطلب بنجاح',
                        timestamp: nowIso,
                        updatedBy: 'Telegram Admin',
                        note: deliveryNote
                    });
                    await patchOrder(order.id, {
                        orderStatus: 'delivered',
                        deliveryNotes: deliveryNote,
                        statusHistory: history,
                        updatedAt: nowIso
                    });
                    await logAudit(order.orderNumber, 'advance_status', 'Telegram Admin', 'telegram', {
                        newStatus: 'delivered',
                        note: deliveryNote,
                        previousOrderStatus: order.orderStatus
                    });
                }

                // إشعار تأكيد حفظ ملاحظة التسليم
                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: `✅ *تم توثيق تسليم الطلب بنجاح!*\n━━━━━━━━━━━━━━━━\n\n` +
                          `📦 *الطلب:* \`#${orderNumber}\`\n` +
                          `📊 *الحالة:* *تم التسليم بنجاح (Delivered)*\n` +
                          `📝 *ملاحظة التسليم:* ${safeMarkdown(deliveryNote)}\n\n` +
                          `━━━━━━━━━━━━━━━━\n` +
                          `ℹ️ تم تحديث شاشة تتبع العميل ولوحة الإدارة فوراً.`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }]]
                    }
                }, config);

                // تعديل الرسالة الأصلية
                if (session.messageId) {
                    const deliveredText = 
                        `📦 *اكتمل تسليم الطلب بنجاح*\n` +
                        `━━━━━━━━━━━━━━━━\n\n` +
                        `📦 *Order:* \`#${orderNumber}\`\n` +
                        `📊 *الحالة:* *تم التسليم بنجاح*\n` +
                        `📝 *ملاحظة التسليم:* ${safeMarkdown(deliveryNote)}\n` +
                        `🕒 *الوقت:* ${new Date().toLocaleTimeString('ar-EG')}\n\n` +
                        `━━━━━━━━━━━━━━━━`;

                    await editTelegramMessage(chatId, session.messageId, deliveredText, {
                        inline_keyboard: [[{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }]]
                    }, session.isPhoto, config);
                }
            } else if (session.action === 'awaiting_general_note') {
                const noteText = text;
                let order = await findOrderByNumber(orderNumber);
                if (!order) order = await getOrderById(orderNumber);

                if (order) {
                    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
                    history.push({
                        status: order.orderStatus || 'in_progress',
                        title: 'ملاحظة إدارية إضافية',
                        timestamp: nowIso,
                        updatedBy: 'Telegram Admin',
                        note: noteText
                    });
                    await patchOrder(order.id, {
                        adminNotes: noteText,
                        statusHistory: history,
                        updatedAt: nowIso
                    });
                    await logAudit(order.orderNumber, 'add_note', 'Telegram Admin', 'telegram', {
                        note: noteText
                    });
                }

                // إشعار تأكيد حفظ الملاحظة العامة
                await callTelegram('sendMessage', {
                    chat_id: chatId,
                    text: `✅ *تم توثيق الملاحظة بنجاح!*\n━━━━━━━━━━━━━━━━\n\n` +
                          `📦 *الطلب:* \`#${orderNumber}\`\n` +
                          `📝 *الملاحظة المسجلة:*\n${safeMarkdown(noteText)}\n\n` +
                          `━━━━━━━━━━━━━━━━\n` +
                          `ℹ️ تم حفظها في سجل الطلب وستظهر في شاشة تتبع العميل ولوحة الإدارة.`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: "📋 تفاصيل الطلب", callback_data: `order_details:${orderNumber}` }]]
                    }
                }, config);
            }
        }
    }
}

// خدمة الاستماع اللحظي للضغطات عبر Telegram Long Polling
let isPollingActive = false;
let currentPollingOffset = 0;

async function startTelegramPoller(config) {
    if (isPollingActive) return;
    if (!config || !config.botToken) {
        console.log('[Telegram Bot] ⚠️ لا يوجد Bot Token مسجل، تم تخطي تشغيل المراقبة.');
        return;
    }
    isPollingActive = true;
    console.log('[Telegram Bot] 🚀 تم بدء خدمة الاستماع اللحظي للأزرار (Real-time Polling)...');

    // مسح الـ Webhook حتى يسمح تليجرام لـ getUpdates بالعمل بسلاسة
    try {
        await callTelegram('deleteWebhook', { drop_pending_updates: false }, config);
    } catch (e) {
        console.warn('[Telegram Bot] Could not delete webhook:', e.message);
    }

    // حلقة الاستماع المستمرة
    while (isPollingActive) {
        try {
            const payload = {
                offset: currentPollingOffset,
                limit: 20
            };
            const postData = JSON.stringify(payload);

            const updates = await new Promise((resolve) => {
                const req = https.request(`https://api.telegram.org/bot${config.botToken}/getUpdates`, {
                    method: 'POST',
                    timeout: 8000,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Content-Length': Buffer.byteLength(postData, 'utf8')
                    }
                }, res => {
                    let d = '';
                    res.on('data', c => d += c);
                    res.on('end', () => {
                        try { resolve(JSON.parse(d)); } catch (e) { resolve(null); }
                    });
                });
                req.on('error', () => resolve(null));
                req.on('timeout', () => { req.destroy(); resolve(null); });
                req.write(postData);
                req.end();
            });

            if (updates && updates.ok && Array.isArray(updates.result) && updates.result.length > 0) {
                for (const update of updates.result) {
                    currentPollingOffset = Math.max(currentPollingOffset, update.update_id + 1);
                    handleTelegramUpdate(update, config).catch(e => {
                        console.error('[Telegram Bot] Error in update processing:', e);
                    });
                }
            } else {
                // مهلة هادئة لمدة 1.5 ثانية عند عدم وجود أحداث جديدة
                await new Promise(r => setTimeout(r, 1500));
            }
        } catch (loopErr) {
            console.error('[Telegram Bot] Polling loop error:', loopErr.message);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

// إرسال إشعار تليجرام للطلب الجديد
async function sendNewOrderTelegramNotification(order, config) {
    // 1. إذا كان رابط Google Apps Script مفعلاً، نرسل إليه (سحابي وغير محجوب)
    if (config.googleAppsScriptUrl) {
        try {
            const gasPayload = JSON.stringify({ action: 'notify_new_order', order });
            const parsedGasUrl = new URL(config.googleAppsScriptUrl);
            const gasReq = https.request(parsedGasUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': Buffer.byteLength(gasPayload, 'utf8')
                }
            }, gasRes => {
                gasRes.resume(); // consume response stream
            });
            gasReq.on('error', err => console.error('GAS dispatch error:', err.message));
            gasReq.write(gasPayload);
            gasReq.end();
        } catch (err) {
            console.error('Error forwarding to Google Apps Script:', err.message);
        }
    }

    // 2. إذا كان توكن تليجرام المباشر موجوداً، نرسل مباشرة
    if (config.botToken && config.adminChatId) {
        const itemsText = (order.items || []).map(item => {
            return `• ${item.name} × ${item.quantity} (${(item.price * item.quantity).toFixed(0)} EGP)`;
        }).join('\n');

        const methodMap = {
            'vodafone_cash': 'Vodafone Cash (محفظة كاش)',
            'instapay': 'InstaPay (إنستاباي)',
            'orange_cash': 'Orange Cash',
            'etisalat_cash': 'Etisalat Cash',
            'we_pay': 'WE Pay'
        };
        const payMethod = methodMap[order.paymentMethod] || order.paymentMethod || 'تحويل إلكتروني';

        const messageText = 
            `🛍️ *طلب جديد يحتاج مراجعة*\n` +
            `━━━━━━━━━━━━━━━━\n\n` +
            `📦 *Order:*\n` +
            `\`#${order.orderNumber}\`\n\n` +
            `👤 *العميل:*\n` +
            `${order.customer?.name || 'غير محدد'}\n\n` +
            `📱 *الهاتف:*\n` +
            `\`${order.customer?.phone || 'غير محدد'}\`\n\n` +
            `📍 *العنوان:*\n` +
            `${order.customer?.governorate || ''} - ${order.customer?.city || ''} ${order.customer?.address || ''}\n` +
            `\n━━━━━━━━━━━━━━━━\n\n` +
            `🛒 *المنتجات:*\n` +
            `${itemsText}\n\n` +
            `💰 *Subtotal:* ${parseFloat(order.subtotal || 0).toFixed(0)} EGP\n` +
            `🚚 *Shipping:* ${parseFloat(order.shippingFee || 0).toFixed(0)} EGP\n` +
            `💵 *Total:* *${parseFloat(order.totalAmount || 0).toFixed(0)} EGP*\n\n` +
            `━━━━━━━━━━━━━━━━\n\n` +
            `💳 *طريقة الدفع:* ${payMethod}\n` +
            `💰 *المبلغ المطلوب:* ${parseFloat(order.totalAmount || 0).toFixed(0)} EGP\n` +
            `📸 *إثبات الدفع:* مرفق / مسجل بالنظام\n` +
            `⏳ *Payment Status:* Pending Review`;

        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: "✅ تأكيد الدفع", callback_data: "confirm_pay:" + order.orderNumber },
                    { text: "❌ رفض الدفع", callback_data: "reject_prompt:" + order.orderNumber }
                ],
                [
                    { text: "📝 إضافة ملاحظة", callback_data: "prompt_general_note:" + order.orderNumber },
                    { text: "📋 تفاصيل الطلب", callback_data: "order_details:" + order.orderNumber }
                ]
            ]
        };

        const targetChats = [config.adminChatId, ...(config.allowedChatIds || [])].filter(Boolean);
        for (const chatId of targetChats) {
            await callTelegram('sendMessage', {
                chat_id: chatId,
                text: messageText,
                parse_mode: 'Markdown',
                reply_markup: replyMarkup
            }, config);
        }
    }
}

// ---------------------------------------------------------------
// خادم الـ HTTP والـ Routing
// ---------------------------------------------------------------

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.mjs': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.xml': 'application/xml',
    '.txt': 'text/plain'
};

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret'
    });
    res.end(JSON.stringify(data));
}

function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(body || '{}')); }
            catch (e) { resolve({}); }
        });
    });
}

const server = http.createServer(async (req, res) => {
    // إتاحة طلبات CORS Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const config = getTelegramConfig();

    // -----------------------------------------------------------
    // 1. Backend API Routes
    // -----------------------------------------------------------

    // فحص سلامة الخادم (Health Check)
    if (pathname === '/api/health') {
        sendJSON(res, 200, {
            status: 'ok',
            uptime: process.uptime(),
            telegramConfigured: Boolean(config.botToken || config.googleAppsScriptUrl),
            timestamp: new Date().toISOString()
        });
        return;
    }

    // إشعار بطلب جديد وارد من المتجر
    if (pathname === '/api/orders/notify-new-order' && req.method === 'POST') {
        const body = await parseBody(req);
        const order = body.order || body;

        if (!order || !order.orderNumber) {
            sendJSON(res, 400, { success: false, message: 'Missing order data' });
            return;
        }

        sendNewOrderTelegramNotification(order, config).catch(console.error);
        sendJSON(res, 200, { success: true, message: 'Order notification dispatched' });
        return;
    }

    // المزامنة العكسية من لوحة الإدارة
    if (pathname === '/api/orders/reverse-sync' && req.method === 'POST') {
        const body = await parseBody(req);
        if (config.googleAppsScriptUrl) {
            try {
                const parsedGasUrl = url.parse(config.googleAppsScriptUrl);
                const gasReq = https.request({
                    hostname: parsedGasUrl.hostname,
                    path: parsedGasUrl.path,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                gasReq.write(JSON.stringify({ action: 'reverse_sync', ...body }));
                gasReq.end();
            } catch (err) {
                console.error('Error forwarding reverse sync:', err.message);
            }
        }
        sendJSON(res, 200, { success: true });
        return;
    }

    // تأكيد الدفع (Confirm Payment)
    const confirmMatch = pathname.match(/^\/api\/admin\/orders\/([^\/]+)\/confirm-payment$/);
    if (confirmMatch && req.method === 'POST') {
        const orderIdentifier = decodeURIComponent(confirmMatch[1]);
        const body = await parseBody(req);

        try {
            let order = await findOrderByNumber(orderIdentifier);
            if (!order) order = await getOrderById(orderIdentifier);

            if (!order) {
                sendJSON(res, 404, { success: false, message: `Order ${orderIdentifier} not found` });
                return;
            }

            // حماية التكرار (Idempotency)
            if (order.paymentStatus === 'paid') {
                sendJSON(res, 200, { 
                    success: false, 
                    alreadyPaid: true, 
                    message: 'ℹ️ الدفع مؤكد بالفعل لهذا الطلب.',
                    order
                });
                return;
            }

            const nowIso = new Date().toISOString();
            const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
            history.push({
                status: 'payment_confirmed',
                title: 'تم اعتماد وتأكيد الدفع',
                timestamp: nowIso,
                updatedBy: body.adminUser || 'Telegram Admin',
                note: 'تمت مراجعة سكرين شوت التحويل وتأكيد الدفع بنجاح عبر Telegram.'
            });

            const updated = await patchOrder(order.id, {
                paymentStatus: 'paid',
                orderStatus: 'payment_confirmed',
                statusHistory: history,
                updatedAt: nowIso
            });

            await logAudit(order.orderNumber, 'confirm_payment', body.adminUser || 'Telegram Admin', body.source || 'telegram', {
                previousPaymentStatus: order.paymentStatus,
                previousOrderStatus: order.orderStatus
            });

            sendJSON(res, 200, { success: true, order: updated });
        } catch (err) {
            console.error('Error confirming payment:', err);
            sendJSON(res, 500, { success: false, message: err.message });
        }
        return;
    }

    // رفض الدفع (Reject Payment)
    const rejectMatch = pathname.match(/^\/api\/admin\/orders\/([^\/]+)\/reject-payment$/);
    if (rejectMatch && req.method === 'POST') {
        const orderIdentifier = decodeURIComponent(rejectMatch[1]);
        const body = await parseBody(req);
        const reason = body.reason || 'إثبات الدفع غير واضح أو المبلغ غير مطابق';

        try {
            let order = await findOrderByNumber(orderIdentifier);
            if (!order) order = await getOrderById(orderIdentifier);

            if (!order) {
                sendJSON(res, 404, { success: false, message: `Order ${orderIdentifier} not found` });
                return;
            }

            const nowIso = new Date().toISOString();
            const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
            history.push({
                status: 'payment_rejected',
                title: 'تم رفض إثبات التحويل',
                timestamp: nowIso,
                updatedBy: body.adminUser || 'Telegram Admin',
                note: reason
            });

            const updated = await patchOrder(order.id, {
                paymentStatus: 'rejected',
                orderStatus: 'payment_rejected',
                rejectionReason: reason,
                statusHistory: history,
                updatedAt: nowIso
            });

            await logAudit(order.orderNumber, 'reject_payment', body.adminUser || 'Telegram Admin', body.source || 'telegram', {
                reason,
                previousPaymentStatus: order.paymentStatus
            });

            sendJSON(res, 200, { success: true, order: updated });
        } catch (err) {
            console.error('Error rejecting payment:', err);
            sendJSON(res, 500, { success: false, message: err.message });
        }
        return;
    }

    // تقدم حالة الطلب (Order Status Transition)
    const statusMatch = pathname.match(/^\/api\/admin\/orders\/([^\/]+)\/status$/);
    if (statusMatch && req.method === 'POST') {
        const orderIdentifier = decodeURIComponent(statusMatch[1]);
        const body = await parseBody(req);
        const newStatus = body.status;

        const statusTitles = {
            'processing': 'جاري تجهيز الطلب في المخزن',
            'ready_to_ship': 'تم تجهيز الطلب للشحن',
            'shipped': 'خرج الطلب للتوصيل مع شركة الشحن',
            'delivered': 'تم تسليم الطلب للعميل بنجاح'
        };

        if (!statusTitles[newStatus]) {
            sendJSON(res, 400, { success: false, message: `Invalid status: ${newStatus}` });
            return;
        }

        try {
            let order = await findOrderByNumber(orderIdentifier);
            if (!order) order = await getOrderById(orderIdentifier);

            if (!order) {
                sendJSON(res, 404, { success: false, message: `Order ${orderIdentifier} not found` });
                return;
            }

            const nowIso = new Date().toISOString();
            const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
            history.push({
                status: newStatus,
                title: statusTitles[newStatus],
                timestamp: nowIso,
                updatedBy: body.adminUser || 'Telegram Admin',
                note: `تم تحديث مرحلة الطلب إلى "${statusTitles[newStatus]}".`
            });

            const updated = await patchOrder(order.id, {
                orderStatus: newStatus,
                statusHistory: history,
                updatedAt: nowIso
            });

            await logAudit(order.orderNumber, 'advance_status', body.adminUser || 'Telegram Admin', body.source || 'telegram', {
                newStatus,
                previousOrderStatus: order.orderStatus
            });

            sendJSON(res, 200, { success: true, order: updated });
        } catch (err) {
            console.error('Error updating order status:', err);
            sendJSON(res, 500, { success: false, message: err.message });
        }
        return;
    }

    // تفاصيل الطلب (Order Details)
    const detailsMatch = pathname.match(/^\/api\/admin\/orders\/([^\/]+)$/);
    if (detailsMatch && req.method === 'GET') {
        const orderIdentifier = decodeURIComponent(detailsMatch[1]);
        try {
            let order = await findOrderByNumber(orderIdentifier);
            if (!order) order = await getOrderById(orderIdentifier);

            if (!order) {
                sendJSON(res, 404, { success: false, message: 'Order not found' });
                return;
            }
            sendJSON(res, 200, { success: true, order });
        } catch (err) {
            sendJSON(res, 500, { success: false, message: err.message });
        }
        return;
    }

    // معالج Telegram Webhook المباشر (عند استخدامه مباشرة بدون Google Apps Script)
    if (pathname === '/api/telegram/webhook' && req.method === 'POST') {
        try {
            const update = await parseBody(req);
            await handleTelegramUpdate(update, config);
            sendJSON(res, 200, { ok: true });
        } catch (err) {
            console.error('Webhook processing error:', err);
            sendJSON(res, 500, { ok: false, error: err.message });
        }
        return;
    }

    // -----------------------------------------------------------
    // 2. Static File Serving
    // -----------------------------------------------------------

    let reqPath = decodeURI(pathname);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  تم تشغيل متجر مكة والخادم الخلفي بنجاح:`);
    console.log(`  👉 http://localhost:${PORT}`);
    console.log(`  👉 API Endpoints: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);

    // تشغيل خدمة الاستماع اللحظي للبوت
    const config = getTelegramConfig();
    startTelegramPoller(config);
});
