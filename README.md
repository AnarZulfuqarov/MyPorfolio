# Premium Bilingual Personal Portfolio Platform

A sleek, responsive, and high-impact personal portfolio website built with a **React (JavaScript + Vite)** client and a lightweight **Node.js + Express** server. The entire platform features seamless two-language translation support (Azerbaijani/English) and integrates a secure **Admin CRUD Panel** to manage projects, jobs, and contact messages in a local `db.json` database.

---

## Key Features

1. **Stunning Responsive Styling**: Custom dark/light mode toggle with smooth visual transitions, premium glassmorphism card components, and subtle entrance animations.
2. **Bilingual Integration (i18n)**: Out-of-the-box support for Azerbaijani (default) and English. Includes language toggles in the navbar and dynamic field translations from `db.json` database values.
3. **Smooth Single-Page Scroll**: Seamless anchor scroll navigation with responsive scroll-spy navbar indicator highlights.
4. **Admin Dashboard**: Full CRUD panel under `/admin` (protected by JWT authentication and bcrypt password hashing) enabling adding, updating, and deleting projects (with image file uploads) and work history.
5. **Dynamic Local DB Storage**: Flat-file database in `server/db.json` using the node standard `fs/promises` library for operations.

---

## Folder Structure

```
/
├── client/                 # Frontend React Client
│   ├── public/             # Static public assets (CV, icons)
│   │   └── cv.pdf          # Zülfüqar's Curriculum Vitae file
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

## Authentication Credentials

To access the secure admin dashboard at `http://localhost:5173/admin`:
- **Default password**: `admin123`

Upon signing in, a JWT token is saved in your browser's `localStorage` and sent with all API requests. Sessions expire after 24 hours.

---

## Technologies Used

- **Client**: React, Vite (React Hot-Reloading), Lucide React (vector icons), i18next & react-i18next (translation context).
- **Server**: Node.js, Express, Cors (cross-origin controls), Multer (multipart form image uploads), Jsonwebtoken (JWT secure tokens), Bcryptjs (salted password comparisons).
- **Storage**: Flat-file JSON (`db.json`) accessed via Node's native `fs/promises`.
