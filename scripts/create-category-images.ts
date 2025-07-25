#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

// Category image templates as SVG strings
const categoryImages = {
  electronics: `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="electronicsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#electronicsGrad)"/>
      <rect x="50" y="50" width="300" height="200" rx="20" fill="#1F2937" opacity="0.8"/>
      <rect x="80" y="80" width="240" height="140" rx="10" fill="#374151"/>
      <circle cx="200" cy="240" r="15" fill="#6B7280"/>
      <text x="200" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Electronics</text>
    </svg>
  `,

  vehicles: `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vehiclesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DC2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#991B1B;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#vehiclesGrad)"/>
      <path d="M80 150 L320 150 L300 120 L100 120 Z" fill="#1F2937" opacity="0.8"/>
      <rect x="90" y="120" width="220" height="50" rx="10" fill="#374151"/>
      <circle cx="120" r="25" cy="175" fill="#1F2937"/>
      <circle cx="280" r="25" cy="175" fill="#1F2937"/>
      <circle cx="120" r="15" cy="175" fill="#6B7280"/>
      <circle cx="280" r="15" cy="175" fill="#6B7280"/>
      <text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Vehicles</text>
    </svg>
  `,

  'real-estate': `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="realEstateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#065F46;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#realEstateGrad)"/>
      <path d="M200 50 L350 150 L350 220 L50 220 L50 150 Z" fill="#1F2937" opacity="0.8"/>
      <rect x="80" y="170" width="30" height="50" fill="#8B5CF6"/>
      <rect x="130" y="160" width="40" height="25" fill="#3B82F6"/>
      <rect x="190" y="160" width="40" height="25" fill="#3B82F6"/>
      <rect x="250" y="160" width="40" height="25" fill="#3B82F6"/>
      <rect x="310" y="170" width="30" height="50" fill="#8B5CF6"/>
      <text x="200" y="270" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Real Estate</text>
    </svg>
  `,

  fashion: `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fashionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#BE185D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#fashionGrad)"/>
      <path d="M150 60 L250 60 L280 90 L280 220 L120 220 L120 90 Z" fill="#1F2937" opacity="0.8"/>
      <path d="M180 60 L220 60 L220 50 L180 50 Z" fill="#374151"/>
      <circle cx="160" r="8" cy="100" fill="#F59E0B"/>
      <circle cx="160" r="8" cy="130" fill="#F59E0B"/>
      <circle cx="160" r="8" cy="160" fill="#F59E0B"/>
      <text x="200" y="270" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Fashion & Clothing</text>
    </svg>
  `,

  'home-garden': `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5B21B6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#homeGrad)"/>
      <rect x="80" y="120" width="160" height="100" rx="10" fill="#1F2937" opacity="0.8"/>
      <rect x="100" y="140" width="40" height="20" fill="#8B5CF6"/>
      <rect x="160" y="140" width="40" height="20" fill="#8B5CF6"/>
      <rect x="130" y="180" width="20" height="40" fill="#A855F7"/>
      <ellipse cx="320" cy="200" rx="30" ry="20" fill="#10B981"/>
      <rect x="310" y="190" width="5" height="30" fill="#059669"/>
      <text x="200" y="270" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Home & Garden</text>
    </svg>
  `,

  services: `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="servicesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D97706;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#servicesGrad)"/>
      <circle cx="200" cy="150" r="80" fill="#1F2937" opacity="0.8"/>
      <path d="M200 100 L220 130 L190 130 L210 160 L170 130 L200 100" fill="#FCD34D"/>
      <circle cx="160" cy="120" r="15" fill="#374151"/>
      <circle cx="240" cy="120" r="15" fill="#374151"/>
      <circle cx="160" cy="180" r="15" fill="#374151"/>
      <circle cx="240" cy="180" r="15" fill="#374151"/>
      <text x="200" y="270" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Services</text>
    </svg>
  `,

  jobs: `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jobsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#jobsGrad)"/>
      <rect x="120" y="120" width="160" height="100" rx="10" fill="#374151" opacity="0.8"/>
      <rect x="180" y="100" width="40" height="20" rx="5" fill="#6B7280"/>
      <rect x="140" y="140" width="120" height="10" fill="#9CA3AF"/>
      <rect x="140" y="160" width="80" height="8" fill="#6B7280"/>
      <rect x="140" y="180" width="100" height="8" fill="#6B7280"/>
      <text x="200" y="270" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Jobs</text>
    </svg>
  `,

  smartphones: `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#phoneGrad)"/>
      <rect x="160" y="60" width="80" height="140" rx="12" fill="#1F2937" opacity="0.9"/>
      <rect x="170" y="80" width="60" height="100" rx="5" fill="#374151"/>
      <circle cx="200" cy="210" r="8" fill="#6B7280"/>
      <text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Smartphones</text>
    </svg>
  `,

  'airline-tickets': `
    <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="airlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0284C7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#airlineGrad)"/>
      <path d="M200 80 L280 120 L350 110 L280 140 L200 100 L120 140 L50 110 L120 120 Z" fill="#1F2937" opacity="0.8"/>
      <circle cx="200" cy="150" r="5" fill="#FCD34D"/>
      <path d="M50 200 L350 200" stroke="#FCD34D" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Airline Tickets</text>
    </svg>
  `
};

