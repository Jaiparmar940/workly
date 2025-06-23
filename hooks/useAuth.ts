import { auth } from '@/config/firebase';
import { FirebaseService } from '@/services/firebaseService';
import { User } from '@/types';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { useEffect, useState } from 'react';

export interface AuthState {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user profile from Firestore
          const userProfile = await FirebaseService.getUserById(user.uid);
          setAuthState({
            user,
            userProfile,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setAuthState({
            user,
            userProfile: null,
            loading: false,
            error: 'Failed to load user profile',
          });
        }
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      console.log('useAuth: Starting signup process...');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Create Firebase auth user
      console.log('useAuth: Creating Firebase auth user...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('useAuth: Firebase auth user created:', result.user.uid);
      
      // Update display name
      console.log('useAuth: Updating display name...');
      await updateProfile(result.user, {
        displayName: userData.name
      });
      
      // Create user profile in Firestore
      console.log('useAuth: Creating user profile in Firestore...');
      const userProfile = await FirebaseService.createUser({
        ...userData,
      });
      console.log('useAuth: User profile created:', userProfile);
      
      setAuthState(prev => ({ 
        ...prev, 
        user: result.user, 
        userProfile: userProfile,
        loading: false, 
        error: null 
      }));
      
      return { user: result.user, profile: userProfile };
    } catch (error: any) {
      console.error('useAuth: Signup error:', error);
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Update user profile in Firestore
      await FirebaseService.updateUser(userId, updates);
      
      // Fetch the updated profile
      const updatedProfile = await FirebaseService.getUserById(userId);
      
      // Update local state
      setAuthState(prev => ({
        ...prev,
        userProfile: updatedProfile,
        loading: false,
        error: null,
      }));
      
      return updatedProfile;
    } catch (error: any) {
      const errorMessage = 'Failed to update profile. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await sendPasswordResetEmail(auth, email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    currentUser: authState.userProfile, // Alias for userProfile
    signIn,
    signUp,
    updateUserProfile,
    logout,
    resetPassword,
    clearError,
  };
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}; 