# Premium Bilingual Personal Portfolio Platform

A sleek, responsive, and high-impact personal portfolio website built with a **React (JavaScript + Vite)** client and a lightweight **Node.js + Express** server. The entire platform features seamless two-language translation support (Azerbaijani/English) and integrates a secure **Admin CRUD Panel** to manage projects, jobs, and contact messages in a local `db.json` database.

---

## Key Features

1. **Stunning Responsive Styling**: Custom dark/light mode toggle with smooth visual transitions, premium glassmorphism card components, and subtle entrance animations.
2. **Bilingual Integration (i18n)**: Out-of-the-box support for Azerbaijani (default) and English. Includes language toggles in the navbar and dynamic field translations from `db.json` database values.
3. **Smooth Single-Page Scroll**: Seamless anchor scroll navigation with responsive scroll-spy navbar indicator highlights.
4. **Admin Dashboard**: Full CRUD panel under `/admin` (protected by JWT authentication and bcrypt password hashing) enabling adding, updating, and deleting projects (with image file uploads) and work history.
5. **Drag-and-Drop Projects Reordering**: Built-in drag handles (`≡`) in the projects panel allowing admin users to drag and drop projects to instantly save a custom display order.
6. **Dynamic Category Tabs**: Free-text category field inside the admin project form that dynamically populates category tabs on the public home page.
7. **Self-Healing Image Placeholders**: Intentional, beautiful linear-gradient placeholder vector cards for projects without images, completely preventing broken image frames.
8. **Dynamic Local DB Storage**: Flat-file database in `server/db.json` using the node standard `fs/promises` library for operations.

---

## Folder Structure

```
/
├── client/                 # Frontend React Client
│   ├── public/             # Static public assets (CV, icons)
│   │   └── cv.pdf          # Curriculum Vitae file
│   └── src/
│       ├── i18n/           # Translation locales (az.json, en.json, index.js)
│       ├── pages/          # Main page components (Home, AdminLogin, AdminDashboard)
│       ├── App.jsx         # Routing, route guards, and theme states
│       ├── index.css       # Core HSL styling system & animations
│       └── main.jsx        # Mounting and loader script
├── server/                 # Backend Node.js Express Server
│   ├── middleware/         # Security / JWT validation
│   ├── public/uploads/     # Statically served project images (Multer destination)
│   ├── routes/             # Express API router definitions
│   ├── db.js               # Flat-file database transactions helper
│   ├── db.json             # Flat-file JSON database
│   ├── index.js            # Server entry point with mockup image seeding
│   └── package.json        # Backend dependencies
├── .env                    # System variables (password hashes, secrets)
├── .env.example            # Environment variables template
├── Procfile                # Heroku/Railway deployment web process descriptor
├── railway.json            # Railway deployment configuration file
└── README.md               # Setup and development guide
```

---

## Setup & Run Instructions

Follow these simple commands to initialize and run both the client and the server on your system:

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
*Note: The active `.env` has already been pre-configured with a default JWT secret and a hashed password (`admin123`).*

To generate a custom password hash in the future, you can run this small node command in your terminal:
```bash
node -e "console.log(require('bcryptjs').hashSync('your_new_password', 10))"
```
Place the resulting string in the `ADMIN_PASSWORD_HASH` key in your `.env` file.

### 2. Start the Backend Server
Navigate to the `server/` directory, install packages, and start the node server:
```bash
cd server
npm install
npm start
```
The server will boot on `http://localhost:5000` and automatically create the required directories and seed beautiful mock project images under `server/public/uploads` so the site doesn't load with empty images.

### 3. Start the Frontend React Client
In a new terminal window, navigate to the `client/` directory, install packages, and boot up Vite:
```bash
cd client
npm install
npm run dev
```
The Vite server will start on `http://localhost:5173`. Opening this address in your browser launches the bilingual portfolio.

---

## 🚀 Production Deployment Guide

This project is fully structured and pre-configured for a seamless split-hosting deployment: **Backend on Railway** and **Frontend on Vercel**.

### 1. Deploy the Backend to Railway

Railway will automatically detect the backend Node server using our root `railway.json` and `Procfile`.

1. Push your project files to a private/public **GitHub repository**.
2. Log in to [Railway.app](https://railway.app) and create a **New Project**.
3. Select **Deploy from GitHub repo** and choose your repository.
4. Go to the project **Settings** on Railway and make sure the **Root Directory** is set to `/` (default).
5. Go to the **Variables** tab on Railway and configure the following environment variables:
   * `JWT_SECRET` = `your_custom_secure_secret_phrase` (e.g. `SuperSecureKey123!`)
   * `ADMIN_PASSWORD_HASH` = `your_custom_bcrypt_hash` (Use the hash generator script above to hash your admin password)
   * `FRONTEND_URL` = `https://your-portfolio-domain.vercel.app` (This is the URL where your frontend will live on Vercel to allow CORS secure routing)
   * `NODE_ENV` = `production`
6. Once deployed, Railway will generate a public URL for your server (e.g., `https://your-backend.railway.app`). Copy this URL.

*Note: Railway uses the `GET /api/health` route we established to perform automated, zero-downtime healthcheck pings on each deployment container.*

---

### 2. Deploy the Frontend to Vercel

Vite compiles the frontend assets and automatically replaces the API base URLs during compile time using standard environment variables.

1. Log in to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. In the project setup panel, configure these settings:
   * **Framework Preset**: `Vite` (Vercel auto-detects this)
   * **Root Directory**: **`client`** (Crucial! Click Edit and select the `client` folder so Vercel builds the React client, not the root repository)
4. Expand the **Environment Variables** section and add the following variable:
   * `VITE_API_URL` = `https://your-backend.railway.app` (Paste the backend URL you copied from your Railway dashboard earlier, with **no trailing slash**)
5. Click **Deploy**. Vercel will compile the assets and make your premium portfolio live!

---

## Authentication Credentials

To access the secure admin dashboard at `http://localhost:5173/admin` or `/admin` on your production site:
- **Default password**: `admin123` (Ensure you hash a new one for production!)

Upon signing in, a JWT token is saved in your browser's `localStorage` and sent with all API requests. Sessions expire after 24 hours.

---

## Technologies Used

- **Client**: React, Vite, Lucide React, i18next & react-i18next (translation context), @dnd-kit (drag-and-drop sortable rows).
- **Server**: Node.js, Express, Cors (cross-origin controls), Multer (multipart form image uploads), Jsonwebtoken (JWT secure tokens), Bcryptjs (salted password comparisons).
- **Storage**: Flat-file JSON (`db.json`) accessed via Node's native `fs/promises`.
