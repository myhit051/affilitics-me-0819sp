const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('test file/AffiliateCommissionReport202508201245-fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    // ตรวจสอบค่าคอมมิชชันรายวัน
    const dailyCommissions = {};
    
    results.forEach(order => {
      const orderDate = order['เวลาที่สั่งซื้อ'];
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      if (orderDate) {
        const dateKey = orderDate.split(' ')[0]; // เอาเฉพาะวันที่
        
        if (!dailyCommissions[dateKey]) {
          dailyCommissions[dateKey] = 0;
        }
        dailyCommissions[dateKey] += commission;
      }
    });
    
    console.log('📊 ค่าคอมมิชชันรายวัน:');
    Object.keys(dailyCommissions).sort().forEach(date => {
      console.log(`${date}: ${dailyCommissions[date].toFixed(2)} ฿`);
    });
    
    const totalDaily = Object.values(dailyCommissions).reduce((sum, val) => sum + val, 0);
    const totalAll = results.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
    
    console.log('\n📈 สรุป:');
    console.log(`ค่าคอมมิชชันรวมทั้งหมด: ${totalAll.toFixed(2)} ฿`);
    console.log(`ค่าคอมมิชชันรายวันรวม: ${totalDaily.toFixed(2)} ฿`);
    console.log(`ความแตกต่าง: ${(totalAll - totalDaily).toFixed(2)} ฿`);
    
    // ตรวจสอบออเดอร์ที่ไม่มีวันที่
    const ordersWithoutDate = results.filter(order => !order['เวลาที่สั่งซื้อ']);
    console.log(`\n⚠️ ออเดอร์ที่ไม่มีวันที่: ${ordersWithoutDate.length} ออเดอร์`);
    
    if (ordersWithoutDate.length > 0) {
      console.log('ตัวอย่างออเดอร์ที่ไม่มีวันที่:');
      ordersWithoutDate.slice(0, 3).forEach(order => {
        console.log(`  Order ID: ${order['รหัสการสั่งซื้อ']}, Commission: ${order['คอมมิชชั่นสินค้าโดยรวม(฿)']} ฿`);
      });
    }
  });
