# EthioMarket - Ethiopian Classified Ads Platform

A modern, standalone frontend marketplace application designed specifically for the Ethiopian market, featuring FINN.no-style design, comprehensive category navigation, and responsive mobile-first architecture.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- No backend dependencies required

### Installation & Setup
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run start
```

## 📋 Table of Contents

1. [Features](#features)
2. [User Manual](#user-manual)
3. [Technical Documentation](#technical-documentation)
4. [Project Structure](#project-structure)
5. [Development Guide](#development-guide)
6. [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Marketplace Features
- **📱 Responsive Design**: Mobile-first approach with full tablet and desktop support
- **🌍 Ethiopian Market Focus**: Localized categories, pricing in ETB, and regional preferences
- **🏪 FINN.no-Style Layout**: Clean, organized marketplace design with intuitive navigation
- **🔍 Advanced Search & Filtering**: Category-based search with price ranges, location, and condition filters
- **📂 12 Main Categories**: Electronics, Vehicles, Property, Fashion, Home & Garden, Sports, Animals, Business, Parents & Children, and more

### User Experience
- **🎨 Modern UI/UX**: Built with shadcn/ui and Tailwind CSS for consistent, beautiful design
- **⚡ Fast Performance**: Vite-powered with hot module replacement for instant updates
- **🌐 Multilingual Ready**: Infrastructure for English/Amharic support
- **📊 Category Statistics**: View listing counts and subcategory breakdown
- **🗂️ Hierarchical Navigation**: Multi-level category and subcategory browsing

### Technical Features
- **🔄 Standalone Operation**: No backend dependencies required - runs purely on frontend
- **📱 PWA Ready**: Progressive Web App capabilities for mobile installation
- **♿ Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **🔒 Type Safety**: Full TypeScript implementation with strict type checking

## 📖 User Manual

### Navigation Guide

#### 1. Landing Page
- **Hero Section**: Featured marketplace overview with call-to-action
- **Categories Grid**: Quick access to all 12 main categories
- **Market Stats**: Overview of available listings and categories
- **Navigation**: Header with marketplace link and search functionality

#### 2. Marketplace Overview (`/marketplace`)
- **Category Cards**: Visual grid of all main categories with icons and descriptions
- **Quick Stats**: Number of subcategories and sample listings per category
- **Search Bar**: Global search across all categories
- **Responsive Layout**: Adapts from 1 column (mobile) to 4 columns (desktop)

#### 3. Category Pages (`/marketplace/[category]`)
- **Subcategory Grid**: All subcategories within the selected category
- **Breadcrumb Navigation**: Easy navigation back to marketplace
- **Category Description**: Overview of what's available in this category
- **Filter Sidebar**: Category-specific filters and sorting options

#### 4. Subcategory Pages (`/marketplace/[category]/[subcategory]`)
- **Listing Grid**: All items in the selected subcategory
- **Advanced Filters**: Price range, location, condition, brand filters
- **Sort Options**: Price, date, popularity sorting
- **Empty State**: Helpful message when no listings are available

### Available Categories

1. **Electronics** - Phones, computers, tablets, accessories
2. **Vehicles** - Cars, motorcycles, spare parts
3. **Property** - Houses, apartments, land, commercial
4. **Fashion** - Clothing, shoes, accessories, jewelry
5. **Home & Garden** - Furniture, appliances, plants, tools
6. **Sports & Outdoor** - Equipment, gear, bikes, fitness
7. **Animals & Equipment** - Pets, livestock, supplies
8. **Business & Activities** - Services, equipment, opportunities
9. **Parents & Children** - Baby items, toys, education
10. **Health & Beauty** - Cosmetics, healthcare, wellness
11. **Food & Dining** - Restaurants, catering, ingredients
12. **Services** - Professional services, repairs, consulting

### Search & Filtering

#### Filter Options
- **Price Range**: ETB 0 - 1,000,000+ with slider control
- **Location**: Ethiopian cities (Addis Ababa, Dire Dawa, Bahir Dar, etc.)
- **Condition**: New, Like New, Good, Fair
- **Category-Specific**: Brand filters, technical specifications

#### Search Functionality
- **Global Search**: Available from any page via header search bar
- **Category Search**: Filtered search within specific categories
- **Auto-suggestions**: Real-time suggestions as you type
- **Search Results**: Organized by relevance with filter options

## 🏗️ Technical Documentation

### Architecture Overview

```
EthioMarket (Standalone Frontend)
├── React 18 + TypeScript
├── Vite Build System
├── Tailwind CSS + shadcn/ui
├── Wouter Router
├── React Query (mocked for standalone)
└── Static Data Layer
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React | 18.x | UI library with hooks and context |
| **Language** | TypeScript | 5.x | Type safety and developer experience |
| **Build Tool** | Vite | 5.x | Fast development and optimized builds |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable components |
| **Routing** | Wouter | 3.x | Lightweight client-side routing |
| **State Management** | React Context | Built-in | Global state for theme, language |
| **Form Handling** | React Hook Form | 7.x | Performant forms with validation |
| **Validation** | Zod | 3.x | TypeScript-first schema validation |
| **Icons** | Lucide React | Latest | Modern icon library |

