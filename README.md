# Leave Tracking App

A modern, intuitive web application for managing holidays, vacations, and leave planning with calendar integration.

## 🎯 Purpose

Streamline leave management by providing a centralized platform to track holidays, plan vacations, and visualize time off on an interactive calendar. Perfect for individuals and teams to plan long weekends and optimize vacation time.

## ✨ Features

### 📅 Calendar & Holidays
- **Interactive Calendar**: Monthly, weekly, and daily views with event display
- **Smart Navigation**: Click on vacation dates to navigate calendar to that month
- **Official Holidays**: Integration with official Indian holidays database via API
- **Event Display**: Visual representation of all time off on calendar
- **Custom Toolbar**: Modern calendar controls with month display and view switching

### 🏖️ Holiday Management
- **Add Holidays**: Create custom holidays with name and date on single line
- **Delete Holidays**: Remove holidays with trash button
- **Official Indian Holidays**: Compact tab for official holidays from API
- **Real-time Updates**: Changes reflect immediately on calendar
- **Compact Layout**: Holiday name, date, and add button all on one line

### ✈️ Vacation Planning
- **Multi-day Vacations**: Plan vacations with start and end dates
- **Smart Date Handling**: Auto-focus end date, prevent past dates, auto-navigate to start month
- **Leave Type Integration**: Select EL, SL, or CL with automatic balance deduction
- **Calendar Integration**: Vacations span multiple days on calendar
- **Minimalistic Form**: Clean, modern vacation request interface

### 🎯 Vacation Planner (Right Panel)
- **Leave Balance Management**: Editable EL, SL, CL balances with real-time updates
- **Long Weekend Opportunities**: Highlights future holidays on Monday/Friday for extended time off
- **Planned Vacations**: Overview of all scheduled vacations with clickable dates
- **Quick Stats**: Enhanced statistics with historical data and insights
- **Historical Data**: Leave balance history, vacation patterns, and time insights

### 🔐 Authentication & User Management
- **Secure Login/Register**: JWT-based authentication system
- **User Profiles**: Personal leave balances and vacation data
- **Data Isolation**: Each user sees only their own information
- **Session Management**: Persistent login with secure token storage

## 🛠️ Technical Stack

- **Frontend**: React.js with modern hooks (useState, useEffect, useContext, useRef)
- **Styling**: Tailwind CSS + custom inline styles
- **Icons**: Lucide React for consistent iconography
- **Calendar**: React Big Calendar with custom navigation
- **Font**: Roboto for clean, readable typography
- **Backend**: Node.js/Express with MongoDB Atlas
- **State Management**: Centralized state with prop synchronization
- **Date Handling**: date-fns for smart date operations

## 🏗️ **Hosting Architecture**

### **Current Deployment Strategy:**
- **Frontend**: Vercel (auto-deploying, optimized for React apps)
- **Backend**: Render (free tier, persistent connections for MongoDB)
- **Database**: MongoDB Atlas (cloud database, fully functional)

### **Why Render for Backend?**
- ✅ **Persistent Connections** - Better for MongoDB Atlas integration
- ✅ **Multi-User Support** - Handles 10-20 concurrent users efficiently
- ✅ **Free Tier Available** - No cost for hosting
- ✅ **Reliable Performance** - No cold start issues like serverless platforms
- ✅ **MongoDB Compatibility** - Stable connections for database operations

### **Why Vercel for Frontend?**
- ✅ **Auto-Deployment** - Automatic updates on GitHub commits
- ✅ **React Optimization** - Built specifically for React applications
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Build Optimization** - Automatic optimization and compression

## 📁 File Structure

```
leave-tracking-frontend/
├── public/
│   ├── index.html              # Main HTML template with Roboto font
│   ├── favicon.ico             # App icon
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
├── src/
│   ├── App.js                  # Main React component with centralized state
│   ├── App.css                 # Basic app styles
│   ├── index.js                # React entry point
│   ├── index.css               # Global styles and Tailwind CSS
│   ├── calendar-tailwind.css   # Calendar component overrides
│   ├── components/
│   │   ├── Calendar.js         # Interactive calendar with navigation
│   │   ├── HolidayManagement.js # Holiday management with compact form
│   │   ├── VacationForm.js     # Smart vacation request form
│   │   └── VacationPlanner.js  # Leave balances and planning insights
│   ├── contexts/
│   │   └── AuthContext.js      # Authentication state management
│   ├── service-worker.js       # PWA service worker
│   └── serviceWorkerRegistration.js # Service worker registration
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # Project documentation
```

## 🔌 API Endpoints (FULLY IMPLEMENTED & WORKING!) ✅

