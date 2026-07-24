const state = {
  activeTab: "dashboard",
  summary: null,
  students: [],
  lessons: [],
  payments: [],
  leads: [],
  storageMode: "server",
  remindersEnabled: false,
  reminderMessage: "",
  editing: {
    student: null,
    lesson: null
  }
};

const CABINET_STORAGE_KEY = "umida-rus-tili-cabinet";
const STORAGE_COLLECTIONS = ["students", "lessons", "payments", "leads"];
const REMINDER_ENABLED_KEY = "umida-rus-tili-reminders";
const REMINDER_SENT_KEY = "umida-rus-tili-reminder-sent";
const REMINDER_LEAD_MINUTES = 10;
const PAYMENT_REMINDER_LEAD_HOURS = 24;
const PAYMENT_DEFAULT_TIME = "09:00";
let reminderTimer = 0;

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
  state.remindersEnabled = readReminderSetting();
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
  startLessonReminderLoop();
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

    ${renderReminderCard()}
    ${renderStorageCard()}

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
                <time>${lessonTimeRange(lesson)}</time>
                <strong>${esc(lesson.title)}</strong>
                <span>${esc(lesson.student_name || "O'quvchi tanlanmagan")} - ${lessonFormatLabel(lesson.format)}</span>
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

function renderReminderCard() {
  const supported = "Notification" in window;
  const permission = supported ? Notification.permission : "unsupported";
  const enabled = state.remindersEnabled && permission === "granted";
  const statusText = state.reminderMessage || getReminderStatusText(supported, permission, enabled);

  return `
    <section class="surface reminder-card">
      <div>
        <p class="section-kicker">Eslatma</p>
        <h2>Dars va to'lov xabarlari</h2>
        <p>${esc(statusText)}</p>
      </div>
      <button class="button ${enabled ? "secondary" : "primary"} compact" type="button" data-action="toggle-reminders">
        ${enabled ? "Eslatmani o'chirish" : "Eslatmani yoqish"}
      </button>
    </section>
  `;
}

function getReminderStatusText(supported, permission, enabled) {
  if (!supported) return "Bu brauzer notification xabarlarini qo'llamaydi.";
  if (permission === "denied") return "Brauzer notification ruxsatini bloklagan. Ruxsatni browser sozlamasidan ochish kerak.";
  if (enabled) return `Darsdan ${REMINDER_LEAD_MINUTES} daqiqa oldin, to'lovdan ${PAYMENT_REMINDER_LEAD_HOURS} soat oldin va vaqti kelganda browser xabari chiqadi.`;
  return "Yoqsangiz, panel ochiq turganda dars va kutilayotgan to'lovlar bo'yicha browser xabari chiqadi.";
}

