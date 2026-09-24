import os

# Base directory of the backend folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")

# Ensure instance/ exists (Git won't track empty folders)
os.makedirs(INSTANCE_DIR, exist_ok=True)


class Config:
    """Base configuration — shared across all environments."""

    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "checkit-dev-secret-key")
    JSON_SORT_KEYS = False

    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False         # Set to True to log raw SQL queries

    SQLALCHEMY_ENGINE_OPTIONS = {  # noqa: RUF012
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    # CORS — restrict origins in production
    CORS_ORIGINS = [  # noqa: RUF012
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "*").split(",")
    ]


class DevelopmentConfig(Config):
    """Local development — debug on, SQLite database."""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DEV_DATABASE_URL",
        f"sqlite:///{os.path.join(INSTANCE_DIR, 'checkit_dev.db')}"
    )
    SQLALCHEMY_ECHO = True          # Prints SQL to terminal — helpful while building


class TestingConfig(Config):
    """Testing — uses an in-memory SQLite DB so tests never touch real data."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production — expects a proper DATABASE_URL env variable."""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    CORS_ORIGINS = [  # noqa: RUF012
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "*").split(",")
    ]

    # Safety check — raise early if no DB URL is set
    @classmethod
    def validate(cls):
        if not cls.SQLALCHEMY_DATABASE_URI:
            raise ValueError("DATABASE_URL environment variable is not set.")


# ── Config map — used by create_app() ───────────────────────────────
config_map = {
    "development": DevelopmentConfig,
    "testing":     TestingConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig,
}