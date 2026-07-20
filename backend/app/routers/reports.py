from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.models import User, Report
from app.schemas import ReportOut, ReportDetailOut, ReportListResponse
from app.core.deps import get_current_user
from app.core.config import get_settings
from app.services.storage import save_upload_file, delete_file
from app.services.document_processing import extract_text, ExtractionError
from app.services.ai_summarization import summarize_report, SummarizationError

router = APIRouter(prefix="/api/reports", tags=["reports"])
settings = get_settings()


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: PDF, DOCX, TXT.",
        )

    try:
        stored_path, size = await save_upload_file(file, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    report = Report(
        user_id=current_user.id,
        file_name=file.filename,
        stored_path=stored_path,
        file_type=ext.lstrip("."),
        file_size=size,
        status="processing",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Process synchronously: extract text -> summarize. On failure, mark report as failed
    # but keep the record so the user sees what happened.
    try:
        extracted = extract_text(stored_path, ext)
        report.extracted_text = extracted
        db.commit()

        summary = summarize_report(extracted)
        report.summary = summary
        report.status = "done"
    except ExtractionError as exc:
        report.status = "failed"
        report.error_message = str(exc)
    except SummarizationError as exc:
        report.status = "failed"
        report.error_message = str(exc)
    except Exception as exc:  # noqa: BLE001
        report.status = "failed"
        report.error_message = f"Unexpected error: {exc}"

    db.commit()
    db.refresh(report)

    return ReportOut.model_validate(report)


@router.get("", response_model=ReportListResponse)
def list_reports(
    search: Optional[str] = Query(None, description="Search by file name"),
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Report).filter(Report.user_id == current_user.id)

    if search:
        like = f"%{search.strip()}%"
        query = query.filter(or_(Report.file_name.ilike(like)))

    if sort == "oldest":
        query = query.order_by(Report.uploaded_at.asc())
    else:
        query = query.order_by(Report.uploaded_at.desc())

    reports = query.all()

    return ReportListResponse(
        total=len(reports),
        items=[ReportOut.model_validate(r) for r in reports],
    )


@router.get("/{report_id}", response_model=ReportDetailOut)
def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    return ReportDetailOut.model_validate(report)


@router.delete("/{report_id}")
def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    delete_file(report.stored_path)
    db.delete(report)
    db.commit()

    return {"success": True, "message": "Report deleted successfully."}
