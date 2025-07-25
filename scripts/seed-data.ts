#!/usr/bin/env tsx

import { db } from '../server/db';
import { users, categories, listings, listingImages } from '../shared/schema';
import { config } from '../server/config';
import { Logger } from '../server/logging/Logger';
// Note: bcrypt import removed as passwords will be handled by authentication system

// Seed data interface
interface SeedData {
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role?: 'user' | 'admin' | 'moderator';
  }>;
  categories: Array<{
    slug: string;
    name: string;
    nameAm: string;
    description?: string;
    descriptionAm?: string;
    parentId?: number;
  }>;
  listings: Array<{
    title: string;
    titleAm: string;
    description: string;
    descriptionAm: string;
    price: number;
    currency: string;
    categoryId: number;
    userId: string;
    location: string;
    locationAm: string;
    contactPhone?: string;
    contactEmail?: string;
    status: 'active' | 'inactive' | 'sold';
    images?: string[];
  }>;
}

// Bilingual seed data
const seedData: SeedData = {
  users: [
    {
      id: 'admin-001',
      email: 'admin@ethiomarket.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
    {
      id: 'mod-001',
      email: 'moderator@ethiomarket.com',
      firstName: 'Moderator',
      lastName: 'User',
      role: 'moderator',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator',
    },
    {
      id: 'user-001',
      email: 'abebe@example.com',
      firstName: 'Abebe',
      lastName: 'Kebede',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=abebe',
    },
    {
      id: 'user-002',
      email: 'almaz@example.com',
      firstName: 'Almaz',
      lastName: 'Tadesse',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=almaz',
    },
    {
      id: 'user-003',
      email: 'dawit@example.com',
      firstName: 'Dawit',
      lastName: 'Haile',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dawit',
    },
    {
      id: 'user-004',
      email: 'hanan@example.com',
      firstName: 'Hanan',
      lastName: 'Ahmed',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hanan',
    },
    {
      id: 'user-005',
      email: 'meseret@example.com',
      firstName: 'Meseret',
      lastName: 'Girma',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meseret',
    },
  ],
  
  categories: [
    // Electronics
    {
      slug: 'electronics',
      name: 'Electronics',
      nameAm: 'ኤሌክትሮኒክስ',
      description: 'Electronic devices and gadgets',
      descriptionAm: 'የኤሌክትሮኒክስ መሳሪያዎች እና ማሽኖች',
    },
    {
      slug: 'smartphones',
      name: 'Smartphones',
      nameAm: 'ስማርት ስልኮች',
      description: 'Mobile phones and smartphones',
      descriptionAm: 'ሞባይል ስልኮች እና ስማርት ስልኮች',
      parentId: 1,
    },
    {
      slug: 'laptops',
      name: 'Laptops & Computers',
      nameAm: 'ላፕቶፖች እና ኮምፒዩተሮች',
      description: 'Laptops, desktops and computer accessories',
      descriptionAm: 'ላፕቶፖች፣ ዴስክቶፖች እና የኮምፒዩተር መለዋወጫዎች',
      parentId: 1,
    },
    
    // Vehicles
    {
      slug: 'vehicles',
      name: 'Vehicles',
      nameAm: 'ተሽከርካሪዎች',
      description: 'Cars, motorcycles and other vehicles',
      descriptionAm: 'መኪናዎች፣ ሞተርሳይክሎች እና ሌሎች ተሽከርካሪዎች',
    },
    {
      slug: 'cars',
      name: 'Cars',
      nameAm: 'መኪናዎች',
      description: 'New and used cars',
      descriptionAm: 'አዲስ እና ያገለገሉ መኪናዎች',
      parentId: 4,
    },
    {
      slug: 'motorcycles',
      name: 'Motorcycles',
      nameAm: 'ሞተርሳይክሎች',
      description: 'Motorcycles and scooters',
      descriptionAm: 'ሞተርሳይክሎች እና ስኩተሮች',
      parentId: 4,
    },
    
    // Real Estate
    {
      slug: 'real-estate',
      name: 'Real Estate',
      nameAm: 'ሪል እስቴት',
      description: 'Properties for sale and rent',
      descriptionAm: 'ለሽያጭ እና ለኪራይ የሚውሉ ቤቶች',
    },
    {
      slug: 'apartments',
      name: 'Apartments',
      nameAm: 'አፓርትመንቶች',
      description: 'Apartments for sale and rent',
      descriptionAm: 'ለሽያጭ እና ለኪራይ የሚውሉ አፓርትመንቶች',
      parentId: 7,
    },
    {
      slug: 'houses',
      name: 'Houses',
      nameAm: 'ቤቶች',
      description: 'Houses and villas',
      descriptionAm: 'ቤቶች እና ቪላዎች',
      parentId: 7,
    },
    
    // Fashion
    {
      slug: 'fashion',
      name: 'Fashion & Clothing',
      nameAm: 'ፋሽን እና አልባሳት',
      description: 'Clothing, shoes and accessories',
      descriptionAm: 'አልባሳት፣ ጫማዎች እና መለዋወጫዎች',
    },
    {
      slug: 'mens-clothing',
      name: "Men's Clothing",
      nameAm: 'የወንዶች አልባሳት',
      description: 'Clothing for men',
      descriptionAm: 'የወንዶች አልባሳት',
      parentId: 10,
    },
    {
      slug: 'womens-clothing',
      name: "Women's Clothing",
      nameAm: 'የሴቶች አልባሳት',
      description: 'Clothing for women',
      descriptionAm: 'የሴቶች አልባሳት',
      parentId: 10,
    },
    
    // Home & Garden
    {
      slug: 'home-garden',
      name: 'Home & Garden',
      nameAm: 'ቤት እና አትክልት',
      description: 'Furniture, appliances and garden items',
      descriptionAm: 'የቤት እቃዎች፣ የኤሌክትሪክ መሳሪያዎች እና የአትክልት እቃዎች',
    },
    {
      slug: 'furniture',
      name: 'Furniture',
      nameAm: 'የቤት እቃዎች',
      description: 'Home and office furniture',
      descriptionAm: 'የቤት እና የቢሮ እቃዎች',
      parentId: 13,
    },
    
    // Services
    {
      slug: 'services',
      name: 'Services',
      nameAm: 'አገልግሎቶች',
      description: 'Professional and personal services',
      descriptionAm: 'ሙያዊ እና ግላዊ አገልግሎቶች',
    },
  ],
  
  listings: [
    // Electronics
    {
      title: 'iPhone 14 Pro Max - Excellent Condition',
      titleAm: 'አይፎን 14 ፕሮ ማክስ - በጥሩ ሁኔታ',
      description: 'iPhone 14 Pro Max 256GB in excellent condition. Comes with original box, charger, and protective case. Battery health 95%. No scratches or damages.',
      descriptionAm: 'አይፎን 14 ፕሮ ማክስ 256GB በጥሩ ሁኔታ። ከዋናው ሳጥን፣ ቻርጀር እና መጠበቂያ ከመሸፈኛ ጋር። የባትሪ ጤንነት 95%። ምንም ጉዳት የለም።',
      price: 45000,
      currency: 'ETB',
      categoryId: 2,
      userId: 'user-001',
      location: 'Addis Ababa, Bole',
      locationAm: 'አዲስ አበባ፣ ቦሌ',
      contactPhone: '+251911123456',
      contactEmail: 'abebe@example.com',
      status: 'active',
      images: ['iPhone.svg', 'iphone-14-pro-max-1.jpg', 'iphone-14-pro-max-2.jpg'],
    },
    {
      title: 'Gaming Laptop - ASUS ROG Strix',
      titleAm: 'ጌሚንግ ላፕቶፕ - አሱስ ሮግ ስትሪክስ',
      description: 'ASUS ROG Strix G15 Gaming Laptop. Intel i7-12700H, RTX 3070, 16GB RAM, 1TB SSD. Perfect for gaming and professional work. Used for 6 months only.',
      descriptionAm: 'አሱስ ሮግ ስትሪክስ G15 ጌሚንግ ላፕቶፕ። Intel i7-12700H, RTX 3070, 16GB RAM, 1TB SSD። ለጌም እና ለሙያዊ ስራ ምቹ። ለ6 ወር ብቻ ጥቅም ላይ ውሏል።',
      price: 85000,
      currency: 'ETB',
      categoryId: 3,
      userId: 'user-002',
      location: 'Addis Ababa, Kazanchis',
      locationAm: 'አዲስ አበባ፣ ካዛንቺስ',
      contactPhone: '+251922234567',
      status: 'active',
      images: ['gaming-laptop-1.jpg'],
    },
    
    // Vehicles
    {
      title: '2019 Toyota Camry - Low Mileage',
      titleAm: '2019 ቶዮታ ካምሪ - ትንሽ ኪሎሜትር',
      description: '2019 Toyota Camry in excellent condition. 45,000 km mileage. Regular maintenance, all documents available. Automatic transmission, leather seats.',
      descriptionAm: '2019 ቶዮታ ካምሪ በጥሩ ሁኔታ። 45,000 ኪሎሜትር። መደበኛ እንክብካቤ፣ ሁሉም ሰነዶች አሉ። ራስ-ተለዋዋጭ ማስተላለፊያ፣ የቆዳ መቀመጫዎች።',
      price: 1200000,
      currency: 'ETB',
      categoryId: 5,
      userId: 'user-003',
      location: 'Addis Ababa, Megenagna',
      locationAm: 'አዲስ አበባ፣ መገናኛ',
      contactPhone: '+251933345678',
      status: 'active',
      images: ['camry-2019-1.jpg', 'camry-2019-2.jpg', 'camry-2019-3.jpg'],
    },
    {
      title: 'Honda CB250R Motorcycle - 2021',
      titleAm: 'ሆንዳ CB250R ሞተርሳይክል - 2021',
      description: '2021 Honda CB250R in pristine condition. Only 8,000 km. Perfect for city commuting. All papers in order, ready for transfer.',
      descriptionAm: '2021 ሆንዳ CB250R በጥሩ ሁኔታ። 8,000 ኪሎሜትር ብቻ። ለከተማ ጉዞ ምቹ። ሁሉም ወረቀቶች በትክክል፣ ለማስተላለፍ ዝግጁ።',
      price: 180000,
      currency: 'ETB',
      categoryId: 6,
      userId: 'user-004',
      location: 'Addis Ababa, Piassa',
      locationAm: 'አዲስ አበባ፣ ፒያሳ',
      contactPhone: '+251944456789',
      status: 'active',
      images: ['motorcycle-honda-1.jpg'],
    },
    
    // Real Estate
    {
      title: '2 Bedroom Apartment for Rent - CMC',
      titleAm: '2 መኝታ ቤት ለኪራይ - ሲኤምሲ',
      description: 'Modern 2 bedroom apartment in CMC area. Fully furnished, 2 bathrooms, parking space. Near to shops and public transport. Available immediately.',
      descriptionAm: 'በሲኤምሲ አካባቢ ዘመናዊ 2 መኝታ ቤት። ሙሉ በሙሉ የተዘጋጀ፣ 2 መታጠቢያ ቤት፣ የመኪና ማቆሚያ። ከሱቆች እና የህዝብ ማመላለሻ አጠገብ። ወዲያውኑ ይገኛል።',
      price: 15000,
      currency: 'ETB',
      categoryId: 8,
      userId: 'user-005',
      location: 'Addis Ababa, CMC',
      locationAm: 'አዲስ አበባ፣ ሲኤምሲ',
      contactPhone: '+251955567890',
      status: 'active',
      images: ['apartment-cmc-1.jpg', 'apartment-cmc-2.jpg'],
    },
    {
      title: '4 Bedroom Villa for Sale - Bole Atlas',
      titleAm: '4 መኝታ ቤት ለሽያጭ - ቦሌ አትላስ',
      description: 'Luxurious 4 bedroom villa in Bole Atlas. 350 sqm, modern design, garden, garage for 2 cars. Prime location with easy access to Bole Airport.',
      descriptionAm: 'በቦሌ አትላስ ቪላ 4 መኝታ ቤት። 350 ካሬ ሜትር፣ ዘመናዊ ዲዛይን፣ አትክልት፣ ለ2 መኪናዎች ጋራዥ። ከቦሌ አየር ማረፊያ ቅርብ።',
      price: 25000000,
      currency: 'ETB',
      categoryId: 9,
      userId: 'user-001',
      location: 'Addis Ababa, Bole Atlas',
      locationAm: 'አዲስ አበባ፣ ቦሌ አትላስ',
      contactPhone: '+251911123456',
      status: 'active',
      images: ['villa-bole-1.jpg', 'villa-bole-2.jpg', 'villa-bole-3.jpg'],
    },
    
    // Fashion
    {
      title: "Traditional Ethiopian Dress - Habesha Kemis",
      titleAm: 'ባህላዊ የኢትዮጵያ ልብስ - ሀበሻ ቀሚስ',
      description: 'Beautiful traditional Ethiopian dress (Habesha Kemis) made from high-quality cotton. Hand-woven with intricate patterns. Size M, never worn.',
      descriptionAm: 'ከከፍተኛ ጥራት ያለው ጥጥ የተሰራ የባህል ሀበሻ ቀሚስ። በእጅ የተሸመነ ውብ ንድፍ። ሳይዝ M፣ በፍፁም አልተለበሰም።',
      price: 3500,
      currency: 'ETB',
      categoryId: 12,
      userId: 'user-002',
      location: 'Addis Ababa, Merkato',
      locationAm: 'አዲስ አበባ፣ መርካቶ',
      contactPhone: '+251922234567',
      status: 'active',
      images: ['traditional_dress.svg', 'habesha-kemis-1.jpg'],
    },
    
    // Home & Garden
    {
      title: 'Modern Sofa Set - 3+2+1',
      titleAm: 'ዘመናዊ ሶፋ ስብስብ - 3+2+1',
      description: 'Modern 3+2+1 sofa set in excellent condition. Grey fabric, comfortable cushions. Used for only 1 year. Selling due to relocation.',
      descriptionAm: 'ዘመናዊ 3+2+1 ሶፋ ስብስብ በጥሩ ሁኔታ። ግራጫ ጨርቅ፣ ምቹ ትራሶች። ለ1 ዓመት ብቻ ጥቅም ላይ ውሏል። በመፈናቀል ምክንያት ይሸጣል።',
      price: 45000,
      currency: 'ETB',
      categoryId: 14,
      userId: 'user-003',
      location: 'Addis Ababa, 22 Mazoria',
      locationAm: 'አዲስ አበባ፣ 22 ማዞሪያ',
      contactPhone: '+251933345678',
      status: 'active',
      images: ['sofa.svg', 'sofa-set-1.jpg'],
    },
    
    // Services
    {
      title: 'Professional Web Development Services',
      titleAm: 'ሙያዊ የድረ-ገጽ ልማት አገልግሎት',
      description: 'Full-stack web development services. Modern websites, e-commerce platforms, mobile apps. 5+ years experience. Portfolio available upon request.',
      descriptionAm: 'ሙሉ ክትትል የድረ-ገጽ ልማት አገልግሎት። ዘመናዊ ድረ-ገጾች፣ የኢ-ኮሜርስ መድረኮች፣ ሞባይል መተግበሪያዎች። ከ5 ዓመት በላይ ልምድ።',
      price: 50000,
      currency: 'ETB',
      categoryId: 15,
      userId: 'user-004',
      location: 'Addis Ababa, Gerji',
      locationAm: 'አዲስ አበባ፣ ገርጂ',
      contactPhone: '+251944456789',
      contactEmail: 'hanan@example.com',
      status: 'active',
      images: ['webDevelopment.svg'],
    },
    
    // Additional comprehensive listings for all categories
    
    // More Electronics
    {
      title: 'Dell Inspiron 15 Laptop - Great for Work',
      titleAm: 'ደል ኢንስፒሮን 15 ላፕቶፕ - ለስራ ምቹ',
      description: 'Dell Inspiron 15 laptop with Intel Core i5, 8GB RAM, 256GB SSD. Perfect condition, barely used. Ideal for office work, study, and light gaming.',
      descriptionAm: 'ደል ኢንስፒሮን 15 ላፕቶፕ ከኢንቴል ኮር i5፣ 8GB RAM፣ 256GB SSD ጋር። በጥሩ ሁኔታ፣ ትንሽ ጥቅም ላይ ውሏል። ለቢሮ ስራ፣ ለትምህርት እና ለቀላል ጌም ምቹ።',
      price: 45000,
      currency: 'ETB',
      categoryId: 3,
      userId: 'user-003',
      location: 'Addis Ababa, Sarbet',
      locationAm: 'አዲስ አበባ፣ ሳርቤት',
      contactPhone: '+251933456789',
      status: 'active',
      images: ['laptop-dell-1.svg', 'computer-desk-1.jpg'],
    },
    
    {
      title: 'Samsung Galaxy A54 - Unlocked',
      titleAm: 'ሳምሱንግ ጋላክሲ A54 - የተከፈተ',
      description: 'Samsung Galaxy A54 5G smartphone, 128GB storage. Excellent camera quality, long battery life. Phone is unlocked and ready to use with any carrier.',
      descriptionAm: 'ሳምሱንግ ጋላክሲ A54 5G ስማርት ፎን፣ 128GB ማከማቻ። ምርጥ የካሜራ ጥራት፣ ረጅም የባትሪ ዕድሜ። ፎኑ የተከፈተ ሲሆን ከማንኛውም አቅራቢ ጋር ለመጠቀም ዝግጁ ነው።',
      price: 25000,
      currency: 'ETB',
      categoryId: 2,
      userId: 'user-004',
      location: 'Addis Ababa, Mexico',
      locationAm: 'አዲስ አበባ፣ ሜክሲኮ',
      contactPhone: '+251944567890',
      status: 'active',
      images: ['smartphone-samsung-1.svg'],
    },
    
    // More Vehicles
    {
      title: 'Toyota Corolla 2020 - Low Mileage',
      titleAm: 'ቶዮታ ኮሮላ 2020 - ትንሽ ኪሎሜትር',
      description: '2020 Toyota Corolla with only 25,000km. Automatic transmission, fuel efficient, well maintained. All service records available.',
      descriptionAm: '2020 ቶዮታ ኮሮላ 25,000 ኪሎሜትር ብቻ። ራስ-ተለዋዋጭ ማስተላለፊያ፣ ነዳጅ ቆጣቢ፣ በደንብ የተጠበቀ። ሁሉም የአገልግሎት ዝርዝሮች አሉ።',
      price: 950000,
      currency: 'ETB',
      categoryId: 5,
      userId: 'user-005',
      location: 'Addis Ababa, Ayat',
      locationAm: 'አዲስ አበባ፣ አያት',
      contactPhone: '+251955678901',
      status: 'active',
      images: ['toyota-corolla-1.svg'],
    },
    
    {
      title: 'Yamaha MT-07 2022 - Excellent Condition',
      titleAm: 'ያማሃ ኤምቲ-07 2022 - በጥሩ ሁኔታ',
      description: '2022 Yamaha MT-07, 5,000km only. Perfect for city rides and weekend adventures. Comes with helmet and maintenance kit.',
      descriptionAm: '2022 ያማሃ ኤምቲ-07፣ 5,000 ኪሎሜትር ብቻ። ለከተማ ጉዞ እና ለሳምንት መጨረሻ ጀብዱ ምቹ። ከቀረሳ እና የእንክብካቤ ስብስብ ጋር ይመጣል።',
      price: 220000,
      currency: 'ETB',
      categoryId: 6,
      userId: 'user-001',
      location: 'Addis Ababa, Gullele',
      locationAm: 'አዲስ አበባ፣ ጉለሌ',
      contactPhone: '+251911234567',
      status: 'active',
      images: ['motorcycle-yamaha-1.svg'],
    },
    
    // More Real Estate
    {
      title: 'Modern Condominium - 1 Bedroom',
      titleAm: 'ዘመናዊ ኮንዶሚኒየም - 1 መኝታ ቤት',
      description: 'Brand new 1 bedroom condominium in prime location. Modern fixtures, parking space, 24/7 security. Move-in ready.',
      descriptionAm: 'በጥሩ ቦታ ላይ ብራንድ አዲስ 1 መኝታ ቤት ኮንዶሚኒየም። ዘመናዊ መጠገኛዎች፣ የመኪና ማቆሚያ፣ 24/7 ደህንነት። ለመግባት ዝግጁ።',
      price: 12000,
      currency: 'ETB',
      categoryId: 8,
      userId: 'user-002',
      location: 'Addis Ababa, Summit',
      locationAm: 'አዲስ አበባ፣ ሰሚት',
      contactPhone: '+251922345678',
      status: 'active',
      images: ['condo-addis-1.svg'],
    },
    
    {
      title: '3 Bedroom House for Sale - Bole',
      titleAm: '3 መኝታ ቤት ለሽያጭ - ቦሌ',
      description: 'Beautiful 3 bedroom house in Bole area. 250 sqm, garden, garage. Close to international school and shopping centers.',
      descriptionAm: 'በቦሌ አካባቢ ውብ 3 መኝታ ቤት። 250 ካሬ ሜትር፣ አትክልት፣ ጋራዥ። ከአለም አቀፍ ትምህርት ቤት እና የገዢዎች ማዕከላት ቅርብ።',
      price: 18000000,
      currency: 'ETB',
      categoryId: 9,
      userId: 'user-003',
      location: 'Addis Ababa, Bole',
      locationAm: 'አዲስ አበባ፣ ቦሌ',
      contactPhone: '+251933456789',
      status: 'active',
      images: ['house-bole-1.svg'],
    },
    
    // Fashion & Clothing
    {
      title: 'Cotton Dress Shirt - Size L',
      titleAm: 'የጥጥ ቀሚስ ሸሚዝ - ሳይዝ L',
      description: 'High-quality cotton dress shirt, perfect for business meetings. Size L, barely worn, excellent condition.',
      descriptionAm: 'ከፍተኛ ጥራት ያለው የጥጥ ቀሚስ ሸሚዝ፣ ለንግድ ስብሰባዎች ምቹ። ሳይዝ L፣ ትንሽ የተለበሰ፣ በጥሩ ሁኔታ።',
      price: 1200,
      currency: 'ETB',
      categoryId: 11,
      userId: 'user-004',
      location: 'Addis Ababa, Arat Kilo',
      locationAm: 'አዲስ አበባ፣ አራት ኪሎ',
      contactPhone: '+251944567890',
      status: 'active',
      images: ['mens-shirt-1.svg'],
    },
    
    {
      title: 'Elegant Evening Dress - Size M',
      titleAm: 'የምሽት ቀሚስ - ሳይዝ M',
      description: 'Beautiful evening dress perfect for special occasions. Size M, worn only once. Dry cleaned and ready to wear.',
      descriptionAm: 'ለልዩ አጋጣሚዎች ምቹ ውብ የምሽት ቀሚስ። ሳይዝ M፣ አንድ ጊዜ ብቻ የተለበሰ። በደረቅ ተጠቅሎ ለመልበስ ዝግጁ።',
      price: 2500,
      currency: 'ETB',
      categoryId: 12,
      userId: 'user-005',
      location: 'Addis Ababa, Lebu',
      locationAm: 'አዲስ አበባ፣ ለቡ',
      contactPhone: '+251955678901',
      status: 'active',
      images: ['womens-dress-1.svg'],
    },
    
    // Services
    {
      title: 'Professional House Cleaning Service',
      titleAm: 'ሙያዊ የቤት ጽዳት አገልግሎት',
      description: 'Reliable and thorough house cleaning service. Weekly, bi-weekly, or monthly options. All cleaning supplies provided. Insured and bonded team.',
      descriptionAm: 'አስተማማኝ እና ጠለቅ ያለ የቤት ጽዳት አገልግሎት። ሳምንታዊ፣ ሁለት ሳምንታዊ ወይም ወርሃዊ አማራጮች። ሁሉም የጽዳት አቅርቦቶች ተሰጥተዋል።',
      price: 800,
      currency: 'ETB',
      categoryId: 15,
      userId: 'user-001',
      location: 'Addis Ababa, Various Locations',
      locationAm: 'አዲስ አበባ፣ የተለያዩ ቦታዎች',
      contactPhone: '+251911234567',
      status: 'active',
      images: ['cleaning-service-1.svg'],
    },
    
    {
      title: 'Expert Plumbing Services - 24/7 Available',
      titleAm: 'ባለሙያ የቧንቧ አገልግሎት - 24/7 የሚገኝ',
      description: 'Professional plumbing services for homes and offices. Emergency repairs, installations, maintenance. Licensed plumber with 10+ years experience.',
      descriptionAm: 'ለቤቶች እና ቢሮዎች ሙያዊ የቧንቧ አገልግሎቶች። የአስቸኳይ ጊዜ ጥገናዎች፣ መጫኛዎች፣ እንክብካቤ। ከ10+ ዓመት ልምድ ጋር ፍቃድ ያለው የቧንቧ ባለሙያ።',
      price: 1200,
      currency: 'ETB',
      categoryId: 15,
      userId: 'user-002',
      location: 'Addis Ababa, All Areas',
      locationAm: 'አዲስ አበባ፣ ሁሉም አካባቢዎች',
      contactPhone: '+251922345678',
      status: 'active',
      images: ['plumbing-service-1.svg'],
    },
  ],
};

// Main seeding function
async function seedDatabase(): Promise<void> {
  try {
    Logger.info('Starting database seeding process');
    
    // Clear existing data (optional - be careful in production)
    if (config.isDevelopment) {
      Logger.info('Clearing existing data (development mode)');
      await db.delete(listingImages);
      await db.delete(listings);
      await db.delete(categories);
      await db.delete(users);
    }
    
    // Seed users
    Logger.info('Seeding users...');
    
    const insertedUsers = await db.insert(users).values(
      seedData.users.map(user => ({
        ...user,
        // Note: In real implementation, you'd want different passwords
        // This is just for seeding development data
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ).returning();
    
    Logger.info(`Seeded ${insertedUsers.length} users`);
    
    // Seed categories
    Logger.info('Seeding categories...');
    const insertedCategories = await db.insert(categories).values(
      seedData.categories.map(category => ({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ).returning();
    
    Logger.info(`Seeded ${insertedCategories.length} categories`);
    
    // Seed listings
    Logger.info('Seeding listings...');
    
    // Get category mappings from database (since they have auto-generated IDs)
    const seededCategories = await db.select().from(categories);
    const categoryMap = new Map<string, number>();
    seededCategories.forEach(cat => {
      categoryMap.set(cat.slug, cat.id);
    });

    const insertedListings = await db.insert(listings).values(
      seedData.listings.map(listing => {
        const { images, ...listingData } = listing;
        
        // Map old category IDs to new ones based on category content
        let correctCategoryId = listingData.categoryId;
        
        // Map based on the original seeding order
        const categoryIdMapping: Record<number, string> = {
          2: 'smartphones',     // Smartphones 
          3: 'laptops',         // Laptops & Computers
          5: 'cars',            // Cars
          6: 'motorcycles',     // Motorcycles  
          8: 'apartments',      // Apartments
          9: 'houses',          // Houses
          11: 'mens-clothing',  // Men's Clothing
          12: 'womens-clothing', // Women's Clothing
          14: 'home-garden',    // Home & Garden
          15: 'services',       // Services
        };
        
        const targetSlug = categoryIdMapping[listingData.categoryId];
        if (targetSlug && categoryMap.has(targetSlug)) {
          correctCategoryId = categoryMap.get(targetSlug)!;
        }
        
        return {
          ...listingData,
          categoryId: correctCategoryId,
          price: listingData.price.toString(), // Convert to string as required by schema
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + config.business.listingExpiryDays * 24 * 60 * 60 * 1000),
        };
      })
    ).returning();
    
    Logger.info(`Seeded ${insertedListings.length} listings`);
    
    // Seed listing images
    Logger.info('Seeding listing images...');
    const imageInserts = [];
    
    for (let i = 0; i < seedData.listings.length; i++) {
      const listing = seedData.listings[i];
      const insertedListing = insertedListings[i];
      
      if (listing.images) {
        for (let j = 0; j < listing.images.length; j++) {
          imageInserts.push({
            listingId: insertedListing.id,
            imageUrl: `/uploads/listings/${listing.images[j]}`,
            altText: `${listing.title} - Image ${j + 1}`,
            altTextAm: `${listing.titleAm} - ምስል ${j + 1}`,
            displayOrder: j,
            createdAt: new Date(),
          });
        }
      }
    }
    
    if (imageInserts.length > 0) {
      await db.insert(listingImages).values(imageInserts as any);
      Logger.info(`Seeded ${imageInserts.length} listing images`);
    }
    
    // Log completion
    Logger.info('Database seeding completed successfully', {
      users: insertedUsers.length,
      categories: insertedCategories.length,
      listings: insertedListings.length,
      images: imageInserts.length,
    });
    
    // Log feature status for reference
    const enabledFeatures = Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature);
    
    Logger.info('Current feature configuration', {
      environment: config.nodeEnv,
      enabledFeatures,
      defaultLanguage: config.localization.defaultLanguage,
      supportedLanguages: config.localization.supportedLanguages,
    });
    
  } catch (error) {
    Logger.error('Database seeding failed', { error });
    throw error;
  }
}

// Run seeding if called directly  
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      Logger.info('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      Logger.error('Seeding process failed', { error });
      process.exit(1);
    });
}

export { seedDatabase, seedData };