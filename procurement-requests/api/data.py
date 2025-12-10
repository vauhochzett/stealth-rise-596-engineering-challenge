from typing import List, Optional
from uuid import UUID

from api.models import ProcurementRequest

# In-memory storage for procurement requests
_requests: List[ProcurementRequest] = []


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


def update_request_status(request_id: UUID, status: str) -> bool:
    """Update the status of a procurement request."""
    try:
        for request in _requests:
            if request.id == request_id:
                request.status = status
                return True
        return False
    except Exception:
        return False
