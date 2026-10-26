# Library Hub

A prototype website for automating a school library. It shows how students can search books, reserve them, see their loans, register for events, and read announcements. Librarians can manage the catalogue, lend and return books, publish announcements and events, and preview the announcement email.

This is an IB MYP Grade 9 personal project prototype. All books, students, loans, events, and announcements are **fictional demo data**.

## Features

| Page | What it does |
|---|---|
| Home (`index.html`) | Welcome, search, live statistics, latest announcements, upcoming events, popular books |
| Books (`catalogue.html`) | Search by title, author, genre or book ID; filter by genre and availability; sort; book details; reserve or cancel a reservation |
| My Books (`my-books.html`) | Current loans with due dates and overdue status, reservations with cancel, borrowing history |
| Events (`events.html`) | Upcoming and past events, registration with capacity checks, no duplicate registration |
| Announcements (`announcements.html`) | Filter by category and read status, mark as read, links to related events and books |
| Librarian (`librarian.html`) | Add, edit, delete books (random unique 4-digit IDs), lend and return, reservations and loans records, publish announcements with an email preview, create events, set capacity, see registrations |

Other features:

- **Light and dark themes.** The toggle is in the header. The choice is saved and restored after reload. On the first visit, the theme follows the device setting.
- **Student selector.** The header dropdown switches between three fictional students, so you can demonstrate reservations and registrations for each.
- **Shared data.** Every page reads and writes the same data, so a librarian's change appears on student pages right away.

## How to run

**Option 1: open the file.** Double-click `index.html`. It works in any modern browser.

**Option 2: GitHub Pages (recommended for sharing).**
1. In the repository, go to **Settings → Pages**.
2. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Open the link GitHub shows (`https://<username>.github.io/library-hub/`).

## Data storage and reset

Data is saved in the browser's `localStorage`, under the key `libraryHub.v1`.

- Changes stay after reload, but **only in that browser**. Another computer starts with the starting data.
- To reset everything, use **Reset demo data** on the Librarian page, or clear the site data in the browser settings.

## Email preview (simulated)

On the Librarian page, **Preview email** shows the subject, recipients and body that would be sent. **Publish** also shows the preview. Each preview is labelled *Simulated email. Nothing was sent.* No email is sent, and no student email addresses are stored or used.

Publishing an announcement works whether or not email is set up.

## Demo mode warning

The Librarian page has **no login**. Anyone who opens the page can use it. This is only acceptable for a classroom prototype with fictional data. A real system needs secure authentication and a server-side database.

## Limitations

- Each browser keeps its own data. A real library needs a shared database on a server.
- Book IDs are random placeholders. A real library would use its existing barcodes or shelf codes.
- The 3-reservation limit, the 14-day loan period, and the hours are demo rules, not school policy.
- Email delivery is not connected. Future work: Google OAuth with an approved email service, following the school's privacy rules, with parental/school consent before any real student is contacted.
- Icons are text labels, to keep the prototype simple.

## Project structure

```
index.html            Home
catalogue.html        Book catalogue and details
my-books.html         Loans and reservations
events.html           Events and registration
announcements.html    Announcements
librarian.html        Librarian dashboard (demo)
css/style.css         Design system: colours, components, both themes
js/data.js            Sample data and the data layer (save, load, rules)
js/common.js          Theme, menu, student selector, shared card builders
js/*.js               One script per page
```

## Demonstration guide (about 3 minutes)

1. **Home:** point out the stats and announcements. Switch the student in the header and show that the unread count changes.
2. **Books:** search for `Tolkien`. Open *The Hobbit* and reserve it. Try to reserve *1984* as a different student, which is already reserved.
3. **My Books:** show the reservation and cancel it.
4. **Events:** register for the Reading Workshop. Show that *Book Discussion* is full for the other students.
5. **Librarian:** add a book (note the random ID), publish an announcement and show the email preview, then return to the student pages to show it.
6. **Theme:** toggle dark mode, reload the page, and show that the choice stays.
