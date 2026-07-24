const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const sectionNavLinks = Array.from(navLinks).filter((link) => link.hash);
const leadForm = document.querySelector("#leadForm");
const statusLine = document.querySelector(".form-status");
const goalSelect = leadForm?.querySelector('select[name="goal"]');
const leadNameInput = leadForm?.querySelector('input[name="name"]');
const leadPhoneInput = leadForm?.querySelector('input[name="phone"]');
const pageLoader = document.querySelector("[data-page-loader]");
const loaderStage = document.querySelector(".loader-stage");
const loaderKicker = document.querySelector("[data-loader-kicker]");
const loaderTitle = document.querySelector("[data-loader-title]");
const loaderWord = document.querySelector("[data-loader-word]");
const loaderCaption = document.querySelector("[data-loader-caption]");
const languageLoader = document.querySelector("[data-language-loader]");
const languageLoaderText = document.querySelector("[data-language-loader-text]");
const TELEGRAM_URL = "https://t.me/rustili_umiida";
const LANG_STORAGE_KEY = "umida-rus-tili-lang";
const CABINET_STORAGE_KEY = "umida-rus-tili-cabinet";
const INTRO_MIN_DURATION = 6900;
const LOADER_PHRASE_INTERVAL = 2300;
const LANGUAGE_TRANSITION_IN = 360;
const LANGUAGE_TRANSITION_OUT = 620;
const langButtons = document.querySelectorAll("[data-lang-switch]");
const translations = {
  uz: {
    meta: {
      title: "Rus Tili Ustozi | Portfolio",
      description: "Rus tili ustozining portfolio sayti: abituriyentlar uchun online hamda offline darslar."
    },
    brand: {
      title: "Umida Rus Tili",
      subtitle: "Abituriyent tayyorgarligi"
    },
    lang: {
      label: "Tilni tanlash"
    },
    menu: {
      open: "Menyuni ochish",
      close: "Menyuni yopish",
      navLabel: "Asosiy menyu"
    },
    nav: {
      teacher: "Ustoz",
      lessons: "Darslar",
      about: "Dars haqida",
      contacts: "Kontaktlar",
      login: "Kirish"
    },
    common: {
      signup: "Yozilish",
      details: "Batafsil"
    },
    hero: {
      kicker: "rus tili ustozi",
      title: "Umida bilan rus tili darslari",
      text: "Abituriyentlar grammatika, test, matn bilan ishlash va yozma topshiriqlarni online yoki offline formatda puxta o'rganadi.",
      primary: "Darsga yozilish",
      secondary: "Dars haqida"
    },
    portfolio: {
      title: "Ustoz va dars yo'nalishlari",
      text: "Umida ustoz darslarni o'quvchining maqsadi, sinfi va imtihon rejasiga moslab olib boradi"
    },
    profiles: {
      teacher: {
        title: "Umida",
        text: "Rus tili ustozi",
        button: "Darsga yozilish"
      },
      school: {
        title: "Grammatika",
        text: "Qoidalar, uy vazifasi va nazorat ishlari"
      },
      exam: {
        title: "Abituriyent",
        text: "Test, grammatika, xatolar tahlili va imtihon reja"
      }
    },
    courses: {
      title: "Dars yo'nalishlari",
      text: "O'quvchi bilim darajasiga qarab individual, guruh, online yoki offline tartib tanlaydi"
    },
    products: {
      school: {
        title: "Grammatika kursi",
        chip: "Qoida va amaliyot"
      },
      exam: {
        title: "Abituriyent tayyorgarligi",
        chip: "Test va imtihon"
      },
      online: {
        title: "Online dars",
        chip: "Masofadan"
      },
      offline: {
        title: "Offline dars",
        chip: "Jonli dars"
      },
      group: {
        title: "Guruh darsi",
        chip: "Bir xil daraja"
      },
      writing: {
        title: "Matn va yozuv",
        chip: "Diktant, bayon"
      }
    },
    formats: {
      title: "Darslar haqida",
      text: "Online va offline darslar, guruh mashg'ulotlari va muntazam nazorat"
    },
    features: {
      online: {
        title: "Online dars",
        text: "Masofadan turib muntazam dars, uyga vazifa va test tahlili."
      },
      offline: {
        title: "Offline dars",
        text: "Ustoz bilan yuzma-yuz mashg'ulot, yozma ishlar va nazorat."
      },
      group: {
        title: "Guruh darsi",
        text: "Bir xil darajadagi o'quvchilar bilan tartibli tayyorgarlik."
      },
      progress: {
        title: "Progress nazorati",
        text: "Uy vazifa, diktant, yozma ish va test xatolari muntazam tahlil qilinadi."
      }
    },
    results: {
      title: "O'quvchi qoidani yodlash bilan cheklanmay, uni topshiriqda ishlatishni o'rganadi",
      text: "Bo'sh mavzular aniqlanadi, testdagi xatolar tushuntiriladi va keyingi darslar shu natijaga qarab rejalashtiriladi.",
      item1: "Bo'sh mavzular aniqlanib, izchil takrorlanadi.",
      item2: "Test ishlaganda nima uchun xato bo'layotgani tushuntiriladi.",
      item3: "Uyga vazifa, yozma ish va og'zaki javoblar bo'yicha muntazam fikr beriladi."
    },
    contact: {
      kicker: "Sizning so'rovingiz",
      title: "Dars uchun so'rov qoldiring",
      text: "O'quvchining sinfi, maqsadi va qulay vaqtini yozing. Ustoz siz bilan bog'lanib, online yoki offline dars formatini kelishadi."
    },
    form: {
      name: "Ism",
      phone: "Telefon",
      goal: "Maqsad",
      message: "Xabar",
      namePlaceholder: "Ismingiz",
      phonePlaceholder: "+998 ...",
      messagePlaceholder: "Sinf, maqsad va qulay vaqtni yozing",
      submit: "So'rov yuborish",
      saving: "So'rov saqlanmoqda...",
      error: "So'rov saqlanmadi.",
      thanks: "Rahmat!",
      copiedHint: "Xabar matni nusxalandi. Telegram ochilganda chatga joylab yuboring.",
      manualHint: "Telegram ochildi. Iltimos, forma ma'lumotlarini chatga yozib yuboring.",
      copiedShort: "Xabar matni nusxalandi.",
      telegramLink: "Telegramni ochish"
    },
    telegram: {
      intro: "Assalomu alaykum, rus tili darsi uchun so'rov.",
      name: "Ism",
      phone: "Telefon",
      goal: "Maqsad",
      message: "Xabar"
    },
    footer: {
      title: "Rus Tili Ustozi",
      text: "Online va offline rus tili darslari."
    }
  },
  ru: {
    meta: {
      title: "Русский с Умидой | Портфолио",
      description: "Портфолио преподавателя русского языка: онлайн и офлайн уроки для абитуриентов."
    },
    brand: {
      title: "Русский с Умидой",
      subtitle: "Подготовка абитуриентов"
    },
    lang: {
      label: "Выбор языка"
    },
    menu: {
      open: "Открыть меню",
      close: "Закрыть меню",
      navLabel: "Главное меню"
    },
    nav: {
      teacher: "Преподаватель",
      lessons: "Уроки",
      about: "О занятиях",
      contacts: "Контакты",
      login: "Вход"
    },
    common: {
      signup: "Записаться",
      details: "Подробнее"
    },
    hero: {
      kicker: "преподаватель русского языка",
      title: "Русский язык с Умидой",
      text: "Абитуриенты системно изучают грамматику, тесты, работу с текстом и письменные задания в онлайн или офлайн формате.",
      primary: "Записаться на урок",
      secondary: "О занятиях"
    },
    portfolio: {
      title: "Преподаватель и направления",
      text: "Умида выстраивает занятия под цель ученика, класс, уровень знаний и план подготовки к экзамену"
    },
    profiles: {
      teacher: {
        title: "Умида",
        text: "Преподаватель русского языка",
        button: "Записаться на урок"
      },
      school: {
        title: "Грамматика",
        text: "Правила, домашние задания и контрольные работы"
      },
      exam: {
        title: "Абитуриенты",
        text: "Тесты, грамматика, разбор ошибок и экзаменационный план"
      }
    },
    courses: {
      title: "Направления занятий",
      text: "По уровню ученика можно выбрать индивидуальный, групповой, онлайн или офлайн формат"
    },
    products: {
      school: {
        title: "Курс грамматики",
        chip: "Правила и практика"
      },
      exam: {
        title: "Подготовка абитуриентов",
        chip: "Тесты и экзамен"
      },
      online: {
        title: "Онлайн урок",
        chip: "Дистанционно"
      },
      offline: {
        title: "Офлайн урок",
        chip: "Живые занятия"
      },
      group: {
        title: "Групповой урок",
        chip: "Один уровень"
      },
      writing: {
        title: "Текст и письмо",
        chip: "Диктант, изложение"
      }
    },
    formats: {
      title: "О занятиях",
      text: "Онлайн и офлайн уроки, групповые занятия и регулярный контроль прогресса"
    },
    features: {
      online: {
        title: "Онлайн урок",
        text: "Регулярные занятия на расстоянии, домашние задания и разбор тестов."
      },
      offline: {
        title: "Офлайн урок",
        text: "Очные занятия с преподавателем, письменные работы и контроль."
      },
      group: {
        title: "Групповой урок",
        text: "Структурная подготовка с учениками одного уровня."
      },
      progress: {
        title: "Контроль прогресса",
        text: "Домашние задания, диктанты, письменные работы и ошибки в тестах регулярно разбираются."
      }
    },
    results: {
      title: "Ученик не просто заучивает правило, а учится применять его в заданиях",
      text: "Пробелы в темах выявляются, ошибки в тестах объясняются, а следующие занятия планируются по результату.",
      item1: "Пробелы в темах выявляются и последовательно повторяются.",
      item2: "Ошибки в тестах разбираются так, чтобы ученик понял причину.",
      item3: "По домашним заданиям, письму и устным ответам дается регулярная обратная связь."
    },
    contact: {
      kicker: "Ваша заявка",
      title: "Оставьте заявку на урок",
      text: "Напишите класс ученика, цель и удобное время. Преподаватель свяжется с вами и согласует онлайн или офлайн формат."
    },
    form: {
      name: "Имя",
      phone: "Телефон",
      goal: "Цель",
      message: "Сообщение",
      namePlaceholder: "Ваше имя",
      phonePlaceholder: "+998 ...",
      messagePlaceholder: "Напишите класс, цель и удобное время",
      submit: "Отправить заявку",
      saving: "Заявка сохраняется...",
      error: "Заявка не сохранилась.",
      thanks: "Спасибо!",
      copiedHint: "Текст заявки скопирован. Когда откроется Telegram, вставьте его в чат и отправьте.",
      manualHint: "Telegram открыт. Пожалуйста, напишите данные из формы в чат.",
      copiedShort: "Текст заявки скопирован.",
      telegramLink: "Открыть Telegram"
    },
    telegram: {
      intro: "Здравствуйте, хочу оставить заявку на урок русского языка.",
      name: "Имя",
      phone: "Телефон",
      goal: "Цель",
      message: "Сообщение"
    },
    footer: {
      title: "Русский с Умидой",
      text: "Онлайн и офлайн уроки русского языка."
    }
  }
};
const goalOptions = [
  { value: "", uz: "Tanlang", ru: "Выберите" },
  { value: "school", uz: "Grammatika darslari", ru: "Грамматика" },
  { value: "exam", uz: "Abituriyent tayyorgarligi", ru: "Подготовка абитуриентов" },
  { value: "online", uz: "Online dars", ru: "Онлайн урок" },
  { value: "offline", uz: "Offline dars", ru: "Офлайн урок" },
  { value: "group", uz: "Guruhga yozilish", ru: "Запись в группу" }
];
const loaderPhrases = {
  uz: [
    { kicker: "Umida Rus Tili", title: "Darslar ochilmoqda", word: "Grammatika", caption: "mavzular tayyorlanmoqda" },
    { kicker: "Maqsadga qarab", title: "Reja tuzilmoqda", word: "Testlar", caption: "abituriyent tayyorgarligi ochilmoqda" },
    { kicker: "Online va offline", title: "Format tanlanmoqda", word: "Dars vaqti", caption: "qulay tartib tayyorlanmoqda" },
    { kicker: "Portfolio yuklanmoqda", title: "Ustoz sahifasi", word: "Natija", caption: "sahifa ishga tushmoqda" }
  ],
  ru: [
    { kicker: "Русский с Умидой", title: "Уроки открываются", word: "Грамматика", caption: "темы готовятся" },
    { kicker: "По цели ученика", title: "План собирается", word: "Тесты", caption: "подготовка к экзамену открывается" },
    { kicker: "Онлайн и офлайн", title: "Формат выбирается", word: "Урок", caption: "удобный режим готовится" },
    { kicker: "Портфолио загружается", title: "Страница учителя", word: "Результат", caption: "сайт запускается" }
  ]
};
let currentLang = getSavedLanguage();
let languageTransitionActive = false;
let scrollAnimationFrame = 0;

