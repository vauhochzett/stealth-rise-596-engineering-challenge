import json
import os
from typing import List, Optional
from uuid import UUID

from api.models import Order, ProcurementRequest, RequestStatus


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


# In-memory storage for procurement requests
_requests: List[ProcurementRequest] = load_mock_requests()


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
        return True
    except Exception:
        return False


def update_request_status(request_id: UUID, status: RequestStatus) -> bool:
    """Update the status of a procurement request."""
    try:
        for request in _requests:
            if request.id == request_id:
                request.status = status
                return True
        return False
    except Exception:
        return False
