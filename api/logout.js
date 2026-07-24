module.exports = function handler(req, res) {
  const secure = req.headers["x-forwarded-proto"] === "https" || process.env.VERCEL ? "; Secure" : "";
  res.setHeader("Set-Cookie", `session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
  res.status(200).json({ ok: true });
};