setupLanguage();
setupIntroLoader();
setupPremiumMotion();
setupScrollOffset();
setupActiveNavigation();

menuToggle?.addEventListener("click", () => {
  setMenuOpen(!header?.classList.contains("nav-open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.hash && scrollToPageAnchor(link.hash)) {
      event.preventDefault();
      setActiveNavLink(link.hash);
      updateHash(link.hash);
    }
    setMenuOpen(false);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.closest(".site-nav")) return;

  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    if (!scrollToPageAnchor(hash)) return;

    event.preventDefault();
    setActiveNavLink(hash);
    updateHash(hash);
  });
});

document.querySelectorAll("[data-fill-goal]").forEach((link) => {
  link.addEventListener("click", () => {
    if (!goalSelect) return;
    goalSelect.value = link.dataset.fillGoal;
  });
});

document.addEventListener("click", (event) => {
  if (!header?.classList.contains("nav-open")) return;
  if (header.contains(event.target)) return;

  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !header?.classList.contains("nav-open")) return;

  setMenuOpen(false);
  menuToggle?.focus();
});

leadNameInput?.addEventListener("input", () => {
  leadNameInput.value = formatPersonName(leadNameInput.value);
});

leadPhoneInput?.addEventListener("input", () => {
  leadPhoneInput.value = formatUzPhone(leadPhoneInput.value);
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusLine.textContent = t("form.saving");

  let payload;
  try {
    payload = normalizeLeadPayload(Object.fromEntries(new FormData(leadForm).entries()));
  } catch (error) {
    statusLine.textContent = error.message;
    return;
  }

  const localizedPayload = {
    ...payload,
    goal: getGoalLabel(payload.goal) || payload.goal
  };
  const telegramMessage = buildTelegramMessage(localizedPayload);
  const copiedPromise = copyToClipboard(telegramMessage);
  let savedLead = {
    ...localizedPayload,
    status: "new",
    created_at: new Date().toISOString()
  };

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localizedPayload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t("form.error"));
    }
    savedLead = data.lead || savedLead;
  } catch (error) {
    console.warn(error.message);
  }

  saveLeadToCabinetCache(savedLead);
  leadForm.reset();
  const copied = await copiedPromise;
  const telegramWindow = window.open(TELEGRAM_URL, "_blank", "noopener");
  const hint = copied
    ? t("form.copiedHint")
    : t("form.manualHint");

  statusLine.innerHTML = `${t("form.thanks")} ${hint} <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">${t("form.telegramLink")}</a>`;
  if (!telegramWindow && copied) {
    statusLine.innerHTML = `${t("form.thanks")} ${t("form.copiedShort")} <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">${t("form.telegramLink")}</a>`;
  }
});

