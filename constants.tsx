
import { Product, ContactInfo } from './types';

export const CONTACT_INFO: ContactInfo = {
  email: 'morisejakait2@gmail.com',
  whatsappMTN: '+256764875008',
  callsAirtel: '+256753322357',
};

// Official Brand Statements
export const SLOGAN = "Baked with love and passion";
export const MISSION = "To provide high-quality baked goods and fast foods crafted with care, consistency, and creativity, while building long-lasting relationships with our customers through trust and satisfaction.";
export const VISION = "To become a trusted and loved bakery brand, known for exceptional taste, quality, and customer care, serving communities with sweet moments every day.";

// Official Brand Logo
export const LOGO_URL = 'https://i.ibb.co/gbbVSYBK/image.jpg';

// Master Baker / Founder Primary Visual (Updated to Logo)
export const CHEF_IMAGE = LOGO_URL; 

export const PRODUCTS: Product[] = [
  // --- FAST FOOD (Price range 30,000 - 50,000 UGX) ---
  {
    id: 'ff1',
    name: 'Morris Signature Burger Platter',
    category: 'Fast Food',
    price: 35000,
    description: 'Double beef patty with melted cheddar, crisp lettuce, and our secret Morris sauce. Served with a side of golden fries.',
    image: 'https://i.ibb.co/sB7Gxq2/image.jpg',
    featured: true,
  },
  {
    id: 'ff2',
    name: 'Family Chicken Feast',
    category: 'Fast Food',
    price: 48000,
    description: '8 pieces of our legendary crispy fried chicken, marinated in local herbs and spices. Perfect for sharing.',
    image: 'https://i.ibb.co/YMMnXvV/image.jpg',
  },
  {
    id: 'ff3',
    name: 'Deluxe Mixed Grill Box',
    category: 'Fast Food',
    price: 42000,
    description: 'A hearty combination of grilled beef strips, chicken wings, and roasted vegetables served with garlic bread.',
    image: 'https://i.ibb.co/6RbZkW9P/image.jpg',
    featured: true,
  },
  {
    id: 'ff4',
    name: 'Supreme Fast Food Bucket',
    category: 'Fast Food',
    price: 50000,
    description: 'The ultimate variety bucket featuring nuggets, wings, samosas, and a large portion of seasoned chips.',
    image: 'https://i.ibb.co/F41QYHvZ/image.jpg',
  },
  {
    id: 'ff5',
    name: 'Crispy Strip & Dip Combo',
    category: 'Fast Food',
    price: 30000,
    description: 'Tender chicken strips with a crunchy golden coating, served with three signature dipping sauces.',
    image: 'https://i.ibb.co/Tqg2zcgy/image.jpg',
  },

  // --- BIG CAKES (Starting from 100,000 UGX) ---
  {
    id: 'bc1',
    name: 'Premium Chocolate Truffle',
    category: 'Cakes',
    price: 100000,
    description: 'Rich, dense chocolate layers with a velvety ganache. A chocolate lover\'s ultimate dream.',
    image: 'https://i.ibb.co/sv1Vjh92/image.jpg',
    featured: true,
  },
  {
    id: 'bc2',
    name: 'Royal White Forest',
    category: 'Cakes',
    price: 120000,
    description: 'Classic white sponge with fresh cream, cherries, and white chocolate shavings.',
    image: 'https://i.ibb.co/wrKCdJZj/image.jpg',
  },
  {
    id: 'bc3',
    name: 'Elegant Red Velvet',
    category: 'Cakes',
    price: 150000,
    description: 'Smooth and vibrant red velvet layers with premium cream cheese frosting.',
    image: 'https://i.ibb.co/RkN6Wjmx/image.jpg',
    featured: true,
  },
  {
    id: 'bc4',
    name: 'Tropical Fruit Extravaganza',
    category: 'Cakes',
    price: 100000,
    description: 'Light sponge topped with the freshest tropical fruits from our local markets.',
    image: 'https://i.ibb.co/4nNBhgdY/image.jpg',
  },
  {
    id: 'bc5',
    name: 'Vanilla Bean Luxury',
    category: 'Cakes',
    price: 100000,
    description: 'A timeless classic made with real vanilla beans and smooth buttercream.',
    image: 'https://i.ibb.co/MD4w2FRy/image.jpg',
  },
  {
    id: 'bc6',
    name: 'Salted Caramel Crunch',
    category: 'Cakes',
    price: 130000,
    description: 'Sweet and salty perfection with crunchy caramel pieces between soft layers.',
    image: 'https://i.ibb.co/xq63G72M/image.jpg',
  },
  {
    id: 'bc7',
    name: 'Morris Special Black Forest',
    category: 'Cakes',
    price: 110000,
    description: 'The standard of excellence. Dark chocolate, whipped cream, and tart cherries.',
    image: 'https://i.ibb.co/7tbrNLHx/image.jpg',
  },
  {
    id: 'bc8',
    name: 'Golden Celebration Sponge',
    category: 'Cakes',
    price: 100000,
    description: 'Moist and buttery sponge cake, perfect for any big celebration.',
    image: 'https://i.ibb.co/5gNTbvs5/image.jpg',
  },
  {
    id: 'bc9',
    name: 'Berry Blush Dream',
    category: 'Cakes',
    price: 140000,
    description: 'A beautiful pink-hued cake with strawberry-infused layers and fresh berries.',
    image: 'https://i.ibb.co/V0vKmY2j/image.jpg',
  },
  {
    id: 'bc10',
    name: 'Luxury Tiered Wedding Cake',
    category: 'Cakes',
    price: 450000,
    description: 'A grand multi-tiered masterpiece designed for your most special day.',
    image: 'https://i.ibb.co/PZR1TYLh/image.jpg',
    featured: true,
  },

  // --- SMALL PRODUCTS & BAKERY ---
  {
    id: 'sm1',
    name: 'Golden Mandazi',
    category: 'Bakery',
    price: 1000,
    description: 'Lightly spiced, fluffy, and fried to golden perfection.',
    image: 'https://i.ibb.co/ynDJ2fKt/image.jpg',
  },
  {
    id: 'sm2',
    name: 'Crispy Beef Samosa',
    category: 'Snacks',
    price: 2000,
    description: 'Thin, crispy pastry filled with savory minced beef.',
    image: 'https://i.ibb.co/ym0tQ83w/image.jpg',
  },
  {
    id: 'sm3',
    name: 'Buttery Chapati',
    category: 'Bakery',
    price: 1000,
    description: 'Soft, layered, and handmade daily.',
    image: 'https://i.ibb.co/2YmtQdfn/image.jpg',
  }
];

export const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1557925923-33b27f891f88?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519340333755-5672c7ec9cf2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&q=80&w=800',
];

export const TESTIMONIALS = [
  {
    name: "Sarah Namayanja",
    role: "Regular Customer",
    content: "The best cakes in Kampala! Their quality never fails and the service is excellent. I ordered my wedding cake here and it was perfect.",
    rating: 5
  },
  {
    name: "John Musoke",
    role: "Business Owner",
    content: "Our office orders Rolex and Chapati every Friday. Always fresh, timely, and the flavors are authentic. Morris is simply the best.",
    rating: 5
  },
  {
    name: "Grace Atim",
    role: "Event Planner",
    content: "I always recommend Morris Cakes for corporate events. Professional, high quality, and their presentation is top-tier.",
    rating: 5
  }
];
