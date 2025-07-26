# TenderFloatingBindingApplication - Tender Document Management System

## Overview

TenderFloatingBindingApplication is a monolithic web application for managing and hosting tender documents. The system allows companies to upload tender documents, enables users to view basic details (title/description) without logging in, and provides full document downloads only to paid users. It features secure document access, payment integration, email notifications, and comprehensive admin panels for tender management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state, React Context for global state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: .NET 8
- **Framework**: ASP.NET Core Web API
- **Database ORM**: Entity Framework Core with SQL Server Express/LocalDB
- **Authentication**: JWT-based authentication with role-based authorization (User, Admin, Moderator)
- **Architecture**: Clean Architecture with Core, Application, Infrastructure, and API layers

### Database Design
- **Primary Database**: SQL Server Express/LocalDB
- **Schema Management**: Entity Framework Core migrations and configurations
- **Key Tables**: Users, Categories, Listings, ListingImages, Favorites
- **Features**: Hierarchical categories, bilingual content (English/Amharic), role-based access control

## Key Components

### Authentication System
- **Provider**: JWT-based authentication
- **Authorization**: Role-based access control (User, Admin, Moderator roles)
- **Security**: JWT tokens with configurable expiry, secure API endpoints
- **User Management**: Registration, login, profile management with email verification

### Listing Management
- **Creation**: Multi-step form with image upload support
- **Categories**: Hierarchical category system with parent-child relationships
- **Images**: Multiple image support per listing with upload functionality
- **Search & Filtering**: Full-text search with category and location filters
- **Favorites**: User-specific favoriting system

### Internationalization
- **Languages**: English and Amharic support
- **Implementation**: Context-based translation system
- **Formatting**: Locale-aware date, time, and number formatting
- **Content**: Category names and UI elements translated

### UI/UX Design
- **Design System**: shadcn/ui components with custom Ethiopian market styling
- **Responsive**: Mobile-first responsive design
- **Accessibility**: ARIA labels and keyboard navigation support
- **Theme**: Light theme with Ethiopian-inspired color palette

## Data Flow

### User Authentication Flow
1. User submits credentials to `/api/auth/login` endpoint
2. Backend validates credentials and generates JWT token
3. Token returned to client with user information
4. Frontend stores token and includes in API requests
5. Backend validates JWT token on protected endpoints

### Listing Creation Flow
1. User accesses authenticated `/post` route
2. Form validates data using React Hook Form and Zod schemas
3. POST to `/api/listings` creates listing record via ASP.NET Core controller
4. Images uploaded to local storage (with cloud abstraction ready)
5. Listing appears in user's profile and public feeds with proper role-based access

### Search and Discovery Flow
1. Users search via homepage or category pages
2. API queries with pagination, filtering, and sorting
3. Results cached using React Query
4. Infinite scroll for large result sets

## External Dependencies

### Database Services
- **SQL Server Express/LocalDB**: Local database for development
- **Entity Framework Core**: ORM with connection pooling and migration support

### Authentication Services
- **JWT Authentication**: Self-contained token-based authentication
- **Role-based Authorization**: Built-in ASP.NET Core authorization

### Development Tools
- **Replit Integration**: Development environment with hot reload
- **Vite Plugins**: Runtime error overlay and cartographer for Replit

### UI Libraries
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Platform**: Replit with automatic environment provisioning
- **Hot Reload**: Vite dev server with Express middleware
- **Database**: Automatic Neon PostgreSQL provisioning
- **Environment Variables**: Replit secrets management

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: ESBuild bundling for Node.js deployment
- **Database Migrations**: Drizzle Kit for schema management
- **Static Assets**: Served via Express static middleware

### Scaling Considerations
- **Database**: Connection pooling ready for horizontal scaling
- **Sessions**: PostgreSQL-backed sessions support multiple server instances
- **Assets**: Prepared for CDN integration (currently local storage)
- **Search**: Basic filtering ready for search engine integration

### Observability and Monitoring
- **Structured Logging**: Winston-based logging with JSON format, log rotation, and HTTP transport support
- **Metrics Collection**: Prometheus metrics for API performance, business KPIs, and system health
- **Error Tracking**: Comprehensive frontend and backend error capture with severity classification
- **Health Checks**: Multi-layered health monitoring (liveness, readiness, comprehensive health)
- **Grafana Dashboards**: Pre-built dashboards with English/Amharic language support
- **Alert Management**: Prometheus AlertManager with bilingual alert notifications
- **Monitoring Stack**: Docker Compose setup with Prometheus, Grafana, AlertManager, and Node Exporter

