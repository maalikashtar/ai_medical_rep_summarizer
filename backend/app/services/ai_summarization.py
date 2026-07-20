from anthropic import Anthropic, APIError

from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = (
    "You are a medical report summarization assistant. Given the raw extracted text "
    "of a patient's medical report, produce a clear, concise, easy-to-understand summary "
    "for a non-medical reader. Preserve all clinically important information: diagnoses, "
    "key lab values and whether they are normal/abnormal, medications, dosages, and any "
    "recommended follow-up or next steps. Use short paragraphs and bullet points where "
    "helpful. Do not invent information that is not present in the report. Do not provide "
    "new medical advice beyond what is stated in the report. Keep the summary well under "
    "half the length of the original text."
)

# Character limit to keep prompt sizes reasonable / within context limits
MAX_INPUT_CHARS = 60_000


class SummarizationError(Exception):
    pass


def summarize_report(extracted_text: str) -> str:
    if not settings.ANTHROPIC_API_KEY:
        raise SummarizationError(
            "AI summarization is not configured. Set ANTHROPIC_API_KEY in the backend .env file."
        )

    text = extracted_text[:MAX_INPUT_CHARS]

    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    try:
        response = client.messages.create(
            model=settings.AI_MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Summarize the following medical report:\n\n{text}",
                }
            ],
        )
    except APIError as exc:  # noqa: BLE001
        raise SummarizationError(f"AI provider error: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        raise SummarizationError(f"Unexpected error calling AI provider: {exc}") from exc

    parts = [block.text for block in response.content if getattr(block, "type", "") == "text"]
    summary = "\n".join(parts).strip()

    if not summary:
        raise SummarizationError("AI provider returned an empty summary.")

    return summary
