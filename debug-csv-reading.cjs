const fs = require('fs');
const csv = require('csv-parser');

// Test CSV reading
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== TESTING CSV READING ===');
    console.log(`Total orders: ${orders.length}`);
    
    // Check specific problematic orders
    console.log('\n=== CHECKING PROBLEMATIC ORDERS ===');
    
    // Order 2508196TWGMSH9
    const order1 = orders.find(o => o['รหัสการสั่งซื้อ'] === '2508196TWGMSH9');
    if (order1) {
      console.log('\n📋 Order 2508196TWGMSH9:');
      console.log('  Commission column:', order1['คอมมิชชั่นสินค้าโดยรวม(฿)']);
      console.log('  Status column:', order1['สถานะสินค้า Affiliate']);
      console.log('  All columns:', Object.keys(order1));
    }
    
    // Order 2508184JEEDTEU
    const order2 = orders.find(o => o['รหัสการสั่งซื้อ'] === '2508184JEEDTEU');
    if (order2) {
      console.log('\n📋 Order 2508184JEEDTEU:');
      console.log('  Commission column:', order2['คอมมิชชั่นสินค้าโดยรวม(฿)']);
      console.log('  Status column:', order2['สถานะสินค้า Affiliate']);
      console.log('  All columns:', Object.keys(order2));
    }
    
    // Check all orders for commission values
    console.log('\n=== ALL COMMISSION VALUES ===');
    orders.forEach((order, index) => {
      const commission = order['คอมมิชชั่นสินค้าโดยรวม(฿)'];
      const status = order['สถานะสินค้า Affiliate'];
      console.log(`${index + 1}. ${order['รหัสการสั่งซื้อ']}: Commission=${commission}, Status=${status}`);
    });
    
    // Calculate total commission
    const totalCommission = orders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`\n=== TOTAL COMMISSION ===`);
    console.log(`Total: ${totalCommission} ฿`);
    
    // Check if there are any orders with commission in status column
    console.log('\n=== CHECKING FOR MISPLACED VALUES ===');
    orders.forEach((order, index) => {
      const status = order['สถานะสินค้า Affiliate'];
      const commission = order['คอมมิชชั่นสินค้าโดยรวม(฿)'];
      
      // Check if status contains a number (might be misplaced commission)
      if (status && !isNaN(parseFloat(status)) && status !== '0') {
        console.log(`⚠️  Order ${index + 1} (${order['รหัสการสั่งซื้อ']}): Status contains number: "${status}"`);
        console.log(`    Commission column: "${commission}"`);
      }
    });
  });
