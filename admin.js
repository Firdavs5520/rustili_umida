const state = {
  activeTab: "dashboard",
  summary: null,
  students: [],
  lessons: [],
  payments: [],
  leads: [],
  storageMode: "server",
  editing: {
    student: null,
    lesson: null
  }
};

const CABINET_STORAGE_KEY = "umida-rus-tili-cabinet";
const STORAGE_COLLECTIONS = ["students", "lessons", "payments", "leads"];

const tabMeta = {
  dashboard: ["Bosh sahifa", "Bugungi holat"],
  students: ["O'quvchilar", "O'quvchilar bazasi"],
  lessons: ["Darslar", "Darslar jurnali"],
  payments: ["To'lovlar", "To'lovlar nazorati"],
  leads: ["So'rovlar", "Yangi mijoz so'rovlari"]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  wireGlobalEvents();
  const session = await fetchJson("/api/session");
  if (session.authenticated) {
    await showAdmin();
  } else {
    showLogin();
  }
}

function wireGlobalEvents() {
  $("#loginForm")?.addEventListener("submit", handleLogin);
  $("#logoutButton")?.addEventListener("click", handleLogout);

  $$(".admin-nav-item").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  document.addEventListener("submit", handlePanelSubmit);
  document.addEventListener("click", handlePanelClick);
  document.addEventListener("input", handleLocalFilter);
  document.addEventListener("change", handleLocalFilter);
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = $(".form-status", form);
  status.textContent = "Tekshirilmoqda...";

  try {
    await fetchJson("/api/login", {
      method: "POST",
      body: formToJson(form)
    });
    form.reset();
    await showAdmin();
  } catch (error) {
    status.textContent = error.message;
  }
}

async function handleLogout() {
  await fetchJson("/api/logout", { method: "POST", body: "{}" });
  showLogin();
}

async function showAdmin() {
  $("#loginScreen").classList.add("hidden");
  $("#adminShell").classList.remove("hidden");
  await loadAll();
  setTab(state.activeTab);
}

function showLogin() {
  $("#loginScreen").classList.remove("hidden");
  $("#adminShell").classList.add("hidden");
}

async function loadAll() {
  const data = await fetchJson("/api/bootstrap");
  state.storageMode = data.storage || "server";
  const source = state.storageMode === "browser" ? getClientBootstrapData() : data;
  state.summary = source.summary;
  state.students = source.students;
  state.lessons = source.lessons;
  state.payments = source.payments;
  state.leads = source.leads;
}

function setTab(tab) {
  state.activeTab = tab;
  const [kicker, title] = tabMeta[tab];
  $("#tabKicker").textContent = kicker;
  $("#tabTitle").textContent = title;

  $$(".admin-nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  $$(".admin-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tab);
  });

  renderActiveTab();
}

function renderActiveTab() {
  if (state.activeTab === "dashboard") renderDashboard();
  if (state.activeTab === "students") renderStudents();
  if (state.activeTab === "lessons") renderLessons();
  if (state.activeTab === "payments") renderPayments();
  if (state.activeTab === "leads") renderLeads();
}

function renderDashboard() {
  const summary = state.summary;
  $("#dashboardPanel").innerHTML = `
    <div class="stat-grid">
      ${statCard("Faol o'quvchi", summary.activeStudents)}
      ${statCard("Jami dars", summary.allLessons)}
      ${statCard("Rejadagi dars", summary.plannedLessons)}
      ${statCard("Yangi so'rov", summary.newLeads)}
      ${statCard("To'langan summa", money(summary.paidTotal))}
    </div>

    <div class="dashboard-grid">
      <section class="surface">
        <div class="surface-header">
          <h2>Kelgusi darslar</h2>
          <button class="button secondary compact" type="button" data-tab-jump="lessons">Dars qo'shish</button>
        </div>
        ${summary.nextLessons.length ? `
          <div class="timeline-list">
            ${summary.nextLessons.map((lesson) => `
              <article class="timeline-item">
                <time>${formatDateTime(lesson.lesson_date)}</time>
                <strong>${esc(lesson.title)}</strong>
                <span>${esc(lesson.student_name || "O'quvchi tanlanmagan")} - ${esc(lesson.format)}</span>
              </article>
            `).join("")}
          </div>
        ` : emptyState()}
      </section>

      <section class="surface">
        <div class="surface-header">
          <h2>Yangi so'rovlar</h2>
          <button class="button secondary compact" type="button" data-tab-jump="leads">Ko'rish</button>
        </div>
        ${state.leads.length ? `
          <div class="compact-list">
            ${state.leads.slice(0, 5).map((lead) => `
              <article>
                <strong>${esc(lead.name)}</strong>
                <span>${esc(lead.phone)} - ${esc(lead.goal || "Maqsad yozilmagan")}</span>
                ${badge(lead.status)}
              </article>
            `).join("")}
          </div>
        ` : emptyState()}
      </section>
    </div>
  `;
}

