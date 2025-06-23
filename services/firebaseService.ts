import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Application,
    Job,
    JobCategory,
    JobMatch,
    JobStatus,
    JobType,
    User
} from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  JOB_MATCHES: 'jobMatches'
};

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Convert Date to Firestore timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Firebase Service Class
export class FirebaseService {
  // ===== USER OPERATIONS =====
  
  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: serverTimestamp()
    });
    
    return {
      ...userData,
      id: docRef.id,
      createdAt: new Date()
    };
  }

  static async getUserById(userId: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt)
      } as User;
    }
    
    return null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
  }

  static async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as User[];
  }

  // ===== JOB OPERATIONS =====

  static async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const docRef = await addDoc(collection(db, COLLECTIONS.JOBS), {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      ...jobData,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static async getJobById(jobId: string): Promise<Job | null> {
    const docRef = doc(db, COLLECTIONS.JOBS, jobId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Job;
    }
    
    return null;
  }

  static async getAllJobs(): Promise<Job[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.JOBS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Job[];
  }

  static async getJobsByCategory(category: JobCategory): Promise<Job[]> {
    const q = query(
      collection(db, COLLECTIONS.JOBS),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Job[];
  }

  static async getJobsByType(type: JobType): Promise<Job[]> {
    const q = query(
      collection(db, COLLECTIONS.JOBS),
      where('type', '==', type)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Job[];
  }

  static async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    const q = query(
      collection(db, COLLECTIONS.JOBS),
      where('status', '==', status)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Job[];
  }

  static async getJobsByUser(userId: string): Promise<Job[]> {
    const q = query(
      collection(db, COLLECTIONS.JOBS),
      where('postedBy', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Job[];
  }

  static async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.JOBS, jobId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteJob(jobId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.JOBS, jobId);
    await deleteDoc(docRef);
  }

  // ===== APPLICATION OPERATIONS =====

  static async createApplication(applicationData: Omit<Application, 'id' | 'createdAt'>): Promise<Application> {
    const docRef = await addDoc(collection(db, COLLECTIONS.APPLICATIONS), {
      ...applicationData,
      createdAt: serverTimestamp()
    });
    
    return {
      ...applicationData,
      id: docRef.id,
      createdAt: new Date()
    };
  }

  static async getApplicationById(applicationId: string): Promise<Application | null> {
    const docRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt)
      } as Application;
    }
    
    return null;
  }

  static async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    const q = query(
      collection(db, COLLECTIONS.APPLICATIONS),
      where('jobId', '==', jobId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as Application[];
  }

  static async getApplicationsByUserId(userId: string): Promise<Application[]> {
    const q = query(
      collection(db, COLLECTIONS.APPLICATIONS),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as Application[];
  }

  static async updateApplication(applicationId: string, updates: Partial<Application>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    await updateDoc(docRef, updates);
  }

  static async deleteApplication(applicationId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    await deleteDoc(docRef);
  }

  // ===== JOB MATCH OPERATIONS =====

  static async createJobMatch(matchData: Omit<JobMatch, 'createdAt'>): Promise<JobMatch> {
    const docRef = await addDoc(collection(db, COLLECTIONS.JOB_MATCHES), {
      ...matchData,
      createdAt: serverTimestamp()
    });
    
    return {
      ...matchData,
      createdAt: new Date()
    };
  }

  static async getJobMatchesByUserId(userId: string): Promise<JobMatch[]> {
    const q = query(
      collection(db, COLLECTIONS.JOB_MATCHES),
      where('userId', '==', userId),
      orderBy('matchScore', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        userId: data.userId,
        matchScore: data.matchScore,
        reasons: data.reasons,
        createdAt: convertTimestamp(data.createdAt)
      } as JobMatch;
    });
  }

  static async getJobMatchesByJobId(jobId: string): Promise<JobMatch[]> {
    const q = query(
      collection(db, COLLECTIONS.JOB_MATCHES),
      where('jobId', '==', jobId),
      orderBy('matchScore', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        userId: data.userId,
        matchScore: data.matchScore,
        reasons: data.reasons,
        createdAt: convertTimestamp(data.createdAt)
      } as JobMatch;
    });
  }

  static async deleteJobMatch(matchId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.JOB_MATCHES, matchId);
    await deleteDoc(docRef);
  }

  // ===== SEARCH AND FILTER OPERATIONS =====

  static async searchJobs(searchQuery: string): Promise<Job[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation - for production, consider using Algolia or similar
    const allJobs = await this.getAllJobs();
    const query = searchQuery.toLowerCase();
    
    return allJobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.category.toLowerCase().includes(query) ||
      job.skills.some(skill => skill.toLowerCase().includes(query))
    );
  }

  static async getRecentJobs(limitCount: number = 10): Promise<Job[]> {
    const q = query(
      collection(db, COLLECTIONS.JOBS),
      where('status', '==', JobStatus.OPEN),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt)
    })) as Job[];
  }

  // ===== AI MATCHING ALGORITHM =====

  static async generateJobMatches(userId: string): Promise<JobMatch[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    const openJobs = await this.getJobsByStatus(JobStatus.OPEN);
    const matches: JobMatch[] = [];

    for (const job of openJobs) {
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
        const match: JobMatch = {
          jobId: job.id,
          userId: user.id,
          matchScore,
          reasons,
          createdAt: new Date()
        };
        
        matches.push(match);
        // Save match to database
        await this.createJobMatch(match);
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // ===== UTILITY FUNCTIONS =====

  static async seedDatabase(): Promise<void> {
    // This function can be used to seed the database with initial data
    // You can call this once to populate your Firebase database
    console.log('Seeding database...');
    
    // Add sample users, jobs, etc.
    // This would be called once during development
  }

  static async clearDatabase(): Promise<void> {
    // WARNING: This will delete all data
    // Only use in development
    console.log('Clearing database...');
    
    // Delete all documents from all collections
    // This is destructive and should only be used in development
  }
} 