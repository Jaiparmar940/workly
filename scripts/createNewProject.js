#!/usr/bin/env node

/**
 * New Firebase Project Setup Guide
 * 
 * Since the current project has Storage configuration issues,
 * this guide helps create a new project with proper setup.
 */

console.log('🆕 New Firebase Project Setup Guide');
console.log('===================================\n');

console.log('❌ Current Issue:');
console.log('Firebase Storage is returning "storage/unknown" errors');
console.log('This indicates a fundamental configuration problem\n');

console.log('🚀 Solution: Create a New Firebase Project\n');

console.log('📋 Step-by-Step Instructions:\n');

console.log('1. 🔥 Create New Firebase Project:');
console.log('   • Go to: https://console.firebase.google.com/');
console.log('   • Click "Create a project"');
console.log('   • Name it: workly-new (or similar)');
console.log('   • Enable Google Analytics (optional)');
console.log('   • Choose Analytics account or create new');
console.log('   • Click "Create project"\n');

console.log('2. 🔧 Enable Required Services:');
console.log('   • Authentication:');
console.log('     - Go to Authentication > Sign-in method');
console.log('     - Enable "Email/Password"');
console.log('     - Save');
console.log('');
console.log('   • Firestore Database:');
console.log('     - Go to Firestore Database');
console.log('     - Click "Create database"');
console.log('     - Choose "Start in test mode"');
console.log('     - Select location (us-central1 recommended)');
console.log('');
console.log('   • Storage:');
console.log('     - Go to Storage');
console.log('     - Click "Get started"');
console.log('     - Choose "Start in test mode"');
console.log('     - Select location (us-central1 recommended)\n');

console.log('3. 📱 Get Configuration:');
console.log('   • Go to Project Settings (gear icon)');
console.log('   • Scroll to "Your apps"');
console.log('   • Click "Add app" > Web');
console.log('   • Register app with name: "Workly Web"');
console.log('   • Copy the config object\n');

console.log('4. 🔄 Update Your App:');
console.log('   • Replace config/firebase.ts with new config');
console.log('   • Update the config object with new values');
console.log('   • Test the app\n');

console.log('5. 🔐 Set Security Rules:');
console.log('   • Firestore Rules (Database > Rules):');
console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.postedBy == request.auth.uid;
    }
  }
}
`);
console.log('');
console.log('   • Storage Rules (Storage > Rules):');
console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /profilePictures/{userId} {
      allow read: if true;
    }
  }
}
`);

console.log('\n💡 Benefits of New Project:');
console.log('• Clean configuration');
console.log('• Proper Storage setup');
console.log('• No legacy issues');
console.log('• Better debugging');

console.log('\n⚠️  Important Notes:');
console.log('• You\'ll need to re-create any existing data');
console.log('• Users will need to sign up again');
console.log('• Consider migrating data if needed');

console.log('\n🔗 Quick Links:');
console.log('• Firebase Console: https://console.firebase.google.com/');
console.log('• Create Project: https://console.firebase.google.com/project/_/overview');
console.log('• Documentation: https://firebase.google.com/docs'); 