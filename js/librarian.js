/* Librarian dashboard (demo mode, no real authentication).
   Books, reservations and loans, announcements with a simulated
   email preview, and events with registrations. */

const bookForm = document.getElementById("bookForm");
const bookTable = document.getElementById("bookTable");
const recordTable = document.getElementById("recordTable");
const announcementForm = document.getElementById("announcementForm");
const announcementTable = document.getElementById("announcementTable");
const emailPreview = document.getElementById("emailPreview");
const eventForm = document.getElementById("eventForm");
const eventTable = document.getElementById("eventTable");
let editingBookId = null;

function report(result) {
  showToast(result.message, result.ok ? "ok" : "error");
}

/* ---------- books ---------- */

function renderBooks(db) {
  bookTable.innerHTML = db.books.map((book) => {
    const status = bookStatus(db, book.id);
    const lendOptions = STUDENTS.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
    const lendControl = status === "borrowed"
      ? `<button class="btn secondary small-btn" type="button" data-action="return" data-id="${esc(book.id)}">Mark returned</button>`
      : `<select aria-label="Student for ${esc(book.title)}">${lendOptions}</select>
         <button class="btn secondary small-btn" type="button" data-action="lend" data-id="${esc(book.id)}">Lend</button>`;
    return `<tr>
      <td>${esc(book.id)}</td>
      <td>${esc(book.title)}<br><span class="small muted">${esc(book.author)}</span></td>
      <td>${esc(book.shelf)}</td>
      <td>${statusBadge(status)}</td>
      <td><div class="actions">
        ${lendControl}
        <button class="btn secondary small-btn" type="button" data-action="edit" data-id="${esc(book.id)}">Edit</button>
        <button class="btn danger small-btn" type="button" data-action="delete" data-id="${esc(book.id)}">Delete</button>
      </div></td>
    </tr>`;
  }).join("");
}

function readBookForm() {
  return {
    title: document.getElementById("bookTitle").value.trim(),
    author: document.getElementById("bookAuthor").value.trim(),
    genre: document.getElementById("bookGenre").value.trim(),
    year: Number(document.getElementById("bookYear").value),
    shelf: document.getElementById("bookShelf").value.trim(),
  };
}

function resetBookForm() {
  bookForm.reset();
  editingBookId = null;
  document.getElementById("bookFormTitle").textContent = "Add a book";
  document.getElementById("bookSubmit").textContent = "Add book";
  document.getElementById("bookCancelEdit").hidden = true;
}

function startEditBook(bookId) {
  const book = findBook(loadDb(), bookId);
  if (!book) return;
  editingBookId = bookId;
  document.getElementById("bookTitle").value = book.title;
  document.getElementById("bookAuthor").value = book.author;
  document.getElementById("bookGenre").value = book.genre;
  document.getElementById("bookYear").value = book.year;
  document.getElementById("bookShelf").value = book.shelf;
  document.getElementById("bookFormTitle").textContent = `Edit book ${bookId}`;
  document.getElementById("bookSubmit").textContent = "Save changes";
  document.getElementById("bookCancelEdit").hidden = false;
  document.getElementById("bookTitle").focus();
}

bookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = readBookForm();
  const result = editingBookId ? updateBook(editingBookId, fields) : addBook(fields);
  report(result);
  if (result.ok) resetBookForm();
});

document.getElementById("bookCancelEdit").addEventListener("click", resetBookForm);

bookTable.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "lend") {
    const select = button.parentElement.querySelector("select");
    report(lendBook(id, select.value));
  } else if (action === "return") {
    report(returnBook(id));
  } else if (action === "edit") {
    startEditBook(id);
  } else if (action === "delete") {
    if (confirm("Delete this book? This cannot be undone.")) report(deleteBook(id));
  }
});

/* ---------- reservations and loans ---------- */

