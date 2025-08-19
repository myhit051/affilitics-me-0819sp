/**
 * Cloud Storage Service
 * Handles data synchronization with Firebase/Supabase
 */

export interface CloudStorageConfig {
  provider: 'firebase'
  apiKey: string;
  projectId: string;
  authDomain?: string;
  databaseURL?: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  teamId?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'th' | 'en';
    timezone: string;
    notifications: boolean;
  };
}

export interface TeamProfile {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  settings: {
    allowDataSharing: boolean;
    requireApproval: boolean;
    maxStorageGB: number;
  };
}

export interface CloudData {
  id: string;
  userId: string;
  teamId?: string;
  data: {
    shopeeOrders: any[];
    lazadaOrders: any[];
    facebookAds: any[];
    calculatedMetrics: any;
    subIdAnalysis: any[];
    platformAnalysis: any[];
    dailyMetrics: any[];
  };
  metadata: {
    uploadedAt: Date;
    fileName?: string;
    fileSize?: number;
    source: 'file_import' | 'facebook_api' | 'manual';
    version: number;
    checksum: string;
    compressionRatio?: number;
  };
  settings: {
    isPublic: boolean;
    allowTeamAccess: boolean;
    expiresAt?: Date;
    encryptionLevel: 'none' | 'basic' | 'high';
  };
  analytics: {
    downloadCount: number;
    lastAccessed: Date;
    accessLog: Array<{
      userId: string;
      action: 'view' | 'download' | 'share';
      timestamp: Date;
    }>;
  };
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
  syncInProgress: boolean;
  error?: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
    currentFile?: string;
  };
  bandwidth: {
    uploadSpeed: number; // bytes per second
    downloadSpeed: number; // bytes per second
  };
  queue: {
    uploads: Array<{ id: string; fileName: string; size: number }>;
    downloads: Array<{ id: string; fileName: string; size: number }>;
  };
}

export abstract class CloudStorageService {
  protected config: CloudStorageConfig;
  protected userId: string | null = null;
  protected teamId: string | null = null;

  constructor(config: CloudStorageConfig) {
    this.config = config;
  }

  // Abstract methods to be implemented by specific providers
  abstract initialize(): Promise<void>;
  abstract authenticate(token: string): Promise<boolean>;
  abstract uploadData(data: CloudData): Promise<string>;
  abstract downloadData(dataId: string): Promise<CloudData | null>;
  abstract listUserData(): Promise<CloudData[]>;
  abstract deleteData(dataId: string): Promise<boolean>;
  abstract shareData(dataId: string, permissions: SharePermissions): Promise<string>;
  abstract syncData(): Promise<SyncStatus>;

  // Common methods
  setUser(userId: string, teamId?: string) {
    this.userId = userId;
    this.teamId = teamId;
  }

  generateDataId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  validateData(data: CloudData): boolean {
    return !!(
      data.id &&
      data.userId &&
      data.data &&
      data.metadata
    );
  }
}

export interface SharePermissions {
  canView: boolean;
  canEdit: boolean;
  canDownload: boolean;
  expiresAt?: Date;
  allowedUsers?: string[];
  allowedTeams?: string[];
}

/**
 * Firebase Implementation
 */
export class FirebaseStorageService extends CloudStorageService {
  private db: any = null;
  private auth: any = null;

