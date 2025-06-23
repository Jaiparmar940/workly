export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  skills: string[];
  experience: string;
  interests: string[];
  rating: number;
  completedJobs: number;
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  type: JobType;
  complexity: JobComplexity;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    city: string;
    state: string;
    zipCode: string;
    isRemote: boolean;
  };
  requirements: string[];
  skills: string[];
  duration?: {
    startDate: Date;
    endDate?: Date;
  };
  postedBy: string; // User ID
  status: JobStatus;
  applicants: string[]; // User IDs
  assignedTo?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export enum JobCategory {
  TECHNOLOGY = 'Technology',
  DESIGN = 'Design',
  MARKETING = 'Marketing',
  WRITING = 'Writing',
  TRANSLATION = 'Translation',
  ADMINISTRATIVE = 'Administrative',
  CUSTOMER_SERVICE = 'Customer Service',
  SALES = 'Sales',
  EDUCATION = 'Education',
  HEALTHCARE = 'Healthcare',
  LEGAL = 'Legal',
  FINANCE = 'Finance',
  REAL_ESTATE = 'Real Estate',
  HOSPITALITY = 'Hospitality',
  MANUFACTURING = 'Manufacturing',
  TRANSPORTATION = 'Transportation',
  CONSTRUCTION = 'Construction',
  MAINTENANCE = 'Maintenance',
  CLEANING = 'Cleaning',
  GARDENING = 'Gardening',
  PET_CARE = 'Pet Care',
  CHILDCARE = 'Childcare',
  ELDERCARE = 'Eldercare',
  PERSONAL_ASSISTANT = 'Personal Assistant',
  EVENT_PLANNING = 'Event Planning',
  PHOTOGRAPHY = 'Photography',
  VIDEOGRAPHY = 'Videography',
  MUSIC = 'Music',
  FITNESS = 'Fitness',
  BEAUTY = 'Beauty',
  OTHER = 'Other'
}

export enum JobType {
  ONE_TIME = 'One-time',
  PART_TIME = 'Part-time',
  FULL_TIME = 'Full-time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship'
}

export enum JobComplexity {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export enum JobStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired'
}

export interface JobMatch {
  jobId: string;
  userId: string;
  matchScore: number;
  reasons: string[];
  createdAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  proposedRate?: number;
  estimatedDuration?: string;
  status: ApplicationStatus;
  createdAt: Date;
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn'
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string; // Job ID or Application ID
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  JOB_MATCH = 'Job Match',
  APPLICATION_RECEIVED = 'Application Received',
  APPLICATION_ACCEPTED = 'Application Accepted',
  APPLICATION_REJECTED = 'Application Rejected',
  JOB_COMPLETED = 'Job Completed',
  PAYMENT_RECEIVED = 'Payment Received',
  SYSTEM = 'System'
} 