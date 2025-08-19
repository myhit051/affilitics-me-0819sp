/**
 * Firebase Connection Test Component
 * คอมโพเนนต์สำหรับทดสอบการเชื่อมต่อ Firebase
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Cloud,
  AlertCircle
} from 'lucide-react';
import { firebaseConfig, isFirebaseConfigured, extendedFirebaseConfig } from '@/config/firebase';
import { createCloudStorageService } from '@/lib/cloud-storage';

interface TestResult {
  config: boolean;
  connection: boolean;
  firestore: boolean;
  error?: string;
}

export function FirebaseTest() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Test 1: Configuration
      const configValid = isFirebaseConfigured();
      console.log('Firebase config test:', configValid);
      console.log('Extended config:', extendedFirebaseConfig);

      if (!configValid) {
        setTestResult({
          config: false,
          connection: false,
          firestore: false,
          error: 'Firebase configuration is incomplete'
        });
        return;
      }

      // Test 2: Connection and Firestore
      const service = createCloudStorageService(firebaseConfig);
      await service.initialize();
      
      // Authenticate user first
      const { firebaseAuth } = await import('@/lib/firebase-auth');
      const user = await firebaseAuth.ensureAuthenticated();
      service.setUser(user.uid);
      setCurrentUser(user);
      
      // Test 3: Firestore operations
      const testData = {
        id: 'test-' + Date.now(),
        userId: user.uid, // ใช้ user.uid แทน 'test-user'
        data: { test: 'data' },
        metadata: {
          uploadedAt: new Date(),
          fileName: 'test.json',
          fileSize: 100,
          source: 'manual' as const,
          version: 1,
          checksum: 'test'
        },
        settings: {
          isPublic: false,
          allowTeamAccess: false,
          encryptionLevel: 'none' as const
        },
        analytics: {
          downloadCount: 0,
          lastAccessed: new Date(),
          accessLog: []
        }
      };

      // Try to upload test data
      const dataId = await service.uploadData(testData);
      console.log('Test upload successful:', dataId);

      // Try to download test data
      const downloadedData = await service.downloadData(dataId);
      console.log('Test download successful:', downloadedData);

      // Clean up test data
      await service.deleteData(dataId);
      console.log('Test cleanup successful');

      setTestResult({
        config: true,
        connection: true,
        firestore: true
      });

    } catch (error) {
      console.error('Firebase test failed:', error);
      setTestResult({
        config: isFirebaseConfigured(),
        connection: false,
        firestore: false,
        error: (error as Error).message
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    // Auto-run test on component mount
    runTest();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "ผ่าน" : "ไม่ผ่าน"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firebase Connection Test
        </CardTitle>
        <CardDescription>
          ทดสอบการเชื่อมต่อและใช้งาน Firebase Firestore
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {testResult && getStatusIcon(testResult.config)}
            การตั้งค่า Configuration
          </span>
          {testResult && getStatusBadge(testResult.config)}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {testResult && getStatusIcon(testResult.connection)}
            การเชื่อมต่อ Firebase
          </span>
          {testResult && getStatusBadge(testResult.connection)}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {testResult && getStatusIcon(testResult.firestore)}
            การใช้งาน Firestore
          </span>
          {testResult && getStatusBadge(testResult.firestore)}
        </div>

        {testResult?.error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{testResult.error}</span>
          </div>
        )}

        {testResult && testResult.config && testResult.connection && testResult.firestore && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Firebase พร้อมใช้งาน! 🎉</span>
          </div>
        )}

        <Button 
          onClick={runTest}
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              กำลังทดสอบ...
            </>
          ) : (
            <>
              <Cloud className="mr-2 h-4 w-4" />
              ทดสอบใหม่
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>Project ID: {extendedFirebaseConfig.projectId}</p>
          <p>Auth Domain: {extendedFirebaseConfig.authDomain}</p>
        </div>
      </CardContent>
    </Card>
  );
}
