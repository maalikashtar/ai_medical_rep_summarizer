import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings

settings = get_settings()


def ensure_upload_dir() -> Path:
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


async def save_upload_file(file: UploadFile, user_id: str) -> tuple[str, int]:
    """Save an uploaded file to disk under a per-user subfolder.

    Returns (stored_path, size_in_bytes).
    """
    upload_dir = ensure_upload_dir() / user_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_path = upload_dir / unique_name

    size = 0
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    with open(dest_path, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                out_file.close()
                dest_path.unlink(missing_ok=True)
                raise ValueError(
                    f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                )
            out_file.write(chunk)

    return str(dest_path), size


def delete_file(stored_path: str) -> None:
    try:
        Path(stored_path).unlink(missing_ok=True)
    except OSError:
        pass
