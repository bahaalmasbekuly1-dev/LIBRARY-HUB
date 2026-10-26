/* Home dashboard: search, stats, recent announcements, events, popular books. */

const heroForm = document.getElementById("heroSearch");
heroForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const term = document.getElementById("heroQuery").value.trim();
  window.location.href = term ? `catalogue.html?q=${encodeURIComponent(term)}` : "catalogue.html";
});

onUpdate(() => {
  const db = loadDb();
  const studentId = currentStudentId();
  const readIds = db.readAnnouncements[studentId] || [];

  const available = db.books.filter((book) => bookStatus(db, book.id) === "available").length;
  const upcoming = db.events.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const unread = db.announcements.filter((a) => !readIds.includes(a.id)).length;

  document.getElementById("statBooks").textContent = db.books.length;
  document.getElementById("statAvailable").textContent = available;
  document.getElementById("statEvents").textContent = upcoming.length;
  document.getElementById("statUnread").textContent = unread;

  const recentAnnouncements = [...db.announcements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  document.getElementById("homeAnnouncements").innerHTML =
    recentAnnouncements.length ? recentAnnouncements.map(announcementCard).join("") : emptyState("No announcements yet.");

  document.getElementById("homeEvents").innerHTML =
    upcoming.length ? upcoming.slice(0, 3).map(eventSummaryCard).join("") : emptyState("No upcoming events. Check back soon.");

  const popular = [...db.books].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  document.getElementById("homeBooks").innerHTML = popular.map((book) => bookCard(db, book)).join("");
});
