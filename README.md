# Leave Tracking App

A modern, intuitive web application for managing holidays, vacations, and leave planning with calendar integration.

## 🎯 Purpose

Streamline leave management by providing a centralized platform to track holidays, plan vacations, and visualize time off on an interactive calendar. Perfect for individuals and teams to plan long weekends and optimize vacation time.

## ✨ Features

### 📅 Calendar & Holidays
- **Interactive Calendar**: Monthly view with event display
- **Navigation**: Easy month-to-month navigation with Today/Previous/Next controls
- **Official Holidays**: Integration with official Indian holidays database
- **Event Display**: Visual representation of all time off on calendar

### 🏖️ Holiday Management
- **Add Holidays**: Create custom holidays with name and date
- **Delete Holidays**: Remove holidays with trash button
- **Display Format**: Holiday name with date in horizontal layout
- **Real-time Updates**: Changes reflect immediately on calendar

### ✈️ Vacation Planning
- **Multi-day Vacations**: Plan vacations with start and end dates
- **Smart Validation**: End date must be after start date
- **Duration Display**: Automatic calculation of vacation length
- **Calendar Integration**: Vacations span multiple days on calendar

### 🎯 Vacation Planner (Right Panel)
- **Long Weekend Opportunities**: Highlights holidays on Monday/Friday for extended time off
- **Planned Vacations**: Overview of all scheduled vacations with duration
- **Visual Indicators**: Color-coded cards (blue for holidays, green for vacations)
- **Quick Reference**: Easy planning for optimal vacation timing

## 🛠️ Technical Stack

- **Frontend**: React.js with modern hooks
- **Styling**: Tailwind CSS + custom inline styles
- **Icons**: Lucide React for consistent iconography
- **Calendar**: React Big Calendar for robust calendar functionality
- **Font**: Roboto for clean, readable typography
- **Backend**: Node.js/Express (ready for integration)

## 📁 File Structure

```
leave-tracking/
├── public/
│   ├── index.html              # Main HTML template with Roboto font
│   ├── favicon.ico             # App icon
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
├── src/
│   ├── App.js                  # Main React component with all functionality
│   ├── App.css                 # Basic app styles
│   ├── index.js                # React entry point
│   ├── index.css               # Global styles and Roboto font
│   ├── calendar-tailwind.css   # Calendar component overrides
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
- `GET /holidays/official` - Fetch official Indian holidays

### Vacations API ✅
- `GET /vacations` - Fetch all vacations
- `POST /vacations` - Create new vacation
- `PUT /vacations/:id` - Update vacation
- `DELETE /vacations/:id` - Remove vacation

### Teams API ✅
- `GET /teams` - Fetch all teams
- `POST /teams` - Create new team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Remove team

### Leave Balances API ✅
- `GET /leave-balances` - Fetch leave balances
- `PUT /leave-balances/:type` - Update leave balance

## 🔧 Component Architecture

### Main Components
- **App.js**: Main container with state management and authentication
- **Calendar**: React Big Calendar integration
- **HolidayForm**: Add/remove holiday functionality
- **VacationForm**: Add/remove vacation functionality
- **VacationPlanner**: Right panel with planning insights

### Authentication Components
- **AuthContext**: Global authentication state management
- **Login**: User login form with validation
- **Register**: User registration form with email validation
- **Protected Routes**: App only accessible to authenticated users

### State Management
- `indianHolidays`: Array of holiday objects
- `vacations`: Array of vacation objects
- `teams`: Array of team objects (future)
- `currentDate`: Current calendar date
- `allEvents`: Calendar events (holidays + vacations)

## 🚀 Getting Started

### **Prerequisites:**
- Node.js installed
- MongoDB Atlas account (for cloud database)

### **1. Backend Setup**
```bash
cd backend
npm install
# Create .env file with your MongoDB connection string
echo "MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/test?retryWrites=true&w=majority" > .env
npm start
```

### **2. Frontend Setup**
```bash
cd leave-tracking
npm install
npm start
```

### **3. Access Application**
- **Frontend**: Open `http://localhost:3000`
- **Backend**: Running on `http://localhost:5051`
- **Database**: MongoDB Atlas cloud (fully working)