function setMenuOpen(isOpen) {
  if (!header) return;

  header.classList.toggle("nav-open", isOpen);
  document.body.classList.toggle("nav-menu-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? t("menu.close") : t("menu.open"));
}

function setupActiveNavigation() {
  if (!sectionNavLinks.length) return;

  const sections = sectionNavLinks
    .map((link) => ({
      hash: link.hash,
      section: document.getElementById(decodeURIComponent(link.hash.slice(1)))
    }))
    .filter(({ section }) => section);

  if (!sections.length) return;

  let ticking = false;
  const updateActiveSection = () => {
    const anchorLine = (header?.offsetHeight || 80) + 86;
    let activeHash = "";

    sections.forEach(({ hash, section }) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= anchorLine && rect.bottom > anchorLine) {
        activeHash = hash;
      }
    });

    if (!activeHash) {
      const passedSections = sections
        .filter(({ section }) => section.getBoundingClientRect().top <= anchorLine);
      const passedSection = passedSections[passedSections.length - 1];
      activeHash = passedSection?.hash || "";
    }

    setActiveNavLink(activeHash);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActiveSection);
  };

  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("hashchange", requestUpdate);
  window.addEventListener("load", requestUpdate, { once: true });
}

function setupScrollOffset() {
  const setOffset = () => {
    document.documentElement.style.setProperty("--scroll-offset", `${getHeaderOffset()}px`);
  };

  setOffset();
  window.addEventListener("resize", setOffset);
  window.addEventListener("orientationchange", setOffset);
  window.addEventListener("load", setOffset, { once: true });

  if (header && "ResizeObserver" in window) {
    new ResizeObserver(setOffset).observe(header);
  }
}

