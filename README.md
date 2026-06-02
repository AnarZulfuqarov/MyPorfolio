# Premium Bilingual Personal Portfolio Platform — Vercel Monorepo Edition

A sleek, responsive, and high-impact personal portfolio website built with a **React (JavaScript + Vite)** client and a lightweight **Node.js + Express** serverless backend. The entire platform features seamless two-language translation support (Azerbaijani/English) and integrates a secure **Admin CRUD Panel** to manage projects, jobs, and contact messages, fully backed by **Vercel KV** for production persistence and standard local fallback for offline coding.

---

## 🚀 Key Features

1. **Vercel Serverless Monorepo**: Frontend and backend co-exist in a single repository. Zero separate servers or external cloud platforms (like Railway/Heroku) are required!
2. **Robust Persistence via Vercel KV**: Dynamic portfolio state is saved in high-performance Redis database buckets using `@vercel/kv`.
3. **Auto-Healing Initial Database Seeding**: On the first launch, if Vercel KV is empty, the database automatically parses and seeds itself with your existing `api/db.json` data.
4. **Offline-Ready Local Fallback**: When running locally without Vercel Redis credentials, the server seamlessly falls back to reading and writing `api/db.json` automatically.
5. **Stunning Responsive Styling**: Custom dark/light mode toggle with smooth visual transitions, premium glassmorphism card components, and subtle entrance animations.
6. **Bilingual Integration (i18n)**: Out-of-the-box support for Azerbaijani (default) and English. Includes language toggles in the navbar and dynamic field translations.
7. **Serverless Image Uploads**: Refactored image upload flow utilizing Multer memory storage; newly uploaded images are automatically converted to **Base64 Data URIs** and saved directly in your database.
8. **Static Image Hosting (Vercel CDN)**: Existing image uploads are copied into the React compile bundle, served directly under `/uploads/...` with premium global edge caching.
9. **Protected Admin Panel**: Secure dashboard at `/admin` (protected by JWT authentication and bcrypt password hashing) enabling drag-and-drop projects reordering, jobsCRUD, and message checking.

---

## 📁 Monorepo Folder Structure

```
/
├── api/                    # Vercel Serverless Express API
│   ├── middleware/         # Security / JWT validation
│   ├── routes/             # CRUD endpoints (auth, projects, jobs, contact)
│   ├── db.js               # Vercel KV / Local JSON database connector
│   ├── db.json             # Seed database & local development storage
│   └── index.js            # Serverless backend entry point
├── client/                 # Frontend React Client
│   ├── public/             # Static public assets (CV, logos)
│   │   └── uploads/        # Preserved project portfolio images
│   └── src/
│       ├── i18n/           # Translation locales (az.json, en.json, index.js)
│       ├── pages/          # Main page components (Home, AdminLogin, AdminDashboard)
│       ├── App.jsx         # Routing, route guards, and theme states
│       ├── index.css       # Core HSL styling system & animations
│       └── main.jsx        # Mounting and i18n initialization
├── migrate-uploads.js      # Automated compile-time image migration utility
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
Install the required packages in both the monorepo root and the client folder:
```bash
# Install root packages (for Vercel functions)
npm install

# Install client packages
npm install --prefix client
```

### 3. Run the Platform
You can run the frontend and backend concurrently or independently:

#### Run Backend Server Locally (Port 5000)
```bash
npm run dev
```
*Note: Since Vercel KV environment variables are not present locally, the database will seamlessly fallback to reading and writing `api/db.json` automatically.*

#### Run Frontend Client Locally (Port 3000)
```bash
npm run dev --prefix client
```
Open `http://localhost:3000` in your web browser. The Vite local server is configured to proxy all `/api` requests to the backend server automatically!

---

## 🚀 Unified Production Deployment on Vercel

With this single-monorepo setup, you can deploy your entire application to Vercel in just a few clicks!

### Step 1: Push Your Code to GitHub
Ensure all your files are pushed to a public or private GitHub repository.

### Step 2: Create a Vercel KV Database (Redis)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on the **Storage** tab at the top.
3. Select **Create Database** and choose **KV (Redis)**.
4. Name your database (e.g., `portfolio-kv`) and select your closest region, then click **Create**.

### Step 3: Import and Deploy the Project
1. From the Vercel Dashboard home, click **Add New** > **Project**.
2. Select your imported GitHub repository.
3. Configure the following project parameters:
   - **Framework Preset**: `Other` (Vercel will read our root `vercel.json` and build command)
   - **Root Directory**: **`./`** (Make sure this is set to the **root** folder of your repository, not `client`)
   - **Build Command**: `npm run build` (Automatically detected from root `package.json`)
   - **Output Directory**: `client/dist` (Vercel will compile the Vite client output)
4. Expand the **Environment Variables** section and add:
   - `JWT_SECRET` = `your_secure_jwt_token_secret`
   - `ADMIN_PASSWORD_HASH` = `your_bcrypt_hashed_admin_password`
5. Click **Deploy**.

### Step 4: Link Vercel KV to Your Project
1. Once the initial deployment is completed, navigate to your Project Dashboard on Vercel.
2. Go to the **Storage** tab of your project.
3. Click **Connect Database** and select the KV database you created in **Step 2**.
4. Vercel will instantly inject the correct `KV_URL`, `KV_REST_API_URL`, and other Redis keys into your environment.
5. Redeploy your project (or push a new commit) for the environment variables to take effect! On the first request, the serverless backend will detect an empty database and automatically seed your KV Redis with your initial projects!

---

## 🔑 Authentication Credentials

To access your secure admin dashboard at `/admin` on your production site:
- **Default password**: `admin123` (Ensure you hash a new one for production!)

Upon signing in, a JWT token is saved in your browser's `localStorage` and sent with all API requests. Sessions expire after 24 hours.

---

## 🛠️ Technologies Used

- **Client**: React, Vite, Lucide React, i18next & react-i18next (translation), @dnd-kit (drag-and-drop projects).
- **Serverless**: Vercel Serverless Functions, Node.js, Express, Cors (cross-origin validation), Multer (memory buffer file processing), Jsonwebtoken (secure JWT tokens), Bcryptjs (salted password comparisons).
- **Storage**: Vercel KV (Redis) with robust automatic fallback to local filesystem flat-file JSON (`db.json`).
