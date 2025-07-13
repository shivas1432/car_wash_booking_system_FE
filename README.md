# 🚗 Car Wash Booking App
**Frontend Application**

```
┌─────────────────────────────────────────┐
│  🚧 Status: Under Maintenance           │
│  🎯 React 18 • Firebase • Socket.io    │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open in browser
http://localhost:3000
```

## 🛠️ Built With

```
React 18                 ⚛️  Modern UI framework
React Router DOM v6      🛣️  Client-side routing
Firebase                 🔥  Authentication & hosting
Axios                    📡  HTTP client
Socket.io-client         🔌  Real-time communication
Date-fns                 📅  Date utilities
```

## ✨ What's Inside

### 🔐 Authentication
- User registration & login
- Google OAuth integration
- Auto-logout on token expiration
- Protected route access

### 🚙 Booking System
- Schedule car wash appointments
- View booking history
- Real-time availability

### 👤 User Features
- Personal profile management
- Profile picture upload
- Loyalty tracking

### 🎁 Business Features
- Special offers display
- Opening hours information
- Admin dashboard

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── css/               # Styling files
├── App.js             # Main application component
└── index.js           # Application entry point
```

## 🛣️ Application Routes

### Public Access
```
/                       🏠 Landing page
/login                  🔑 User login
/register               📝 User registration
/homepage               🎯 Call to action
/offers                 🎁 Current offers
/opening-times          🕐 Business hours
```

### Authenticated Users
```
/profile                👤 User profile
/booking                📅 Book service
/my-bookings            📋 Booking history
```

### Admin Only
```
/admin                  ⚙️ Admin dashboard
```

## 🔧 Configuration

### Development
No environment variables needed for basic development.

### Production
Configure Firebase settings through Firebase Console:
- Authentication providers
- Database rules
- Hosting settings

## 🌐 Backend Integration

Compatible with backend server at `http://localhost:5000`

**Requirements:**
- CORS enabled for `http://localhost:3000`
- Cookie credentials configured
- Matching API endpoints

## 📱 Features Overview

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   Authentication    │  │   Booking System    │  │   Admin Features    │
│                     │  │                     │  │                     │
│ • Login/Register    │  │ • Schedule wash     │  │ • User management   │
│ • Google OAuth      │  │ • View history      │  │ • Booking oversight │
│ • Auto-logout       │  │ • Real-time slots   │  │ • Analytics         │
│ • Protected routes  │  │ • Loyalty points    │  │ • Settings          │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```


**Note**: This project is actively maintained. Check the issues page for current development status.
