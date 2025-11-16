# 🛠️ FixItNow

**Your one-stop solution for all local home services!**

FixItNow is a full-stack web application that connects users with reliable local service professionals including electricians, plumbers, carpenters, beauticians, appliance repair specialists, and many more. Whether you need a quick fix or a full service, we've got you covered.

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Backend Setup](#-backend-setup)
  - [Frontend Setup](#-frontend-setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 🔍 **Service Catalog** - Browse through various service categories with detailed subservices
- 👤 **User Dashboard** - Manage bookings, view service history, and rate providers
- 🏢 **Provider Dashboard** - Accept/decline requests, manage profile, and view ratings
- 📅 **Booking System** - Schedule services with preferred date and time
- ⭐ **Rating & Reviews** - Rate and review service providers
- 📧 **Email Notifications** - Providers receive email notifications for new bookings
- 🔐 **Authentication** - Secure user and provider authentication

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14 or higher recommended) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account) - [Download MongoDB](https://www.mongodb.com/try/download/community)
- **Git** (for cloning the repository)

---

## 📦 Installation

### 🔙 Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `backend` directory (see [Environment Variables](#-environment-variables) section below)

### 🎨 Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## 🔐 Environment Variables

### Backend `.env` File

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/fixitnow

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_jwt_key_here

# SMTP Email Configuration (Optional - for real emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=no-reply@fixitnow.com
```

#### 📝 Environment Variables Explained:

- **`MONGO_URI`** (Optional): MongoDB connection string. Defaults to `mongodb://localhost:27017/fixitnow` if not provided
- **`JWT_SECRET`** (Optional): Secret key for JWT token generation. Defaults to `supersecret` if not set (⚠️ **Change this in production!**)
- **SMTP Variables** (Optional): If not provided, the server will use Ethereal (test-only) email service for local development

> 💡 **Tip**: For Gmail, you'll need to generate an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular password.

### Example `.env` File

If you're using MongoDB Atlas (cloud), your `.env` might look like:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fixitnow?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_12345
```

---

## 🗄️ Database Setup

You have two options to set up your database:

### Option 1: Run Seed Script (Recommended for Development) 🌱

The seed script will populate your database with default services and subservices.

1. **Make sure MongoDB is running** (local or cloud)

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Run the seed script:**
   ```bash
   node src/seedServices.js
   ```

   You should see:
   ```
   📦 Connected to MongoDB. Seeding services...
   ✅ Services inserted successfully!
   ```

### Option 2: Restore Database Dump 📥

If you have a MongoDB dump file:

1. **Make sure MongoDB is running**

2. **Restore the dump:**
   ```bash
   mongorestore --db fixitnow /path/to/your/dump
   ```

   Or if using MongoDB Atlas:
   ```bash
   mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/fixitnow" /path/to/your/dump
   ```

> ⚠️ **Note**: The seed script will automatically create the database and collections if they don't exist. Make sure your MongoDB connection is working before running the seed script.

---

## 🚀 Running the Project

### Start Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   > ⚠️ **Note**: If `npm run dev` doesn't work, use `npm start` instead. The server will run on `http://localhost:5000`

   You should see:
   ```
   ✅ MongoDB connected
   🚀 Server running on port 5000
   ```

### Start Frontend Development Server

1. **Open a new terminal window/tab**

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   > ⚠️ **Note**: If `npm run dev` doesn't work, use `npm start` instead. The frontend will run on `http://localhost:3000`

   The React app will automatically open in your browser at `http://localhost:3000`

### 🎯 Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

---

## 📁 Project Structure

```
FixItNow/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── seedServices.js  # Database seed script
│   │   └── index.js         # Server entry point
│   ├── .env                 # Environment variables (create this)
│   └── package.json
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/           # React components
│   │   ├── api.js           # API helper
│   │   └── App.js           # Main app component
│   └── package.json
│
└── README.md
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:5000
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login (user or provider)
- `POST /auth/provider-register` - Register as a service provider

#### Services
- `GET /services` - Get all available services
- `GET /services/providers?service=Plumber&subservice=Tap Installation` - Get providers by service
- `POST /services/book` - Book a service

#### Requests
- `GET /requests` - Get requests (supports query params: `userId`, `providerId`, `status`)
- `PATCH /requests/:id/accept` - Accept a request (provider)
- `PATCH /requests/:id/decline` - Decline a request (provider)
- `PATCH /requests/:id/complete` - Mark request as completed

#### Feedback
- `GET /feedback?userId=...` - Get user's ratings
- `GET /feedback?providerId=...` - Get provider's ratings

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ MongoDB Connection Error
- **Problem**: `MongoDB connection error`
- **Solution**: 
  - Make sure MongoDB is running: `mongod` (for local) or check your Atlas connection string
  - Verify your `MONGO_URI` in `.env` file is correct

#### ❌ Port Already in Use
- **Problem**: `Port 5000 is already in use`
- **Solution**: 
  - Change the port in `backend/src/index.js` or kill the process using port 5000
  - For Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

#### ❌ Services Not Appearing
- **Problem**: No services showing in the frontend
- **Solution**: Run the seed script: `cd backend && node src/seedServices.js`

#### ❌ npm install Fails
- **Problem**: Errors during `npm install`
- **Solution**: 
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again
  - Make sure you're using Node.js v14 or higher

#### ❌ Email Not Sending
- **Problem**: Provider emails not being sent
- **Solution**: 
  - Check SMTP credentials in `.env` file
  - If SMTP not configured, check server logs for Ethereal preview URL
  - For Gmail, use App Password instead of regular password

### 🔍 Debugging Tips

- Check server console logs for detailed error messages
- Use browser DevTools (F12) to check network requests
- Verify environment variables are loaded correctly
- Test API endpoints directly using Postman or curl

---

## 📝 Additional Notes

- The server automatically seeds services on first `GET /services` request if the database is empty
- Email notifications use Ethereal (test service) if SMTP is not configured
- All service providers are verified and rated by real customers
- The application uses JWT tokens for authentication

---

## 🎉 You're All Set!

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

Start by registering as a user or provider and explore the platform!

---

## 📄 License

This project is currently unlicensed. Add an appropriate LICENSE file if you plan to publish the repository.

---

**Happy Coding! 🚀**
