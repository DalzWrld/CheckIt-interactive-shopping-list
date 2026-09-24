# 🛒 CheckIt

**CheckIt** is an interactive shopping list application that helps users create and manage shopping lists, organize items by category, track quantities and prices, and monitor their shopping budget.

The application features a vanilla JavaScript frontend backed by a Flask REST API, with separate development and production databases to provide a safe development workflow.

## ✨ Features

* Create and manage multiple shopping lists
* Set a budget for each shopping list
* Add items with:

  * Name
  * Quantity
  * Price
  * Category
  * Aisle
  * Notes
* Edit existing shopping items
* Mark items as purchased
* Delete individual items
* Delete shopping lists
* Filter items by category
* Track total and remaining spending
* View spending breakdowns by category
* Responsive dashboard and sidebar navigation
* Persistent database storage
* Separate local and production environments

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Fetch API

### Backend

* Python
* Flask
* Flask-RESTful
* Flask-SQLAlchemy
* Flask-Migrate
* Flask-CORS
* Marshmallow
* Gunicorn

### Databases

* **SQLite** for local development
* **PostgreSQL (Neon)** for production

### Deployment

* **Vercel** for the frontend
* **Render** for the Flask backend
* **Neon** for the production PostgreSQL database

## 🏗️ Architecture

CheckIt uses separate development and production environments.

### Local Development

```text
Frontend
http://127.0.0.1:5500
        │
        ▼
Flask API
http://localhost:5001
        │
        ▼
SQLite
instance/checkit_dev.db
```

### Production

```text
Vercel Frontend
        │
        ▼
Render Flask API
        │
        ▼
Neon PostgreSQL
```

The frontend automatically determines which backend to use based on the hostname.

```javascript
const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API = isLocal
    ? "http://localhost:5001"
    : "https://checkit-interactive-shopping-list.onrender.com";
```

This prevents local development and testing from modifying production data.

## 📁 Project Structure

```text
check-it-shopping-list/
├── backend/
│   ├── instance/
│   │   └── checkit_dev.db
│   ├── migrations/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── items.py
│   │   └── lists.py
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── Pipfile
│   ├── Pipfile.lock
│   └── seed.py
│
├── frontend/
│   ├── index.html
│   ├── config.js
│   └── main.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Python 3
* Pipenv
* Git
* A browser
* A local static-file server such as VS Code Live Server

### 1. Clone the Repository

```bash
git clone <repository-url>
cd check-it-shopping-list
```

### 2. Install Backend Dependencies

Navigate to the backend directory:

```bash
cd backend
```

Install the dependencies using Pipenv:

```bash
pipenv install
```

### 3. Apply Database Migrations

```bash
pipenv run flask db upgrade
```

The development environment uses the local SQLite database.

### 4. Run the Backend

```bash
pipenv run python app.py
```

The development API runs at:

```text
http://localhost:5001
```

### 5. Run the Frontend

Open the `frontend` directory using a local static server such as VS Code Live Server.

For example:

```text
http://127.0.0.1:5500
```

When running locally, CheckIt automatically communicates with the Flask API at `http://localhost:5001`.

## 🌐 API

The Flask backend exposes REST endpoints for shopping lists and their items.

### Shopping Lists

```text
GET    /lists/
POST   /lists/
GET    /lists/<id>
PUT    /lists/<id>
DELETE /lists/<id>
```

### Shopping List Items

Item-related endpoints allow the application to retrieve, create, update, and delete items associated with shopping lists.

```text
GET    /lists/<list_id>/items
POST   /lists/<list_id>/items
PUT    /items/<id>
DELETE /items/<id>
```

> Endpoint details may vary according to the route definitions in the backend.

## 🗄️ Database Configuration

CheckIt deliberately keeps development and production data separate.

### Development

Local development uses SQLite:

```text
backend/instance/checkit_dev.db
```

This database can contain development and testing data without affecting the deployed application.

### Production

The deployed backend uses a PostgreSQL database hosted on Neon.

The production database connection is supplied through the `DATABASE_URL` environment variable rather than being committed to the repository.

## 🔐 Environment Variables

The production backend expects environment variables such as:

```text
FLASK_ENV=production
DATABASE_URL=<postgresql-database-url>
ALLOWED_ORIGINS=<frontend-origin>
SECRET_KEY=<secret-key>
```

Sensitive environment variables and credentials should never be committed to source control.

## 🔄 Database Connection Handling

The application configures SQLAlchemy to verify database connections before using them:

```python
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
```

This helps prevent stale PostgreSQL connections from causing failed requests in the deployed application.

## 🌍 CORS

The backend uses Flask-CORS to control which frontend origins can communicate with the API.

In production, the allowed frontend origin is configured using the `ALLOWED_ORIGINS` environment variable.

This allows the deployed Vercel frontend to communicate with the Render API while keeping production CORS configuration explicit.

## 📦 Deployment

### Frontend

The frontend is deployed on Vercel.

### Backend

The Flask API is deployed on Render and served using Gunicorn:

```bash
gunicorn --bind 0.0.0.0:$PORT "app:create_app()"
```

Backend dependencies are installed using Pipenv.

### Database

Production data is stored in a Neon PostgreSQL database.

Database schema changes are managed using Flask-Migrate and Alembic.

## 🧪 Development vs Production

|          | Development              | Production        |
| -------- | ------------------------ | ----------------- |
| Frontend | Local static server      | Vercel            |
| Backend  | Flask development server | Render + Gunicorn |
| Database | SQLite                   | Neon PostgreSQL   |
| API      | `localhost:5001`         | Render API        |
| Data     | Local/test data          | Production data   |

Keeping these environments separate makes it possible to develop and experiment locally without accidentally changing production data.

## 📄 License

This project was created for educational and portfolio purposes.