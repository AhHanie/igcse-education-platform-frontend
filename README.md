# Vite React TypeScript Starter

A starter project built with:

- **Vite** (React + TypeScript)
- **React Router**
- **Zustand** for state management
- **Material UI** + Icons
- Clean, scalable folder structure

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have the following installed:

- **Node.js** (LTS recommended)
- **npm**, **pnpm**, or **yarn**  
  *(Commands here use npm by default)*

---

## 📦 Create the Project

If you're creating the project from scratch using Vite:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

---

## 📥 Install Dependencies

```bash
npm install \
  react-router-dom \
  @mui/material @emotion/react @emotion/styled \
  @mui/icons-material \
  zustand
```

If you cloned or downloaded an existing repo instead:

```bash
npm install
```

---

## 🏃 Run the Development Server

```bash
npm run dev
```

Open the URL printed in the terminal (usually **http://localhost:5173**).

---

## 🏗️ Build for Production

```bash
npm run build
```

Output will be inside the **dist/** folder.

---

## 🔎 Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
src
├── app
│   ├── store          # Global Zustand stores
│   ├── router         # React Router config
│   └── theme          # Material UI theme
├── components
│   ├── layout         # Layout components
│   └── common         # Shared UI components
├── features           # Domain-specific features
├── hooks              # Custom reusable hooks
├── pages              # Route pages
├── styles             # Global CSS
├── main.tsx           # Entry point
└── App.tsx            # Root component
```

---

## 🛠️ Technologies Used

- **Vite** for fast development
- **React + TypeScript** for robust UI
- **React Router** for navigation
- **Zustand** for state management
- **Material UI** for UI components & theming
- **MUI Icons** for icons

---

## ⭐ Notes

This setup is designed for scalability while staying simple and clean.  
You can easily expand the structure with more features, layout variations, or state slices as your app grows.
