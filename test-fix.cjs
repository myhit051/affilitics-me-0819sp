const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('test file/AffiliateCommissionReport202508201245-fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    console.log('🔍 ทดสอบการแก้ไขการรวมค่าคอมมิชชัน');
    
    // วิธีเก่า (กรองออเดอร์ที่ซ้ำกัน)
    const uniqueShopeeOrders = new Map();
    results.forEach(order => {
      const orderId = order['รหัสการสั่งซื้อ'];
      const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
        return;
      }
      
      if (!uniqueShopeeOrders.has(orderId)) {
        uniqueShopeeOrders.set(orderId, order);
      }
    });
    
    const oldTotalCommission = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`วิธีเก่า (กรองออเดอร์ที่ซ้ำกัน): ${oldTotalCommission.toFixed(2)} ฿`);
    
    // วิธีใหม่ (รวมค่าคอมมิชชันของออเดอร์เดียวกัน)
    const orderCommissionMap = new Map();
    results.forEach(order => {
      const orderId = order['รหัสการสั่งซื้อ'];
      const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
        return;
      }
      
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      if (!orderCommissionMap.has(orderId)) {
        orderCommissionMap.set(orderId, {
          order: order,
          totalCommission: commission
        });
      } else {
        const existing = orderCommissionMap.get(orderId);
        existing.totalCommission += commission;
      }
    });
    
    const newTotalCommission = Array.from(orderCommissionMap.values()).reduce((sum, { totalCommission }) => {
      return sum + totalCommission;
    }, 0);
    
    console.log(`วิธีใหม่ (รวมค่าคอมมิชชัน): ${newTotalCommission.toFixed(2)} ฿`);
    console.log(`ความแตกต่าง: ${(newTotalCommission - oldTotalCommission).toFixed(2)} ฿`);
    
    // คำนวณค่าคอมมิชชันรายวันด้วยวิธีใหม่
    const dailyCommissions = {};
    
    Array.from(orderCommissionMap.values()).forEach(({ order, totalCommission }) => {
      const orderDate = order['เวลาที่สั่งซื้อ'];
      
      if (orderDate) {
        const dateKey = orderDate.split(' ')[0];
        
        if (!dailyCommissions[dateKey]) {
          dailyCommissions[dateKey] = 0;
        }
        dailyCommissions[dateKey] += totalCommission;
      }
    });
    
    console.log('\n📊 ค่าคอมมิชชันรายวัน (วิธีใหม่):');
    Object.keys(dailyCommissions).sort().forEach(date => {
      console.log(`${date}: ${dailyCommissions[date].toFixed(2)} ฿`);
    });
    
    // ตรวจสอบออเดอร์ที่มีค่าคอมมิชชันสูงสุด
    console.log('\n🔍 ออเดอร์ที่มีค่าคอมมิชชันสูงสุด:');
    const sortedOrders = Array.from(orderCommissionMap.entries())
      .sort(([, a], [, b]) => b.totalCommission - a.totalCommission)
      .slice(0, 5);
    
    sortedOrders.forEach(([orderId, { totalCommission }]) => {
      console.log(`Order ${orderId}: ${totalCommission.toFixed(2)} ฿`);
    });
  });
