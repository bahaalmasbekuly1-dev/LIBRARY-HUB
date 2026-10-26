/* ==========================================================
   Library Hub: sample data and the local data layer.
   Every record is fictional. Changes are saved in the
   browser's localStorage, so they stay after a reload.
   ========================================================== */

const STORAGE_KEY = "libraryHub.v1";
const TODAY = "2026-10-26"; // fixed date so the demo stays consistent
const LOAN_DAYS = 14;
const MAX_RESERVATIONS = 3;

// Fictional student accounts used for the demo
const STUDENTS = [
  { id: "S01", name: "Aruzhan Mukhanova", grade: "9A" },
  { id: "S02", name: "Dias Sarsenov", grade: "9B" },
  { id: "S03", name: "Madina Tulegen", grade: "10A" },
];

// Starting data. Book IDs are random 4-digit strings, all unique.
const SEED = {
  books: [
    { id: "0412", title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", genre: "Fantasy", year: 1997, shelf: "A-01", popularity: 96 },
    { id: "0137", title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, shelf: "A-02", popularity: 88 },
    { id: "9083", title: "The Hunger Games", author: "Suzanne Collins", genre: "Dystopian", year: 2008, shelf: "B-03", popularity: 91 },
    { id: "2650", title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949, shelf: "B-04", popularity: 85 },
    { id: "7714", title: "Dune", author: "Frank Herbert", genre: "Science Fiction", year: 1965, shelf: "C-01", popularity: 79 },
    { id: "3328", title: "The Martian", author: "Andy Weir", genre: "Science Fiction", year: 2011, shelf: "C-02", popularity: 83 },
    { id: "5061", title: "Pride and Prejudice", author: "Jane Austen", genre: "Classic", year: 1813, shelf: "D-01", popularity: 74 },
    { id: "1889", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Classic", year: 1960, shelf: "D-02", popularity: 77 },
    { id: "6492", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", year: 1925, shelf: "D-03", popularity: 70 },
    { id: "0925", title: "A Study in Scarlet", author: "Arthur Conan Doyle", genre: "Mystery", year: 1887, shelf: "E-01", popularity: 63 },
    { id: "4570", title: "And Then There Were None", author: "Agatha Christie", genre: "Mystery", year: 1939, shelf: "E-02", popularity: 72 },
    { id: "8236", title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Mystery", year: 2005, shelf: "E-03", popularity: 60 },
    { id: "1374", title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", year: 1988, shelf: "F-01", popularity: 65 },
    { id: "2901", title: "The Selfish Gene", author: "Richard Dawkins", genre: "Science", year: 1976, shelf: "F-02", popularity: 48 },
    { id: "6718", title: "Cosmos", author: "Carl Sagan", genre: "Science", year: 1980, shelf: "F-03", popularity: 58 },
    { id: "3049", title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-fiction", year: 2011, shelf: "G-01", popularity: 81 },
    { id: "5583", title: "Educated", author: "Tara Westover", genre: "Biography", year: 2018, shelf: "G-02", popularity: 76 },
    { id: "7290", title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", year: 2011, shelf: "G-03", popularity: 55 },
    { id: "0648", title: "Percy Jackson: The Lightning Thief", author: "Rick Riordan", genre: "Adventure", year: 2005, shelf: "A-03", popularity: 89 },
    { id: "9417", title: "Life of Pi", author: "Yann Martel", genre: "Adventure", year: 2001, shelf: "B-01", popularity: 62 },
    { id: "2165", title: "The Lord of the Rings", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1954, shelf: "A-04", popularity: 87 },
    { id: "4836", title: "Frankenstein", author: "Mary Shelley", genre: "Classic", year: 1818, shelf: "D-04", popularity: 57 },
    { id: "8702", title: "The Alchemist", author: "Paulo Coelho", genre: "Adventure", year: 1988, shelf: "B-02", popularity: 68 },
    { id: "1521", title: "Brave New World", author: "Aldous Huxley", genre: "Dystopian", year: 1932, shelf: "B-05", popularity: 73 },
    { id: "6064", title: "Ender's Game", author: "Orson Scott Card", genre: "Science Fiction", year: 1985, shelf: "C-03", popularity: 69 },
    { id: "3897", title: "Leaves of Grass", author: "Walt Whitman", genre: "Poetry", year: 1855, shelf: "H-01", popularity: 34 },
    { id: "7135", title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "Classic", year: 1866, shelf: "D-05", popularity: 52 },
    { id: "0279", title: "The Little Prince", author: "Antoine de Saint-Exupéry", genre: "Classic", year: 1943, shelf: "A-05", popularity: 84 },
    { id: "5948", title: "Matilda", author: "Roald Dahl", genre: "Fantasy", year: 1988, shelf: "A-06", popularity: 80 },
    { id: "8461", title: "Clean Code", author: "Robert C. Martin", genre: "Non-fiction", year: 2008, shelf: "F-04", popularity: 66 },
  ],
  // Loans: returnDate null means the book is still out
  loans: [
    { id: "L1", bookId: "1374", studentId: "S01", borrowDate: "2026-10-12", dueDate: "2026-11-02", returnDate: null },
    { id: "L2", bookId: "0412", studentId: "S02", borrowDate: "2026-10-20", dueDate: "2026-11-10", returnDate: null },
    { id: "L3", bookId: "5583", studentId: "S03", borrowDate: "2026-10-05", dueDate: "2026-10-24", returnDate: null },
    { id: "L4", bookId: "0279", studentId: "S01", borrowDate: "2026-09-10", dueDate: "2026-09-24", returnDate: "2026-09-22" },
  ],
  reservations: [
    { id: "R1", bookId: "2650", studentId: "S01", date: "2026-10-23" },
    { id: "R2", bookId: "7714", studentId: "S01", date: "2026-10-24" },
    { id: "R3", bookId: "0648", studentId: "S03", date: "2026-10-25" },
  ],
  announcements: [
    { id: "A1", title: "New arrivals: fantasy and science shelves", summary: "Six new fantasy and science titles are now on the shelves.", body: "Check the Books page and filter by genre to find them. Titles marked as new will be listed first in the catalogue.", date: "2026-10-20", category: "New arrivals", priority: "normal", relatedEventId: null, relatedBookId: null },
    { id: "A2", title: "Library hours change during exam week", summary: "The library closes at 16:00 from 2 to 6 November.", body: "Plan your visits around the new hours. Returns can still be made at the front desk until closing time.", date: "2026-10-22", category: "Schedule", priority: "high", relatedEventId: null, relatedBookId: null },
    { id: "A3", title: "Autumn Reading Challenge: read 5 books by December", summary: "Log each book you finish and earn a badge at 5.", body: "Ask at the desk for a challenge card. Any genre counts, including poetry and non-fiction.", date: "2026-10-18", category: "Reading challenge", priority: "normal", relatedEventId: null, relatedBookId: null },
    { id: "A4", title: "Reading Workshop registration is open", summary: "Only 12 places. Register on the Events page.", body: "The workshop helps you choose books you will enjoy. Registration closes when all places are taken.", date: "2026-10-24", category: "Events", priority: "normal", relatedEventId: "E1", relatedBookId: null },
    { id: "A5", title: "Computer room booking", summary: "Book the library computers for research tasks.", body: "Bookings are for school work only. Please arrive on time, because unused slots are released after 10 minutes.", date: "2026-10-15", category: "Library news", priority: "normal", relatedEventId: null, relatedBookId: null },
    { id: "A6", title: "Overdue books: please return them", summary: "Some loans are past their due date. Please return them to the desk.", body: "Books that are overdue cannot be reserved until they are returned. Ask the librarian if you need more time.", date: "2026-10-25", category: "Reminders", priority: "high", relatedEventId: null, relatedBookId: null },
  ],
  events: [
    { id: "E1", title: "Reading Workshop: Finding Your Next Book", description: "Learn how to choose books that match your interests, and how to use the catalogue search effectively.", date: "2026-11-03", start: "15:00", end: "15:45", location: "Library reading room", category: "Workshop", organizer: "School Librarian", capacity: 12, registrations: ["S02"] },
    { id: "E2", title: "Book Discussion: Dystopian Futures", description: "Talk about 1984, Brave New World and The Hunger Games. Bring one question you would like to discuss.", date: "2026-11-12", start: "16:00", end: "17:00", location: "Room 3.05", category: "Book discussion", organizer: "School Librarian", capacity: 2, registrations: ["S01", "S03"] },
    { id: "E3", title: "Research Skills: Searching Databases", description: "Practise finding reliable sources for your IB projects, and check whether they are trustworthy.", date: "2026-11-19", start: "14:30", end: "15:15", location: "Computer lab 2", category: "Research skills", organizer: "School Librarian", capacity: 15, registrations: [] },
    { id: "E4", title: "Reading Week Kickoff", description: "The opening session of Reading Week, with a short quiz and book recommendations.", date: "2026-10-08", start: "15:00", end: "16:00", location: "Library entrance hall", category: "Reading week", organizer: "School Librarian", capacity: 30, registrations: ["S01", "S02", "S03"] },
  ],
  readAnnouncements: { S01: ["A1"], S02: [], S03: [] },
};

/* ---------- storage ---------- */

function loadDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    // Corrupted data: fall back to the starting data below
  }
  const fresh = JSON.parse(JSON.stringify(SEED));
  saveDbQuietly(fresh);
  return fresh;
}

function saveDbQuietly(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    // Storage may be blocked. The page still works for this visit.
  }
}

// Save and tell every open page to redraw
function saveDb(db) {
  saveDbQuietly(db);
  document.dispatchEvent(new Event("libraryhub:update"));
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  document.dispatchEvent(new Event("libraryhub:update"));
}

/* ---------- helpers ---------- */

function bookStatus(db, bookId) {
  if (db.loans.some((loan) => loan.bookId === bookId && !loan.returnDate)) return "borrowed";
  if (db.reservations.some((reservation) => reservation.bookId === bookId)) return "reserved";
  return "available";
}

function findBook(db, bookId) {
  return db.books.find((book) => book.id === bookId);
}

function studentName(studentId) {
  const student = STUDENTS.find((s) => s.id === studentId);
  return student ? student.name : "Unknown student";
}

function generateBookId(db) {
  let id;
  do {
    id = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  } while (db.books.some((book) => book.id === id));
  return id;
}

function newId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function activeLoanFor(db, studentId) {
  return db.loans.filter((loan) => loan.studentId === studentId && !loan.returnDate);
}

function seatsLeft(event) {
  return event.capacity - event.registrations.length;
}

function ok(message, extra = {}) {
  return { ok: true, message, ...extra };
}

function fail(message) {
  return { ok: false, message };
}

/* ---------- reservations and loans ---------- */

function reserveBook(bookId, studentId) {
  const db = loadDb();
  if (!findBook(db, bookId)) return fail("This book could not be found.");
  const status = bookStatus(db, bookId);
  if (status === "borrowed") return fail("This book is on loan right now.");
  if (status === "reserved") return fail("This book is already reserved.");
  const count = db.reservations.filter((r) => r.studentId === studentId).length;
  if (count >= MAX_RESERVATIONS) {
    return fail(`You can hold up to ${MAX_RESERVATIONS} reservations at a time.`);
  }
  db.reservations.push({ id: newId("R"), bookId, studentId, date: TODAY });
  saveDb(db);
  return ok("Book reserved. Collect it from the library desk.");
}

function cancelReservation(bookId, studentId) {
  const db = loadDb();
  const before = db.reservations.length;
  db.reservations = db.reservations.filter((r) => !(r.bookId === bookId && r.studentId === studentId));
  if (db.reservations.length === before) return fail("No matching reservation was found.");
  saveDb(db);
  return ok("Reservation cancelled.");
}

function lendBook(bookId, studentId) {
  const db = loadDb();
  const book = findBook(db, bookId);
  if (!book) return fail("This book could not be found.");
  if (bookStatus(db, bookId) === "borrowed") return fail("This book is already on loan.");
  const holder = db.reservations.find((r) => r.bookId === bookId);
  if (holder && holder.studentId !== studentId) {
    return fail(`This book is reserved by ${studentName(holder.studentId)}.`);
  }
  db.reservations = db.reservations.filter((r) => r.bookId !== bookId);
  db.loans.push({
    id: newId("L"),
    bookId,
    studentId,
    borrowDate: TODAY,
    dueDate: addDays(TODAY, LOAN_DAYS),
    returnDate: null,
  });
  saveDb(db);
  return ok(`"${book.title}" lent to ${studentName(studentId)}.`);
}

function returnBook(bookId) {
  const db = loadDb();
  const loan = db.loans.find((l) => l.bookId === bookId && !l.returnDate);
  if (!loan) return fail("This book is not currently on loan.");
  loan.returnDate = TODAY;
  saveDb(db);
  return ok("Book marked as returned.");
}

/* ---------- books (librarian) ---------- */

function validateBookFields(fields) {
  if (!fields.title || !fields.author || !fields.genre || !fields.shelf) {
    return "Title, author, genre and shelf code are required.";
  }
  if (!Number.isInteger(fields.year) || fields.year < 1450 || fields.year > 2026) {
    return "Enter a publication year between 1450 and 2026.";
  }
  return null;
}

function addBook(fields) {
  const error = validateBookFields(fields);
  if (error) return fail(error);
  const db = loadDb();
  const id = generateBookId(db);
  db.books.push({ id, ...fields, popularity: 0 });
  saveDb(db);
  return ok(`Book added with ID ${id}.`, { id });
}

function updateBook(bookId, fields) {
  const error = validateBookFields(fields);
  if (error) return fail(error);
  const db = loadDb();
  const book = findBook(db, bookId);
  if (!book) return fail("This book could not be found.");
  Object.assign(book, fields);
  saveDb(db);
  return ok("Book updated.");
}

function deleteBook(bookId) {
  const db = loadDb();
  if (bookStatus(db, bookId) === "borrowed") return fail("Return the book before deleting it.");
  db.books = db.books.filter((b) => b.id !== bookId);
  db.reservations = db.reservations.filter((r) => r.bookId !== bookId);
  saveDb(db);
  return ok("Book deleted.");
}

/* ---------- events ---------- */

function registerEvent(eventId, studentId) {
  const db = loadDb();
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return fail("This event could not be found.");
  if (event.registrations.includes(studentId)) return fail("You are already registered for this event.");
  if (seatsLeft(event) <= 0) return fail("This event is full.");
  event.registrations.push(studentId);
  saveDb(db);
  return ok("You are registered. See you there!");
}

function cancelRegistration(eventId, studentId) {
  const db = loadDb();
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return fail("This event could not be found.");
  event.registrations = event.registrations.filter((id) => id !== studentId);
  saveDb(db);
  return ok("Your registration was cancelled.");
}

function addEvent(fields) {
  if (!fields.title || !fields.date || !fields.start || !fields.end || !fields.location) {
    return fail("Title, date, start time, end time and location are required.");
  }
  if (fields.end <= fields.start) return fail("The end time must be after the start time.");
  if (!Number.isInteger(fields.capacity) || fields.capacity < 1) {
    return fail("Capacity must be at least 1.");
  }
  const db = loadDb();
  db.events.push({ id: newId("E"), ...fields, registrations: [] });
  saveDb(db);
  return ok("Event published.");
}

function updateEventCapacity(eventId, capacity) {
  const db = loadDb();
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return fail("This event could not be found.");
  if (!Number.isInteger(capacity) || capacity < event.registrations.length) {
    return fail(`Capacity cannot be lower than the ${event.registrations.length} people already registered.`);
  }
  event.capacity = capacity;
  saveDb(db);
  return ok("Capacity updated.");
}

function deleteEvent(eventId) {
  const db = loadDb();
  db.events = db.events.filter((e) => e.id !== eventId);
  saveDb(db);
  return ok("Event deleted.");
}

/* ---------- announcements ---------- */

function addAnnouncement(fields) {
  if (!fields.title || !fields.summary) return fail("Title and summary are required.");
  const db = loadDb();
  db.announcements.unshift({ id: newId("A"), date: TODAY, ...fields });
  saveDb(db);
  return ok("Announcement published to student pages.");
}

function deleteAnnouncement(announcementId) {
  const db = loadDb();
  db.announcements = db.announcements.filter((a) => a.id !== announcementId);
  saveDb(db);
  return ok("Announcement deleted.");
}

function markAnnouncementRead(studentId, announcementId) {
  const db = loadDb();
  db.readAnnouncements[studentId] = db.readAnnouncements[studentId] || [];
  if (!db.readAnnouncements[studentId].includes(announcementId)) {
    db.readAnnouncements[studentId].push(announcementId);
  }
  saveDb(db);
}
