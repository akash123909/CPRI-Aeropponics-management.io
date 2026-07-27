# CPRI Aeroponics Management System - Deployment Guide

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **MongoDB** 4.4 or higher (Cloud or Local)
- **Git** for version control
- **npm** or **yarn** package manager

---

## 🚀 Backend Setup

### 1. Clone Repository
```bash
git clone https://github.com/akash123909/CPRI-Aeropponics-management.io.git
cd CPRI-Aeropponics-management.io
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cpri-aeroponics
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://akash123909.github.io/CPRI-Aeropponics-management.io
```

### 4. Start Backend Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 📱 Frontend Setup

The frontend is hosted on GitHub Pages at:
```
https://akash123909.github.io/CPRI-Aeropponics-management.io
```

### Update Frontend API URL

Edit `index.html` or add configuration:
```javascript
// In any frontend JS file
localStorage.setItem('API_URL', 'http://your-backend-url/api');
```

---

## 🔐 Database Setup

### MongoDB Atlas (Cloud - Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add IP to whitelist (0.0.0.0/0 for development)
4. Get connection string
5. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cpri-aeroponics
   ```

### Local MongoDB

```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/cpri-aeroponics
```

---

## 👤 Initial User Setup

After starting the server, create super admin user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "strong-password-here",
    "email": "admin@cpri.org",
    "role": "Super Admin",
    "unit": "All"
  }'
```

---

## 🌐 Deployment Options

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas URI
heroku config:set MONGODB_URI="your-connection-string"
heroku config:set JWT_SECRET="your-secret-key"

# Deploy
git push heroku main
```

### Railway.app Deployment

1. Connect GitHub account to Railway
2. Select this repository
3. Add MongoDB service
4. Set environment variables
5. Deploy

### DigitalOcean/AWS EC2

```bash
# SSH to server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/akash123909/CPRI-Aeropponics-management.io.git
cd CPRI-Aeropponics-management.io
npm install

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name cpri-backend

# Setup SSL with Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify token

### Entries
- `POST /api/entries` - Create entry
- `GET /api/entries` - Get all entries (with filters)
- `GET /api/entries/:id` - Get single entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `GET /api/entries/stats/summary` - Get statistics

### Users
- `GET /api/users` - Get all users (Super Admin)
- `GET /api/users/profile` - Get current profile
- `PUT /api/users/:id` - Update user (Super Admin)
- `DELETE /api/users/:id` - Delete user (Super Admin)

### Units
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get single unit

---

## 🧪 Testing

```bash
# Test API with curl
curl -X GET http://localhost:5000/api/health

# Response
{
  "status": "API is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "Connected"
}
```

---

## 📝 Monitoring & Logs

```bash
# View server logs
pm2 logs cpri-backend

# Monitor system resources
pm2 monit

# View all running processes
pm2 list
```

---

## 🔄 Continuous Integration/Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      - name: Deploy to Heroku
        run: git push https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/your-app.git main
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed
- Check connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure database exists

### CORS Errors
- Update FRONTEND_URL in .env
- Ensure CORS middleware is enabled in server.js

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/akash123909/CPRI-Aeropponics-management.io/issues)
- Email: nareakash484@gmail.com

---

## 📄 License

MIT License - See LICENSE file for details
