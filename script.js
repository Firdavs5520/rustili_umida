const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const leadForm = document.querySelector("#leadForm");
const statusLine = document.querySelector(".form-status");
const goalSelect = leadForm?.querySelector('select[name="goal"]');
const TELEGRAM_URL = "https://t.me/rustili_umiida";

setupPremiumMotion();

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Menyuni yopish" : "Menyuni ochish");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Menyuni ochish");
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
  menuToggle?.setAttribute("aria-label", "Menyuni ochish");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !header?.classList.contains("nav-open")) return;

  header.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Menyuni ochish");
  menuToggle?.focus();
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusLine.textContent = "So'rov saqlanmoqda...";

  const payload = Object.fromEntries(new FormData(leadForm).entries());
  const telegramMessage = buildTelegramMessage(payload);
  const copiedPromise = copyToClipboard(telegramMessage);

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "So'rov saqlanmadi.");
    }
  } catch (error) {
    console.warn(error.message);
  }

  leadForm.reset();
  const copied = await copiedPromise;
  const telegramWindow = window.open(TELEGRAM_URL, "_blank", "noopener");
  const hint = copied
    ? "Xabar matni nusxalandi. Telegram ochilganda chatga joylab yuboring."
    : "Telegram ochildi. Iltimos, forma ma'lumotlarini chatga yozib yuboring.";

  statusLine.innerHTML = `Rahmat! ${hint} <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">Telegramni ochish</a>`;
  if (!telegramWindow && copied) {
    statusLine.innerHTML = `Rahmat! Xabar matni nusxalandi. <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">Telegramni ochish</a>`;
  }
});

function buildTelegramMessage(payload) {
  return [
    "Assalomu alaykum, rus tili darsi uchun so'rov.",
    `Ism: ${payload.name || "-"}`,
    `Telefon: ${payload.phone || "-"}`,
    `Maqsad: ${payload.goal || "-"}`,
    `Xabar: ${payload.message || "-"}`
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
  if (reduceMotion || !("IntersectionObserver" in window)) {
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
      target.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 90}ms`);
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
