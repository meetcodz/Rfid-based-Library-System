# RFID Smart Library Management System 📚

A high-performance Django + PostgreSQL backend designed for an RFID-based library automation system. The system features a unique **Shelf-Scan Reconciliation** engine that identifies missing or misplaced books as a scanner moves through library shelves.

## Key Features

- **RFID Logic**: Direct API integration for RFID hardware (sessions, events, heartsbeats).
- **Shelf Scanning**: Automated logic to compare scanned tags against expected shelf inventory.
- **Smart Missing Reports**: Auto-generates alerts for books not found during a scan.
- **Full Catalog**: Complex book metadata with authors, categories, and physical copy tracking.
- **Circulation Management**: Issue/Return workflow with automated fine calculation.
- **Async Tasking**: Powered by Celery for background reconciliation and notifications.
- **Modern API**: RESTful endpoints with JWT authentication and auto-generated Swagger docs.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- PostgreSQL
- Redis (for Celery)

### 2. Installation
```bash
# Clone the repository and navigate into it
pip install -r requirements.txt
```

### 3. Configuration
- Copy `.env.example` to `.env`.
- Update your database credentials and Redis URL.

### 4. Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run the Server
```bash
python manage.py runserver
```

### 6. Run Celery (in separate terminals)
```bash
# Run Worker
celery -A library_system worker -l info

# Run Beat (for scheduled tasks)
celery -A library_system beat -l info
```

---

## 🔌 API Documentation
Once the server is running, visit:
- **Swagger UI**: `http/127.0.0.1:8000/api/docs/`
- **Redoc**: `http/127.0.0.1:8000/api/redoc/`

## 📡 Scanner Integration Guide

1. **Start Session**: Hardware sends `POST /api/scanner/sessions/start/` with `device_id` and `shelf_id`.
2. **Stream Events**: As tags are scanned, send batches to `POST /api/scanner/sessions/{id}/events/`.
3. **Finish Scan**: Send `POST /api/scanner/sessions/{id}/end/`. The system immediately runs the reconciliation service to identify missing books.
