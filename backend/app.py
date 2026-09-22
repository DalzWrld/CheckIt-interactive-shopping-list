"""
app.py
──────
Application factory. Wires together config, extensions, and blueprints.
Run directly for development:  python app.py
"""
 
import os
from flask import Flask
from config import config_map
from extensions import db, cors