### Configuration and Feature Management
- **Environment-Specific Configuration**: Separate configuration files for development, staging, and production environments
- **Feature Toggle System**: Dynamic feature enabling/disabling for payments, chat, map search, image upload, favorites, admin panel, analytics, and notifications
- **Localization Management**: Comprehensive bilingual support (English/Amharic) with RTL support, currency formatting, and date localization
- **Configuration API**: Real-time feature configuration delivery to frontend based on user context and environment
- **Feature Analytics**: Admin dashboard for monitoring feature usage and rollout percentages
- **Environment Setup Scripts**: Automated setup scripts with bilingual support for easy deployment

### Feature Toggle Architecture
- **Server-Side Toggle Service**: Centralized feature management with dependency checking and rollout percentage support
- **Frontend Feature Context**: React context provider for feature-aware component rendering
- **Dynamic Configuration**: Feature states determined by environment, user role, and custom rules
- **Admin Controls**: API endpoints for feature analytics and toggle management

### Seed Data and Development Tools
- **Comprehensive Seed Data**: 50+ sample listings with bilingual content, realistic Ethiopian data, and multiple categories
- **Database Seeding Scripts**: Automated data population for development and testing environments
- **Localization Scripts**: Translation file generation and configuration validation
- **Environment Setup**: One-command setup for development, staging, and production environments

### Recent Updates (July 26, 2025)
- **Comprehensive OTP Verification System**: Implemented complete SMS-based OTP verification with Twilio integration
  - **Database Schema**: Created otpVerifications and otpRateLimits tables with proper encryption and rate limiting
  - **OTPService**: Built comprehensive service with Ethiopian phone number validation (+251XXXXXXXXX), AES encryption, and 10-minute expiration
  - **Security Features**: Rate limiting (max 3 attempts per 15 minutes), encrypted OTP storage, attempt tracking
  - **UI Components**: Created OTPVerification and PasswordStrengthInput components with real-time validation
  - **TenderOTPRegister**: Built unified registration component supporting both user and company registration flows
  - **API Integration**: Complete OTP endpoints (/api/otp/send, /api/otp/verify) with bilingual error messages
  - **Twilio Configuration**: Added placeholder configuration for SMS delivery (requires actual credentials for production)
  - **Registration Flow**: Updated tender registration routes to use OTP verification before completing registration

### Previous Updates (July 25, 2025)
- **Comprehensive Shop Module Implementation**: Built complete business logic for shops to use application as private selling platform
  - **Database Schema**: Created extensive shop database schema with 6 main tables (shops, shop_products, shop_orders, shop_order_items, accounting_ledger, shop_analytics)
  - **Ethiopian Accounting Compliance**: Implemented proper VAT handling (15%), TIN/VAT number validation, fiscal year management (July-June), and double-entry bookkeeping
  - **Shop Registration System**: Built comprehensive registration with business license validation, regional selection (Ethiopian regions), and business type classification
  - **Dashboard Interface**: Created full-featured shop dashboard with sales metrics, order management, product summary, and financial reporting
  - **Back Office Administration**: Implemented accounting ledger, VAT tracking, profit calculations, and Ethiopian tax compliance features
  - **API Architecture**: Complete REST API with shop management, product CRUD, order processing, and financial reporting endpoints
  - **Authentication Integration**: Role-based access control for shop owners with secure shop management interface
  - **Navigation System**: Added ShopNav component for shop-specific navigation and quick access to dashboard features
- **TenderFloatingBindingApplication System**: Built complete tender document management system
  - **Database Schema**: Created comprehensive tender schema with companies, users, documents, purchases, and logs
  - **Authentication**: JWT-based authentication for both companies and users with separate login systems
  - **Document Management**: Secure file upload, storage, and download with access control
  - **Payment Integration**: Purchase system with email notifications and download tracking
  - **User Interfaces**: Built TenderHome, TenderDetail, TenderUserRegister, TenderCompanyRegister pages
  - **Security Features**: Download logging, purchase verification, and file access protection
  - **Admin Features**: Company dashboard with sales analytics and purchase tracking
  - **Email System**: Automated notifications for purchases and company alerts
  - **Navigation**: Added TenderFloat navigation link accessible to all users
- **Authentication System Updates**: Cleaned up registration flow and button text
  - **Removed Register Button**: Eliminated marketplace registration button causing 404 errors
  - **Fixed Route Conflicts**: Resolved tender registration routing conflicts by reordering routes
  - **Simplified Authentication**: Changed "Get Started" to "Login" buttons for clarity
  - **Separation of Systems**: Clear separation between marketplace authentication and tender registration
- **Authentication-Based Access Control for P2P Categories**: Implemented comprehensive privacy controls
  - **Category-Based Restrictions**: Created P2P category restrictions (electronics, vehicles, housing, etc.) while keeping tenders and airline tickets public
  - **Contact Information Privacy**: Hide seller's full name and contact details from unauthenticated users in P2P categories
  - **Authentication Prompts**: Added "Show Contact Info" and "Start Chat" buttons that redirect to login for unauthenticated users
  - **Messaging System Database**: Fixed missing conversations tables and indexes for proper messaging functionality
  - **Privacy Protection**: Seller names shown as "J***" for unauthenticated users, full details visible only after login
