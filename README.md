# Kartik Khajuria — Personal Portfolio & Resume Platform

A futuristic, interactive 3D personal portfolio and digital resume built with **Next.js 16**, **React 19**, **Three.js**, **Tailwind CSS 4**, and **Prisma ORM with SQLite**.

---

## Tech Stack

- **Framework:** [Next.js 16.4.3](https://nextjs.org/) (App Router, Turbopack)
- **Frontend:** [React 19.3.0](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **3D Graphics & Audio:** [Three.js](https://threejs.org/), WebGL Particle Starfield, HTML5 Web Audio API
- **Database & ORM:** [Prisma ORM 6.19.3](https://www.prisma.io/) with persistent SQLite
- **Security:** `jose` (JWT), `bcryptjs`, Secure HttpOnly Cookies, Hidden Admin Authentication
- **Deployment Target:** HostingRaja Node.js Hosting (CloudLinux / cPanel / Phusion Passenger)

---

## Database & Management Commands

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Check DB Integrity** | `npm run db:check` | Verifies SQLite connectivity, 25 tables, foreign keys, and records |
| **Backup DB** | `npm run db:backup` | Creates timestamped SQLite and schema snapshots in `backups/` |
| **Restore DB** | `npm run db:restore` | Restores an SQLite snapshot from `backups/` |
| **Reset Admin** | `npm run db:reset-admin` | Generates a new secure admin login password |
| **Verify Admin** | `npm run db:verify` | Checks current admin credentials and roles |
| **Package for Hosting** | `npm run package:deploy` | Creates clean `deploy/my_resume_hostingraja_deploy.zip` archive |

---

## HostingRaja Deployment Quickstart

1. **Package the Project:**
   ```bash
   npm run package:deploy
   ```
2. **Setup on HostingRaja cPanel:**
   - In cPanel, click **"Setup Node.js App"** -> **"Create Application"**.
   - Select **Node.js 20.x** (or 22.x).
   - Set **Application startup file** to `server.js`.
   - Set **Application root** to your folder (e.g. `portfolio`).
3. **Upload & Extract:**
   - Upload `deploy/my_resume_hostingraja_deploy.zip` to your application root.
   - Extract the files.
4. **Environment Variables:**
   - Create `.env` from `.env.production.example` or set in cPanel:
     ```env
     DATABASE_URL="file:./dev.db"
     JWT_SECRET="<YOUR_SECRET_KEY>"
     NODE_ENV="production"
     HOST="0.0.0.0"
     PORT=3000
     ```
5. **Install & Build (in cPanel Terminal):**
   ```bash
   source /home/YOUR_USER/nodevenv/portfolio/20/bin/activate && cd /home/YOUR_USER/portfolio
   npm install
   npm run build
   chmod 755 prisma storage storage/project-files storage/music public/uploads backups
   chmod 664 prisma/dev.db
   ```
6. **Start Application:**
   Click **"RESTART"** in cPanel or run `touch tmp/restart.txt`.
