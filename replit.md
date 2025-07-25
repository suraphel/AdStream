# EthioMarket - Ethiopian Classified Ads Platform

## Overview

EthioMarket is a full-stack classified ads platform designed for the Ethiopian market, similar to FINN.no. The application supports JWT authentication, listing creation and management, category browsing, favorites, and multi-language support (English and Amharic). It's built with a modern React frontend and ASP.NET Core backend, with SQL Server as the database. The backend follows Clean Architecture principles for maintainability and scalability.

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

### Future Enhancements Prepared
- **Payment Integration**: Mock Telebirr service ready for real integration
- **Image Storage**: Local storage service with cloud abstraction ready for cloud migration
- **Admin Panel**: Role-based access control with Admin/Moderator roles implemented
- **Real-time Features**: WebSocket preparation for messaging and notifications
- **Advanced Analytics**: Business intelligence dashboards and user behavior analytics
- **Security Monitoring**: Authentication failure tracking and suspicious activity detection