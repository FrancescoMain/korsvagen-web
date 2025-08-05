# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

KORSVAGEN is a monorepo containing a React frontend and Express.js backend for a construction company website with a content management system.

**Structure:**
- `client/` - React 18.3.1 TypeScript SPA with styled-components
- `server/` - Express.js API server with Supabase database and Cloudinary media storage
- Root level contains monorepo configuration and documentation

## Key Technologies

**Frontend:**
- React 18.3.1 with TypeScript and Create React App
- Styled Components for CSS-in-JS styling
- React Router DOM v6 for client-side routing
- Authentication with JWT and protected routes
- React Hook Form with Yup validation
- React Hot Toast for notifications

**Backend:**
- Express.js with ES modules (`"type": "module"`)
- Supabase (PostgreSQL) for database
- Cloudinary for media storage and CDN
- JWT authentication with bcryptjs
- Express middleware: helmet, cors, rate limiting
- Morgan for HTTP logging

**Deployment:**
- Vercel for backend serverless functions
- Frontend served from Vercel static hosting

## Common Development Commands

### Development Environment
```bash
# Start backend development server
cd server && npm run dev

# Start frontend development server  
cd client && npm start

# Build entire project (frontend + backend)
npm run build

# Start Vercel local development
npm run dev
```

### Database Management
```bash
# Run database migrations
npm run migrate

# Check migration status
npm run migrate:status

# Database backup
npm run db:backup

# Database statistics
npm run db:stats
```

### Frontend Commands
```bash
# Frontend specific commands (run from client/)
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

### Backend Commands  
```bash
# Backend specific commands (run from server/)
npm run dev        # Development server
npm start          # Production server
```

## Authentication System

The application uses JWT-based authentication with the following components:

- `AuthContext` (`client/src/contexts/AuthContext.tsx`) - Global auth state management
- `AuthProvider` - Wraps the entire application  
- `ProtectedRoute` - Wrapper for authenticated-only routes
- Login system with username/password authentication
- Auto token refresh and persistent sessions
- Role-based access (admin, editor, super_admin)

## API Structure

**Base URL:** `/api`

**Endpoints:**
- `/api/health` - Server health checks and diagnostics
- `/api/auth` - Authentication (login/logout/refresh) 
- `/api/dashboard` - Dashboard data and statistics
- `/api/contact` - Contact form submissions
- `/api/settings` - Application settings management

## Frontend Architecture

**Routing Structure:**
- Public routes: `/`, `/chi-siamo`, `/servizi`, `/progetti`, `/news`, etc.
- Protected routes: `/dashboard/*`, `/editor/*`
- Authentication: `/login`

**Key Components:**
- `DashboardLayout` - Admin dashboard with sidebar navigation
- `PageEditor` - Visual page content editor with drag-and-drop
- `MediaLibrary` - Cloudinary integration for media management
- Instagram integration for social media display

**State Management:**
- Context API for global state (Auth, Theme, Settings)
- Local state with useState for component-specific data
- Custom hooks in `client/src/hooks/`

## Database Schema

Uses Supabase PostgreSQL with tables for:
- `users` - Authentication and user management
- `app_settings` - Application configuration
- Content management tables for pages, media, etc.

## Environment Variables

**Required for development:**
```env
# Supabase Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Cloudinary Media
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# API Configuration
API_BASE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret

# Environment
NODE_ENV=development
```

## Important File Locations

**Frontend:**
- Main app: `client/src/App.tsx`
- Routing: `client/src/App.tsx` (Routes defined inline)
- Styles: `client/src/styles/` (dashboard.css, editor.css, globals.css) 
- Components: `client/src/components/` (organized by feature)
- Pages: `client/src/pages/`
- Types: `client/src/types/`

**Backend:**
- Main server: `server/index.js`
- Routes: `server/routes/`
- Configuration: `server/config/` (supabase.js, cloudinary.js)
- Utilities: `server/utils/` (auth.js, logger.js)

## Development Notes

- **React Version:** Fixed at 18.3.1 with package.json overrides due to Vercel compatibility
- **Import Style:** Backend uses ES modules (`import/export`), frontend uses ES6 imports
- **Authentication:** JWT tokens stored in httpOnly cookies for security
- **CORS:** Configured for multiple domains including localhost and production URLs
- **Rate Limiting:** 100 requests per 15-minute window by default
- **Logging:** Structured JSON logging with different levels (info, warn, error)

## Deployment Configuration

**Vercel Setup:**
- `vercel.json` in root configures serverless functions
- Build process: `npm run build` handles client build and copying
- Server deployed as Vercel serverless function
- Static files served from `build/` directory

## Testing

- Frontend: Jest + React Testing Library (configured but minimal tests)
- Backend: No test framework currently configured
- Health checks available at `/api/health` for monitoring

## Styling Guidelines

- Primary styling: Styled Components with TypeScript
- Dark theme with gold accents (#d4af37)
- Responsive design with mobile-first approach
- Custom fonts loaded from `/public/fonts/`
- CSS modules for specific component styles

## Development Workflow

- ogni volta che completi una implementazione fai test di compilazione sia client che server e poi committa e pusha per far partire il deploy