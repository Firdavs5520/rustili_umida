module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi." });
    return;
  }

  res.status(503).json({
    error: "Ustoz kabineti faqat lokal serverda ishlaydi. Public sayt va Telegram so'rov Vercelda ishlaydi."
  });
};
