from datetime import datetime

from app import db


class ShoppingList(db.Model):
    __tablename__ = "shopping_lists"
 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    budget = db.Column(db.Float, nullable=True)       # optional spending cap
    created_at = db.Column(db.DateTime, default=datetime.now)
 
    # Cascade delete — removing a list removes all its items
    items = db.relationship("Item", back_populates="shopping_list", cascade="all, delete-orphan", lazy=True)


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