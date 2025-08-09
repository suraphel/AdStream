# TenderFloatingBindingApplication

## Overview
TenderFloatingBindingApplication is a comprehensive classified ads marketplace platform designed for the Ethiopian market. The system has undergone a complete architectural migration from Node.js/Express to .NET Web API backend while maintaining the React frontend. The platform features a FINN.no-style marketplace with advanced category filtering, Ethiopian localization, and modern responsive design. The system provides robust listing management, multilingual support, and specialized features for various market segments including vehicles, electronics, real estate, and more.

## Recent Changes (August 2025)
- **✅ COMPLETED: Complete Node.js to .NET Migration**: Successfully migrated entire backend from Node.js/Express to .NET 8 Web API with Entity Framework Core and SQLite database
- **✅ Backend Architecture**: Built complete .NET Web API with Entity Framework models (User, Category, Listing, ListingImage, Favorite, Message) and controllers with full CRUD operations  
- **✅ Database Migration**: Switched from PostgreSQL/Drizzle to SQLite/Entity Framework for simpler deployment and database management
- **✅ Frontend Integration**: Updated React frontend API configuration to connect to .NET backend on port 5001
- **✅ Code Cleanup**: Completely removed all Node.js/Express code, server directory, and related dependencies as requested
- **✅ COMPLETED: Frontend/Backend Separation**: Successfully separated frontend and backend for independent operation
- **✅ Frontend Standalone**: Created frontend-only package.json with clean dependencies, runs independently via npm run dev/start
- **✅ Backend .slm File**: Created executable run-backend.slm file for easy backend startup without frontend dependencies
- **✅ Environment Configuration**: Configured frontend with proper environment variables for API connection
- **✅ Project Structure Cleanup**: Organized project into frontend/ and backend/ directories with clear separation
- **✅ COMPLETED: Full Standalone Frontend**: Made app completely standalone - no backend dependencies required
- **✅ API Call Removal**: Disabled all API calls in queryClient, TenderHome, and Home pages for standalone operation
- **✅ Complete Marketplace Implementation**: Built full marketplace with categories, subcategories, and multi-level routing
- **✅ Marketplace Navigation**: Fixed routing from landing page to /marketplace with complete category system

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: React Query (server state), React Context (global state)
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Design**: shadcn/ui components with custom Ethiopian market styling, mobile-first responsive design, ARIA labels, keyboard navigation support, light theme with Ethiopian-inspired color palette.
- **API Integration**: Configured to connect to .NET Web API backend on port 5001

### Backend
- **Runtime**: .NET 8
- **Framework**: ASP.NET Core Web API
- **Database ORM**: Entity Framework Core with SQL Server Express
- **Architecture**: Clean Architecture (Models, Controllers, Data layers)
- **CORS**: Configured for frontend development on localhost:5173
- **API Documentation**: Swagger/OpenAPI integration

### Database Design
- **Primary Database**: SQL Server Express/LocalDB
- **Schema Management**: Entity Framework Core migrations
- **Key Tables**: Users, Categories, Listings, ListingImages, Favorites, Messages
- **Features**: Hierarchical categories with self-referencing relationships, bilingual content (English/Amharic), comprehensive listing management with vehicle and electronics-specific fields, user favorites system, messaging between users
- **Migrations**: Initial migration created with all core entities and relationships configured

### Key Features & Components
- **Advanced Category Filtering System**: Comprehensive filter sidebar with collapsible sections, price range sliders, Ethiopian city selection, brand filtering, vehicle-specific filters (transmission, mileage), condition filters, and responsive design.
- **FINN.no-Style Layout**: Clean, organized category presentation with hierarchical navigation, breadcrumb system, subcategory grids, and mobile-first responsive design optimized for diverse device experiences.
- **Navigation System**: BreadcrumbNavigation component, SubcategoryGrid for category group browsing, CategoryGroup pages with proper routing integration, and intuitive category organization.
- **Authentication System**: JWT-based authentication, role-based access control, user management, email verification, SMS-based OTP verification.
- **Listing Management**: Multi-step forms, image upload, hierarchical categories, advanced search & filtering with real-time updates, user-specific favoriting.
- **Tender Document Management**: Secure file upload, storage, download with access control, payment integration, email notifications, download logging, purchase verification.
- **Shop Module**: Business logic for private selling, extensive database schema for shops, products, orders, and accounting, Ethiopian accounting compliance, shop registration, dashboard interface, and back office administration.
- **Internationalization**: English and Amharic support, context-based translation, locale-aware formatting with Ethiopian market localization.
- **Messaging System**: User-to-user communication with conversations and messages tables, "Contact Seller" functionality.
- **Text Notification System**: SMS notifications for favorited item matches, user-controlled preferences, notification history.
- **Configuration & Feature Management**: Environment-specific configuration, feature toggle system for dynamic enabling/disabling of features (payments, chat, image upload, admin panel, analytics, etc.), localization management.

## External Dependencies

### Database
- **SQL Server Express/LocalDB**: Local database for development.
- **Entity Framework Core**: ORM.

### Authentication
- **JWT Authentication**: Self-contained token-based authentication.

### Development Tools
- **Replit Integration**: Development environment.
- **Vite Plugins**: Runtime error overlay and cartographer for Replit.

### UI Libraries
- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide Icons**: Icon library.

### Communication & Payments
- **Twilio**: For SMS-based OTP verification and text notifications.
- **Telebirr (Mock)**: Payment integration service (mocked, ready for real integration).