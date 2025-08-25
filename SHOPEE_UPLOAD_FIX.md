# การแก้ไขปัญหาการอัพโหลดไฟล์ Shopee

## ปัญหาที่พบ
เมื่ออัพโหลดไฟล์ Shopee แล้ว ข้อมูลไม่แสดงใน StatsCard ของหน้า Shopee Affiliate

## สาเหตุของปัญหา
1. **การบันทึก Metrics ไม่ถูกต้อง**: ในหน้า `DataImport.tsx` มีการบันทึก `basicMetrics` แทนที่จะเป็น `calculatedMetrics` ที่ถูกต้อง
2. **การคำนวณ Metrics ไม่ครบถ้วน**: ไม่มีการเรียกใช้ฟังก์ชัน `calculateMetrics` จาก `affiliateCalculations.ts`
3. **Error Handling ไม่เพียงพอ**: ไม่มีการจัดการ error เมื่อการคำนวณ metrics ล้มเหลว

## การแก้ไข

### 1. แก้ไขหน้า DataImport.tsx
- เพิ่ม import `calculateMetrics` จาก `@/utils/affiliateCalculations`
- แก้ไขฟังก์ชัน `handleDataImported` ให้คำนวณ metrics ที่ถูกต้อง
- เพิ่ม error handling สำหรับกรณีที่การคำนวณล้มเหลว

```typescript
// เพิ่ม import
import { calculateMetrics } from "@/utils/affiliateCalculations";

// แก้ไขฟังก์ชัน handleDataImported
const handleDataImported = (data: any) => {
  console.log('Data imported successfully:', data);
  
  try {
    // Save raw data to localStorage
    localStorage.setItem('affiliateData', JSON.stringify(data));
    localStorage.setItem('affiliateRawData', JSON.stringify(data));
    
    // Calculate proper metrics using the same logic as the app
    try {
      const metrics = calculateMetrics(
        data.shopeeOrders || [],
        data.lazadaOrders || [],
        data.facebookAds || [],
        [], // No SubID filter
        "all", // No validity filter
        [], // No channel filter
        "all" // No platform filter
      );
      
      // Save calculated metrics to localStorage
      localStorage.setItem('affiliateMetrics', JSON.stringify(metrics));
      
      console.log('✅ Data and metrics saved to localStorage:', {
        affiliateData: data,
        calculatedMetrics: metrics
      });
    } catch (metricsError) {
      console.error('Failed to calculate metrics:', metricsError);
      
      // Fallback: save basic metrics if calculation fails
      const basicMetrics = {
        totalRows: data.totalRows || 0,
        shopeeCount: data.shopeeOrders?.length || 0,
        lazadaCount: data.lazadaOrders?.length || 0,
        facebookCount: data.facebookAds?.length || 0,
        importTime: new Date().toISOString()
      };
      
      localStorage.setItem('affiliateMetrics', JSON.stringify(basicMetrics));
      console.log('⚠️ Using fallback basic metrics');
    }
    
    // Force reload the page to ensure data is loaded properly
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
    
    // Still navigate even if localStorage fails
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  }
};
```

### 2. แก้ไข useImportedData hook
- เพิ่ม error handling ใน `useEffect` สำหรับการประมวลผลข้อมูลอัตโนมัติ
- ป้องกันการ crash เมื่อการคำนวณ metrics ล้มเหลว

```typescript
// แก้ไข useEffect ใน useImportedData.tsx
useEffect(() => {
  console.log('🔄 useEffect triggered:', {
    hasImportedData: !!importedData,
    hasCalculatedMetrics: !!calculatedMetrics,
    importedDataLength: importedData?.shopeeOrders?.length || 0
  });
  
  if (importedData && !calculatedMetrics) {
    console.log('🔄 Processing data from localStorage...');
    try {
      const metrics = calculateMetrics(
        importedData.shopeeOrders,
        importedData.lazadaOrders,
        importedData.facebookAds,
        [], // Don't filter further - data is already filtered by date
        "all", // Don't filter further
        [], // Don't filter further
        "all" // Don't filter further
      );
      setCalculatedMetrics(metrics);
      
      // Also process daily metrics
      const daily = analyzeDailyPerformance(
        importedData.shopeeOrders,
        importedData.lazadaOrders,
        importedData.facebookAds
      );
      setDailyMetrics(daily);
      
      // Process sub-id analysis
      const subIdAnalysis = analyzeSubIdPerformance(
        importedData.shopeeOrders,
        importedData.lazadaOrders,
        importedData.facebookAds,
        metrics.totalAdsSpent
      );
      setSubIdAnalysis(subIdAnalysis);
      
      // Process platform analysis
      const platforms = analyzePlatformPerformance(
        importedData.shopeeOrders,
        importedData.lazadaOrders,
        metrics.totalAdsSpent
      );
      setPlatformAnalysis(platforms);
      
      console.log('✅ Auto-processing completed');
    } catch (error) {
      console.error('❌ Error in auto-processing data:', error);
      // Don't set calculatedMetrics to null, let it remain null so it can retry
    }
  } else if (importedData && calculatedMetrics) {
    console.log('🔄 Data already processed, calculatedMetrics exists');
  }
}, [importedData, calculatedMetrics]);
```

## ผลลัพธ์ที่คาดหวัง
หลังจากแก้ไขแล้ว:
1. เมื่ออัพโหลดไฟล์ Shopee ระบบจะคำนวณ metrics ที่ถูกต้อง
2. ข้อมูลจะแสดงใน StatsCard ของหน้า Shopee Affiliate
3. มี error handling ที่ดีขึ้นเพื่อป้องกันการ crash
4. ระบบจะใช้ fallback metrics หากการคำนวณหลักล้มเหลว

## ไฟล์ที่แก้ไข
1. `src/pages/DataImport.tsx` - แก้ไขการบันทึก metrics
2. `src/hooks/useImportedData.tsx` - เพิ่ม error handling

## ไฟล์ทดสอบ
1. `debug-shopee-data.js` - ตรวจสอบข้อมูลใน localStorage
2. `debug-shopee-upload.js` - ตรวจสอบการอัพโหลดและ StatsCard
3. `test-shopee-fix.js` - ทดสอบการแก้ไขปัญหา

## วิธีการทดสอบ
1. อัพโหลดไฟล์ Shopee ใหม่
2. ตรวจสอบ console logs เพื่อดูการประมวลผล
3. ไปที่หน้า Shopee Affiliate เพื่อดู StatsCard
4. ใช้ไฟล์ debug เพื่อตรวจสอบข้อมูลใน localStorage
