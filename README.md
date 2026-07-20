# MedReport Summarizer

An AI-powered web application that lets users upload medical reports (PDF, DOCX, TXT),
automatically extracts the text, and generates a clear, easy-to-understand AI summary
while preserving important medical information.

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Backend        | FastAPI (Python)                                  |
| Frontend       | React + Vite + Tailwind CSS                       |
| Database       | SQLite (via SQLAlchemy)                           |
| Auth           | JWT stored in secure HTTP-only cookies            |
| Password hash  | Argon2 (`argon2-cffi`)                            |
| AI provider    | Anthropic Claude (`anthropic` Python SDK)         |
| Package manager (backend) | [`uv`](https://docs.astral.sh/uv/)     |

## Project Structure

```
medreport-summarizer/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── core/             # config, security (JWT + Argon2), auth dependency
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routers/          # auth & reports API routes
│   │   ├── services/         # file storage, text extraction, AI summarization
│   │   ├── database.py
│   │   ├── schemas.py        # Pydantic request/response models
│   │   └── main.py           # FastAPI app entrypoint
│   ├── uploads/               # uploaded files stored here (gitignored)
│   ├── pyproject.toml         # dependencies (managed with uv)
│   └── .env.example
└── frontend/                  # React + Vite application
    ├── src/
    │   ├── api/               # axios API clients
    │   ├── components/        # FileUpload, ReportList, Navbar, Toast, ProtectedRoute
    │   ├── context/           # AuthContext
    │   ├── pages/              # Login, Register, Dashboard, ReportDetail
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## Getting Started

### 1. Backend setup (FastAPI + uv)

```bash
cd backend
uv venv .venv
source .venv/bin/activate        # on Windows: .venv\Scripts\activate
uv pip install -e .

cp .env.example .env
# Edit .env and set:
#   SECRET_KEY=<generate a long random string>
#   ANTHROPIC_API_KEY=<your Anthropic API key>

uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

> Alternatively, once you have a `uv.lock`, you can simply run `uv sync` then
> `uv run uvicorn app.main:app --reload`.

### 2. Frontend setup (React + Vite)

```bash
cd frontend
cp .env.example .env   # optional — dev server proxies /api to localhost:8000 by default
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables (backend/.env)

| Variable                     | Description                                             |
|-------------------------------|-----------------------------------------------------------|
| `SECRET_KEY`                  | Secret used to sign JWTs — set a long random value        |
| `ALGORITHM`                   | JWT signing algorithm (default `HS256`)                   |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token/cookie lifetime in minutes                           |
| `DATABASE_URL`                | SQLAlchemy database URL (default local SQLite file)        |
| `ANTHROPIC_API_KEY`           | API key for AI summarization                                |
| `AI_MODEL`                    | Claude model name used for summarization                    |
| `MAX_UPLOAD_SIZE_MB`          | Max allowed upload file size                                 |
| `UPLOAD_DIR`                  | Directory where uploaded files are stored                   |
| `FRONTEND_ORIGIN`             | Allowed CORS origin for the frontend dev/prod URL           |

## Features

- **User Authentication** — register/login with Argon2-hashed passwords; sessions
  managed via secure, HTTP-only JWT cookies.
- **Medical Report Upload** — PDF, DOCX, TXT with server-side type & size validation
  and a drag-and-drop UI with progress indicator.
- **Document Processing** — text extraction from PDF (`pypdf`), DOCX (`python-docx`,
  including tables), and TXT.
- **AI-Powered Summarization** — extracted text sent to Claude for a concise,
  patient-friendly summary that preserves key medical details.
- **Summary Display** — original report and AI summary shown side by side.
- **Report History** — list of past uploads with date, file name, and status.
- **Search & Filter** — search by file name, sort by newest/oldest.
- **Report Management** — delete reports, copy or download summaries.
- **REST API** — standardized JSON success/error envelopes across all endpoints.
- **Responsive UI** — Tailwind-based layout that adapts to desktop, tablet, mobile.

## Notes on Production Readiness

- Set `secure=True` on the auth cookie in `backend/app/routers/auth.py` once serving
  over HTTPS.
- Consider moving AI summarization to a background task/queue (e.g. Celery, RQ, or
  FastAPI `BackgroundTasks`) for large files so uploads return immediately.
- Swap SQLite for PostgreSQL for multi-instance deployments by changing
  `DATABASE_URL`.
- Add rate limiting on `/api/auth/*` endpoints in production.
