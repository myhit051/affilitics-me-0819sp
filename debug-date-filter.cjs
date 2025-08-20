const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('test file/AffiliateCommissionReport202508201245-fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    // ตรวจสอบค่าคอมมิชชันรายวันโดยไม่กรองวันที่
    const dailyCommissions = {};
    
    results.forEach(order => {
      const orderDate = order['เวลาที่สั่งซื้อ'];
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      // ข้ามออเดอร์ที่ยกเลิก
      if (status === 'ยกเลิก' || status === 'cancelled' || status === 'ยังไม่ชำระเงิน') {
        return;
      }
      
      if (orderDate) {
        const dateKey = orderDate.split(' ')[0]; // เอาเฉพาะวันที่
        
        if (!dailyCommissions[dateKey]) {
          dailyCommissions[dateKey] = 0;
        }
        dailyCommissions[dateKey] += commission;
      }
    });
    
    console.log('📊 ค่าคอมมิชชันรายวัน (ไม่กรองวันที่):');
    Object.keys(dailyCommissions).sort().forEach(date => {
      console.log(`${date}: ${dailyCommissions[date].toFixed(2)} ฿`);
    });
    
    const totalDaily = Object.values(dailyCommissions).reduce((sum, val) => sum + val, 0);
    const totalAll = results.reduce((sum, order) => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      if (status === 'ยกเลิก' || status === 'cancelled' || status === 'ยังไม่ชำระเงิน') {
        return sum;
      }
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log('\n📈 สรุป:');
    console.log(`ค่าคอมมิชชันรวมทั้งหมด (ไม่รวมออเดอร์ที่ยกเลิก): ${totalAll.toFixed(2)} ฿`);
    console.log(`ค่าคอมมิชชันรายวันรวม: ${totalDaily.toFixed(2)} ฿`);
    console.log(`ความแตกต่าง: ${(totalAll - totalDaily).toFixed(2)} ฿`);
    
    // ตรวจสอบออเดอร์ที่ไม่มีวันที่
    const ordersWithoutDate = results.filter(order => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      return !order['เวลาที่สั่งซื้อ'] && status !== 'ยกเลิก' && status !== 'cancelled' && status !== 'ยังไม่ชำระเงิน';
    });
    
    console.log(`\n⚠️ ออเดอร์ที่ไม่มีวันที่ (ไม่รวมออเดอร์ที่ยกเลิก): ${ordersWithoutDate.length} ออเดอร์`);
    
    if (ordersWithoutDate.length > 0) {
      console.log('ตัวอย่างออเดอร์ที่ไม่มีวันที่:');
      ordersWithoutDate.slice(0, 3).forEach(order => {
        console.log(`  Order ID: ${order['รหัสการสั่งซื้อ']}, Commission: ${order['คอมมิชชั่นสินค้าโดยรวม(฿)']} ฿`);
      });
    }
    
    // ทดสอบการกรองตามช่วงวันที่
    console.log('\n🔍 ทดสอบการกรองตามช่วงวันที่:');
    
    // กรองเฉพาะวันที่ 2025-08-19
    const filteredByDate = results.filter(order => {
      const orderDate = order['เวลาที่สั่งซื้อ'];
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      if (status === 'ยกเลิก' || status === 'cancelled' || status === 'ยังไม่ชำระเงิน') {
        return false;
      }
      
      if (orderDate && orderDate.startsWith('2025-08-19')) {
        return true;
      }
      return false;
    });
    
    const filteredCommission = filteredByDate.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`วันที่ 2025-08-19: ${filteredByDate.length} ออเดอร์, ${filteredCommission.toFixed(2)} ฿`);
  });
