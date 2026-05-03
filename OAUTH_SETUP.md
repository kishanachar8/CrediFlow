# OAuth 2.0 Setup Guide for CrediFlow

This guide explains how to set up Google OAuth 2.0 authentication for the CrediFlow application.

## Overview

OAuth 2.0 has been integrated into CrediFlow alongside the existing email/password authentication. Users can now sign in using their Google account for a faster, more secure authentication experience.

## What's New

### Backend Changes
- **Passport Google Strategy**: Added Google OAuth 2.0 authentication strategy in `config/passport.js`
- **User Model Updates**: 
  - Password is now optional (required only for local auth)
  - Added `provider` field to track authentication method (local or google)
  - Added `googleId` field to store Google user ID
  - Added `profilePicture` field to store user's profile picture
- **Google Token Verification**: Backend verifies Google JWT tokens using `google-auth-library`
- **User Auto-Creation**: Users logging in with Google are automatically created if they don't exist
- **Session Support**: Added express-session for Passport session management

### Frontend Changes
- **GoogleLogin Component**: Integrated `@react-oauth/google` for frontend OAuth support
- **Google Button**: Added "Sign in with Google" button in the AuthView component
- **API Integration**: Added `loginWithGoogle()` method to handle credential submission
- **OAuth Handlers**: Added success and error handlers for Google authentication flow

### Environment Variables
See `.env.example` files in both backend and frontend directories for required configurations.

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Enter project name: `CrediFlow`
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required information (app name, user support email, etc.)
   - Add scopes: `profile`, `email`
   - Add your email as a test user
4. For application type, select "Web application"
5. Under "Authorized redirect URIs", add:
   - `http://localhost:5000/api/auth/google/callback` (backend callback)
   - `http://localhost:5173` (frontend - for development)
   - Production URLs when deploying
6. Click "Create"
7. Copy your **Client ID** and **Client Secret**

### Step 4: Configure Environment Variables

#### Backend (`backend/.env`)
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

#### Frontend (`frontend/.env`)
```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

**Important**: The `VITE_GOOGLE_CLIENT_ID` must match the `GOOGLE_CLIENT_ID` in the backend.

### Step 5: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 6: Run the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and test the Google login button!

## How OAuth Flow Works

1. **User clicks "Sign in with Google"** → Google login popup appears
2. **User authenticates with Google** → Google returns JWT credential token
3. **Frontend sends token to backend** → `/api/auth/google/token` endpoint
4. **Backend verifies token** → Uses `google-auth-library` to validate JWT signature
5. **User found or created** → Backend creates new user if needed, links Google ID
6. **Tokens issued** → CrediFlow access/refresh tokens are issued
7. **User authenticated** → User is logged in to the application

## Architecture

### Authentication Flow Diagram
```
┌─────────────────┐
│   Google Login  │
│     Popup       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Credential Token      ┌──────────────────┐
│    Frontend     │───────────────────────────▶│  Backend API     │
│  (AuthView)     │                             │  (/google/token) │
└────────┬────────┘      Access Token           └────────┬─────────┘
         │◀────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  User Dashboard  │
│   (Logged In)    │
└──────────────────┘
```

## Database Structure

### User Document
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: null,                    // null for OAuth users
  provider: "google",                // "local" or "google"
  googleId: "118234567890...",      // Google unique ID
  profilePicture: "https://...",    // From Google profile
  role: "user",
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

- ✅ **JWT Token Verification**: Backend verifies Google JWT signatures
- ✅ **Secure Credentials**: Client secrets stored only on backend
- ✅ **HTTPS Ready**: Secure cookie settings for production
- ✅ **Session Management**: Express-session with secure cookies
- ✅ **Token Rotation**: Refresh tokens are rotated on each use
- ✅ **CSRF Protection**: CSRF tokens for POST requests

## Troubleshooting

### "Invalid Client ID" Error
- Ensure `GOOGLE_CLIENT_ID` in backend matches `VITE_GOOGLE_CLIENT_ID` in frontend
- Check that credentials are correctly set in `.env` files

### "Redirect URI Mismatch"
- Verify that `http://localhost:5000/api/auth/google/callback` is added in Google Console
- Check the exact URL matches (no trailing slashes, correct protocol)

### "Token Verification Failed"
- Ensure `GOOGLE_CLIENT_SECRET` is correctly set in `backend/.env`
- Verify the token hasn't expired (credentials expire after some time)

### Login Button Not Appearing
- Confirm `@react-oauth/google` is installed: `npm list @react-oauth/google`
- Check browser console for any errors
- Ensure `VITE_GOOGLE_CLIENT_ID` is set in `frontend/.env`

## Testing

### Test Login Flow
1. Click "Sign in with Google"
2. Enter your Google credentials
3. Should see success message "Welcome to CrediFlow"
4. Dashboard should load with your account

### Test Account Linking
1. Create an account with email: `test@gmail.com` using password auth
2. Log out
3. Click "Sign in with Google"
4. Use the same Google account
5. You should be logged in to the same account

## Production Deployment

### Before Deploying

1. **Update OAuth Redirect URIs** in Google Console:
   - Remove localhost URIs
   - Add production domain: `https://yourdomain.com/api/auth/google/callback`

2. **Update Environment Variables**:
   ```bash
   # Production backend
   NODE_ENV=production
   SERVER_URL=https://yourdomain.com
   CLIENT_ORIGIN=https://yourdomain.com
   
   # Frontend
   VITE_API_URL=https://yourdomain.com
   ```

3. **Enable HTTPS**: Secure cookies require HTTPS in production

4. **Keep Secrets Safe**: Never commit `.env` files; use environment variables in CI/CD

## API Endpoints

### OAuth Routes
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google redirect callback
- `POST /api/auth/google/token` - Verify Google credential and issue tokens
- `GET /api/auth/google/token` - Get token (authenticated users only)

### Regular Auth Routes
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Google OAuth 2.0 documentation
3. Check browser console and backend logs for errors

---

**Happy authenticating! 🎉**
