const ITINERARY = [
  {
    unlockTime: "2026-02-04T00:00:00",
    title: "Brunch",
    description: "Eggs Benaddicted",
    url: "https://maps.app.goo.gl/aMu9chewF6xib1wR7",
    ctaText: "Open in Maps",
    rating: "4.7 - Google Maps",
    imageUrl:
      "https://freight.cargo.site/i/f7617d2523e80293346d8ededafe8930ff4c5e1afe17f22375a5e5ffba038baa/b2f8e7d38-4fbc-4d39-8338-a303b3c96879.jpg",
  },
  {
    unlockTime: "2026-02-04T12:00:00",
    title: "Movie",
    description: "The Housemaids",
    url: "./MovieTicket.pdf",
    ctaText: "Open Movie Ticket",
    rating: "74% - Rotten Tomatoes",
    imageUrl:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRFQkWrP62a03eDmpaDIJsxra5_KAPk1QABqs3YFx8tt191uLBd",
  },
  {
    unlockTime: "2026-02-04T18:00:00",
    title: "Dinner",
    description: "JOY cocktails. tacos. Burritos. Burgers",
    url: "https://maps.app.goo.gl/BJ1mrMRRta2XSUo36",
    ctaText: "Open in Maps",
    rating: "4.8 - Google Maps",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/5e/2a/55/joy-texmex.jpg?w=1200&h=1200&s=1",
  },
];

const STORAGE_KEY = "started";
const GATE_PASSWORD_KEY = "gate:password";
const GATE_CAPTCHA_KEY = "gate:captcha";
const FIRST_LOAD_NOTIFICATION_KEY = "pwa:firstLoadNotificationShown";

const PASSWORD = "Pebzi";
const HINT_TEXT = "I have just eaten. I am still hungry! Who am I?";
const HINT_AVAILABLE_AT = "2026-02-03T12:00:00";

const CAPTCHA_CORRECT_TILES = [1, 2, 5, 7, 9];
const CAPTCHA_IMAGE_BASE = "./not-a-robot/";

const passwordGate = document.getElementById("password-gate");
const captchaGate = document.getElementById("captcha-gate");
const itinerary = document.getElementById("itinerary");
const cardsEl = document.getElementById("cards");

const passwordForm = document.getElementById("password-form");
const passwordInput = document.getElementById("password-input");
const passwordError = document.getElementById("password-error");
const hintBtn = document.getElementById("hint-btn");
const hintCountdown = document.getElementById("hint-countdown");
const hintText = document.getElementById("hint-text");

function hideAllViews() {
  [
    passwordGate,
    captchaGate,
    itinerary,
    // landing
  ].forEach((el) => {
    el.classList.add("view-hidden");
    el.classList.remove("view-active");
  });
}

function showPasswordGate() {
  hideAllViews();
  passwordGate.classList.remove("view-hidden");
  passwordGate.classList.add("view-active");
  passwordInput.value = "";
  passwordError.classList.add("view-hidden");
  passwordError.textContent = "";
  updateHintUI();
  startHintCountdown();
}

function showCaptchaGate() {
  hideAllViews();
  captchaGate.classList.remove("view-hidden");
  captchaGate.classList.add("view-active");
  renderCaptchaGrid();
  const err = document.getElementById("captcha-error");
  if (err) {
    err.classList.add("view-hidden");
    err.textContent = "";
  }
}

function showLanding() {
  hideAllViews();
  // landing.classList.remove("view-hidden");
  // landing.classList.add("view-active");
}

function showItinerary() {
  hideAllViews();
  itinerary.classList.remove("view-hidden");
  itinerary.classList.add("view-active");
  renderCards();
  startCountdown();
}

function isHintAvailable() {
  return Date.now() >= new Date(HINT_AVAILABLE_AT).getTime();
}

