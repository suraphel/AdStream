# EthioMarket - Ethiopian Classified Ads Platform

## Overview

EthioMarket is a full-stack classified ads platform designed for the Ethiopian market, similar to FINN.no. The application supports user authentication, listing creation and management, category browsing, favorites, and multi-language support (English and Amharic). It's built with a modern React frontend and Express.js backend, with PostgreSQL as the database.

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
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth (OIDC-based) with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless connection
- **Schema Management**: Drizzle migrations and schema definitions
- **Key Tables**: users, categories, listings, listing_images, favorites, sessions

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Authorization**: Role-based access control (user roles planned)
- **Security**: JWT tokens with secure session cookies

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
1. User initiates login via `/api/login` endpoint
2. Redirected to Replit OIDC provider
3. Authentication callback creates/updates user session
4. Session stored in PostgreSQL with TTL
5. Frontend queries `/api/auth/user` to maintain auth state

### Listing Creation Flow
1. User accesses authenticated `/post` route
2. Form validates data using Zod schemas
3. POST to `/api/listings` creates listing record
4. Images uploaded and associated with listing
5. Listing appears in user's profile and public feeds

### Search and Discovery Flow
1. Users search via homepage or category pages
2. API queries with pagination, filtering, and sorting
3. Results cached using React Query
4. Infinite scroll for large result sets

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management

### Authentication Services
- **Replit Auth**: OIDC-based authentication provider
- **Session Management**: PostgreSQL-backed session store

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

### Future Enhancements Prepared
- **Payment Integration**: Abstracted payment service for Telebirr integration
- **Image Storage**: Service layer abstraction for cloud storage migration
- **Admin Panel**: Role-based access control foundation
- **Real-time Features**: WebSocket preparation for messaging
- **Analytics**: Logging structure for metrics collection