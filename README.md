# TenderFloatingBinding Application

A comprehensive classified ads marketplace platform for the Ethiopian market with complete separation of frontend and backend services.

## Architecture Overview

### Frontend (React + TypeScript)
- **Location**: `frontend/` directory  
- **Technology**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **API Connection**: Configured to connect to .NET backend on http://localhost:5001/api
- **Independent Operation**: Runs standalone without backend dependencies

### Backend (.NET Web API)
- **Location**: `backend/TenderFloatingBindingApi/` directory
- **Technology**: .NET 8, Entity Framework Core, SQLite
- **Database**: SQLite with Ethiopian market categories pre-seeded
- **API Endpoints**: Categories, Users, Listings, Messages, Favorites
- **Swagger Documentation**: Available at http://localhost:5001/swagger

## Running the Application

### Frontend Only (Standalone)
```bash
cd frontend
npm install
npm run dev
```
- Runs on: http://localhost:5173
- Environment: Development mode with hot reload
- API Connection: Configured via VITE_API_URL in .env.local

### Backend Only (via .slm file)
```bash
cd backend
./run-backend.slm
```
- Double-click `run-backend.slm` to start
- Runs on: http://localhost:5001
- Includes database initialization and seeding
- Swagger UI at: http://localhost:5001/swagger

### Alternative Frontend Commands
```bash
cd frontend
npm run build    # Production build
npm start        # Preview production build
```

## Project Structure
```
├── frontend/
│   ├── src/
│   ├── package.json          # Frontend-only dependencies
│   ├── vite.config.ts
│   ├── .env.local            # API URL configuration
│   └── start-frontend.sh     # Frontend startup script
├── backend/
│   ├── TenderFloatingBindingApi/
│   ├── run-backend.slm       # Backend executable launcher
│   └── README.md
└── README.md                 # This file
```

## Features
- **Ethiopian Market Focus**: Categories, localization, and regional preferences
- **FINN.no-Style Layout**: Clean, organized marketplace design
- **Multilingual Support**: English and Amharic content
- **Advanced Filtering**: Category-based search with price ranges
- **Responsive Design**: Mobile-first approach
- **Modern Tech Stack**: Latest React and .NET technologies

## Database
- **Type**: SQLite (TenderFloatingBindingDb.db)
- **Pre-seeded Data**: Ethiopian market categories (Electronics, Vehicles, Property, Jobs, Fashion)
- **Auto-initialization**: Database created automatically on first run

## API Endpoints
- `GET /api/categories` - List all categories
- `GET /health` - Health check
- `POST /api/SeedData/categories` - Seed sample data
- Additional CRUD endpoints for listings, users, messages

## Development Notes
- Frontend configured for standalone development
- Backend runs independently via .slm file
- Complete separation achieved - no Node.js dependencies in backend
- Both services can run simultaneously or independently