function getHintCountdownParts() {
  const target = new Date(HINT_AVAILABLE_AT).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function updateHintUI() {
  if (isHintAvailable()) {
    hintBtn.disabled = false;
    hintCountdown.classList.add("view-hidden");
    hintBtn.classList.remove("view-hidden");
    hintCountdown.textContent = "";
  } else {
    hintBtn.disabled = true;
    hintBtn.classList.add("view-hidden");
    hintCountdown.classList.remove("view-hidden");
    const parts = getHintCountdownParts();
    hintCountdown.textContent = parts ? `Hint available in ${parts}` : "";
  }
}

let hintCountdownInterval = null;

function startHintCountdown() {
  if (hintCountdownInterval) clearInterval(hintCountdownInterval);
  updateHintUI();
  if (!isHintAvailable()) {
    hintCountdownInterval = setInterval(() => {
      updateHintUI();
      if (isHintAvailable() && hintCountdownInterval) {
        clearInterval(hintCountdownInterval);
        hintCountdownInterval = null;
      }
    }, 1000);
  }
}

/** Show one-time welcome notification in system tray (only on first load). */
function maybeShowFirstLoadNotification() {
  if (typeof Notification === "undefined") return;
  try {
    if (localStorage.getItem(FIRST_LOAD_NOTIFICATION_KEY) === "true") return;
    if (Notification.permission !== "granted") return;
    const n = new Notification("04.02 – Lidia", {
      body: "Hola Lidia 🎉 Cam said you should open me",
      icon: "./icons/favicon.png",
      tag: "pwa-first-load",
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    localStorage.setItem(FIRST_LOAD_NOTIFICATION_KEY, "true");
  } catch (_) {}
}

/** Request notification permission (needs user gesture). After grant, show first-load notification if applicable. */
function requestNotificationPermissionAndMaybeNotify() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    maybeShowFirstLoadNotification();
    return;
  }
  if (Notification.permission === "default") {
    Notification.requestPermission().then((p) => {
      if (p === "granted") maybeShowFirstLoadNotification();
    });
  }
}

passwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = (passwordInput.value || "").trim();
  if (value === PASSWORD) {
    try {
      localStorage.setItem(GATE_PASSWORD_KEY, "true");
    } catch (_) {}
    if (hintCountdownInterval) {
      clearInterval(hintCountdownInterval);
      hintCountdownInterval = null;
    }
    showCaptchaGate();
  } else {
    passwordError.textContent = "Wrong password. Try again.";
    passwordError.classList.remove("view-hidden");
  }
});

hintBtn.addEventListener("click", () => {
  if (!isHintAvailable()) return;
  hintText.textContent = HINT_TEXT;
  hintText.classList.remove("view-hidden");
});

function renderCaptchaGrid() {
  const grid = document.getElementById("captcha-grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "captcha-tile";
    tile.setAttribute("data-tile", i);
    tile.setAttribute("aria-pressed", "false");
    const img = document.createElement("img");
    img.src = `${CAPTCHA_IMAGE_BASE}${i}.jpg`;
    img.alt = "";
    img.loading = "lazy";
    tile.appendChild(img);
    tile.addEventListener("click", () => {
      const pressed = tile.getAttribute("aria-pressed") === "true";
      tile.setAttribute("aria-pressed", String(!pressed));
      tile.classList.toggle("captcha-tile--selected", !pressed);
    });
    grid.appendChild(tile);
  }
}