function renderStudents() {
  $("#studentsPanel").innerHTML = `
    <div class="data-layout">
      <form class="tool-form" id="studentForm">
        <div class="surface-header">
          <h2>${state.editing.student ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}</h2>
          <button class="button secondary compact" type="button" data-reset-form="student">Tozalash</button>
        </div>
        <label>
          Ism familiya
          <input name="full_name" placeholder="Masalan: Azizbek Karimov" required>
        </label>
        <label>
          Telefon
          <input name="phone" placeholder="+998 ..." required>
        </label>
        <label>
          Daraja
          <select name="level">
            ${options(["A0", "A1", "A2", "B1", "B2", "C1"])}
          </select>
        </label>
        <label>
          Status
          <select name="status">
            ${options(["active", "paused", "archived"])}
          </select>
        </label>
        <label class="wide">
          Maqsad
          <input name="goal" placeholder="Imtihon, suhbat, maktab darsi...">
        </label>
        <label class="wide">
          Izoh
          <textarea name="notes" rows="3" placeholder="O'quvchi haqida muhim qaydlar"></textarea>
        </label>
        <button class="button primary" type="submit">${state.editing.student ? "Saqlash" : "Qo'shish"}</button>
        <p class="admin-feedback" role="status"></p>
      </form>

      <section class="surface table-surface" data-filter-scope>
        <div class="surface-header">
          <h2>Ro'yxat</h2>
          <span class="count-pill">${state.students.length} yozuv</span>
        </div>
        <div class="table-tools">
          <input data-local-filter="search" placeholder="Qidirish: ism, telefon, maqsad">
          <select data-local-filter="status">
            <option value="">Barcha statuslar</option>
            <option value="active">Faol</option>
            <option value="paused">Pauza</option>
            <option value="archived">Arxiv</option>
          </select>
        </div>
        ${state.students.length ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>Daraja</th>
                  <th>Maqsad</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${state.students.map(studentRow).join("")}
              </tbody>
            </table>
          </div>
        ` : emptyState()}
      </section>
    </div>
  `;

  if (state.editing.student) fillForm($("#studentForm"), state.editing.student);
}

function renderLessons() {
  $("#lessonsPanel").innerHTML = `
    <div class="data-layout">
      <form class="tool-form" id="lessonForm">
        <div class="surface-header">
          <h2>${state.editing.lesson ? "Darsni tahrirlash" : "Yangi dars"}</h2>
          <button class="button secondary compact" type="button" data-reset-form="lesson">Tozalash</button>
        </div>
        <label>
          O'quvchi
          <select name="student_id">
            <option value="">Tanlanmagan</option>
            ${studentOptions()}
          </select>
        </label>
        <label>
          Dars nomi
          <input name="title" placeholder="Masalan: Fe'llar zamoni" required>
        </label>
        <label>
          Vaqt
          <input name="lesson_date" type="datetime-local" required>
        </label>
        <label>
          Davomiylik
          <input name="duration_minutes" type="number" min="15" max="240" step="15" value="60">
        </label>
        <label>
          Format
          <select name="format">
            ${options(["online", "offline", "group"])}
          </select>
        </label>
        <label>
          Status
          <select name="status">
            ${options(["planned", "done", "cancelled"])}
          </select>
        </label>
        <label class="wide">
          Mavzu
          <textarea name="topic" rows="3" placeholder="Bugun o'tiladigan yoki o'tilgan mavzu"></textarea>
        </label>
        <label class="wide">
          Uyga vazifa
          <textarea name="homework" rows="3" placeholder="Keyingi darsgacha bajariladigan mashqlar"></textarea>
        </label>
        <label class="wide">
          Materiallar
          <input name="materials" placeholder="PDF, link, kitob sahifasi, audio...">
        </label>
        <label class="wide">
          Izoh
          <textarea name="notes" rows="3" placeholder="Xatolar, progress, keyingi reja"></textarea>
        </label>
        <button class="button primary" type="submit">${state.editing.lesson ? "Saqlash" : "Qo'shish"}</button>
        <p class="admin-feedback" role="status"></p>
      </form>

      <section class="surface table-surface" data-filter-scope>
        <div class="surface-header">
          <h2>Darslar</h2>
          <span class="count-pill">${state.lessons.length} yozuv</span>
        </div>
        <div class="table-tools">
          <input data-local-filter="search" placeholder="Qidirish: mavzu, o'quvchi, vazifa">
          <select data-local-filter="status">
            <option value="">Barcha statuslar</option>
            <option value="planned">Rejada</option>
            <option value="done">O'tilgan</option>
            <option value="cancelled">Bekor</option>
          </select>
        </div>
        ${state.lessons.length ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Dars</th>
                  <th>O'quvchi</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${state.lessons.map(lessonRow).join("")}
              </tbody>
            </table>
          </div>
        ` : emptyState()}
      </section>
    </div>
  `;

  if (state.editing.lesson) fillForm($("#lessonForm"), state.editing.lesson);
}

