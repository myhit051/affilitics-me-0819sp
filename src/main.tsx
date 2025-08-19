import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Facebook configuration on app startup
import { initializeFacebookConfig } from '@/config/facebook'

// Initialize Cloud Storage
import { initializeCloudStorage } from '@/lib/cloud-storage'

// Initialize and validate Facebook configuration
const configResult = initializeFacebookConfig();
if (!configResult.success) {
  console.error('Facebook configuration initialization failed:', configResult.errors);
}

// Initialize Cloud Storage
try {
  initializeCloudStorage({
    provider: 'firebase',
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  });
  console.log('Cloud storage initialized successfully');
} catch (error) {
  console.error('Cloud storage initialization failed:', error);
}

createRoot(document.getElementById("root")!).render(<App />);