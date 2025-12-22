# LabLinc Platform - Quick Reference

## 🎉 Status: Production Ready with Enhanced UI

**LabLinc** is a platform connecting MSMEs with research institutes for equipment sharing.

**Current Version**: 2.0.0 (Enhanced UI)  
**Status**: ✅ Production Ready with Complete Design System  
**Last Updated**: December 22, 2025

### What's Working
- ✅ Complete authentication system with dedicated login/signup pages
- ✅ Equipment listing and booking with enhanced UI
- ✅ Admin dashboard with analytics and inline creation forms
- ✅ Comprehensive notification system
- ✅ Image upload (Cloudinary) with optimized display
- ✅ Email notifications with invoice generation
- ✅ Full dark mode & theme system
- ✅ Review and rating system
- ✅ Complete design system with 200+ CSS design tokens
- ✅ Mobile-first responsive design
- ✅ WCAG AA accessibility compliance
- ✅ Performance optimizations and animations
- ✅ Enhanced admin panel with inline forms
- ✅ Sidebar filters for equipment catalogue
- ✅ Professional 404 page with navigation

### What Needs Configuration
- 🔧 Cloudinary API keys
- 🔧 Email SMTP credentials
- 🔧 Production database
- 🔧 Payment gateway (optional)

See `DEVELOPMENT_SUMMARY.md` for complete details.

---

## 🚀 Quick Start

### Start Backend

```bash
cd lablinc-backend
npm install  # First time only
npm start
```

**URL**: http://localhost:5000

For development with auto-reload:
```bash
npm run dev
```

### Start Frontend

```bash
cd lablinc-frontend
npm run dev
```

**URL**: http://localhost:5173

### Create Admin

```bash
cd lablinc-backend
node scripts/create-admin.js
```

## 📋 Test Accounts

### Admin

- Email: admin@lablinc.com
- Password: admin123
- Features:
  - User management with inline creation
  - Instrument management with inline creation
  - Booking management with inline creation
  - Analytics dashboard with CSV export
  - Partner applications review
  - Contact messages management

### Create Test Users

Register through the UI:

- MSME user (for booking equipment)
- Institute user (for listing equipment)

## 🔑 Key URLs

| Page          | URL                                 | Access        |
| ------------- | ----------------------------------- | ------------- |
| Home          | http://localhost:5173/              | Public        |
| Equipment     | http://localhost:5173/equipment     | Public        |
| Login         | http://localhost:5173/login         | Public        |
| Signup        | http://localhost:5173/signup        | Public        |
| Dashboard     | http://localhost:5173/dashboard     | Authenticated |
| Admin Panel   | http://localhost:5173/admin         | Admin only    |
| Notifications | http://localhost:5173/notifications | Authenticated |
| Partner       | http://localhost:5173/partner       | Public        |
| Contact       | http://localhost:5173/contact       | Public        |

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Authentication

```bash
# Register
POST /auth/register
Body: { name, email, password, role, phone, organization }

# Login
POST /auth/login
Body: { email, password }

# Get current user
GET /auth/me
Headers: { Authorization: "Bearer <token>" }
```

### Instruments

```bash
# List all
GET /instruments?search=&category=&location=&page=1&limit=10

# Get one
GET /instruments/:id

# Create (Institute only)
POST /instruments
Headers: { Authorization: "Bearer <token>" }
Body: { name, category, description, pricing, location, ... }
```

### Bookings

```bash
# Create booking (MSME only)
POST /bookings
Headers: { Authorization: "Bearer <token>" }
Body: { instrumentId, startDate, endDate, notes }

# List my bookings
GET /bookings
Headers: { Authorization: "Bearer <token>" }

# Update status (Institute only)
PATCH /bookings/:id/status
Body: { status: "confirmed" | "rejected" | "completed" }

# Download invoice
GET /bookings/:id/invoice
```

### Notifications

```bash
# Get notifications
GET /notifications
Headers: { Authorization: "Bearer <token>" }

# Get unread count
GET /notifications/unread-count

# Mark as read
PATCH /notifications/:id/read
```

## 🎨 UI Components & Design System

### Design Tokens
The platform uses a comprehensive design system with 200+ CSS custom properties:

```css
/* Colors */
--color-primary: #3b82f6;
--color-secondary: #10b981;
--color-text-primary: #1f2937;

/* Spacing */
--space-1: 0.25rem;
--space-4: 1rem;
--space-8: 2rem;

/* Typography */
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
```

### Theme System
```javascript
import { useTheme } from './contexts/ThemeContext';

const { theme, toggleTheme, setTheme } = useTheme();
// Supports: 'light', 'dark', 'auto'
```

### Toast Notifications

```javascript
import { useToastContext } from "./context/ToastContext";

const toast = useToastContext();
toast.success("Success message");
toast.error("Error message");
toast.warning("Warning message");
toast.info("Info message");
```

### Loading Spinner

```javascript
import LoadingSpinner from './components/ui/LoadingSpinner';

<LoadingSpinner size="medium" message="Loading..." />
<LoadingSpinner fullScreen message="Processing..." />
```

### Confirmation Dialog

```javascript
import ConfirmDialog from "./components/ui/ConfirmDialog";

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Confirm Delete"
  message="Are you sure?"
  type="danger"
/>;
```

### Enhanced Input

```javascript
import Input from "./components/ui/Input";

<Input
  label="Email"
  type="email"
  error={errors.email}
  helperText="Enter your email"
  required
/>;
```

## 🛠️ Utilities

### Validation

