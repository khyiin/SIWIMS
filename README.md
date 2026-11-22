# SIWIMS

**Student Internship and Work Immersion Management System**

A centralized frontend prototype that connects **Students**, **Schools
(Internship Coordinators)**, **Partner Companies**, and **Company
Supervisors** in one platform — from requirements and applications to
attendance, accomplishment reports, evaluations, and internship
completion.

See [`product.md`](product.md) for the product requirements and
[`design.md`](design.md) for the design direction.

---

## Technology

- HTML5, CSS3, and vanilla JavaScript (no frameworks)
- Separate HTML, CSS, and JS files with reusable modules
- `localStorage` / `sessionStorage` for demonstration authentication
- Structured so a backend and database can be integrated later

> **Note:** Authentication here is a demonstration only. Credentials are
> stored in the browser and are **not** production secure. Real security
> must be enforced by a backend.

---

## Project structure

```
SIWIMS/
├── design.md
├── product.md
├── README.md
│
├── index.html                # Landing page
├── login.html                # Login page
│
├── student/dashboard.html    # Student dashboard
├── coordinator/dashboard.html# School / Internship Coordinator dashboard
├── company/dashboard.html    # Partner company dashboard
├── supervisor/dashboard.html # Company supervisor dashboard
│
├── assets/
│   ├── images/               # Photography used across the site
│   └── icons/                # (reserved for future icon assets)
│
├── css/
│   ├── style.css             # Design tokens + shared components
│   ├── landing.css           # Landing page
│   ├── login.css             # Login page
│   └── dashboard.css         # Shared dashboard styles
│
└── js/
    ├── auth.js               # Authentication + session (centralised)
    ├── access-control.js     # Role-based access guards
    ├── login.js              # Login page controller
    ├── landing.js            # Landing page behaviour
    └── dashboard.js          # Shared dashboard behaviour
```

---

## Running the prototype

Open `index.html` in a browser, or serve the folder locally (recommended
so all relative paths resolve correctly):

```bash
# Python 3
python -m http.server 5500

# or Node.js
npx serve .
```

Then visit `http://localhost:5500/`.

---

## Demonstration accounts

| Role | Username | Email | Password |
| :--- | :--- | :--- | :--- |
| Student | `student` | student@siwims.edu | `student123` |
| School Coordinator | `coordinator` | coordinator@siwims.edu | `coordinator123` |
| Company | `company` | hr@brightwave.example | `company123` |
| Supervisor | `supervisor` | supervisor@brightwave.example | `supervisor123` |

Login accepts either the **username** or the **email**.

---

## Authentication & access control

- Credentials are validated in [`js/auth.js`](js/auth.js); sessions are
  stored under a single key and honoured by "Remember me" (persistent
  storage) versus a temporary session.
- Each dashboard declares its role via `<body data-role="...">` and is
  guarded by [`js/access-control.js`](js/access-control.js):
  - Unauthenticated users are redirected to the login page.
  - A signed-in user who opens another role's URL is redirected to their
    own dashboard.
  - Logging out clears the session; returning via the browser's
    back/forward cache re-checks access.
- After login, users are redirected to the dashboard that matches their
  role.

---

## Scope of this prototype

The landing page, login, authentication, validation, and the four
role-based dashboards are implemented. Dashboard content uses realistic
sample data to demonstrate layout, navigation, and status workflows;
actions such as approving, verifying, and submitting are placeholders
ready to be wired to a backend.

---

## License

For academic/educational use.