function getHeaderOffset() {
  const headerHeight = header?.getBoundingClientRect().height || 80;
  const breathingRoom = window.innerWidth <= 860 ? 22 : 30;
  return Math.ceil(headerHeight + breathingRoom);
}

function getAnchorTarget(hash) {
  if (!hash || hash === "#") return null;
  const id = decodeURIComponent(hash.slice(1));
  return document.getElementById(id);
}

function scrollToPageAnchor(hash) {
  const target = getAnchorTarget(hash);
  if (!target) return false;

  const targetTop = hash === "#top"
    ? 0
    : Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset());

  animateScrollTo(targetTop, () => {
    markLocatedSection(target);
  });

  return true;
}

function animateScrollTo(targetTop, onComplete) {
  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  if (Math.abs(distance) < 2) {
    onComplete?.();
    return;
  }

  const reduceMotion = document.documentElement.classList.contains("motion-reduced");
  const duration = reduceMotion
    ? Math.min(520, Math.max(320, Math.abs(distance) * 0.32))
    : Math.min(980, Math.max(520, Math.abs(distance) * 0.42));
  const startedAt = performance.now();
  window.cancelAnimationFrame(scrollAnimationFrame);

  const step = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    window.scrollTo(0, startTop + distance * eased);

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(step);
      return;
    }

    scrollAnimationFrame = 0;
    window.scrollTo(0, targetTop);
    onComplete?.();
  };

  scrollAnimationFrame = window.requestAnimationFrame(step);
}

