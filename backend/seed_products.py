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
        "price": 99.0,
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
        "price": 99.0,
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
        "price": 89.0,
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
        "price": 175.0,
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
        "price": 270.0,
        "image": "/combo_family_pack_front.jpg",
        "category": "Combos",
        "description": "Our signature trio! A complete family pack featuring Spicy Chekodi, Khara Mixture, and our Classic Plain Chekodi. A perfect balance of spice, crunch, and tradition for everyone in the family.",
        "ingredients": "Refer to individual packs for ingredient details",
        "stock": 100
    },
    {
        "id": 3,
        "name": "Achappam",
        "slug": "achappam",
        "price": 110.0,
        "image": "/premium_achappam.png",
        "category": "Sweet Snacks",
        "description": "Delicate flower-shaped crackers made from rice flour and coconut milk. Light, airy and mildly sweet — a timeless festive snack loved across generations.",
        "ingredients": "Rice flour, coconut milk, eggs, sugar, sesame seeds, cardamom, refined oil",
        "stock": 100
    },
    {
        "id": 4,
        "name": "Janthikalu",
        "slug": "janthikalu",
        "price": 95.0,
        "image": "/premium_janthikalu.png",
        "category": "Namkeen",
        "description": "Traditional Andhra-style murukku made from urad dal and rice flour. Perfectly twisted, golden fried and seasoned with sesame seeds and butter for that melt-in-mouth crunch.",
        "ingredients": "Rice flour, urad dal flour, butter, sesame seeds, cumin, salt, refined oil",
        "stock": 100
    },
    {
        "id": 5,
        "name": "Murukku",
        "slug": "murukku",
        "price": 85.0,
        "image": "/premium_murukku.png",
        "category": "Namkeen",
        "description": "Classic South Indian murukku made from rice flour and black gram. Perfectly crispy spirals seasoned with cumin and pepper — an all-time family favourite.",
        "ingredients": "Rice flour, black gram flour, cumin seeds, pepper, asafoetida, salt, sesame seeds, oil",
        "stock": 100
    },
    {
        "id": 6,
        "name": "Masala Boondi",
        "slug": "masala-boondi",
        "price": 70.0,
        "image": "/premium_boondi.png",
        "category": "Namkeen",
        "description": "Tiny golden chickpea flour pearls tossed with chaat masala, roasted cumin and tangy amchur. Addictively crunchy and bursting with bold spices in every bite.",
        "ingredients": "Besan (chickpea flour), chaat masala, cumin, amchur, red chilli, black pepper, salt, oil",
        "stock": 100
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
