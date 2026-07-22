module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi." });
    return;
  }

  res.status(201).json({
    ok: true,
    lead: {
      ...req.body,
      status: "new",
      created_at: new Date().toISOString()
    }
  });
};
