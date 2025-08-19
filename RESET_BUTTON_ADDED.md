# เพิ่มปุ่มรีเซ็ตข้อมูลทั้งหมด ✅

## สิ่งที่เพิ่ม:

### 1. ✅ ฟังก์ชัน clearAllData ใน useImportedData Hook
```javascript
const clearAllData = () => {
  // Clear all state
  setImportedData(null);
  setRawData(null);
  setCalculatedMetrics(null);
  setSubIdAnalysis([]);
  setPlatformAnalysis([]);
  setDailyMetrics([]);
  
  // Clear all localStorage data
  localStorage.removeItem('affiliateData');
  localStorage.removeItem('affiliateRawData');
  localStorage.removeItem('affiliateMetrics');
  localStorage.removeItem('affiliateSubIdAnalysis');
  localStorage.removeItem('affiliatePlatformAnalysis');
  localStorage.removeItem('affiliateDailyMetrics');
  localStorage.removeItem('affilitics-stored-metadata');
};
```

### 2. ✅ ปุ่มรีเซ็ตในหน้า Dashboard
- **ปุ่ม "รีเซ็ตตัวกรอง"** - รีเซ็ตเฉพาะตัวกรอง (filters)
- **ปุ่ม "ล้างข้อมูลทั้งหมด"** - ล้างข้อมูลทั้งหมด + confirmation dialog

### 3. ✅ ปุ่มรีเซ็ตในหน้า Index
- **ปุ่ม "รีเซ็ตตัวกรอง"** - รีเซ็ตเฉพาะตัวกรอง (filters)
- **ปุ่ม "ล้างข้อมูลทั้งหมด"** - ล้างข้อมูลทั้งหมด + confirmation dialog

## การทำงาน:

### 🔄 รีเซ็ตตัวกรอง (Reset Filters)
- รีเซ็ต Sub ID filter
- รีเซ็ต Validity filter
- รีเซ็ต Platform filter
- รีเซ็ต Channel filter
- รีเซ็ต Date range
- **ข้อมูลยังคงอยู่** - แค่รีเซ็ตตัวกรอง

### 🗑️ ล้างข้อมูลทั้งหมด (Clear All Data)
- ลบข้อมูลที่ import ทั้งหมด
- ลบการวิเคราะห์และ metrics ทั้งหมด
- ลบข้อมูลที่เก็บไว้ใน localStorage
- ลบ stored metadata
- **ข้อมูลหายไปทั้งหมด** - ต้อง import ใหม่

## UI/UX:

### 🎨 การออกแบบ:
- **ปุ่มรีเซ็ตตัวกรอง**: `variant="outline"` + ไอคอน `RotateCcw`
- **ปุ่มล้างข้อมูลทั้งหมด**: `variant="destructive"` + ไอคอน `Trash2`

### ⚠️ Confirmation Dialog:
- แสดงข้อความยืนยันก่อนล้างข้อมูล
- อธิบายผลกระทบที่จะเกิดขึ้น
- ปุ่ม "ยกเลิก" และ "ล้างข้อมูลทั้งหมด"

### 📍 ตำแหน่ง:
- อยู่ในส่วน Filters ของทั้งหน้า Dashboard และ Index
- แสดงเฉพาะเมื่อมีข้อมูล (hasData = true)

## ข้อมูลที่ถูกล้าง:

### ✅ ล้างจาก State:
- `importedData`
- `rawData`
- `calculatedMetrics`
- `subIdAnalysis`
- `platformAnalysis`
- `dailyMetrics`

### ✅ ล้างจาก localStorage:
- `affiliateData`
- `affiliateRawData`
- `affiliateMetrics`
- `affiliateSubIdAnalysis`
- `affiliatePlatformAnalysis`
- `affiliateDailyMetrics`
- `affilitics-stored-metadata`

### ✅ ล้างจาก Index Page:
- `originalData`
- `storedData` (shopee, lazada, facebook)

## การใช้งาน:

### 🔄 เมื่อต้องการรีเซ็ตตัวกรอง:
1. กดปุ่ม "รีเซ็ตตัวกรอง"
2. ตัวกรองทั้งหมดจะกลับไปเป็นค่าเริ่มต้น
3. ข้อมูลยังคงอยู่และแสดงผลใหม่ตามตัวกรองที่รีเซ็ต

### 🗑️ เมื่อต้องการล้างข้อมูลทั้งหมด:
1. กดปุ่ม "ล้างข้อมูลทั้งหมด"
2. ระบบจะแสดง confirmation dialog
3. กด "ล้างข้อมูลทั้งหมด" เพื่อยืนยัน
4. ข้อมูลทั้งหมดจะหายไป
5. หน้าเว็บจะกลับไปแสดงข้อความแนะนำให้ import ข้อมูล

## หมายเหตุ:
- การล้างข้อมูลทั้งหมดไม่สามารถกู้คืนได้
- ผู้ใช้ต้อง import ข้อมูลใหม่หลังจากล้างข้อมูล
- ระบบจะกลับไปสถานะเริ่มต้นเหมือนตอนเปิดเว็บครั้งแรก
