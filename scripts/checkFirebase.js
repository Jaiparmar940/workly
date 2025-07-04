#!/usr/bin/env node

/**
 * Firebase Configuration Check Script
 * 
 * This script helps diagnose Firebase configuration issues.
 */

const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDB4h0rsimwMBgqT836xIhxXEE0MMMAnmE",
  authDomain: "workly-e411a.firebaseapp.com",
  projectId: "workly-e411a",
  storageBucket: "workly-e411a.appspot.com",
  messagingSenderId: "885804177924",
  appId: "1:885804177924:ios:1487bea6f313777a37b351"
};

console.log('🔍 Firebase Configuration Check');
console.log('================================\n');

console.log('📋 Configuration Details:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');

try {
  console.log('\n🚀 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  console.log('\n📊 Testing Services...');
  
  // Test Firestore
  try {
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
  } catch (error) {
    console.log('❌ Firestore error:', error.message);
  }
  
  // Test Auth
  try {
    const auth = getAuth(app);
    console.log('✅ Authentication initialized');
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
  }
  
  // Test Storage
  try {
    const storage = getStorage(app);
    console.log('✅ Storage initialized');
    console.log('Storage bucket:', storage.app.options.storageBucket);
  } catch (error) {
    console.log('❌ Storage error:', error.message);
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. If Storage shows an error, enable it in Firebase Console');
  console.log('2. Go to: https://console.firebase.google.com/project/workly-e411a/storage');
  console.log('3. Click "Get started" to enable Storage');
  console.log('4. Set security rules as shown in setupStorage.js');
  
} catch (error) {
  console.log('❌ Firebase initialization failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your internet connection');
  console.log('2. Verify the Firebase config in config/firebase.ts');
  console.log('3. Ensure the project exists and is accessible');
} 