# 🚀 Freelance Marketplace API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

A robust backend API for a freelance services marketplace platform (similar to Fiverr or Upwork), built with Node.js, Express, TypeScript, and PostgreSQL. This API supports user authentication, role-based authorization, service management, payment processing, and order tracking.

## 🌟 Features

- **User Authentication**: JWT with access/refresh tokens
- **Role-Based Access Control**: Client, Freelancer, and Admin roles
- **Service Management**: Create, read, update, and delete services
- **Payment Integration**: Stripe checkout and payment processing
- **Order Tracking**: Complete order lifecycle management
- **Image Uploads**: Cloudinary integration for service images
- **Email Verification**: OTP-based account verification
- **Password Reset**: Secure token-based password reset
- **Redis Caching**: For refresh token management
- **API Documentation**: Comprehensive endpoint documentation

## 🛠 Tech Stack

| Category       | Technology |
|----------------|------------|
| **Runtime**    | Node.js 18+ |
| **Framework**  | Express 4.x |
| **Language**   | TypeScript 5 |
| **Database**   | PostgreSQL 15 |
| **Cache**      | Redis |
| **Auth**       | JWT (Access + Refresh Tokens) |
| **Payments**   | Stripe API |
| **Storage**    | Cloudinary |
| **Email**      | Nodemailer |
| **Validation** | Joi |

## 📂 Project Structure

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint                  | Description                          | Auth Required |
|--------|---------------------------|--------------------------------------|---------------|
| POST   | `/register`               | Register new user                    | ❌            |
| POST   | `/verify`                 | Verify account via OTP               | ❌            |
| POST   | `/login`                  | User login                           | ❌            |
| POST   | `/logout`                 | User logout                          | ✅            |
| POST   | `/forgot-password`        | Initiate password reset              | ❌            |
| POST   | `/reset-password/:token`  | Complete password reset              | ❌            |
| POST   | `/refresh-token`          | Refresh access token                 | ✅ (cookie)   |
| GET    | `/check-auth`             | Check current session                | ✅            |

### 👥 Users (`/api/users`)

| Method | Endpoint         | Description                      | Auth Required | Role      |
|--------|------------------|----------------------------------|---------------|-----------|
| GET    | `/`              | Get all users (paginated)        | ✅            | Admin     |
| GET    | `/:id`           | Get user by ID                   | ✅            | Any       |
| POST   | `/:id`           | Update user role                 | ✅            | Admin     |
| DELETE | `/:id`           | Delete user                      | ✅            | Admin     |

### 🛠 Services (`/api/services`)

| Method | Endpoint         | Description                            | Auth Required | Role              |
|--------|------------------|----------------------------------------|---------------|-------------------|
| GET    | `/`              | Get all services (filterable)          | ✅            | Freelancer/Admin  |
| POST   | `/`              | Create new service                     | ✅            | Freelancer/Admin  |
| GET    | `/:id`           | Get service details                    | ✅            | Any               |
| PATCH  | `/:id`           | Update service                         | ✅            | Owner/Admin       |
| DELETE | `/:id`           | Delete service                         | ✅            | Owner/Admin       |

### 💳 Payments (`/api/payments`)

| Method | Endpoint                  | Description                          | Auth Required |
|--------|---------------------------|--------------------------------------|---------------|
| POST   | `/create-checkout-session`| Create Stripe checkout session       | ✅            |
| POST   | `/checkout-success`       | Handle successful payment            | ✅            |

### 📦 Orders (`/api/orders`)

| Method | Endpoint                  | Description                          | Auth Required | Role        |
|--------|---------------------------|--------------------------------------|---------------|-------------|
| GET    | `/`                       | Get current user's orders            | ✅            | Client      |
| GET    | `/freelancer-orders`      | Get orders for freelancer's services | ✅            | Freelancer  |

## 🔒 Role-Based Access Control

| Role        | Permissions |
|-------------|-------------|
| **Client**  | Browse services, place orders, manage own profile |
| **Freelancer** | Create/manage services, view order requests |
| **Admin**   | Full system access, user management |

## ⚙️ Environment Variables

Create a `.env` and call me for env file

-- Tareq Radi | Full Stack Developer 🐱‍👤
