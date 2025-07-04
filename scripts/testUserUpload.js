#!/usr/bin/env node

/**
 * Test Profile Picture Upload with Real User
 * 
 * This script tests upload using the actual user from the logs.
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

async function testUserUpload() {
  console.log('🧪 Testing Profile Picture Upload with Real User');
  console.log('================================================\n');

  // Use the actual user from the logs
  const testEmail = 'jp04@gmail.com';
  const testPassword = 'password123'; // You'll need to provide the actual password

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
    console.log('Email:', userCredential.user.email);
    console.log('Email verified:', userCredential.user.emailVerified);
    
    console.log('\n📤 Testing profile picture upload...');
    const profilePicRef = ref(storage, `profilePictures/${userCredential.user.uid}.jpg`);
    console.log('Upload path:', profilePicRef.fullPath);
    
    // Create a simple test image blob
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    const testBlob = new Blob(['Test profile image'], { type: 'image/jpeg' });
    console.log('Blob size:', testBlob.size, 'bytes');
    
    console.log('Uploading...');
    await uploadBytes(profilePicRef, testBlob);
    console.log('✅ Upload successful!');
    
    console.log('\n📥 Testing download URL...');
    const downloadURL = await getDownloadURL(profilePicRef);
    console.log('✅ Download URL obtained:', downloadURL);
    
    console.log('\n🎉 Profile picture upload test completed successfully!');
    console.log('\n💡 The issue might be:');
    console.log('1. Storage security rules are too restrictive');
    console.log('2. Network connectivity in the React Native app');
    console.log('3. Image format or size issues');
    
  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
    console.log('Error code:', error.code);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log('\n🔧 Solution: Update the password in this script');
      console.log('Current email:', testEmail);
      console.log('Please provide the correct password for testing');
    } else if (error.code === 'storage/unauthorized') {
      console.log('\n🔧 Solution: Check Storage security rules');
      console.log('Make sure rules allow: request.auth != null && request.auth.uid == userId');
    } else if (error.code === 'storage/bucket-not-found') {
      console.log('\n🔧 Solution: Enable Firebase Storage');
      console.log('Go to: https://console.firebase.google.com/project/workly-e411a/storage');
    } else {
      console.log('\n🔧 Unknown error - check Firebase Console for more details');
    }
  }
}

testUserUpload(); 