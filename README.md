# Premium Bilingual Personal Portfolio Platform — Vercel Monorepo Edition

A sleek, responsive, and high-impact personal portfolio website built with a **React (JavaScript + Vite)** client and a lightweight **Node.js + Express** serverless backend. The entire platform features seamless two-language translation support (Azerbaijani/English) and integrates a secure **Admin CRUD Panel** to manage projects, jobs, and contact messages, fully backed by **Upstash Redis** for production persistence and standard local fallback for offline coding.

---

## 🚀 Key Features

1. **Vercel Serverless Monorepo**: Frontend and backend co-exist in a single repository. Zero separate servers or external cloud platforms (like Railway/Heroku) are required!
2. **Robust Persistence via Upstash Redis**: Dynamic portfolio state is saved in high-performance Redis database buckets using `@upstash/redis`.
3. **Auto-Healing Initial Database Seeding**: On the first launch, if Upstash Redis is empty, the database automatically parses and seeds itself with your existing `api/db.json` data.
4. **Offline-Ready Local Fallback**: When running locally without Upstash REST credentials, the server seamlessly falls back to reading and writing `api/db.json` automatically.
5. **Stunning Responsive Styling**: Custom dark/light mode toggle with smooth visual transitions, premium glassmorphism card components, and subtle entrance animations.
6. **Bilingual Integration (i18n)**: Out-of-the-box support for Azerbaijani (default) and English. Includes language toggles in the navbar and dynamic field translations.
7. **Serverless Image Uploads**: Refactored image upload flow utilizing Multer memory storage; newly uploaded images are automatically converted to **Base64 Data URIs** and saved directly in your database.
8. **Static Image Hosting (Vercel CDN)**: Existing image uploads are copied into the React compile bundle, served directly under `/uploads/...` with premium global edge caching.
9. **Protected Admin Panel**: Secure dashboard at `/admin` (protected by JWT authentication and bcrypt password hashing) enabling drag-and-drop projects reordering, jobs CRUD, and message checking.

---

## 📁 Monorepo Folder Structure

```
/
├── api/                    # Vercel Serverless Express API
│   ├── middleware/         # Security / JWT validation
│   ├── routes/             # CRUD endpoints (auth, projects, jobs, contact)
│   ├── db.js               # Upstash Redis / Local JSON database connector
│   ├── db.json             # Seed database & local development storage
│   └── index.js            # Serverless backend entry point
├── public/                 # Consolidated Static Assets
│   ├── uploads/            # Preserved project portfolio images
│   ├── cv.pdf              # Curriculum Vitae
│   └── ...                 # Other static files
├── src/                    # Frontend React Source Files
│   ├── i18n/               # Translation locales (az.json, en.json, index.js)
│   ├── pages/              # Main page components (Home, AdminLogin, AdminDashboard)
│   ├── App.jsx             # Routing, route guards, and theme states
│   ├── index.css           # Core HSL styling system & animations
│   └── main.jsx            # Mounting and i18n initialization
├── package.json            # Root dependency definitions & unified build commands
├── vercel.json             # Unified monorepo routing and React Router SPA fallback rules
├── .env                    # Local environment keys (JWT secret, admin password hash)
└── README.md               # Setup and development guide
```

---

## ⚙️ Local Development Setup

Follow these simple commands to initialize and run both the client and the serverless backend locally on your system:

### 1. Configure Environment Variables
Create a `.env` file in your project root folder:
```env
JWT_SECRET=your_custom_secure_secret_phrase
ADMIN_PASSWORD_HASH='$2a$10$your_bcrypt_hash_for_admin_password'
```
> [!TIP]
> To generate a fresh custom password hash, you can run this command in your terminal:
> `node -e "console.log(require('bcryptjs').hashSync('your_new_password', 10))"`

### 2. Install Dependencies
Install the required packages directly in the monorepo root:
```bash
npm install
```

### 3. Run the Platform
You can run the frontend and backend concurrently or independently:

#### Run Backend Server Locally (Port 5000)
```bash
npm run dev:api
```
*(Or simply run `node api/index.js` to trigger local server loading)*
*Note: Since Upstash Redis environment variables are not present locally, the database will seamlessly fallback to reading and writing `api/db.json` automatically.*

#### Run Frontend Client Locally (Port 3000)
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser. The Vite local server is configured to proxy all `/api` requests to the backend server automatically!

---

## 🚀 Unified Production Deployment on Vercel

With this single-monorepo setup, you can deploy your entire application to Vercel in just a few clicks!

### Step 1: Push Your Code to GitHub
Ensure all your files are pushed to a public or private GitHub repository.

### Step 2: Create an Upstash Redis Database
1. Go to the [Upstash Console](https://console.upstash.com/) and sign in.
2. Click **Create Database**.
3. Name your database (e.g., `portfolio-redis`), select your region, and click **Create**.
4. Scroll down to the **REST API** section on your database details page and copy the following environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Import and Deploy to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** > **Project**.
2. Select your imported GitHub repository.
3. Configure the following project parameters:
   - **Framework Preset**: `Vite` (Vercel auto-detects this!)
   - **Root Directory**: **`./`** (Make sure this is set to the **root** folder of your repository)
   - **Build Command**: `vite build` (Auto-detected from root `package.json`)
   - **Output Directory**: `dist` (Vercel will compile the Vite client output)
4. Expand the **Environment Variables** section and add the following keys:
   - `JWT_SECRET` = `your_secure_jwt_token_secret`
   - `ADMIN_PASSWORD_HASH` = `your_bcrypt_hashed_admin_password`
   - `UPSTASH_REDIS_REST_URL` = `your_copied_upstash_rest_url`
   - `UPSTASH_REDIS_REST_TOKEN` = `your_copied_upstash_rest_token`
5. Click **Deploy**. Vercel will compile the assets and launch your premium portfolio! On the first API request, the serverless backend will detect an empty database and automatically seed your Upstash Redis with your initial projects!

---

## 🔑 Authentication Credentials

To access your secure admin dashboard at `/admin` on your production site:
- **Default password**: `admin123` (Ensure you hash a new one for production!)

Upon signing in, a JWT token is saved in your browser's `localStorage` and sent with all API requests. Sessions expire after 24 hours.

---

## 🛠️ Technologies Used

- **Client**: React, Vite, Lucide React, i18next & react-i18next (translation), @dnd-kit (drag-and-drop projects).
- **Serverless**: Vercel Serverless Functions, Node.js, Express, Cors (cross-origin validation), Multer (memory buffer file processing), Jsonwebtoken (secure JWT tokens), Bcryptjs (salted password comparisons).
- **Storage**: Upstash Redis with robust automatic fallback to local filesystem flat-file JSON (`db.json`).