function markLocatedSection(target) {
  if (!target || target.id === "top") return;

  target.classList.remove("section-located");
  window.requestAnimationFrame(() => {
    target.classList.add("section-located");
    window.setTimeout(() => target.classList.remove("section-located"), 1300);
  });
}

function updateHash(hash) {
  if (window.location.hash === hash) return;
  window.history.pushState(null, "", hash);
}

function setActiveNavLink(activeHash) {
  sectionNavLinks.forEach((link) => {
    const active = link.hash === activeHash;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function buildTelegramMessage(payload) {
  return [
    t("telegram.intro"),
    `${t("telegram.name")}: ${payload.name || "-"}`,
    `${t("telegram.phone")}: ${payload.phone || "-"}`,
    `${t("telegram.goal")}: ${payload.goal || "-"}`,
    `${t("telegram.message")}: ${payload.message || "-"}`
  ].join("\n");
}

function normalizeLeadPayload(payload) {
  const name = formatPersonName(payload.name).trim();
  const phone = normalizeUzPhone(payload.phone);
  if (!name) throw new Error("Ism familiyani kiriting.");

  return {
    ...payload,
    name,
    phone
  };
}

function formatPersonName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
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
  const phone = formatUzPhone(value);
  if (!/^998\d{9}$/.test(phone.replace(/\D/g, ""))) {
    throw new Error("Telefonni +998 90 123 45 67 ko'rinishida kiriting.");
  }
  return phone;
}

function saveLeadToCabinetCache(lead) {
  try {
    const store = JSON.parse(localStorage.getItem(CABINET_STORAGE_KEY) || "{}");
    const leads = Array.isArray(store.leads) ? store.leads : [];
    const highestId = Math.max(0, ...leads.map((item) => Number(item.id || 0)));
    const nextId = Math.max(Number(store.nextIds?.leads || 1), highestId + 1);
    const id = Number(lead.id || 0) || nextId;

    const nextStore = {
      ...store,
      nextIds: {
        ...(store.nextIds || {}),
        leads: Math.max(id + 1, nextId + 1)
      },
      students: Array.isArray(store.students) ? store.students : [],
      lessons: Array.isArray(store.lessons) ? store.lessons : [],
      payments: Array.isArray(store.payments) ? store.payments : [],
      leads: [
        {
          id,
          name: lead.name || "",
          phone: lead.phone || "",
          goal: lead.goal || "",
          message: lead.message || "",
          status: lead.status || "new",
          created_at: lead.created_at || new Date().toISOString()
        },
        ...leads.filter((item) => String(item.id) !== String(id))
      ]
    };

    localStorage.setItem(CABINET_STORAGE_KEY, JSON.stringify(nextStore));
  } catch {
    // Browser storage can be unavailable in private mode.
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function setupLanguage() {
  applyLanguage(currentLang);

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextLang = button.dataset.langSwitch;
      if (!translations[nextLang]) return;
      if (nextLang === currentLang || languageTransitionActive) return;

      transitionLanguage(nextLang);
    });
  });
}

function setupIntroLoader() {
  if (!pageLoader) {
    document.body.classList.remove("is-loading");
    return;
  }

  const stopLoaderPhrases = startLoaderPhrases();
  const startedAt = performance.now();
  const hideLoader = () => {
    const elapsed = performance.now() - startedAt;
    const delay = Math.max(260, INTRO_MIN_DURATION - elapsed);

    window.setTimeout(() => {
      pageLoader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      stopLoaderPhrases();
    }, delay);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }
}

function startLoaderPhrases() {
  if (!loaderTitle || !loaderWord || !loaderCaption) return () => {};

  const phrases = loaderPhrases[currentLang] || loaderPhrases.uz;
  let phraseIndex = 0;
  setLoaderPhrase(phrases[phraseIndex], false);

  const interval = window.setInterval(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setLoaderPhrase(phrases[phraseIndex], true);
  }, LOADER_PHRASE_INTERVAL);

  return () => {
    window.clearInterval(interval);
  };
}

function setLoaderPhrase(phrase, animate) {
  const updateText = () => {
    if (loaderKicker) loaderKicker.textContent = phrase.kicker;
    loaderTitle.textContent = phrase.title;
    loaderWord.textContent = phrase.word;
    loaderCaption.textContent = phrase.caption;
  };

  if (!animate || !loaderStage) {
    updateText();
    return;
  }

  loaderStage.classList.remove("is-phrase-entering", "is-phrase-glow");
  loaderStage.classList.add("is-phrase-switching");
  window.setTimeout(() => {
    updateText();
    loaderStage.classList.remove("is-phrase-switching");
    loaderStage.classList.add("is-phrase-entering", "is-phrase-glow");
    window.setTimeout(() => {
      loaderStage.classList.remove("is-phrase-entering", "is-phrase-glow");
    }, 720);
  }, 260);
}

