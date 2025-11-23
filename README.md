# 🎓 Student Management System

A Vue 3 application for managing students, courses, attendance, and marks with Firebase backend.

## Features

- 👥 Student Management (CRUD operations)
- 📚 Course Assignment & Management
- 📊 Attendance Tracking
- 📝 Marks Management
- 🔐 Authentication (Admin/Teacher roles)
- 🌙 Dark/Light Theme
- 📱 Responsive Design
- 🎨 Reusable Base UI Components

## Tech Stack

- **Frontend**: Vue 3, Vue Router, Pinia
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Build**: Vite
- **Testing**: Vitest, Cypress

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run deploy       # Build and deploy to Firebase
```

## Project Structure

```
src/
├── components/      # Reusable components
│   └── base/       # Base UI components
├── composables/    # Vue composables
├── config/         # Firebase config
├── layouts/        # Layout components
├── pages/          # Page components
├── router/         # Vue Router config
├── services/       # API services
└── stores/         # Pinia stores
```

## Authentication

Demo accounts:
- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123

## Firebase Setup

1. Create a Firebase project
2. Enable Firestore and Authentication
3. Copy configuration to `.env.local`
4. Deploy security rules from `firebase.json`

## License

MIT
