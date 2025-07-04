#!/usr/bin/env node

/**
 * Test Image Upload Implementation
 * 
 * Tests the improved uploadProfileImage method with different URI formats.
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

async function testImageUpload() {
  console.log('🧪 Testing Improved Image Upload');
  console.log('=================================\n');

  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized');
    
    // Test with a sample user (you'll need to create this)
    const testEmail = 'test@workly.com';
    const testPassword = 'testpass123';
    
    console.log('\n🔐 Testing authentication...');
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Authenticated as:', userCredential.user.uid);
    
    console.log('\n📤 Testing image upload with different URI formats...');
    
    // Test 1: Data URI (should work in any environment)
    console.log('\nTest 1: Data URI');
    const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    try {
      const imageRef = ref(storage, `test/data-uri-test-${Date.now()}.jpg`);
      const response = await fetch(dataUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });
      const downloadURL = await getDownloadURL(imageRef);
      console.log('✅ Data URI upload successful:', downloadURL);
    } catch (error) {
      console.log('❌ Data URI upload failed:', error.message);
    }
    
    // Test 2: Profile picture path
    console.log('\nTest 2: Profile Picture Path');
    try {
      const profilePicRef = ref(storage, `profilePictures/${userCredential.user.uid}-test.jpg`);
      const response = await fetch(dataUri);
      const blob = await response.blob();
      await uploadBytes(profilePicRef, blob, { 
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedBy: userCredential.user.uid,
          uploadedAt: new Date().toISOString(),
          test: 'true'
        }
      });
      const downloadURL = await getDownloadURL(profilePicRef);
      console.log('✅ Profile picture upload successful:', downloadURL);
    } catch (error) {
      console.log('❌ Profile picture upload failed:', error.message);
      console.log('Error code:', error.code);
    }
    
    console.log('\n🎉 Upload tests completed!');
    console.log('\n💡 If these tests pass, the issue is likely:');
    console.log('1. Expo Go limitations (try development build)');
    console.log('2. Image picker URI format issues');
    console.log('3. Network connectivity in React Native');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Error code:', error.code);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log('\n🔧 To test with authentication:');
      console.log('1. Create a test user in your app');
      console.log('2. Update the email/password in this script');
      console.log('3. Run the test again');
    }
  }
}

testImageUpload(); 