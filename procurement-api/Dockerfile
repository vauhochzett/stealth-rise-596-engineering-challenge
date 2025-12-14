# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS base

WORKDIR /app

# Keep bytecode and avoid cache layers from uv installs
ENV UV_COMPILE_BYTECODE=1 UV_NO_CACHE=1

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-progress

COPY api ./api
COPY main.py ./
COPY html ./html

# Dedicated mount point for persisted request data
VOLUME ["/data"]
ENV REQUESTS_FILE_PATH=/data/requests_data.json

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
