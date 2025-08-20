const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('test file/AffiliateCommissionReport202508201245-fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data);
  })
  .on('end', () => {
    // ตรวจสอบสถานะของออเดอร์
    const statusCounts = {};
    const statusCommissions = {};
    
    results.forEach(order => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'] || 'ไม่มีสถานะ';
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      if (!statusCounts[status]) {
        statusCounts[status] = 0;
        statusCommissions[status] = 0;
      }
      
      statusCounts[status]++;
      statusCommissions[status] += commission;
    });
    
    console.log('📊 สถานะของออเดอร์:');
    Object.keys(statusCounts).sort().forEach(status => {
      console.log(`${status}: ${statusCounts[status]} ออเดอร์, ${statusCommissions[status].toFixed(2)} ฿`);
    });
    
    // ตรวจสอบออเดอร์ที่ควรถูกกรองออก
    const filteredOutOrders = results.filter(order => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      return status === 'ยกเลิก' || status === 'cancelled' || status === 'ยังไม่ชำระเงิน';
    });
    
    console.log('\n⚠️ ออเดอร์ที่ควรถูกกรองออก:');
    filteredOutOrders.forEach(order => {
      console.log(`  ${order['รหัสการสั่งซื้อ']}: ${order['สถานะการสั่งซื้อ']} - ${order['คอมมิชชั่นสินค้าโดยรวม(฿)']} ฿`);
    });
    
    const totalFilteredCommission = filteredOutOrders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n💰 ค่าคอมมิชชันของออเดอร์ที่ถูกกรองออก: ${totalFilteredCommission.toFixed(2)} ฿`);
    
    // คำนวณค่าคอมมิชชันที่ควรแสดง
    const validOrders = results.filter(order => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      return status !== 'ยกเลิก' && status !== 'cancelled' && status !== 'ยังไม่ชำระเงิน';
    });
    
    const validCommission = validOrders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n✅ ค่าคอมมิชชันที่ควรแสดง: ${validCommission.toFixed(2)} ฿`);
  });
