from extensions import db
from flask import Blueprint, jsonify, request
from models import Item

items_bp = Blueprint("items", __name__, url_prefix="/items")


# ── PATCH /items/<id> ── edit name/price/qty/category or toggle purchased
@items_bp.route("/<int:item_id>", methods=["PATCH"])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()

    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "Item name cannot be empty."}), 400
        item.name = name

    if "price" in data:
        price = float(data["price"])
        if price < 0:
            return jsonify({"error": "Price cannot be negative."}), 400
        item.price = price

    if "quantity" in data:
        qty = int(data["quantity"])
        if qty < 1:
            return jsonify({"error": "Quantity must be at least 1."}), 400
        item.quantity = qty

    if "category" in data:
        item.category = data["category"].strip() or "Uncategorised"

    if "aisle" in data:
        item.aisle = data["aisle"].strip() or None

    if "note" in data:
        item.note = data["note"].strip() or None

    if "purchased" in data:
        item.purchased = bool(data["purchased"])

    db.session.commit()
    return jsonify(item.to_dict()), 200


# ── DELETE /items/<id> ── delete a single item ──────────────────────
@items_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": f'Item "{item.name}" deleted.'}), 200