#!/usr/bin/env node

/**
 * Comprehensive Firebase Storage Debug Script
 * 
 * This script tests multiple aspects of Firebase Storage to identify the issue.
 */

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, listAll } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDB4h0rsimwMBgqT836xIhxXEE0MMMAnmE",
  authDomain: "workly-e411a.firebaseapp.com",
  projectId: "workly-e411a",
  storageBucket: "workly-e411a.appspot.com",
  messagingSenderId: "885804177924",
  appId: "1:885804177924:ios:1487bea6f313777a37b351"
};

async function debugStorage() {
  console.log('🔍 Firebase Storage Debug Analysis');
  console.log('==================================\n');

  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized');
    console.log('Storage bucket:', storage.app.options.storageBucket);
    console.log('Project ID:', firebaseConfig.projectId);
    
    // Test 1: Check if we can list files (read access)
    console.log('\n📋 Test 1: Checking Storage read access...');
    try {
      const rootRef = ref(storage, '/');
      const result = await listAll(rootRef);
      console.log('✅ Can list files in Storage');
      console.log('Files found:', result.items.length);
    } catch (error) {
      console.log('❌ Cannot list files:', error.message);
      console.log('This suggests Storage rules are blocking read access');
    }
    
    // Test 2: Try to authenticate with a test user
    console.log('\n🔐 Test 2: Testing authentication...');
    try {
      // Use a test account - you'll need to create this
      const testEmail = 'test@workly.com';
      const testPassword = 'testpass123';
      
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Authentication successful');
      console.log('User UID:', userCredential.user.uid);
      console.log('Email verified:', userCredential.user.emailVerified);
      
      // Test 3: Try upload to user's own folder
      console.log('\n📤 Test 3: Testing upload to user folder...');
      const userFolderRef = ref(storage, `profilePictures/${userCredential.user.uid}/test.txt`);
      console.log('Upload path:', userFolderRef.fullPath);
      
      const testBlob = new Blob(['Test upload'], { type: 'text/plain' });
      await uploadBytes(userFolderRef, testBlob);
      console.log('✅ Upload to user folder successful!');
      
      // Test 4: Try upload to root test folder
      console.log('\n📤 Test 4: Testing upload to root test folder...');
      const rootTestRef = ref(storage, `test-upload-${Date.now()}.txt`);
      console.log('Upload path:', rootTestRef.fullPath);
      
      await uploadBytes(rootTestRef, testBlob);
      console.log('✅ Upload to root test folder successful!');
      
      // Test 5: Try the exact profile picture path
      console.log('\n📤 Test 5: Testing exact profile picture path...');
      const profilePicRef = ref(storage, `profilePictures/${userCredential.user.uid}.jpg`);
      console.log('Upload path:', profilePicRef.fullPath);
      
      const imageBlob = new Blob(['Fake image data'], { type: 'image/jpeg' });
      await uploadBytes(profilePicRef, imageBlob);
      console.log('✅ Profile picture upload successful!');
      
      // Test 6: Get download URL
      console.log('\n📥 Test 6: Testing download URL...');
      const downloadURL = await getDownloadURL(profilePicRef);
      console.log('✅ Download URL obtained:', downloadURL);
      
      console.log('\n🎉 All tests passed! Storage is working correctly.');
      console.log('\n💡 The issue might be:');
      console.log('1. Network connectivity in React Native');
      console.log('2. Image format/size issues');
      console.log('3. React Native specific Firebase configuration');
      
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
      console.log('\n🔧 To test with authentication:');
      console.log('1. Create a test user in your app');
      console.log('2. Update the email/password in this script');
      console.log('3. Run the test again');
      
      // Test without authentication (if rules allow)
      console.log('\n📤 Test 3: Testing upload without authentication...');
      try {
        const publicTestRef = ref(storage, `public-test-${Date.now()}.txt`);
        const testBlob = new Blob(['Public test'], { type: 'text/plain' });
        await uploadBytes(publicTestRef, testBlob);
        console.log('✅ Upload without auth successful!');
        console.log('Storage rules allow public uploads');
      } catch (uploadError) {
        console.log('❌ Upload without auth failed:', uploadError.message);
        console.log('Storage rules require authentication');
      }
    }
    
  } catch (error) {
    console.log('❌ Firebase initialization failed:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check internet connection');
    console.log('2. Verify Firebase config');
    console.log('3. Check if Storage is enabled in Firebase Console');
  }
}

debugStorage(); 