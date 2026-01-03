
export type Category = 'All' | 'Cakes' | 'Bakery' | 'Snacks' | 'Fast Food' | 'Chicken' | 'Pizza' | 'Local Delights';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ContactInfo {
  email: string;
  whatsappMTN: string;
  callsAirtel: string;
}
