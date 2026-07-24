const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const leadForm = document.querySelector("#leadForm");
const statusLine = document.querySelector(".form-status");
const goalSelect = leadForm?.querySelector('select[name="goal"]');
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
const INTRO_MIN_DURATION = 6900;
const LOADER_PHRASE_INTERVAL = 1650;
const LANGUAGE_TRANSITION_IN = 360;
const LANGUAGE_TRANSITION_OUT = 620;
const langButtons = document.querySelectorAll("[data-lang-switch]");
const translations = {
  uz: {
    meta: {
      title: "Rus Tili Ustozi | Portfolio",
      description: "Rus tili ustozining portfolio sayti: maktab o'quvchilari va abituriyentlar uchun online hamda offline darslar."
    },
    brand: {
      title: "Umida Rus Tili",
      subtitle: "Maktab va abituriyent darslari"
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
      text: "Maktab o'quvchilari va abituriyentlar grammatika, test, matn bilan ishlash va yozma topshiriqlarni online yoki offline formatda puxta o'rganadi.",
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
        title: "Maktab",
        text: "5-11-sinf mavzulari, uy vazifasi va nazorat ishlari"
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
        title: "Maktab dasturi",
        chip: "5-11-sinf"
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
      text: "Maktab darslaridagi bo'sh mavzular aniqlanadi, testdagi xatolar tushuntiriladi va keyingi darslar shu natijaga qarab rejalashtiriladi.",
      item1: "Maktab darslaridagi bo'sh mavzular aniqlanib, izchil takrorlanadi.",
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
      submit: "Telegramga so'rov yuborish",
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
      description: "Портфолио преподавателя русского языка: онлайн и офлайн уроки для школьников и абитуриентов."
    },
    brand: {
      title: "Русский с Умидой",
      subtitle: "Уроки для школьников и абитуриентов"
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
      text: "Школьники и абитуриенты системно изучают грамматику, тесты, работу с текстом и письменные задания в онлайн или офлайн формате.",
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
        title: "Школьники",
        text: "Темы 5-11 классов, домашние задания и контрольные работы"
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
        title: "Школьная программа",
        chip: "5-11 класс"
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
      text: "Пробелы в школьных темах выявляются, ошибки в тестах объясняются, а следующие занятия планируются по результату.",
      item1: "Пробелы в школьных темах выявляются и последовательно повторяются.",
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
      submit: "Отправить заявку в Telegram",
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
  { value: "school", uz: "Maktab darslari", ru: "Школьная программа" },
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

setupLanguage();
setupIntroLoader();
setupPremiumMotion();

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? t("menu.close") : t("menu.open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", t("menu.open"));
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

  header.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", t("menu.open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !header?.classList.contains("nav-open")) return;

  header.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", t("menu.open"));
  menuToggle?.focus();
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusLine.textContent = t("form.saving");

  const payload = Object.fromEntries(new FormData(leadForm).entries());
  const localizedPayload = {
    ...payload,
    goal: getGoalLabel(payload.goal) || payload.goal
  };
  const telegramMessage = buildTelegramMessage(localizedPayload);
  const copiedPromise = copyToClipboard(telegramMessage);

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
  } catch (error) {
    console.warn(error.message);
  }

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

function buildTelegramMessage(payload) {
  return [
    t("telegram.intro"),
    `${t("telegram.name")}: ${payload.name || "-"}`,
    `${t("telegram.phone")}: ${payload.phone || "-"}`,
    `${t("telegram.goal")}: ${payload.goal || "-"}`,
    `${t("telegram.message")}: ${payload.message || "-"}`
  ].join("\n");
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

  loaderStage.classList.add("is-phrase-switching");
  window.setTimeout(() => {
    updateText();
    loaderStage.classList.remove("is-phrase-switching");
    loaderStage.classList.add("is-phrase-glow");
    window.setTimeout(() => {
      loaderStage.classList.remove("is-phrase-glow");
    }, 280);
  }, 150);
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
    ...document.querySelectorAll(".tilda-heading"),
    ...document.querySelectorAll(".profile-tile"),
    ...document.querySelectorAll(".product-card"),
    ...document.querySelectorAll(".lesson-feature-grid article"),
    ...document.querySelectorAll(".result-poster"),
    ...document.querySelectorAll(".result-list p"),
    ...document.querySelectorAll(".order-layout > *")
  ];

  if (!motionTargets.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.toggle("motion-reduced", reduceMotion);

  if (!("IntersectionObserver" in window)) {
    motionTargets.forEach((target) => target.classList.add("reveal-visible"));
    return;
  }

  const staggerGroups = [
    ".profile-tile",
    ".product-card",
    ".lesson-feature-grid article",
    ".result-list p",
    ".order-layout > *"
  ];

  staggerGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((target, index) => {
      const delay = reduceMotion ? Math.min(index, 5) * 35 : Math.min(index, 5) * 90;
      target.style.setProperty("--reveal-delay", `${delay}ms`);
    });
  });

  motionTargets.forEach((target) => target.classList.add("reveal-ready"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.18
    }
  );

  requestAnimationFrame(() => {
    motionTargets.forEach((target) => observer.observe(target));
  });
}
