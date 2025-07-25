#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

// Create additional realistic demo images for all categories
const demoImages = {
  // Electronics category demo images
  'laptop-dell-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1F2937;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F3F4F6"/>
      <rect x="50" y="120" width="500" height="280" rx="15" fill="url(#laptopGrad)"/>
      <rect x="70" y="140" width="460" height="240" rx="8" fill="#000"/>
      <circle cx="300" cy="380" r="8" fill="#6B7280"/>
      <rect x="250" y="120" width="100" height="8" rx="4" fill="#9CA3AF"/>
      <text x="300" y="50" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Dell Inspiron 15</text>
      <text x="300" y="80" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="16">Core i5 • 8GB RAM • 256GB SSD</text>
    </svg>
  `,

  'smartphone-samsung-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F8FAFC"/>
      <rect x="200" y="60" width="200" height="320" rx="25" fill="url(#phoneGrad)"/>
      <rect x="220" y="100" width="160" height="240" rx="15" fill="#000"/>
      <circle cx="300" cy="360" r="12" fill="#E5E7EB"/>
      <rect x="280" y="70" width="40" height="8" rx="4" fill="#E5E7EB"/>
      <text x="300" y="40" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Samsung Galaxy S23</text>
    </svg>
  `,

  // Vehicles category demo images
  'toyota-corolla-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="corollaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#DC2626;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#E5E7EB"/>
      <path d="M80 200 L520 200 L500 170 L480 150 L120 150 L100 170 Z" fill="url(#corollaGrad)"/>
      <rect x="120" y="150" width="360" height="50" rx="10" fill="#B91C1C"/>
      <circle cx="150" r="40" cy="235" fill="#1F2937"/>
      <circle cx="450" r="40" cy="235" fill="#1F2937"/>
      <circle cx="150" r="25" cy="235" fill="#6B7280"/>
      <circle cx="450" r="25" cy="235" fill="#6B7280"/>
      <rect x="140" y="160" width="50" height="30" rx="5" fill="#3B82F6" opacity="0.8"/>
      <rect x="200" y="160" width="50" height="30" rx="5" fill="#3B82F6" opacity="0.8"/>
      <rect x="270" y="160" width="50" height="30" rx="5" fill="#3B82F6" opacity="0.8"/>
      <rect x="340" y="160" width="50" height="30" rx="5" fill="#3B82F6" opacity="0.8"/>
      <text x="300" y="320" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Toyota Corolla 2020</text>
    </svg>
  `,

  'motorcycle-yamaha-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C2D12;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A3501C;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F3F4F6"/>
      <rect x="200" y="180" width="200" height="60" rx="15" fill="url(#bikeGrad)"/>
      <circle cx="150" r="35" cy="270" fill="#1F2937"/>
      <circle cx="450" r="35" cy="270" fill="#1F2937"/>
      <circle cx="150" r="20" cy="270" fill="#6B7280"/>
      <circle cx="450" r="20" cy="270" fill="#6B7280"/>
      <path d="M150 270 L300 200 L450 270" stroke="#374151" stroke-width="8" fill="none"/>
      <rect x="280" y="160" width="40" height="20" rx="5" fill="#DC2626"/>
      <text x="300" y="350" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Yamaha MT-07</text>
    </svg>
  `,

  // Real Estate demo images
  'condo-addis-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="condoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#E5E7EB"/>
      <rect x="100" y="80" width="400" height="280" fill="url(#condoGrad)"/>
      <rect x="130" y="110" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="200" y="110" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="270" y="110" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="340" y="110" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="410" y="110" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="130" y="200" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="200" y="200" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="270" y="200" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="340" y="200" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="410" y="200" width="50" height="70" fill="#3B82F6" opacity="0.8"/>
      <rect x="270" y="320" width="60" height="40" fill="#8B5CF6"/>
      <text x="300" y="50" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Modern Condominium</text>
    </svg>
  `,

  'house-bole-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="houseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5B21B6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#E5E7EB"/>
      <path d="M300 60 L480 180 L480 340 L120 340 L120 180 Z" fill="url(#houseGrad)"/>
      <rect x="150" y="200" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="240" y="200" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="330" y="200" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="420" y="200" width="40" height="80" fill="#8B5CF6"/>
      <rect x="260" y="300" width="80" height="40" fill="#A855F7"/>
      <text x="300" y="380" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="20" font-weight="bold">3BR House - Bole</text>
    </svg>
  `,

  // Fashion demo images
  'mens-shirt-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F9FAFB"/>
      <path d="M200 80 L400 80 L420 110 L420 340 L180 340 L180 110 Z" fill="url(#shirtGrad)"/>
      <path d="M220 100 L380 100 L390 130 L210 130 Z" fill="#1E3A8A"/>
      <rect x="285" y="80" width="30" height="20" rx="5" fill="#E5E7EB"/>
      <circle cx="250" r="4" cy="150" fill="#FCD34D"/>
      <circle cx="250" r="4" cy="170" fill="#FCD34D"/>
      <circle cx="250" r="4" cy="190" fill="#FCD34D"/>
      <circle cx="250" r="4" cy="210" fill="#FCD34D"/>
      <text x="300" y="370" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Cotton Dress Shirt</text>
    </svg>
  `,

  'womens-dress-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#BE185D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#FDF2F8"/>
      <path d="M220 80 L380 80 L420 120 L420 350 L180 350 L180 120 Z" fill="url(#dressGrad)"/>
      <path d="M240 100 L360 100 L370 130 L230 130 Z" fill="#BE185D"/>
      <rect x="285" y="80" width="30" height="15" rx="5" fill="#FCD34D"/>
      <path d="M200 200 L400 200" stroke="#FCD34D" stroke-width="3"/>
      <circle cx="210" r="8" cy="160" fill="#FCD34D"/>
      <circle cx="390" r="8" cy="160" fill="#FCD34D"/>
      <text x="300" y="380" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Evening Dress</text>
    </svg>
  `,

  // Services demo images
  'cleaning-service-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cleanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F0FDF4"/>
      <circle cx="300" cy="200" r="120" fill="url(#cleanGrad)"/>
      <rect x="280" y="120" width="40" height="160" rx="5" fill="#065F46"/>
      <ellipse cx="300" cy="100" rx="30" ry="20" fill="#6B7280"/>
      <path d="M250 180 L350 180" stroke="#FCD34D" stroke-width="4"/>
      <path d="M260 200 L340 200" stroke="#FCD34D" stroke-width="4"/>
      <path d="M270 220 L330 220" stroke="#FCD34D" stroke-width="4"/>
      <text x="300" y="350" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Professional Cleaning</text>
    </svg>
  `,

  'plumbing-service-1.svg': `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="plumbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D97706;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#FFFBEB"/>
      <rect x="200" y="150" width="200" height="100" rx="15" fill="url(#plumbGrad)"/>
      <rect x="220" y="120" width="20" height="80" rx="10" fill="#92400E"/>
      <rect x="360" y="120" width="20" height="80" rx="10" fill="#92400E"/>
      <circle cx="300" cy="200" r="25" fill="#92400E"/>
      <rect x="290" y="180" width="20" height="40" rx="3" fill="#FCD34D"/>
      <path d="M250 280 L350 280" stroke="#3B82F6" stroke-width="8"/>
      <path d="M250 300 L350 300" stroke="#3B82F6" stroke-width="6"/>
      <text x="300" y="350" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Plumbing Services</text>
    </svg>
  `,
};

async function createDemoImages(): Promise<void> {
  console.log('Creating additional demo images for all categories...');
  
  const listingsDir = path.join(process.cwd(), 'uploads', 'listings');
  
  if (!fs.existsSync(listingsDir)) {
    fs.mkdirSync(listingsDir, { recursive: true });
  }
  
  // Create demo images
  for (const [filename, svg] of Object.entries(demoImages)) {
    const filepath = path.join(listingsDir, filename);
    fs.writeFileSync(filepath, svg.trim());
    console.log(`Created demo image: ${filename}`);
  }
  
  console.log('All demo images created successfully!');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createDemoImages().catch(console.error);
}

export { createDemoImages };