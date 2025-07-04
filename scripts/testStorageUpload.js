#!/usr/bin/env node

/**
 * Firebase Storage Upload Test Script
 * 
 * This script tests actual Firebase Storage upload functionality with proper authentication.
 */

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDB4h0rsimwMBgqT836xIhxXEE0MMMAnmE",
  authDomain: "workly-e411a.firebaseapp.com",
  projectId: "workly-e411a",
  storageBucket: "workly-e411a.appspot.com",
  messagingSenderId: "885804177924",
  appId: "1:885804177924:ios:1487bea6f313777a37b351"
};

async function testStorageUpload() {
  console.log('🧪 Testing Firebase Storage Upload with Authentication');
  console.log('=====================================================\n');

  console.log('📋 Prerequisites:');
  console.log('1. Enable Email/Password authentication in Firebase Console');
  console.log('2. Create a test user account in your app');
  console.log('3. Update the email and password below\n');

  // Update these with a real user account from your app
  const testEmail = 'test@example.com'; // Replace with real email
  const testPassword = 'password123';   // Replace with real password

  if (testEmail === 'test@example.com') {
    console.log('❌ Please update the test email and password in this script first');
    console.log('Create a user account in your app, then update the credentials above');
    return;
  }

  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized');
    console.log('Storage bucket:', storage.app.options.storageBucket);
    
    console.log('\n🔐 Testing authentication...');
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Authenticated as:', userCredential.user.uid);
    console.log('Email verified:', userCredential.user.emailVerified);
    
    console.log('\n📤 Testing upload...');
    const testRef = ref(storage, `profilePictures/${userCredential.user.uid}.jpg`);
    console.log('Upload path:', testRef.fullPath);
    
    const testBlob = new Blob(['Test profile image data'], { type: 'image/jpeg' });
    console.log('Blob size:', testBlob.size, 'bytes');
    
    console.log('Uploading...');
    await uploadBytes(testRef, testBlob);
    console.log('✅ Upload successful!');
    
    console.log('\n📥 Testing download URL...');
    const downloadURL = await getDownloadURL(testRef);
    console.log('✅ Download URL obtained:', downloadURL);
    
    console.log('\n🎉 Storage test completed successfully!');
    console.log('\n💡 Your Firebase Storage is properly configured!');
    console.log('Profile picture uploads should work in your app.');
    
  } catch (error) {
    console.log('❌ Storage test failed:', error.message);
    console.log('Error code:', error.code);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n🔧 Solution: Create a test user account in your app first');
      console.log('1. Run your app');
      console.log('2. Sign up with the email/password above');
      console.log('3. Run this test again');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n🔧 Solution: Update the password in this script');
    } else if (error.code === 'storage/unauthorized') {
      console.log('\n🔧 Solution: Set Storage security rules to allow authenticated uploads');
      console.log('Go to: https://console.firebase.google.com/project/workly-e411a/storage/rules');
      console.log('Use the rules from setupStorage.js');
    } else if (error.code === 'storage/bucket-not-found') {
      console.log('\n🔧 Solution: Enable Firebase Storage');
      console.log('Go to: https://console.firebase.google.com/project/workly-e411a/storage');
      console.log('Click "Get started" to enable Storage');
    }
  }
}

testStorageUpload(); 