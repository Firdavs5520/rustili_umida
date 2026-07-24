const { normalizeLead, notifyLead } = require("../lead-utils");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ error: "Faqat POST so'rovi qabul qilinadi." });
      return;
    }

    const lead = {
      id: Date.now(),
      ...normalizeLead(parseBody(req)),
      created_at: new Date().toISOString()
    };
    const notifications = await notifyLead(lead);

    res.status(201).json({ ok: true, lead, notifications });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "So'rov qabul qilinmadi." });
  }
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
