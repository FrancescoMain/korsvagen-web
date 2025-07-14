# KORSVAGEN Database & Media Setup Guide

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Configuration:**

```env
# Supabase (Create project at supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudinary (Create account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secret
JWT_SECRET=your-secure-random-secret
```

### 2. Database Initialization

Run migrations to create tables and seed initial data:

```bash
npm run migrate
```

Check migration status:

```bash
npm run migrate:status
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Content Management

#### Pages

- `GET /api/content/pages` - Get all published pages
- `GET /api/content/pages?pageId=home` - Get specific page
- `GET /api/content/pages?pageId=home&withSections=true` - Get page with sections
- `POST /api/content/pages` - Create page (auth required)
- `PUT /api/content/pages` - Update page (auth required)
- `DELETE /api/content/pages` - Delete page (auth required)

#### Sections

- `GET /api/content/sections?pageId=<uuid>` - Get sections for page
- `GET /api/content/sections?type=hero` - Get sections by type
- `POST /api/content/sections` - Create section (auth required)
- `PUT /api/content/sections` - Update section (auth required)
- `PATCH /api/content/sections` - Special operations (reorder, toggle, duplicate)

#### Media

- `GET /api/content/media` - Get all media with pagination
- `GET /api/content/media?folder=korsvagen/home/hero` - Get media by folder
- `GET /api/content/media?tags=hero,banner` - Get media by tags
- `POST /api/content/media` - Create media record (auth required)
- `PUT /api/content/media` - Update media metadata (auth required)

### Media Management

#### Upload

- `POST /api/media/upload` - Upload files to Cloudinary (auth required)

**Example Upload:**

```javascript
const formData = new FormData();
formData.append("files", file1);
formData.append("files", file2);
formData.append("pageId", "home");
formData.append("sectionType", "hero");
formData.append("tags", "banner,hero");
formData.append("altTexts", "Hero image,Background image");

fetch("/api/media/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

#### Delete

- `DELETE /api/media/delete` - Delete single media
- `POST /api/media/delete` - Bulk delete media

#### Transform

- `GET /api/media/transform?mediaId=<id>&transformation=thumbnail` - Get transformed URL
- `POST /api/media/transform` - Custom transformation

### Authentication

#### Login

```javascript
POST /api/auth/login
{
  "email": "admin@korsvagen.com",
  "password": "admin123"
}
```

#### Verify Token

```javascript
POST /api/auth/verify
{
  "token": "your-jwt-token"
}
```

## Data Models

### Page Content Structure

```javascript
{
  "pageId": "home",
  "title": "KORSVAGEN - Home",
  "slug": "home",
  "description": "Home page description",
  "ogImage": "https://res.cloudinary.com/...",
  "isPublished": true,
  "metadata": {
    "seo_title": "KORSVAGEN - Costruzioni Edili",
    "seo_description": "Professional construction services"
  }
}
```

### Section Content Structure

```javascript
{
  "sectionId": "home-hero",
  "pageId": "page-uuid",
  "type": "hero",
  "title": "Hero Section",
  "content": {
    "title": "KORSVAGEN",
    "subtitle": "Costruzioni Edili di Qualità",
    "description": "Da oltre 20 anni...",
    "cta_text": "Scopri i progetti",
    "cta_link": "/progetti",
    "background_video": "/korsvagen-hero.mp4",
    "images": [
      {
        "cloudinaryId": "korsvagen/home/hero/image1",
        "url": "https://res.cloudinary.com/...",
        "alt": "Hero background"
      }
    ]
  },
  "orderIndex": 1,
  "isActive": true
}
```

### Media Structure

```javascript
{
  "cloudinaryId": "korsvagen/home/hero/12345",
  "url": "https://res.cloudinary.com/...",
  "secureUrl": "https://res.cloudinary.com/...",
  "format": "jpg",
  "resourceType": "image",
  "width": 1920,
  "height": 1080,
  "bytes": 1024000,
  "altText": "Hero background image",
  "folder": "korsvagen/home/hero",
  "tags": ["hero", "background"],
  "metadata": {
    "originalName": "hero-bg.jpg",
    "uploadedAt": "2025-01-14T19:30:00Z"
  }
}
```

## Database Management

### Migration Commands

```bash
npm run migrate         # Run all migrations
npm run migrate:status  # Check table status
npm run migrate:reset   # Reset database (⚠️ DELETES ALL DATA)
npm run db:backup      # Create JSON backup
npm run db:stats       # Show statistics
```

### Manual Database Operations

```javascript
// Check database health
GET /api/health

// Example response
{
  "success": true,
  "status": "healthy",
  "database": {
    "status": "healthy",
    "timestamp": "2025-01-14T19:30:00Z",
    "recordCount": 5
  }
}
```

## Cloudinary Configuration

### Folder Structure

```
korsvagen/
├── home/
│   ├── hero/
│   ├── services/
│   └── projects/
├── about/
│   ├── team/
│   └── history/
└── uploads/
    └── temporary/
```

### Automatic Transformations

- **Thumbnail**: 300x300, crop fill
- **Medium**: 800x600, crop limit
- **Large**: 1920x1080, crop limit
- **Hero**: 1920x1080, crop fill, center gravity

### Responsive URLs

```javascript
{
  "thumbnail": "https://res.cloudinary.com/.../c_fill,w_300,h_300/image.jpg",
  "medium": "https://res.cloudinary.com/.../c_limit,w_800,h_600/image.jpg",
  "large": "https://res.cloudinary.com/.../c_limit,w_1920,h_1080/image.jpg",
  "original": "https://res.cloudinary.com/.../image.jpg"
}
```

## Development Workflow

### 1. Content Creation

1. Create page: `POST /api/content/pages`
2. Add sections: `POST /api/content/sections`
3. Upload media: `POST /api/media/upload`
4. Update section content with media references
5. Publish page: `PUT /api/content/pages` with `isPublished: true`

### 2. Media Management

1. Upload files with organized folder structure
2. Add meaningful alt text and tags
3. Use responsive URLs in frontend
4. Clean up unused media periodically

### 3. Database Maintenance

1. Regular backups: `npm run db:backup > backup.json`
2. Monitor statistics: `npm run db:stats`
3. Check health: `GET /api/health`

## Troubleshooting

### Common Issues

**Database Connection Errors:**

- Check Supabase URL and keys in `.env`
- Verify network connectivity
- Check Supabase project status

**Upload Failures:**

- Verify Cloudinary credentials
- Check file size (max 50MB)
- Ensure supported file formats

**Authentication Issues:**

- Check JWT secret configuration
- Verify token expiration
- Ensure proper headers: `Authorization: Bearer <token>`

### Debug Commands

```bash
# Check migration status
npm run migrate:status

# View database stats
npm run db:stats

# Test API health
curl http://localhost:3000/api/health
```

## Production Deployment

### Environment Variables

Ensure all production environment variables are set in Vercel dashboard:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET`

### Performance Considerations

- Enable Supabase connection pooling
- Configure Cloudinary auto-optimization
- Set up proper CORS origins
- Monitor API response times

### Security Checklist

- [ ] Strong JWT secret in production
- [ ] Proper CORS configuration
- [ ] Supabase RLS policies (if needed)
- [ ] File upload size limits
- [ ] Rate limiting (if required)

## Support

For issues or questions:

1. Check this documentation
2. Review log files in `/logs/` directory
3. Check API response error messages
4. Verify environment configuration