```javascript
import { validators, validateForm } from "./utils/validation";

// Single field
const error = validators.email(value);

// Form validation
const { isValid, errors } = validateForm(formData, {
  email: [validators.email],
  password: [validators.password],
});
```

### Formatting

```javascript
import { formatCurrency, formatDate, formatPhone } from "./utils/formatters";

formatCurrency(1234); // ₹1,234
formatDate(new Date()); // Nov 26, 2025
formatPhone("9876543210"); // +91 98765 43210
```

## 📁 Project Structure

```
lablinc/
├── lablinc-backend/          # Node.js API
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Auth, validation
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helpers
│   └── scripts/              # Utility scripts
│
├── lablinc-frontend/         # React SPA
│   ├── src/
│   │   ├── api/              # API clients
│   │   ├── components/       # React components
│   │   ├── context/          # Context providers
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Routing
│   │   └── utils/            # Utilities
│   └── public/               # Static files
│

```

## 🔒 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lablinc
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Common Issues

### Backend won't start

- Check MongoDB is running
- Verify .env file exists
- Check port 5000 is available

### Frontend won't start

- Check node_modules installed (`npm install`)
- Verify .env file exists
- Check port 5173 is available

### Can't login

- Check backend is running
- Verify credentials are correct
- Check browser console for errors

### Images not loading

- Check uploads folder exists
- Verify file permissions
- Check file size limits

## 📊 Database Collections

- **users** - User accounts (MSME, Institute, Admin)
- **instruments** - Equipment listings
- **bookings** - Booking requests and history
- **notifications** - User notifications
- **partners** - Partner applications
- **contacts** - Contact messages

## 🎯 Recent Enhancements (v2.0.0)

### Design System Implementation
- ✅ 200+ CSS design tokens for consistent styling
- ✅ Complete component library with standardized variants
- ✅ Mobile-first responsive design with 6-tier breakpoint system
- ✅ WCAG AA accessibility compliance
- ✅ Enhanced focus management and keyboard navigation

### UI/UX Improvements
- ✅ Dedicated login/signup pages (no more modals)
- ✅ Sidebar filters for equipment catalogue
- ✅ Inline creation forms in admin panel
- ✅ Professional 404 page with auto-redirect
- ✅ Enhanced dashboard with role-specific layouts
- ✅ Improved notification system with bell indicator

### Theme & Accessibility
- ✅ Complete dark mode implementation
- ✅ Theme toggle in navigation
- ✅ Enhanced color contrast for better readability
- ✅ Improved focus indicators and keyboard navigation
- ✅ Screen reader optimizations

### Performance & Animation
- ✅ Optimized animations with reduced motion support
- ✅ CSS and image optimization
- ✅ Enhanced loading states and error handling
- ✅ Performance monitoring components

## 🎯 User Roles

### MSME

- Browse equipment with sidebar filters
- Create bookings with enhanced forms
- View booking history with improved UI
- Download invoices with professional design
- Receive notifications with bell indicator
- Access dedicated dashboard

### Institute

- List equipment with enhanced forms
- Manage bookings (approve/reject/complete)
- View analytics with visual charts
- Receive notifications
- Access institute-specific dashboard

### Admin

- Platform oversight with comprehensive analytics
- User management with inline creation forms
- Equipment management with inline creation forms
- Booking management with inline creation forms
- View detailed analytics with CSV export
- Review partner applications
- Manage contact messages
- Access to all platform features

## 📈 Performance Tips

### Backend

- Use indexes on frequently queried fields
- Implement caching for static data
- Optimize database queries
- Use pagination for large datasets

### Frontend

- Lazy load routes
- Optimize images
- Use code splitting
- Minimize bundle size
- Cache API responses

## 🔐 Security Checklist

- [x] JWT authentication
- [x] Password hashing
- [x] Input sanitization
- [x] Rate limiting
- [x] CORS configuration
- [x] Helmet security headers
- [x] File upload validation
- [x] XSS prevention
- [x] SQL injection prevention

## 📚 Additional Scripts

### Backend Utility Scripts
```bash
cd lablinc-backend

# Create admin user
npm run create-admin

# Reset admin password
npm run reset-admin

# Reset database indexes
npm run reset-indexes

# Seed VTU equipment data
npm run seed-vtu

# Update VTU user
npm run update-vtu-user
```

## 🆘 Support

For issues or questions:

1. Check documentation
2. Review error logs
3. Check browser console
4. Verify environment variables
5. Test API endpoints directly

**Version**: 2.0.0 (Enhanced UI)  
**Status**: ✅ Production Ready with Complete Design System  
**Last Updated**: December 22, 2025

---

## 📖 Documentation

- **Frontend Task Progress**: See `FRONTEND-TASK.md` for detailed UI enhancement tasks
- **Design System Progress**: See `DESIGN_SYSTEM_PROGRESS.md` for component migration status
- **UI Audit Report**: See `FRONTEND_UI_AUDIT_REPORT.md` for comprehensive UI analysis
- **Development Summary**: See `DEVELOPMENT_SUMMARY.md` for complete overview
- **Project Analysis**: See `PROJECT_ANALYSIS.md` for architecture details

## 🚀 Deployment

Ready to deploy! See deployment checklist in `dev-task.md`.

**Quick Deploy Steps**:
1. Set up MongoDB Atlas database
2. Configure Cloudinary account
3. Set up email service (Gmail/SendGrid)
4. Deploy backend (Railway/Heroku)
5. Deploy frontend (Vercel/Netlify)
6. Configure environment variables
7. Test production deployment
