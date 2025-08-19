# คู่มือทดสอบ Facebook API กับข้อมูลจริง

## 🚀 วิธีการทดสอบ

### 1. ผ่าน Web Interface (แนะนำ)

1. **เริ่มต้น Development Server**
   ```bash
   npm run dev
   ```

2. **เข้าสู่หน้าทดสอบ**
   - เปิดเบราว์เซอร์ไปที่: `http://localhost:8080/facebook-test`
   - หรือคลิก "Facebook API Tester" ใน Sidebar

3. **เข้าสู่ระบบ Facebook**
   - คลิกปุ่ม "เข้าสู่ระบบ Facebook"
   - อนุญาตสิทธิ์ที่จำเป็น (ads_read, ads_management)

4. **รันการทดสอบ**
   - คลิก "เริ่มทดสอบทั้งหมด"
   - ดูผลการทดสอบในแท็บ "ผลการทดสอบ"

### 2. ผ่าน Browser Console

1. **เปิด Developer Tools**
   - กด F12 หรือ Ctrl+Shift+I (Windows/Linux)
   - กด Cmd+Option+I (Mac)

2. **โหลด Test Script**
   ```javascript
   // Copy และ paste เนื้อหาจากไฟล์ test-facebook-api.js
   // หรือใช้ fetch เพื่อโหลดไฟล์
   fetch('/test-facebook-api.js')
     .then(r => r.text())
     .then(code => eval(code));
   ```

3. **รันการทดสอบ**
   ```javascript
   // ทดสอบทั้งหมด (ต้องเข้าสู่ระบบก่อน)
   runFullFacebookTest();
   
   // หรือใส่ Access Token แบบแมนนวล
   runFullFacebookTest("YOUR_ACCESS_TOKEN");
   ```

### 3. ผ่าน Manual API Testing

