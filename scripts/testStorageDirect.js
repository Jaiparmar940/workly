#!/usr/bin/env node

/**
 * Direct Firebase Storage Test
 * 
 * Tests basic Storage access without authentication
 */

const { initializeApp } = require('firebase/app');
const { getStorage, ref, listAll } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyDB4h0rsimwMBgqT836xIhxXEE0MMMAnmE",
  authDomain: "workly-e411a.firebaseapp.com",
  projectId: "workly-e411a",
  storageBucket: "workly-e411a.appspot.com",
  messagingSenderId: "885804177924",
  appId: "1:885804177924:ios:1487bea6f313777a37b351"
};

async function testStorageDirect() {
  console.log('🔍 Direct Firebase Storage Test');
  console.log('===============================\n');

  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('✅ Firebase initialized');
    console.log('Storage bucket:', storage.app.options.storageBucket);
    console.log('Project ID:', firebaseConfig.projectId);
    
    console.log('\n📋 Testing basic Storage access...');
    
    // Try to list files in root (this should work even without auth if rules allow)
    const rootRef = ref(storage, '/');
    console.log('Root reference created:', rootRef.fullPath);
    
    try {
      const result = await listAll(rootRef);
      console.log('✅ Can access Storage root');
      console.log('Items found:', result.items.length);
      console.log('Prefixes found:', result.prefixes.length);
      
      if (result.items.length > 0) {
        console.log('Files in root:');
        result.items.forEach(item => console.log('  -', item.name));
      }
      
    } catch (listError) {
      console.log('❌ Cannot list files:', listError.message);
      console.log('Error code:', listError.code);
      
      if (listError.code === 'storage/unauthorized') {
        console.log('\n🔧 This suggests Storage rules are blocking access');
        console.log('Try updating rules to allow read access');
      } else if (listError.code === 'storage/bucket-not-found') {
        console.log('\n🔧 Storage bucket not found - check if Storage is enabled');
      } else {
        console.log('\n🔧 Unknown Storage error - check Firebase Console');
      }
    }
    
    console.log('\n🌐 Testing direct bucket access...');
    console.log('Bucket URL: https://storage.googleapis.com/workly-e411a.appspot.com/');
    console.log('Try visiting this URL in your browser to see if bucket is accessible');
    
  } catch (error) {
    console.log('❌ Firebase initialization failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('1. Firebase config is incorrect');
    console.log('2. Project does not exist');
    console.log('3. Network connectivity issues');
  }
}

testStorageDirect(); 