function renderPayments() {
  $("#paymentsPanel").innerHTML = `
    <div class="data-layout">
      <form class="tool-form" id="paymentForm">
        <div class="surface-header">
          <h2>To'lov qo'shish</h2>
        </div>
        <label>
          O'quvchi
          <select name="student_id">
            <option value="">Tanlanmagan</option>
            ${studentOptions()}
          </select>
        </label>
        <label>
          Summa
          <input name="amount" type="number" min="0" step="1000" placeholder="150000" required>
        </label>
        <label>
          Sana
          <input name="paid_at" type="date" value="${today()}" required>
        </label>
        <label>
          Usul
          <select name="method">
            ${options(["naqd", "karta", "click", "payme", "bank"])}
          </select>
        </label>
        <label>
          Status
          <select name="status">
            ${options(["paid", "pending", "cancelled"])}
          </select>
        </label>
        <label class="wide">
          Izoh
          <input name="note" placeholder="Qaysi oy yoki nechta dars uchun">
        </label>
        <button class="button primary" type="submit">Qo'shish</button>
        <p class="admin-feedback" role="status"></p>
      </form>

      <section class="surface table-surface" data-filter-scope>
        <div class="surface-header">
          <h2>To'lovlar</h2>
          <span class="count-pill">${state.payments.length} yozuv</span>
        </div>
        <div class="table-tools">
          <input data-local-filter="search" placeholder="Qidirish: o'quvchi, izoh, usul">
          <select data-local-filter="status">
            <option value="">Barcha statuslar</option>
            <option value="paid">To'langan</option>
            <option value="pending">Kutilmoqda</option>
            <option value="cancelled">Bekor</option>
          </select>
        </div>
        ${state.payments.length ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>O'quvchi</th>
                  <th>Summa</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${state.payments.map(paymentRow).join("")}
              </tbody>
            </table>
          </div>
        ` : emptyState()}
      </section>
    </div>
  `;
}

function renderLeads() {
  $("#leadsPanel").innerHTML = `
    <section class="surface table-surface" data-filter-scope>
      <div class="surface-header">
        <h2>Saytdan kelgan so'rovlar</h2>
        <span class="count-pill">${state.leads.length} yozuv</span>
      </div>
      <div class="table-tools">
        <input data-local-filter="search" placeholder="Qidirish: ism, telefon, maqsad">
        <select data-local-filter="status">
          <option value="">Barcha statuslar</option>
          <option value="new">Yangi</option>
          <option value="contacted">Bog'langan</option>
          <option value="archived">Arxiv</option>
        </select>
      </div>
      ${state.leads.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sana</th>
                <th>Mijoz</th>
                <th>Maqsad</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${state.leads.map(leadRow).join("")}
            </tbody>
          </table>
        </div>
      ` : emptyState()}
    </section>
  `;
}

