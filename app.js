// Easy to edit: when the 2nd and 3rd activities unlock (ISO string or null for always open)
const UNLOCK_TIMES = [
  null, // Activity 1 (brunch) – always open
  "2026-02-04T12:00:00", // Activity 2 – e.g. noon
  "2026-02-04T18:00:00", // Activity 3 – e.g. 6 PM
];

const ITINERARY = [
  {
    title: "Brunch",
    description: "Eggs Benaddicted",
    url: "https://maps.app.goo.gl/aMu9chewF6xib1wR7",
    ctaText: "Open in Maps",
    rating: "4.7 - Google Maps",
    imageUrl:
      "https://freight.cargo.site/i/f7617d2523e80293346d8ededafe8930ff4c5e1afe17f22375a5e5ffba038baa/b2f8e7d38-4fbc-4d39-8338-a303b3c96879.jpg",
  },
  {
    title: "Movie",
    description: "The Housemaids",
    url: "./MovieTicket.pdf",
    ctaText: "Open Movie Ticket",
    rating: "74% - Rotten Tomatoes",
    imageUrl:
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRFQkWrP62a03eDmpaDIJsxra5_KAPk1QABqs3YFx8tt191uLBd",
  },
  {
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
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `Opens in ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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
        <h2 class="name">${activity.title}</h2>
        <p class="description">${activity.description}</p>
        <p class="rating">${activity.rating}</p>
        <p class="countdown">${initialCountdown}</p>
        ${
          unlocked
            ? `<a class="maps-link" href="${activity.url}" target="_blank" rel="noopener">${activity.ctaText}</a>`
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
      link.href = activity.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = activity.ctaText;
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

cardsEl.addEventListener("click", (e) => {
  const card = e.target.closest(".activity-card");
  if (!card || card.classList.contains("locked")) return;
  if (e.target.closest("a.maps-link")) return;
  const index = Number(card.getAttribute("data-index"));
  const activity = ITINERARY[index];
  if (activity?.url) window.open(activity.url, "_blank", "noopener");
});

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
