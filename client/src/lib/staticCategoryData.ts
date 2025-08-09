import { Car, Truck, Bike, Plane, Home, Briefcase, Smartphone, Laptop, Shirt, Package, Building, MapPin } from 'lucide-react';

export interface CategoryData {
  name: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  subcategories: {
    name: string;
    count: number;
    icon: any;
  }[];
  featuredListings: {
    id: number;
    title: string;
    price: string;
    location: string;
    image: string;
    category: string;
  }[];
  sellSection: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
}

export const STATIC_CATEGORY_DATA: Record<string, CategoryData> = {
  vehicles: {
    name: 'Cars & Vehicles',
    description: 'Find your perfect vehicle in Ethiopia',
    heroTitle: 'Find your perfect vehicle',
    heroSubtitle: 'Browse thousands of cars, trucks, and motorcycles from trusted sellers',
    subcategories: [
      { name: 'Cars', count: 51384, icon: Car },
      { name: 'Vans', count: 7786, icon: Truck },
      { name: 'Trailers', count: 7400, icon: Truck },
      { name: 'Car parts', count: 35764, icon: Package },
      { name: 'Motorhomes', count: 3191, icon: Truck },
      { name: 'Caravans', count: 3170, icon: Truck },
      { name: 'Caravan parts', count: 1642, icon: Package },
      { name: 'Rental car', count: 892, icon: Car },
    ],
    featuredListings: [
      { id: 1, title: 'Toyota Corolla 2020', price: '2,500,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Cars' },
      { id: 2, title: 'Honda Civic 2019', price: '2,200,000 ETB', location: 'Dire Dawa', image: '/api/placeholder/300/200', category: 'Cars' },
      { id: 3, title: 'Isuzu Pickup 2018', price: '1,800,000 ETB', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Trucks' },
      { id: 4, title: 'Bajaj Motorcycle', price: '180,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Motorcycles' },
      { id: 5, title: 'Car Audio System', price: '25,000 ETB', location: 'Hawassa', image: '/api/placeholder/300/200', category: 'Car Parts' },
      { id: 6, title: 'Mercedes-Benz C-Class', price: '4,500,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Cars' },
    ],
    sellSection: {
      title: 'Sell your vehicle',
      subtitle: 'Get the best price for your car, truck, or motorcycle',
      buttonText: 'Create Vehicle Ad'
    }
  },
  
  electronics: {
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    heroTitle: 'Find the latest electronics',
    heroSubtitle: 'Smartphones, laptops, TVs, and more from top brands',
    subcategories: [
      { name: 'Smartphones', count: 15420, icon: Smartphone },
      { name: 'Laptops', count: 8930, icon: Laptop },
      { name: 'TVs & Audio', count: 6540, icon: Package },
      { name: 'Cameras', count: 3210, icon: Package },
      { name: 'Gaming', count: 2890, icon: Package },
      { name: 'Tablets', count: 2450, icon: Smartphone },
      { name: 'Accessories', count: 9870, icon: Package },
      { name: 'Home Electronics', count: 4320, icon: Package },
    ],
    featuredListings: [
      { id: 1, title: 'iPhone 13 Pro Max', price: '95,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Smartphones' },
      { id: 2, title: 'MacBook Pro M2', price: '180,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Laptops' },
      { id: 3, title: 'Samsung 65" Smart TV', price: '75,000 ETB', location: 'Dire Dawa', image: '/api/placeholder/300/200', category: 'TVs' },
      { id: 4, title: 'Canon DSLR Camera', price: '45,000 ETB', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Cameras' },
      { id: 5, title: 'PlayStation 5', price: '55,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Gaming' },
      { id: 6, title: 'AirPods Pro', price: '12,000 ETB', location: 'Hawassa', image: '/api/placeholder/300/200', category: 'Accessories' },
    ],
    sellSection: {
      title: 'Sell your electronics',
      subtitle: 'Turn your old gadgets into cash quickly and safely',
      buttonText: 'Create Electronics Ad'
    }
  },

  jobs: {
    name: 'Jobs',
    description: 'Find your dream job in Ethiopia',
    heroTitle: 'Find your next opportunity',
    heroSubtitle: 'Discover thousands of job openings across Ethiopia',
    subcategories: [
      { name: 'Full-time', count: 12450, icon: Briefcase },
      { name: 'Part-time', count: 6780, icon: Briefcase },
      { name: 'Remote Work', count: 3420, icon: Briefcase },
      { name: 'Internships', count: 2890, icon: Briefcase },
      { name: 'Engineering', count: 4560, icon: Briefcase },
      { name: 'Healthcare', count: 3210, icon: Briefcase },
      { name: 'Education', count: 5670, icon: Briefcase },
      { name: 'Sales & Marketing', count: 4320, icon: Briefcase },
    ],
    featuredListings: [
      { id: 1, title: 'Software Developer', price: '25,000 ETB/month', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Engineering' },
      { id: 2, title: 'Marketing Manager', price: '35,000 ETB/month', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Marketing' },
      { id: 3, title: 'Nurse', price: '18,000 ETB/month', location: 'Dire Dawa', image: '/api/placeholder/300/200', category: 'Healthcare' },
      { id: 4, title: 'Teacher', price: '15,000 ETB/month', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Education' },
      { id: 5, title: 'Accountant', price: '22,000 ETB/month', location: 'Hawassa', image: '/api/placeholder/300/200', category: 'Finance' },
      { id: 6, title: 'Sales Representative', price: '20,000 ETB/month', location: 'Mekelle', image: '/api/placeholder/300/200', category: 'Sales' },
    ],
    sellSection: {
      title: 'Post a job',
      subtitle: 'Find the perfect candidate for your company',
      buttonText: 'Post Job Opening'
    }
  },

  'real-estate': {
    name: 'Real Estate',
    description: 'Buy, sell, or rent properties in Ethiopia',
    heroTitle: 'Find your perfect home',
    heroSubtitle: 'Houses, apartments, and commercial properties across Ethiopia',
    subcategories: [
      { name: 'Houses for Sale', count: 8920, icon: Home },
      { name: 'Apartments for Sale', count: 12340, icon: Building },
      { name: 'Houses for Rent', count: 15670, icon: Home },
      { name: 'Apartments for Rent', count: 23450, icon: Building },
      { name: 'Commercial', count: 4320, icon: Building },
      { name: 'Land', count: 6780, icon: MapPin },
      { name: 'Vacation Rentals', count: 1890, icon: Home },
      { name: 'New Projects', count: 2340, icon: Building },
    ],
    featuredListings: [
      { id: 1, title: '3BR Villa in Bole', price: '25,000,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Houses' },
      { id: 2, title: '2BR Apartment', price: '8,500,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Apartments' },
      { id: 3, title: 'Office Space for Rent', price: '45,000 ETB/month', location: 'Dire Dawa', image: '/api/placeholder/300/200', category: 'Commercial' },
      { id: 4, title: 'Land for Sale', price: '5,000,000 ETB', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Land' },
      { id: 5, title: 'Studio Apartment', price: '12,000 ETB/month', location: 'Hawassa', image: '/api/placeholder/300/200', category: 'Rent' },
      { id: 6, title: 'Luxury Condo', price: '45,000,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Apartments' },
    ],
    sellSection: {
      title: 'List your property',
      subtitle: 'Reach thousands of potential buyers and renters',
      buttonText: 'Create Property Listing'
    }
  },

  fashion: {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    heroTitle: 'Discover fashion trends',
    heroSubtitle: 'Shop clothing, shoes, and accessories from top brands',
    subcategories: [
      { name: "Men's Clothing", count: 9840, icon: Shirt },
      { name: "Women's Clothing", count: 15670, icon: Shirt },
      { name: 'Shoes', count: 7230, icon: Package },
      { name: 'Bags & Accessories', count: 5460, icon: Package },
      { name: "Children's Clothing", count: 4320, icon: Shirt },
      { name: 'Jewelry', count: 3210, icon: Package },
      { name: 'Watches', count: 2890, icon: Package },
      { name: 'Traditional Wear', count: 6540, icon: Shirt },
    ],
    featuredListings: [
      { id: 1, title: 'Designer Suit', price: '8,500 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Mens Clothing' },
      { id: 2, title: 'Evening Dress', price: '4,200 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Womens Clothing' },
      { id: 3, title: 'Nike Sneakers', price: '3,500 ETB', location: 'Dire Dawa', image: '/api/placeholder/300/200', category: 'Shoes' },
      { id: 4, title: 'Leather Handbag', price: '2,800 ETB', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Accessories' },
      { id: 5, title: 'Gold Necklace', price: '15,000 ETB', location: 'Hawassa', image: '/api/placeholder/300/200', category: 'Jewelry' },
      { id: 6, title: 'Traditional Habesha Dress', price: '6,500 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Traditional' },
    ],
    sellSection: {
      title: 'Sell fashion items',
      subtitle: 'Turn your closet into cash with great fashion finds',
      buttonText: 'Create Fashion Ad'
    }
  },

  travel: {
    name: 'Travel',
    description: 'Plan your perfect trip',
    heroTitle: 'Explore Ethiopia and beyond',
    heroSubtitle: 'Find flights, hotels, and travel packages',
    subcategories: [
      { name: 'Domestic Flights', count: 2340, icon: Plane },
      { name: 'International Flights', count: 4560, icon: Plane },
      { name: 'Hotels', count: 3210, icon: Building },
      { name: 'Car Rentals', count: 1890, icon: Car },
      { name: 'Travel Packages', count: 1450, icon: Package },
      { name: 'Tours & Activities', count: 2670, icon: MapPin },
      { name: 'Travel Insurance', count: 890, icon: Package },
      { name: 'Travel Gear', count: 1230, icon: Package },
    ],
    featuredListings: [
      { id: 1, title: 'Addis Ababa to Dubai', price: '18,500 ETB', location: 'Ethiopian Airlines', image: '/api/placeholder/300/200', category: 'Flights' },
      { id: 2, title: 'Luxury Hotel Stay', price: '4,500 ETB/night', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Hotels' },
      { id: 3, title: 'Danakil Depression Tour', price: '25,000 ETB', location: 'Afar Region', image: '/api/placeholder/300/200', category: 'Tours' },
      { id: 4, title: 'Car Rental - Toyota', price: '1,200 ETB/day', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Car Rental' },
      { id: 5, title: 'Simien Mountains Trek', price: '15,000 ETB', location: 'Gondar', image: '/api/placeholder/300/200', category: 'Adventure' },
      { id: 6, title: 'Lake Tana Boat Trip', price: '2,800 ETB', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Tours' },
    ],
    sellSection: {
      title: 'Offer travel services',
      subtitle: 'Connect with travelers and grow your tourism business',
      buttonText: 'Create Travel Listing'
    }
  },

  services: {
    name: 'Services',
    description: 'Professional and personal services',
    heroTitle: 'Find professional services',
    heroSubtitle: 'Connect with skilled professionals for all your needs',
    subcategories: [
      { name: 'Home Services', count: 6780, icon: Package },
      { name: 'Professional Services', count: 5430, icon: Briefcase },
      { name: 'Education & Training', count: 4320, icon: Package },
      { name: 'Health & Beauty', count: 3210, icon: Package },
      { name: 'Event Services', count: 2890, icon: Package },
      { name: 'Automotive Services', count: 4560, icon: Package },
      { name: 'IT Services', count: 3670, icon: Package },
      { name: 'Legal Services', count: 1230, icon: Package },
    ],
    featuredListings: [
      { id: 1, title: 'House Cleaning Service', price: '500 ETB/hour', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Home Services' },
      { id: 2, title: 'Web Development', price: '15,000 ETB', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'IT Services' },
      { id: 3, title: 'Wedding Photography', price: '25,000 ETB', location: 'Dire Dawa', image: '/api/placeholder/300/200', category: 'Event Services' },
      { id: 4, title: 'English Tutoring', price: '200 ETB/hour', location: 'Bahir Dar', image: '/api/placeholder/300/200', category: 'Education' },
      { id: 5, title: 'Car Repair Service', price: '1,500 ETB', location: 'Hawassa', image: '/api/placeholder/300/200', category: 'Automotive' },
      { id: 6, title: 'Legal Consultation', price: '800 ETB/hour', location: 'Addis Ababa', image: '/api/placeholder/300/200', category: 'Legal' },
    ],
    sellSection: {
      title: 'Offer your services',
      subtitle: 'Connect with clients who need your expertise',
      buttonText: 'Create Service Listing'
    }
  }
};

export function getStaticCategoryData(slug: string): CategoryData | null {
  return STATIC_CATEGORY_DATA[slug] || null;
}