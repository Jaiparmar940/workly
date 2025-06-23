import {
    ApplicationStatus,
    JobCategory,
    JobComplexity,
    JobStatus,
    JobType
} from '../types';
import { FirebaseService } from './firebaseService';

export class DatabaseSeeder {
  static async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      // Seed Users
      const users = await this.seedUsers();
      console.log(`✅ Created ${users.length} users`);

      // Seed Jobs
      const jobs = await this.seedJobs(users);
      console.log(`✅ Created ${jobs.length} jobs`);

      // Seed Applications
      const applications = await this.seedApplications(users, jobs);
      console.log(`✅ Created ${applications.length} applications`);

      // Generate Job Matches
      const matches = await this.generateJobMatches(users);
      console.log(`✅ Generated ${matches.length} job matches`);

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private static async seedUsers() {
    const users = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0123',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        skills: ['React Native', 'TypeScript', 'Node.js', 'UI/UX Design'],
        experience: '5 years in mobile development',
        interests: ['Technology', 'Design', 'Startups'],
        rating: 4.8,
        completedJobs: 23,
        location: {
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        }
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1-555-0124',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        skills: ['Content Writing', 'SEO', 'Social Media Marketing'],
        experience: '3 years in digital marketing',
        interests: ['Marketing', 'Writing', 'Social Media'],
        rating: 4.6,
        completedJobs: 15,
        location: {
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      },
      {
        name: 'Mike Chen',
        email: 'mike@example.com',
        phone: '+1-555-0125',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        skills: ['Python', 'Data Analysis', 'Machine Learning'],
        experience: '7 years in data science',
        interests: ['Technology', 'Data Science', 'AI'],
        rating: 4.9,
        completedJobs: 31,
        location: {
          city: 'Austin',
          state: 'TX',
          zipCode: '73301'
        }
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = await FirebaseService.createUser(userData);
      createdUsers.push(user);
    }

    return createdUsers;
  }

  private static async seedJobs(users: any[]) {
    const jobs = [
      {
        title: 'React Native App Developer Needed',
        description: 'Looking for an experienced React Native developer to help build a job posting app. The app should include user authentication, job posting functionality, and AI-powered matching.',
        category: JobCategory.TECHNOLOGY,
        type: JobType.CONTRACT,
        complexity: JobComplexity.ADVANCED,
        budget: {
          min: 5000,
          max: 15000,
          currency: 'USD'
        },
        location: {
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          isRemote: true
        },
        requirements: ['React Native', 'TypeScript', 'Node.js', '3+ years experience'],
        skills: ['React Native', 'TypeScript', 'Node.js', 'UI/UX Design'],
        duration: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15')
        },
        postedBy: users[0].id,
        status: JobStatus.OPEN,
        applicants: []
      },
      {
        title: 'Content Writer for Tech Blog',
        description: 'Need a skilled content writer to create engaging articles about technology trends, programming tutorials, and industry insights.',
        category: JobCategory.WRITING,
        type: JobType.PART_TIME,
        complexity: JobComplexity.INTERMEDIATE,
        budget: {
          min: 50,
          max: 200,
          currency: 'USD'
        },
        location: {
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          isRemote: true
        },
        requirements: ['Excellent writing skills', 'Tech knowledge', 'SEO experience'],
        skills: ['Content Writing', 'SEO', 'Technology'],
        postedBy: users[1].id,
        status: JobStatus.OPEN,
        applicants: []
      },
      {
        title: 'Lawn Mowing Service',
        description: 'Simple lawn mowing job for a small residential property. Need someone reliable and punctual.',
        category: JobCategory.GARDENING,
        type: JobType.ONE_TIME,
        complexity: JobComplexity.BEGINNER,
        budget: {
          min: 30,
          max: 50,
          currency: 'USD'
        },
        location: {
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          isRemote: false
        },
        requirements: ['Own equipment', 'Reliable transportation'],
        skills: ['Lawn Care', 'Basic Maintenance'],
        duration: {
          startDate: new Date('2024-01-20')
        },
        postedBy: users[2].id,
        status: JobStatus.OPEN,
        applicants: []
      },
      {
        title: 'Data Analysis Project',
        description: 'Looking for a data scientist to analyze customer behavior data and provide insights for business decisions.',
        category: JobCategory.TECHNOLOGY,
        type: JobType.CONTRACT,
        complexity: JobComplexity.EXPERT,
        budget: {
          min: 8000,
          max: 20000,
          currency: 'USD'
        },
        location: {
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          isRemote: true
        },
        requirements: ['Python', 'Pandas', 'Machine Learning', '5+ years experience'],
        skills: ['Python', 'Data Analysis', 'Machine Learning', 'Statistics'],
        duration: {
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-04-01')
        },
        postedBy: users[0].id,
        status: JobStatus.OPEN,
        applicants: []
      }
    ];

    const createdJobs = [];
    for (const jobData of jobs) {
      const job = await FirebaseService.createJob(jobData);
      createdJobs.push(job);
    }

    return createdJobs;
  }

  private static async seedApplications(users: any[], jobs: any[]) {
    const applications = [
      {
        jobId: jobs[0].id,
        userId: users[1].id,
        coverLetter: 'I have extensive experience in content creation and would love to help with your React Native project. I can contribute to both the technical documentation and user interface design.',
        proposedRate: 75,
        estimatedDuration: '6-8 weeks',
        status: ApplicationStatus.PENDING
      },
      {
        jobId: jobs[0].id,
        userId: users[2].id,
        coverLetter: 'As a data scientist with strong programming skills, I can help build the AI matching algorithm and contribute to the overall app development.',
        proposedRate: 100,
        estimatedDuration: '8-10 weeks',
        status: ApplicationStatus.PENDING
      },
      {
        jobId: jobs[1].id,
        userId: users[0].id,
        coverLetter: 'I have a strong technical background and can write engaging content about technology trends and programming topics.',
        proposedRate: 150,
        estimatedDuration: 'Ongoing',
        status: ApplicationStatus.PENDING
      },
      {
        jobId: jobs[3].id,
        userId: users[2].id,
        coverLetter: 'I have 7 years of experience in data science and machine learning. I can provide comprehensive analysis and actionable insights for your business.',
        proposedRate: 120,
        estimatedDuration: '8-10 weeks',
        status: ApplicationStatus.PENDING
      }
    ];

    const createdApplications = [];
    for (const applicationData of applications) {
      const application = await FirebaseService.createApplication(applicationData);
      createdApplications.push(application);
    }

    return createdApplications;
  }

  private static async generateJobMatches(users: any[]) {
    const matches = [];
    
    // Generate matches for each user
    for (const user of users) {
      const userMatches = await FirebaseService.generateJobMatches(user.id);
      matches.push(...userMatches);
    }

    return matches;
  }

  static async clearDatabase(): Promise<void> {
    console.log('🗑️ Clearing database...');
    
    try {
      // Get all documents from each collection and delete them
      const collections = ['users', 'jobs', 'applications', 'jobMatches'];
      
      for (const collectionName of collections) {
        const { collection, getDocs, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        console.log(`✅ Cleared ${collectionName} collection`);
      }
      
      console.log('🎉 Database cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }
} 