function renderRecords(db) {
  const reservationRows = db.reservations.map((r) => {
    const book = findBook(db, r.bookId);
    return `<tr>
      <td>Reservation</td>
      <td>${esc(book ? book.title : "Unknown")}</td>
      <td>${esc(studentName(r.studentId))}</td>
      <td>${formatDate(r.date)}</td>
      <td><span class="badge amber">Reserved</span></td>
    </tr>`;
  });
  const loanRows = db.loans.map((l) => {
    const book = findBook(db, l.bookId);
    let label = "Returned", style = "gray";
    if (!l.returnDate) {
      label = l.dueDate < TODAY ? "Overdue" : "On loan";
      style = l.dueDate < TODAY ? "coral" : "sage";
    }
    return `<tr>
      <td>Loan (due ${formatDate(l.dueDate)})</td>
      <td>${esc(book ? book.title : "Unknown")}</td>
      <td>${esc(studentName(l.studentId))}</td>
      <td>${formatDate(l.borrowDate)}</td>
      <td><span class="badge ${style}">${label}</span></td>
    </tr>`;
  });
  const rows = [...reservationRows, ...loanRows];
  recordTable.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="5" class="muted">No records yet.</td></tr>`;
}

/* ---------- announcements and email preview ---------- */

function readAnnouncementForm() {
  const relatedEventId = document.getElementById("annEvent").value || null;
  return {
    title: document.getElementById("annTitle").value.trim(),
    summary: document.getElementById("annSummary").value.trim(),
    body: document.getElementById("annBody").value.trim(),
    category: document.getElementById("annCategory").value,
    priority: document.getElementById("annPriority").value,
    relatedEventId,
    relatedBookId: null,
  };
}

// The email is simulated. Nothing is sent, and the preview says so.
function showEmailPreview(a, published) {
  emailPreview.innerHTML = `
    <p><span class="badge gray">Simulated email. Nothing was sent.</span></p>
    <dl>
      <dt>Subject</dt><dd>[Library Hub] ${esc(a.title)}</dd>
      <dt>Recipients</dt><dd>All students (demo: no real addresses are used)</dd>
      <dt>Body</dt><dd>${esc(a.summary)}<br>${esc(a.body)}</dd>
    </dl>
    ${published
      ? `<p class="small">The announcement is now live on the student pages. Email delivery is not configured in this prototype.</p>`
      : `<p class="small">This is a preview only. Click Publish to add the announcement to the student pages.</p>`}`;
}

function renderAnnouncementsAdmin(db) {
  const sorted = [...db.announcements].sort((a, b) => b.date.localeCompare(a.date));
  announcementTable.innerHTML = sorted.length ? sorted.map((a) => `<tr>
      <td>${formatDate(a.date)}</td>
      <td>${esc(a.title)}</td>
      <td>${esc(a.category)}</td>
      <td>${a.priority === "high" ? `<span class="badge coral">Important</span>` : `<span class="badge gray">Normal</span>`}</td>
      <td><button class="btn danger small-btn" type="button" data-announcement="${esc(a.id)}">Delete</button></td>
    </tr>`).join("")
    : `<tr><td colspan="5" class="muted">No announcements yet.</td></tr>`;
}

announcementForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = readAnnouncementForm();
  const result = addAnnouncement(fields);
  report(result);
  if (result.ok) {
    showEmailPreview(fields, true);
    announcementForm.reset();
  }
});

document.getElementById("annPreview").addEventListener("click", () => {
  const fields = readAnnouncementForm();
  if (!fields.title || !fields.summary) {
    report(fail("Add a title and summary to preview the email."));
    return;
  }
  showEmailPreview(fields, false);
});

announcementTable.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-announcement]");
  if (!button) return;
  if (confirm("Delete this announcement from the student pages?")) {
    report(deleteAnnouncement(button.dataset.announcement));
  }
});

/* ---------- events ---------- */

function renderEventsAdmin(db) {
  // Keep the related-event list in sync with the events that exist
  const relatedSelect = document.getElementById("annEvent");
  const chosen = relatedSelect.value;
  relatedSelect.innerHTML = `<option value="">None</option>` +
    db.events.map((e) => `<option value="${esc(e.id)}">${esc(e.title)}</option>`).join("");
  relatedSelect.value = chosen;

  const sorted = [...db.events].sort((a, b) => a.date.localeCompare(b.date));
  eventTable.innerHTML = sorted.length ? sorted.map((e) => {
    const names = e.registrations.length
      ? e.registrations.map((id) => `<li>${esc(studentName(id))}
          <button class="btn secondary small-btn" type="button" data-remove-reg="${esc(id)}" data-event="${esc(e.id)}">Remove</button></li>`).join("")
      : `<li class="muted">No registrations yet</li>`;
    return `<tr>
      <td>${esc(e.title)}<br><span class="small muted">${esc(e.location)}</span></td>
      <td>${formatDate(e.date)}<br><span class="small muted">${esc(e.start)}–${esc(e.end)}</span></td>
      <td>${e.registrations.length}</td>
      <td>
        <div class="actions">
          <input type="number" min="${e.registrations.length}" value="${e.capacity}" aria-label="Capacity for ${esc(e.title)}" style="width:90px;">
          <button class="btn secondary small-btn" type="button" data-capacity="${esc(e.id)}">Save</button>
        </div>
      </td>
      <td><ul class="small" style="margin:0;padding-left:1rem;">${names}</ul></td>
      <td><button class="btn danger small-btn" type="button" data-delete-event="${esc(e.id)}">Delete</button></td>
    </tr>`;
  }).join("")
    : `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;
}

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = {
    title: document.getElementById("evTitle").value.trim(),
    date: document.getElementById("evDate").value,
    start: document.getElementById("evStart").value,
    end: document.getElementById("evEnd").value,
    location: document.getElementById("evLocation").value.trim(),
    category: document.getElementById("evCategory").value.trim() || "Event",
    organizer: document.getElementById("evOrganizer").value.trim() || "School Librarian",
    capacity: Number(document.getElementById("evCapacity").value),
    description: document.getElementById("evDescription").value.trim(),
  };
  const result = addEvent(fields);
  report(result);
  if (result.ok) eventForm.reset();
});

eventTable.addEventListener("click", (event) => {
  const capacityButton = event.target.closest("button[data-capacity]");
  if (capacityButton) {
    const input = capacityButton.parentElement.querySelector("input");
    report(updateEventCapacity(capacityButton.dataset.capacity, Number(input.value)));
    return;
  }

  const removeButton = event.target.closest("button[data-remove-reg]");
  if (removeButton) {
    report(cancelRegistration(removeButton.dataset.event, removeButton.dataset.removeReg));
    return;
  }

  const deleteButton = event.target.closest("button[data-delete-event]");
  if (deleteButton && confirm("Delete this event and its registrations?")) {
    report(deleteEvent(deleteButton.dataset.deleteEvent));
  }
});

/* ---------- demo reset ---------- */

document.getElementById("resetDemo").addEventListener("click", () => {
  if (confirm("Reset all demo data to the starting values?")) {
    resetDemo();
    showToast("Demo data reset.");
  }
});

/* ---------- main render ---------- */

function renderAll() {
  const db = loadDb();
  const genreList = document.getElementById("genreOptions");
  genreList.innerHTML = [...new Set(db.books.map((b) => b.genre))].sort()
    .map((g) => `<option value="${esc(g)}">`).join("");
  renderBooks(db);
  renderRecords(db);
  renderAnnouncementsAdmin(db);
  renderEventsAdmin(db);
}

onUpdate(renderAll);
