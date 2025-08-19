# แก้ไขปัญหา Import Loop - ระบบเด้งกลับไปหน้า import เรื่อยๆ ✅

## 🐛 ปัญหาที่เกิดขึ้น:
หลังจากล้างข้อมูลแล้ว ระบบเด้งกลับไปหน้า import เรื่อยๆ ไม่สามารถ import ข้อมูลใหม่ได้

## 🔍 สาเหตุ:
1. **Condition ไม่ถูกต้อง** - `!hasData` เป็น `true` แต่ `activeView` ไม่ใช่ "import"
2. **ไม่มี Auto-redirect** - ระบบไม่เปลี่ยนไปหน้า import โดยอัตโนมัติเมื่อไม่มีข้อมูล
3. **State ไม่ sync** - `activeView` และ `hasData` ไม่ sync กัน

## ✅ การแก้ไข:

### 1. แก้ไข Condition ใน renderContent
```javascript
// เดิม
{!hasData ? (

// ใหม่  
{!hasData && activeView !== "import" ? (
```

### 2. เพิ่ม Auto-redirect เมื่อไม่มีข้อมูล
```javascript
// Auto-redirect to import if no data
useEffect(() => {
  if (!hasData && activeView === "dashboard") {
    console.log('No data available, redirecting to import page');
    setActiveView("import");
  }
}, [hasData, activeView]);
```

### 3. เพิ่ม Debug Logging
```javascript
const renderContent = () => {
  console.log('renderContent - activeView:', activeView, 'hasData:', hasData, 'importedData:', importedData);
  
  switch (activeView) {
    // ...
  }
};
```

## 🔄 การทำงานใหม่:

### เมื่อไม่มีข้อมูล:
1. `hasData` = `false`
2. `activeView` = "dashboard" (เริ่มต้น)
3. **Auto-redirect** ทำงาน → `activeView` = "import"
4. แสดงหน้า **DataImport** component

### เมื่อมีข้อมูล:
1. `hasData` = `true`
2. `activeView` = "dashboard"
3. แสดงหน้า **Dashboard** พร้อมข้อมูล

### เมื่อล้างข้อมูล:
1. `clearAllData()` ทำงาน
2. `hasData` = `false`
3. `setActiveView("import")` ทำงาน
4. แสดงหน้า **DataImport** component

## 🎯 ผลลัพธ์:
- ✅ ไม่มี loop อีกต่อไป
- ✅ ระบบเปลี่ยนไปหน้า import โดยอัตโนมัติเมื่อไม่มีข้อมูล
- ✅ สามารถ import ข้อมูลใหม่ได้
- ✅ การล้างข้อมูลทำงานถูกต้อง

## 📝 หมายเหตุ:
- ระบบจะ auto-redirect ไปหน้า import เมื่อไม่มีข้อมูล
- ไม่มี loop ระหว่างหน้า dashboard และ import อีกต่อไป
- Debug logging ช่วยติดตามการทำงานของ state