### Key Components

#### Layout Components
- **Layout**: Main wrapper with header, main content, and footer
- **Header**: Navigation bar with search and category links
- **Footer**: Company information and links
- **Sidebar**: Filter and navigation sidebar for category pages

#### Page Components
- **LandingPage**: Welcome page with hero section and category overview
- **Marketplace**: Main marketplace with all categories
- **MarketplaceCategory**: Individual category page with subcategories
- **MarketplaceSubcategory**: Subcategory page with listings and filters

#### Shared Components
- **CategoryFilters**: Reusable filter sidebar for all category pages
- **ListingGrid**: Responsive grid layout for displaying listings
- **BreadcrumbNavigation**: Hierarchical navigation breadcrumbs
- **SearchHero**: Hero section with search functionality

### Data Structure

#### Category System
```typescript
interface Category {
  id: string;
  name: string;
  nameAm?: string;        // Amharic translation
  icon: LucideIcon;       // Icon component
  description: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  nameAm?: string;
  description: string;
  parentId: string;
}
```

#### Listing System (Static/Mocked)
```typescript
interface Listing {
  id: string;
  title: string;
  price: number;
  currency: 'ETB' | 'USD';
  location: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  categoryId: string;
  subcategoryId: string;
  images: string[];
  description: string;
  createdAt: Date;
}
```

### Configuration

#### Environment Variables
```env
# Development
VITE_APP_NAME=EthioMarket
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_LANGUAGE=en

# API Configuration (mocked in standalone mode)
VITE_API_URL=http://localhost:5001/api
```

#### Vite Configuration
- **Port**: 5173 (development), 5000 (preview)
- **Host**: 0.0.0.0 for external access
- **Aliases**: @ for src, @assets for attached_assets
- **Build Output**: dist/ directory

## 📁 Project Structure

```
ethiomarket/
├── client/                          # Main application directory
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── shared/            # Shared application components
│   │   │   ├── BreadcrumbNavigation.tsx
│   │   │   ├── CategoryFilters.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ListingGrid.tsx
│   │   ├── pages/                 # Page components
│   │   │   ├── LandingPage.tsx    # Welcome page
│   │   │   ├── Marketplace.tsx    # Main marketplace
│   │   │   ├── MarketplaceCategory.tsx
│   │   │   ├── MarketplaceSubcategory.tsx
│   │   │   └── Home.tsx           # Alternative home page
│   │   ├── contexts/              # React contexts
│   │   │   ├── LanguageContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── FeatureContext.tsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/                   # Utilities and configurations
│   │   │   ├── categories.ts      # Category data and definitions
│   │   │   ├── utils.ts           # Utility functions
│   │   │   ├── queryClient.ts     # React Query configuration
│   │   │   └── i18n.ts            # Internationalization
│   │   ├── types/                 # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx                # Main application component
│   │   ├── main.tsx               # Application entry point
│   │   └── index.css              # Global styles and Tailwind imports
│   ├── public/                    # Static assets
│   ├── package.json               # Dependencies and scripts
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.ts         # Tailwind configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── components.json            # shadcn/ui configuration
├── attached_assets/               # Project assets and images
├── shared/                        # Shared utilities (legacy)
├── replit.md                      # Project documentation
└── README.md                      # This file
```

