
import { Product, ContactInfo } from './types';

export const CONTACT_INFO: ContactInfo = {
  email: 'morisejakait2@gmail.com',
  whatsappMTN: '+256764875008',
  callsAirtel: '+256753322357',
};

// Official Brand Logo
export const LOGO_URL = 'https://i.ibb.co/gbbVSYBK/image.jpg';

// Helper to generate direct image links from ImgBB IDs
const getImg = (id: string) => `https://i.ibb.co/${id}/image.jpg`;

// Master Baker / Founder Primary Visual
export const CHEF_IMAGE = LOGO_URL; 

export const PRODUCTS: Product[] = [
  // --- PREMIUM CAKES (ADJUSTED PRICES) ---
  {
    id: 'n1',
    name: 'Grand Celebration Tiered Cake',
    category: 'Cakes',
    price: 210000, // Reduced from 250,000
    description: 'A magnificent multi-tiered masterpiece for weddings and grand milestones.',
    image: getImg('HfTd3ktB'),
    featured: true,
  },
  {
    id: 'n2',
    name: 'Tropical Fruit Cream Delight',
    category: 'Cakes',
    price: 125000, // Reduced from 145,000
    description: 'Light sponge layered with fresh tropical fruit extracts and whipped cream.',
    image: getImg('mCRhBSNP'),
  },
  {
    id: 'n3',
    name: 'Midnight Cocoa Forest Cake',
    category: 'Cakes',
    price: 155000, // Reduced from 170,000
    description: 'Rich dark chocolate layers with a signature berry compote filling.',
    image: getImg('4g4sLGs4'),
    featured: true,
  },
  {
    id: 'c1',
    name: 'Royal Ribbon Celebration',
    category: 'Cakes',
    price: 165000, // Reduced from 185,000
    description: 'A masterpiece of sponge and silk buttercream, perfect for weddings and milestones.',
    image: getImg('ycpzsCKH'),
  },
  {
    id: 'c2',
    name: 'Vanilla Pearl Gateau',
    category: 'Cakes',
    price: 130000, // Reduced from 150,000
    description: 'Classic Ugandan vanilla bean cake with delicate pearl frosting accents.',
    image: getImg('xqcnPKbk'),
  },
  {
    id: 'c3',
    name: 'Red Velvet Heart',
    category: 'Cakes',
    price: 145000, // Reduced from 165,000
    description: 'Deep cocoa velvet layers with our signature cream cheese whip.',
    image: getImg('VcDmhKj9'),
  },

  // --- SNACKS & BAKERY (ADJUSTED PRICES) ---
  {
    id: 'n4',
    name: 'Golden Crust Savory Platter',
    category: 'Snacks',
    price: 45000, // Reduced from 55,000
    description: 'A bulk selection of our famous meat pies and samosas, perfect for meetings.',
    image: getImg('tw2Myr5m'),
  },
  {
    id: 'n5',
    name: 'Rustic Heritage Brown Bread',
    category: 'Bakery',
    price: 10000, // Reduced from 15,000
    description: 'Hearty, fiber-rich artisan brown bread baked with traditional methods.',
    image: getImg('dsyp6NDm'),
  },

  // --- LOCAL DELIGHTS (ADJUSTED PRICES) ---
  {
    id: 'l1',
    name: 'Morris Special Rolex',
    category: 'Local Delights',
    price: 3500, // Reduced from 4,500
    description: 'Three fresh eggs, onions, tomatoes, and greens rolled in a buttery chapati.',
    image: getImg('nq2Qf2ft'),
    featured: true,
  },
  {
    id: 'l2',
    name: 'Kikomando King Platter',
    category: 'Local Delights',
    price: 4500, // Reduced from 5,500
    description: 'A generous serving of spiced beans and sliced layered chapatis.',
    image: getImg('MkgMCg7Y'),
  },

  // --- FAST FOOD & CHICKEN (ADJUSTED PRICES) ---
  {
    id: 'f2',
    name: 'The Morris Beast Burger',
    category: 'Fast Food',
    price: 18000, // Reduced from 22,000
    description: 'Juicy beef patty, melted cheddar, and caramelized onions on a brioche bun.',
    image: getImg('v4Q37j1j'),
  },
  {
    id: 'ch1',
    name: 'Roasted Herb Whole Chicken',
    category: 'Chicken',
    price: 32000, // Reduced from 40,000
    description: 'Full chicken marinated for 24 hours in local herbs and slow-roasted.',
    image: getImg('kgTQ86B2'),
    featured: true,
  }
];

export const GALLERY_IMAGES = [
  getImg('rGJR025Q'),
  getImg('HL0Q1FQZ'),
  getImg('Y4Wx0ZqG'),
  getImg('wFFS2CdK'),
  getImg('FbdRrLd4'),
  getImg('fVKZ1KpK'),
  getImg('zT1PzzSY'),
];

export const TESTIMONIALS = [
  {
    name: "Sarah Namayanja",
    role: "Regular Customer",
    content: "The best cakes in Kampala! Their quality never fails and the service is excellent.",
    rating: 5
  },
  {
    name: "John Musoke",
    role: "Business Owner",
    content: "Our office orders Rolex and Chapati every Friday. Always fresh and timely.",
    rating: 5
  }
];
