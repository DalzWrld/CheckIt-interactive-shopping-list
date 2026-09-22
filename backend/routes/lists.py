from app import db
from flask import Blueprint, jsonify, request
from models import Item, ShoppingList

lists_bp = Blueprint("lists", __name__, url_prefix="/lists")


# ──────────────────────────────────────────────────────────────────────────
#                             GET ROUTES
# ──────────────────────────────────────────────────────────────────────────

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


# ── GET /lists/<id>/items ── get all items in a list ────────────────
@lists_bp.route("/<int:list_id>/items", methods=["GET"])
def get_items(list_id):
    ShoppingList.query.get_or_404(list_id)   # 404 if list doesn't exist
    items = Item.query.filter_by(list_id=list_id).order_by(Item.created_at.desc()).all()
    return jsonify([i.to_dict() for i in items]), 200


# ──────────────────────────────────────────────────────────────────────────
#                             POST ROUTES
# ──────────────────────────────────────────────────────────────────────────

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


# ── POST /lists/<id>/items ── add an item to a list ─────────────────
@lists_bp.route("/<int:list_id>/items", methods=["POST"])
def add_item(list_id):
    ShoppingList.query.get_or_404(list_id)
    data = request.get_json()
 
    name     = (data.get("name") or "").strip()
    price    = data.get("price")
    quantity = data.get("quantity", 1)
    category = (data.get("category") or "Uncategorised").strip()
 
    if not name:
        return jsonify({"error": "Item name is required."}), 400
    if price is None or float(price) < 0:
        return jsonify({"error": "A valid price is required."}), 400
 
    item = Item(
        name=name,
        price=float(price),
        quantity=int(quantity),
        category=category,
        list_id=list_id
    )
    db.session.add(item)
    db.session.commit()
 
    return jsonify(item.to_dict()), 201


# ── PATCH /lists/<id> ── update list name or budget ─────────────────
@lists_bp.route("/<int:list_id>", methods=["PATCH"])
def update_list(list_id):
    shopping_list = ShoppingList.query.get_or_404(list_id)
    data = request.get_json()
 
    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "List name cannot be empty."}), 400
        shopping_list.name = name
 
    if "budget" in data:
        shopping_list.budget = float(data["budget"]) if data["budget"] else None
 
    db.session.commit()
    return jsonify(shopping_list.to_dict()), 200


# ── DELETE /lists/<id> ── delete a list and all its items ───────────
@lists_bp.route("/<int:list_id>", methods=["DELETE"])
def delete_list(list_id):
    shopping_list = ShoppingList.query.get_or_404(list_id)
    db.session.delete(shopping_list)
    db.session.commit()
    return jsonify({"message": f'List "{shopping_list.name}" deleted.'}), 200