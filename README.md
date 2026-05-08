# Academic Professor Portfolio

A modern, responsive, and full-stack personal portfolio website designed for academic professionals, professors, and researchers. This application is built as a single-page application integrating a beautiful React frontend with a robust Express/SQLite backend.

## 🚀 Features

- **Dynamic Public Portfolio**: Clean and elegant landing page showcasing biography, research interests, publications, teaching history, and a photo gallery.
- **Admin Dashboard**: Secured via JWT authentication, allowing the professor/admin to:
  - Manage profile details (Name, Titles, Email, URLs for Google Scholar, ResearchGate, Scopus, ORCID).
  - Upload profile photos and university logos.
  - Add, edit, and delete Academic Journals and Authored Books.
  - Upload PDF files for publications.
  - Add and manage teaching courses and histories.
  - Share image galleries with custom captions.
  - Change admin password securely.
- **Search & Filtering**: Real-time searching and filtering for academic journals and authored books.
- **RESTful API**: Custom backend supporting CRUD operations.
- **Responsive UI/UX**: Built Mobile-First with modern design principles utilizing Tailwind CSS.

## 🛠️ Tech Stack & Structure

### **Frontend**
- **React (v19)**: Component-based UI library.
- **Vite (v6)**: Extremely fast frontend tooling.
- **Tailwind CSS (v4)**: Utility-first CSS framework for rapid UI development.
- **React Router DOM (v7)**: Declarative routing for single-page applications.
- **Zustand (v5)**: Small and fast state-management tool (profile store).
- **Framer Motion / Motion**: Production-ready animation library.
- **Lucide React**: Beautiful and consistent SVG icons.
- **React Helmet Async**: Document head management for SEO.

### **Backend**
- **Node.js Environment**: For full-stack execution context.
- **Express.js (v4)**: Fast, unopinionated web framework handling the REST API.
- **Better SQLite3 (v12)**: The fastest and simplest SQLite3 library in Node.js.
- **Bcryptjs**: Password-hashing function secure authentication.
- **JSONWebToken (JWT)**: Secure user-to-server admin authentication.
- **Multer**: Middleware for handling `multipart/form-data` and file uploads (Images and PDFs).

## 📂 Project Structure

```text
├── package.json         # Project metadata and dependencies
├── server.ts            # Main application entry point uniting Express.js and Vite dev server
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── dist/                # Production build artifacts (compiled frontend & backend)
├── uploads/             # Destination folder for user-uploaded images and documents
└── src/
    ├── components/      # Reusable React components (Sidebar, Loading, etc.)
    ├── hooks/           # Custom React hooks
    ├── pages/           # Route-level components
    │   ├── Home.tsx            # Main public-facing portfolio
    │   ├── AdminDashboard.tsx  # Secure management portal
    │   ├── Login.tsx           # Admin authentication portal
    │   ├── Publications.tsx    # Dedicated publications page
    │   ├── Teaching.tsx        # Dedicated teaching page
    │   └── Gallery.tsx         # Dedicated photo gallery page
    ├── server/          # Backend code
    │   ├── db.ts               # Database configuration and schemas
    │   └── routes.ts           # REST API routes and endpoints
    ├── store/           # Zustand state stores (useProfileStore.ts)
    ├── App.tsx          # Main React App routing structure
    ├── index.css        # Global CSS imports and Tailwind directives
    └── main.tsx         # React application mounting point
```

## 🔒 Security Practices
- Environment Variables are safely handled.
- Passwords stored in SQLite are hashed using `bcryptjs`.
- JWT-protected `/api/` endpoints ensuring only authenticated admins can manage data.
- Basic security headers handled where necessary.

## 🏁 How to Run

When running this app in your local or production environment, it leverages an Express custom server which integrates Vite dynamically in development mode.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Start Production Server
```bash
npm run start
```