function getSelectedCaptchaTiles() {
  const tiles = document.querySelectorAll(".captcha-tile[aria-pressed='true']");
  return Array.from(tiles)
    .map((t) => Number(t.getAttribute("data-tile")))
    .sort((a, b) => a - b);
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

document.getElementById("captcha-submit").addEventListener("click", () => {
  const selected = getSelectedCaptchaTiles();
  const correct = [...CAPTCHA_CORRECT_TILES].sort((a, b) => a - b);
  const errEl = document.getElementById("captcha-error");
  if (arraysEqual(selected, correct)) {
    try {
      localStorage.setItem(GATE_CAPTCHA_KEY, "true");
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (_) {}
    showItinerary();
  } else {
    renderCaptchaGrid();
    if (errEl) {
      errEl.textContent = "Nope. Try again.";
      errEl.classList.remove("view-hidden");
    }
  }
});

function formatCountdown(isoString) {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `Opens in ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Returns { label: "Opens in"|"Opens at", value: "HH:MM:SS"|"12:00 PM" } for locked display, or null when unlocked */
function getCountdownParts(isoString) {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    label: "Opens in",
    value: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

function formatUnlockTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function isUnlocked(index) {
  const t = ITINERARY[index]?.unlockTime;
  if (t == null) return true;
  return Date.now() >= new Date(t).getTime();
}

/** @type {Map<number, { valueEl: HTMLElement, labelEl: HTMLElement }>} */
const countdownEls = new Map();

function renderCards() {
  cardsEl.innerHTML = "";
  countdownEls.clear();
  ITINERARY.forEach((activity, index) => {
    const unlocked = isUnlocked(index);
    const unlockTime = activity.unlockTime;
    const card = document.createElement("div");
    card.className = "activity-card" + (unlocked ? "" : " locked");
    card.setAttribute("data-index", index);

    const avatarSrc = unlocked ? activity.imageUrl : "./icons/favicon.svg";

    if (unlocked) {
      card.innerHTML = `
        <img class="avatar" src="${avatarSrc}" alt="" loading="lazy" data-image-url="${activity.imageUrl}" />
        <div class="content">
          <h2 class="name">${activity.title}</h2>
          <p class="description">${activity.description}</p>
          <p class="rating">${activity.rating}</p>
          <a class="maps-link" href="${activity.url}" target="_blank" rel="noopener">${activity.ctaText}</a>
        </div>
      `;
    } else {
      const parts = unlockTime != null ? getCountdownParts(unlockTime) : null;
      const label = parts ? parts.label : "Opens at";
      const value = parts
        ? parts.value
        : (unlockTime && formatUnlockTime(unlockTime)) || "";
      card.innerHTML = `
        <img class="avatar" src="${avatarSrc}" alt="" loading="lazy" data-image-url="${activity.imageUrl}" />
        <div class="content content--countdown">
          <p class="countdown-label">${label}</p>
          <p class="countdown-value">${value}</p>
        </div>
      `;
      if (unlockTime != null) {
        const valueEl = card.querySelector(".countdown-value");
        const labelEl = card.querySelector(".countdown-label");
        if (valueEl && labelEl) countdownEls.set(index, { valueEl, labelEl });
      }
    }

    cardsEl.appendChild(card);
  });
}

function refreshCountdownText(index, { valueEl, labelEl }) {
  const unlockTime = ITINERARY[index]?.unlockTime;
  if (unlockTime == null) return;
  if (isUnlocked(index)) {
    const content = valueEl.closest(".content");
    const card = valueEl.closest(".activity-card");
    if (card && content) {
      card.classList.remove("locked");
      const activity = ITINERARY[index];
      const avatar = card.querySelector(".avatar");
      if (avatar && avatar.dataset.imageUrl) {
        avatar.src = avatar.dataset.imageUrl;
      }
      content.className = "content";
      content.innerHTML = `
        <h2 class="name">${activity.title}</h2>
        <p class="description">${activity.description}</p>
        <p class="rating">${activity.rating}</p>
        <a class="maps-link" href="${activity.url}" target="_blank" rel="noopener">${activity.ctaText}</a>
      `;
    }
    countdownEls.delete(index);
    return;
  }
  const parts = getCountdownParts(unlockTime);
  if (parts) {
    labelEl.textContent = parts.label;
    valueEl.textContent = parts.value;
  } else {
    labelEl.textContent = "Opens at";
    valueEl.textContent = formatUnlockTime(unlockTime);
  }
}

let countdownInterval = null;

function runCountdownTick() {
  for (const [index, el] of Array.from(countdownEls.entries())) {
    refreshCountdownText(index, el);
  }
  if (countdownEls.size === 0 && countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  runCountdownTick();
  countdownInterval = setInterval(runCountdownTick, 1000);
}

cardsEl.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card || card.classList.contains("locked")) return;
  if (e.target.closest("a.maps-link")) return;
  const index = Number(card.getAttribute("data-index"));
  const activity = ITINERARY[index];
  if (activity?.url) window.open(activity.url, "_blank", "noopener");
});

// startBtn.addEventListener("click", () => {
//   try {
//     localStorage.setItem(STORAGE_KEY, "true");
//   } catch (_) {}
//   showItinerary();
// });

const clearStorageBtn = document.getElementById("clear-storage-btn");
clearStorageBtn.addEventListener("click", () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GATE_PASSWORD_KEY);
    localStorage.removeItem(GATE_CAPTCHA_KEY);
    localStorage.removeItem(FIRST_LOAD_NOTIFICATION_KEY);
  } catch (_) {}
  location.reload();
});

// Ask for notifications and show "Open me right away!" before anything else (before password gate)
if (typeof Notification !== "undefined") {
  requestNotificationPermissionAndMaybeNotify();
}

if (typeof localStorage !== "undefined") {
  if (localStorage.getItem(GATE_CAPTCHA_KEY) === "true") {
    showItinerary();
  } else if (localStorage.getItem(GATE_PASSWORD_KEY) === "true") {
    showCaptchaGate();
  } else {
    showPasswordGate();
  }
} else {
  showPasswordGate();
}