async function handlePanelSubmit(event) {
  const form = event.target;
  if (!["studentForm", "lessonForm", "paymentForm"].includes(form.id)) return;
  event.preventDefault();

  const feedback = $(".admin-feedback", form);
  feedback.textContent = "Saqlanmoqda...";

  try {
    if (form.id === "studentForm") {
      const id = state.editing.student?.id;
      await fetchJson(id ? `/api/students/${id}` : "/api/students", {
        method: id ? "PUT" : "POST",
        body: formToJson(form)
      });
      state.editing.student = null;
      await loadAll();
      renderStudents();
    }

    if (form.id === "lessonForm") {
      const id = state.editing.lesson?.id;
      await fetchJson(id ? `/api/lessons/${id}` : "/api/lessons", {
        method: id ? "PUT" : "POST",
        body: formToJson(form)
      });
      state.editing.lesson = null;
      await loadAll();
      renderLessons();
    }

    if (form.id === "paymentForm") {
      await fetchJson("/api/payments", {
        method: "POST",
        body: formToJson(form)
      });
      form.reset();
      await loadAll();
      renderPayments();
    }
  } catch (error) {
    feedback.textContent = error.message;
  }
}

async function handlePanelClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const jump = button.dataset.tabJump;
  if (jump) {
    setTab(jump);
    return;
  }

  if (button.dataset.resetForm === "student") {
    state.editing.student = null;
    renderStudents();
    return;
  }

  if (button.dataset.resetForm === "lesson") {
    state.editing.lesson = null;
    renderLessons();
    return;
  }

  const id = Number(button.dataset.id || 0);
  const action = button.dataset.action;

  if (action === "edit-student") {
    state.editing.student = state.students.find((student) => student.id === id);
    renderStudents();
    $("#studentForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (action === "archive-student") {
    if (!confirm("O'quvchini arxivga o'tkazamizmi?")) return;
    await fetchJson(`/api/students/${id}`, { method: "DELETE", body: "{}" });
    await loadAll();
    renderStudents();
  }

  if (action === "edit-lesson") {
    state.editing.lesson = state.lessons.find((lesson) => lesson.id === id);
    renderLessons();
    $("#lessonForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (action === "delete-lesson") {
    if (!confirm("Dars yozuvini o'chiramizmi?")) return;
    await fetchJson(`/api/lessons/${id}`, { method: "DELETE", body: "{}" });
    await loadAll();
    renderLessons();
  }

  if (action === "delete-payment") {
    if (!confirm("To'lov yozuvini o'chiramizmi?")) return;
    await fetchJson(`/api/payments/${id}`, { method: "DELETE", body: "{}" });
    await loadAll();
    renderPayments();
  }

  if (action === "lead-contacted" || action === "lead-archived") {
    await fetchJson(`/api/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: action === "lead-contacted" ? "contacted" : "archived" })
    });
    await loadAll();
    renderLeads();
  }

  if (action === "delete-lead") {
    if (!confirm("So'rovni o'chiramizmi?")) return;
    await fetchJson(`/api/leads/${id}`, { method: "DELETE", body: "{}" });
    await loadAll();
    renderLeads();
  }
}

function handleLocalFilter(event) {
  const control = event.target.closest("[data-local-filter]");
  if (!control) return;

  const scope = control.closest("[data-filter-scope]");
  if (!scope) return;

  const search = ($('[data-local-filter="search"]', scope)?.value || "").toLowerCase().trim();
  const status = $('[data-local-filter="status"]', scope)?.value || "";

  $$("tbody tr", scope).forEach((row) => {
    const matchesSearch = !search || row.dataset.search.includes(search);
    const matchesStatus = !status || row.dataset.status === status;
    row.hidden = !(matchesSearch && matchesStatus);
  });
}

function studentRow(student) {
  return `
    <tr data-status="${esc(student.status)}" data-search="${searchText(student.full_name, student.phone, student.goal, student.notes)}">
      <td>
        <strong>${esc(student.full_name)}</strong>
        <span>${esc(student.phone)}</span>
      </td>
      <td>${esc(student.level)}</td>
      <td>${esc(student.goal || "-")}</td>
      <td>${badge(student.status)}</td>
      <td class="row-actions">
        <button class="button secondary compact" type="button" data-action="edit-student" data-id="${student.id}">Edit</button>
        <button class="button danger compact" type="button" data-action="archive-student" data-id="${student.id}">Arxiv</button>
      </td>
    </tr>
  `;
}

function lessonRow(lesson) {
  return `
    <tr data-status="${esc(lesson.status)}" data-search="${searchText(lesson.title, lesson.student_name, lesson.topic, lesson.homework, lesson.notes)}">
      <td>
        <strong>${formatDateTime(lesson.lesson_date)}</strong>
        <span>${esc(lesson.duration_minutes)} daqiqa - ${esc(lesson.format)}</span>
      </td>
      <td>
        <strong>${esc(lesson.title)}</strong>
        <span>${esc(lesson.topic || "-")}</span>
      </td>
      <td>${esc(lesson.student_name || "Tanlanmagan")}</td>
      <td>${badge(lesson.status)}</td>
      <td class="row-actions">
        <button class="button secondary compact" type="button" data-action="edit-lesson" data-id="${lesson.id}">Edit</button>
        <button class="button danger compact" type="button" data-action="delete-lesson" data-id="${lesson.id}">O'chirish</button>
      </td>
    </tr>
  `;
}

function paymentRow(payment) {
  return `
    <tr data-status="${esc(payment.status)}" data-search="${searchText(payment.student_name, payment.method, payment.note, payment.amount)}">
      <td>${formatDate(payment.paid_at)}</td>
      <td>${esc(payment.student_name || "Tanlanmagan")}</td>
      <td><strong>${money(payment.amount)}</strong><span>${esc(payment.method)}</span></td>
      <td>${badge(payment.status)}</td>
      <td class="row-actions">
        <button class="button danger compact" type="button" data-action="delete-payment" data-id="${payment.id}">O'chirish</button>
      </td>
    </tr>
  `;
}

function leadRow(lead) {
  return `
    <tr data-status="${esc(lead.status)}" data-search="${searchText(lead.name, lead.phone, lead.goal, lead.message)}">
      <td>${formatDateTime(lead.created_at)}</td>
      <td>
        <strong>${esc(lead.name)}</strong>
        <span>${esc(lead.phone)}</span>
      </td>
      <td>
        <strong>${esc(lead.goal || "-")}</strong>
        <span>${esc(lead.message || "")}</span>
      </td>
      <td>${badge(lead.status)}</td>
      <td class="row-actions">
        <button class="button secondary compact" type="button" data-action="lead-contacted" data-id="${lead.id}">Bog'landim</button>
        <button class="button danger compact" type="button" data-action="lead-archived" data-id="${lead.id}">Arxiv</button>
        <button class="button danger ghost compact" type="button" data-action="delete-lead" data-id="${lead.id}">O'chirish</button>
      </td>
    </tr>
  `;
}

function studentOptions() {
  return state.students
    .filter((student) => student.status !== "archived")
    .map((student) => `<option value="${student.id}">${esc(student.full_name)} - ${esc(student.level)}</option>`)
    .join("");
}

function options(values) {
  return values.map((value) => `<option value="${esc(value)}">${esc(label(value))}</option>`).join("");
}

function statCard(labelText, value) {
  return `
    <article class="stat-card">
      <span>${esc(labelText)}</span>
      <strong>${esc(value)}</strong>
    </article>
  `;
}

function badge(status) {
  return `<span class="badge ${esc(status)}">${esc(label(status))}</span>`;
}

function label(value) {
  const labels = {
    active: "Faol",
    paused: "Pauza",
    archived: "Arxiv",
    planned: "Rejada",
    done: "O'tilgan",
    cancelled: "Bekor",
    online: "Online",
    offline: "Offline",
    group: "Guruh",
    paid: "To'langan",
    pending: "Kutilmoqda",
    new: "Yangi",
    contacted: "Bog'langan",
    naqd: "Naqd",
    karta: "Karta",
    click: "Click",
    payme: "Payme",
    bank: "Bank"
  };
  return labels[value] || value;
}

function emptyState() {
  return $("#emptyStateTemplate").innerHTML;
}

function fillForm(form, data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    field.value = value ?? "";
  });
}

function getClientBootstrapData() {
  const store = readCabinetStore();
  const students = [...store.students];
  const lessons = withStudentNames(store.lessons, students);
  const payments = withStudentNames(store.payments, students);
  const leads = [...store.leads];

  return {
    summary: getClientSummary({ students, lessons, payments, leads }),
    students,
    lessons,
    payments,
    leads
  };
}

function getClientSummary(data) {
  const nextLessons = data.lessons
    .filter((lesson) => lesson.status === "planned")
    .sort((a, b) => String(a.lesson_date).localeCompare(String(b.lesson_date)))
    .slice(0, 5);

  return {
    activeStudents: data.students.filter((student) => student.status === "active").length,
    allLessons: data.lessons.length,
    plannedLessons: data.lessons.filter((lesson) => lesson.status === "planned").length,
    newLeads: data.leads.filter((lead) => lead.status === "new").length,
    paidTotal: data.payments
      .filter((payment) => payment.status === "paid")
      .reduce((total, payment) => total + Number(payment.amount || 0), 0),
    nextLessons
  };
}

function readCabinetStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CABINET_STORAGE_KEY) || "{}");
    const normalized = {
      nextIds: { ...(parsed.nextIds || {}) },
      students: Array.isArray(parsed.students) ? parsed.students : [],
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      leads: Array.isArray(parsed.leads) ? parsed.leads : []
    };

    STORAGE_COLLECTIONS.forEach((collection) => {
      const highestId = Math.max(0, ...normalized[collection].map((item) => Number(item.id || 0)));
      normalized.nextIds[collection] = Math.max(Number(normalized.nextIds[collection] || 1), highestId + 1);
    });

    return normalized;
  } catch {
    return {
      nextIds: { students: 1, lessons: 1, payments: 1, leads: 1 },
      students: [],
      lessons: [],
      payments: [],
      leads: []
    };
  }
}

function writeCabinetStore(store) {
  localStorage.setItem(CABINET_STORAGE_KEY, JSON.stringify(store));
}

function nextClientId(store, collection) {
  const id = Number(store.nextIds[collection] || 1);
  store.nextIds[collection] = id + 1;
  return id;
}

function withStudentNames(items, students) {
  return items.map((item) => ({
    ...item,
    student_name: students.find((student) => String(student.id) === String(item.student_id))?.full_name || ""
  }));
}

async function handleClientApi(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const { pathname } = new URL(url, window.location.origin);
  const store = readCabinetStore();
  const body = parseClientBody(options.body);
  const timestamp = new Date().toISOString();

  if (pathname === "/api/students" && method === "POST") {
    store.students.unshift({
      id: nextClientId(store, "students"),
      full_name: body.full_name || "",
      phone: body.phone || "",
      level: body.level || "A1",
      goal: body.goal || "",
      status: body.status || "active",
      notes: body.notes || "",
      created_at: timestamp,
      updated_at: timestamp
    });
    writeCabinetStore(store);
    return { ok: true };
  }

  const studentMatch = pathname.match(/^\/api\/students\/(\d+)$/);
  if (studentMatch && method === "PUT") {
    updateClientItem(store, "students", Number(studentMatch[1]), { ...body, updated_at: timestamp });
    writeCabinetStore(store);
    return { ok: true };
  }

  if (studentMatch && method === "DELETE") {
    updateClientItem(store, "students", Number(studentMatch[1]), { status: "archived", updated_at: timestamp });
    writeCabinetStore(store);
    return { ok: true };
  }

  if (pathname === "/api/lessons" && method === "POST") {
    store.lessons.unshift({
      id: nextClientId(store, "lessons"),
      student_id: body.student_id || "",
      title: body.title || "",
      lesson_date: body.lesson_date || timestamp,
      duration_minutes: Number(body.duration_minutes || 60),
      format: body.format || "online",
      status: body.status || "planned",
      topic: body.topic || "",
      homework: body.homework || "",
      materials: body.materials || "",
      notes: body.notes || "",
      created_at: timestamp,
      updated_at: timestamp
    });
    writeCabinetStore(store);
    return { ok: true };
  }

  const lessonMatch = pathname.match(/^\/api\/lessons\/(\d+)$/);
  if (lessonMatch && method === "PUT") {
    updateClientItem(store, "lessons", Number(lessonMatch[1]), {
      ...body,
      duration_minutes: Number(body.duration_minutes || 60),
      updated_at: timestamp
    });
    writeCabinetStore(store);
    return { ok: true };
  }

  if (lessonMatch && method === "DELETE") {
    removeClientItem(store, "lessons", Number(lessonMatch[1]));
    writeCabinetStore(store);
    return { ok: true };
  }

  if (pathname === "/api/payments" && method === "POST") {
    store.payments.unshift({
      id: nextClientId(store, "payments"),
      student_id: body.student_id || "",
      amount: Number(body.amount || 0),
      paid_at: body.paid_at || today(),
      method: body.method || "naqd",
      status: body.status || "paid",
      note: body.note || "",
      created_at: timestamp
    });
    writeCabinetStore(store);
    return { ok: true };
  }

  const paymentMatch = pathname.match(/^\/api\/payments\/(\d+)$/);
  if (paymentMatch && method === "DELETE") {
    removeClientItem(store, "payments", Number(paymentMatch[1]));
    writeCabinetStore(store);
    return { ok: true };
  }

  const leadMatch = pathname.match(/^\/api\/leads\/(\d+)$/);
  if (leadMatch && method === "PUT") {
    updateClientItem(store, "leads", Number(leadMatch[1]), { status: body.status || "contacted" });
    writeCabinetStore(store);
    return { ok: true };
  }

  if (leadMatch && method === "DELETE") {
    removeClientItem(store, "leads", Number(leadMatch[1]));
    writeCabinetStore(store);
    return { ok: true };
  }

  throw new Error("Bu amal vaqtincha ishlamadi.");
}

function parseClientBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function updateClientItem(store, collection, id, values) {
  const index = store[collection].findIndex((item) => Number(item.id) === id);
  if (index === -1) return;
  store[collection][index] = { ...store[collection][index], ...values };
}

function removeClientItem(store, collection, id) {
  store[collection] = store[collection].filter((item) => Number(item.id) !== id);
}

async function fetchJson(url, options = {}) {
  if (state.storageMode === "browser" && isClientCabinetPath(url)) {
    return handleClientApi(url, options);
  }

  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    if (response.status === 401) showLogin();
    throw new Error(data.error || "So'rov bajarilmadi.");
  }
  return data;
}

function isClientCabinetPath(url) {
  const { pathname } = new URL(url, window.location.origin);
  return /^\/api\/(?:students|lessons|payments)(?:\/\d+)?$/.test(pathname)
    || /^\/api\/leads\/\d+$/.test(pathname);
}

function formToJson(form) {
  return JSON.stringify(Object.fromEntries(new FormData(form).entries()));
}

function formatDateTime(value) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ");
}

function money(value) {
  return `${new Intl.NumberFormat("uz-UZ").format(Number(value || 0))} so'm`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function searchText(...parts) {
  return esc(parts.filter(Boolean).join(" ").toLowerCase());
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
