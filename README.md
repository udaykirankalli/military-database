# 🪖 Military Asset Management System

A full-stack web application for managing military assets across multiple bases with role-based access control and comprehensive audit logging.

> Built as a Full Stack Engineer assignment demonstrating production-ready development practices.

## 🎯 Problem Statement

Military organizations need strict control over asset movement, assignments, and expenditures across distributed bases. This system provides:

- Real-time asset tracking across all bases
- Role-based access control for data security
- Complete audit trail for compliance
- Automated balance calculations and reporting

## ✨ Core Features

- **Dashboard Analytics** - Real-time metrics with filtering by date, base, and equipment type
- **Purchase Management** - Record and track asset acquisitions
- **Transfer Management** - Handle inter-base asset movements
- **Assignment Tracking** - Assign assets to personnel with accountability
- **Expenditure Recording** - Track consumed assets
- **Audit Logging** - Complete transaction history for compliance

## 👤 User Roles

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Admin** | Global | Full system access, manage all bases, view audit logs |
| **Base Commander** | Base-specific | Manage assigned base, create purchases/transfers/assignments |
| **Logistics Officer** | Read-mostly | View purchases and transfers, limited modifications |

## 🛠 Tech Stack

**Frontend:** React.js, Tailwind CSS, Recharts, Axios  
**Backend:** Node.js, Express.js, JWT, bcrypt, Winston  
**Database:** PostgreSQL  
**Deployment:** Vercel (Frontend), Render (Backend + DB)

## 🏗️ System Architecture

```
Frontend (React + Tailwind)
        ↓
REST APIs (JWT Auth)
        ↓
Backend (Node.js + Express)
        ↓
PostgreSQL Database
```

## 🗄️ Database Schema

**Core Tables:**
- `users` - Authentication and roles
- `bases` - Military base information
- `equipment_types` - Asset categories
- `assets` - Current inventory per base
- `purchases` - Procurement records
- `transfers` - Inter-base movements
- `assignments` - Asset-to-personnel mapping
- `expenditures` - Consumption records
- `audit_logs` - Complete transaction history

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
```

### Dashboard & Assets
```
GET    /api/dashboard/metrics
GET    /api/dashboard/movement
GET    /api/purchases
POST   /api/purchases
GET    /api/transfers
POST   /api/transfers
GET    /api/assignments
POST   /api/assignments
GET    /api/expenditures
POST   /api/expenditures
GET    /api/audit-logs
```

## ▶️ Installation

### Prerequisites
- Node.js v14+
- PostgreSQL v12+

### Backend Setup

```bash
cd backend
npm install

# Create .env file
DATABASE_URL=postgresql://username:password@localhost:5432/military_assets
JWT_SECRET=your_secret_key
PORT=5000

# Run migrations and seed
npm run migrate
npm run seed
npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
REACT_APP_API_URL=http://localhost:5000/api

npm start
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@military.gov` | `demo123` |
| **Base Commander** | `commander.alpha@military.gov` | `demo123` |
| **Logistics Officer** | `logistics@military.gov` | `demo123` |

## 🚀 Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL

> ⚠️ **Note:** Free-tier hosting may experience cold-start delays on initial requests.

## 📈 Future Enhancements

- Real-time notifications
- Advanced analytics and reporting
- Asset lifecycle management
- Multi-level approval workflows
- Mobile application

## ✅ Project Highlights

- End-to-end full stack development
- Secure JWT authentication & RBAC
- Clean database design with proper relationships
- RESTful API design
- Production deployment ready
- Real-world problem solving

## 📧 Contact

**Uday Kiran Kalli**

- 📧 Email: kalliudaykiran@gmail.com
- 💼 LinkedIn: [linkedin.com/in/udaykirankalli](https://www.linkedin.com/in/udaykirankalli/)
- 🐱 GitHub: [github.com/udaykirankalli](https://github.com/udaykirankalli)
- 🌐 Portfolio: [udaykirankalli.vercel.app](https://udaykirankalli.vercel.app/)

## 📝 License

This project is for educational and demonstration purposes.

---

<div align="center">

**Built with ❤️ by Uday Kiran Kalli**

⭐ Star this repo if you found it helpful! ⭐

</div>