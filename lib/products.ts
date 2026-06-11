// Products data — edit prices, names, descriptions here
export interface Product {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  ingredients: string;
  category: string;
  image: string;          // primary / fallback image
  images?: string[];      // optional gallery: [front, back, ...]
  rating: number;
  reviews: number;
  prices: Record<string, number>;
  bestseller: boolean;
  spiceLevel: string;
  shelfLife: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Spicy Chekodi",
    slug: "chekodi",
    tagline: "Crispy Telangana Classic",
    description: "Handmade rice flour spirals, perfectly seasoned with cumin and carom seeds. Crunchy with every bite — a beloved Telangana tradition made fresh in our home kitchen.",
    ingredients: "Rice flour, Gram Flour (Besan), Edible Vegetable Oil (Refined Palmolein Oil), Salt, Red Chilli Powder, Ajwain",
    category: "Namkeen",
    image: "/product_chekodi_front.jpeg",
    images: ["/product_chekodi_front.jpeg", "/product_chekodi_back.jpeg"],
    rating: 4.8,
    reviews: 124,
    prices: { "250g": 99, "500g": 180, "1kg": 340 } as Record<string, number>,
    bestseller: true,
    spiceLevel: "Medium",
    shelfLife: "3 Months",
  },
  {
    id: 11,
    name: "Premium Classic Plain Chekodi",
    slug: "plain-chekodi",
    tagline: "Traditional Crispy Wholesome",
    description: "Handmade rice flour spirals, perfectly seasoned and completely non-spicy. A mild, balanced crunch that brings back pure childhood memories.",
    ingredients: "Rice flour, Gram Flour (Besan), Edible Vegetable Oil (Refined Palmolein Oil), Salt, Ajwain",
    category: "Namkeen",
    image: "/product_plain_chekodi_front.jpg",
    images: ["/product_plain_chekodi_front.jpg", "/product_plain_chekodi_back.jpg"],
    rating: 4.8,
    reviews: 86,
    prices: { "250g": 99, "500g": 180, "1kg": 340 } as Record<string, number>,
    bestseller: false,
    spiceLevel: "Mild",
    shelfLife: "3 Months",
  },
  {
    id: 2,
    name: "Khara Mixture",
    slug: "khara-mixture",
    tagline: "Spicy Namkeen Medley",
    description: "A bold and irresistible mix of fried sev, roasted peanuts, crispy dal, curry leaves and spices. The perfect tea-time companion with authentic Telangana flavours.",
    ingredients: "Besan sev, fried peanuts, roasted chana dal, poha, curry leaves, green chillies, mustard oil, spices",
    category: "Namkeen",
    image: "/product_khara_mixture_front.jpeg",
    images: ["/product_khara_mixture_front.jpeg", "/product_khara_mixture_back.jpeg"],
    rating: 4.9,
    reviews: 210,
    prices: { "250g": 89, "500g": 160, "1kg": 300 },
    bestseller: true,
    spiceLevel: "Spicy",
    shelfLife: "30 days",
  },
  {
    id: 10,
    name: "Combo: Spicy Chekodi & Khara Mixture",
    slug: "combo-spicy-chekodi-khara-mixture",
    tagline: "The Perfect Spicy Pair",
    description: "Enjoy our two best-selling spicy snacks together! Get the classic handmade crunch of our Spicy Chekodi along with the irresistible medley of our authentic Khara Mixture. Perfect for hosting or gifting.",
    ingredients: "Refer to individual packs for ingredient details",
    category: "Combos",
    image: "/combo_chekodi_mixture_front.jpeg",
    images: ["/combo_chekodi_mixture_front.jpeg", "/combo_chekodi_mixture_back.jpeg"],
    rating: 5.0,
    reviews: 42,
    prices: { "500g (2x250g)": 175, "1kg (2x500g)": 320 },
    bestseller: true,
    spiceLevel: "Spicy",
    shelfLife: "3 Months",
  },
  {
    id: 12,
    name: "Family Pack Super Combo",
    slug: "family-pack-super-combo",
    tagline: "The Ultimate Premium Collection",
    description: "Our signature trio! A complete family pack featuring Spicy Chekodi, Khara Mixture, and our Classic Plain Chekodi. A perfect balance of spice, crunch, and tradition for everyone in the family.",
    ingredients: "Refer to individual packs for ingredient details",
    category: "Combos",
    image: "/combo_family_pack_front.jpg",
    images: ["/combo_family_pack_front.jpg", "/combo_family_pack_back.jpg"],
    rating: 5.0,
    reviews: 68,
    prices: { "750g (3x250g)": 270, "1.5kg (3x500g)": 490 },
    bestseller: true,
    spiceLevel: "Mixed",
    shelfLife: "3 Months",
  },
  {
    id: 3,
    name: "Achappam",
    slug: "achappam",
    tagline: "Flower-Shaped Rice Crackers",
    description: "Delicate flower-shaped crackers made from rice flour and coconut milk. Light, airy and mildly sweet — a timeless festive snack loved across generations.",
    ingredients: "Rice flour, coconut milk, eggs, sugar, sesame seeds, cardamom, refined oil",
    category: "Sweet Snacks",
    image: "/premium_achappam.png",
    rating: 4.7,
    reviews: 98,
    prices: { "250g": 110, "500g": 200, "1kg": 380 },
    bestseller: false,
    spiceLevel: "Mild",
    shelfLife: "21 days",
  },
  {
    id: 4,
    name: "Janthikalu",
    slug: "janthikalu",
    tagline: "Traditional Andhra Chakli",
    description: "Traditional Andhra-style murukku made from urad dal and rice flour. Perfectly twisted, golden fried and seasoned with sesame seeds and butter for that melt-in-mouth crunch.",
    ingredients: "Rice flour, urad dal flour, butter, sesame seeds, cumin, salt, refined oil",
    category: "Namkeen",
    image: "/premium_janthikalu.png",
    rating: 4.8,
    reviews: 156,
    prices: { "250g": 95, "500g": 170, "1kg": 320 },
    bestseller: false,
    spiceLevel: "Mild",
    shelfLife: "45 days",
  },
  {
    id: 5,
    name: "Murukku",
    slug: "murukku",
    tagline: "Golden Spiral Delight",
    description: "Classic South Indian murukku made from rice flour and black gram. Perfectly crispy spirals seasoned with cumin and pepper — an all-time family favourite.",
    ingredients: "Rice flour, black gram flour, cumin seeds, pepper, asafoetida, salt, sesame seeds, oil",
    category: "Namkeen",
    image: "/premium_murukku.png",
    rating: 4.6,
    reviews: 187,
    prices: { "250g": 85, "500g": 150, "1kg": 280 },
    bestseller: false,
    spiceLevel: "Mild",
    shelfLife: "45 days",
  },
  {
    id: 6,
    name: "Masala Boondi",
    slug: "masala-boondi",
    tagline: "Spicy Golden Pearls",
    description: "Tiny golden chickpea flour pearls tossed with chaat masala, roasted cumin and tangy amchur. Addictively crunchy and bursting with bold spices in every bite.",
    ingredients: "Besan (chickpea flour), chaat masala, cumin, amchur, red chilli, black pepper, salt, oil",
    category: "Namkeen",
    image: "/premium_boondi.png",
    rating: 4.5,
    reviews: 143,
    prices: { "250g": 70, "500g": 130, "1kg": 240 },
    bestseller: false,
    spiceLevel: "Spicy",
    shelfLife: "30 days",
  },
];

export const CATEGORIES = ["All", "Namkeen", "Sweet Snacks"];

export const SHIPPING_RATES = {
  india: {
    free_above: 499,
    flat_rate: 60,
    cod_charge: 30,
    cod_available: true,
  },
  international: {
    base_rate: 999,
    per_100g: 50,
    cod_available: false,
  },
};
