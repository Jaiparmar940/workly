# Sample Job Population Script

This script populates your Firestore database with realistic sample jobs across various categories to help you test and demonstrate the Workly platform.

## Features

The script creates **30+ realistic jobs** across the following categories:

- **Web Development** (React, WordPress, Full-stack)
- **Design** (Logo design, UI/UX, Social media graphics)
- **Content Writing** (Blog writing, Product descriptions, Technical docs)
- **Digital Marketing** (Google Ads, Social media, SEO)
- **Mobile Development** (iOS, React Native, Android)
- **Data & Analytics** (Data analysis, BI dashboards, Excel VBA)
- **Virtual Assistant** (Executive VA, Customer service, Social media)
- **Translation** (Spanish, French, Chinese)
- **Video & Animation** (Product demos, Logo animation, YouTube editing)
- **Photography** (Real estate, Product, Event)

## Setup Instructions

### 1. Update Firebase Configuration

Edit `scripts/populateSampleJobs.js` and replace the Firebase config with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 2. Update Sample User IDs

Replace the sample user IDs with actual user IDs from your database:

```javascript
const SAMPLE_USER_IDS = [
  'actual-user-id-1',
  'actual-user-id-2', 
  'actual-user-id-3',
  'actual-user-id-4',
  'actual-user-id-5'
];
```

To get actual user IDs, you can:
- Check your Firestore `users` collection
- Use the Firebase console to view existing users
- Create test users first if needed

### 3. Install Dependencies

Make sure you have the required dependencies:

```bash
npm install firebase
```

### 4. Run the Script

```bash
node scripts/populateSampleJobs.js
```

## Job Data Structure

Each job includes:

- **Title**: Professional job title
- **Description**: Detailed project description
- **Category**: Job category for filtering
- **Location**: City and state
- **Budget**: Min/max budget range
- **Duration**: Project timeline
- **Skills**: Required skills array
- **Posted By**: User ID of the job poster
- **Status**: Job status (open/closed)
- **Urgency**: High/medium/low
- **Remote Work**: Boolean for remote work option
- **Experience Level**: Beginner/intermediate/expert
- **Views**: Random view count (10-60)
- **Applications**: Empty array for new jobs
- **Timestamps**: Created/updated timestamps

## Customization

### Adding More Jobs

To add more jobs, simply add new objects to the `SAMPLE_JOBS` array:

```javascript
{
  title: "Your Job Title",
  description: "Detailed job description...",
  category: "Category Name",
  location: "City, State",
  budget: { min: 500, max: 1000 },
  duration: "2-3 weeks",
  skills: ["Skill 1", "Skill 2", "Skill 3"],
  postedBy: SAMPLE_USER_IDS[0],
  status: "open",
  urgency: "medium",
  remoteWork: true,
  experienceLevel: "intermediate"
}
```

### Modifying Categories

You can add new categories by:
1. Adding jobs with new category names
2. Updating your app's category filtering logic
3. Adding category-specific styling if needed

### Adjusting Budgets

The script includes realistic budget ranges:
- **Small projects**: $150-$800
- **Medium projects**: $800-$3000
- **Large projects**: $3000-$15000
- **Ongoing work**: Monthly rates

## Safety Features

- **Rate limiting**: 100ms delay between job additions to avoid overwhelming Firestore
- **Error handling**: Individual job failures won't stop the entire script
- **Duplicate prevention**: Each job gets a unique ID
- **Realistic data**: All jobs have complete, realistic information

## Troubleshooting

### Common Issues

1. **Firebase connection error**: Check your Firebase config and project ID
2. **Permission denied**: Ensure your Firebase rules allow write access to the `jobs` collection
3. **User ID not found**: Make sure the user IDs exist in your `users` collection

### Firebase Rules

Make sure your Firestore rules allow writing to the jobs collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      allow write: if request.auth != null;
      allow read: if true;
    }
  }
}
```

## Output

The script will log:
- Each job as it's added successfully
- The total number of jobs added
- Any errors that occur
- All job IDs for reference

Example output:
```
Job added successfully: React Developer for E-commerce Platform (ID: abc123...)
Job added successfully: WordPress Website Redesign (ID: def456...)
...
✅ Successfully added 30 sample jobs!
Job IDs: ['abc123...', 'def456...', ...]
Sample job population completed!
```

## Next Steps

After running the script:

1. **Test the app**: Browse jobs, apply filters, test search functionality
2. **Create applications**: Test the job application flow
3. **Test messaging**: Use the jobs to test the messaging system
4. **Customize further**: Add more jobs or modify existing ones as needed

The sample jobs provide a solid foundation for testing all aspects of your Workly platform! 