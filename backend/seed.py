from app import create_app
from extensions import db
from models import Item, ShoppingList

app = create_app()
 
CATEGORIES = ["Produce", "Dairy", "Bakery", "Meat & Fish", "Snacks", "Household", "Drinks", "Uncategorized"]

seed_data = [
    {
        "name": "Weekly Groceries",
        "budget": 5000.00,
        "items": [
            {"name": "Avocados (3)",       "price": 120.00, "quantity": 1, "category": "Produce",     "purchased": True},
            {"name": "Spinach",            "price": 50.00,  "quantity": 2, "category": "Produce",     "purchased": False},
            {"name": "Whole milk (1L)",    "price": 65.00,  "quantity": 3, "category": "Dairy",       "purchased": False},
            {"name": "Yoghurt (500g)",     "price": 110.00, "quantity": 1, "category": "Dairy",       "purchased": True},
            {"name": "Sourdough loaf",     "price": 220.00, "quantity": 1, "category": "Bakery",      "purchased": False},
            {"name": "Chicken breast",     "price": 480.00, "quantity": 1, "category": "Meat & Fish", "purchased": False},
            {"name": "Tilapia fillet",     "price": 350.00, "quantity": 2, "category": "Meat & Fish", "purchased": False},
            {"name": "Mineral water (6pk)","price": 300.00, "quantity": 1, "category": "Drinks",      "purchased": False},
        ]
    },
    {
        "name": "House Party",
        "budget": 8000.00,
        "items": [
            {"name": "Crisps assorted",    "price": 180.00, "quantity": 4, "category": "Snacks",      "purchased": False},
            {"name": "Soda (2L)",          "price": 140.00, "quantity": 5, "category": "Drinks",      "purchased": False},
            {"name": "Juice (1L)",         "price": 160.00, "quantity": 3, "category": "Drinks",      "purchased": True},
            {"name": "Paper plates",       "price": 95.00,  "quantity": 2, "category": "Household",   "purchased": False},
            {"name": "Cocktail sausages",  "price": 320.00, "quantity": 2, "category": "Meat & Fish", "purchased": False},
            {"name": "Cheese platter",     "price": 550.00, "quantity": 1, "category": "Dairy",       "purchased": False},
        ]
    },
    {
        "name": "Pharmacy Run",
        "budget": None,
        "items": [
            {"name": "Hand sanitizer",     "price": 180.00, "quantity": 2, "category": "Household",   "purchased": True},
            {"name": "Dish soap",          "price": 95.00,  "quantity": 1, "category": "Household",   "purchased": False},
            {"name": "Bin bags (20pk)",    "price": 120.00, "quantity": 1, "category": "Household",   "purchased": False},
        ]
    }
]
 
with app.app_context():
    # Clear existing data
    db.drop_all()
    db.create_all()
 
    for list_data in seed_data:
        shopping_list = ShoppingList(
            name=list_data["name"],
            budget=list_data["budget"]
        )
        db.session.add(shopping_list)
        db.session.flush()  # get the id before committing
 
        for item_data in list_data["items"]:
            item = Item(
                name=item_data["name"],
                price=item_data["price"],
                quantity=item_data["quantity"],
                category=item_data["category"],
                purchased=item_data["purchased"],
                list_id=shopping_list.id
            )
            db.session.add(item)
 
    db.session.commit()
    print("Database seeded successfully!")
    print(f" Created {len(seed_data)} lists with sample items.")