The app is fully integrated with a Node.js/Express backend. All API endpoints are working:

### Holidays API ✅
- `GET /holidays` - Fetch all holidays
- `POST /holidays` - Create new holiday
- `DELETE /holidays/:id` - Remove holiday
- `GET /holidays/official` - Fetch official Indian holidays from external API

### Vacations API ✅
- `GET /vacations` - Fetch all vacations (user-specific or global)
- `POST /vacations` - Create new vacation with leave type
- `PUT /vacations/:id` - Update vacation
- `DELETE /vacations/:id` - Remove vacation

### Leave Balances API ✅
- `GET /leave-balances` - Fetch leave balances (user-specific or global)
- `PUT /leave-balances/:leaveType` - Update leave balance (EL, SL, CL)

### Authentication API ✅
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/profile` - User profile data

## 🔧 Component Architecture

### Main Components
- **App.js**: Main container with centralized state management and authentication
- **Calendar**: React Big Calendar with custom navigation and date synchronization
- **HolidayManagement**: Holiday management with compact single-line form (memoized for performance)
- **VacationForm**: Smart vacation request form with date validation
- **VacationPlanner**: Right panel with leave balances, planning insights, and historical data

### Performance Optimizations (Latest)
- **React.memo**: HolidayManagement and NationalHolidays wrapped to prevent unnecessary re-renders
- **useCallback**: Holiday operations (add/delete) memoized for stable function references
- **useMemo**: Holiday filtering and sorting optimized with memoized computations
- **Reduced Re-renders**: Components only update when props actually change
- **Optimized State Updates**: More efficient React rendering and state management

### Authentication Components
- **AuthContext**: Global authentication state management with JWT
- **Login**: User login form with validation
- **Register**: User registration form with email validation
- **Protected Routes**: App only accessible to authenticated users

### State Management
- **Centralized State**: Leave balances managed in App.js and synchronized to components
- **Prop Synchronization**: Child components sync with parent state when not editing
- **Calendar Navigation**: External date navigation with internal state synchronization
- **Real-time Updates**: All changes update calendar and components immediately

## 🚀 Getting Started

### **Prerequisites:**
- Node.js installed
- MongoDB Atlas account (for cloud database)
- Git for version control

### **1. Backend Setup**
```bash
cd leave-tracking-backend
npm install
# Create .env file with your MongoDB connection string
echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/test?retryWrites=true&w=majority" > .env
echo "JWT_SECRET=your-secret-key-change-in-production" >> .env
npm start
```

### **2. Frontend Setup**
```bash
cd leave-tracking-frontend
npm install
npm start
```

### **3. Access Application**
- **Frontend**: Open `http://localhost:3000`
- **Backend**: Running on `http://localhost:8000`
- **Database**: MongoDB Atlas cloud (fully working)

### **4. Test Features**
- ✅ Add/remove holidays with compact form
- ✅ Plan vacations with smart date handling
- ✅ Edit leave balances (EL, SL, CL) with real-time updates
- ✅ Navigate calendar by clicking on vacation dates
- ✅ View long weekend opportunities for future dates
- ✅ Access historical data and insights
- ✅ All data persists in MongoDB cloud

### **5. Test Authentication**
- ✅ Create user account (register)
- ✅ Login with credentials
- ✅ Access user-specific data
- ✅ Test logout functionality

## 🚨 Troubleshooting

### **Can't Add Vacations/Holidays?**
**Problem**: Backend connection issues or missing MongoDB setup
**Solutions**: 
1. **Use Local Backend**: `cd leave-tracking-backend && npm start` (Recommended for development)
2. **Check MongoDB**: Ensure MongoDB connection string is set in `.env` file
3. **Check Ports**: Ensure ports 8000 (backend) and 3000 (frontend) are available
4. **Use Startup Script**: Run `./start-app.sh` from the root directory

### **Backend Deployment Issues?**
**Problem**: Vercel backend failing with MongoDB connection errors
**Solution**: 
- **Use Render Backend** - Better for persistent MongoDB connections
- **MongoDB Atlas** - Cloud database works perfectly with Render
- **Free Hosting** - Render provides free tier for backend hosting

### **Why Not Vercel Backend?**
- ❌ **Serverless Limitations** - Cold starts, connection timeouts
- ❌ **MongoDB Issues** - Connection pooling problems in serverless environment
- ❌ **Multi-User Support** - Not ideal for 10-20 concurrent users
- ✅ **Render Alternative** - Persistent connections, better MongoDB support

### **API Connection Issues**
- **Frontend**: Runs on localhost:3000
- **Backend**: Runs on localhost:8000
- **Database**: MongoDB Atlas (cloud) - FULLY WORKING ✅
- **Status**: Both servers need to be running locally for full functionality

