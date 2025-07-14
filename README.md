# KORSVAGEN Backend API

Express.js backend optimized for Vercel serverless deployment.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Development

```bash
# Start Vercel development server
vercel dev

# Or using npm
npm run dev
```

### 4. Test API

```bash
# Test all endpoints
node test-api.js
```

## API Endpoints

### Health Check

- `GET /api/health` - System health status

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Content Management

- `GET /api/content/pages` - Get pages
- `GET /api/content/sections` - Get sections
- `GET /api/content/media` - Get media files

Protected endpoints (require authentication):

- `POST|PUT|DELETE /api/content/*` - CRUD operations

## Environment Variables

See `.env.example` for all required environment variables.

### Required for Production

- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Frontend URL
- `DB_*` - Database connection settings

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Manual Deployment

1. Configure environment variables in Vercel dashboard
2. Connect GitHub repository
3. Deploy automatically on push to main

## Authentication

Default test credentials:

- Username: `admin`
- Password: `admin123`

**⚠️ Change these in production!**

## Security Features

- CORS protection
- Helmet security headers
- JWT authentication
- Input validation (Joi)
- Request logging (Morgan)

## Project Structure

```
api/
├── auth/           # Authentication endpoints
├── content/        # Content management endpoints
├── utils/          # Shared utilities
│   ├── auth.js     # JWT utilities
│   ├── db.js       # Database utilities
│   ├── middleware.js # Express middleware
│   └── validation.js # Input validation
└── health.js       # Health check endpoint
```

## Development Notes

- All API routes are serverless functions
- Mock data is used for development
- Replace mock data with real database in production
- JWT tokens expire in 24 hours (configurable)

## Next Steps

1. Set up real database connection
2. Implement email sending for contact forms
3. Add file upload for media management
4. Set up production monitoring
