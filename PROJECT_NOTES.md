# Project Notes — AstroSync Astrologer CRM

## Tech Stack

    Frontend:  React 18, React Router v6, Recharts, Axios, date  fns
    Backend:  Node.js 18+, Express.js 4
    Database:  MongoDB with Mongoose ODM
    Authentication:  JSON Web Tokens (JWT) + bcryptjs password hashing

   

## Architecture

### Backend (REST API)
```
Express App
  ├── /api/auth        → register, login, profile
  ├── /api/clients     → CRUD for client profiles
  ├── /api/consultations → CRUD for consultation sessions
  ├── /api/followups   → CRUD + auto  overdue detection
  └── /api/dashboard   → MongoDB aggregation stats
```

All routes are protected by JWT middleware. Every database query is scoped to `astrologer: req.user.id` so each logged  in user only sees their own data.

### Frontend (SPA)
```
React App
  ├── AuthContext        → JWT token management, user state
  ├── Layout             → Sidebar + main content shell
  ├── Dashboard          → Stats cards + Recharts bar/pie
  ├── Clients            → Table + modal CRUD
  ├── ClientDetail       → Full profile + consultation history
  ├── Consultations      → Table + modal CRUD with remedies
  └── FollowUps          → Table + modal, one  click complete
```

   

## Key Design Decisions

### 1. Per  User Data Scoping
Every model has an `astrologer` field referencing the User. Every backend query includes `astrologer: req.user.id`. This means the app is multi  tenant by default — each astrologer's data is completely isolated.

### 2. Consultation → Client Stats Sync
When a consultation is created, the client's `totalConsultations` and `lastConsultationDate` are updated atomically using `$inc`. This avoids expensive count queries on the client detail page.

### 3. Auto Overdue Follow  ups
The GET `/api/followups` route runs a bulk update before returning results, setting any `Pending` follow  ups with a past `dueDate` to `Overdue`. This is a simple background mechanism that doesn't require a cron job.

### 4. Dashboard Aggregations
The dashboard uses MongoDB's aggregation pipeline to compute revenue and session counts per month in a single query, rather than fetching all records to the application layer.

   

## Assumptions Made

1. One astrologer per account — no team/multi  user practice support
2. Currency is INR (₹) — hardcoded for the Indian market
3. No file upload — no birth chart image storage
4. No real  time notifications — follow  up reminders are visual only

   

## Future Improvements

1. Automated reminders  — WhatsApp/email alerts for upcoming follow  ups (Twilio / SendGrid)
2. Birth chart visualization  — Integrate Swiss Ephemeris or AstroAPI to render planetary charts
3. Calendar view  — Full calendar UI for consultation scheduling
4. PDF export  — Generate consultation summary reports for clients
5. Cloud deployment  — Docker + Railway/Render with environment secrets
6. Refresh tokens  — Replace single JWT with access + refresh token pair
7. Input validation  — Add Joi/Zod schema validation on backend routes
8. Test coverage  — Jest unit tests for route handlers and utility functions