  async initialize(): Promise<void> {
    try {
      // Dynamic import to avoid bundling Firebase if not used
      const { initializeApp } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      const { getAuth } = await import('firebase/auth');

      // Import extended config
      const { extendedFirebaseConfig } = await import('@/config/firebase');

      const app = initializeApp(extendedFirebaseConfig);

      this.db = getFirestore(app);
      this.auth = getAuth(app);

      console.log('Firebase initialized successfully with config:', {
        projectId: extendedFirebaseConfig.projectId,
        authDomain: extendedFirebaseConfig.authDomain
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw new Error('Firebase initialization failed');
    }
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      // Implement Firebase custom token authentication
      const { signInWithCustomToken } = await import('firebase/auth');
      await signInWithCustomToken(this.auth, token);
      return true;
    } catch (error) {
      console.error('Firebase authentication failed:', error);
      return false;
    }
  }

  async uploadData(data: CloudData): Promise<string> {
    try {
      const { doc, setDoc, collection } = await import('firebase/firestore');
      
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const docRef = doc(collection(this.db, 'affiliate_data'), data.id);
      await setDoc(docRef, {
        ...data,
        uploadedAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('Data uploaded to Firebase:', data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to upload data to Firebase:', error);
      throw error;
    }
  }

  async downloadData(dataId: string): Promise<CloudData | null> {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      
      const docRef = doc(this.db, 'affiliate_data', dataId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as CloudData;
      }

      return null;
    } catch (error) {
      console.error('Failed to download data from Firebase:', error);
      return null;
    }
  }

  async listUserData(): Promise<CloudData[]> {
    try {
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(this.db, 'affiliate_data'),
        where('userId', '==', this.userId),
        orderBy('metadata.uploadedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data: CloudData[] = [];

      querySnapshot.forEach((doc) => {
        data.push(doc.data() as CloudData);
      });

      return data;
    } catch (error) {
      console.error('Failed to list user data from Firebase:', error);
      return [];
    }
  }

  async deleteData(dataId: string): Promise<boolean> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      const docRef = doc(this.db, 'affiliate_data', dataId);
      await deleteDoc(docRef);

      console.log('Data deleted from Firebase:', dataId);
      return true;
    } catch (error) {
      console.error('Failed to delete data from Firebase:', error);
      return false;
    }
  }

  async shareData(dataId: string, permissions: SharePermissions): Promise<string> {
    try {
      const { doc, setDoc, collection } = await import('firebase/firestore');
      
      const shareId = this.generateDataId();
      const shareRef = doc(collection(this.db, 'shared_data'), shareId);
      
      await setDoc(shareRef, {
        dataId,
        permissions,
        createdBy: this.userId,
        createdAt: new Date(),
        expiresAt: permissions.expiresAt,
      });

      return shareId;
    } catch (error) {
      console.error('Failed to share data:', error);
      throw error;
    }
  }

  async syncData(): Promise<SyncStatus> {
    // Implement real-time sync status
    return {
      isOnline: navigator.onLine,
      lastSync: new Date(),
      pendingUploads: 0,
      pendingDownloads: 0,
      syncInProgress: false,
      progress: {
        current: 0,
        total: 0,
        percentage: 0
      },
      bandwidth: {
        uploadSpeed: 0,
        downloadSpeed: 0
      },
      queue: {
        uploads: [],
        downloads: []
      }
    };
  }
}

/**
 * Supabase Implementation (Disabled - package not installed)
 */
export class SupabaseStorageService extends CloudStorageService {
  private client: any = null;

  async initialize(): Promise<void> {
    console.warn('Supabase storage service is not available - package not installed');
    throw new Error('Supabase package (@supabase/supabase-js) is not installed');
  }

  async authenticate(token: string): Promise<boolean> {
    console.warn('Supabase authentication not available');
    return false;
  }

  async uploadData(data: CloudData): Promise<string> {
    throw new Error('Supabase service not available');
  }

  async downloadData(dataId: string): Promise<CloudData | null> {
    return null;
  }

  async listUserData(): Promise<CloudData[]> {
    return [];
  }

  async deleteData(dataId: string): Promise<boolean> {
    return false;
  }

  async shareData(dataId: string, permissions: SharePermissions): Promise<string> {
    throw new Error('Supabase service not available');
  }

  async syncData(): Promise<SyncStatus> {
    return {
      isOnline: false,
      lastSync: null,
      pendingUploads: 0,
      pendingDownloads: 0,
      syncInProgress: false,
      error: 'Supabase service not available',
      progress: {
        current: 0,
        total: 0,
        percentage: 0
      },
      bandwidth: {
        uploadSpeed: 0,
        downloadSpeed: 0
      },
      queue: {
        uploads: [],
        downloads: []
      }
    };
  }
}

/**
 * Factory function to create storage service
 */
export function createCloudStorageService(config: CloudStorageConfig): CloudStorageService {
  switch (config.provider) {
    case 'firebase':
      return new FirebaseStorageService(config);
    default:
      console.warn('Only Firebase provider is supported. Supabase is not available.');
      throw new Error('Only Firebase provider is supported');
  }
}

/**
 * Singleton instance for global use
 */
let cloudStorageInstance: CloudStorageService | null = null;

export function getCloudStorageService(): CloudStorageService | null {
  return cloudStorageInstance;
}

export function initializeCloudStorage(config: CloudStorageConfig): Promise<CloudStorageService> {
  return new Promise(async (resolve, reject) => {
    try {
      cloudStorageInstance = createCloudStorageService(config);
      await cloudStorageInstance.initialize();
      resolve(cloudStorageInstance);
    } catch (error) {
      reject(error);
    }
  });
}