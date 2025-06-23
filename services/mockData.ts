import { Application, ApplicationStatus, Job, JobCategory, JobComplexity, JobMatch, JobStatus, JobType, User } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
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
    },
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
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
    },
    createdAt: new Date('2023-03-20')
  },
  {
    id: '3',
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
    },
    createdAt: new Date('2022-11-10')
  }
];

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: '1',
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
    postedBy: '1',
    status: JobStatus.OPEN,
    applicants: ['2', '3'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
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
    postedBy: '2',
    status: JobStatus.OPEN,
    applicants: ['1'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '3',
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
    postedBy: '3',
    status: JobStatus.OPEN,
    applicants: [],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '4',
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
    postedBy: '1',
    status: JobStatus.OPEN,
    applicants: ['3'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    userId: '2',
    coverLetter: 'I have extensive experience in content creation and would love to help with your React Native project. I can contribute to both the technical documentation and user interface design.',
    proposedRate: 75,
    estimatedDuration: '6-8 weeks',
    status: ApplicationStatus.PENDING,
    createdAt: new Date('2024-01-11')
  },
  {
    id: '2',
    jobId: '1',
    userId: '3',
    coverLetter: 'As a data scientist with strong programming skills, I can help build the AI matching algorithm and contribute to the overall app development.',
    proposedRate: 100,
    estimatedDuration: '8-10 weeks',
    status: ApplicationStatus.PENDING,
    createdAt: new Date('2024-01-12')
  },
  {
    id: '3',
    jobId: '2',
    userId: '1',
    coverLetter: 'I have a strong technical background and can write engaging content about technology trends and programming topics.',
    proposedRate: 150,
    estimatedDuration: 'Ongoing',
    status: ApplicationStatus.PENDING,
    createdAt: new Date('2024-01-09')
  },
  {
    id: '4',
    jobId: '4',
    userId: '3',
    coverLetter: 'I have 7 years of experience in data science and machine learning. I can provide comprehensive analysis and actionable insights for your business.',
    proposedRate: 120,
    estimatedDuration: '8-10 weeks',
    status: ApplicationStatus.PENDING,
    createdAt: new Date('2024-01-06')
  }
];

// Mock Job Matches
export const mockJobMatches: JobMatch[] = [
  {
    jobId: '1',
    userId: '2',
    matchScore: 85,
    reasons: ['Skills match: Content Writing, Technology', 'Location: Remote work available', 'Experience level appropriate'],
    createdAt: new Date('2024-01-10')
  },
  {
    jobId: '1',
    userId: '3',
    matchScore: 92,
    reasons: ['Skills match: Python, Technology', 'High rating and experience', 'Perfect for AI component'],
    createdAt: new Date('2024-01-10')
  },
  {
    jobId: '4',
    userId: '3',
    matchScore: 98,
    reasons: ['Perfect skills match: Python, Data Analysis, Machine Learning', 'Expert level experience', 'High rating'],
    createdAt: new Date('2024-01-05')
  }
];

// Mock Data Service
export class MockDataService {
  // Jobs
  static getJobs(): Job[] {
    return mockJobs;
  }

  static getJobById(id: string): Job | undefined {
    return mockJobs.find(job => job.id === id);
  }

  static getJobsByCategory(category: JobCategory): Job[] {
    return mockJobs.filter(job => job.category === category);
  }

  static getJobsByType(type: JobType): Job[] {
    return mockJobs.filter(job => job.type === type);
  }

  static createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const newJob: Job = {
      ...job,
      id: (mockJobs.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockJobs.push(newJob);
    return newJob;
  }

  // Users
  static getUsers(): User[] {
    return mockUsers;
  }

  static getUserById(id: string): User | undefined {
    return mockUsers.find(user => user.id === id);
  }

  // Applications
  static getApplications(): Application[] {
    return mockApplications;
  }

  static getApplicationsByJobId(jobId: string): Application[] {
    return mockApplications.filter(app => app.jobId === jobId);
  }

  static getApplicationsByUserId(userId: string): Application[] {
    return mockApplications.filter(app => app.userId === userId);
  }

  static createApplication(application: Omit<Application, 'id' | 'createdAt'>): Application {
    const newApplication: Application = {
      ...application,
      id: (mockApplications.length + 1).toString(),
      createdAt: new Date()
    };
    mockApplications.push(newApplication);
    return newApplication;
  }

  // Job Matches
  static getJobMatches(): JobMatch[] {
    return mockJobMatches;
  }

  static getJobMatchesByUserId(userId: string): JobMatch[] {
    return mockJobMatches.filter(match => match.userId === userId);
  }

  static getJobMatchesByJobId(jobId: string): JobMatch[] {
    return mockJobMatches.filter(match => match.jobId === jobId);
  }

  // AI Matching Algorithm (simplified)
  static generateJobMatches(userId: string): JobMatch[] {
    const user = this.getUserById(userId);
    if (!user) return [];

    const openJobs = mockJobs.filter(job => job.status === JobStatus.OPEN);
    const matches: JobMatch[] = [];

    openJobs.forEach(job => {
      let matchScore = 0;
      const reasons: string[] = [];

      // Skills matching
      const skillMatches = user.skills.filter(skill => 
        job.skills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      
      if (skillMatches.length > 0) {
        matchScore += skillMatches.length * 20;
        reasons.push(`Skills match: ${skillMatches.join(', ')}`);
      }

      // Location matching
      if (job.location.isRemote || 
          (user.location.city === job.location.city && user.location.state === job.location.state)) {
        matchScore += 15;
        reasons.push('Location compatible');
      }

      // Experience level matching
      if (user.rating >= 4.5) {
        matchScore += 10;
        reasons.push('High rating');
      }

      if (user.completedJobs >= 10) {
        matchScore += 10;
        reasons.push('Experienced worker');
      }

      // Interest matching
      const interestMatches = user.interests.filter(interest =>
        job.category.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(job.category.toLowerCase())
      );
      
      if (interestMatches.length > 0) {
        matchScore += 5;
        reasons.push(`Interest match: ${interestMatches.join(', ')}`);
      }

      if (matchScore >= 50) {
        matches.push({
          jobId: job.id,
          userId: user.id,
          matchScore,
          reasons,
          createdAt: new Date()
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
} 