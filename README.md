# 🩺 MedReport Summarizer

An AI-powered medical report summarization platform that enables users to upload medical documents and receive concise, easy-to-understand summaries while preserving critical clinical information.

Built with **FastAPI**, **React**, **SQLite*.

---

## 📌 Overview

MedReport Summarizer streamlines the process of understanding medical reports by automatically extracting text from uploaded documents and generating AI-powered summaries. The application provides secure authentication, document management, and an intuitive user experience.

---

## ✨ Features

- 🔐 Secure user authentication using JWT stored in HTTP-only cookies
- 👤 User registration and login
- 📄 Upload medical reports (PDF, DOCX, TXT)
- 📑 Automatic text extraction from uploaded documents
- 🤖 AI-generated medical report summaries using Anthropic Claude
- 📚 View previously uploaded reports
- 🔍 Search and filter reports
- 🗑️ Delete uploaded reports
- 📋 Copy generated summaries
- 📱 Fully responsive user interface
- ⚡ RESTful API architecture

---

# 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Backend | FastAPI |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Database | SQLite + SQLAlchemy |
| Authentication | JWT + HTTP-only Cookies |
| Password Hashing | Argon2 |
| AI Integration | Anthropic Claude API |
| Package Manager | uv |
| HTTP Client | Axios |

---

# 📁 Project Structure

```text
medreport-summarizer/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── pyproject.toml
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── .env.example
```

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/medreport-summarizer.git

cd medreport-summarizer
```

---

## 2. Backend Setup

```bash
cd backend

uv venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

uv pip install -e .
```

Create a `.env` file.

Example:

```env
SECRET_KEY=your_secret_key

DATABASE_URL=sqlite:///./medreport.db

ANTHROPIC_API_KEY=your_api_key

AI_MODEL=claude-3-sonnet

ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run the backend

```bash
uvicorn app.main:app --reload
```

Backend URL

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| SECRET_KEY | JWT secret key |
| DATABASE_URL | SQLite database URL |
| ACCESS_TOKEN_EXPIRE_MINUTES | JWT expiration time |
| ANTHROPIC_API_KEY | Anthropic API Key |
| AI_MODEL | Claude model name |
| FRONTEND_ORIGIN | Frontend URL |

---

# 📄 Supported File Types

- PDF
- DOCX
- TXT

---

# 🔒 Security

- HTTP-only authentication cookies
- JWT-based authentication
- Argon2 password hashing
- CORS protection
- Server-side file validation
- Upload size validation

---

# 📡 REST API

### Authentication

- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/auth/me`

### Reports

- POST `/reports/upload`
- GET `/reports`
- GET `/reports/{id}`
- DELETE `/reports/{id}`

---

# 📈 Future Improvements

- PostgreSQL support
- Background task processing
- Email verification
- Password reset
- Report categorization
- Download summaries as PDF
- Multi-language summaries
- Admin dashboard
- Docker deployment
- CI/CD pipeline

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

See the **LICENSE** file for details.

---

## 👨‍💻 Author

**Maalik Ashtar**
