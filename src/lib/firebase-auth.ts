/**
 * Firebase Authentication Service
 * ระบบ authentication แบบเรียบง่ายสำหรับ Cloud Storage
 */

import { User } from 'firebase/auth';

export interface CloudUser {
  uid: string;
  email?: string;
  displayName?: string;
  isAnonymous: boolean;
}

class FirebaseAuthService {
  private user: CloudUser | null = null;
  private listeners: Array<(user: CloudUser | null) => void> = [];

  constructor() {
    // Load user from localStorage if exists
    this.loadUserFromStorage();
  }

  // Generate anonymous user
  private generateAnonymousUser(): CloudUser {
    const uid = `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      uid,
      displayName: 'Anonymous User',
      isAnonymous: true
    };
  }

  // Save user to localStorage
  private saveUserToStorage(user: CloudUser | null) {
    if (user) {
      localStorage.setItem('firebase-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('firebase-user');
    }
  }

  // Load user from localStorage
  private loadUserFromStorage() {
    try {
      const stored = localStorage.getItem('firebase-user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load user from localStorage:', error);
    }
  }

  // Sign in anonymously
  async signInAnonymously(): Promise<CloudUser> {
    try {
      const user = this.generateAnonymousUser();
      this.user = user;
      this.saveUserToStorage(user);
      this.notifyListeners();
      console.log('Signed in anonymously:', user.uid);
      return user;
    } catch (error) {
      console.error('Failed to sign in anonymously:', error);
      throw error;
    }
  }

  // Sign in with email/password (placeholder for future implementation)
  async signInWithEmailAndPassword(email: string, password: string): Promise<CloudUser> {
    throw new Error('Email/password authentication not implemented yet. Use anonymous sign-in for now.');
  }

  // Sign out
  async signOut(): Promise<void> {
    this.user = null;
    this.saveUserToStorage(null);
    this.notifyListeners();
    console.log('User signed out');
  }

  // Get current user
  getCurrentUser(): CloudUser | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.user !== null;
  }

  // Ensure user is authenticated (auto sign-in anonymously if not)
  async ensureAuthenticated(): Promise<CloudUser> {
    if (!this.user) {
      return await this.signInAnonymously();
    }
    return this.user;
  }

  // Add authentication state listener
  onAuthStateChanged(callback: (user: CloudUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Call immediately with current user
    callback(this.user);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }
}

// Singleton instance
export const firebaseAuth = new FirebaseAuthService();

// Hook for React components
export const useFirebaseAuth = () => {
  return {
    signInAnonymously: () => firebaseAuth.signInAnonymously(),
    signOut: () => firebaseAuth.signOut(),
    getCurrentUser: () => firebaseAuth.getCurrentUser(),
    isAuthenticated: () => firebaseAuth.isAuthenticated(),
    ensureAuthenticated: () => firebaseAuth.ensureAuthenticated(),
    onAuthStateChanged: (callback: (user: CloudUser | null) => void) => firebaseAuth.onAuthStateChanged(callback)
  };
};