function renderStorageCard() {
  const isBrowserStorage = state.storageMode === "browser";
  const text = isBrowserStorage
    ? "Ma'lumotlar shu telefon yoki kompyuter brauzerida avtomatik saqlanadi. Browser xotirasi tozalansa yoki boshqa qurilmadan kirsangiz, u yerda alohida bo'ladi."
    : "Ma'lumotlar lokal serverdagi bazada saqlanadi.";

  return `
    <section class="surface storage-card">
      <div>
        <p class="section-kicker">Saqlash</p>
        <h2>Avtomatik xotira</h2>
        <p>${esc(text)}</p>
      </div>
    </section>
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
  enhanceAdminControls($("#studentsPanel"));
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
          Boshlanish vaqti
          <input name="lesson_date" type="text" inputmode="numeric" autocomplete="off" data-datetime-input placeholder="24.07.2026 14:00" required>
        </label>
        <label>
          Tugash vaqti
          <input name="lesson_end" type="text" inputmode="numeric" autocomplete="off" data-time-input placeholder="15:00" required>
          <input name="duration_minutes" type="hidden" value="60">
        </label>
        <label>
          Dars turi
          <select name="format">
            ${lessonFormatOptions()}
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
                  <th>Vaqt</th>
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

  const lessonForm = $("#lessonForm");
  if (state.editing.lesson) {
    fillForm(lessonForm, state.editing.lesson);
    fillLessonComputedFields(lessonForm, state.editing.lesson);
  }
  enhanceAdminControls($("#lessonsPanel"));
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
          <input name="paid_at" type="text" inputmode="numeric" autocomplete="off" data-date-input value="${dateInputDisplay(today())}" placeholder="24.07.2026" required>
        </label>
        <label>
          To'lov vaqti
          <input name="payment_time" type="text" inputmode="numeric" autocomplete="off" data-time-input value="${PAYMENT_DEFAULT_TIME}" placeholder="09:00" required>
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
            ${options(["pending", "paid", "cancelled"])}
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
                  <th>Vaqt</th>
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
  enhanceAdminControls($("#paymentsPanel"));
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
  enhanceAdminControls($("#leadsPanel"));
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
        body: lessonFormToJson(form)
      });
      state.editing.lesson = null;
      await loadAll();
      renderLessons();
    }

    if (form.id === "paymentForm") {
      await fetchJson("/api/payments", {
        method: "POST",
        body: paymentFormToJson(form)
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
  const selectToggle = event.target.closest("[data-custom-select-toggle]");
  if (selectToggle) {
    toggleCustomSelect(selectToggle);
    return;
  }

  const selectOption = event.target.closest("[data-custom-select-option]");
  if (selectOption) {
    chooseCustomSelectOption(selectOption);
    return;
  }

  if (!event.target.closest(".custom-select")) closeCustomSelects();

  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "toggle-reminders") {
    await toggleLessonReminders();
    renderActiveTab();
    return;
  }

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

  if (action === "payment-paid") {
    await fetchJson(`/api/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "paid" })
    });
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

function enhanceAdminControls(root = document) {
  $$("select:not([data-select-enhanced])", root).forEach(enhanceCustomSelect);
  $$("[data-date-input], [data-time-input], [data-datetime-input]", root).forEach(enhanceDateTimeInput);
}

function enhanceCustomSelect(select) {
  select.dataset.selectEnhanced = "true";
  select.classList.add("native-select");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.dataset.customSelectToggle = "";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const list = document.createElement("div");
  list.className = "custom-select-list";
  list.setAttribute("role", "listbox");

  [...select.options].forEach((option) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "custom-select-option";
    item.dataset.customSelectOption = option.value;
    item.setAttribute("role", "option");
    item.textContent = option.textContent;
    list.append(item);
  });

  wrapper.append(trigger, list);
  select.insertAdjacentElement("afterend", wrapper);
  syncCustomSelect(select);
}

function toggleCustomSelect(trigger) {
  const wrapper = trigger.closest(".custom-select");
  const isOpen = wrapper.classList.contains("open");
  closeCustomSelects(wrapper);
  wrapper.classList.toggle("open", !isOpen);
  trigger.setAttribute("aria-expanded", String(!isOpen));
}

function chooseCustomSelectOption(optionButton) {
  const wrapper = optionButton.closest(".custom-select");
  const select = wrapper?.previousElementSibling;
  if (!select) return;

  select.value = optionButton.dataset.customSelectOption || "";
  syncCustomSelect(select);
  select.dispatchEvent(new Event("change", { bubbles: true }));
  closeCustomSelects();
}

function closeCustomSelects(except = null) {
  $$(".custom-select.open").forEach((wrapper) => {
    if (wrapper === except) return;
    wrapper.classList.remove("open");
    $("[data-custom-select-toggle]", wrapper)?.setAttribute("aria-expanded", "false");
  });
}

