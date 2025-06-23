#!/usr/bin/env node

/**
 * Firebase Setup Script for Workly
 * 
 * This script helps you configure Firebase for your Workly job posting app.
 * Follow the steps below to set up your Firebase project.
 */

console.log('🔥 Firebase Setup for Workly Job Posting App');
console.log('=============================================\n');

console.log('📋 Setup Instructions:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Enable Firestore Database');
console.log('4. Get your Firebase configuration');
console.log('5. Update the config/firebase.ts file with your credentials\n');

console.log('🔧 Required Firebase Services:');
console.log('✅ Firestore Database (for storing jobs, users, applications)');
console.log('✅ Authentication (optional, for user management)');
console.log('✅ Storage (optional, for file uploads)\n');

console.log('📁 Firestore Collections:');
console.log('• users - User profiles and information');
console.log('• jobs - Job postings and details');
console.log('• applications - Job applications and status');
console.log('• jobMatches - AI-generated job matches\n');

console.log('🔐 Security Rules (Firestore):');
console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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
    
    // Users can manage their own applications
    match /applications/{applicationId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.jobId in get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.postedBy);
    }
    
    // Job matches are read-only for users
    match /jobMatches/{matchId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only system can create matches
    }
  }
}
`);

console.log('🚀 Next Steps:');
console.log('1. Update config/firebase.ts with your Firebase config');
console.log('2. Run the database seeder: npm run seed-database');
console.log('3. Start the app: npm start\n');

console.log('💡 Tips:');
console.log('• Use Firebase Authentication for secure user management');
console.log('• Set up proper security rules for production');
console.log('• Consider using Firebase Functions for AI matching');
console.log('• Enable Firebase Analytics for insights\n');

console.log('📚 Documentation:');
console.log('• Firebase Console: https://console.firebase.google.com/');
console.log('• Firestore Docs: https://firebase.google.com/docs/firestore');
console.log('• React Native Firebase: https://rnfirebase.io/'); 