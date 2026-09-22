from flask import Blueprint, request, jsonify
from app import db
from models import Item
 
items_bp = Blueprint("items", __name__, url_prefix="/items")