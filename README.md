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

### 1. Database & Backend (Railway)
1. Create a new project at [railway.app](https://railway.app).
2. Add a **PostgreSQL** database plugin.
3. Add a **New GitHub Repo** → select this repository.
4. Go to **Settings** → **Root Directory** → set to `/server`.
5. Set **Custom Start Command**: `npm run migrate:deploy && npm start`
6. Set Environment Variables:
   - `DATABASE_URL`: Your Railway Postgres URL
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`: Secure strings
   - `JWT_ACCESS_EXPIRY`: `15m`
   - `JWT_REFRESH_EXPIRY`: `7d`
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `CLIENT_URL`: *(Leave blank initially, update to your Vercel URL later)*
7. Generate a Domain and copy it (this is your `BACKEND_URL`).

### 2. Frontend (Vercel)
1. Import your GitHub repository at [vercel.com](https://vercel.com).
2. During setup, click **Edit** on the **Root Directory** setting and select `client`.
3. Vercel will auto-detect Vite as the framework.
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: Paste your `BACKEND_URL` from Railway (e.g., `https://your-railway-app.up.railway.app`). No trailing slash.
5. Click **Deploy**. Vercel will build and host your frontend 24x7 for free.

### 3. Connect Backend to Frontend
- Go back to your Railway Backend Service variables.
- Update `CLIENT_URL` and set it to your new Vercel Frontend Domain (no trailing slash).
