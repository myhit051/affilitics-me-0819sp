# Firebase Cloud Storage Setup Guide

คู่มือการตั้งค่า Firebase สำหรับ Cloud Storage ใน Affilitics

## ข้อกำหนดเบื้องต้น

- โปรเจค Firebase
- Firebase Firestore Database
- Web App Configuration

## ขั้นตอนการตั้งค่า

### 1. สร้างโปรเจค Firebase

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Create a project" หรือ "Add project"
3. ตั้งชื่อโปรเจค (เช่น "affilitics-storage")
4. เลือกตั้งค่าตามต้องการ
5. รอจนโปรเจคถูกสร้างเสร็จ

### 2. เปิดใช้งาน Firestore Database

1. ในโปรเจค Firebase ไปที่ "Firestore Database"
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับการพัฒนา)
4. เลือก location ที่ใกล้ที่สุด (เช่น asia-southeast1)
5. คลิก "Done"

### 3. สร้าง Web App

1. ไปที่ "Project Settings" (เฟืองใน sidebar)
2. ในแท็บ "General" ไปที่ส่วน "Your apps"
3. คลิกไอคอน Web (`</>`)
4. ตั้งชื่อ App (เช่น "Affilitics Web")
5. ไม่ต้องเลือก "Firebase Hosting"
6. คลิก "Register app"

### 4. คัดลอก Configuration

จากหน้า SDK setup และ configuration ให้คัดลอกค่า config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 5. สร้างไฟล์ Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจค:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**⚠️ หมายเหตุ:** 
- แทนที่ค่าต่างๆ ด้วยค่าจริงจาก Firebase Configuration
- ไฟล์ `.env.local` จะถูก ignore โดย Git (ปลอดภัย)

### 6. ตั้งค่า Firestore Security Rules

ไปที่ Firestore Database > Rules และใส่กฎนี้:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to affiliate_data collection
    match /affiliate_data/{document} {
      allow read, write: if true; // เปิดใช้งานสำหรับการพัฒนา
    }
    
    // Allow read/write access to shared_data collection
    match /shared_data/{document} {
      allow read, write: if true; // เปิดใช้งานสำหรับการพัฒนา
    }
  }
}
```

**⚠️ สำหรับ Production:** ควรเปลี่ยนกฎความปลอดภัยให้เข้มงวดขึ้น

### 7. รีสตาร์ทเซิร์ฟเวอร์

หลังจากสร้างไฟล์ `.env.local` แล้ว ให้รีสตาร์ทเซิร์ฟเวอร์พัฒนา:

```bash
npm run dev
```

## การใช้งาน

### เข้าถึง Cloud Sync

1. ไปที่หน้า "Cloud Sync" ในแอป
2. คลิก "เข้าสู่ระบบไม่ระบุตัวตน"
3. รอจนระบบเชื่อมต่อกับ Firebase
4. เริ่มใช้งาน Upload/Download ข้อมูล

### Upload ข้อมูล

1. Import ข้อมูลจากไฟล์ก่อน
2. ไปที่ Cloud Sync Panel
3. คลิก "อัปโหลดข้อมูล"
4. รอจนอัปโหลดเสร็จ

### Download ข้อมูล

1. ในรายการ "ข้อมูลใน Cloud"
2. คลิกปุ่ม Download ข้างข้อมูลที่ต้องการ
3. รอจนดาวน์โหลดเสร็จ
4. รีเฟรชหน้าเพื่อดูข้อมูลใหม่

## การแก้ไขปัญหา

### ไม่สามารถเชื่อมต่อ Firebase

1. ตรวจสอบว่าไฟล์ `.env.local` ถูกต้อง
2. ตรวจสอบว่า Firestore Database เปิดใช้งานแล้ว
3. ดู Console ใน Browser Developer Tools

### Security Rules Error

```javascript
// กฎชั่วคราวสำหรับการพัฒนา
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### ข้อมูลไม่ปรากฏ

1. ตรวจสอบว่า user ได้ authenticated แล้ว
2. ตรวจสอบ userId ใน Firestore Console
3. ลองอัปโหลดข้อมูลใหม่

## คุณสมบัติ

### ✅ พร้อมใช้งาน
- Anonymous Authentication
- Upload/Download ข้อมูล
- Data Synchronization
- Local Storage Backup
- Error Handling

### 🚧 กำลังพัฒนา
- Email/Password Authentication
- Data Sharing
- Team Collaboration
- Real-time Sync
- Data Encryption

## ความปลอดภัย

### สำหรับการพัฒนา
- ใช้ Anonymous Authentication
- Test Mode Firestore Rules

### สำหรับ Production
- เปลี่ยนเป็น Email Authentication
- ตั้งค่า Security Rules ที่เข้มงวด
- เปิดใช้งาน Data Encryption

## การสนับสนุน

หากพบปัญหาการใช้งาน:

1. ตรวจสอบ Console logs
2. ดู Firebase Console สำหรับข้อผิดพลาด
3. ตรวจสอบ Network tab ใน Developer Tools

---

**หมายเหตุ:** คู่มือนี้เหมาะสำหรับการพัฒนาและทดสอบ สำหรับการใช้งานจริงควรปรับปรุงการตั้งค่าความปลอดภัยเพิ่มเติม
