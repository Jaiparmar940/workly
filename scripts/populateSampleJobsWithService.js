// This script uses the existing Firebase service to populate sample jobs
// Run this from your React Native app environment

import { FirebaseService } from '../services/firebaseService';

// Sample user IDs - REPLACE THESE WITH ACTUAL USER IDs FROM YOUR DATABASE
const SAMPLE_USER_IDS = [
  'kPtp2S1XOkWsBgmyFogp2zknhkU2',
  'pLoJD4IMYLUgvvfZARdVhQP3JUl1', 
  'RGsuhLJKx9Xdjk4fvoRkMyx79t23',
  'al74PzyC2Bbvw43s6w44CttIfKl2',
  'HSvqIEZ1BLN7V2AJAYEwPWH3iAv2'
];

// Sample job data with realistic information
const SAMPLE_JOBS = [
  // Web Development Jobs
  {
    title: "React Developer for E-commerce Platform",
    description: "Looking for an experienced React developer to help build a modern e-commerce platform. Must have experience with React hooks, Redux, and API integration. The project involves creating a responsive shopping cart, product catalog, and user authentication system.",
    category: "Web Development",
    location: "San Francisco, CA",
    budget: { min: 2500, max: 5000 },
    duration: "3-4 weeks",
    skills: ["React", "JavaScript", "Redux", "API Integration", "E-commerce"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "WordPress Website Redesign",
    description: "Need a professional WordPress developer to redesign our company website. Current site is outdated and needs modern design, improved navigation, and mobile responsiveness. Should include custom theme development and SEO optimization.",
    category: "Web Development", 
    location: "Austin, TX",
    budget: { min: 800, max: 2000 },
    duration: "2-3 weeks",
    skills: ["WordPress", "PHP", "CSS", "SEO", "Responsive Design"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "beginner"
  },
  {
    title: "Full-Stack Developer for SaaS Application",
    description: "Seeking a full-stack developer to build a SaaS application from scratch. The app will handle user management, subscription billing, and data analytics. Tech stack should include Node.js, React, and PostgreSQL.",
    category: "Web Development",
    location: "New York, NY", 
    budget: { min: 8000, max: 15000 },
    duration: "8-12 weeks",
    skills: ["Node.js", "React", "PostgreSQL", "SaaS", "Billing Integration"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "expert"
  },

  // Design Jobs
  {
    title: "Logo Design for Tech Startup",
    description: "Looking for a creative designer to create a modern, minimalist logo for our tech startup. The logo should convey innovation and trust. Need vector files and brand guidelines. Company focuses on AI-powered productivity tools.",
    category: "Graphic Design",
    location: "Seattle, WA",
    budget: { min: 300, max: 800 },
    duration: "1-2 weeks", 
    skills: ["Logo Design", "Adobe Illustrator", "Brand Identity", "Minimalist Design"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "UI/UX Designer for Mobile App",
    description: "Need a talented UI/UX designer to create wireframes and high-fidelity mockups for a fitness tracking mobile app. Should focus on user experience, accessibility, and modern design trends. Experience with Figma required.",
    category: "UI/UX Design",
    location: "Los Angeles, CA",
    budget: { min: 1500, max: 3000 },
    duration: "4-6 weeks",
    skills: ["UI/UX Design", "Figma", "Mobile Design", "Wireframing", "Prototyping"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open", 
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "Social Media Graphics Package",
    description: "Looking for a designer to create a complete social media graphics package including Instagram posts, Facebook covers, and LinkedIn banners. Need 30+ graphics with consistent branding. Style should be modern and professional.",
    category: "Graphic Design",
    location: "Miami, FL",
    budget: { min: 400, max: 800 },
    duration: "2-3 weeks",
    skills: ["Social Media Design", "Adobe Photoshop", "Brand Consistency", "Instagram"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "low",
    remoteWork: true,
    experienceLevel: "beginner"
  },

  // Content Writing Jobs
  {
    title: "Blog Content Writer for Tech Company",
    description: "Seeking a skilled content writer to create engaging blog posts about technology trends, software development, and industry insights. Need 10 articles (1000-1500 words each) with SEO optimization. Experience in tech writing preferred.",
    category: "Content Writing",
    location: "Boston, MA",
    budget: { min: 600, max: 1200 },
    duration: "3-4 weeks",
    skills: ["Content Writing", "SEO", "Tech Writing", "Blog Writing", "Research"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "Product Description Writer for E-commerce",
    description: "Need a writer to create compelling product descriptions for an online store selling home goods. Must be able to write persuasive copy that converts browsers to buyers. Need 50+ product descriptions with keywords.",
    category: "Content Writing",
    location: "Chicago, IL",
    budget: { min: 300, max: 600 },
    duration: "2-3 weeks",
    skills: ["Product Descriptions", "E-commerce", "Copywriting", "SEO", "Persuasive Writing"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "beginner"
  },
  {
    title: "Technical Documentation Writer",
    description: "Looking for a technical writer to create comprehensive documentation for our software API. Must be able to explain complex technical concepts clearly. Need user guides, API documentation, and troubleshooting guides.",
    category: "Content Writing",
    location: "Denver, CO",
    budget: { min: 2000, max: 4000 },
    duration: "6-8 weeks",
    skills: ["Technical Writing", "API Documentation", "User Guides", "Technical Communication"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "expert"
  },

  // Digital Marketing Jobs
  {
    title: "Google Ads Campaign Manager",
    description: "Need an experienced PPC specialist to manage and optimize Google Ads campaigns for our online store. Must have proven track record of improving ROAS and reducing cost per acquisition. Monthly budget $5000.",
    category: "Digital Marketing",
    location: "Phoenix, AZ",
    budget: { min: 800, max: 1500 },
    duration: "Ongoing",
    skills: ["Google Ads", "PPC", "ROAS Optimization", "E-commerce", "Analytics"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "expert"
  },
  {
    title: "Social Media Manager for Restaurant",
    description: "Looking for a creative social media manager to handle Instagram, Facebook, and TikTok for our restaurant. Need content creation, community management, and growth strategies. Should have experience in food industry.",
    category: "Digital Marketing",
    location: "Nashville, TN",
    budget: { min: 400, max: 800 },
    duration: "Ongoing",
    skills: ["Social Media Management", "Instagram", "TikTok", "Content Creation", "Restaurant Marketing"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "medium",
    remoteWork: false,
    experienceLevel: "intermediate"
  },
  {
    title: "SEO Specialist for Law Firm",
    description: "Seeking an SEO expert to improve our law firm's search rankings and organic traffic. Need keyword research, on-page optimization, content strategy, and local SEO. Experience with legal industry preferred.",
    category: "Digital Marketing",
    location: "Philadelphia, PA",
    budget: { min: 1200, max: 2500 },
    duration: "3-6 months",
    skills: ["SEO", "Local SEO", "Keyword Research", "Legal Marketing", "Content Strategy"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "low",
    remoteWork: true,
    experienceLevel: "expert"
  },

  // Mobile Development Jobs
  {
    title: "iOS App Developer for Fitness App",
    description: "Looking for an iOS developer to build a fitness tracking app with workout plans, progress tracking, and social features. Must have experience with Swift, Core Data, and HealthKit integration.",
    category: "Mobile Development",
    location: "San Diego, CA",
    budget: { min: 5000, max: 10000 },
    duration: "12-16 weeks",
    skills: ["iOS Development", "Swift", "Core Data", "HealthKit", "Fitness Apps"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "expert"
  },
  {
    title: "React Native Developer for Delivery App",
    description: "Need a React Native developer to help build a food delivery app. Features include user authentication, order tracking, payment integration, and real-time location updates. Experience with Firebase required.",
    category: "Mobile Development",
    location: "Houston, TX",
    budget: { min: 3000, max: 6000 },
    duration: "8-10 weeks",
    skills: ["React Native", "Firebase", "Payment Integration", "Real-time Updates", "Location Services"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "Android App Maintenance",
    description: "Looking for an Android developer to maintain and update our existing app. Need bug fixes, performance improvements, and feature updates. App is built with Kotlin and uses MVVM architecture.",
    category: "Mobile Development",
    location: "Portland, OR",
    budget: { min: 800, max: 1500 },
    duration: "2-4 weeks",
    skills: ["Android Development", "Kotlin", "MVVM", "App Maintenance", "Bug Fixes"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "intermediate"
  },

  // Data & Analytics Jobs
  {
    title: "Data Analyst for E-commerce",
    description: "Need a data analyst to analyze sales data, customer behavior, and marketing performance. Must be proficient in SQL, Python, and data visualization tools. Experience with e-commerce analytics preferred.",
    category: "Data & Analytics",
    location: "Atlanta, GA",
    budget: { min: 1500, max: 3000 },
    duration: "4-6 weeks",
    skills: ["Data Analysis", "SQL", "Python", "Data Visualization", "E-commerce Analytics"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "Business Intelligence Dashboard Developer",
    description: "Looking for a BI developer to create interactive dashboards for our company. Need to connect multiple data sources and create visualizations for sales, marketing, and operations metrics. Experience with Tableau or Power BI required.",
    category: "Data & Analytics",
    location: "Dallas, TX",
    budget: { min: 2500, max: 5000 },
    duration: "6-8 weeks",
    skills: ["Business Intelligence", "Tableau", "Power BI", "Data Visualization", "Dashboard Development"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "low",
    remoteWork: true,
    experienceLevel: "expert"
  },
  {
    title: "Excel VBA Automation Specialist",
    description: "Need an Excel expert to automate repetitive tasks and create custom VBA solutions. Tasks include data processing, report generation, and workflow automation. Must have strong VBA programming skills.",
    category: "Data & Analytics",
    location: "Charlotte, NC",
    budget: { min: 400, max: 800 },
    duration: "2-3 weeks",
    skills: ["Excel VBA", "Automation", "Data Processing", "Report Generation", "Workflow Automation"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "intermediate"
  },

  // Virtual Assistant Jobs
  {
    title: "Executive Virtual Assistant",
    description: "Looking for an experienced virtual assistant to support our CEO with calendar management, email organization, travel arrangements, and administrative tasks. Must be highly organized and professional.",
    category: "Virtual Assistant",
    location: "Remote",
    budget: { min: 600, max: 1200 },
    duration: "Ongoing",
    skills: ["Calendar Management", "Email Organization", "Travel Arrangements", "Administrative Support", "Executive Support"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "expert"
  },
  {
    title: "Customer Service Virtual Assistant",
    description: "Need a customer service VA to handle customer inquiries, process orders, and provide support via email and chat. Must have excellent communication skills and experience with customer service software.",
    category: "Virtual Assistant",
    location: "Remote",
    budget: { min: 300, max: 600 },
    duration: "Ongoing",
    skills: ["Customer Service", "Email Support", "Chat Support", "Order Processing", "Communication"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "beginner"
  },
  {
    title: "Social Media Virtual Assistant",
    description: "Looking for a social media VA to manage multiple social media accounts, create content calendars, and engage with followers. Experience with Instagram, Facebook, and LinkedIn required.",
    category: "Virtual Assistant",
    location: "Remote",
    budget: { min: 400, max: 800 },
    duration: "Ongoing",
    skills: ["Social Media Management", "Content Calendar", "Community Engagement", "Instagram", "Facebook"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "low",
    remoteWork: true,
    experienceLevel: "intermediate"
  },

  // Translation Jobs
  {
    title: "Spanish to English Translator",
    description: "Need a professional translator to translate business documents from Spanish to English. Documents include contracts, marketing materials, and technical specifications. Must be a native English speaker.",
    category: "Translation",
    location: "Remote",
    budget: { min: 200, max: 500 },
    duration: "1-2 weeks",
    skills: ["Spanish Translation", "Business Translation", "Contract Translation", "Technical Translation", "Native English"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "expert"
  },
  {
    title: "Website Localization for French Market",
    description: "Looking for a French translator to localize our website content for the French market. Need to translate product descriptions, marketing copy, and user interface elements. Experience with website localization preferred.",
    category: "Translation",
    location: "Remote",
    budget: { min: 800, max: 1500 },
    duration: "3-4 weeks",
    skills: ["French Translation", "Website Localization", "UI Translation", "Marketing Translation", "Cultural Adaptation"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "low",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "Chinese Technical Documentation Translator",
    description: "Need a Chinese translator to translate technical documentation and user manuals. Must have experience with technical terminology and be able to maintain accuracy and clarity in translations.",
    category: "Translation",
    location: "Remote",
    budget: { min: 600, max: 1200 },
    duration: "4-6 weeks",
    skills: ["Chinese Translation", "Technical Translation", "Documentation Translation", "Technical Terminology", "Accuracy"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "expert"
  },

  // Video & Animation Jobs
  {
    title: "Product Demo Video Creator",
    description: "Looking for a video creator to produce a professional product demo video for our software. Need 2-3 minute video with screen recordings, voice-over, and graphics. Experience with video editing software required.",
    category: "Video & Animation",
    location: "Remote",
    budget: { min: 500, max: 1000 },
    duration: "2-3 weeks",
    skills: ["Video Editing", "Screen Recording", "Voice-over", "Product Demos", "Adobe Premiere"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "high",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "Animated Logo Design",
    description: "Need an animator to create an animated version of our company logo. Should be 5-10 seconds long with smooth transitions and professional quality. Need multiple formats for different platforms.",
    category: "Video & Animation",
    location: "Remote",
    budget: { min: 300, max: 600 },
    duration: "1-2 weeks",
    skills: ["Animation", "Logo Animation", "After Effects", "Motion Graphics", "Brand Animation"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "medium",
    remoteWork: true,
    experienceLevel: "intermediate"
  },
  {
    title: "YouTube Video Editor",
    description: "Looking for a video editor to edit weekly YouTube videos for our channel. Need to add graphics, transitions, music, and optimize for engagement. Experience with YouTube content and trends preferred.",
    category: "Video & Animation",
    location: "Remote",
    budget: { min: 200, max: 400 },
    duration: "Ongoing",
    skills: ["Video Editing", "YouTube", "Graphics", "Transitions", "Content Optimization"],
    postedBy: SAMPLE_USER_IDS[2],
    status: "open",
    urgency: "low",
    remoteWork: true,
    experienceLevel: "beginner"
  },

  // Photography Jobs
  {
    title: "Real Estate Photography",
    description: "Need a photographer to take professional photos of residential properties for our real estate listings. Must have experience with real estate photography, HDR techniques, and drone photography preferred.",
    category: "Photography",
    location: "Orlando, FL",
    budget: { min: 150, max: 300 },
    duration: "Per property",
    skills: ["Real Estate Photography", "HDR Photography", "Drone Photography", "Property Photography", "Professional Photography"],
    postedBy: SAMPLE_USER_IDS[3],
    status: "open",
    urgency: "high",
    remoteWork: false,
    experienceLevel: "intermediate"
  },
  {
    title: "Product Photography for E-commerce",
    description: "Looking for a product photographer to shoot 50+ products for our online store. Need white background shots, lifestyle shots, and detail shots. Experience with e-commerce photography required.",
    category: "Photography",
    location: "Las Vegas, NV",
    budget: { min: 400, max: 800 },
    duration: "1-2 weeks",
    skills: ["Product Photography", "E-commerce Photography", "White Background", "Lifestyle Photography", "Detail Shots"],
    postedBy: SAMPLE_USER_IDS[0],
    status: "open",
    urgency: "medium",
    remoteWork: false,
    experienceLevel: "intermediate"
  },
  {
    title: "Event Photography for Corporate Conference",
    description: "Need an event photographer for our annual corporate conference. Event will be 2 days with keynote speakers, networking sessions, and awards ceremony. Must have experience with corporate events.",
    category: "Photography",
    location: "Minneapolis, MN",
    budget: { min: 800, max: 1500 },
    duration: "2 days",
    skills: ["Event Photography", "Corporate Photography", "Conference Photography", "Professional Events", "Candid Photography"],
    postedBy: SAMPLE_USER_IDS[1],
    status: "open",
    urgency: "high",
    remoteWork: false,
    experienceLevel: "expert"
  }
];

// Function to add a job using the Firebase service
async function addJob(jobData) {
  try {
    const job = await FirebaseService.createJob(jobData);
    console.log(`Job added successfully: ${jobData.title} (ID: ${job.id})`);
    return job.id;
  } catch (error) {
    console.error(`Error adding job ${jobData.title}:`, error);
    throw error;
  }
}

// Main function to populate all jobs
export async function populateSampleJobs() {
  console.log('Starting to populate sample jobs...');
  
  try {
    const jobIds = [];
    
    for (const job of SAMPLE_JOBS) {
      const jobId = await addJob(job);
      jobIds.push(jobId);
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Successfully added ${jobIds.length} sample jobs!`);
    console.log('Job IDs:', jobIds);
    
    return jobIds;
  } catch (error) {
    console.error('Error populating sample jobs:', error);
    throw error;
  }
}

// Export the sample jobs for use in other parts of the app
export { SAMPLE_JOBS };
