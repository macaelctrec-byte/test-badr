/**
 * ===============================================================
 * متجر مكة للأدوات الكهربائية | بوت إدارة الطلبات عبر Telegram
 * كود جاهز 100% للنسخ المباشر في Google Apps Script
 * ===============================================================
 */

// 1. الإعدادات الأساسية الجاهزة (تم إدراج بيانات البوت الخاصة بك تلقائياً)
var DEFAULT_CONFIG = {
  BOT_TOKEN: "8873600109:AAHzCV12VhTMlQaNgBUyjEWihvoe5SKOFJ8",
  ADMIN_CHAT_ID: "8255156756",
  STORE_URL: "https://macca3.shop",
  FIREBASE_PROJECT_ID: "macaelctrec-f7795"
};

var B = "`";

function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    botToken: props.getProperty("TELEGRAM_BOT_TOKEN") || DEFAULT_CONFIG.BOT_TOKEN,
    adminChatId: props.getProperty("ADMIN_CHAT_ID") || DEFAULT_CONFIG.ADMIN_CHAT_ID,
    storeUrl: props.getProperty("STORE_URL") || DEFAULT_CONFIG.STORE_URL,
    firebaseProjectId: props.getProperty("FIREBASE_PROJECT_ID") || DEFAULT_CONFIG.FIREBASE_PROJECT_ID
  };
}

/**
 * دالة تجربة الاتصال (اضغط تشغيل Run لاختبار البوت والتأكد من نجاح الإعداد)
 */
function testConnection() {
  var cfg = getConfig();
  var msg = "✅ *تم اختبار الاتصال بنجاح من Google Apps Script!*\n\n" +
            "البوت متصل وجاهز للعمل بكفاءة على مدار 24 ساعة سحابياً.";
  var res = sendTelegramMessage(cfg.adminChatId, msg, null, cfg);
  Logger.log("Test Connection Result: " + res);
}

/**
var WEB_APP_URL = "https://script.google.com/macros/s/AKfycby-g5O-K-s_Fjbv3AAjpMWJU3Bv1QhcGKADua0s6hOIm5epuv0puMT_-Q1PKgCtKJN8/exec";

/**
 * دالة تفعيل Webhook تلقائياً (تستخدم الرابط الإنتاجي /exec دائماً)
 */
function activateWebhook() {
  var cfg = getConfig();
  var scriptUrl = WEB_APP_URL;
  var url = "https://api.telegram.org/bot" + cfg.botToken + "/setWebhook?url=" + encodeURIComponent(scriptUrl);
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  Logger.log("Webhook Activated: " + response.getContentText());
  sendTelegramMessage(cfg.adminChatId, "🚀 *تم تفعيل Webhook بنجاح بالرابط الإنتاجي!*\nالبوت الآن يستقبل كافة ضغطات الأزرار والطلبات مباشرة.", null, cfg);
}

