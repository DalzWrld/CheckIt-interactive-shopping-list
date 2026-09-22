from app import db
from flask import Blueprint, jsonify, request
from models import Item, ShoppingList

lists_bp = Blueprint("lists", __name__, url_prefix="/lists")

# ── GET /lists ── get all lists ─────────────────────────────────────
@lists_bp.route("/", methods=["GET"])
def get_lists():
    lists = ShoppingList.query.order_by(ShoppingList.created_at.desc()).all()
    return jsonify([l.to_dict() for l in lists]), 200


# ── GET /lists/<id> ── get a single list with its items ─────────────
@lists_bp.route("/<int:list_id>", methods=["GET"])
def get_list(list_id):
    shopping_list = ShoppingList.query.get_or_404(list_id)
    return jsonify(shopping_list.to_dict(include_items=True)), 200


# ── POST /lists ── create a new list ────────────────────────────────
@lists_bp.route("/", methods=["POST"])
def create_list():
    data = request.get_json()
 
    name   = (data.get("name") or "").strip()
    budget = data.get("budget")
 
    if not name:
        return jsonify({"error": "List name is required."}), 400
 
    shopping_list = ShoppingList(name=name, budget=float(budget) if budget else None)
    db.session.add(shopping_list)
    db.session.commit()
 
    return jsonify(shopping_list.to_dict()), 201