// Service images for listing examples
const serviceImages = {
  webDevelopment: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="webDevGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#webDevGrad)"/>
      <rect x="50" y="50" width="500" height="300" rx="15" fill="#1F2937" opacity="0.9"/>
      <rect x="70" y="70" width="460" height="40" rx="5" fill="#374151"/>
      <circle cx="90" cy="90" r="8" fill="#EF4444"/>
      <circle cx="110" cy="90" r="8" fill="#F59E0B"/>
      <circle cx="130" cy="90" r="8" fill="#10B981"/>
      <rect x="70" y="130" width="200" height="150" rx="8" fill="#4B5563"/>
      <rect x="290" y="130" width="240" height="60" rx="5" fill="#6B7280"/>
      <rect x="290" y="210" width="240" height="70" rx="5" fill="#6B7280"/>
      <text x="300" y="375" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Professional Web Development</text>
    </svg>
  `,

  tutoring: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tutorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#tutorGrad)"/>
      <rect x="100" y="80" width="400" height="250" rx="15" fill="#1F2937" opacity="0.9"/>
      <rect x="130" y="110" width="340" height="180" rx="8" fill="#374151"/>
      <path d="M200 150 L400 150" stroke="#10B981" stroke-width="3"/>
      <path d="M200 180 L350 180" stroke="#6B7280" stroke-width="2"/>
      <path d="M200 200 L380 200" stroke="#6B7280" stroke-width="2"/>
      <circle cx="450" cy="200" r="30" fill="#10B981"/>
      <path d="M440 190 L450 200 L465 185" stroke="white" stroke-width="3" fill="none"/>
      <text x="300" y="370" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Private Tutoring Services</text>
    </svg>
  `,

  photography: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="photoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#photoGrad)"/>
      <rect x="150" y="120" width="300" height="200" rx="20" fill="#1F2937" opacity="0.9"/>
      <rect x="180" y="150" width="240" height="140" rx="10" fill="#374151"/>
      <circle cx="300" cy="220" r="40" fill="#6B7280"/>
      <circle cx="300" cy="220" r="25" fill="#374151"/>
      <rect x="350" y="140" width="20" height="20" rx="3" fill="#8B5CF6"/>
      <text x="300" y="360" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Professional Photography</text>
    </svg>
  `
};

// Product images for listing examples  
const productImages = {
  iPhone: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iphoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F3F4F6"/>
      <rect x="200" y="50" width="200" height="300" rx="25" fill="url(#iphoneGrad)"/>
      <rect x="220" y="80" width="160" height="240" rx="15" fill="#000"/>
      <circle cx="300" cy="340" r="15" fill="#374151"/>
      <rect x="280" y="60" width="40" height="8" rx="4" fill="#6B7280"/>
      <text x="300" y="380" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">iPhone 14 Pro Max</text>
    </svg>
  `,

  car: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DC2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#991B1B;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#E5E7EB"/>
      <path d="M100 250 L500 250 L480 200 L450 180 L150 180 L120 200 Z" fill="url(#carGrad)"/>
      <rect x="140" y="180" width="320" height="50" rx="10" fill="#7F1D1D"/>
      <circle cx="180" r="35" cy="285" fill="#1F2937"/>
      <circle cx="420" r="35" cy="285" fill="#1F2937"/>
      <circle cx="180" r="20" cy="285" fill="#6B7280"/>
      <circle cx="420" r="20" cy="285" fill="#6B7280"/>
      <rect x="180" y="190" width="60" height="40" rx="5" fill="#3B82F6" opacity="0.8"/>
      <rect x="260" y="190" width="60" height="40" rx="5" fill="#3B82F6" opacity="0.8"/>
      <rect x="340" y="190" width="60" height="40" rx="5" fill="#3B82F6" opacity="0.8"/>
      <text x="300" y="350" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Toyota Camry 2019</text>
    </svg>
  `,

  apartment: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="aptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#E5E7EB"/>
      <rect x="100" y="100" width="400" height="250" fill="url(#aptGrad)"/>
      <rect x="130" y="130" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="210" y="130" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="290" y="130" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="370" y="130" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="130" y="230" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="210" y="230" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="290" y="230" width="60" height="80" fill="#3B82F6" opacity="0.8"/>
      <rect x="370" y="280" width="60" height="30" fill="#8B5CF6"/>
      <text x="300" y="380" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Modern Apartment</text>
    </svg>
  `,

  traditional_dress: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#DC2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#991B1B;stop-opacity:1" />
        </linearGradient>
        <pattern id="traditional" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#FCD34D"/>
          <circle cx="10" cy="10" r="3" fill="#DC2626"/>
        </pattern>
      </defs>
      <rect width="600" height="400" fill="#F9FAFB"/>
      <path d="M200 80 L400 80 L420 120 L420 320 L180 320 L180 120 Z" fill="url(#dressGrad)"/>
      <path d="M220 100 L380 100 L390 140 L210 140 Z" fill="url(#traditional)"/>
      <rect x="285" y="80" width="30" height="20" rx="5" fill="#FCD34D"/>
      <circle cx="240" r="5" cy="160" fill="#FCD34D"/>
      <circle cx="260" r="5" cy="160" fill="#FCD34D"/>
      <circle cx="280" r="5" cy="160" fill="#FCD34D"/>
      <circle cx="320" r="5" cy="160" fill="#FCD34D"/>
      <circle cx="340" r="5" cy="160" fill="#FCD34D"/>
      <circle cx="360" r="5" cy="160" fill="#FCD34D"/>
      <text x="300" y="370" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Traditional Habesha Kemis</text>
    </svg>
  `,

  sofa: `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sofaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6B7280;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#F3F4F6"/>
      <rect x="80" y="150" width="440" height="160" rx="20" fill="url(#sofaGrad)"/>
      <rect x="100" y="130" width="50" height="100" rx="15" fill="#4B5563"/>
      <rect x="450" y="130" width="50" height="100" rx="15" fill="#4B5563"/>
      <rect x="120" y="170" width="80" height="80" rx="10" fill="#9CA3AF"/>
      <rect x="220" y="170" width="80" height="80" rx="10" fill="#9CA3AF"/>
      <rect x="320" y="170" width="80" height="80" rx="10" fill="#9CA3AF"/>
      <rect x="420" y="170" width="80" height="80" rx="10" fill="#9CA3AF"/>
      <rect x="80" y="290" width="50" height="20" rx="10" fill="#1F2937"/>
      <rect x="470" y="290" width="50" height="20" rx="10" fill="#1F2937"/>
      <text x="300" y="360" text-anchor="middle" fill="#1F2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Modern Sofa Set</text>
    </svg>
  `
};

async function createImages(): Promise<void> {
  console.log('Creating category and listing images...');
  
  // Ensure directories exist
  const categoriesDir = path.join(process.cwd(), 'uploads', 'categories');
  const listingsDir = path.join(process.cwd(), 'uploads', 'listings');
  
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }
  
  if (!fs.existsSync(listingsDir)) {
    fs.mkdirSync(listingsDir, { recursive: true });
  }
  
  // Create category images
  for (const [category, svg] of Object.entries(categoryImages)) {
    const filename = `${category}.svg`;
    const filepath = path.join(categoriesDir, filename);
    fs.writeFileSync(filepath, svg.trim());
    console.log(`Created category image: ${filename}`);
  }
  
  // Create service images
  for (const [service, svg] of Object.entries(serviceImages)) {
    const filename = `${service}.svg`;
    const filepath = path.join(listingsDir, filename);
    fs.writeFileSync(filepath, svg.trim());
    console.log(`Created service image: ${filename}`);
  }
  
  // Create product images
  for (const [product, svg] of Object.entries(productImages)) {
    const filename = `${product}.svg`;
    const filepath = path.join(listingsDir, filename);
    fs.writeFileSync(filepath, svg.trim());
    console.log(`Created product image: ${filename}`);
  }
  
  console.log('All images created successfully!');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createImages().catch(console.error);
}

export { createImages };