/** 
 * نقطة استقبال البيانات الرئيسية للويب آب (doPost)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", note: "No post data received" })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var config = getConfig();

    // 1. إشعار طلب جديد وارد من المتجر
    if (payload.action === "notify_new_order") {
      return handleStoreNewOrderNotification(payload.order, config);
    }

    // 2. مزامنة عكسية من لوحة تحكم المتجر
    if (payload.action === "reverse_sync") {
      return handleStoreReverseSync(payload, config);
    }

    // 3. نقرة زر تفاعلي في تليجرام
    if (payload.callback_query) {
      return handleTelegramCallbackQuery(payload.callback_query, config);
    }

    // 4. رسالة نصية من المشرف
    if (payload.message) {
      return handleTelegramMessage(payload.message, config);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("doPost Error: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("✅ خدمة بوت متجر مكة تعمل بنجاح وحية الآن!").setMimeType(ContentService.MimeType.TEXT);
}

function isAuthorizedAdmin(fromId, chatId, config) {
  var target = String(config.adminChatId || "");
  return !target || String(fromId) === target || String(chatId) === target;
}

// -------------------------------------------------------------------
// معالجة إشعار الطلب الجديد الوارد من صفحة الدفع
// -------------------------------------------------------------------
function handleStoreNewOrderNotification(order, config) {
  if (!order || !order.orderNumber) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid order data" })).setMimeType(ContentService.MimeType.JSON);
  }

  var items = order.items || [];
  var itemsList = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    itemsList.push("• " + item.name + " × " + item.quantity + " (" + ((item.price || 0) * (item.quantity || 1)).toFixed(0) + " EGP)");
  }
  var itemsText = itemsList.join("\n");

  var cust = order.customer || {};
  var custName = cust.name || "غير محدد";
  var custPhone = cust.phone || "غير محدد";
  var custAddress = (cust.governorate || "") + " - " + (cust.city || "") + " " + (cust.address || "");

  var methodMap = {
    "vodafone_cash": "Vodafone Cash (محفظة كاش)",
    "instapay": "InstaPay (إنستاباي)",
    "orange_cash": "Orange Cash",
    "etisalat_cash": "Etisalat Cash",
    "we_pay": "WE Pay"
  };
  var payMethod = methodMap[order.paymentMethod] || order.paymentMethod || "تحويل إلكتروني";

  var messageText = 
    "🛍️ *طلب جديد يحتاج مراجعة*\n" +
    "━━━━━━━━━━━━━━━━\n\n" +
    "📦 *Order:* " + B + "#" + order.orderNumber + B + "\n\n" +
    "👤 *العميل:* " + custName + "\n\n" +
    "📱 *الهاتف:* " + B + custPhone + B + "\n\n" +
    "📍 *العنوان:* " + custAddress + "\n" +
    (cust.notes ? "📝 *ملاحظات:* " + cust.notes + "\n" : "") +
    "\n━━━━━━━━━━━━━━━━\n\n" +
    "🛒 *المنتجات:*\n" +
    itemsText + "\n\n" +
    "💰 *Subtotal:* " + parseFloat(order.subtotal || 0).toFixed(0) + " EGP\n" +
    "🚚 *Shipping:* " + parseFloat(order.shippingFee || 0).toFixed(0) + " EGP\n" +
    "💵 *Total:* *" + parseFloat(order.totalAmount || 0).toFixed(0) + " EGP*\n\n" +
    "━━━━━━━━━━━━━━━━\n\n" +
    "💳 *طريقة الدفع:* " + payMethod + "\n" +
    "💰 *المبلغ المطلوب:* " + parseFloat(order.totalAmount || 0).toFixed(0) + " EGP\n" +
    "⏳ *Payment Status:* بانتظار تأكيد الدفع";

  var inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ تأكيد الدفع", callback_data: "confirm_pay:" + order.orderNumber },
        { text: "❌ رفض الدفع", callback_data: "reject_prompt:" + order.orderNumber }
      ],
      [
        { text: "📦 تفاصيل الطلب", callback_data: "order_details:" + order.orderNumber }
      ]
    ]
  };

  // 1. إرسال الرسالة النصية الأساسية مع الأزرار التفاعلية أولاً (مضمون 100% وسريع)
  sendTelegramMessage(config.adminChatId, messageText, inlineKeyboard, config);

  // 2. إرسال صورة إثبات التحويل بشكل منفصل وواضح إذا كانت متوفرة
  var proof = order.paymentProof || {};
  var proofUrl = proof.screenshotUrl;
  if (proofUrl) {
    var photoCaption = "📸 *إثبات التحويل للطلب:* `#" + order.orderNumber + "`";
    if (proofUrl.indexOf("data:image") === 0) {
      sendTelegramPhotoBase64(config.adminChatId, proofUrl, photoCaption, null, config);
    } else if (proofUrl.indexOf("http://") === 0 || proofUrl.indexOf("https://") === 0) {
      sendTelegramPhotoUrl(config.adminChatId, proofUrl, photoCaption, null, config);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------------
// معالجة ضغطات أزرار Telegram التفاعلية
// -------------------------------------------------------------------
function handleTelegramCallbackQuery(cq, config) {
  var cqId = cq.id;
  var fromId = cq.from.id;
  var chatId = cq.message.chat.id;
  var messageId = cq.message.message_id;
  var data = cq.data || "";

  if (!isAuthorizedAdmin(fromId, chatId, config)) {
    answerCallbackQuery(cqId, "⛔ غير مصرح لك بإدارة هذا المتجر.", true, config);
    return ContentService.createTextOutput(JSON.stringify({ status: "unauthorized" })).setMimeType(ContentService.MimeType.JSON);
  }

  var parts = data.split(":");
  var action = parts[0];
  var orderNumber = parts[1];

  // 1. تأكيد الدفع
  if (action === "confirm_pay") {
    var orderData = findOrderByNumber(orderNumber, config);
    if (!orderData) {
      answerCallbackQuery(cqId, "⚠️ تعذر العثور على الطلب في قاعدة البيانات.", true, config);
      return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (orderData.paymentStatus === "paid") {
      answerCallbackQuery(cqId, "ℹ️ الدفع مؤكد بالفعل لهذا الطلب.", true, config);
      return ContentService.createTextOutput(JSON.stringify({ status: "already_paid" })).setMimeType(ContentService.MimeType.JSON);
    }

    var nowIso = new Date().toISOString();
    var history = Array.isArray(orderData.statusHistory) ? orderData.statusHistory.slice() : [];
    history.push({
      status: "payment_confirmed",
      title: "تم اعتماد وتأكيد الدفع",
      timestamp: nowIso,
      updatedBy: "Telegram Admin (" + cq.from.id + ")",
      note: "تم تأكيد الدفع عبر بوت تليجرام."
    });

    patchFirestoreOrder(orderData.docId, {
      paymentStatus: "paid",
      orderStatus: "payment_confirmed",
      statusHistory: history,
      updatedAt: nowIso
    }, config);

    answerCallbackQuery(cqId, "✅ تم تأكيد الدفع بنجاح!", false, config);

    var custName = (orderData.customer && orderData.customer.name) ? orderData.customer.name : "";
    var newText = 
      "✅ *تم تأكيد الدفع بنجاح*\n" +
      "━━━━━━━━━━━━━━━━\n\n" +
      "📦 *Order:* " + B + "#" + orderNumber + B + "\n\n" +
      (custName ? "👤 *العميل:* " + custName + "\n" : "") +
      "💵 *المبلغ:* " + (orderData.totalAmount || "") + " EGP\n" +
      "💳 *Payment:* PAID\n" +
      "📊 *Status:* Payment Confirmed\n\n" +
      "━━━━━━━━━━━━━━━━\n" +
      "📌 *الخطوة التالية:* ابدأ تجهيز الطلب في المخزن";

    var nextKeyboard = {
      inline_keyboard: [
        [
          { text: "📦 بدء تجهيز الطلب", callback_data: "advance_status:" + orderNumber + ":processing" }
        ],
        [
          { text: "📦 تفاصيل الطلب", callback_data: "order_details:" + orderNumber }
        ]
      ]
    };

    editMessageTextOrCaption(chatId, messageId, newText, nextKeyboard, config);
    return ContentService.createTextOutput(JSON.stringify({ status: "confirmed" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. خيارات رفض الدفع
  if (action === "reject_prompt") {
    answerCallbackQuery(cqId, "اختر سبب الرفض", false, config);
    var rejectKeyboard = {
      inline_keyboard: [
        [{ text: "❌ المبلغ غير صحيح", callback_data: "rej_r:" + orderNumber + ":1" }],
        [{ text: "❌ إثبات الدفع غير واضح", callback_data: "rej_r:" + orderNumber + ":2" }],
        [{ text: "❌ لم يتم استلام التحويل", callback_data: "rej_r:" + orderNumber + ":3" }],
        [{ text: "❌ بيانات التحويل غير مطابقة", callback_data: "rej_r:" + orderNumber + ":4" }],
        [{ text: "✍️ سبب آخر مخصص", callback_data: "reject_custom:" + orderNumber }],
        [{ text: "⬅️ رجوع", callback_data: "cancel_reject:" + orderNumber }]
      ]
    };
    editMessageReplyMarkup(chatId, messageId, rejectKeyboard, config);
    return ContentService.createTextOutput(JSON.stringify({ status: "reject_prompt" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. تطبيق سبب الرفض
  if (action === "reject_reason" || action === "rej_r") {
    var reasonCodes = {
      "1": "المبلغ المحول غير صحيح",
      "2": "إثبات الدفع غير واضح أو مقصوص",
      "3": "لم يتم استلام التحويل في الحساب",
      "4": "بيانات التحويل غير مطابقة للطلب"
    };
    var rawCode = parts.slice(2).join(":");
    var reason = reasonCodes[rawCode] || rawCode || "إثبات الدفع غير مطابق";
    var orderToReject = findOrderByNumber(orderNumber, config);
    if (orderToReject) {
      var rNowIso = new Date().toISOString();
      var rHistory = Array.isArray(orderToReject.statusHistory) ? orderToReject.statusHistory.slice() : [];
      rHistory.push({
        status: "payment_rejected",
        title: "تم رفض إثبات التحويل",
        timestamp: rNowIso,
        updatedBy: "Telegram Admin",
        note: reason
      });

      patchFirestoreOrder(orderToReject.docId, {
        paymentStatus: "rejected",
        orderStatus: "payment_rejected",
        rejectionReason: reason,
        statusHistory: rHistory,
        updatedAt: rNowIso
      }, config);

      answerCallbackQuery(cqId, "❌ تم رفض الدفع", false, config);

      var rejectText = 
        "❌ *تم رفض إثبات الدفع*\n" +
        "━━━━━━━━━━━━━━━━\n\n" +
        "📦 *Order:* " + B + "#" + orderNumber + B + "\n\n" +
        "⚠️ *سبب الرفض:* " + reason + "\n" +
        "💳 *Payment:* Rejected\n\n" +
        "━━━━━━━━━━━━━━━━\n" +
        "ℹ️ سيظهر سبب الرفض للعميل في شاشة التتبع لإعادة الرفع.";

      editMessageTextOrCaption(chatId, messageId, rejectText, {
        inline_keyboard: [[{ text: "📦 تفاصيل الطلب", callback_data: "order_details:" + orderNumber }]]
      }, config);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "rejected" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. طلب سبب مخصص
  if (action === "reject_custom") {
    CacheService.getScriptCache().put("pending_reject_" + chatId, orderNumber, 600);
    answerCallbackQuery(cqId, "✏️ اكتب سبب الرفض الآن في رسالة وسيتم تسجيله.", false, config);
    sendTelegramMessage(chatId, "✏️ *اكتب الآن في رسالة سبب رفض الطلب #" + orderNumber + ":*", null, config);
    return ContentService.createTextOutput(JSON.stringify({ status: "waiting_custom" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 4b. طلب ملاحظة تسليم مخصصة
  if (action === "prompt_delivery_note") {
    CacheService.getScriptCache().put("pending_deliver_" + chatId, orderNumber, 600);
    answerCallbackQuery(cqId, "✏️ اكتب ملاحظة التسليم في رسالة.", false, config);
    sendTelegramMessage(chatId, "✍️ *اكتب الآن في رسالة أي ملاحظة تريد توثيقها مع تسليم الطلب #" + orderNumber + ":*", {
      inline_keyboard: [
        [{ text: "🚀 تسليم فوري بدون ملاحظات", callback_data: "advance_status:" + orderNumber + ":delivered" }],
        [{ text: "🔙 إلغاء", callback_data: "cancel_reject:" + orderNumber }]
      ]
    }, config);
    return ContentService.createTextOutput(JSON.stringify({ status: "waiting_delivery_note" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 5. إلغاء الرفض
  if (action === "cancel_reject") {
    answerCallbackQuery(cqId, "تم الإلغاء", false, config);
    editMessageReplyMarkup(chatId, messageId, {
      inline_keyboard: [
        [
          { text: "✅ تأكيد الدفع", callback_data: "confirm_pay:" + orderNumber },
          { text: "❌ رفض الدفع", callback_data: "reject_prompt:" + orderNumber }
        ],
        [
          { text: "📦 تفاصيل الطلب", callback_data: "order_details:" + orderNumber }
        ]
      ]
    }, config);
    return ContentService.createTextOutput(JSON.stringify({ status: "cancelled" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 6. تقدم مراحل الطلب
  if (action === "advance_status") {
    var newStatus = parts[2];
    var statusTitles = {
      "processing": "جاري تجهيز الطلب",
      "ready_to_ship": "تم تجهيز الطلب للشحن",
      "shipped": "تم الشحن",
      "delivered": "تم التسليم بنجاح"
    };
    var sOrder = findOrderByNumber(orderNumber, config);
    if (sOrder) {
      var sNowIso = new Date().toISOString();
      var sHistory = Array.isArray(sOrder.statusHistory) ? sOrder.statusHistory.slice() : [];
      sHistory.push({
        status: newStatus,
        title: statusTitles[newStatus] || newStatus,
        timestamp: sNowIso,
        updatedBy: "Telegram Admin",
        note: "تم التحديث عبر Telegram Bot."
      });

      patchFirestoreOrder(sOrder.docId, {
        orderStatus: newStatus,
        statusHistory: sHistory,
        updatedAt: sNowIso
      }, config);

      answerCallbackQuery(cqId, "📦 " + (statusTitles[newStatus] || newStatus), false, config);

      var nextButtons = null;
      if (newStatus === "processing") {
        nextButtons = [{ text: "📦 تم تجهيز الطلب", callback_data: "advance_status:" + orderNumber + ":ready_to_ship" }];
      } else if (newStatus === "ready_to_ship") {
        nextButtons = [{ text: "🚚 تم الشحن", callback_data: "advance_status:" + orderNumber + ":shipped" }];
      } else if (newStatus === "shipped") {
        nextButtons = [
          { text: "🚀 تسليم فوري", callback_data: "advance_status:" + orderNumber + ":delivered" },
          { text: "✍️ تسليم مع ملاحظة", callback_data: "prompt_delivery_note:" + orderNumber }
        ];
      }

      var kRows = [];
      if (nextButtons) kRows.push(nextButtons);
      kRows.push([{ text: "📦 تفاصيل الطلب", callback_data: "order_details:" + orderNumber }]);

      var sText = 
        "📦 *تحديث حالة الطلب*\n" +
        "━━━━━━━━━━━━━━━━\n\n" +
        "📦 *Order:* " + B + "#" + orderNumber + B + "\n\n" +
        "📊 *الحالة الحالية:* *" + (statusTitles[newStatus] || newStatus) + "*\n" +
        "🕒 *التاريخ:* " + new Date().toLocaleString("ar-EG") + "\n\n" +
        "━━━━━━━━━━━━━━━━";

      editMessageTextOrCaption(chatId, messageId, sText, { inline_keyboard: kRows }, config);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "advanced" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 7. تفاصيل الطلب
  if (action === "order_details") {
    answerCallbackQuery(cqId, "جاري فتح التفاصيل...", false, config);
    var dOrder = findOrderByNumber(orderNumber, config);
    if (dOrder) {
      var dCust = dOrder.customer || {};
      var dText = 
        "📄 *تفاصيل الطلب الكاملة*\n" +
        "━━━━━━━━━━━━━━━━\n\n" +
        "📦 *Order:* " + B + "#" + orderNumber + B + "\n\n" +
        "👤 *الاسم:* " + (dCust.name || "-") + "\n" +
        "📱 *الهاتف:* " + B + (dCust.phone || "-") + B + "\n" +
        "📍 *العنوان:* " + (dCust.governorate || "") + " - " + (dCust.city || "") + " " + (dCust.address || "") + "\n" +
        "💵 *الإجمالي:* *" + (dOrder.totalAmount || "-") + " EGP*\n" +
        "💳 *حالة الدفع:* " + (dOrder.paymentStatus || "pending") + "\n" +
        "📊 *حالة الطلب:* " + (dOrder.orderStatus || "pending");

      sendTelegramMessage(chatId, dText, {
        inline_keyboard: [[{ text: "🌐 فتح لوحة التحكم", url: config.storeUrl + "/#admin-orders" }]]
      }, config);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "details" })).setMimeType(ContentService.MimeType.JSON);
  }

  answerCallbackQuery(cqId, "إجراء غير معروف", false, config);
  return ContentService.createTextOutput(JSON.stringify({ status: "unknown" })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------------
// معالجة الرسائل النصية
// -------------------------------------------------------------------
function handleTelegramMessage(msg, config) {
  var chatId = msg.chat.id;
  var fromId = msg.from.id;
  var text = (msg.text || "").trim();

  if (!isAuthorizedAdmin(fromId, chatId, config)) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" })).setMimeType(ContentService.MimeType.JSON);
  }

  var pendingOrderNumber = CacheService.getScriptCache().get("pending_reject_" + chatId);
  if (pendingOrderNumber && text) {
    CacheService.getScriptCache().remove("pending_reject_" + chatId);

    var order = findOrderByNumber(pendingOrderNumber, config);
    if (order) {
      var nowIso = new Date().toISOString();
      var history = Array.isArray(order.statusHistory) ? order.statusHistory.slice() : [];
      history.push({
        status: "payment_rejected",
        title: "تم رفض إثبات التحويل",
        timestamp: nowIso,
        updatedBy: "Telegram Admin",
        note: text
      });

      patchFirestoreOrder(order.docId, {
        paymentStatus: "rejected",
        orderStatus: "payment_rejected",
        rejectionReason: text,
        statusHistory: history,
        updatedAt: nowIso
      }, config);
    }

    sendTelegramMessage(chatId, 
      "❌ *تم تسجيل رفض إثبات الدفع للطلب #" + pendingOrderNumber + "*\n\n" +
      "⚠️ *السبب المسجل:* " + text + "\n\n" +
      "ℹ️ تم إشعار العميل وتحديث شاشة التتبع بنجاح.", {
        inline_keyboard: [[{ text: "📦 تفاصيل الطلب", callback_data: "order_details:" + pendingOrderNumber }]]
      }, config
    );

    return ContentService.createTextOutput(JSON.stringify({ status: "custom_reason_saved" })).setMimeType(ContentService.MimeType.JSON);
  }

  var pendingDeliverOrderNumber = CacheService.getScriptCache().get("pending_deliver_" + chatId);
  if (pendingDeliverOrderNumber && text) {
    CacheService.getScriptCache().remove("pending_deliver_" + chatId);

    var dOrder = findOrderByNumber(pendingDeliverOrderNumber, config);
    if (dOrder) {
      var dNowIso = new Date().toISOString();
      var dHistory = Array.isArray(dOrder.statusHistory) ? dOrder.statusHistory.slice() : [];
      dHistory.push({
        status: "delivered",
        title: "تم تسليم الطلب بنجاح",
        timestamp: dNowIso,
        updatedBy: "Telegram Admin",
        note: text
      });

      patchFirestoreOrder(dOrder.docId, {
        orderStatus: "delivered",
        deliveryNotes: text,
        statusHistory: dHistory,
        updatedAt: dNowIso
      }, config);
    }

    sendTelegramMessage(chatId, 
      "✅ *تم توثيق تسليم الطلب #" + pendingDeliverOrderNumber + "*\n\n" +
      "📝 *ملاحظة التسليم:* " + text + "\n\n" +
      "ℹ️ تم تحديث صفحة تتبع العميل ولوحة الإدارة فوراً.", {
        inline_keyboard: [[{ text: "📦 تفاصيل الطلب", callback_data: "order_details:" + pendingDeliverOrderNumber }]]
      }, config
    );

    return ContentService.createTextOutput(JSON.stringify({ status: "delivery_note_saved" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (text === "/start" || text === "start") {
    sendTelegramMessage(chatId, 
      "👋 مرحباً بك في بوت إدارة طلبات *متجر مكة للأدوات الكهربائية*!\n\n" +
      "ستصلك هنا إشعارات فورية بكل طلب جديد مع إثبات الدفع وأزرار التحكم في دورة حياة الطلب بنقرة واحدة.\n\n" +
      "🆔 معرّف المحادثة الخاص بك: " + B + chatId + B, null, config
    );
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------------
// المزامنة العكسية من المتجر
// -------------------------------------------------------------------
function handleStoreReverseSync(payload, config) {
  var orderNumber = payload.orderNumber;
  var newStatus = payload.newStatus;
  var adminEmail = payload.adminEmail || "Web Admin";

  var text = 
    "🔄 *تحديث مباشر من لوحة تحكم المتجر (Web Admin)*\n" +
    "━━━━━━━━━━━━━━━━\n\n" +
    "📦 *Order:* " + B + "#" + orderNumber + B + "\n" +
    "📊 *الحالة الجديدة:* *" + (payload.statusTitle || newStatus) + "*\n" +
    "👤 *تم التحديث بواسطة:* " + adminEmail + "\n" +
    "🕒 *التاريخ:* " + new Date().toLocaleString("ar-EG") + "\n\n" +
    "━━━━━━━━━━━━━━━━";

  sendTelegramMessage(config.adminChatId, text, {
    inline_keyboard: [
      [
        { text: "📦 تفاصيل الطلب", callback_data: "order_details:" + orderNumber },
        { text: "🌐 فتح لوحة التحكم", url: config.storeUrl + "/#admin-orders" }
      ]
    ]
  }, config);

  return ContentService.createTextOutput(JSON.stringify({ status: "reverse_synced" })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------------
// تكامل مباشر مع Firestore REST API (سيرفر ليس وسحابي 100%)
// -------------------------------------------------------------------
function findOrderByNumber(orderNumber, config) {
  try {
    var postData = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "orders" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "orderNumber" },
            op: "EQUAL",
            value: { stringValue: orderNumber }
          }
        },
        limit: 1
      }
    });

    var url = "https://firestore.googleapis.com/v1/projects/" + config.firebaseProjectId + "/databases/(default)/documents:runQuery";
    var res = UrlFetchApp.fetch(url, {
      method: "POST",
      contentType: "application/json",
      payload: postData,
      muteHttpExceptions: true
    });

    if (res.getResponseCode() === 200) {
      var json = JSON.parse(res.getContentText());
      if (Array.isArray(json) && json[0] && json[0].document) {
        var doc = json[0].document;
        var docId = doc.name.split("/").pop();
        var parsed = fromFirestore(doc.fields);
        parsed.docId = docId;
        return parsed;
      }
    }
  } catch (e) {
    Logger.log("findOrderByNumber Error: " + e.toString());
  }
  return null;
}

function patchFirestoreOrder(docId, updateData, config) {
  try {
    var fieldPaths = [];
    var fields = toFirestore(updateData);
    for (var k in updateData) {
      fieldPaths.push("updateMask.fieldPaths=" + encodeURIComponent(k));
    }
    var queryStr = fieldPaths.join("&");
    var url = "https://firestore.googleapis.com/v1/projects/" + config.firebaseProjectId + "/databases/(default)/documents/orders/" + encodeURIComponent(docId) + "?" + queryStr;
    
    var res = UrlFetchApp.fetch(url, {
      method: "PATCH",
      contentType: "application/json",
      payload: JSON.stringify({ fields: fields }),
      muteHttpExceptions: true
    });
    return res.getResponseCode() === 200;
  } catch (e) {
    Logger.log("patchFirestoreOrder Error: " + e.toString());
    return false;
  }
}

function toFirestore(obj) {
  var fields = {};
  for (var key in obj) {
    var val = obj[key];
    if (val === undefined || val === null) {
      fields[key] = { nullValue: null };
    } else if (typeof val === "string") {
      fields[key] = { stringValue: val };
    } else if (typeof val === "number") {
      fields[key] = Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    } else if (typeof val === "boolean") {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      var arrVals = [];
      for (var i = 0; i < val.length; i++) {
        var item = val[i];
        if (typeof item === "object" && item !== null) arrVals.push({ mapValue: { fields: toFirestore(item) } });
        else if (typeof item === "string") arrVals.push({ stringValue: item });
        else if (typeof item === "number") arrVals.push(Number.isInteger(item) ? { integerValue: String(item) } : { doubleValue: item });
        else if (typeof item === "boolean") arrVals.push({ booleanValue: item });
      }
      fields[key] = { arrayValue: { values: arrVals } };
    } else if (typeof val === "object") {
      fields[key] = { mapValue: { fields: toFirestore(val) } };
    }
  }
  return fields;
}

function fromFirestore(fields) {
  var obj = {};
  if (!fields) return obj;
  for (var key in fields) {
    var valObj = fields[key];
    if (valObj.stringValue !== undefined) obj[key] = valObj.stringValue;
    else if (valObj.integerValue !== undefined) obj[key] = parseInt(valObj.integerValue, 10);
    else if (valObj.doubleValue !== undefined) obj[key] = parseFloat(valObj.doubleValue);
    else if (valObj.booleanValue !== undefined) obj[key] = valObj.booleanValue;
    else if (valObj.timestampValue !== undefined) obj[key] = valObj.timestampValue;
    else if (valObj.mapValue !== undefined) obj[key] = fromFirestore(valObj.mapValue.fields);
    else if (valObj.arrayValue !== undefined) {
      var rawArr = valObj.arrayValue.values || [];
      var resArr = [];
      for (var j = 0; j < rawArr.length; j++) {
        var item = rawArr[j];
        if (item.stringValue !== undefined) resArr.push(item.stringValue);
        else if (item.integerValue !== undefined) resArr.push(parseInt(item.integerValue, 10));
        else if (item.doubleValue !== undefined) resArr.push(parseFloat(item.doubleValue));
        else if (item.booleanValue !== undefined) resArr.push(item.booleanValue);
        else if (item.mapValue !== undefined) resArr.push(fromFirestore(item.mapValue.fields));
      }
      obj[key] = resArr;
    }
  }
  return obj;
}

// -------------------------------------------------------------------
// دوال إرسال واستقبال Telegram
// -------------------------------------------------------------------
function sendTelegramMessage(chatId, text, replyMarkup, config) {
  if (!config.botToken || !chatId) return null;
  var url = "https://api.telegram.org/bot" + config.botToken + "/sendMessage";
  var payload = {
    chat_id: String(chatId),
    text: text,
    parse_mode: "Markdown"
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  var res = UrlFetchApp.fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  return res.getContentText();
}

function sendTelegramPhotoUrl(chatId, photoUrl, caption, replyMarkup, config) {
  if (!config.botToken || !chatId) return;
  var url = "https://api.telegram.org/bot" + config.botToken + "/sendPhoto";
  var payload = {
    chat_id: String(chatId),
    photo: photoUrl,
    caption: caption,
    parse_mode: "Markdown"
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  UrlFetchApp.fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

function sendTelegramPhotoBase64(chatId, dataUri, caption, replyMarkup, config) {
  if (!config.botToken || !chatId) return;
  try {
    var parts = dataUri.split(",");
    var base64Data = parts[1];
    var meta = parts[0];
    var contentType = (meta.split(";")[0].split(":")[1]) || "image/jpeg";
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, contentType, "proof.jpg");

    var url = "https://api.telegram.org/bot" + config.botToken + "/sendPhoto";
    var payload = {
      chat_id: String(chatId),
      caption: caption,
      parse_mode: "Markdown",
      photo: blob
    };
    if (replyMarkup) payload.reply_markup = JSON.stringify(replyMarkup);

    UrlFetchApp.fetch(url, {
      method: "POST",
      payload: payload,
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log("sendTelegramPhotoBase64 fallback: " + e.toString());
    sendTelegramMessage(chatId, caption, replyMarkup, config);
  }
}

function editMessageTextOrCaption(chatId, messageId, text, replyMarkup, config) {
  if (!config.botToken || !chatId || !messageId) return;
  
  var captionUrl = "https://api.telegram.org/bot" + config.botToken + "/editMessageCaption";
  var captionPayload = {
    chat_id: String(chatId),
    message_id: messageId,
    caption: text,
    parse_mode: "Markdown"
  };
  if (replyMarkup) captionPayload.reply_markup = replyMarkup;

  var res = UrlFetchApp.fetch(captionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(captionPayload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    var textUrl = "https://api.telegram.org/bot" + config.botToken + "/editMessageText";
    var textPayload = {
      chat_id: String(chatId),
      message_id: messageId,
      text: text,
      parse_mode: "Markdown"
    };
    if (replyMarkup) textPayload.reply_markup = replyMarkup;

    UrlFetchApp.fetch(textUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      payload: JSON.stringify(textPayload),
      muteHttpExceptions: true
    });
  }
}

function editMessageReplyMarkup(chatId, messageId, replyMarkup, config) {
  if (!config.botToken || !chatId || !messageId) return;
  var url = "https://api.telegram.org/bot" + config.botToken + "/editMessageReplyMarkup";
  var payload = {
    chat_id: String(chatId),
    message_id: messageId,
    reply_markup: replyMarkup
  };

  UrlFetchApp.fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

function answerCallbackQuery(cqId, text, showAlert, config) {
  if (!config.botToken || !cqId) return;
  var url = "https://api.telegram.org/bot" + config.botToken + "/answerCallbackQuery";
  var payload = {
    callback_query_id: cqId,
    text: text || "",
    show_alert: showAlert || false
  };

  UrlFetchApp.fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}