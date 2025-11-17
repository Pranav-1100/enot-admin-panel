# E° ENOT Admin Panel

A modern, feature-rich admin dashboard built with **Next.js 15**, **React 18**, and **Tailwind CSS** for managing a luxury perfume e-commerce platform.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8)

## 🚀 Features

### 📦 **Product Management**
- Complete CRUD operations for products, categories, brands, and tags
- Image upload with gallery support
- Product variants management
- Stock inventory tracking
- Bulk operations support

### 🛒 **Order Management**
- Order listing with advanced filters
- Order status tracking and updates
- Real-time order statistics
- Revenue analytics

### 👥 **User Management**
- User listing and status management
- Role-based access control (Admin/Seller)
- Customer reviews moderation

### ✍️ **Content Management (CMS)**
- Blog post creation and editing with **Rich Text Editor** (React Quill)
- Blog categories management
- Draft and publish workflow
- Featured posts support

### 🎨 **Site Configuration**
- Global site settings (name, tagline, contact info)
- Promotional banners with scheduling
- Footer sections and links management
- Social media links

### 🔐 **Authentication & Security**
- JWT token-based authentication
- Automatic token refresh
- Protected routes with role-based access
- Google OAuth integration support

### 📊 **Analytics & Monitoring**
- Dashboard with statistics and charts
- Revenue tracking
- Product and order analytics
- Activity logs

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.5.4 |
| **UI Library** | React 18.3.1 |
| **Styling** | Tailwind CSS 3.4.17 |
| **UI Components** | Headless UI, Hero Icons |
| **HTTP Client** | Axios 1.12.2 |
| **State Management** | React Context API |
| **Rich Text Editor** | React Quill 2.0.0 |
| **Charts** | Recharts 3.2.1 |
| **Form Handling** | React Hook Form 7.63.0 |
| **Notifications** | React Hot Toast 2.6.0 |

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **npm** or **yarn** or **pnpm**
- Backend API server running (default: http://localhost:3000)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd enot-admin-panel
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
```

### 4. Run the development server

```bash
npm run dev
```

The admin panel will be available at **http://localhost:3001**

### 5. Login

Use the demo credentials displayed on the login page:
- **Admin:** admin@enot.com / admin123
- **Seller:** seller@enot.com / seller123

## 📁 Project Structure

```
enot-admin-panel/
├── src/
│   ├── pages/               # Next.js pages and routes
│   │   ├── index.js         # Dashboard
│   │   ├── login.js         # Login page
│   │   ├── _app.js          # App wrapper with providers
│   │   ├── products/        # Product management pages
│   │   ├── blogs/           # Blog management pages
│   │   ├── orders/          # Order management pages
│   │   ├── users/           # User management pages
│   │   └── site-settings/   # Site configuration pages
│   │
│   ├── components/          # React components
│   │   ├── common/          # Shared components (Layout, Sidebar, Header)
│   │   ├── blogs/           # Blog-specific components
│   │   ├── products/        # Product-specific components
│   │   ├── forms/           # Form components
│   │   └── tables/          # Table components
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   └── useApi.js        # API data fetching hooks
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── api.js           # API client and endpoints
│   │   ├── auth.js          # Auth utilities
│   │   └── utils.js         # Helper functions
│   │
│   └── styles/              # Global styles
│       └── globals.css      # Tailwind imports and custom CSS
│
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 3001

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Utilities
npm run clean        # Remove build artifacts
npm run analyze      # Analyze bundle size
```

## 📡 API Integration

The admin panel connects to a backend API server. All API calls are centralized in `/src/lib/api.js`.

### API Endpoints

- **Auth:** `/auth/login`, `/auth/logout`, `/auth/me`
- **Products:** `/api/products`
- **Categories:** `/api/categories`
- **Brands:** `/api/brands`
- **Orders:** `/api/orders/admin/all`
- **Users:** `/api/admin/users`
- **Blogs:** `/api/admin/blogs`
- **Site Settings:** `/api/admin/site-settings`
- **And many more...**

See `/src/lib/api.js` for the complete list of endpoints.

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      // ...
    }
  }
}
```

### Adding New Routes

1. Create a new file in `/src/pages/`
2. Add navigation item in `/src/components/common/Sidebar.js`
3. Update permissions in `/src/lib/auth.js` if needed

## 🔐 Authentication

The app uses **JWT tokens** stored in localStorage:
- Access token for API requests
- Refresh token for automatic token renewal
- Automatic redirect to login on token expiry

## 🐛 Troubleshooting

### Common Issues

**1. API connection errors**
- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Ensure backend server is running

**2. Login fails**
- Verify credentials with backend
- Check browser console for errors

**3. Build errors**
- Clear `.next` folder: `npm run clean`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 📝 License

This project is for personal use.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Hero Icons](https://heroicons.com/)
- UI components from [Headless UI](https://headlessui.com/)

---

**Happy Coding! 🚀**
