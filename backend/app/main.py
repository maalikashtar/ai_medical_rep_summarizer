from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.database import Base, engine
from app.models import models  # noqa: F401  (ensures models are registered with Base)
from app.routers import auth, reports

settings = get_settings()

# Create DB tables on startup (simple approach suitable for SQLite / small deployments)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Medical Report Summarizer API",
    description="AI-powered medical report upload, extraction, and summarization service.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reports.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"success": True, "message": "ok"}


# ---------- Standardized JSON error responses ----------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "detail": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "Internal server error."},
    )
