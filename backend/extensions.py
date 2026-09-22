"""
extensions.py
─────────────
Flask extensions are instantiated here — without being bound to any
app instance. create_app() in app.py calls .init_app(app) on each one,
which is the Flask application factory pattern.

Importing from this file (instead of from app.py) keeps models, routes,
and any future services free of circular imports.
"""

from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
cors = CORS()
migrate = Migrate()