const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "rus_tili.sqlite");
const TEACHER_USERNAME = process.env.TEACHER_USERNAME || process.env.ADMIN_LOGIN || "ustoz";
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || "admin123";

const sessions = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");

initDatabase();
seedDatabase();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    serveStatic(req, res, url.pathname);
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    sendJson(res, status, { error: error.message || "Server xatosi yuz berdi." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Rus tili sayti: http://${HOST}:${PORT}`);
  console.log(`Kirish login: ${TEACHER_USERNAME}`);
  console.log(`Kirish parol: ${TEACHER_PASSWORD}`);
});

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'A1',
      goal TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      title TEXT NOT NULL,
      lesson_date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      format TEXT NOT NULL DEFAULT 'online',
      status TEXT NOT NULL DEFAULT 'planned',
      topic TEXT NOT NULL DEFAULT '',
      homework TEXT NOT NULL DEFAULT '',
      materials TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      amount INTEGER NOT NULL,
      paid_at TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'naqd',
      status TEXT NOT NULL DEFAULT 'paid',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      goal TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );
  `);
}

function seedDatabase() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM students").get();
  if (row.count > 0) return;

  const nowValue = now();
  const tomorrow = plusDays(1, 15, 0);
  const nextWeek = plusDays(5, 18, 30);

  const studentA = db.prepare(`
    INSERT INTO students (full_name, phone, level, goal, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Namuna o'quvchi",
    "+998 90 000 00 00",
    "B1",
    "Maktab mavzularini mustahkamlash",
    "active",
    "Bu qator namuna uchun. Xohlasangiz o'chirib yoki tahrirlab yuboring.",
    nowValue,
    nowValue
  ).lastInsertRowid;

  db.prepare(`
    INSERT INTO lessons
      (student_id, title, lesson_date, duration_minutes, format, status, topic, homework, materials, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(studentA),
    "Kelishiklar va test tahlili",
    tomorrow,
    60,
    "online",
    "planned",
    "Otlarning kelishiklari, test savollari va xatolar tahlili",
    "20 ta test ishlash va xato javoblarni belgilash",
    "Test varaqasi, konspekt",
    "Birinchi dars uchun namuna yozuv.",
    nowValue,
    nowValue
  );

  db.prepare(`
    INSERT INTO lessons
      (student_id, title, lesson_date, duration_minutes, format, status, topic, homework, materials, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(studentA),
    "Matn bilan ishlash",
    nextWeek,
    75,
    "offline",
    "planned",
    "O'qib tushunish, savol-javob va yozma javob",
    "Matn bo'yicha 8 ta savolga yozma javob berish",
    "PDF konspekt",
    "",
    nowValue,
    nowValue
  );

  db.prepare(`
    INSERT INTO payments (student_id, amount, paid_at, method, status, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(Number(studentA), 150000, todayDate(), "naqd", "paid", "Namuna to'lov", nowValue);
}

async function handleApi(req, res, url) {
  const method = req.method || "GET";
  const pathname = url.pathname;

  if (pathname === "/api/login" && method === "POST") {
    const body = await readJson(req);
    if (body.username !== TEACHER_USERNAME || body.password !== TEACHER_PASSWORD) {
      sendJson(res, 401, { error: "Login yoki parol noto'g'ri." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now());
    res.setHeader("Set-Cookie", `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/session" && method === "GET") {
    sendJson(res, 200, { authenticated: isAuthenticated(req) });
    return;
  }

  if (pathname === "/api/logout" && method === "POST") {
    const token = parseCookies(req).session;
    if (token) sessions.delete(token);
    res.setHeader("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/leads" && method === "POST") {
    const body = await readJson(req);
    const lead = createLead(body);
    sendJson(res, 201, { lead });
    return;
  }

  if (!isAuthenticated(req)) {
    sendJson(res, 401, { error: "Kabinetga kirish kerak." });
    return;
  }

  if (pathname === "/api/bootstrap" && method === "GET") {
    sendJson(res, 200, getBootstrapData());
    return;
  }

  if (pathname === "/api/students" && method === "GET") {
    sendJson(res, 200, { students: listStudents(url.searchParams) });
    return;
  }

  if (pathname === "/api/students" && method === "POST") {
    const student = createStudent(await readJson(req));
    sendJson(res, 201, { student, summary: getSummary() });
    return;
  }

  const studentMatch = pathname.match(/^\/api\/students\/(\d+)$/);
  if (studentMatch && method === "PUT") {
    const student = updateStudent(Number(studentMatch[1]), await readJson(req));
    sendJson(res, 200, { student, summary: getSummary() });
    return;
  }

  if (studentMatch && method === "DELETE") {
    archiveStudent(Number(studentMatch[1]));
    sendJson(res, 200, { ok: true, summary: getSummary() });
    return;
  }

  if (pathname === "/api/lessons" && method === "GET") {
    sendJson(res, 200, { lessons: listLessons(url.searchParams) });
    return;
  }

  if (pathname === "/api/lessons" && method === "POST") {
    const lesson = createLesson(await readJson(req));
    sendJson(res, 201, { lesson, summary: getSummary() });
    return;
  }

  const lessonMatch = pathname.match(/^\/api\/lessons\/(\d+)$/);
  if (lessonMatch && method === "PUT") {
    const lesson = updateLesson(Number(lessonMatch[1]), await readJson(req));
    sendJson(res, 200, { lesson, summary: getSummary() });
    return;
  }

  if (lessonMatch && method === "DELETE") {
    deleteById("lessons", Number(lessonMatch[1]));
    sendJson(res, 200, { ok: true, summary: getSummary() });
    return;
  }

  if (pathname === "/api/payments" && method === "GET") {
    sendJson(res, 200, { payments: listPayments() });
    return;
  }

  if (pathname === "/api/payments" && method === "POST") {
    const payment = createPayment(await readJson(req));
    sendJson(res, 201, { payment, summary: getSummary() });
    return;
  }

  const paymentMatch = pathname.match(/^\/api\/payments\/(\d+)$/);
  if (paymentMatch && method === "DELETE") {
    deleteById("payments", Number(paymentMatch[1]));
    sendJson(res, 200, { ok: true, summary: getSummary() });
    return;
  }

  if (pathname === "/api/leads" && method === "GET") {
    sendJson(res, 200, { leads: listLeads() });
    return;
  }

  const leadMatch = pathname.match(/^\/api\/leads\/(\d+)$/);
  if (leadMatch && method === "PUT") {
    const body = await readJson(req);
    const lead = updateLeadStatus(Number(leadMatch[1]), body.status);
    sendJson(res, 200, { lead, summary: getSummary() });
    return;
  }

  if (leadMatch && method === "DELETE") {
    deleteById("leads", Number(leadMatch[1]));
    sendJson(res, 200, { ok: true, summary: getSummary() });
    return;
  }

  if (pathname === "/api/export/students.csv" && method === "GET") {
    sendCsv(res, "students.csv", toCsv(listStudents(new URLSearchParams()), [
      "id", "full_name", "phone", "level", "goal", "status", "notes", "created_at"
    ]));
    return;
  }

  if (pathname === "/api/export/lessons.csv" && method === "GET") {
    sendCsv(res, "lessons.csv", toCsv(listLessons(new URLSearchParams()), [
      "id", "student_name", "title", "lesson_date", "duration_minutes", "format",
      "status", "topic", "homework", "materials", "notes"
    ]));
    return;
  }

  if (pathname === "/api/export/payments.csv" && method === "GET") {
    sendCsv(res, "payments.csv", toCsv(listPayments(), [
      "id", "student_name", "amount", "paid_at", "method", "status", "note"
    ]));
    return;
  }

  sendJson(res, 404, { error: "API topilmadi." });
}

function getBootstrapData() {
  return {
    summary: getSummary(),
    students: listStudents(new URLSearchParams()),
    lessons: listLessons(new URLSearchParams()),
    payments: listPayments(),
    leads: listLeads()
  };
}

function getSummary() {
  const activeStudents = db.prepare("SELECT COUNT(*) AS count FROM students WHERE status = 'active'").get().count;
  const allLessons = db.prepare("SELECT COUNT(*) AS count FROM lessons").get().count;
  const plannedLessons = db.prepare("SELECT COUNT(*) AS count FROM lessons WHERE status = 'planned'").get().count;
  const newLeads = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE status = 'new'").get().count;
  const paidTotal = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'").get().total;

  const nextLessons = db.prepare(`
    SELECT lessons.*, students.full_name AS student_name
    FROM lessons
    LEFT JOIN students ON students.id = lessons.student_id
    WHERE lessons.status = 'planned'
    ORDER BY lessons.lesson_date ASC
    LIMIT 5
  `).all();

  return {
    activeStudents,
    allLessons,
    plannedLessons,
    newLeads,
    paidTotal,
    nextLessons
  };
}

function listStudents(searchParams) {
  const q = clean(searchParams.get("q") || "", 80);
  const status = clean(searchParams.get("status") || "", 40);
  const params = [];
  const where = [];

  if (q) {
    where.push("(full_name LIKE ? OR phone LIKE ? OR goal LIKE ? OR notes LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }

  if (status) {
    where.push("status = ?");
    params.push(status);
  }

  return db.prepare(`
    SELECT *
    FROM students
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY status = 'active' DESC, created_at DESC, id DESC
  `).all(...params);
}

function createStudent(body) {
  const data = normalizeStudent(body);
  const createdAt = now();
  const result = db.prepare(`
    INSERT INTO students (full_name, phone, level, goal, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.full_name, data.phone, data.level, data.goal, data.status, data.notes, createdAt, createdAt);
  return findById("students", result.lastInsertRowid);
}

function updateStudent(id, body) {
  assertId(id);
  const data = normalizeStudent(body);
  db.prepare(`
    UPDATE students
    SET full_name = ?, phone = ?, level = ?, goal = ?, status = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(data.full_name, data.phone, data.level, data.goal, data.status, data.notes, now(), id);
  return findById("students", id);
}

function archiveStudent(id) {
  assertId(id);
  db.prepare("UPDATE students SET status = 'archived', updated_at = ? WHERE id = ?").run(now(), id);
}

function listLessons(searchParams) {
  const q = clean(searchParams.get("q") || "", 80);
  const status = clean(searchParams.get("status") || "", 40);
  const studentId = Number(searchParams.get("student_id") || 0);
  const params = [];
  const where = [];

  if (q) {
    where.push("(lessons.title LIKE ? OR lessons.topic LIKE ? OR lessons.homework LIKE ? OR lessons.notes LIKE ? OR students.full_name LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like, like, like);
  }

  if (status) {
    where.push("lessons.status = ?");
    params.push(status);
  }

  if (studentId > 0) {
    where.push("lessons.student_id = ?");
    params.push(studentId);
  }

  return db.prepare(`
    SELECT lessons.*, students.full_name AS student_name
    FROM lessons
    LEFT JOIN students ON students.id = lessons.student_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY lessons.lesson_date DESC, lessons.id DESC
  `).all(...params);
}

function createLesson(body) {
  const data = normalizeLesson(body);
  const createdAt = now();
  const result = db.prepare(`
    INSERT INTO lessons
      (student_id, title, lesson_date, duration_minutes, format, status, topic, homework, materials, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.student_id,
    data.title,
    data.lesson_date,
    data.duration_minutes,
    data.format,
    data.status,
    data.topic,
    data.homework,
    data.materials,
    data.notes,
    createdAt,
    createdAt
  );
  return findLesson(result.lastInsertRowid);
}

function updateLesson(id, body) {
  assertId(id);
  const data = normalizeLesson(body);
  db.prepare(`
    UPDATE lessons
    SET student_id = ?, title = ?, lesson_date = ?, duration_minutes = ?, format = ?,
        status = ?, topic = ?, homework = ?, materials = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(
    data.student_id,
    data.title,
    data.lesson_date,
    data.duration_minutes,
    data.format,
    data.status,
    data.topic,
    data.homework,
    data.materials,
    data.notes,
    now(),
    id
  );
  return findLesson(id);
}

function findLesson(id) {
  return db.prepare(`
    SELECT lessons.*, students.full_name AS student_name
    FROM lessons
    LEFT JOIN students ON students.id = lessons.student_id
    WHERE lessons.id = ?
  `).get(Number(id));
}

function listPayments() {
  return db.prepare(`
    SELECT payments.*, students.full_name AS student_name
    FROM payments
    LEFT JOIN students ON students.id = payments.student_id
    ORDER BY paid_at DESC, id DESC
  `).all();
}

function createPayment(body) {
  const data = normalizePayment(body);
  const result = db.prepare(`
    INSERT INTO payments (student_id, amount, paid_at, method, status, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.student_id, data.amount, data.paid_at, data.method, data.status, data.note, now());
  return db.prepare(`
    SELECT payments.*, students.full_name AS student_name
    FROM payments
    LEFT JOIN students ON students.id = payments.student_id
    WHERE payments.id = ?
  `).get(result.lastInsertRowid);
}

function listLeads() {
  return db.prepare("SELECT * FROM leads ORDER BY created_at DESC, id DESC").all();
}

function createLead(body) {
  const name = requireText(body.name, "Ism", 120);
  const phone = requireText(body.phone, "Telefon", 80);
  const goal = clean(body.goal || "", 160);
  const message = clean(body.message || "", 1000);
  const result = db.prepare(`
    INSERT INTO leads (name, phone, goal, message, status, created_at)
    VALUES (?, ?, ?, ?, 'new', ?)
  `).run(name, phone, goal, message, now());
  return findById("leads", result.lastInsertRowid);
}

function updateLeadStatus(id, status) {
  assertId(id);
  const allowed = new Set(["new", "contacted", "archived"]);
  if (!allowed.has(status)) throw httpError(400, "Status noto'g'ri.");
  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
  return findById("leads", id);
}

function normalizeStudent(body) {
  const status = clean(body.status || "active", 40);
  if (!["active", "paused", "archived"].includes(status)) {
    throw httpError(400, "O'quvchi statusi noto'g'ri.");
  }

  return {
    full_name: requireText(body.full_name, "Ism", 160),
    phone: requireText(body.phone, "Telefon", 80),
    level: clean(body.level || "A1", 20) || "A1",
    goal: clean(body.goal || "", 300),
    status,
    notes: clean(body.notes || "", 1200)
  };
}

function normalizeLesson(body) {
  const status = clean(body.status || "planned", 40);
  if (!["planned", "done", "cancelled"].includes(status)) {
    throw httpError(400, "Dars statusi noto'g'ri.");
  }

  const format = clean(body.format || "online", 40);
  if (!["online", "offline", "group"].includes(format)) {
    throw httpError(400, "Dars formati noto'g'ri.");
  }

  const studentId = Number(body.student_id || 0);
  return {
    student_id: studentId > 0 ? studentId : null,
    title: requireText(body.title, "Dars nomi", 180),
    lesson_date: requireText(body.lesson_date, "Dars vaqti", 40),
    duration_minutes: clampNumber(body.duration_minutes, 15, 240, 60),
    format,
    status,
    topic: clean(body.topic || "", 800),
    homework: clean(body.homework || "", 1000),
    materials: clean(body.materials || "", 800),
    notes: clean(body.notes || "", 1200)
  };
}

function normalizePayment(body) {
  const status = clean(body.status || "paid", 40);
  if (!["paid", "pending", "cancelled"].includes(status)) {
    throw httpError(400, "To'lov statusi noto'g'ri.");
  }

  return {
    student_id: Number(body.student_id || 0) || null,
    amount: clampNumber(body.amount, 0, 999999999, 0),
    paid_at: requireText(body.paid_at || todayDate(), "To'lov sanasi", 40),
    method: clean(body.method || "naqd", 60) || "naqd",
    status,
    note: clean(body.note || "", 800)
  };
}

function findById(table, id) {
  const allowed = new Set(["students", "lessons", "payments", "leads"]);
  if (!allowed.has(table)) throw httpError(400, "Jadval nomi noto'g'ri.");
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(Number(id));
  if (!row) throw httpError(404, "Ma'lumot topilmadi.");
  return row;
}

function deleteById(table, id) {
  const allowed = new Set(["lessons", "payments", "leads"]);
  if (!allowed.has(table)) throw httpError(400, "Bu jadvaldan o'chirish mumkin emas.");
  assertId(id);
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}

function serveStatic(req, res, pathname) {
  const fileMap = new Map([
    ["/", "index.html"],
    ["/login", "admin.html"],
    ["/login/", "admin.html"],
    ["/admin", "admin.html"],
    ["/admin/", "admin.html"],
    ["/index.html", "index.html"],
    ["/admin.html", "admin.html"],
    ["/styles.css", "styles.css"],
    ["/script.js", "script.js"],
    ["/admin.js", "admin.js"]
  ]);

  let filePath;
  if (fileMap.has(pathname)) {
    filePath = path.join(ROOT, fileMap.get(pathname));
  } else if (pathname.startsWith("/assets/")) {
    filePath = path.normalize(path.join(ROOT, pathname));
  } else {
    sendText(res, 404, "Sahifa topilmadi.");
    return;
  }

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, "Fayl topilmadi.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": type });
  fs.createReadStream(filePath).pipe(res);
}

function isAuthenticated(req) {
  const token = parseCookies(req).session;
  return Boolean(token && sessions.has(token));
}

function parseCookies(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const index = item.indexOf("=");
      if (index === -1) return cookies;
      cookies[decodeURIComponent(item.slice(0, index))] = decodeURIComponent(item.slice(index + 1));
      return cookies;
    }, {});
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(httpError(413, "So'rov juda katta."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(httpError(400, "JSON noto'g'ri yuborilgan."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function sendCsv(res, filename, csv) {
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`
  });
  res.end(`\uFEFF${csv}`);
}

function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [
    columns.map(escape).join(","),
    ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))
  ].join("\n");
}

function requireText(value, label, max) {
  const text = clean(value, max);
  if (!text) throw httpError(400, `${label} kiritilishi kerak.`);
  return text;
}

function clean(value, max = 500) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function assertId(id) {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw httpError(400, "ID noto'g'ri.");
  }
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function now() {
  return new Date().toISOString();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days, hour, minute) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
