import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="c:/Users/samee/OneDrive/Desktop/website/backend/.env")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import models

engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)
db = Session()

# Products array corresponding to lib/products.ts
products_to_seed = [
    {
        "id": 1,
        "name": "Spicy Chekodi",
        "slug": "chekodi",
        "price": 169.0,
        "image": "/product_chekodi_front.jpeg",
        "category": "Namkeen",
        "description": "Handmade rice flour spirals, perfectly seasoned with cumin and carom seeds. Crunchy with every bite — a beloved Telangana tradition made fresh in our home kitchen.",
        "ingredients": "Rice flour, Gram Flour (Besan), Edible Vegetable Oil (Refined Palmolein Oil), Salt, Red Chilli Powder, Ajwain",
        "stock": 100
    },
    {
        "id": 11,
        "name": "Premium Classic Plain Chekodi",
        "slug": "plain-chekodi",
        "price": 169.0,
        "image": "/product_plain_chekodi_front.jpg",
        "category": "Namkeen",
        "description": "Handmade rice flour spirals, perfectly seasoned and completely non-spicy. A mild, balanced crunch that brings back pure childhood memories.",
        "ingredients": "Rice flour, Gram Flour (Besan), Edible Vegetable Oil (Refined Palmolein Oil), Salt, Ajwain",
        "stock": 100
    },
    {
        "id": 2,
        "name": "Khara Mixture",
        "slug": "khara-mixture",
        "price": 129.0,
        "image": "/product_khara_mixture_front.jpeg",
        "category": "Namkeen",
        "description": "A bold and irresistible mix of fried sev, roasted peanuts, crispy dal, curry leaves and spices. The perfect tea-time companion with authentic Telangana flavours.",
        "ingredients": "Besan sev, fried peanuts, roasted chana dal, poha, curry leaves, green chillies, mustard oil, spices",
        "stock": 100
    },
    {
        "id": 10,
        "name": "Combo: Spicy Chekodi & Khara Mixture",
        "slug": "combo-spicy-chekodi-khara-mixture",
        "price": 279.0,
        "image": "/combo_chekodi_mixture_front.jpeg",
        "category": "Combos",
        "description": "Enjoy our two best-selling spicy snacks together! Get the classic handmade crunch of our Spicy Chekodi along with the irresistible medley of our authentic Khara Mixture. Perfect for hosting or gifting.",
        "ingredients": "Refer to individual packs for ingredient details",
        "stock": 100
    },
    {
        "id": 12,
        "name": "Family Pack Super Combo",
        "slug": "family-pack-super-combo",
        "price": 429.0,
        "image": "/combo_family_pack_front.jpg",
        "category": "Combos",
        "description": "Our signature trio! A complete family pack featuring Spicy Chekodi, Khara Mixture, and our Classic Plain Chekodi. A perfect balance of spice, crunch, and tradition for everyone in the family.",
        "ingredients": "Refer to individual packs for ingredient details",
        "stock": 100
    },
    {
        "id": 13,
        "name": "Combo: Classic Chekodi & Spicy Chekodi",
        "slug": "combo-classic-spicy-chekodi",
        "price": 309.0,
        "image": "/spicy chekodi classic chekodi combo.jpeg",
        "category": "Combos",
        "description": "The ultimate Chekodi lover's pack! Enjoy the mild, traditional crunch of our Classic Plain Chekodi alongside the bold kick of our Spicy Chekodi.",
        "ingredients": "Refer to individual packs for ingredient details",
        "stock": 50
    },
    {
        "id": 14,
        "name": "Combo: Classic Chekodi & Khara Mixture",
        "slug": "combo-classic-chekodi-khara-mixture",
        "price": 279.0,
        "image": "/classic chekodi and khara combo front.jpeg",
        "category": "Combos",
        "description": "Enjoy our traditional handmade Classic Plain Chekodi alongside the bold, spicy crunch of our authentic Khara Mixture. A perfectly balanced combo for all taste buds!",
        "ingredients": "Refer to individual packs for ingredient details",
        "stock": 50
    }
]

# Insert or update products
for prod_data in products_to_seed:
    existing = db.query(models.Product).filter(models.Product.id == prod_data["id"]).first()
    if existing:
        for k, v in prod_data.items():
            setattr(existing, k, v)
        print(f"Updated product: {prod_data['name']}")
    else:
        new_prod = models.Product(**prod_data)
        db.add(new_prod)
        print(f"Created product: {prod_data['name']}")

db.commit()

# Reset PostgreSQL sequence for products table if needed
try:
    from sqlalchemy import text
    db.execute(text("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))"))
    db.commit()
    print("Reset products sequence.")
except Exception as e:
    print(f"Note on sequence reset: {e}")

print("Seeding completed successfully!")