## 🛠️ Development Guide

### Getting Started

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd ethiomarket
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

3. **Code Structure**
   - Follow React functional component patterns
   - Use TypeScript for all new code
   - Implement responsive design with Tailwind CSS
   - Use shadcn/ui components for consistency

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Start development server with HMR |
| **Build** | `npm run build` | Create production build |
| **Preview** | `npm run start` | Preview production build locally |
| **Type Check** | `npm run check` | Run TypeScript type checking |

### Component Development

#### Creating New Components
```typescript
// components/NewComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps {
  className?: string;
  children: React.ReactNode;
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={cn("default-styles", className)}>
      {children}
    </div>
  );
};
```

#### Adding New Pages
1. Create component in `client/src/pages/`
2. Add route to `client/src/App.tsx`
3. Update navigation in relevant components

#### Styling Guidelines
- Use Tailwind CSS utility classes
- Implement mobile-first responsive design
- Follow established color scheme and spacing
- Ensure accessibility with proper ARIA labels

### State Management

#### Global State (React Context)
```typescript
// Language context usage
const { language, t, setLanguage } = useLanguage();

// Theme context usage  
const { theme, setTheme } = useTheme();

// Feature flags
const { features, isFeatureEnabled } = useFeatures();
```

#### Component State
```typescript
// Local state for component data
const [searchTerm, setSearchTerm] = useState('');
const [filters, setFilters] = useState(defaultFilters);
```

### Adding New Categories

1. **Update Category Data** (`client/src/lib/categories.ts`):
   ```typescript
   export const categories: Category[] = [
     // ... existing categories
     {
       id: 'new-category',
       name: 'New Category',
       nameAm: 'አዲስ ምድብ',
       icon: NewIcon,
       description: 'Description of new category',
       subcategories: [
         {
           id: 'subcategory-1',
           name: 'Subcategory Name',
           nameAm: 'ንዑስ ምድብ',
           description: 'Subcategory description',
           parentId: 'new-category'
         }
       ]
     }
   ];
   ```

2. **Add Icon Import**:
   ```typescript
   import { NewIcon } from 'lucide-react';
   ```

3. **Test Navigation**:
   - Verify category appears in marketplace
   - Test routing to category and subcategory pages
   - Ensure breadcrumb navigation works

## 🐛 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 2. Build Failures
```bash
# Check for TypeScript errors
npm run check

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### 3. Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify shadcn/ui components are imported correctly

#### 4. Routing Problems
- Check route definitions in `App.tsx`
- Verify Wouter router configuration
- Ensure proper use of `Link` components

### Performance Optimization

#### Bundle Size
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

#### Development Performance
- Use React DevTools for component profiling
- Implement proper memoization with `useMemo` and `useCallback`
- Lazy load components for better initial load times

### Browser Support

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 90+ | Full Support |
| Firefox | 88+ | Full Support |
| Safari | 14+ | Full Support |
| Edge | 90+ | Full Support |
| Mobile Safari | 14+ | Full Support |
| Chrome Mobile | 90+ | Full Support |

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: 0px - 640px (1 column)
- **Tablet**: 641px - 1024px (2-3 columns)
- **Desktop**: 1025px+ (4+ columns)

### Mobile Features
- Touch-friendly navigation
- Optimized search interface
- Collapsible filter sidebar
- Swipe gestures for image galleries
- Fast tap responses

## 🌐 Internationalization

### Current Languages
- **English** (en): Primary language
- **Amharic** (am): Infrastructure ready

### Adding Translations
1. Update category data with `nameAm` fields
2. Add translation strings to `client/src/lib/i18n.ts`
3. Use `t()` function in components for translated text

## 🚀 Deployment

### Production Build
```bash
# Create optimized build
npm run build

# Test production build locally
npm run start
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare, AWS CloudFront
- **Traditional Hosting**: Apache, Nginx with static files

### Build Output
- **Size**: ~2-3MB (gzipped)
- **Assets**: Optimized images, fonts, and JavaScript bundles
- **PWA**: Service worker for offline functionality

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the technical documentation

---

**EthioMarket** - Connecting the Ethiopian marketplace with modern technology.