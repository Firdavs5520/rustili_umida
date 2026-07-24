const crypto = require("crypto");

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || "umida-rus-tili-session";

module.exports = function handler(req, res) {
  res.status(200).json({ authenticated: isAuthenticated(req) });
};

function isAuthenticated(req) {
  const token = parseCookies(req).session;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");
  if (!safeEqual(signature, expected)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
