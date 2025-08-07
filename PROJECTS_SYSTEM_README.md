# KORSVAGEN - Dynamic Projects System

## Overview

This document describes the complete implementation of the dynamic projects system for KORSVAGEN's website. The system replaces the static project data with a fully dynamic, database-driven solution that includes:

- Complete CRUD management from admin dashboard
- Advanced image gallery system with Cloudinary integration
- Public frontend with filtering and search capabilities
- SEO-friendly URLs and metadata
- Responsive design for all devices

## 🏗️ Architecture

### Frontend Components
```
client/src/
├── components/ProjectsManager/
│   ├── ProjectsManager.tsx      # Main admin interface
│   ├── ProjectCard.tsx          # Individual project card
│   ├── ProjectForm.tsx          # Create/edit form
│   └── ImageGalleryManager.tsx  # Advanced image management
├── hooks/
│   └── useProjects.ts           # Projects data management hook
└── pages/
    ├── ProjectsPage.tsx         # Public projects listing
    ├── ProjectDetailPage.tsx    # Public project details
    └── ProjectsManagement.tsx   # Admin projects management
```

### Backend API
```
server/routes/projects.js        # Complete API endpoints
server/index.js                  # Route registration
```

### Database Schema
```
database/projects-schema.sql     # Complete database schema
migrate-projects.js              # Migration script
EXECUTE_PROJECTS_SQL.sql        # Execution script
```

## 🚀 Getting Started

### 1. Database Setup

First, apply the database schema:

```bash
# In Supabase SQL Editor, run:
\i database/projects-schema.sql

# Or execute the prepared script:
# Copy and paste EXECUTE_PROJECTS_SQL.sql content in Supabase
```

### 2. Environment Variables

Ensure these variables are set in your `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

API_BASE_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret
```

### 3. Migrate Existing Data

Run the migration script to populate the database with sample projects:

```bash
# Basic migration
npm run migrate:projects

# Force migration (if projects already exist)
npm run migrate:projects:force

# Or directly
node migrate-projects.js --help
```

### 4. Start the Application

```bash
# Start backend
cd server && npm run dev

# Start frontend (in another terminal)
cd client && npm start
```

### 5. Access the System

- **Admin Dashboard**: http://localhost:3000/dashboard/projects
- **Public Projects**: http://localhost:3000/progetti
- **Individual Project**: http://localhost:3000/progetti/[id]

## 📊 Database Schema

### Projects Table
```sql
projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    year INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('Completato', 'In corso', 'Progettazione'),
    label VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    client VARCHAR(255),
    surface VARCHAR(100),
    budget VARCHAR(100),
    duration VARCHAR(100),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

### Project Images Table
```sql
project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    alt_text VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_cover BOOLEAN DEFAULT false,
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE
)
```

### Project Labels Table
```sql
project_labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE
)
```

## 🎨 Features

### Admin Dashboard Features
- ✅ **Complete Project Management**: Create, read, update, delete projects
- ✅ **Advanced Image Gallery**: Upload, reorder, set cover images
- ✅ **Bulk Operations**: Select multiple projects for batch actions
- ✅ **Rich Project Data**: Comprehensive project information and metadata
- ✅ **Search and Filtering**: Find projects quickly
- ✅ **Drag & Drop Upload**: Easy image management
- ✅ **Real-time Preview**: See changes immediately

### Public Frontend Features
- ✅ **Dynamic Project Listing**: Auto-populated from database
- ✅ **Category Filtering**: Filter by project type
- ✅ **Responsive Design**: Perfect on all devices
- ✅ **SEO Optimized**: Clean URLs and meta tags
- ✅ **Image Galleries**: Beautiful project showcases
- ✅ **Loading States**: Professional user experience

### Technical Features
- ✅ **TypeScript Support**: Full type safety
- ✅ **Error Handling**: Robust error management
- ✅ **Performance Optimized**: Fast loading and caching
- ✅ **Cloudinary Integration**: Optimized image delivery
- ✅ **Database Views**: Optimized queries
- ✅ **API Validation**: Secure data handling

## 🔧 API Endpoints

### Public APIs
```
GET /api/projects                    # List active projects
GET /api/projects/:idOrSlug         # Get project details  
GET /api/projects/labels            # Get available labels
```

### Admin APIs
```
GET /api/projects/admin             # List all projects
POST /api/projects/admin            # Create project
GET /api/projects/admin/:id         # Get project for editing
PUT /api/projects/admin/:id         # Update project
DELETE /api/projects/admin/:id      # Delete project
PUT /api/projects/admin/reorder     # Reorder projects

