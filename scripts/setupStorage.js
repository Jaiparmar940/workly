#!/usr/bin/env node

/**
 * Firebase Storage Setup Script for Workly
 * 
 * This script helps you configure Firebase Storage for profile picture uploads.
 */

console.log('🔥 Firebase Storage Setup for Workly');
console.log('=====================================\n');

console.log('📋 Storage Setup Instructions:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your project: workly-e411a');
console.log('3. Go to Storage in the left sidebar');
console.log('4. Click "Get started" if Storage is not enabled');
console.log('5. Choose a location (us-central1 recommended)');
console.log('6. Start in test mode (for development)\n');

console.log('🔐 Storage Security Rules:');
console.log('Copy and paste these rules in Firebase Console > Storage > Rules:');
console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload and read their own profile pictures
    match /profilePictures/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to profile pictures (optional)
    match /profilePictures/{userId} {
      allow read: if true;
    }
  }
}
`);

console.log('🚀 Next Steps:');
console.log('1. Enable Firebase Storage in your project');
console.log('2. Set the security rules above');
console.log('3. Test profile picture upload in the app\n');

console.log('💡 Tips:');
console.log('• Start with test mode for development');
console.log('• Use production rules for live apps');
console.log('• Monitor Storage usage in Firebase Console');
console.log('• Consider image compression for cost optimization\n');

console.log('📚 Documentation:');
console.log('• Firebase Storage: https://firebase.google.com/docs/storage');
console.log('• Security Rules: https://firebase.google.com/docs/storage/security');
console.log('• React Native: https://rnfirebase.io/storage/usage'); 