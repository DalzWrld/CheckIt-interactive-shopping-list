from app import create_app
from extensions import db
from models import ShoppingList, Item
 
app = create_app()
 
CATEGORIES = ["Produce", "Dairy", "Bakery", "Meat & Fish", "Snacks", "Household", "Drinks", "Uncategorized"]