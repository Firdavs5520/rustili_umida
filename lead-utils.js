const SMS_TIMEOUT_MS = 7000;

function normalizeLead(body = {}) {
  return {
    name: requireText(formatPersonName(body.name), "Ism", 120),
    phone: normalizeUzPhone(body.phone),
    goal: clean(body.goal || "", 160),
    message: clean(body.message || "", 1000),
    status: "new"
  };
}

function formatPersonName(value) {
  return clean(value || "", 180)
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, space, letter) => `${space}${letter.toUpperCase()}`);
}

function formatUzPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  if (digits.startsWith("8") && digits.length > 9) digits = digits.slice(1);
  if (digits.startsWith("0") && digits.length > 9) digits = digits.slice(1);

  const local = digits.slice(0, 9);
  if (!local) return "";

  const parts = ["+998"];
  if (local.length) parts.push(local.slice(0, 2));
  if (local.length > 2) parts.push(local.slice(2, 5));
  if (local.length > 5) parts.push(local.slice(5, 7));
  if (local.length > 7) parts.push(local.slice(7, 9));
  return parts.filter(Boolean).join(" ");
}

function normalizeUzPhone(value) {
  const formatted = formatUzPhone(value);
  const digits = formatted.replace(/\D/g, "");
  if (!/^998\d{9}$/.test(digits)) {
    throw httpError(400, "Telefonni +998 90 123 45 67 ko'rinishida kiriting.");
  }
  return formatted;
}

async function notifyLead(lead) {
  const [sms, telegram] = await Promise.all([
    sendSmsNotification(lead),
    sendTelegramNotification(lead).catch((error) => notificationError(error))
  ]);

  return { sms, telegram };
}

async function sendSmsNotification(lead) {
  const twilioReady = process.env.TWILIO_ACCOUNT_SID
    && process.env.TWILIO_AUTH_TOKEN
    && process.env.TWILIO_FROM
    && (process.env.SMS_TO || process.env.TEACHER_PHONE);

  if (twilioReady) {
    return sendTwilioSms(lead).catch((error) => notificationError(error));
  }

  if (process.env.SMS_WEBHOOK_URL && (process.env.SMS_TO || process.env.TEACHER_PHONE)) {
    return sendSmsWebhook(lead).catch((error) => notificationError(error));
  }

  return { status: "skipped", reason: "sms_not_configured" };
}

async function sendTwilioSms(lead) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const body = new URLSearchParams({
    To: process.env.SMS_TO || process.env.TEACHER_PHONE,
    From: process.env.TWILIO_FROM,
    Body: leadNotificationText(lead)
  });

  const response = await fetchWithTimeout(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) throw new Error(`SMS yuborilmadi: ${response.status}`);
  return { status: "sent", provider: "twilio" };
}

async function sendSmsWebhook(lead) {
  const response = await fetchWithTimeout(process.env.SMS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: process.env.SMS_TO || process.env.TEACHER_PHONE,
      text: leadNotificationText(lead),
      lead
    })
  });

  if (!response.ok) throw new Error(`SMS webhook xatosi: ${response.status}`);
  return { status: "sent", provider: "webhook" };
}

async function sendTelegramNotification(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { status: "skipped", reason: "telegram_not_configured" };

  const response = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: leadNotificationText(lead),
      disable_web_page_preview: true
    })
  });

  if (!response.ok) throw new Error(`Telegram yuborilmadi: ${response.status}`);
  return { status: "sent", provider: "telegram" };
}

function leadNotificationText(lead) {
  return [
    "Yangi so'rov - Umida Rus Tili",
    `Ism: ${lead.name || "-"}`,
    `Telefon: ${lead.phone || "-"}`,
    `Maqsad: ${lead.goal || "-"}`,
    `Xabar: ${lead.message || "-"}`
  ].join("\n");
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SMS_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function notificationError(error) {
  return { status: "failed", error: error.message };
}

function requireText(value, label, max) {
  const text = clean(value, max);
  if (!text) throw httpError(400, `${label} kiritilishi kerak.`);
  return text;
}

function clean(value, max = 500) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = {
  formatPersonName,
  formatUzPhone,
  normalizeLead,
  normalizeUzPhone,
  notifyLead
};
