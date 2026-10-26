/* Catalogue: search, filters, sorting, book details and reservations. */

const params = new URLSearchParams(window.location.search);
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const availabilityFilter = document.getElementById("availabilityFilter");
const sortSelect = document.getElementById("sortSelect");
const bookGrid = document.getElementById("bookGrid");
const emptyStateEl = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const bookDialog = document.getElementById("bookDialog");
const bookDetail = document.getElementById("bookDetail");
let openBookId = null;

// Fill the genre list from the books actually in the catalogue
function populateGenres() {
  const db = loadDb();
  const genres = [...new Set(db.books.map((b) => b.genre))].sort();
  genreFilter.innerHTML = `<option value="">All genres</option>` +
    genres.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
}

if (params.get("q")) searchInput.value = params.get("q");
populateGenres();

function visibleBooks(db) {
  const term = searchInput.value.trim().toLowerCase();
  let books = db.books.map((book) => ({ ...book, status: bookStatus(db, book.id) }));

  if (term) {
    books = books.filter((book) =>
      [book.title, book.author, book.genre, book.id].some((text) => text.toLowerCase().includes(term))
    );
  }
  if (genreFilter.value) books = books.filter((book) => book.genre === genreFilter.value);
  if (availabilityFilter.value) books = books.filter((book) => book.status === availabilityFilter.value);

  if (sortSelect.value === "author") books.sort((a, b) => a.author.localeCompare(b.author));
  else if (sortSelect.value === "popularity") books.sort((a, b) => b.popularity - a.popularity);
  else books.sort((a, b) => a.title.localeCompare(b.title));

  return books;
}

function render() {
  const db = loadDb();
  const books = visibleBooks(db);
  bookGrid.innerHTML = books.map((book) => bookCard(db, book)).join("");
  emptyStateEl.hidden = books.length > 0;
  resultCount.textContent = `Showing ${books.length} of ${db.books.length} books`;
  if (openBookId && bookDialog.open) renderDetail(db, openBookId);
}

function renderDetail(db, bookId) {
  const book = findBook(db, bookId);
  if (!book) {
    bookDetail.innerHTML = `<p>This book is no longer in the catalogue.</p>`;
    return;
  }
  const status = bookStatus(db, bookId);
  const studentId = currentStudentId();
  const myReservation = db.reservations.find((r) => r.bookId === bookId && r.studentId === studentId);

  let action = "";
  if (myReservation) {
    action = `<button class="btn secondary" type="button" data-action="cancel">Cancel my reservation</button>`;
  } else if (status === "available") {
    action = `<button class="btn primary" type="button" data-action="reserve">Reserve this book</button>`;
  } else if (status === "reserved") {
    action = `<button class="btn primary" type="button" disabled>Already reserved</button>`;
  } else {
    action = `<button class="btn primary" type="button" disabled>Currently on loan</button>`;
  }

  bookDetail.innerHTML = `
    <div class="book-detail">
      <div class="cover cover-large ${coverClass(book.genre)}" aria-hidden="true"><span>${esc(book.title.charAt(0))}</span></div>
      <div class="info">
        <h2 id="dialogTitle" style="margin-top:0">${esc(book.title)}</h2>
        <p class="muted">by ${esc(book.author)}</p>
        <dl class="small">
          <dt><strong>Book ID</strong></dt><dd>${esc(book.id)}</dd>
          <dt><strong>Genre</strong></dt><dd>${esc(book.genre)}</dd>
          <dt><strong>Published</strong></dt><dd>${esc(book.year)}</dd>
          <dt><strong>Shelf</strong></dt><dd>${esc(book.shelf)}</dd>
        </dl>
        <p>${statusBadge(status)}</p>
        <div class="actions">${action}</div>
        <p class="small muted" style="margin-top:0.75rem;">Reservations are held at the desk. A student can hold up to 3 reservations at a time.</p>
      </div>
    </div>`;
}

function openBook(bookId) {
  openBookId = bookId;
  renderDetail(loadDb(), bookId);
  if (!bookDialog.open) bookDialog.showModal();
}

function closeBook() {
  bookDialog.close();
  openBookId = null;
  history.replaceState(null, "", "catalogue.html");
}

bookDetail.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const studentId = currentStudentId();
  const result = button.dataset.action === "reserve"
    ? reserveBook(openBookId, studentId)
    : cancelReservation(openBookId, studentId);
  showToast(result.message, result.ok ? "ok" : "error");
});

document.getElementById("closeDialog").addEventListener("click", closeBook);
bookDialog.addEventListener("close", () => { openBookId = null; });

// Click a card to open its details
bookGrid.addEventListener("click", (event) => {
  const card = event.target.closest("a.book-card");
  if (!card) return;
  event.preventDefault();
  const id = new URL(card.href).searchParams.get("book");
  history.replaceState(null, "", `catalogue.html?book=${encodeURIComponent(id)}`);
  openBook(id);
});

[searchInput, genreFilter, availabilityFilter, sortSelect].forEach((el) => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

onUpdate(render);

// Open a book directly from a link, such as from the home page
if (params.get("book")) openBook(params.get("book"));
