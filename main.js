/* Jesryl Comeling | Portfolio scripts
   Most things you will want to edit are in SETTINGS below. */

/* ==========================================================
   SETTINGS  (edit these)
   ========================================================== */
const SETTINGS = {
  // Big name in the hero. It animates in letter by letter.
  heroName: "JESRYL",

  // Words that scroll along the tilted black ribbon.
  ribbonWords: ["Jesryl Comeling", "ジェスリル", "BSIT", "Curious Tech Explorer"],

  // How long the loading screen stays (milliseconds).
  introDuration: 2300,
};

/* ==========================================================
   HELPERS
   ========================================================== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================
   DARK / LIGHT THEME
   ========================================================== */
const root = document.documentElement;
const themeButton = $("#theme");

function isDark() {
  const saved = root.getAttribute("data-theme");
  return saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}

function updateThemeIcon() {
  themeButton.textContent = isDark() ? "☀" : "☾";
}

try {
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
} catch (error) {}

updateThemeIcon();

themeButton.addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (error) {}
  updateThemeIcon();
});

/* ==========================================================
   HERO: letters, intro screen, ribbon
   ========================================================== */
// Build the big name, one <span> per letter.
SETTINGS.heroName.split("").forEach((letter, index) => {
  const span = document.createElement("span");
  span.className = "ch";
  span.textContent = letter;
  span.style.setProperty("--i", index);
  $("#n1").appendChild(span);
});

// When the loading screen ends, the "go" class starts the hero animations.
setTimeout(
  () => document.body.classList.add("go"),
  prefersReducedMotion ? 0 : SETTINGS.introDuration
);

// Fill the ribbon (the list is repeated so the loop looks endless).
const ribbonUnit = SETTINGS.ribbonWords
  .map((word) => `<span>${word}</span><em>✦</em>`)
  .join("");
$("#tr").innerHTML = ribbonUnit.repeat(8);

/* ==========================================================
   QUOTE: words light up while you scroll
   ========================================================== */
const quote = $("#q");
const quoteWords = quote.textContent.split(" ").map((word) => {
  const span = document.createElement("span");
  span.textContent = word;
  return span;
});
quote.textContent = "";
quoteWords.forEach((span) => quote.appendChild(span));

/* ==========================================================
   REVEAL ON SCROLL + COUNT-UP NUMBERS
   ========================================================== */
function countUp(element) {
  const target = Number(element.dataset.n);
  const suffix = element.dataset.s;

  if (prefersReducedMotion) {
    element.textContent = target + suffix;
    return;
  }

  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      if (entry.target.dataset.n) countUp(entry.target);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

$$("h2, .row, [data-n]").forEach((element) => revealObserver.observe(element));

/* ==========================================================
   SCROLL: quote words + active menu link
   ========================================================== */
const navLinks = $$(".links a");
const navTargets = navLinks.map((link) => $(link.getAttribute("href")));

function onScroll() {
  // Quote words
  const progress = (innerHeight * 0.8 - quote.getBoundingClientRect().top) / (innerHeight * 0.5);
  quoteWords.forEach((span, index) => {
    span.classList.toggle("on", progress > index / quoteWords.length);
  });

  // Active menu link
  let current = -1;
  navTargets.forEach((section, index) => {
    if (section.getBoundingClientRect().top < innerHeight * 0.4) current = index;
  });
  navLinks.forEach((link, index) => link.classList.toggle("on", index === current));
}

addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ==========================================================
   CUSTOM CURSOR + HOVER PREVIEW CARD (mouse only)
   ========================================================== */
const cursor = $("#cur");
const preview = $("#pv");
const previewInner = $("#pvi");

if (matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
  addEventListener("pointermove", (event) => {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    preview.style.transform = `translate(${event.clientX + 24}px, ${event.clientY - 90}px)`;
  });

  $$("a, button, .row, .gc").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.classList.add("big"));
    element.addEventListener("pointerleave", () => cursor.classList.remove("big"));
  });
} else {
  cursor.style.display = "none";
}

// The small card that follows the mouse over "Featured works".
// Its text comes from data-i="..." on each work row in index.html.
$$(".pvr").forEach((row) => {
  row.addEventListener("pointerenter", () => {
    previewInner.textContent = row.dataset.i;
    previewInner.classList.add("on");
  });
  row.addEventListener("pointerleave", () => previewInner.classList.remove("on"));
});

/* ==========================================================
   TOOLKIT: drag to scroll with the mouse
   ========================================================== */
const gallery = $("#g");
let dragging = false;
let startX = 0;
let startScroll = 0;

gallery.addEventListener("pointerdown", (event) => {
  dragging = true;
  startX = event.clientX;
  startScroll = gallery.scrollLeft;
  gallery.style.cursor = "grabbing";
});

addEventListener("pointerup", () => {
  dragging = false;
  gallery.style.cursor = "";
});

gallery.addEventListener("pointermove", (event) => {
  if (dragging && event.pointerType === "mouse") {
    gallery.scrollLeft = startScroll - (event.clientX - startX);
  }
});
