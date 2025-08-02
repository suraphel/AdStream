# TenderFloatingBindingApplication

## Overview
TenderFloatingBindingApplication is a monolithic web application designed for managing and hosting tender documents. It allows companies to upload tender documents, enables public viewing of basic details, and restricts full document downloads to paid users. The system features secure document access, payment integration, email notifications, and comprehensive administrative tools for tender management. The project aims to provide a robust platform for tender document exchange, with capabilities for handling various document types and ensuring secure transactions.

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

### Backend
- **Runtime**: .NET 8
- **Framework**: ASP.NET Core Web API
- **Database ORM**: Entity Framework Core
- **Authentication**: JWT-based authentication with role-based authorization (User, Admin, Moderator)
- **Architecture**: Clean Architecture (Core, Application, Infrastructure, API layers)

### Database Design
- **Primary Database**: SQL Server Express/LocalDB
- **Schema Management**: Entity Framework Core migrations
- **Key Tables**: Users, Categories, Listings, ListingImages, Favorites, tender-specific tables (companies, documents, purchases, etc.), shop-specific tables (shops, shop_products, shop_orders, accounting_ledger, etc.), OTP and notification tables.
- **Features**: Hierarchical categories, bilingual content (English/Amharic), role-based access control, comprehensive shop module with Ethiopian accounting compliance (VAT, TIN/VAT validation, fiscal year management), SMS-based OTP verification, and text notification system for favorited item matches.

### Key Features & Components
- **Authentication System**: JWT-based authentication, role-based access control, user management, email verification, SMS-based OTP verification.
- **Listing Management**: Multi-step forms, image upload, hierarchical categories, search & filtering, user-specific favoriting.
- **Tender Document Management**: Secure file upload, storage, download with access control, payment integration, email notifications, download logging, purchase verification.
- **Shop Module**: Business logic for private selling, extensive database schema for shops, products, orders, and accounting, Ethiopian accounting compliance, shop registration, dashboard interface, and back office administration.
- **Internationalization**: English and Amharic support, context-based translation, locale-aware formatting.
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