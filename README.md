# CPRI Aeroponics Management System

**Professional Farm Management System for CPRI (Central Potato Research Institute)**

## 🥔 Features

✅ **Complete Backend System**
- Node.js + Express.js + MongoDB
- JWT Authentication & Authorization
- Role-based Access Control (Super Admin, Admin, User)
- RESTful API with proper error handling

✅ **Data Management**
- Tank-wise monitoring (Tank 1 & Tank 2)
- Environmental parameters tracking
- Variety management
- Real-time data sync

✅ **Security**
- Password hashing with bcryptjs
- JWT token validation
- CORS protection
- Input validation & sanitization

✅ **Professional Features**
- Pagination support
- Data filtering & search
- Statistics & analytics
- Audit logging (createdBy, timestamps)

## 📂 Project Structure

```
├── models/
│   ├── User.js           # User schema with password hashing
│   ├── Entry.js          # Data entry schema (all fields)
│   └── Unit.js           # Unit/Farm schema
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── entries.js        # Data management endpoints
│   ├── users.js          # User management endpoints
│   └── units.js          # Unit management endpoints
├── js/
│   ├── api-client.js     # Frontend API client
│   └── form-handler.js   # Form validation & handling
├── server.js             # Main Express server
├── package.json          # Dependencies
├── .env.example          # Environment template
└── DEPLOYMENT.md         # Deployment guide
```

## 🚀 Quick Start

### Backend Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev
```

### Access Points
- **API Base**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`
- **Frontend**: `https://akash123909.github.io/CPRI-Aeropponics-management.io`

## 📊 Data Structure

### Entry Fields
- **Basic**: Unit, Growbox Number, Date, Variety
- **Harvest**: Minitubers Count, Weight, Observation
- **Checklist**: Filter checks, Cleaning status, Maintenance
- **Tank 1 & 2**: EC, pH (Previous/Set), Temperature, Nutrient changes
- **Environmental**: Greenhouse temperature

## 🔐 Authentication

### Login
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}
```

### Register (Super Admin Only)
```bash
POST /api/auth/register
{
  "username": "newuser",
  "password": "password",
  "email": "user@example.com",
  "role": "User",
  "unit": "AB Tuber"
}
```

## 📋 API Endpoints

### Entries
- `POST /api/entries` - Create new entry
- `GET /api/entries` - Get entries (with filters)
- `GET /api/entries/:id` - Get single entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `GET /api/entries/stats/summary` - Get statistics

### Users (Super Admin)
- `GET /api/users` - List all users
- `GET /api/users/profile` - Get current profile
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Units
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get single unit

## 🛠️ Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Hosting**: GitHub Pages (Frontend), Heroku/Railway (Backend)

## 📞 Support

**Developer**: Akash Kumar
**Email**: nareakash484@gmail.com
**Repository**: https://github.com/akash123909/CPRI-Aeropponics-management.io

## 📄 License

MIT License - Free for educational and commercial use

---

**Ready for Production Deployment** ✅