function syncCustomSelect(select) {
  const wrapper = select.nextElementSibling;
  if (!wrapper?.classList.contains("custom-select")) return;

  const selected = select.options[select.selectedIndex] || select.options[0];
  const trigger = $("[data-custom-select-toggle]", wrapper);
  if (trigger) trigger.textContent = selected?.textContent || "Tanlang";

  $$("[data-custom-select-option]", wrapper).forEach((button) => {
    const isSelected = button.dataset.customSelectOption === select.value;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
}

function enhanceDateTimeInput(input) {
  if (input.dataset.dateTimeEnhanced) return;
  input.dataset.dateTimeEnhanced = "true";

  input.addEventListener("input", () => {
    const kind = input.dataset.datetimeInput !== undefined
      ? "datetime"
      : input.dataset.dateInput !== undefined
        ? "date"
        : "time";
    input.value = maskDateTimeValue(input.value, kind);
  });
}

function maskDateTimeValue(value, kind) {
  const digits = String(value || "").replace(/\D/g, "");
  if (kind === "time") return joinParts(digits.slice(0, 4), [2], ":");
  if (kind === "date") return joinParts(digits.slice(0, 8), [2, 4], ".");
  return `${joinParts(digits.slice(0, 8), [2, 4], ".")}${digits.length > 8 ? ` ${joinParts(digits.slice(8, 12), [2], ":")}` : ""}`;
}

function joinParts(value, splitAt, separator) {
  const parts = [];
  let start = 0;
  splitAt.forEach((end) => {
    if (value.length > start) parts.push(value.slice(start, Math.min(end, value.length)));
    start = end;
  });
  if (value.length > start) parts.push(value.slice(start));
  return parts.join(separator);
}

function studentRow(student) {
  return `
    <tr data-status="${esc(student.status)}" data-search="${searchText(student.full_name, student.phone, student.goal, student.notes)}">
      <td data-label="O'quvchi">
        <strong>${esc(student.full_name)}</strong>
        <span>${esc(student.phone)}</span>
      </td>
      <td data-label="Daraja">${esc(student.level)}</td>
      <td data-label="Maqsad">${esc(student.goal || "-")}</td>
      <td data-label="Status">${badge(student.status)}</td>
      <td class="row-actions" data-label="Amallar">
        <button class="button secondary compact" type="button" data-action="edit-student" data-id="${student.id}">Edit</button>
        <button class="button danger compact" type="button" data-action="archive-student" data-id="${student.id}">Arxiv</button>
      </td>
    </tr>
  `;
}

function lessonRow(lesson) {
  return `
    <tr data-status="${esc(lesson.status)}" data-search="${searchText(lesson.title, lesson.student_name, lessonFormatLabel(lesson.format), lesson.topic, lesson.homework, lesson.notes)}">
      <td data-label="Vaqt">
        <strong>${lessonTimeRange(lesson)}</strong>
        <span>${esc(lesson.duration_minutes)} daqiqa</span>
      </td>
      <td data-label="Dars">
        <strong>${esc(lesson.title)}</strong>
        <span>${lessonFormatLabel(lesson.format)} - ${esc(lesson.topic || "-")}</span>
      </td>
      <td data-label="O'quvchi">${esc(lesson.student_name || "Tanlanmagan")}</td>
      <td data-label="Status">${badge(lesson.status)}</td>
      <td class="row-actions" data-label="Amallar">
        <button class="button secondary compact" type="button" data-action="edit-lesson" data-id="${lesson.id}">Edit</button>
        <button class="button danger compact" type="button" data-action="delete-lesson" data-id="${lesson.id}">O'chirish</button>
      </td>
    </tr>
  `;
}

function paymentRow(payment) {
  return `
    <tr data-status="${esc(payment.status)}" data-search="${searchText(payment.student_name, payment.method, payment.note, payment.amount, paymentDueText(payment))}">
      <td data-label="Vaqt">${paymentDueLabel(payment)}</td>
      <td data-label="O'quvchi">${esc(payment.student_name || "Tanlanmagan")}</td>
      <td data-label="Summa"><strong>${money(payment.amount)}</strong><span>${esc(payment.method)}</span></td>
      <td data-label="Status">${badge(payment.status)}</td>
      <td class="row-actions" data-label="Amallar">
        ${payment.status === "pending" ? `<button class="button secondary compact" type="button" data-action="payment-paid" data-id="${payment.id}">To'landi</button>` : ""}
        <button class="button danger compact" type="button" data-action="delete-payment" data-id="${payment.id}">O'chirish</button>
      </td>
    </tr>
  `;
}

function leadRow(lead) {
  return `
    <tr data-status="${esc(lead.status)}" data-search="${searchText(lead.name, lead.phone, lead.goal, lead.message)}">
      <td data-label="Vaqt">${formatDateTime(lead.created_at)}</td>
      <td data-label="Mijoz">
        <strong>${esc(lead.name)}</strong>
        <span>${esc(lead.phone)}</span>
      </td>
      <td data-label="Maqsad">
        <strong>${esc(lead.goal || "-")}</strong>
        <span>${esc(lead.message || "")}</span>
      </td>
      <td data-label="Status">${badge(lead.status)}</td>
      <td class="row-actions" data-label="Amallar">
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

function lessonFormatOptions() {
  return ["individual-online", "individual-offline", "group-online", "group-offline"]
    .map((value) => `<option value="${esc(value)}">${lessonFormatLabel(value)}</option>`)
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
    individual: "Individual",
    "individual-online": "Individual online",
    "individual-offline": "Individual offline",
    "group-online": "Guruh online",
    "group-offline": "Guruh offline",
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

function lessonFormatLabel(value) {
  return esc(label(value));
}

function emptyState() {
  return $("#emptyStateTemplate").innerHTML;
}

function fillForm(form, data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.dataset?.datetimeInput !== undefined) {
      field.value = dateTimeInputDisplay(value);
    } else if (field.dataset?.dateInput !== undefined) {
      field.value = dateInputDisplay(value);
    } else {
      field.value = value ?? "";
    }
  });
}

function fillLessonComputedFields(form, lesson) {
  if (!form) return;

  const formatField = form.elements.format;
  if (formatField && !formatField.value) {
    formatField.value = normalizeLessonFormat(lesson.format);
  }

  const endField = form.elements.lesson_end;
  if (endField) {
    endField.value = lesson.lesson_end || getLessonEndValue(lesson);
  }
}

function lessonFormToJson(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.lesson_date = normalizeDateTimeInput(data.lesson_date, "Boshlanish vaqtini 24.07.2026 14:00 ko'rinishida kiriting.");
  data.lesson_end = normalizeTimeInput(data.lesson_end, "Tugash vaqtini 15:00 ko'rinishida kiriting.");
  data.format = normalizeLessonFormat(data.format);
  data.duration_minutes = getLessonDuration(data.lesson_date, data.lesson_end, data.duration_minutes);
  return JSON.stringify(data);
}

function paymentFormToJson(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.paid_at = normalizeDateInput(data.paid_at, "To'lov sanasini 24.07.2026 ko'rinishida kiriting.");
  data.payment_time = normalizeTimeInput(data.payment_time, "To'lov vaqtini 09:00 ko'rinishida kiriting.");
  return JSON.stringify(data);
}

function normalizeDateTimeInput(value, message) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
  if (!match) throw new Error(message);

  const [, day, month, year, hour, minute] = match;
  const date = buildCheckedDate(year, month, day, hour, minute, message);
  return `${formatMachineDate(date)}T${formatMachineTime(date)}`;
}