# Image Management
POST /api/projects/admin/:id/images                    # Upload images
PUT /api/projects/admin/:id/images/:imageId           # Update image
DELETE /api/projects/admin/:id/images/:imageId        # Delete image
PUT /api/projects/admin/:id/images/:imageId/cover     # Set cover image
PUT /api/projects/admin/:id/images/reorder            # Reorder images
```

## 🎯 Usage Examples

### Creating a New Project

1. Go to `/dashboard/projects`
2. Click "Nuovo Progetto"
3. Fill in the form with project details
4. Add features using the dynamic list
5. Set project status and visibility
6. Save the project
7. Use "Gestisci Immagini" to add photos

### Managing Images

1. Click "Gestisci Immagini" on any project card
2. Drag & drop multiple images or click to select
3. Edit image titles and alt text
4. Reorder images using up/down arrows
5. Set a cover image using the star button
6. Delete unwanted images

### Filtering Projects (Frontend)

1. Visit `/progetti`
2. Use the filter tabs to show specific categories
3. Click on any project to see full details
4. Browse the image gallery and view full-size images

## 🔍 Troubleshooting

### Common Issues

**1. Migration Fails**
```bash
# Check database connection
node -e "console.log(process.env.SUPABASE_URL)"

# Ensure schema is applied first
# Run EXECUTE_PROJECTS_SQL.sql in Supabase
```

**2. Images Not Uploading**
```bash
# Check Cloudinary configuration
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"

# Verify file size limits (10MB max)
# Check file format (JPG, PNG, WEBP only)
```

**3. Projects Not Loading on Frontend**
```bash
# Check API connection
curl http://localhost:3001/api/projects

# Verify is_active flag in database
# Check browser console for errors
```

**4. Admin Dashboard Access**
```bash
# Ensure user is authenticated
# Check JWT token validity
# Verify admin role permissions
```

### Database Maintenance

```sql
-- Check project count
SELECT COUNT(*) FROM projects;

-- List projects with image counts  
SELECT p.title, COUNT(pi.id) as image_count 
FROM projects p 
LEFT JOIN project_images pi ON p.id = pi.project_id 
GROUP BY p.id, p.title;

-- Find projects without cover images
SELECT p.title FROM projects p 
LEFT JOIN project_images pi ON (p.id = pi.project_id AND pi.is_cover = true)
WHERE pi.id IS NULL;

-- Reset display order
UPDATE projects SET display_order = id;
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Advanced Drag & Drop**: Full drag-and-drop reordering
- [ ] **Bulk Image Operations**: Multi-select image management  
- [ ] **Project Templates**: Reusable project structures
- [ ] **Advanced Analytics**: Project view statistics
- [ ] **Social Sharing**: Share projects on social media
- [ ] **PDF Export**: Generate project brochures
- [ ] **Client Portal**: Client-specific project access
- [ ] **Project Timeline**: Gantt charts and milestones

### Performance Optimizations
- [ ] **Image Lazy Loading**: Progressive image loading
- [ ] **Infinite Scroll**: Load projects on demand
- [ ] **CDN Integration**: Global image delivery
- [ ] **Database Indexing**: Optimized query performance
- [ ] **Caching Layer**: Redis cache integration

### SEO Enhancements
- [ ] **Structured Data**: Rich snippets for Google
- [ ] **XML Sitemap**: Automatic sitemap generation
- [ ] **Open Graph**: Better social media previews
- [ ] **Schema Markup**: Enhanced search results

## 📞 Support

For technical support or questions about the projects system:

1. Check this documentation first
2. Review the code comments in the source files
3. Check the browser console for error messages
4. Verify database schema and data integrity
5. Test API endpoints directly with curl or Postman

## 🎉 Conclusion

The dynamic projects system provides a complete, professional solution for managing and displaying construction projects. It combines powerful admin tools with a beautiful public interface, all built with modern web technologies and best practices.

The system is designed to be maintainable, scalable, and user-friendly, providing an excellent foundation for KORSVAGEN's digital presence.