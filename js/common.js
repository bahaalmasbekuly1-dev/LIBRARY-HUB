/* Shared behaviour for every page: theme, menu, student selector,
   toasts, and reusable card builders. */

const THEME_KEY = "libraryHub.theme";
const STUDENT_KEY = "libraryHub.student";

// Escape text before putting it into HTML, so data cannot inject markup
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
}

// Dates are handled in UTC so the day never shifts with the time zone
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    timeZone: "UTC", day: "numeric", month: "short", year: "numeric",
  });
}

function currentStudentId() {
  const saved = localStorage.getItem(STUDENT_KEY);
  return STUDENTS.some((s) => s.id === saved) ? saved : STUDENTS[0].id;
}

// Run fn now, and again whenever the data changes
function onUpdate(fn) {
  document.addEventListener("libraryhub:update", fn);
  fn();
}

function showToast(message, type = "ok") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ---------- theme ---------- */

function applyInitialTheme() {
  // The inline script in each page head already sets this; this is a fallback
  if (!document.documentElement.dataset.theme) {
    document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
}

function updateThemeButton() {
  const button = document.getElementById("themeToggle");
  if (!button) return;
  const dark = document.documentElement.dataset.theme === "dark";
  button.textContent = dark ? "☀ Light" : "☾ Dark";
  button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}

function initTheme() {
  applyInitialTheme();
  updateThemeButton();
  const button = document.getElementById("themeToggle");
  if (button) {
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch (error) { /* storage blocked */ }
      updateThemeButton();
    });
  }
}

/* ---------- mobile menu and student selector ---------- */

function initMenu() {
  const button = document.querySelector(".menu-btn");
  const nav = document.getElementById("mainNav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
}

function initStudentSelect() {
  const select = document.getElementById("studentSelect");
  if (!select) return;
  select.innerHTML = STUDENTS.map((s) =>
    `<option value="${esc(s.id)}">${esc(s.name)} (${esc(s.grade)})</option>`
  ).join("");
  select.value = currentStudentId();
  select.addEventListener("change", () => {
    localStorage.setItem(STUDENT_KEY, select.value);
    document.dispatchEvent(new Event("libraryhub:update"));
  });
}

/* ---------- reusable card builders ---------- */

function statusBadge(status) {
  const labels = { available: ["sage", "Available"], reserved: ["amber", "Reserved"], borrowed: ["coral", "On loan"] };
  const [style, label] = labels[status];
  return `<span class="badge ${style}">${label}</span>`;
}

function coverClass(genre) {
  const index = [...genre].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 5;
  return `cover-${index + 1}`;
}

function coverHTML(book) {
  const initials = book.title.split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && word.length > 2)
    .slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return `<div class="cover ${coverClass(book.genre)}" aria-hidden="true"><span>${esc(initials)}</span></div>`;
}

function bookCard(db, book) {
  return `
    <a class="card book-card" href="catalogue.html?book=${esc(book.id)}">
      ${coverHTML(book)}
      <div>
        <h3>${esc(book.title)}</h3>
        <p class="muted">${esc(book.author)}</p>
        <p class="small muted">${esc(book.genre)} · ${esc(book.year)} · Shelf ${esc(book.shelf)}</p>
        ${statusBadge(bookStatus(db, book.id))}
      </div>
    </a>`;
}

function announcementCard(a) {
  const important = a.priority === "high";
  return `
    <article class="card announcement${important ? " important" : ""}">
      <div class="meta">
        <span class="badge ${important ? "coral" : "gray"}">${important ? "Important" : "Notice"}</span>
        <span class="small muted">${esc(a.category)} · ${formatDate(a.date)}</span>
      </div>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.summary)}</p>
    </article>`;
}

function eventSummaryCard(e) {
  return `
    <article class="card event-summary">
      <span class="badge amber">${esc(e.category)}</span>
      <h3>${esc(e.title)}</h3>
      <p class="small muted">${formatDate(e.date)} · ${esc(e.start)}–${esc(e.end)}</p>
      <p class="small">${esc(e.location)} · ${seatsLeft(e)} places left</p>
      <a class="small" href="events.html">Details and registration →</a>
    </article>`;
}

function emptyState(message) {
  return `<p class="empty card">${esc(message)}</p>`;
}

/* ---------- header and footer ---------- */

function initPage() {
  initTheme();
  initMenu();
  initStudentSelect();
}

document.addEventListener("DOMContentLoaded", initPage);
