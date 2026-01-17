# Ankietio

Anonymous survey platform built with Angular and FastAPI.

## Prerequisites

- Node.js 18+ & npm
- Python 3.9+
- PostgreSQL 15+

## Quick Start

### 1. Database

```bash
createdb ankietio_db
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ENV_TEMPLATE.txt .env
alembic upgrade head
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend: http://localhost:4200
