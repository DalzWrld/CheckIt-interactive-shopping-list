from flask import Blueprint, request, jsonify
from app import db
from models import ShoppingList, Item
 
lists_bp = Blueprint("lists", __name__, url_prefix="/lists")