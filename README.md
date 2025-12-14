# Procurement Request Manager

## Quick Start

- Set the environment variable OPENAI_API_KEY.
- Run `docker compose up -d`
- Open http://localhost:5173 in the browser.

## Manual Start

### API

- [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- Navigate to `procurement-requests`.
- Run `uv run fastapi dev main.py` to start the API.

### Frontend

- [Install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Navigate to `procurement-app`.
- Set the environment by either...
  - exporting VITE_API_BASE_URL or...
  - copying `.env.example` to `.env` and setting the variable there.
- Run `npm install; npm run dev` to start the frontend server.
