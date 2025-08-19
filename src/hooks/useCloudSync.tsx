import { useState, useCallback, useEffect } from 'react';
import { CloudData, SyncStatus, createCloudStorageService, FirebaseStorageService } from '@/lib/cloud-storage';
import { firebaseConfig, isFirebaseConfigured, getFirebaseSetupInstructions } from '@/config/firebase';
import { firebaseAuth, CloudUser } from '@/lib/firebase-auth';

interface CloudSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

interface CloudSyncActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<void>;
}

interface CloudSyncReturn {
  isEnabled: boolean;
  status: SyncStatus;
  cloudData: CloudData[];
  lastError: string | null;
  isLoading: boolean;
  uploadToCloud: (data: any, options: { source: string; fileName: string }) => Promise<string>;
  downloadFromCloud: (dataId: string) => Promise<CloudData>;
}

export const useCloudSync = (): CloudSyncReturn => {
  const [cloudService, setCloudService] = useState<FirebaseStorageService | null>(null);
  const [currentUser, setCurrentUser] = useState<CloudUser | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
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
  });
  
  const [cloudData, setCloudData] = useState<CloudData[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Firebase and authentication when component mounts
  useEffect(() => {
    const initializeFirebase = async () => {
      if (!isFirebaseConfigured()) {
        setLastError('Firebase is not configured. Please set up your Firebase configuration.');
        console.warn(getFirebaseSetupInstructions());
        return;
      }

      try {
        setIsLoading(true);
        
        // Ensure user is authenticated
        const user = await firebaseAuth.ensureAuthenticated();
        setCurrentUser(user);
        
        // Initialize Firebase service
        const service = createCloudStorageService(firebaseConfig) as FirebaseStorageService;
        await service.initialize();
        
        // Set authenticated user
        service.setUser(user.uid);
        
        setCloudService(service);
        setIsEnabled(true);
        setLastError(null);
        
        // Load existing cloud data
        await loadCloudData(service);
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        setLastError(`Failed to initialize Firebase: ${(error as Error).message}`);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFirebase();

    // Listen to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && cloudService) {
        cloudService.setUser(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  // Load cloud data from Firebase
  const loadCloudData = useCallback(async (service: FirebaseStorageService) => {
    try {
      setIsLoading(true);
      const data = await service.listUserData();
      setCloudData(data);
    } catch (error) {
      console.error('Failed to load cloud data:', error);
      setLastError(`Failed to load cloud data: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadToCloud = useCallback(async (data: any, options: { source: string; fileName: string }) => {
    if (!cloudService || !isEnabled) {
      const error = 'Cloud sync is not enabled. Please configure Firebase first.';
      setLastError(error);
      throw new Error(error);
    }

    try {
      setIsLoading(true);
      setLastError(null);
      
      // Prepare cloud data structure
      const cloudData: CloudData = {
        id: cloudService.generateDataId(),
        userId: currentUser?.uid || 'anonymous-user-' + Date.now(),
        data: {
          shopeeOrders: data.shopeeOrders || [],
          lazadaOrders: data.lazadaOrders || [],
          facebookAds: data.facebookAds || [],
          calculatedMetrics: data.calculatedMetrics || {},
          subIdAnalysis: data.subIdAnalysis || [],
          platformAnalysis: data.platformAnalysis || [],
          dailyMetrics: data.dailyMetrics || []
        },
        metadata: {
          uploadedAt: new Date(),
          fileName: options.fileName,
          fileSize: JSON.stringify(data).length,
          source: options.source as 'file_import' | 'facebook_api' | 'manual',
          version: 1,
          checksum: btoa(JSON.stringify(data)).slice(0, 32)
        },
        settings: {
          isPublic: false,
          allowTeamAccess: false,
          encryptionLevel: 'basic'
        },
        analytics: {
          downloadCount: 0,
          lastAccessed: new Date(),
          accessLog: []
        }
      };

      const dataId = await cloudService.uploadData(cloudData);
      
      // Refresh cloud data list
      await loadCloudData(cloudService);
      
      // Update status
      setStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      
      console.log('Data uploaded successfully:', dataId);
      return dataId;
    } catch (error) {
      console.error('Failed to upload data:', error);
      const errorMessage = `Failed to upload data: ${(error as Error).message}`;
      setLastError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cloudService, isEnabled, loadCloudData]);

  const downloadFromCloud = useCallback(async (dataId: string) => {
    if (!cloudService || !isEnabled) {
      const error = 'Cloud sync is not enabled. Please configure Firebase first.';
      setLastError(error);
      throw new Error(error);
    }

    try {
      setIsLoading(true);
      setLastError(null);
      
      const cloudData = await cloudService.downloadData(dataId);
      
      if (!cloudData) {
        throw new Error('Data not found');
      }

      // Save downloaded data to localStorage
      try {
        localStorage.setItem('affiliateData', JSON.stringify({
          shopeeOrders: cloudData.data.shopeeOrders,
          lazadaOrders: cloudData.data.lazadaOrders,
          facebookAds: cloudData.data.facebookAds,
          totalRows: (cloudData.data.shopeeOrders?.length || 0) + 
                     (cloudData.data.lazadaOrders?.length || 0) + 
                     (cloudData.data.facebookAds?.length || 0),
          errors: []
        }));
        
        localStorage.setItem('affiliateRawData', JSON.stringify(cloudData.data));
        localStorage.setItem('affiliateMetrics', JSON.stringify(cloudData.data.calculatedMetrics));
        localStorage.setItem('affiliateSubIdAnalysis', JSON.stringify(cloudData.data.subIdAnalysis));
        localStorage.setItem('affiliatePlatformAnalysis', JSON.stringify(cloudData.data.platformAnalysis));
        localStorage.setItem('affiliateDailyMetrics', JSON.stringify(cloudData.data.dailyMetrics));
        
        console.log('Data downloaded and saved to localStorage successfully');
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError);
      }
      
      // Update status
      setStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      
      return cloudData;
    } catch (error) {
      console.error('Failed to download data:', error);
      const errorMessage = `Failed to download data: ${(error as Error).message}`;
      setLastError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cloudService, isEnabled]);

  return {
    isEnabled,
    status,
    cloudData,
    lastError,
    isLoading,
    uploadToCloud,
    downloadFromCloud
  };
};
