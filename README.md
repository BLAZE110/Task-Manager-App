# 🚀 Team Task Manager

A full-stack project management application with **Kanban boards**, **team collaboration**, **real-time updates**, and an **analytics dashboard** — built with React, Node.js, and PostgreSQL.

---

## ✨ Key Features

- **User Authentication** — Secure Signup & Login with JWT access and refresh tokens.
- **Project Management** — Create projects, set deadlines, and manage team members with Admin/Member roles.
- **Task Management** — Create tasks with titles, descriptions, due dates, priorities, and assign multiple members via checkboxes.
- **Kanban Board** — Intuitive drag-and-drop task cards across To Do → In Progress → Done columns.
- **Analytics Dashboard** — Visual metrics including tasks by status (pie chart), tasks by priority (pie chart), tasks per user (stacked bar chart with total count), project statuses (doughnut chart), and overdue tasks list.
- **Role-Based Access Control** — Restrict sensitive actions (like deleting tasks, completing projects, or modifying deadlines) to Admins.
- **Audit Logs & Activity** — Track all project and task activities: status changes, member additions/removals, deadline updates, task creation, and assignments.
- **Scrollable Activity & Comments** — Comments and activity logs become scrollable when exceeding 5 entries.
- **Custom Themes** — 4 built-in themes (Dark, Midnight, Ocean, Forest) with a global theme switcher.
- **In-App Notifications** — Real-time notifications for task assignments, comments, and project invites.
- **Task Comments** — Threaded discussion on each task.
- **Task Deletion** — Admin-only task deletion with confirmation.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS v4, DaisyUI, Zustand, TanStack Query, Recharts, @dnd-kit
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Real-Time:** Socket.io

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** database (Local or Cloud like Railway/Neon/Supabase)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd team-task-manager
```

### Step 2: Configure Environment Variables
Create a `.env` file in the **server** directory:
```env
DATABASE_URL="your-postgresql-database-url"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the **client** directory:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Install Dependencies & Setup Database

**Terminal 1 (Backend):**
```bash
cd server
npm install
npx prisma db push
npx prisma generate
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```

### Step 4: Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## ☁️ Deploying to Cloud

### Backend (Railway)
1. Create a new project at [railway.app](https://railway.app)
2. Add a **PostgreSQL** plugin
3. Add a **Web Service** → connect your GitHub repo → set root to `/server`
4. Set start command: `npx prisma migrate deploy && node src/index.js`
5. Configure environment variables (JWT secrets, CLIENT_URL)

### Frontend (Vercel)
1. Import client folder at [vercel.com](https://vercel.com)
2. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your Railway backend URL
