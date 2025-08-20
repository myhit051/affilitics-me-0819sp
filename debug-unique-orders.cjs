const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('test file/AffiliateCommissionReport202508201245-fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    console.log('🔍 ตรวจสอบการกรองออเดอร์ที่ซ้ำกัน');
    
    // คำนวณค่าคอมมิชชันรวมทั้งหมด (ไม่กรองออเดอร์ที่ซ้ำกัน)
    const totalCommissionAll = results.reduce((sum, order) => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      if (status === 'ยกเลิก' || status === 'cancelled' || status === 'ยังไม่ชำระเงิน') {
        return sum;
      }
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`ค่าคอมมิชชันรวมทั้งหมด (ไม่กรองออเดอร์ที่ซ้ำกัน): ${totalCommissionAll.toFixed(2)} ฿`);
    
    // กรองออเดอร์ที่ซ้ำกันแบบเดียวกับในโค้ด
    const uniqueShopeeOrders = new Map();
    results.forEach(order => {
      const orderId = order['รหัสการสั่งซื้อ'];
      const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      // ข้ามออเดอร์ที่ยกเลิก
      if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
        return;
      }
      
      if (!uniqueShopeeOrders.has(orderId)) {
        uniqueShopeeOrders.set(orderId, order);
      }
    });
    
    const totalCommissionUnique = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`ค่าคอมมิชชันรวม (กรองออเดอร์ที่ซ้ำกัน): ${totalCommissionUnique.toFixed(2)} ฿`);
    console.log(`ความแตกต่าง: ${(totalCommissionAll - totalCommissionUnique).toFixed(2)} ฿`);
    
    // ตรวจสอบออเดอร์ที่ซ้ำกัน
    const orderIds = results.map(order => order['รหัสการสั่งซื้อ']);
    const uniqueOrderIds = [...new Set(orderIds)];
    console.log(`\nออเดอร์ทั้งหมด: ${results.length}`);
    console.log(`ออเดอร์ที่ไม่ซ้ำกัน: ${uniqueOrderIds.length}`);
    console.log(`ออเดอร์ที่ซ้ำกัน: ${results.length - uniqueOrderIds.length}`);
    
    // ตรวจสอบออเดอร์ที่ซ้ำกัน
    const duplicates = orderIds.filter((id, index) => orderIds.indexOf(id) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];
    console.log(`\nออเดอร์ที่ซ้ำกัน: ${uniqueDuplicates.length} รายการ`);
    
    // ตรวจสอบค่าคอมมิชชันของออเดอร์ที่ซ้ำกัน
    uniqueDuplicates.forEach(orderId => {
      const duplicateOrders = results.filter(order => order['รหัสการสั่งซื้อ'] === orderId);
      const totalCommission = duplicateOrders.reduce((sum, order) => {
        return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      }, 0);
      console.log(`Order ${orderId}: ${duplicateOrders.length} entries, Total Commission: ${totalCommission.toFixed(2)} ฿`);
    });
    
    // ตรวจสอบค่าคอมมิชชันรายวันจากออเดอร์ที่ไม่ซ้ำกัน
    const dailyCommissions = {};
    
    Array.from(uniqueShopeeOrders.values()).forEach(order => {
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
    
    console.log('\n📊 ค่าคอมมิชชันรายวัน (จากออเดอร์ที่ไม่ซ้ำกัน):');
    Object.keys(dailyCommissions).sort().forEach(date => {
      console.log(`${date}: ${dailyCommissions[date].toFixed(2)} ฿`);
    });
  });
