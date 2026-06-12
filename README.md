# ☽ AstroSync — Astrologer CRM

A full-stack CRM application built for astrologers to manage clients, track consultations, record astrological details, and schedule follow-ups.

---

## 🚀 Features

- **Authentication** — JWT-based register/login with secure password hashing
- **Client Management** — Full CRUD for clients with astrological profiles (sun/moon/rising signs, birth details, place of birth)
- **Consultation Logging** — Track sessions by type, mode, duration, fee, and payment status; record predictions and remedies
- **Follow-up Tracker** — Schedule follow-ups with priority levels; auto-marks overdue items
- **Dashboard** — Real-time stats: revenue, session counts, upcoming appointments, and chart visualizations
- **Client Detail View** — Full profile with consultation history and lifetime revenue

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Recharts, Axios, date-fns |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB with Mongoose ODM         |
| Auth      | JWT + bcryptjs                    |
| Styling   | Custom CSS (no UI framework)      |

---

## 📁 Project Structure

```
astrologer-crm/
├── backend/
│   ├── models/          # Mongoose schemas (User, Client, Consultation, FollowUp)
│   ├── routes/          # Express route handlers
│   ├── middleware/       # JWT auth middleware
│   ├── server.js        # App entry point
│   └── .env.example
├── frontend/
│   ├── public/
│   └── src/
│       ├── context/     # AuthContext (global auth state)
│       ├── components/  # Layout, Sidebar
│       ├── pages/       # Dashboard, Clients, Consultations, FollowUps, ClientDetail
│       ├── App.js       # Routes
│       └── App.css      # Global styles (celestial dark theme)
└── README.md
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env          # Edit MONGODB_URI and JWT_SECRET
npm run dev                   # Starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start                     # Starts on http://localhost:3000
```

The frontend proxies API calls to `localhost:5000` via `"proxy"` in `package.json`.

---

## 🗃 API Endpoints

| Method | Endpoint                     | Description                  |
|--------|------------------------------|------------------------------|
| POST   | /api/auth/register           | Create account               |
| POST   | /api/auth/login              | Login                        |
| GET    | /api/auth/me                 | Get current user             |
| GET    | /api/clients                 | List clients (paginated)     |
| POST   | /api/clients                 | Create client                |
| GET    | /api/clients/:id             | Get single client            |
| PUT    | /api/clients/:id             | Update client                |
| DELETE | /api/clients/:id             | Delete client                |
| GET    | /api/consultations           | List consultations           |
| POST   | /api/consultations           | Create consultation          |
| PUT    | /api/consultations/:id       | Update consultation          |
| DELETE | /api/consultations/:id       | Delete consultation          |
| GET    | /api/followups               | List follow-ups              |
| POST   | /api/followups               | Create follow-up             |
| PUT    | /api/followups/:id           | Update / mark complete       |
| DELETE | /api/followups/:id           | Delete follow-up             |
| GET    | /api/dashboard/stats         | Aggregated dashboard stats   |

---

## 🧠 Architecture Decisions

- **Monorepo** with separate `backend/` and `frontend/` directories for clarity
- **JWT stored in localStorage** — acceptable for this scope; httpOnly cookies would be preferable in production
- **Mongoose per-document auth scoping** — every query filters by `astrologer: req.user.id` so data is fully isolated per user
- **Proxy in frontend** — avoids CORS complexity in development
- **Recharts** for visualization — lightweight and composable

---

## 🔮 Future Improvements

1. **Birth chart generation** — Integrate an astronomy API (e.g. AstroAPI) to auto-calculate houses and planetary positions
2. **Calendar view** — Visual weekly/monthly calendar for scheduled consultations
3. **Email/WhatsApp reminders** — Automated follow-up notifications via Twilio or SendGrid
4. **Export** — PDF consultation reports and CSV client exports
5. **Multi-astrologer admin** — Hierarchical roles for a practice with multiple astrologers
6. **Mobile app** — React Native wrapper for on-the-go session logging
7. **Cloud deployment** — Docker + CI/CD to Railway or Render

---

## 📸 Demo

> See the attached 5–10 minute demo video.
