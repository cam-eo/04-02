// Easy to edit: when the 2nd and 3rd activities unlock (ISO string or null for always open)
const UNLOCK_TIMES = [
  null, // Activity 1 (brunch) – always open
  "2026-02-04T12:00:00", // Activity 2 – e.g. noon
  "2026-02-04T18:00:00", // Activity 3 – e.g. 6 PM
];

const ITINERARY = [
  {
    name: "Brunch",
    googleMapsUrl: "https://maps.app.goo.gl/aMu9chewF6xib1wR7",
    rating: 4.7,
    imageUrl:
      "https://www.google.com/maps/place/Eggs+Benaddicted/@52.3644258,4.8850775,3a,75y,90t/data=!3m8!1e2!3m6!1sAF1QipN-bcavra_k8ATRbnjzVmIkzodNhCG6C1L1Lrvg!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fp%2FAF1QipN-bcavra_k8ATRbnjzVmIkzodNhCG6C1L1Lrvg%3Dw203-h304-k-no!7i3120!8i4680!4m16!1m8!3m7!1s0x47c609c9b0259f8b:0xfa8c0f7d53d9f5b4!2sEggs+Benaddicted!8m2!3d52.364388!4d4.8849487!10e9!16s%2Fg%2F11mvkb6b16!3m6!1s0x47c609c9b0259f8b:0xfa8c0f7d53d9f5b4!8m2!3d52.364388!4d4.8849487!10e5!16s%2Fg%2F11mvkb6b16?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D#",
  },
  {
    name: "Movie",
    googleMapsUrl: "https://www.google.com/maps",
    rating: 4.5,
    imageUrl: "https://via.placeholder.com/128/1f1a19/f5e5ca?text=2",
  },
  {
    name: "Dinner",
    googleMapsUrl: "https://www.google.com/maps",
    rating: 4.8,
    imageUrl: "https://via.placeholder.com/128/1f1a19/f5e5ca?text=3",
  },
];

const STORAGE_KEY = "started";

const landing = document.getElementById("landing");
const itinerary = document.getElementById("itinerary");
const startBtn = document.getElementById("start-btn");
const cardsEl = document.getElementById("cards");

function showLanding() {
  landing.classList.remove("view-hidden");
  landing.classList.add("view-active");
  itinerary.classList.add("view-hidden");
  itinerary.classList.remove("view-active");
}

function showItinerary() {
  landing.classList.add("view-hidden");
  landing.classList.remove("view-active");
  itinerary.classList.remove("view-hidden");
  itinerary.classList.add("view-active");
  renderCards();
  startCountdown();
}

function formatCountdown(isoString) {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Opens in ${hours}h ${minutes}m`;
  if (minutes > 0) return `Opens in ${minutes}m`;
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `Opens in ${seconds}s`;
}

function formatUnlockTime(isoString) {
  const d = new Date(isoString);
  return `Opens at ${d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function isUnlocked(index) {
  const t = UNLOCK_TIMES[index];
  if (t == null) return true;
  return Date.now() >= new Date(t).getTime();
}

/** @type {Map<number, HTMLParagraphElement>} */
const countdownEls = new Map();

function renderCards() {
  cardsEl.innerHTML = "";
  countdownEls.clear();
  ITINERARY.forEach((activity, index) => {
    const unlocked = isUnlocked(index);
    const unlockTime = UNLOCK_TIMES[index];
    const card = document.createElement("div");
    card.className = "activity-card" + (unlocked ? "" : " locked");
    card.setAttribute("data-index", index);

    const initialCountdown =
      !unlocked && unlockTime != null
        ? formatCountdown(unlockTime) || formatUnlockTime(unlockTime)
        : "";

    card.innerHTML = `
      <img class="avatar" src="${activity.imageUrl}" alt="" loading="lazy" />
      <div class="content">
        <h2 class="name">${activity.name}</h2>
        <p class="rating">${activity.rating} ★ (Google)</p>
        <p class="countdown">${initialCountdown}</p>
        ${
          unlocked
            ? `<a class="maps-link" href="${activity.googleMapsUrl}" target="_blank" rel="noopener">Open in Maps</a>`
            : ""
        }
      </div>
    `;

    if (unlockTime != null) {
      const countdownP = card.querySelector(".countdown");
      if (countdownP) countdownEls.set(index, countdownP);
    }

    cardsEl.appendChild(card);
  });
}

function refreshCountdownText(index, countdownEl) {
  const unlockTime = UNLOCK_TIMES[index];
  if (unlockTime == null) return;
  if (isUnlocked(index)) {
    countdownEl.textContent = "";
    const content = countdownEl.closest(".content");
    const card = countdownEl.closest(".activity-card");
    if (card && content) {
      card.classList.remove("locked");
      const activity = ITINERARY[index];
      const link = document.createElement("a");
      link.className = "maps-link";
      link.href = activity.googleMapsUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open in Maps";
      content.appendChild(link);
    }
    countdownEls.delete(index);
    return;
  }
  const text = formatCountdown(unlockTime) || formatUnlockTime(unlockTime);
  countdownEl.textContent = text;
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

startBtn.addEventListener("click", () => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch (_) {}
  showItinerary();
});

if (
  typeof localStorage !== "undefined" &&
  localStorage.getItem(STORAGE_KEY) === "true"
) {
  showItinerary();
} else {
  showLanding();
}
