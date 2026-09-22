"""
app.py
──────
Application factory. Wires together config, extensions, and blueprints.
Run directly for development:  python app.py
"""

import os

from config import config_map
from extensions import cors, db, migrate
from flask import Flask


def create_app(env: str | None = None) -> Flask:
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
    migrate.init_app(app, db)   # Flask-Migrate now manages schema changes

    # ── Register blueprints ──────────────────────────────────────────
    from routes.items import items_bp
    from routes.lists import lists_bp

    app.register_blueprint(lists_bp)
    app.register_blueprint(items_bp)

    return app


# ── Dev entry point ──────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app("development")
    app.run(debug=True, port=5000)