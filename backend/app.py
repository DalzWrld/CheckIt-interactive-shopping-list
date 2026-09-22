"""
app.py
──────
Application factory. Wires together config, extensions, and blueprints.
Run directly for development:  python app.py
"""
 
import os

from config import config_map
from extensions import cors, db
from flask import Flask


def create_app(env: str = None) -> Flask:
    """
    Create and return a configured Flask application.
 
    Args:
        env: One of 'development', 'testing', 'production'.
             Falls back to the FLASK_ENV environment variable,
             then to 'default' (DevelopmentConfig).
    """
    app = Flask(__name__)
 
    # ── Load config ──────────────────────────────────────────────────
    env = env or os.environ.get("FLASK_ENV", "default")
    app.config.from_object(config_map[env])
 
    # ── Initialise extensions ────────────────────────────────────────
    db.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})