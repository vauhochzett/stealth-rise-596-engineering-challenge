from api.models import ProcurementRequest


def get_requests() -> list[ProcurementRequest]:
    return []


def add_request(request: ProcurementRequest) -> bool:
    return True
