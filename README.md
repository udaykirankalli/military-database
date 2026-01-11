# 🪖 Military Asset Management System

A full-stack web application built to manage, track, and audit military assets such as vehicles, weapons, and ammunition across multiple bases.  
The system ensures **operational transparency**, **secure access**, and **full accountability** through **Role-Based Access Control (RBAC)** and **audit logging**.

This project was developed as part of a **Full Stack Engineer take-home assignment** and demonstrates real-world backend, frontend, and database design practices.

---

## 📌 Problem Statement

Military organizations require strict control over asset movement, assignments, and expenditures across geographically distributed bases.  
Manual tracking or loosely controlled systems can lead to data inconsistency, lack of accountability, and operational risk.

This system addresses these challenges by providing:

- A centralized asset tracking platform  
- Controlled access based on user roles  
- A complete historical audit trail of all transactions  

---

## 🎯 Key Objectives

- Track **Opening Balance**, **Closing Balance**, and **Net Movement** of assets  
- Record **Purchases**, **Transfers**, **Assignments**, and **Expenditures**  
- Provide clear visibility of asset movement across bases  
- Enforce strict **Role-Based Access Control (RBAC)**  
- Maintain a permanent **audit log** for compliance and review  

---

## ✨ Core Features

### 📊 Dashboard
- Displays key metrics:
  - Opening Balance
  - Closing Balance
  - Net Movement
  - Assigned Assets
  - Expended Assets
- Filter options:
  - Date
  - Base
  - Equipment Type
- Clicking **Net Movement** opens a detailed breakdown of:
  - Purchases
  - Transfers In
  - Transfers Out

### 🧾 Purchases Management
- Record new asset purchases per base  
- View purchase history  
- Filter by date and equipment type  
- Access controlled based on role  

### 🔄 Transfers Management
- Transfer assets between bases  
- Track source and destination bases  
- Maintain complete transfer history with timestamps  

### 👥 Assignments & Expenditures
- Assign assets to personnel  
- Track expended or consumed assets  
- Maintain accountability at the personnel level  

### 🔐 Role-Based Access Control (RBAC)
- Ensures users access only data relevant to their role  
- Enforced on both frontend and backend  

### 🧾 Audit Logging
- Every critical action is logged  
- Tracks **who did what and when**  
- Supports traceability and compliance  

---

## 👤 User Roles & Permissions

### Admin
- Full system access  
- Can view and manage all bases  
- Access to all operations and audit logs  

### Base Commander
- Access restricted to assigned base  
- Can view and manage assets for their base  
- Can create purchases, transfers, and assignments  

### Logistics Officer
- Limited access  
- Can view purchases and transfers  
- Cannot assign assets or manage users  

---

## 🏗️ System Architecture

Frontend (React + Tailwind)
|
| REST APIs (JWT Authentication)
|
Backend (Node.js + Express)
|
PostgreSQL Database

markdown
Copy code

The application follows a **three-tier architecture**:
- **Frontend:** Handles UI and user interaction  
- **Backend:** Handles business logic, authentication, and authorization  
- **Database:** Stores structured relational data with strong integrity  

---

## 🛠 Tech Stack

### Frontend
- React.js – Component-based UI development  
- Tailwind CSS – Responsive and modern styling  
- Recharts – Dashboard data visualization  
- Vercel – Frontend hosting  

### Backend
- Node.js – Runtime environment  
- Express.js – REST API framework  
- JWT – Secure authentication  
- bcrypt – Password hashing  
- Winston – Logging and audit support  
- Render – Backend hosting  

### Database
- PostgreSQL  
  - ACID compliant  
  - Strong relational integrity  
  - Ideal for transactional and audit-heavy systems  

---

## 🗄️ Database Design

### Core Tables
- users – Authentication and roles  
- bases – Military bases  
- equipment_types – Asset categories  
- assets – Inventory per base  
- purchases – Procurement records  
- transfers – Inter-base movements  
- assignments – Asset-to-personnel mapping  
- expenditures – Asset usage/consumption  
- audit_logs – Complete transaction history  

### Relationships
- Users → Bases  
- Purchases → Bases & Equipment Types  
- Transfers → From Base → To Base  
- Assignments → Assets & Personnel  
- Audit Logs → Users & Entities  

---

## 🧾 API Logging & Auditing

- All create, update, and delete operations are logged  
- Each log includes:
  - User ID
  - Action type
  - Entity affected
  - Timestamp
- Logs are stored persistently in the `audit_logs` table  

This ensures **full traceability** and supports audit and compliance requirements.

---

## 🔗 API Endpoints (Sample)

  - POST /api/auth/login
  - GET /api/dashboard/metrics
  - GET /api/purchases
  - POST /api/purchases
  - GET /api/transfers
  - POST /api/transfers
  -  GET /api/assignments
  - GET /api/audit-logs

yaml
Copy code

---

## ▶️ Running the Project Locally

### Backend
```bash
cd backend
npm install
npm start


Frontend
bash
Copy code
cd frontend
npm install
npm start

---

## 🔑 Demo Login Credentials
graphql
Copy code
Admin:
admin@military.gov / demo123

Commander:
commander.alpha@military.gov / demo123

Logistics:
logistics@military.gov / demo123

---

##🚀 Deployment
Frontend: Vercel

Backend: Render

Database: Render PostgreSQL

Free-tier hosting is used, so initial requests may experience cold-start delays.

---

##📄 Documentation & Demo
Detailed technical documentation provided in the submitted PDF

3–5 minute video walkthrough demonstrates:

System architecture

Core features

Role-based access

Live deployment

---

##📈 Future Enhancements
Real-time notifications

Advanced analytics and reporting

Asset lifecycle management

Multi-level approval workflows

---
##✅ Conclusion
This project demonstrates:

End-to-end full-stack development

Secure authentication and RBAC

Clean and scalable database design

Real-world backend engineering practices

Production deployment readiness
---

## Built with ❤️ by Uday Kiran Kalli