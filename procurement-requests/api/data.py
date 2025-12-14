from typing import List, Optional
from uuid import UUID

from api.models import Order, ProcurementRequest

# In-memory storage for procurement requests
_requests: List[ProcurementRequest] = [
    ProcurementRequest(
        requestor="John Doe",
        department="Aftersales",
        title="Office 365",
        vendor="Microsoft",
        vat_id="DE12345",
        commodity_group="Software",
        orders=[
            Order(title="Office 365", unit_price=12, amount=1, unit="seats", total=12)
        ],
        total=12,
    ),
    ProcurementRequest(
        requestor="Jane Smith",
        department="Marketing",
        title="Adobe Creative Cloud",
        vendor="Adobe Systems",
        vat_id="DE98765",
        commodity_group="Software Licenses",
        orders=[
            Order(
                title="Adobe Photoshop License",
                unit_price=200,
                amount=5,
                unit="licenses",
                total=1000,
            ),
            Order(
                title="Adobe Illustrator License",
                unit_price=150,
                amount=3,
                unit="licenses",
                total=450,
            ),
        ],
        total=1450,
    ),
    ProcurementRequest(
        requestor="Robert Johnson",
        department="IT",
        title="Server Hardware",
        vendor="Dell Technologies",
        vat_id="DE54321",
        commodity_group="Hardware",
        orders=[
            Order(
                title="Dell PowerEdge Servers",
                unit_price=2500,
                amount=2,
                unit="units",
                total=5000,
            ),
            Order(
                title="Network Switches",
                unit_price=800,
                amount=3,
                unit="units",
                total=2400,
            ),
        ],
        total=7400,
    ),
    ProcurementRequest(
        requestor="Emily Williams",
        department="HR",
        title="Recruitment Platform Subscription",
        vendor="LinkedIn Corporation",
        vat_id="DE11223",
        commodity_group="Services",
        orders=[
            Order(
                title="LinkedIn Recruiter Licenses",
                unit_price=1200,
                amount=2,
                unit="licenses",
                total=2400,
            )
        ],
        total=2400,
    ),
]


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
