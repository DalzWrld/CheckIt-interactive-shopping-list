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