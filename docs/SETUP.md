# 🛠️ Detailed Setup Guide

This guide provides step-by-step instructions for configuring the Church Music Manager system environment.

## 📦 Prerequisites

Ensure you have the following installed:
- **Node.js**: [Download](https://nodejs.org/) (Version 18 or higher recommended)
- **Git**: [Download](https://git-scm.com/)
- **VS Code** (Optional but recommended)

## 🔥 Firebase Configuration

The system uses Firestore for the database and Firebase Hosting (optional).

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the steps.

### 2. Frontend Config (Firebase SDK)
1. In the Firebase console, go to **Project settings** > **General**.
2. Under "Your apps", click the **Web icon** (</>) to register a new app.
3. Copy the `firebaseConfig` object.
4. Go to `frontend/src/firebase.js` (or `.env`) and paste your configuration.

**Required `.env` for Frontend:**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Backend Config (Admin SDK)
1. In the Firebase console, go to **Project settings** > **Service accounts**.
2. Click **Generate new private key**.
3. Download the JSON file and keep it secure.
4. Convert the JSON fields into environment variables for the backend.

**Required `.env` for Backend:**
```env
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

## 🚀 Running Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

### Backend
```bash
cd backend
npm install
npm run dev # or node index.js
```
The API will be available at `http://localhost:5000`.

## 🧪 Development Workflow

- **Linting**: Run `npm run lint` in the frontend directory to ensure code quality.
- **Styling**: All styles are in `index.css` and individual component styles. Remember to follow the **no-rounded-corners** rule.

---

For issues or questions, please refer to the [Issue Tracker](https://github.com/KagoShinji/church-music-manager-system/issues).
