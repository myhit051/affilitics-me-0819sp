const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('test file/AffiliateCommissionReport202508201245-fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    console.log('🔍 ทดสอบการกรองข้อมูลแบบเดียวกับในแอปพลิเคชัน');
    
    // ข้อมูลเริ่มต้น
    const totalOrders = results.length;
    const totalCommission = results.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`📊 ข้อมูลเริ่มต้น: ${totalOrders} ออเดอร์, ${totalCommission.toFixed(2)} ฿`);
    
    // ขั้นตอนที่ 1: กรองออเดอร์ที่ยกเลิก
    const step1Orders = results.filter(order => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      return status !== 'ยกเลิก' && status !== 'cancelled' && status !== 'ยังไม่ชำระเงิน';
    });
    
    const step1Commission = step1Orders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n✅ ขั้นตอนที่ 1 - กรองออเดอร์ที่ยกเลิก: ${step1Orders.length} ออเดอร์, ${step1Commission.toFixed(2)} ฿`);
    
    // ขั้นตอนที่ 2: กรองตาม Sub IDs (สมมติว่ามีการเลือก Sub ID เฉพาะ)
    const testSubIds = ['MOAUG25', 'paris', 'mng']; // ตัวอย่าง Sub IDs ที่อาจถูกเลือก
    const step2Orders = step1Orders.filter(order => {
      const orderSubIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      return orderSubIds.some(subId => testSubIds.includes(subId));
    });
    
    const step2Commission = step2Orders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n🔍 ขั้นตอนที่ 2 - กรองตาม Sub IDs (${testSubIds.join(', ')}): ${step2Orders.length} ออเดอร์, ${step2Commission.toFixed(2)} ฿`);
    
    // ขั้นตอนที่ 3: กรองตามช่องทาง (สมมติว่ามีการเลือกช่องทางเฉพาะ)
    const testChannels = ['Facebook']; // ตัวอย่างช่องทางที่อาจถูกเลือก
    const step3Orders = step2Orders.filter(order => {
      return testChannels.includes(order['ช่องทาง'] || '');
    });
    
    const step3Commission = step3Orders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n🔍 ขั้นตอนที่ 3 - กรองตามช่องทาง (${testChannels.join(', ')}): ${step3Orders.length} ออเดอร์, ${step3Commission.toFixed(2)} ฿`);
    
    // ขั้นตอนที่ 4: กรองตามช่วงวันที่ (สมมติว่ามีการเลือกช่วงวันที่เฉพาะ)
    const step4Orders = step3Orders.filter(order => {
      const orderDate = order['เวลาที่สั่งซื้อ'];
      if (!orderDate) return false;
      
      const dateKey = orderDate.split(' ')[0];
      return dateKey === '2025-08-18' || dateKey === '2025-08-19';
    });
    
    const step4Commission = step4Orders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n🔍 ขั้นตอนที่ 4 - กรองตามช่วงวันที่ (2025-08-18 ถึง 2025-08-19): ${step4Orders.length} ออเดอร์, ${step4Commission.toFixed(2)} ฿`);
    
    // คำนวณค่าคอมมิชชันรายวันจากข้อมูลที่กรองแล้ว
    const dailyCommissions = {};
    
    step4Orders.forEach(order => {
      const orderDate = order['เวลาที่สั่งซื้อ'];
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      if (orderDate) {
        const dateKey = orderDate.split(' ')[0];
        
        if (!dailyCommissions[dateKey]) {
          dailyCommissions[dateKey] = 0;
        }
        dailyCommissions[dateKey] += commission;
      }
    });
    
    console.log('\n📊 ค่าคอมมิชชันรายวันจากข้อมูลที่กรองแล้ว:');
    Object.keys(dailyCommissions).sort().forEach(date => {
      console.log(`${date}: ${dailyCommissions[date].toFixed(2)} ฿`);
    });
    
    // ตรวจสอบ Sub IDs ที่มีในข้อมูล
    console.log('\n🔍 ตรวจสอบ Sub IDs ที่มีในข้อมูล:');
    const allSubIds = new Set();
    results.forEach(order => {
      const subIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      subIds.forEach(subId => allSubIds.add(subId));
    });
    
    console.log('Sub IDs ทั้งหมด:', Array.from(allSubIds).sort());
    
    // ตรวจสอบช่องทางที่มีในข้อมูล
    console.log('\n🔍 ตรวจสอบช่องทางที่มีในข้อมูล:');
    const allChannels = new Set();
    results.forEach(order => {
      if (order['ช่องทาง']) {
        allChannels.add(order['ช่องทาง']);
      }
    });
    
    console.log('ช่องทางทั้งหมด:', Array.from(allChannels).sort());
  });
