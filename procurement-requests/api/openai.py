import asyncio
import json
import os
from typing import Any

from fastapi import HTTPException
from openai import APIError, OpenAI
from pydantic import ValidationError

from api.models import ProcurementRequest, RequestStatus

# Short, strict schema description to steer the model.
_SCHEMA_PROMPT = f"""
You extract procurement request data from PDFs and return ONLY valid JSON.
The JSON must represent a ProcurementRequest with these fields:
- requestor (string)
- department (string)
- title (string)
- vendor (string)
- vat_id (string)
- commodity_group (string)
- orders (list of objects with: title, unit_price, amount, unit, total)
- total (number)
- status (string; one of: {", ".join([status.value for status in RequestStatus])}. Default to "Open" if missing.)

Rules:
- Read all values from the PDF. Do not invent data.
- Return prices as plain numbers without currency symbols or commas.
- Sum line totals accurately; set status to "Open" when not specified.
- Respond with JSON only, no prose.
"""

if not os.getenv("OPENAI_API_KEY"):
    raise IOError("Please set OPENAI_API_KEY to start")

client: OpenAI = OpenAI()


def _upload_pdf(client: OpenAI, pdf_bytes: bytes, filename: str) -> str:
    try:
        file = client.files.create(
            file=(filename, pdf_bytes, "application/pdf"), purpose="vision"
        )
        return file.id
    except APIError as exc:
        raise HTTPException(status_code=502, detail="OpenAI upload failed") from exc


def _parse_openai_json(content: str) -> ProcurementRequest:
    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502, detail="Model returned invalid JSON"
        ) from exc

    # Allow the model to omit the status and default to OPEN.
    payload.setdefault("status", RequestStatus.OPEN.value)

    try:
        request = ProcurementRequest.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Extracted data failed validation: {exc.errors()}",
        ) from exc
    return request


def _build_messages(file_id: str) -> list[dict[str, Any]]:
    return [
        {"role": "system", "content": _SCHEMA_PROMPT.strip()},
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": (
                        "Extract the procurement request as JSON following the schema. "
                        "Use the attached PDF only."
                    ),
                },
                {"type": "input_file", "input_file_id": file_id},
            ],
        },
    ]


def _extract_from_pdf(pdf_bytes: bytes, filename: str) -> ProcurementRequest:
    file_id = _upload_pdf(client, pdf_bytes, filename)

    try:
        response = client.chat.completions.create(
            model="gpt-5.1",
            messages=_build_messages(file_id),
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
    except APIError as exc:
        raise HTTPException(status_code=502, detail="OpenAI extraction failed") from exc

    return _parse_openai_json(content)


async def extract_procurement_request(
    pdf_bytes: bytes, filename: str
) -> ProcurementRequest:
    """
    Extract and validate procurement data from a PDF using OpenAI, offloading the
    blocking API call to a thread so FastAPI's event loop stays responsive.
    """
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    return await asyncio.to_thread(_extract_from_pdf, pdf_bytes, filename)
