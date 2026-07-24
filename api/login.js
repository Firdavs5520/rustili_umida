const crypto = require("crypto");

const TEACHER_USERNAME = process.env.TEACHER_USERNAME || process.env.ADMIN_LOGIN || "ustoz";
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || "admin123";
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || "umida-rus-tili-session";
const MAX_AGE = 60 * 60 * 24 * 7;

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi." });
    return;
  }

  const body = parseBody(req);
  if (body.username !== TEACHER_USERNAME || body.password !== TEACHER_PASSWORD) {
    res.status(401).json({ error: "Login yoki parol noto'g'ri." });
    return;
  }

  res.setHeader("Set-Cookie", cookieHeader(createToken(TEACHER_USERNAME), req));
  res.status(200).json({ ok: true });
};

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function createToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    exp: Date.now() + MAX_AGE * 1000
  })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function cookieHeader(token, req) {
  const secure = req.headers["x-forwarded-proto"] === "https" || process.env.VERCEL ? "; Secure" : "";
  return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}${secure}`;
}
