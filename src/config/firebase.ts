/**
 * Firebase Configuration
 * ตั้งค่าการเชื่อมต่อกับ Firebase สำหรับ Cloud Storage
 */

import { CloudStorageConfig } from '@/lib/cloud-storage';

// Firebase configuration สำหรับ production
export const firebaseConfig: CloudStorageConfig = {
  provider: 'firebase',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key-here',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://your-project.firebaseio.com',
};

// Extended Firebase config สำหรับการใช้งานอื่นๆ
export const extendedFirebaseConfig = {
  ...firebaseConfig,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ตรวจสอบว่าการตั้งค่า Firebase ครบถ้วนหรือไม่
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your-api-key-here' &&
    firebaseConfig.authDomain !== 'your-project.firebaseapp.com' &&
    firebaseConfig.projectId !== 'your-project-id' &&
    extendedFirebaseConfig.storageBucket &&
    extendedFirebaseConfig.appId
  );
};

// ข้อความแจ้งเตือนสำหรับการตั้งค่า Firebase
export const getFirebaseSetupInstructions = (): string => {
  return `
เพื่อเปิดใช้งาน Cloud Storage กับ Firebase:

1. ไปที่ Firebase Console (https://console.firebase.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน Firestore Database
4. ใน Project Settings > General > Your apps
5. เลือก Web app และคัดลอก configuration
6. สร้างไฟล์ .env.local ในโปรเจค:

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

7. รีสตาร์ทเซิร์ฟเวอร์พัฒนา (npm run dev)
  `;
};

// เริ่มต้น Firebase configuration
export const initializeFirebaseConfig = () => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured properly.');
    console.log(getFirebaseSetupInstructions());
    return null;
  }
  
  console.log('Firebase configuration loaded successfully');
  return firebaseConfig;
};