1. **ได้รับ Access Token**
   - ไปที่ [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - เลือก App ของคุณ
   - เลือก permissions: ads_read, ads_management
   - Generate Access Token

2. **ทดสอบ API Endpoints**
   ```javascript
   // ทดสอบ User Profile
   testFacebookConnection("YOUR_ACCESS_TOKEN");
   
   // ทดสอบ Ad Accounts
   testFacebookAdAccounts("YOUR_ACCESS_TOKEN");
   
   // ทดสอบ Campaigns
   testFacebookCampaigns("YOUR_ACCESS_TOKEN", "act_ACCOUNT_ID");
   
   // ทดสอบ Insights
   testFacebookInsights("YOUR_ACCESS_TOKEN", "CAMPAIGN_ID");
   ```

## 📋 สิ่งที่จะได้จากการทดสอบ

### ✅ การทดสอบที่สำเร็จจะแสดง:

1. **การตั้งค่า (Configuration)**
   - Facebook App ID ถูกตั้งค่า
   - API Version ถูกต้อง
   - Redirect URI ถูกตั้งค่า
   - Scopes ถูกตั้งค่า

2. **การเชื่อมต่อ (Connection)**
   - เชื่อมต่อ Facebook API สำเร็จ
   - ได้รับข้อมูล User Profile

3. **Ad Accounts**
   - จำนวน Ad Accounts ที่เข้าถึงได้
   - รายชื่อและสถานะของแต่ละ Account

4. **Campaigns**
   - จำนวน Campaigns ในแต่ละ Account
   - รายละเอียด Campaign (ชื่อ, สถานะ, วัตถุประสงค์)

5. **Insights**
   - ข้อมูลสถิติของ Campaign
   - Impressions, Clicks, Spend, CTR, CPM

### ❌ ปัญหาที่อาจพบ:

1. **การตั้งค่าไม่ถูกต้อง**
   - ตรวจสอบไฟล์ `.env.local`
   - ตรวจสอบ Facebook App Settings

2. **Access Token ไม่ถูกต้อง**
   - Token หมดอายุ
   - Permissions ไม่เพียงพอ
   - App ไม่ได้รับอนุมัติ

3. **ไม่มีสิทธิ์เข้าถึงข้อมูล**
   - Account ไม่มี Ads
   - User ไม่มีสิทธิ์ในการเข้าถึง Ad Account
   - App ยังอยู่ในโหมด Development

## 🔧 การแก้ไขปัญหา

### ปัญหา: ไม่สามารถเข้าสู่ระบบได้

1. **ตรวจสอบ Facebook App Settings**
   - App ID ถูกต้อง
   - App Secret ถูกต้อง (ถ้าใช้)
   - Valid OAuth Redirect URIs รวม `http://localhost:8080/auth/facebook/callback`

2. **ตรวจสอบ App Review Status**
   - App อยู่ในโหมด Development หรือ Live
   - Permissions ได้รับการอนุมัติแล้ว

### ปัญหา: ไม่พบ Ad Accounts

1. **ตรวจสอบ User Permissions**
   - User มีสิทธิ์เข้าถึง Business Manager
   - User มีบทบาทใน Ad Account

2. **ตรวจสอบ App Permissions**
   - App ได้รับ ads_read permission
   - App ได้รับ ads_management permission (ถ้าต้องการ)

### ปัญหา: Rate Limiting

1. **ลดความถี่ในการเรียก API**
2. **ใช้ Batch Requests**
3. **ตรวจสอบ App Usage Limits**

## 📊 ตัวอย่างผลลัพธ์

```javascript
// ผลการทดสอบที่สำเร็จ
[
  {
    test: "Configuration",
    success: true,
    data: {
      hasAppId: true,
      apiVersion: "v19.0",
      redirectUri: "http://localhost:8080/auth/facebook/callback",
      scopes: "ads_read,ads_management"
    }
  },
  {
    test: "Connection",
    success: true,
    data: {
      userId: "123456789",
      userName: "John Doe"
    }
  },
  {
    test: "Ad Accounts",
    success: true,
    data: {
      totalAccounts: 2,
      accounts: [
        {
          id: "act_123456789",
          name: "My Business Account",
          status: "ACTIVE",
          currency: "THB",
          timezone: "Asia/Bangkok"
        }
      ]
    }
  }
]
```

## 🎯 เป้าหมายของการทดสอบ

1. **ยืนยันการตั้งค่า** - ตรวจสอบว่าทุกอย่างถูกตั้งค่าถูกต้อง
2. **ทดสอบการเชื่อมต่อ** - ตรวจสอบว่าสามารถเชื่อมต่อ Facebook API ได้
3. **ทดสอบการดึงข้อมูล** - ตรวจสอบว่าสามารถดึงข้อมูลจริงได้
4. **ตรวจสอบ Permissions** - ตรวจสอบว่ามีสิทธิ์เข้าถึงข้อมูลที่ต้องการ
5. **วัดประสิทธิภาพ** - ตรวจสอบความเร็วและความเสถียร

## 🚨 ข้อควรระวัง

1. **อย่าแชร์ Access Token** - Token เป็นข้อมูลลับ
2. **ตรวจสอบ Rate Limits** - อย่าเรียก API บ่อยเกินไป
3. **ใช้ HTTPS ใน Production** - HTTP ใช้ได้เฉพาะ Development
4. **เก็บ Logs** - บันทึกผลการทดสอบเพื่อการวิเคราะห์

## 📞 การขอความช่วยเหลือ

หากพบปัญหาในการทดสอบ:

1. ตรวจสอบ Console Logs
2. ตรวจสอบ Network Tab ใน Developer Tools
3. ตรวจสอบ Facebook App Settings
4. ตรวจสอบ Business Manager Permissions
5. อ่าน Facebook API Documentation

---

**หมายเหตุ:** การทดสอบนี้ใช้ข้อมูลจริงจาก Facebook API ดังนั้นต้องมี Facebook Ad Account ที่ใช้งานได้และมีสิทธิ์เข้าถึงเพื่อให้การทดสอบสมบูรณ์