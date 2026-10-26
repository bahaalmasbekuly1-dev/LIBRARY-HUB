/* Announcements: category and read filters, read tracking per student. */

const categoryFilter = document.getElementById("categoryFilter");
const readFilter = document.getElementById("readFilter");
const announcementList = document.getElementById("announcementList");
const emptyStateEl = document.getElementById("emptyState");

function announcementItemHTML(db, a, readIds) {
  const isRead = readIds.includes(a.id);
  let related = "";
  if (a.relatedEventId) {
    const event = db.events.find((e) => e.id === a.relatedEventId);
    if (event) related = `<a class="small" href="events.html">Related event: ${esc(event.title)} →</a>`;
  }
  if (a.relatedBookId) {
    const book = findBook(db, a.relatedBookId);
    if (book) related = `<a class="small" href="catalogue.html?book=${esc(book.id)}">Related book: ${esc(book.title)} →</a>`;
  }

  return `
    <article class="card announcement${a.priority === "high" ? " important" : ""}">
      <div class="meta">
        <span class="badge ${a.priority === "high" ? "coral" : "gray"}">${a.priority === "high" ? "Important" : "Notice"}</span>
        <span class="small muted">${esc(a.category)} · ${formatDate(a.date)}</span>
      </div>
      <h3>${!isRead ? `<span class="unread-dot" aria-hidden="true"></span>` : ""}${esc(a.title)}</h3>
      <p>${esc(a.summary)}</p>
      <p>${esc(a.body)}</p>
      ${related}
      <div class="actions">
        ${isRead
          ? `<span class="read-state">Read</span>`
          : `<button class="btn secondary small-btn" type="button" data-read="${esc(a.id)}">Mark as read</button>`}
      </div>
    </article>`;
}

function render() {
  const db = loadDb();
  const studentId = currentStudentId();
  const readIds = db.readAnnouncements[studentId] || [];

  // Fill the category list from the announcements that exist
  const categories = [...new Set(db.announcements.map((a) => a.category))].sort();
  const current = categoryFilter.value;
  categoryFilter.innerHTML = `<option value="">All categories</option>` +
    categories.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  categoryFilter.value = current;

  let items = [...db.announcements].sort((a, b) => b.date.localeCompare(a.date));
  if (categoryFilter.value) items = items.filter((a) => a.category === categoryFilter.value);
  if (readFilter.value === "unread") items = items.filter((a) => !readIds.includes(a.id));

  announcementList.innerHTML = items.map((a) => announcementItemHTML(db, a, readIds)).join("");
  emptyStateEl.hidden = items.length > 0;
}

announcementList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-read]");
  if (!button) return;
  markAnnouncementRead(currentStudentId(), button.dataset.read);
});

document.getElementById("markAllRead").addEventListener("click", () => {
  const db = loadDb();
  const studentId = currentStudentId();
  db.readAnnouncements[studentId] = db.announcements.map((a) => a.id);
  saveDb(db);
  showToast("All announcements marked as read.");
});

categoryFilter.addEventListener("change", render);
readFilter.addEventListener("change", render);

onUpdate(render);
