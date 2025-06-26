const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Your Firebase config (you'll need to add this)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsers() {
  console.log('🔄 Starting user migration...');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user already has the new fields
      if (userData.accountType && userData.workerProfileComplete !== undefined) {
        console.log(`⏭️ Skipping user ${userData.email} - already migrated`);
        skippedCount++;
        continue;
      }
      
      // Determine account type and worker profile completion based on existing data
      // For existing users, we'll assume they're personal accounts with complete worker profiles
      // since they likely went through the onboarding process
      const updates = {
        accountType: 'personal',
        workerProfileComplete: true
      };
      
      // Update the user document
      await updateDoc(doc(db, 'users', userDoc.id), updates);
      console.log(`✅ Migrated user ${userData.email}`);
      migratedCount++;
    }
    
    console.log(`🎉 Migration completed!`);
    console.log(`✅ Migrated: ${migratedCount} users`);
    console.log(`⏭️ Skipped: ${skippedCount} users (already migrated)`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateUsers()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 