async function transitionLanguage(nextLang) {
  const previousLang = currentLang;
  languageTransitionActive = true;
  languageLoaderText && (languageLoaderText.textContent = `${previousLang.toUpperCase()} -> ${nextLang.toUpperCase()}`);
  languageLoader?.setAttribute("aria-hidden", "false");
  languageLoader?.classList.add("is-active");
  document.body.classList.add("is-language-transition");

  await wait(LANGUAGE_TRANSITION_IN);

  currentLang = nextLang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  } catch {
    // Ignore private-mode storage errors.
  }
  applyLanguage(currentLang);

  await wait(LANGUAGE_TRANSITION_OUT);

  languageLoader?.classList.remove("is-active");
  document.body.classList.remove("is-language-transition");
  window.setTimeout(() => {
    languageLoader?.setAttribute("aria-hidden", "true");
  }, 700);
  languageTransitionActive = false;
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.title = t("meta.title", lang);
  setMetaDescription(t("meta.description", lang));

  setText(".brand strong", t("brand.title", lang));
  setText(".brand small", t("brand.subtitle", lang));
  setText('.site-nav a[href="#portfolio"]', t("nav.teacher", lang));
  setText('.site-nav a[href="#courses"]', t("nav.lessons", lang));
  setText('.site-nav a[href="#formats"]', t("nav.about", lang));
  setText('.site-nav a[href="#contact"]', t("nav.contacts", lang));
  setText(".site-nav .nav-pill", t("nav.login", lang));

  setText(".hero .eyebrow", t("hero.kicker", lang));
  setText("#hero-title", t("hero.title", lang));
  setText(".hero-text", t("hero.text", lang));
  setText(".hero-actions .primary", t("hero.primary", lang));
  setText(".hero-actions .secondary", t("hero.secondary", lang));

  setText("#portfolio-title", t("portfolio.title", lang));
  setText("#portfolio-title + p", t("portfolio.text", lang));
  setText(".profile-tile:nth-child(1) h3", t("profiles.teacher.title", lang));
  setText(".profile-tile:nth-child(1) p", t("profiles.teacher.text", lang));
  setText(".profile-tile:nth-child(1) .button", t("profiles.teacher.button", lang));
  setText(".profile-tile:nth-child(2) h3", t("profiles.school.title", lang));
  setText(".profile-tile:nth-child(2) p", t("profiles.school.text", lang));
  setText(".profile-tile:nth-child(2) .button", t("common.signup", lang));
  setText(".profile-tile:nth-child(3) h3", t("profiles.exam.title", lang));
  setText(".profile-tile:nth-child(3) p", t("profiles.exam.text", lang));
  setText(".profile-tile:nth-child(3) .button", t("common.signup", lang));

  setText("#courses-title", t("courses.title", lang));
  setText("#courses-title + p", t("courses.text", lang));
  setText(".product-card:nth-child(1) h3", t("products.school.title", lang));
  setText(".product-card:nth-child(1) .lesson-chip", t("products.school.chip", lang));
  setText(".product-card:nth-child(2) h3", t("products.exam.title", lang));
  setText(".product-card:nth-child(2) .lesson-chip", t("products.exam.chip", lang));
  setText(".product-card:nth-child(3) h3", t("products.online.title", lang));
  setText(".product-card:nth-child(3) .lesson-chip", t("products.online.chip", lang));
  setText(".product-card:nth-child(4) h3", t("products.offline.title", lang));
  setText(".product-card:nth-child(4) .lesson-chip", t("products.offline.chip", lang));
  setText(".product-card:nth-child(5) h3", t("products.group.title", lang));
  setText(".product-card:nth-child(5) .lesson-chip", t("products.group.chip", lang));
  setText(".product-card:nth-child(6) h3", t("products.writing.title", lang));
  setText(".product-card:nth-child(6) .lesson-chip", t("products.writing.chip", lang));
  document.querySelectorAll(".product-card .button").forEach((button) => {
    button.textContent = t("common.details", lang);
  });

  setText("#formats-title", t("formats.title", lang));
  setText("#formats-title + p", t("formats.text", lang));
  setText(".lessons-band .tilda-heading .button", t("common.signup", lang));
  setText(".lesson-feature-grid article:nth-child(1) h3", t("features.online.title", lang));
  setText(".lesson-feature-grid article:nth-child(1) p", t("features.online.text", lang));
  setText(".lesson-feature-grid article:nth-child(2) h3", t("features.offline.title", lang));
  setText(".lesson-feature-grid article:nth-child(2) p", t("features.offline.text", lang));
  setText(".lesson-feature-grid article:nth-child(3) h3", t("features.group.title", lang));
  setText(".lesson-feature-grid article:nth-child(3) p", t("features.group.text", lang));
  setText(".lesson-feature-grid article:nth-child(4) h3", t("features.progress.title", lang));
  setText(".lesson-feature-grid article:nth-child(4) p", t("features.progress.text", lang));

  setText("#results-title", t("results.title", lang));
  setText(".poster-copy p", t("results.text", lang));
  setText(".result-list p:nth-child(1)", t("results.item1", lang));
  setText(".result-list p:nth-child(2)", t("results.item2", lang));
  setText(".result-list p:nth-child(3)", t("results.item3", lang));

  setText(".contact-copy .section-kicker", t("contact.kicker", lang));
  setText("#contact-title", t("contact.title", lang));
  setText(".contact-copy > p:not(.section-kicker)", t("contact.text", lang));
  setControlLabelText('input[name="name"]', t("form.name", lang));
  setControlLabelText('input[name="phone"]', t("form.phone", lang));
  setControlLabelText('select[name="goal"]', t("form.goal", lang));
  setControlLabelText('textarea[name="message"]', t("form.message", lang));
  setAttr('input[name="name"]', "placeholder", t("form.namePlaceholder", lang));
  setAttr('input[name="phone"]', "placeholder", t("form.phonePlaceholder", lang));
  setAttr('textarea[name="message"]', "placeholder", t("form.messagePlaceholder", lang));
  setText(".form-button", t("form.submit", lang));
  setGoalOptions();

  setText(".site-footer p:nth-child(1)", t("footer.title", lang));
  setText(".site-footer p:nth-child(2)", t("footer.text", lang));
  setText(".sr-only", t("menu.open", lang));
  menuToggle?.setAttribute("aria-label", header?.classList.contains("nav-open") ? t("menu.close", lang) : t("menu.open", lang));
  setAttr(".site-nav", "aria-label", t("menu.navLabel", lang));
  setAttr(".lang-switch", "aria-label", t("lang.label", lang));
  setActiveLangButton(lang);
}