### **4. Test Features**
- ✅ Add/remove holidays
- ✅ Plan vacations
- ✅ Update leave balances
- ✅ Manage teams
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
1. **Use Local Backend**: `cd backend && npm start` (Recommended for development)
2. **Check MongoDB**: Ensure MongoDB connection string is set in `.env` file
3. **Check Ports**: Ensure ports 5051 (backend) and 3000 (frontend) are available
4. **Use Startup Script**: Run `./start-app.sh` from the root directory

### **API Connection Issues**
- **Frontend**: Runs on localhost:3000
- **Backend**: Runs on localhost:5051
- **Database**: MongoDB Atlas (cloud) - FULLY WORKING ✅
- **Status**: Both servers need to be running locally for full functionality

### **Quick Fix Steps**
1. Create `.env` file in `backend/` directory with your MongoDB connection string
2. Run `./start-app.sh` from the root directory
3. Or manually start both servers in separate terminals

## 📱 User Interface

- **Clean Two-Column Layout**: Left for calendar/holidays, right for vacation planning
- **Responsive Design**: Optimized for desktop and tablet use
- **Modern UI**: Rounded corners, subtle shadows, and consistent spacing
- **Color Coding**: Blue for holidays, green for vacations, red for delete actions

## 🔧 Key Functions

- **Add/Remove Holidays**: Simple form with date picker
- **Add/Remove Vacations**: Three-field form (name, from date, to date)
- **Calendar Navigation**: Month navigation with visual feedback
- **Smart Filtering**: Automatic detection of Monday/Friday holidays
- **Duration Calculation**: Automatic vacation length computation
- **Real-time Sync**: All changes update calendar immediately

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interface
- **Functional**: Every element serves a purpose
- **Consistent**: Uniform styling and spacing throughout
- **Accessible**: Clear labels and intuitive interactions

## 🎉 **CURRENT STATUS: FULLY FUNCTIONAL WITH AUTHENTICATION!** ✅

### **What's Working Now:**
- ✅ **Backend API Integration** - Express.js server running on port 5051
- ✅ **MongoDB Atlas Cloud Database** - All data persisting in the cloud
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete for all features
- ✅ **Real-time Data Sync** - Frontend and backend fully synchronized
- ✅ **All Core Features** - Holidays, Vacations, Leave Balances, Teams
- ✅ **User Authentication System** - JWT-based secure authentication
- ✅ **Multi-User Support** - Each user has their own isolated data
- ✅ **Professional UI** - Modern login/register forms with validation

### **Database Collections Working:**
- ✅ **`holidays`** - 8+ documents, full holiday management
- ✅ **`vacations`** - Vacation planning and tracking
- ✅ **`leavebalances`** - EL, SL, CL balance management  
- ✅ **`teams`** - Team structure and management
- ✅ **`users`** - User accounts with secure password hashing

### **Authentication Features:**
- ✅ **User Registration** - Name, email, password with validation
- ✅ **User Login** - Secure JWT token authentication
- ✅ **Password Security** - bcrypt hashing with salt
- ✅ **Email Validation** - Real-time format validation
- ✅ **Session Management** - Persistent login with localStorage
- ✅ **User Isolation** - Each user sees only their own data

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

### 2. 🔐 User Authentication System
- **User Registration & Login**: Secure email/password authentication
- **JWT Token Management**: Secure session handling
- **User Profiles**: Personal leave balances and preferences
- **Protected Routes**: Secure access to app features
- **Password Security**: Encrypted password storage and recovery

### 3. ☁️ Cloud Database Integration
- **MongoDB Atlas Setup**: Cloud database for production
- **Data Persistence**: User data saved across sessions
- **Multi-user Support**: Each user has their own data
- **Backup & Recovery**: Automated data backup systems
- **Scalability**: Handle multiple users and teams

### 4. 🎯 Additional Features
- **Team Management**: Create and manage team structures
- **Leave Approvals**: Workflow for leave requests
- **Notifications**: Email/calendar reminders
- **Reporting**: Leave analytics and reports
- **API Integration**: Connect with HR systems

## 📝 License

This project is open source and available under the MIT License.