### **Quick Fix Steps**
1. Create `.env` file in `leave-tracking-backend/` directory with your MongoDB connection string
2. Run `./start-app.sh` from the root directory
3. Or manually start both servers in separate terminals

## 📱 User Interface

- **Clean Two-Column Layout**: Left for calendar/holidays, right for vacation planning
- **Responsive Design**: Optimized for desktop and tablet use
- **Modern UI**: Rounded corners, subtle shadows, and consistent spacing
- **Color Coding**: Blue for holidays, green for vacations, red for delete actions
- **Compact Forms**: Single-line layouts for better space utilization
- **Smart Navigation**: Click dates to navigate calendar to specific months

## 🔧 Key Functions

- **Add/Remove Holidays**: Compact form with date picker on single line
- **Add/Remove Vacations**: Smart form with auto-focus, date validation, and leave type selection
- **Calendar Navigation**: Month navigation with external date synchronization
- **Leave Balance Management**: Editable EL, SL, CL balances with real-time updates
- **Smart Filtering**: Automatic detection of future Monday/Friday holidays
- **Duration Calculation**: Automatic vacation length computation
- **Real-time Sync**: All changes update calendar immediately
- **Historical Data**: Leave usage patterns and time insights

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interface with reduced spacing
- **Functional**: Every element serves a purpose
- **Consistent**: Uniform styling and spacing throughout
- **Accessible**: Clear labels and intuitive interactions
- **Modern**: Contemporary design with subtle animations and hover effects

## 🎉 **CURRENT STATUS: FULLY FUNCTIONAL WITH ENHANCED FEATURES!** ✅

### **What's Working Now:**
- ✅ **Backend API Integration** - Express.js server running on port 8000
- ✅ **MongoDB Atlas Cloud Database** - All data persisting in the cloud
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete for all features
- ✅ **Real-time Data Sync** - Frontend and backend fully synchronized
- ✅ **All Core Features** - Holidays, Vacations, Leave Balances, Teams
- ✅ **User Authentication System** - JWT-based secure authentication
- ✅ **Multi-User Support** - Each user has their own isolated data
- ✅ **Professional UI** - Modern login/register forms with validation
- ✅ **Smart Date Handling** - Auto-focus, validation, and month navigation
- ✅ **Leave Balance System** - Editable balances with automatic deduction
- ✅ **Calendar Navigation** - Click dates to navigate to specific months
- ✅ **Historical Data** - Leave usage patterns and insights
- ✅ **Compact UI** - Reduced spacing and single-line forms

### **Database Collections Working:**
- ✅ **`holidays`** - Full holiday management with API integration
- ✅ **`vacations`** - Vacation planning with leave type integration
- ✅ **`leavebalances`** - EL, SL, CL balance management with real-time updates
- ✅ **`teams`** - Team structure and management
- ✅ **`users`** - User accounts with secure password hashing

### **Authentication Features:**
- ✅ **User Registration** - Name, email, password with validation
- ✅ **User Login** - Secure JWT token authentication
- ✅ **Password Security** - bcrypt hashing with salt
- ✅ **Email Validation** - Real-time format validation
- ✅ **Session Management** - Persistent login with localStorage
- ✅ **User Isolation** - Each user sees only their own data

### **Recent Major Improvements (Today):**
- ✅ **Calendar Navigation Fix** - Click vacation dates to navigate calendar
- ✅ **Leave Balance Editing** - Real-time editable EL, SL, CL balances
- ✅ **Smart Date Handling** - Auto-focus, validation, and month navigation
- ✅ **Compact UI** - Reduced spacing and single-line forms
- ✅ **Historical Data** - Leave usage patterns and insights
- ✅ **Long Weekend Filtering** - Only future dates shown
- ✅ **API Integration** - Official Indian holidays from external API
- ✅ **State Synchronization** - Proper parent-child component communication
- ✅ **Git Sync** - Complete synchronization with GitHub repositories
- ✅ **Vercel Deployment** - Frontend successfully deployed and auto-deploying
- ✅ **Performance Optimization** - React.memo, useCallback, and useMemo implementation
- ✅ **Component Memoization** - HolidayManagement and NationalHolidays wrapped in memo
- ✅ **Reduced Re-renders** - Components only update when props actually change
- ✅ **Faster Operations** - Holiday add/delete operations now much more responsive
- ✅ **Build Optimization** - ESLint errors resolved, clean production builds