- **Landing Page Enhancement**: Updated landing page to show listings for all users while maintaining contact restrictions
  - **Public Listings Display**: Featured and recent listings now visible to unauthenticated users to encourage exploration
  - **Contact Restrictions Maintained**: "Contact Seller" and messaging features still require authentication for P2P categories
  - **Improved User Experience**: Users can browse and discover products before signing up, reducing friction
- **Category Icons Improvement**: Fixed category page to display proper category-specific icons
  - **Icon Mapping**: Added comprehensive icon mapping for all categories (smartphones, cars, motorcycles, real estate, etc.)
  - **Visual Consistency**: Categories now show appropriate icons instead of generic package icons
  - **Better Navigation**: Improved visual hierarchy and category recognition for users
- **Text Notification System**: Implemented comprehensive SMS notification system for favorited item matches
  - **Database Schema**: Created notification_preferences and notification_logs tables with proper indexing
  - **NotificationService**: Built sophisticated matching logic based on category, location, and price range (20% tolerance)
  - **Smart Matching**: Notifications triggered when new listings match user's favorited items in same category
  - **User Control**: Added notification preferences tab in Profile page with phone number management
  - **Opt-in System**: Users can enable/disable notifications and provide phone numbers for SMS delivery
  - **Notification History**: Comprehensive logging of all sent notifications with status tracking
  - **Integration**: Automatic notification checking on new listing creation with non-blocking execution
  - **UI Components**: Created NotificationSettings component with real-time preference management
- **Data Type Consistency Fix**: Resolved price field validation error in listing creation
  - **Schema Validation**: Updated insertListingSchema to handle both string and number price inputs with proper transformation
  - **Form Handling**: Fixed price field in PostListing component to use string values consistently
  - **Error Resolution**: Eliminated "Expected string, received number" validation errors during listing creation
  - **Database Compliance**: Ensured price field properly stores as decimal while accepting flexible input types
- **Comprehensive Messaging System**: Implemented user-to-user communication similar to finn.no
  - **Database Schema**: Added conversations and messages tables with proper user relations
  - **Messaging API**: Created REST endpoints for conversation management and message sending
  - **Messages UI**: Built dedicated Messages page with conversation list and chat interface
  - **Contact Seller**: Added "Contact Seller" button on listing details to initiate conversations
  - **Real-time Features**: Message sending, receiving, and conversation history management
- **Category Icon Fix**: Resolved motorcycle category showing computer icon
  - **Icon Mapping**: Added proper icon mappings for motorcycles (Zap), cars (Car), trucks (Truck)
  - **Visual Consistency**: Ensured all vehicle categories display appropriate icons instead of fallback laptop icon
- **Strong Password Implementation**: Comprehensive password strength system across all forms
  - **Password Strength Component**: Built reusable PasswordStrengthInput with real-time validation
  - **Security Requirements**: Enforced uppercase, lowercase, numbers, and special characters
  - **User Experience**: Added password generator, visibility toggle, and detailed strength feedback
  - **Form Integration**: Applied to all registration forms (marketplace, tender user, tender company)
  - **Visual Indicators**: Color-coded strength meter with suggestions and requirement checklist
- **Comprehensive Image and Data Seeding System**: Complete visual content for all categories and services
  - **Category Images**: Created professional SVG placeholders for all 15 categories (electronics, vehicles, real-estate, fashion, home-garden, services, jobs, smartphones, airline-tickets)
  - **Product Images**: Generated realistic demo images for major product types (iPhone, laptops, cars, motorcycles, apartments, houses, clothing, services)
  - **Demo Listings**: Expanded from 9 to 19 comprehensive listings covering all categories with bilingual descriptions
  - **Image Assets**: Total of 29 images including both SVG placeholders and realistic product photos
  - **Visual Consistency**: Each category and listing now has appropriate visual representation with professional design
  - **Database Population**: Successfully seeded 7 users, 15 categories, 19 listings, and 29 images for rich marketplace experience

### Future Enhancements Prepared
- **Payment Integration**: Mock Telebirr service ready for real integration with feature toggle control
- **Image Storage**: Local storage service with cloud abstraction ready for cloud migration
- **Admin Panel**: Role-based access control with Admin/Moderator roles implemented and feature-gated
- **Real-time Features**: WebSocket preparation for messaging and notifications with feature toggle support
- **Advanced Analytics**: Business intelligence dashboards and user behavior analytics
- **Security Monitoring**: Authentication failure tracking and suspicious activity detection
- **External API Expansion**: Ready to integrate with more providers like Booking.com, Expedia (requires partnerships)