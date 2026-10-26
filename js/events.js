/* Events: upcoming and past sessions, registration with capacity checks. */

const upcomingEvents = document.getElementById("upcomingEvents");
const pastEvents = document.getElementById("pastEvents");

function eventCardHTML(db, event, studentId) {
  const registered = event.registrations.includes(studentId);
  const left = seatsLeft(event);
  const isPast = event.date < TODAY;

  let status;
  if (isPast) status = `<span class="badge gray">Ended</span>`;
  else if (registered) status = `<span class="badge sage">You are registered</span>`;
  else if (left <= 0) status = `<span class="badge coral">Full</span>`;
  else status = `<span class="badge amber">Open</span>`;

  let action = "";
  if (!isPast) {
    if (registered) {
      action = `<button class="btn secondary small-btn" type="button" data-event="${esc(event.id)}" data-action="cancel">Cancel registration</button>`;
    } else if (left <= 0) {
      action = `<button class="btn secondary small-btn" type="button" disabled>No places left</button>`;
    } else {
      action = `<button class="btn primary small-btn" type="button" data-event="${esc(event.id)}" data-action="register">Register</button>`;
    }
  }

  const seats = isPast
    ? `${event.registrations.length} attended`
    : `${left} of ${event.capacity} places left`;

  return `
    <article class="card event-card${left <= 0 && !isPast ? " full" : ""}">
      ${status}
      <h3>${esc(event.title)}</h3>
      <p class="details">${formatDate(event.date)} · ${esc(event.start)}–${esc(event.end)}</p>
      <p class="details">${esc(event.location)} · ${esc(event.category)}</p>
      <p class="details">Organizer: ${esc(event.organizer)}</p>
      <p>${esc(event.description)}</p>
      <p class="seat-note">${seats}</p>
      <div class="actions">${action}</div>
    </article>`;
}

function render() {
  const db = loadDb();
  const studentId = currentStudentId();
  const upcoming = db.events.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const past = db.events.filter((e) => e.date < TODAY).sort((a, b) => b.date.localeCompare(a.date));

  upcomingEvents.innerHTML = upcoming.length
    ? upcoming.map((e) => eventCardHTML(db, e, studentId)).join("")
    : emptyState("No upcoming events. Check back soon.");
  pastEvents.innerHTML = past.length
    ? past.map((e) => eventCardHTML(db, e, studentId)).join("")
    : emptyState("No past events yet.");
}

function handleClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const studentId = currentStudentId();
  const eventId = button.dataset.event;
  const result = button.dataset.action === "register"
    ? registerEvent(eventId, studentId)
    : cancelRegistration(eventId, studentId);
  showToast(result.message, result.ok ? "ok" : "error");
}

upcomingEvents.addEventListener("click", handleClick);
pastEvents.addEventListener("click", handleClick);

onUpdate(render);
