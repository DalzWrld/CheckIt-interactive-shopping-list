import os
 
# Base directory of the backend folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
 
 
class Config:
    """Base configuration — shared across all environments."""
 
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "checkit-dev-secret-key")
    JSON_SORT_KEYS = False
 
    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False         # Set to True to log raw SQL queries
 
    # CORS — restrict origins in production
    CORS_ORIGINS = "*"


class DevelopmentConfig(Config):
    """Local development — debug on, SQLite database."""
 
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DEV_DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'checkit_dev.db')}"
    )
    SQLALCHEMY_ECHO = True          # Prints SQL to terminal — helpful while building
 
 
class TestingConfig(Config):
    """Testing — uses an in-memory SQLite DB so tests never touch real data."""
 
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False