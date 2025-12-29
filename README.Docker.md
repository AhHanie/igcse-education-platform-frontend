# Frontend Docker Environment – IGCSE Education Platform

This repository contains the Docker-based development environment for the IGCSE Education Platform **frontend**, built with **React + Vite**.

The setup is optimized for:

- Local development with hot reload
- Consistent behavior across machines
- Seamless integration with the Dockerized backend

---

## Overview

The frontend stack includes:

- React + Vite development server
- Docker container with live reload
- Environment-variable–driven backend API configuration

The frontend runs independently from the backend stack, but can connect to it over Docker networking or via external URLs.

---

## Prerequisites

- Docker Desktop (with Docker Compose v2)
- Node.js **not required** on host
- Backend running locally or remotely

---

## Environment Configuration (`.env`)

A `.env.example` file is provided. Copy it before starting the frontend:

```bash
cp .env.example .env
```

### `.env.example`

```env
VITE_API_BASE_URL=base-url
FRONTEND_PORT=5173
```

### Environment Variable Reference

#### `VITE_API_BASE_URL`

- Base URL of the backend API
- Must include protocol (`http://` or `https://`)
- Exposed to the browser (Vite requires `VITE_` prefix)

Examples:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=http://igcse-backend:8000
VITE_API_BASE_URL=https://api.example.com
```

---

#### `FRONTEND_PORT`

- Port exposed on the host machine
- Defaults to `5173`

```env
FRONTEND_PORT=5173
```

---

## Running the Frontend

From the frontend repository root:

```bash
docker compose up -d --build
```

The frontend will be available at:

```
http://localhost:5173
```

---

## Hot Reload (Live Development)

- Any change inside the `src/` directory triggers an automatic reload
- Uses polling-based file watching for Windows compatibility
- No rebuild required during development

---

## Connecting to the Backend

### Backend running locally (Dockerized)

```env
VITE_API_BASE_URL=http://igcse-backend:8000
```

### Backend running on host

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend running remotely

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

No frontend code changes are required.

---

## Common Commands

Build/Start the frontend:

```bash
docker compose up -d
```

Stop the frontend:

```bash
docker compose down
```

Rebuild after dependency changes:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f frontend
```

---
