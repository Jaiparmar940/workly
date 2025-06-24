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
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Application,
    Conversation,
    ConversationMessage,
    Job,
    JobCategory,
    JobMatch,
    JobStatus,
    JobType,
    Message,
    MessageDeliveryStatus,
    MessageType,
    User
} from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  JOB_MATCHES: 'jobMatches',
  MESSAGES: 'messages'
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
  
  static async createUser(userId: string, userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp()
    });
    
    return {
      ...userData,
      id: userId,
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
    // Clear all collections
    const collections = Object.values(COLLECTIONS);
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
  }

  // ===== MESSAGING OPERATIONS =====

  static async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      ...messageData,
      createdAt: serverTimestamp()
    });
    
    return {
      ...messageData,
      id: docRef.id,
      createdAt: new Date()
    };
  }

  static async getMessagesByUserId(userId: string): Promise<Message[]> {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as Message[];
  }

  static async getAllMessagesForUser(userId: string): Promise<Message[]> {
    // Get messages where user is receiver
    const receivedQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('receiverId', '==', userId)
    );
    
    // Get messages where user is sender
    const sentQuery = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('senderId', '==', userId)
    );
    
    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ]);
    
    const receivedMessages = receivedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as Message[];
    
    const sentMessages = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as Message[];
    
    // Combine and sort by creation date
    const allMessages = [...receivedMessages, ...sentMessages];
    return allMessages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async getMessageById(messageId: string): Promise<Message | null> {
    const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt)
      } as Message;
    }
    
    return null;
  }

  static async getMessagesByJobId(jobId: string): Promise<Message[]> {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as Message[];
  }

  static async markConversationMessageAsRead(
    userId: string,
    conversationId: string,
    messageId: string
  ): Promise<void> {
    const messageRef = doc(
      db, 
      COLLECTIONS.USERS, 
      userId, 
      'conversations', 
      conversationId, 
      'messages',
      messageId
    );
    
    // Get current message data
    const messageDoc = await getDoc(messageRef);
    if (!messageDoc.exists()) return;
    
    const messageData = messageDoc.data();
    const readBy = messageData.readBy || [];
    
    // Add user to readBy array if not already there
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }
    
    await updateDoc(messageRef, {
      isRead: true,
      deliveryStatus: MessageDeliveryStatus.READ,
      readBy: readBy
    });
  }

  static async deleteMessage(messageId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    await deleteDoc(docRef);
  }

  static async createJobInterestMessage(
    senderId: string,
    receiverId: string,
    jobId: string,
    proposedPrice: string,
    message: string
  ): Promise<Message> {
    console.log('Debug - Creating job interest message with:', { senderId, receiverId, jobId });
    
    const job = await this.getJobById(jobId);
    
    console.log('Debug - Job found:', !!job);
    
    if (!job) {
      throw new Error(`Job not found with ID: ${jobId}`);
    }

    const messageData = {
      senderId,
      receiverId,
      jobId,
      subject: `Interest in "${job.title}"`,
      content: `Hi! I'm interested in your job "${job.title}". 

My proposed price: $${proposedPrice}

Message: ${message}

I look forward to hearing from you!`,
      type: MessageType.JOB_INTEREST,
      isRead: false
    };

    return this.createMessage(messageData);
  }

  // ===== NEW CONVERSATION STRUCTURE (Subcollections) =====

  static async createConversation(
    participants: string[],
    jobId?: string
  ): Promise<Conversation> {
    const conversationId = jobId 
      ? `${jobId}_${participants.sort().join('_')}`
      : `direct_${participants.sort().join('_')}`;
    
    // Initialize unread count for all participants
    const unreadCount: { [userId: string]: number } = {};
    participants.forEach(userId => {
      unreadCount[userId] = 0;
    });
    
    const conversationData: Omit<Conversation, 'id'> = {
      participants,
      jobId,
      unreadCount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create conversation document in both users' conversation collections
    const promises = participants.map(userId => {
      const docRef = doc(db, COLLECTIONS.USERS, userId, 'conversations', conversationId);
      return setDoc(docRef, conversationData);
    });

    await Promise.all(promises);

    return {
      id: conversationId,
      ...conversationData
    };
  }

  static async getConversationsForUser(userId: string): Promise<Conversation[]> {
    const conversationsRef = collection(db, COLLECTIONS.USERS, userId, 'conversations');
    const querySnapshot = await getDocs(conversationsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt),
      lastMessage: doc.data().lastMessage ? {
        ...doc.data().lastMessage,
        createdAt: convertTimestamp(doc.data().lastMessage.createdAt)
      } : undefined
    })) as Conversation[];
  }

  static async addMessageToConversation(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.GENERAL
  ): Promise<ConversationMessage> {
    const messageData: Omit<ConversationMessage, 'id'> = {
      senderId,
      content,
      type,
      isRead: false,
      createdAt: new Date(),
      deliveryStatus: MessageDeliveryStatus.SENT,
      readBy: []
    };

    // First, try to get the conversation from the sender's perspective
    let conversation = await this.getConversationById(senderId, conversationId);
    
    // If not found, try to get it from any participant's perspective
    if (!conversation) {
      // Extract participants from conversation ID
      const parts = conversationId.split('_');
      let participants: string[] = [];
      
      if (conversationId.startsWith('direct_')) {
        // Direct message: direct_user1_user2
        participants = parts.slice(1); // Remove 'direct' prefix
      } else {
        // Job-related: jobId_user1_user2
        participants = parts.slice(1); // Remove jobId prefix
      }
      
      // Try to find the conversation from any participant
      for (const participantId of participants) {
        conversation = await this.getConversationById(participantId, conversationId);
        if (conversation) break;
      }
      
      // If still not found, create the conversation for all participants
      if (!conversation) {
        console.log('Debug - Creating conversation for participants:', participants);
        conversation = await this.createConversation(participants, parts[0] === 'direct' ? undefined : parts[0]);
      }
    }

    if (!conversation) {
      throw new Error('Failed to create or find conversation');
    }

    // Add message to all participants' conversation subcollections
    const promises = conversation.participants.map(userId => {
      const messageRef = collection(
        db, 
        COLLECTIONS.USERS, 
        userId, 
        'conversations', 
        conversationId, 
        'messages'
      );
      return addDoc(messageRef, messageData);
    });

    const results = await Promise.all(promises);
    const messageId = results[0].id; // All should have the same ID

    // Update conversation metadata (last message, unread counts)
    const updatePromises = conversation.participants.map(userId => {
      const conversationRef = doc(db, COLLECTIONS.USERS, userId, 'conversations', conversationId);
      const updates: any = {
        lastMessage: {
          content,
          senderId,
          createdAt: new Date()
        },
        updatedAt: new Date()
      };

      // Increment unread count for all participants except sender
      if (userId !== senderId) {
        updates[`unreadCount.${userId}`] = (conversation.unreadCount[userId] || 0) + 1;
      }

      return updateDoc(conversationRef, updates);
    });

    await Promise.all(updatePromises);

    return {
      id: messageId,
      ...messageData
    };
  }

  static async getConversationMessages(
    userId: string,
    conversationId: string
  ): Promise<ConversationMessage[]> {
    const messagesRef = collection(
      db, 
      COLLECTIONS.USERS, 
      userId, 
      'conversations', 
      conversationId, 
      'messages'
    );
    
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt)
    })) as ConversationMessage[];
  }

  static async getConversationById(
    userId: string,
    conversationId: string
  ): Promise<Conversation | null> {
    const docRef = doc(db, COLLECTIONS.USERS, userId, 'conversations', conversationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: convertTimestamp(data.lastMessage.createdAt)
        } : undefined
      } as Conversation;
    }
    
    return null;
  }

  static async markConversationAsRead(
    userId: string,
    conversationId: string
  ): Promise<void> {
    const conversationRef = doc(db, COLLECTIONS.USERS, userId, 'conversations', conversationId);
    
    // Reset unread count for this user
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });

    // Mark all messages as read
    const messagesRef = collection(
      db, 
      COLLECTIONS.USERS, 
      userId, 
      'conversations', 
      conversationId, 
      'messages'
    );
    
    const q = query(messagesRef, where('isRead', '==', false));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
  }

  // ===== MESSAGE DELIVERY STATUS & READ RECEIPTS =====

  static async markMessageAsDelivered(
    userId: string,
    conversationId: string,
    messageId: string
  ): Promise<void> {
    const messageRef = doc(
      db, 
      COLLECTIONS.USERS, 
      userId, 
      'conversations', 
      conversationId, 
      'messages',
      messageId
    );
    
    await updateDoc(messageRef, {
      deliveryStatus: MessageDeliveryStatus.DELIVERED
    });
  }

  static async markAllMessagesAsRead(
    userId: string,
    conversationId: string
  ): Promise<void> {
    const messagesRef = collection(
      db, 
      COLLECTIONS.USERS, 
      userId, 
      'conversations', 
      conversationId, 
      'messages'
    );
    
    const q = query(messagesRef, where('isRead', '==', false));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(async doc => {
      const messageData = doc.data();
      const readBy = messageData.readBy || [];
      
      if (!readBy.includes(userId)) {
        readBy.push(userId);
      }
      
      return updateDoc(doc.ref, {
        isRead: true,
        deliveryStatus: MessageDeliveryStatus.READ,
        readBy: readBy
      });
    });
    
    await Promise.all(updatePromises);
  }
} 