from datetime import datetime

from extensions import db


class ShoppingList(db.Model):
    __tablename__ = "shopping_lists"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    budget = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Cascade delete — removing a list removes all its items
    items = db.relationship(
        "Item",
        back_populates="shopping_list",
        cascade="all, delete-orphan",
        lazy=True
    )

    def to_dict(self, include_items=False):
        data = {
            "id": self.id,
            "name": self.name,
            "budget": self.budget,
            "created_at": self.created_at.isoformat(),
        }
        if include_items:
            data["items"] = [item.to_dict() for item in self.items]
        return data


class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    category = db.Column(db.String(50), nullable=False, default="Uncategorized")
    aisle = db.Column(db.String(100), nullable=True)   # e.g. "Aisle 3", "Butchery"
    note = db.Column(db.String(255), nullable=True)   # e.g. "Get the organic one"
    purchased = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    list_id = db.Column(db.Integer, db.ForeignKey("shopping_lists.id"), nullable=False)
    shopping_list = db.relationship("ShoppingList", back_populates="items")

    def subtotal(self):
        return round(self.price * self.quantity, 2)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "quantity": self.quantity,
            "category": self.category,
            "aisle": self.aisle,
            "note": self.note,
            "purchased": self.purchased,
            "subtotal": self.subtotal(),
            "list_id": self.list_id,
            "created_at": self.created_at.isoformat(),
        }