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
    prices: { "450g": 1, "700g": 249 } as Record<string, number>,
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
    prices: { "450g": 169, "700g": 249 } as Record<string, number>,
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
    prices: { "350g": 129, "700g": 249 },
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
    prices: { "800g (450g+350g)": 279, "1.4kg (2x700g)": 459 },
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
    prices: { "1.25kg (450g+450g+350g)": 429, "2.1kg (3x700g)": 699 },
    bestseller: true,
    spiceLevel: "Mixed",
    shelfLife: "3 Months",
  },
  {
    id: 13,
    name: "Combo: Classic Chekodi & Spicy Chekodi",
    slug: "combo-classic-spicy-chekodi",
    tagline: "The Ultimate Chekodi Lover's Pack",
    description: "The ultimate Chekodi lover's pack! Enjoy the mild, traditional crunch of our Classic Plain Chekodi alongside the bold kick of our Spicy Chekodi.",
    ingredients: "Refer to individual packs for ingredient details",
    category: "Combos",
    image: "/spicy chekodi classic chekodi combo.jpeg",
    images: ["/spicy chekodi classic chekodi combo.jpeg", "/spicy chekodi classic chekodi combo back.jpeg"],
    rating: 5.0,
    reviews: 24,
    prices: { "900g (2x450g)": 309, "1.4kg (2x700g)": 459 },
    bestseller: true,
    spiceLevel: "Mixed",
    shelfLife: "3 Months",
  },
  {
    id: 14,
    name: "Combo: Classic Chekodi & Khara Mixture",
    slug: "combo-classic-chekodi-khara-mixture",
    tagline: "The Perfect Balance of Mild and Spicy",
    description: "Enjoy our traditional handmade Classic Plain Chekodi alongside the bold, spicy crunch of our authentic Khara Mixture. A perfectly balanced combo for all taste buds!",
    ingredients: "Refer to individual packs for ingredient details",
    category: "Combos",
    image: "/classic chekodi and khara combo front.jpeg",
    images: ["/classic chekodi and khara combo front.jpeg", "/classic chekodi and khara combo back.jpeg"],
    rating: 5.0,
    reviews: 18,
    prices: { "800g (450g+350g)": 279, "1.4kg (2x700g)": 459 },
    bestseller: false,
    spiceLevel: "Mixed",
    shelfLife: "3 Months",
  },
];

export const CATEGORIES = ["All", "Namkeen", "Combos"];

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
