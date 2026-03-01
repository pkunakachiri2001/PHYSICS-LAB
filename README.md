# Smart AR Virtual Physics Laboratory
## AI-Powered Augmented Reality Learning Platform

> A professional, full-stack smart AR virtual physics laboratory system enhanced with AI-supported learning analytics — enabling students to perform interactive physics experiments in an immersive digital environment.

---

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Features](#features)
- [API Documentation](#api-documentation)

---

## Overview

The **Smart AR Virtual Physics Laboratory** is a multi-layered educational platform that brings physics experiments to life through Augmented Reality and Artificial Intelligence. It caters to three distinct user roles — **Students**, **Educators**, and **Administrators** — each with purpose-built interfaces and capabilities.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│   Student UI | Educator Dashboard | Admin Control Panel │
│   AR Viewer  | Charts & Reports   | Role-based Menus    │
└─────────────────────┬───────────────────────────────────┘
                      │  REST API / WebSocket
┌─────────────────────▼───────────────────────────────────┐
│                  APPLICATION LAYER                      │
│   Auth Service | AR Engine | Experiment Processor       │
│   AI Analytics | Progress Tracker | Report Generator    │
└─────────────────────┬───────────────────────────────────┘
                      │  Mongoose ODM
┌─────────────────────▼───────────────────────────────────┐
│                     DATA LAYER                          │
│   MongoDB Atlas | JWT Encryption | Role-based Access    │
│   Sessions | Progress Records | Analytics Snapshots     │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Frontend     | React 18, TypeScript, Tailwind CSS, Framer Motion   |
| AR Engine    | Three.js, AR.js, WebXR API                          |
| Charts       | Recharts, Chart.js                                  |
| Backend      | Node.js, Express.js, TypeScript                     |
| Database     | MongoDB with Mongoose ODM                           |
| Auth         | JSON Web Tokens (JWT), bcrypt                       |
| Real-time    | Socket.io                                           |
| AI/Analytics | Custom ML service (rule-based + statistical models) |

---

## Project Structure

```
smart-ar-physics-lab/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, environment config
│   │   ├── controllers/    # Business logic per route group
│   │   ├── middleware/     # Auth, error handling, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Analytics, AI, notification services
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/         # Images, 3D model refs, icons
│       ├── components/     # Reusable UI components
│       │   ├── ar/         # AR scene components
│       │   ├── charts/     # Data visualisation
│       │   ├── common/     # Shared layout components
│       │   └── dashboard/  # Dashboard-specific widgets
│       ├── context/        # React Context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Route-level page components
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── educator/
│       │   └── student/
│       ├── services/       # API communication layer
│       ├── types/          # TypeScript interfaces & enums
│       └── utils/          # Frontend helpers
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB Atlas account or local MongoDB >= 6.x
- npm >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/smart-ar-physics-lab.git
cd smart-ar-physics-lab

# Setup backend
cd backend
npm install
cp ../.env.example .env   # fill in your values
npm run dev

# Setup frontend (new terminal)
cd ../frontend
npm install
npm start
```

---

## User Roles

| Role          | Capabilities                                                                 |
|---------------|------------------------------------------------------------------------------|
| **Student**   | Conduct AR experiments, view own progress, submit reports                    |
| **Educator**  | Monitor class performance, assign experiments, view analytics per student    |
| **Admin**     | Manage users, system health, global analytics, content management            |

---

## Features

- **AR Physics Experiments** — Simulated pendulum, optics, circuit, projectile, and wave experiments
- **3D Equipment Models** — Interactive apparatus rendered via Three.js
- **Real-time Analytics** — Engagement, accuracy scores, time-on-task
- **AI Progress Tracking** — Personalized feedback and conceptual gap detection
- **Role-based Dashboards** — Distinct views for each user type
- **JWT Authentication** — Secure login/register with role enforcement
- **WebSocket Updates** — Live experiment data broadcast
- **Responsive Design** — Mobile-first, AR-ready layout

---

## API Documentation

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint                          | Description                     |
|--------|-----------------------------------|---------------------------------|
| POST   | /auth/register                    | Register new user               |
| POST   | /auth/login                       | Authenticate and receive token  |
| GET    | /experiments                      | List all experiments            |
| POST   | /experiments/:id/session          | Start experiment session        |
| GET    | /analytics/student/:id            | Get student analytics           |
| GET    | /analytics/class/:classId         | Get class-wide analytics        |
| GET    | /users/me                         | Get current user profile        |
| PUT    | /users/me                         | Update user profile             |

---

*Built with precision for educational excellence — Smart AR Physics Lab © 2026*