### **Strategic Infrastructure Decisions:**
- ✅ **Render Backend** - Switched from Vercel backend for better MongoDB support
- ✅ **Persistent Connections** - Solved MongoDB connection issues
- ✅ **Multi-User Architecture** - Designed for 10-20 concurrent users
- ✅ **Free Hosting Solution** - Render free tier for backend, Vercel for frontend

## 🔮 Future Enhancements

### **Authentication & Security:**
- 🔐 **Google OAuth Integration** - "Sign in with Google" functionality
- 🔐 **Social Login** - Facebook, GitHub, Microsoft authentication
- 🔐 **Password Reset** - Forgot password functionality
- 🔐 **Email Verification** - Confirm email addresses
- 🔐 **Two-Factor Authentication** - Enhanced security

### **Features:**
- 👥 **Team collaboration features** - Multi-user team management
- 📋 **Leave request workflows** - Approval processes
- 📅 **Calendar export functionality** - iCal, Google Calendar integration
- 📱 **Mobile app version** - React Native or PWA
- 🔔 **Notifications** - Email and push notifications
- 📊 **Reporting & Analytics** - Leave usage reports

## 🚀 Next Steps (Planned)

### 1. 🔐 **Google OAuth Integration** (Planned)
- **Setup**: Google Cloud Console OAuth 2.0 credentials
- **Implementation**: Add "Sign in with Google" button
- **Integration**: Hybrid authentication (email/password + Google)
- **Status**: Ready to implement when needed

### 2. 🚨 **Vercel Backend Deployment** (Optional)
- **Current Issue**: Vercel backend has deployment protection enabled
- **Alternative**: Continue using local backend with MongoDB Atlas
- **Status**: Local backend working perfectly with cloud database

### 3. 🔐 User Authentication System
- **User Registration & Login**: Secure email/password authentication
- **JWT Token Management**: Secure session handling
- **User Profiles**: Personal leave balances and preferences
- **Protected Routes**: Secure access to app features
- **Password Security**: Encrypted password storage and recovery

### 4. ☁️ Cloud Database Integration
- **MongoDB Atlas Setup**: Cloud database for production
- **Data Persistence**: User data saved across sessions
- **Multi-user Support**: Each user has their own data
- **Backup & Recovery**: Automated data backup systems
- **Scalability**: Handle multiple users and teams

### 5. 🎯 Additional Features
- **Team Management**: Create and manage team structures
- **Leave Approvals**: Workflow for leave requests
- **Notifications**: Email/calendar reminders
- **Reporting**: Leave analytics and reports
- **API Integration**: Connect with HR systems

## 📝 License

This project is open source and available under the MIT License.

## 🔄 **Deployment & Version Control Status**

### **GitHub Sync Status:**
- ✅ **Backend Repository**: `sanil-git/leave-tracking-backend` - Fully synced
- ✅ **Frontend Repository**: `sanil-git/leave-tracking-frontend` - Fully synced
- ✅ **Local Cursor Code**: Latest version with all improvements
- ✅ **Merge Conflicts**: Resolved by keeping local Cursor version
- ✅ **Git Workflow**: Cursor → GitHub → Vercel sequence established

### **Deployment Workflow:**
1. **Development**: Code changes in Cursor (local)
2. **Version Control**: Commit and push to GitHub
3. **Frontend Deploy**: Vercel auto-deploys frontend changes
4. **Backend Deploy**: Render backend (separate from Vercel)
5. **Database**: MongoDB Atlas (cloud, always accessible)

### **Current Hosting Status:**
- ✅ **Frontend (Vercel)**: Auto-deploying, fully functional
- ✅ **Backend (Render)**: Free tier, persistent connections
- ✅ **Database (MongoDB Atlas)**: Cloud database, reliable performance
- ✅ **Multi-User Support**: 10-20 concurrent users supported

### **Vercel Deployment Status:**
- ✅ **Frontend**: Successfully deployed and auto-deploying on commits
- ✅ **Backend**: Local development (MongoDB Atlas cloud database)
- ✅ **Auto-deployment**: Working correctly after ESLint fixes
- ✅ **Build Status**: All builds successful

### **Current Development Workflow:**
1. **Develop in Cursor** - Make changes and test locally
2. **Commit to GitHub** - Push changes to remote repositories
3. **Auto-deploy to Vercel** - Frontend automatically updates
4. **Backend remains local** - Using MongoDB Atlas for cloud database

### **Environment Configuration:**
- **Frontend**: React app with Tailwind CSS
- **Backend**: Node.js/Express with MongoDB Atlas
- **Database**: MongoDB Atlas cloud (fully functional)
- **Authentication**: JWT-based with secure password hashing
- **Ports**: Frontend (3000), Backend (8000)