function normalizeDateInput(value, message) {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) throw new Error(message);

  const [, day, month, year] = match;
  const date = buildCheckedDate(year, month, day, 0, 0, message);
  return formatMachineDate(date);
}

function normalizeTimeInput(value, message) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) throw new Error(message);

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new Error(message);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildCheckedDate(year, month, day, hour, minute, message) {
  const numbers = [year, month, day, hour, minute].map(Number);
  if (numbers.some((item) => Number.isNaN(item))) throw new Error(message);

  const [yyyy, mm, dd, hh, min] = numbers;
  const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd ||
    date.getHours() !== hh ||
    date.getMinutes() !== min
  ) {
    throw new Error(message);
  }
  return date;
}

function dateTimeInputDisplay(value) {
  const date = parseLessonDate(value);
  if (!date) return value || "";
  return `${formatDisplayDate(date)} ${formatMachineTime(date)}`;
}

function dateInputDisplay(value) {
  if (!value) return "";
  const date = new Date(`${String(value).slice(0, 10)}T00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return formatDisplayDate(date);
}

function formatDisplayDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function formatMachineDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMachineTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizeLessonFormat(value) {
  const format = String(value || "").trim();
  if (format === "online") return "individual-online";
  if (format === "offline") return "individual-offline";
  if (format === "group") return "group-offline";
  return format || "individual-online";
}

function lessonTimeRange(lesson) {
  const startDate = parseLessonDate(lesson.lesson_date);
  if (!startDate) return esc(formatDateTime(lesson.lesson_date));

  const endDate = new Date(startDate.getTime() + Number(lesson.duration_minutes || 60) * 60000);
  return esc(`${formatDateObject(startDate)}, ${formatClock(startDate)} - ${formatClock(endDate)}`);
}

function getLessonEndValue(lesson) {
  const startDate = parseLessonDate(lesson.lesson_date);
  if (!startDate) return "";
  const endDate = new Date(startDate.getTime() + Number(lesson.duration_minutes || 60) * 60000);
  return `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
}

function getLessonDuration(startValue, endValue, fallback = 60) {
  const startDate = parseLessonDate(startValue);
  const [hours, minutes] = String(endValue || "").split(":").map(Number);
  if (!startDate || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Math.min(480, Math.max(15, Number(fallback || 60)));
  }

  const endDate = new Date(startDate);
  endDate.setHours(hours, minutes, 0, 0);
  if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);

  const duration = Math.round((endDate - startDate) / 60000);
  return Math.min(480, Math.max(15, duration));
}

