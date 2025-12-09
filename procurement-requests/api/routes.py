from fastapi import APIRouter, HTTPException, Request
from fastapi.templating import Jinja2Templates

import api.data
from api.models import ProcurementRequest

templates = Jinja2Templates(directory="html")
router = APIRouter()


@router.get("/")
async def index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html", context={})


@router.get("/requests")
async def get_requests():
    return api.data.get_requests()


@router.post("/request/new")
async def add_request(request: ProcurementRequest):
    success: bool = api.data.add_request(request)
    if not success:
        raise HTTPException(status_code=500, detail="request could not be created")

    return {"message": "Request created"}