function setGoalOptions() {
  if (!goalSelect) return;

  const currentValue = goalSelect.value;
  goalSelect.textContent = "";

  goalOptions.forEach((option) => {
    const optionNode = document.createElement("option");
    optionNode.value = option.value;
    optionNode.textContent = option[currentLang];
    goalSelect.append(optionNode);
  });

  if (goalOptions.some((option) => option.value === currentValue)) {
    goalSelect.value = currentValue;
  }
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function setAttr(selector, attr, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.setAttribute(attr, value);
  });
}

function setControlLabelText(selector, value) {
  const label = document.querySelector(selector)?.closest("label");
  if (!label) return;

  const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) {
    textNode.nodeValue = `\n              ${value}\n              `;
  }
}

function setMetaDescription(value) {
  document.querySelector('meta[name="description"]')?.setAttribute("content", value);
}

function setActiveLangButton(lang) {
  langButtons.forEach((button) => {
    const active = button.dataset.langSwitch === lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function getGoalLabel(value, lang = currentLang) {
  return goalOptions.find((option) => option.value === value)?.[lang] || "";
}

function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (translations[saved]) return saved;
  } catch {
    // Ignore private-mode storage errors.
  }
  return "uz";
}

function t(path, lang = currentLang) {
  return path.split(".").reduce((value, key) => value?.[key], translations[lang]) || "";
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function setupPremiumMotion() {
  const motionTargets = [
    ...document.querySelectorAll(".hero .eyebrow"),
    ...document.querySelectorAll(".hero h1"),
    ...document.querySelectorAll(".hero-text"),
    ...document.querySelectorAll(".tilda-heading"),
    ...document.querySelectorAll(".tilda-heading h2"),
    ...document.querySelectorAll(".tilda-heading p"),
    ...document.querySelectorAll(".profile-tile"),
    ...document.querySelectorAll(".profile-tile h3"),
    ...document.querySelectorAll(".profile-tile p"),
    ...document.querySelectorAll(".product-card"),
    ...document.querySelectorAll(".product-card h3"),
    ...document.querySelectorAll(".lesson-chip"),
    ...document.querySelectorAll(".lesson-feature-grid article"),
    ...document.querySelectorAll(".lesson-feature-grid h3"),
    ...document.querySelectorAll(".lesson-feature-grid p"),
    ...document.querySelectorAll(".result-poster"),
    ...document.querySelectorAll(".poster-copy > *"),
    ...document.querySelectorAll(".result-list p"),
    ...document.querySelectorAll(".order-layout > *"),
    ...document.querySelectorAll(".contact-copy > *"),
    ...document.querySelectorAll(".contact-lines a"),
    ...document.querySelectorAll(".contact-form label"),
    ...document.querySelectorAll(".site-footer p")
  ];

  if (!motionTargets.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.toggle("motion-reduced", reduceMotion);
  const revealDuration = reduceMotion ? 640 : 1020;
  const revealTimers = new WeakMap();
  let lastScrollY = window.scrollY;
  let scrollDirection = "down";
  let directionTicking = false;

  const setRevealOrigin = (target, origin) => {
    target.classList.toggle("reveal-from-up", origin === "up");
    target.classList.toggle("reveal-from-down", origin !== "up");
  };

  const clearRevealState = (target) => {
    const delay = Number.parseFloat(target.style.getPropertyValue("--reveal-delay")) || 0;
    window.clearTimeout(revealTimers.get(target));
    const timer = window.setTimeout(() => {
      target.classList.remove("reveal-ready", "is-revealing", "reveal-from-up", "reveal-from-down");
      revealTimers.delete(target);
    }, delay + revealDuration);
    revealTimers.set(target, timer);
  };

  const updateScrollDirection = () => {
    const nextScrollY = Math.max(window.scrollY, 0);
    if (Math.abs(nextScrollY - lastScrollY) > 2) {
      scrollDirection = nextScrollY > lastScrollY ? "down" : "up";
      document.documentElement.dataset.scrollDirection = scrollDirection;
    }
    lastScrollY = nextScrollY;
    directionTicking = false;
  };

  const requestDirectionUpdate = () => {
    if (directionTicking) return;
    directionTicking = true;
    window.requestAnimationFrame(updateScrollDirection);
  };

  const resetRevealTarget = (target, origin) => {
    window.clearTimeout(revealTimers.get(target));
    revealTimers.delete(target);
    target.dataset.revealState = "hidden";
    target.classList.add("reveal-ready");
    target.classList.remove("reveal-visible", "is-revealing");
    setRevealOrigin(target, origin);
  };

  const showRevealTarget = (target) => {
    if (target.dataset.revealState === "visible") return;

    window.clearTimeout(revealTimers.get(target));
    target.dataset.revealState = "visible";
    target.classList.add("reveal-ready", "is-revealing");
    setRevealOrigin(target, scrollDirection === "up" ? "up" : "down");

    window.requestAnimationFrame(() => {
      target.classList.add("reveal-visible");
      clearRevealState(target);
    });
  };

  const staggerGroups = [
    ".hero .eyebrow",
    ".hero h1",
    ".hero-text",
    ".tilda-heading h2",
    ".tilda-heading p",
    ".profile-tile",
    ".profile-tile h3",
    ".profile-tile p",
    ".product-card",
    ".product-card h3",
    ".lesson-chip",
    ".lesson-feature-grid article",
    ".lesson-feature-grid h3",
    ".lesson-feature-grid p",
    ".poster-copy > *",
    ".result-list p",
    ".order-layout > *",
    ".contact-copy > *",
    ".contact-lines a",
    ".contact-form label",
    ".site-footer p"
  ];

  staggerGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((target, index) => {
      const delay = reduceMotion ? Math.min(index, 5) * 35 : Math.min(index, 5) * 90;
      target.style.setProperty("--reveal-delay", `${delay}ms`);
    });
  });

  const isTargetInView = (target) => {
    const rect = target.getBoundingClientRect();
    const topEdge = window.innerHeight * 0.06;
    const bottomEdge = window.innerHeight * 0.9;
    return rect.top < bottomEdge && rect.bottom > topEdge;
  };

  if (!("IntersectionObserver" in window)) {
    let manualTicking = false;
    const updateManualReveal = () => {
      motionTargets.forEach((target) => {
        if (isTargetInView(target)) {
          showRevealTarget(target);
          return;
        }

        resetRevealTarget(target, target.getBoundingClientRect().top < 0 ? "up" : "down");
      });
      manualTicking = false;
    };
    const requestManualReveal = () => {
      requestDirectionUpdate();
      if (manualTicking) return;
      manualTicking = true;
      window.requestAnimationFrame(updateManualReveal);
    };

    motionTargets.forEach((target) => resetRevealTarget(target, "down"));
    document.documentElement.dataset.scrollDirection = scrollDirection;
    window.addEventListener("scroll", requestManualReveal, { passive: true });
    window.addEventListener("resize", requestManualReveal);
    window.requestAnimationFrame(updateManualReveal);
    return;
  }

  motionTargets.forEach((target) => resetRevealTarget(target, "down"));
  document.documentElement.dataset.scrollDirection = scrollDirection;
  window.addEventListener("scroll", requestDirectionUpdate, { passive: true });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showRevealTarget(entry.target);
          return;
        }

        const origin = entry.boundingClientRect.top < 0 ? "up" : "down";
        resetRevealTarget(entry.target, origin);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.14
    }
  );

  requestAnimationFrame(() => {
    motionTargets.forEach((target) => observer.observe(target));
  });
}