function parseLessonDate(value) {
  if (!value) return null;
  const normalized = String(value).includes("T") ? value : String(value).replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatClock(date) {
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateObject(date) {
  return date.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

async function toggleLessonReminders() {
  if (!("Notification" in window)) {
    state.reminderMessage = "Bu brauzer notification xabarlarini qo'llamaydi.";
    return;
  }

  if (state.remindersEnabled) {
    setLessonReminderEnabled(false);
    state.reminderMessage = "Eslatma o'chirildi.";
    startLessonReminderLoop();
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    state.reminderMessage = "Notification ruxsati berilmadi. Browser sozlamasidan ruxsat berish kerak.";
    setLessonReminderEnabled(false);
    return;
  }

  setLessonReminderEnabled(true);
  state.reminderMessage = `Eslatma yoqildi. Dars va to'lovlar uchun browser xabari chiqadi.`;
  sendNotification("Eslatma yoqildi", "Rejadagi darslar va kutilayotgan to'lovlar uchun browser xabari tayyor.");
  startLessonReminderLoop();
}

function readReminderSetting() {
  try {
    return localStorage.getItem(REMINDER_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function setLessonReminderEnabled(value) {
  state.remindersEnabled = Boolean(value);
  try {
    localStorage.setItem(REMINDER_ENABLED_KEY, String(state.remindersEnabled));
  } catch {
    // Browser storage can be unavailable in private mode.
  }
}

function startLessonReminderLoop() {
  window.clearInterval(reminderTimer);
  reminderTimer = 0;

  if (!state.remindersEnabled || !("Notification" in window) || Notification.permission !== "granted") return;

  checkLessonReminders();
  checkPaymentReminders();
  reminderTimer = window.setInterval(() => {
    checkLessonReminders();
    checkPaymentReminders();
  }, 30000);
}

function checkLessonReminders() {
  const sent = readSentReminders();
  const nowTime = Date.now();
  let changed = false;

  state.lessons
    .filter((lesson) => lesson.status === "planned")
    .forEach((lesson) => {
      const startDate = parseLessonDate(lesson.lesson_date);
      if (!startDate) return;

      const startTime = startDate.getTime();
      const beforeTime = startTime - REMINDER_LEAD_MINUTES * 60000;
      const beforeKey = `${lesson.id}:${lesson.lesson_date}:before`;
      const startKey = `${lesson.id}:${lesson.lesson_date}:start`;

      if (nowTime >= beforeTime && nowTime < startTime && !sent[beforeKey]) {
        sendLessonNotification(lesson, `Dars ${REMINDER_LEAD_MINUTES} daqiqadan keyin`);
        sent[beforeKey] = nowTime;
        changed = true;
      }

      if (nowTime >= startTime && nowTime < startTime + 15 * 60000 && !sent[startKey]) {
        sendLessonNotification(lesson, "Dars boshlandi");
        sent[startKey] = nowTime;
        changed = true;
      }
    });

  if (changed) writeSentReminders(sent);
}

function sendLessonNotification(lesson, title) {
  const student = lesson.student_name || "O'quvchi tanlanmagan";
  const body = `${lessonTimeRange(lesson)} | ${student} | ${label(lesson.format)} | ${lesson.title}`;
  sendNotification(title, body);
}

function checkPaymentReminders() {
  const sent = readSentReminders();
  const nowTime = Date.now();
  let changed = false;

  state.payments
    .filter((payment) => payment.status === "pending")
    .forEach((payment) => {
      const dueDate = parsePaymentDueDate(payment);
      if (!dueDate) return;

      const dueTime = dueDate.getTime();
      const beforeTime = dueTime - PAYMENT_REMINDER_LEAD_HOURS * 60 * 60000;
      const beforeKey = `payment:${payment.id}:${payment.paid_at}:${payment.payment_time || PAYMENT_DEFAULT_TIME}:before`;
      const dueKey = `payment:${payment.id}:${payment.paid_at}:${payment.payment_time || PAYMENT_DEFAULT_TIME}:due`;

      if (nowTime >= beforeTime && nowTime < dueTime && !sent[beforeKey]) {
        sendPaymentNotification(payment, `To'lov ${PAYMENT_REMINDER_LEAD_HOURS} soatdan keyin`);
        sent[beforeKey] = nowTime;
        changed = true;
      }

      if (nowTime >= dueTime && nowTime < dueTime + 24 * 60 * 60000 && !sent[dueKey]) {
        sendPaymentNotification(payment, "To'lov vaqti keldi");
        sent[dueKey] = nowTime;
        changed = true;
      }
    });

  if (changed) writeSentReminders(sent);
}

function sendPaymentNotification(payment, title) {
  const student = payment.student_name || "O'quvchi tanlanmagan";
  const body = `${paymentDueText(payment)} | ${student} | ${money(payment.amount)} | ${label(payment.method)}`;
  sendNotification(title, body);
}

function parsePaymentDueDate(payment) {
  if (!payment.paid_at) return null;
  const date = new Date(`${payment.paid_at}T${payment.payment_time || PAYMENT_DEFAULT_TIME}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function paymentDueText(payment) {
  const dueDate = parsePaymentDueDate(payment);
  if (!dueDate) return formatDate(payment.paid_at);
  return `${formatDateObject(dueDate)}, ${formatClock(dueDate)}`;
}

function paymentDueLabel(payment) {
  return esc(paymentDueText(payment));
}

function sendNotification(title, body) {
  try {
    new Notification(title, {
      body,
      tag: `umida-rus-tili-${title}-${body}`.slice(0, 128),
      requireInteraction: false
    });
  } catch {
    state.reminderMessage = "Notification yuborishda xatolik bo'ldi.";
  }
}

function readSentReminders() {
  try {
    const sent = JSON.parse(localStorage.getItem(REMINDER_SENT_KEY) || "{}");
    const freshAfter = Date.now() - 1000 * 60 * 60 * 48;
    Object.entries(sent).forEach(([key, value]) => {
      if (Number(value) < freshAfter) delete sent[key];
    });
    return sent;
  } catch {
    return {};
  }
}

function writeSentReminders(sent) {
  try {
    localStorage.setItem(REMINDER_SENT_KEY, JSON.stringify(sent));
  } catch {
    // Ignore storage errors.
  }
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
      lesson_end: body.lesson_end || "",
      duration_minutes: Number(body.duration_minutes || 60),
      format: normalizeLessonFormat(body.format),
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
      format: normalizeLessonFormat(body.format),
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
      payment_time: body.payment_time || PAYMENT_DEFAULT_TIME,
      method: body.method || "naqd",
      status: body.status || "paid",
      note: body.note || "",
      created_at: timestamp
    });
    writeCabinetStore(store);
    return { ok: true };
  }

  const paymentMatch = pathname.match(/^\/api\/payments\/(\d+)$/);
  if (paymentMatch && method === "PUT") {
    updateClientItem(store, "payments", Number(paymentMatch[1]), { status: body.status || "paid" });
    writeCabinetStore(store);
    return { ok: true };
  }

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
