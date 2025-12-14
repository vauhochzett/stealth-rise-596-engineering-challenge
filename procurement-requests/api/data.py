import json
import logging
import os
from pathlib import Path
from typing import List, Optional
from uuid import UUID

from api.models import Order, ProcurementRequest, RequestStatus

DATA_FILE = Path(
    os.environ.get(
        "REQUESTS_FILE_PATH",
        Path(__file__).resolve().parent / "requests_data.json",
    )
)


def load_mock_requests() -> List[ProcurementRequest]:
    """Load mock procurement requests from JSON file."""
    mock_data_path = os.path.join(os.path.dirname(__file__), "mock_data.json")

    if not os.path.exists(mock_data_path):
        return []

    with open(mock_data_path, "r") as f:
        data = json.load(f)

    # Convert dictionaries to ProcurementRequest objects
    requests = []
    for item in data:
        # Convert order dictionaries to Order objects
        orders = [Order(**order_data) for order_data in item["orders"]]
        # Create ProcurementRequest with orders
        request = ProcurementRequest(
            requestor=item["requestor"],
            department=item["department"],
            title=item["title"],
            vendor=item["vendor"],
            vat_id=item["vat_id"],
            commodity_group=item["commodity_group"],
            orders=orders,
            total=item["total"],
            status=item["status"],
        )
        requests.append(request)

    return requests


def _load_requests_from_disk() -> Optional[List[ProcurementRequest]]:
    if not DATA_FILE.exists():
        return None

    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
        # Treat empty files as "no data" so we can seed from mocks
        if not data:
            return None
        return [ProcurementRequest.model_validate(item) for item in data]
    except Exception as exc:  # noqa: BLE001
        logging.error("Failed to load persisted requests: %s", exc)
        return None


def _save_requests_to_disk(requests: List[ProcurementRequest]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump([request.model_dump(mode="json") for request in requests], f, indent=2)


def _initialize_requests() -> List[ProcurementRequest]:
    """Load persisted data or fall back to mock data and seed disk."""
    persisted = _load_requests_from_disk()
    if persisted is not None:
        return persisted

    seeded = load_mock_requests()
    try:
        _save_requests_to_disk(seeded)
    except Exception as exc:  # noqa: BLE001
        logging.error("Failed to seed persisted requests: %s", exc)
    return seeded


# In-memory storage for procurement requests
_requests: List[ProcurementRequest] = _initialize_requests()


def get_requests() -> List[ProcurementRequest]:
    """Retrieve all procurement requests."""
    return _requests


def get_request_by_id(request_id: UUID) -> Optional[ProcurementRequest]:
    """Retrieve a specific procurement request by its ID."""
    for request in _requests:
        if request.id == request_id:
            return request
    return None


def add_request(request: ProcurementRequest) -> bool:
    """Add a new procurement request."""
    try:
        _requests.append(request)
        _save_requests_to_disk(_requests)
        return True
    except Exception:
        return False


def update_request_status(request_id: UUID, status: RequestStatus) -> bool:
    """Update the status of a procurement request."""
    try:
        for request in _requests:
            if request.id == request_id:
                request.status = status
                _save_requests_to_disk(_requests)
                return True
        return False
    except Exception:
        return False
