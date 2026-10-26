/* My Books: the selected student's loans, reservations and history. */

const loanList = document.getElementById("loanList");
const reservationList = document.getElementById("reservationList");
const historyList = document.getElementById("historyList");

loanList.addEventListener("click", handleReservationClick);
reservationList.addEventListener("click", handleReservationClick);

function handleReservationClick(event) {
  const button = event.target.closest("button[data-cancel]");
  if (!button) return;
  const result = cancelReservation(button.dataset.cancel, currentStudentId());
  showToast(result.message, result.ok ? "ok" : "error");
}

onUpdate(() => {
  const db = loadDb();
  const studentId = currentStudentId();

  // Active loans with due-date status
  const loans = db.loans.filter((l) => l.studentId === studentId && !l.returnDate);
  loanList.innerHTML = loans.length
    ? `<div class="table-wrap"><table>
        <thead><tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>${loans.map((loan) => {
          const book = findBook(db, loan.bookId);
          const overdue = loan.dueDate < TODAY;
          return `<tr>
            <td>${esc(book ? book.title : "Unknown book")}</td>
            <td>${formatDate(loan.borrowDate)}</td>
            <td>${formatDate(loan.dueDate)}</td>
            <td><span class="badge ${overdue ? "coral" : "sage"}">${overdue ? "Overdue" : "On loan"}</span></td>
          </tr>`;
        }).join("")}</tbody></table></div>`
    : emptyState("You have no borrowed books right now.");

  // Reservations with cancel buttons
  const reservations = db.reservations.filter((r) => r.studentId === studentId);
  reservationList.innerHTML = reservations.length
    ? `<div class="card-grid">${reservations.map((r) => {
        const book = findBook(db, r.bookId);
        return `<article class="card">
          <span class="badge amber">Reserved</span>
          <h3>${esc(book ? book.title : "Unknown book")}</h3>
          <p class="small muted">Reserved on ${formatDate(r.date)} · Shelf ${esc(book ? book.shelf : "–")}</p>
          <div class="actions"><button class="btn secondary small-btn" type="button" data-cancel="${esc(r.bookId)}">Cancel reservation</button></div>
        </article>`;
      }).join("")}</div>`
    : emptyState("No reservations. Find a book in the catalogue and reserve it.");

  // Returned books
  const history = db.loans.filter((l) => l.studentId === studentId && l.returnDate);
  historyList.innerHTML = history.length
    ? `<ul>${history.map((loan) => {
        const book = findBook(db, loan.bookId);
        return `<li>${esc(book ? book.title : "Unknown book")}: borrowed ${formatDate(loan.borrowDate)}, returned ${formatDate(loan.returnDate)}</li>`;
      }).join("")}</ul>`
    : emptyState("No returned books yet.");
});
