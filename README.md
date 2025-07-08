# 🧠 Freelance Marketplace Backend API

This is the **backend API** for a freelance service marketplace (like Fiverr or Khamsat), built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**. It supports user authentication, role-based authorization, service management, and admin operations.

## 🚀 Tech Stack

- **Node.js**, **Express**, **TypeScript**
- **PostgreSQL**, **Redis**
- **JWT** (Access + Refresh Tokens)
- **Cloudinary** (Image uploads)

---

## 📁 Project Structure

---

## 📘 API Endpoints

### 🔐 Auth Routes (`/api/auth`)

| Method | Endpoint                  | Description                          | Auth Required |
|--------|---------------------------|--------------------------------------|----------------|
| POST   | `/register`               | Register new user                    | ❌             |
| POST   | `/verify`                 | Verify account via code              | ❌             |
| POST   | `/login`                  | Login with email and password        | ❌             |
| POST   | `/logout`                 | Logout user                          | ✅             |
| POST   | `/forgot-password`        | Send password reset code             | ❌             |
| POST   | `/reset-password/:token`  | Reset password with token            | ❌             |
| POST   | `/refresh-token`          | Refresh access token                 | ✅ (via cookie)|
| GET    | `/check-auth`             | Check current session user           | ✅             |

---

### 👤 User Routes (`/api/users`)

| Method | Endpoint         | Description                      | Auth Required | Role      |
|--------|------------------|----------------------------------|----------------|-----------|
| GET    | `/`              | Get all users                    | ✅             | Admin     |
| GET    | `/:id`           | Get single user by ID            | ✅             | Any       |
| POST   | `/:id`           | Promote user (change role)       | ✅             | Admin     |
| DELETE | `/:id`           | Delete user                      | ✅             | Admin     |

---

### 🧰 Service Routes (`/api/services`)

| Method | Endpoint         | Description                            | Auth Required | Role              |
|--------|------------------|----------------------------------------|----------------|-------------------|
| GET    | `/`              | Get all services (paginated)           | ✅             | Freelancer/Admin  |
| POST   | `/`              | Create a new service                   | ✅             | Freelancer/Admin  |
| GET    | `/:id`           | Get service by ID                      | ✅             | Any               |
| PATCH  | `/:id`           | Update a service                       | ✅             | Owner/Admin       |
| DELETE | `/:id`           | Delete a service                       | ✅             | Owner/Admin       |

---

## 🔒 Roles

| Role       | Description                          |
|------------|--------------------------------------|
| `client`   | Can browse and request services       |
| `freelancer` | Can create/manage services           |
| `admin`    | Full control (manage users/services)  |

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=your_postgres_connection
REDIS_URL=your_redis_connection
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run dev

--Tareq Radi | FullStack Developer
