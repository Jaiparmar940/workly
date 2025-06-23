# Authentication System

This document describes the Firebase Authentication system implemented in the Workly app.

## Overview

The authentication system provides secure user registration, login, and session management using Firebase Authentication and Firestore for user profile data.

## Features

- **User Registration**: Complete signup form with profile creation
- **User Login**: Email/password authentication
- **Password Reset**: Email-based password recovery
- **Session Management**: Automatic authentication state tracking
- **Protected Routes**: Authentication-based navigation
- **User Profiles**: Extended user data stored in Firestore

## Architecture

### Components

1. **AuthContext** (`contexts/AuthContext.tsx`)
   - Provides authentication state and methods throughout the app
   - Manages user sessions and profile data

2. **useAuth Hook** (`hooks/useAuth.ts`)
   - Core authentication logic
   - Firebase Auth integration
   - Error handling and user-friendly messages

3. **Authentication Pages**
   - `app/login.tsx` - User login
   - `app/signup.tsx` - User registration
   - `app/forgot-password.tsx` - Password reset

4. **LoadingScreen** (`components/LoadingScreen.tsx`)
   - Loading states during authentication checks

### Data Flow

1. **App Startup**
   - AuthProvider initializes
   - useAuth hook checks Firebase Auth state
   - Loading screen shown during check
   - Redirects to login or main app based on auth state

2. **User Registration**
   - User fills signup form
   - Firebase Auth creates user account
   - User profile created in Firestore
   - User redirected to main app

3. **User Login**
   - User enters credentials
   - Firebase Auth validates
   - User profile loaded from Firestore
   - User redirected to main app

4. **Session Management**
   - Auth state monitored automatically
   - Profile data cached and updated
   - Logout clears all data

## User Profile Structure

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  skills: string[];
  experience: string;
  interests: string[];
  rating: number;
  completedJobs: number;
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
}
```

## Firebase Configuration

### Authentication
- Email/password authentication enabled
- Password reset via email
- User profile updates

### Firestore Security Rules
```javascript
// Users can read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Anyone can read jobs, authenticated users can create
match /jobs/{jobId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
    resource.data.postedBy == request.auth.uid;
}
```

## Usage

### In Components

```typescript
import { useAuthContext } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, userProfile, signIn, signUp, logout } = useAuthContext();
  
  // Access user data
  if (user) {
    console.log('User ID:', user.uid);
    console.log('User Profile:', userProfile);
  }
}
```

### Authentication Methods

```typescript
// Sign in
await signIn(email, password);

// Sign up
await signUp(email, password, userData);

// Logout
await logout();

// Reset password
await resetPassword(email);
```

## Error Handling

The system provides user-friendly error messages for common authentication issues:

- Invalid email/password
- Email already in use
- Weak password
- Network errors
- User not found

## Security Features

- Password validation (minimum 6 characters)
- Email validation
- Secure Firebase Auth integration
- Firestore security rules
- Session management
- Automatic logout on auth state change

## Future Enhancements

- Social authentication (Google, Facebook, Apple)
- Email verification
- Two-factor authentication
- Profile image upload
- Account deletion
- Privacy settings
- Activity logging

## Setup Instructions

1. **Firebase Configuration**
   - Enable Authentication in Firebase Console
   - Enable Email/Password sign-in method
   - Configure Firestore security rules
   - Set up password reset email templates

2. **Environment Variables**
   - Ensure Firebase config is properly set in `config/firebase.ts`

3. **Testing**
   - Test user registration flow
   - Test login/logout functionality
   - Test password reset
   - Verify profile data persistence

## Troubleshooting

### Common Issues

1. **Authentication State Not Updating**
   - Check Firebase Auth configuration
   - Verify Firestore security rules
   - Check network connectivity

2. **Profile Data Not Loading**
   - Verify user document exists in Firestore
   - Check Firestore security rules
   - Review error logs

3. **Navigation Issues**
   - Ensure all routes are properly configured
   - Check authentication state management
   - Verify router configuration

### Debug Mode

Enable debug logging by adding console logs in the useAuth hook:

```typescript
console.log('Auth state changed:', user);
console.log('Profile loaded:', userProfile);
``` 