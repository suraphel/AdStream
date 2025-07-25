# EthioMarket Backend (.NET 8)

A clean architecture ASP.NET Core Web API for the EthioMarket classified ads platform.

## Architecture

This backend follows Clean Architecture principles with clear separation of concerns:

```
├── EthioMarket.Core/          # Domain layer - Entities, Enums, Interfaces
├── EthioMarket.Application/   # Application layer - Services, DTOs, Business Logic
├── EthioMarket.Infrastructure/# Infrastructure layer - Data Access, External Services
└── EthioMarket.API/          # Presentation layer - Controllers, API Configuration
```

## Features

- **Clean Architecture** with dependency inversion
- **Entity Framework Core** with SQL Server
- **JWT Authentication** with role-based authorization
- **AutoMapper** for object mapping
- **Serilog** for structured logging
- **Swagger/OpenAPI** documentation
- **CORS** configured for React frontend
- **Local file storage** with cloud abstraction
- **Mock payment service** (Telebirr integration ready)
- **Full English/Amharic localization** support

## Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server Express/LocalDB
- Visual Studio or VS Code

### Setup

1. **Restore packages:**
   ```bash
   dotnet restore
   ```

2. **Update connection string** in `appsettings.json` if needed

3. **Create database:**
   ```bash
   dotnet ef database update --project EthioMarket.Infrastructure --startup-project EthioMarket.API
   ```

4. **Run the application:**
   ```bash
   dotnet run --project src/EthioMarket.API
   ```

The API will be available at `https://localhost:7000` and `http://localhost:5000`.

## API Endpoints

### Categories
- `GET /api/categories` - Get all active categories
- `GET /api/categories?withCount=true` - Get categories with listing counts
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/slug/{slug}` - Get category by slug
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/{id}` - Update category (Admin)
- `DELETE /api/categories/{id}` - Delete category (Admin)

### Listings (To be implemented)
- `GET /api/listings` - Get listings with filtering/pagination
- `GET /api/listings/{id}` - Get listing details
- `POST /api/listings` - Create new listing (Authenticated)
- `PUT /api/listings/{id}` - Update listing (Owner/Admin)
- `DELETE /api/listings/{id}` - Delete listing (Owner/Admin)

### Users (To be implemented)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Database Schema

The database includes these main entities:

- **Users** - User accounts with roles (User, Moderator, Admin)
- **Categories** - Hierarchical category system with bilingual names
- **Listings** - Classified ads with bilingual content
- **ListingImages** - Multiple images per listing
- **Favorites** - User favorites system

## Configuration

Key configuration sections in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your SQL Server connection string"
  },
  "Jwt": {
    "Key": "Your JWT secret key (32+ characters)",
    "Issuer": "EthioMarket",
    "Audience": "EthioMarket-Users"
  },
  "Storage": {
    "LocalPath": "wwwroot/uploads",
    "BaseUrl": "/uploads"
  }
}
```

## Development

### Adding New Features

1. **Domain entities** go in `EthioMarket.Core/Entities/`
2. **Repository interfaces** go in `EthioMarket.Core/Interfaces/Repositories/`
3. **Service interfaces** go in `EthioMarket.Core/Interfaces/Services/`
4. **DTOs** go in `EthioMarket.Application/DTOs/`
5. **Service implementations** go in `EthioMarket.Application/Services/`
6. **Repository implementations** go in `EthioMarket.Infrastructure/Repositories/`
7. **Controllers** go in `EthioMarket.API/Controllers/`

### Database Migrations

```bash
# Add new migration
dotnet ef migrations add MigrationName --project EthioMarket.Infrastructure --startup-project EthioMarket.API

# Update database
dotnet ef database update --project EthioMarket.Infrastructure --startup-project EthioMarket.API
```

## Testing

Unit tests and integration tests will be added in separate test projects following the same clean architecture pattern.

## Deployment

The application is configured for deployment with:
- Environment-specific configuration
- Structured logging to files
- HTTPS redirection
- Static file serving for uploads
- Health checks (to be implemented)

## Security

- JWT tokens for authentication
- Role-based authorization
- CORS configured for specific origins
- Input validation with data annotations
- SQL injection protection via Entity Framework
- File upload validation and sanitization