from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, Field, PositiveInt


class Order(BaseModel):
    title: str
    """Description of the item/service. Example: Adobe Photoshop License"""

    unit_price: Annotated[Decimal, Field(gt=0)]
    """Price per unit/item/service. Example: 200"""

    amount: PositiveInt
    """The quantity or number of units being ordered. Example: 5"""

    unit: str
    """The unit of measure or quantity (e.g., licenses). Example: licenses"""

    total: Annotated[Decimal, Field(gt=0)]
    """Total Price: Total price for this line (Unit Price x Amount). Example: 1000"""


class ProcurementRequest(BaseModel):
    requestor: str
    """Full name of the person submitting the request. Example: John Doe"""

    department: str
    """The Deparment of the Requestor"""

    title: str
    """Brief name or description of the product/service requested. Example: Adobe Creative Cloud Subscription"""

    vendor: str
    """Name of the company or individual providing the items/services. Example: Adobe Systems"""

    vat_id: str  # TODO validation
    """VAT identification number of the vendor. Example: DE123456789"""

    commodity_group: str  # TODO validation
    """The category or group the requested items/services belong to. Example: Software Licenses"""

    orders: list[Order]
    """A list of `Order`s."""

    total: Decimal
    """Estimated total cost of the request. Example: 3000"""
