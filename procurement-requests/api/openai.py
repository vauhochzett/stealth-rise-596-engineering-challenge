import asyncio
import json
import logging
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

# Brief prompt to classify commodity groupings from structured request data.
_CLASSIFICATION_PROMPT = """
You act as a procurement analyst. Given request details, return ONLY JSON with a
single field `commodity_group` describing the overall category (e.g., Software
Licenses, IT Hardware, Consulting Services, Office Supplies, Marketing). Stay
concise and pick the closest standard procurement category.
""".strip()

if not os.getenv("OPENAI_API_KEY"):
    raise IOError("Please set OPENAI_API_KEY to start")

client: OpenAI = OpenAI()


def _chat_completion(
    messages: list[dict[str, Any]],
    *,
    response_format: dict[str, str] | None,
    detail: str,
) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-5.1",
            messages=messages,
            response_format=response_format,
        )
        content = response.choices[0].message.content
    except APIError as exc:
        logging.error(f"OpenAI API error: {exc}")
        raise HTTPException(
            status_code=502, detail=f"OpenAI {detail} failed"
        ) from exc

    if not content:
        raise HTTPException(
            status_code=502, detail=f"OpenAI {detail} returned no content"
        )
    return content


def _upload_pdf(client: OpenAI, pdf_bytes: bytes, filename: str) -> str:
    try:
        file = client.files.create(
            file=(filename, pdf_bytes, "application/pdf"), purpose="user_data"
        )
        return file.id
    except APIError as exc:
        logging.error(f"OpenAI API error: {exc}")
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
        logging.error(f"Validation error: {exc}")
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
                    "type": "text",
                    "text": (
                        "Extract the procurement request as JSON following the schema. "
                        "Use the attached PDF only."
                    ),
                },
                {"type": "file", "file": {"file_id": file_id}},
            ],
        },
    ]


def _extract_from_pdf(pdf_bytes: bytes, filename: str) -> ProcurementRequest:
    file_id = _upload_pdf(client, pdf_bytes, filename)

    content = _chat_completion(
        _build_messages(file_id),
        response_format={"type": "json_object"},
        detail="extraction",
    )
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


def _build_classification_messages(request: ProcurementRequest) -> list[dict[str, Any]]:
    """Create a compact, human-readable summary of the request for classification."""
    lines = [
        f"Title: {request.title}",
        f"Department: {request.department}",
        f"Vendor: {request.vendor}",
        f"VAT ID: {request.vat_id}",
        f"Requestor: {request.requestor}",
    ]

    if request.orders:
        lines.append("Orders:")
        for order in request.orders:
            lines.append(
                f"- {order.title}: {order.amount} {order.unit} at {order.unit_price} each "
                f"(line total {order.total})"
            )
    lines.append(f"Total amount: {request.total}")

    return [
        {"role": "system", "content": _CLASSIFICATION_PROMPT},
        {"role": "user", "content": "\n".join(lines)},
    ]


def _parse_commodity_group(content: str) -> str:
    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502, detail="Model returned invalid JSON for commodity group"
        ) from exc

    commodity_group = payload.get("commodity_group")
    if not commodity_group or not isinstance(commodity_group, str):
        raise HTTPException(
            status_code=422,
            detail="Model response missing commodity_group",
        )
    return commodity_group.strip()


def _classify_commodity_group(request: ProcurementRequest) -> str:
    content = _chat_completion(
        _build_classification_messages(request),
        response_format={"type": "json_object"},
        detail="commodity classification",
    )
    return _parse_commodity_group(content)


async def determine_commodity_group(request: ProcurementRequest) -> str:
    """
    Derive a commodity group from the request data using OpenAI, offloading to a
    thread to keep the FastAPI event loop responsive.
    """
    return await asyncio.to_thread(_classify_commodity_group, request)
