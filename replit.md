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

### Recent Updates (July 25, 2025)
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
- **Comprehensive Messaging System**: Implemented user-to-user communication similar to finn.no
  - **Database Schema**: Added conversations and messages tables with proper user relations
  - **Messaging API**: Created REST endpoints for conversation management and message sending
  - **Messages UI**: Built dedicated Messages page with conversation list and chat interface
  - **Contact Seller**: Added "Contact Seller" button on listing details to initiate conversations
  - **Real-time Features**: Message sending, receiving, and conversation history management
- **Category Icon Fix**: Resolved motorcycle category showing computer icon
  - **Icon Mapping**: Added proper icon mappings for motorcycles (Zap), cars (Car), trucks (Truck)
  - **Visual Consistency**: Ensured all vehicle categories display appropriate icons instead of fallback laptop icon

### Future Enhancements Prepared
- **Payment Integration**: Mock Telebirr service ready for real integration with feature toggle control
- **Image Storage**: Local storage service with cloud abstraction ready for cloud migration
- **Admin Panel**: Role-based access control with Admin/Moderator roles implemented and feature-gated
- **Real-time Features**: WebSocket preparation for messaging and notifications with feature toggle support
- **Advanced Analytics**: Business intelligence dashboards and user behavior analytics
- **Security Monitoring**: Authentication failure tracking and suspicious activity detection
- **External API Expansion**: Ready to integrate with more providers like Booking.com, Expedia (requires partnerships)