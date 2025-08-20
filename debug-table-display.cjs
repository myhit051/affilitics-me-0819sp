const fs = require('fs');
const csv = require('csv-parser');

// Simulate the table display logic
function simulateTableDisplay(orders) {
  console.log('=== SIMULATING TABLE DISPLAY ===');
  console.log('Order ID | Commission | Status | Commission Display | Status Display');
  console.log('---------|------------|--------|-------------------|----------------');
  
  orders.forEach((order, index) => {
    const orderId = order['รหัสการสั่งซื้อ'];
    const commission = order['คอมมิชชั่นสินค้าโดยรวม(฿)'];
    const status = order['สถานะสินค้า Affiliate'];
    
    // Simulate the display logic
    const commissionDisplay = `฿${parseFloat(commission || '0').toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    })}`;
    
    const statusDisplay = status;
    
    console.log(`${orderId} | ${commission} | ${status} | ${commissionDisplay} | ${statusDisplay}`);
  });
}

// Test specific problematic orders
function testSpecificOrders(orders) {
  console.log('\n=== TESTING SPECIFIC PROBLEMATIC ORDERS ===');
  
  const problematicOrders = [
    '2508196TWGMSH9',
    '2508184JEEDTEU'
  ];
  
  problematicOrders.forEach(orderId => {
    const order = orders.find(o => o['รหัสการสั่งซื้อ'] === orderId);
    if (order) {
      console.log(`\n📋 Order: ${orderId}`);
      console.log(`  Raw Commission: "${order['คอมมิชชั่นสินค้าโดยรวม(฿)']}"`);
      console.log(`  Raw Status: "${order['สถานะสินค้า Affiliate']}"`);
      console.log(`  Commission Type: ${typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)']}`);
      console.log(`  Status Type: ${typeof order['สถานะสินค้า Affiliate']}`);
      console.log(`  Commission Parsed: ${parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0')}`);
      console.log(`  Status Parsed: ${order['สถานะสินค้า Affiliate']}`);
    }
  });
}

// Test the function
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== TESTING TABLE DISPLAY ===');
    console.log(`Total orders: ${orders.length}`);
    
    simulateTableDisplay(orders);
    testSpecificOrders(orders);
    
    console.log('\n=== CONCLUSION ===');
    console.log('If the table shows wrong values, the issue might be:');
    console.log('1. Browser cache - try hard refresh (Ctrl+F5)');
    console.log('2. React state not updating - check if data is being re-processed');
    console.log('3. Column mapping issue - check if columns are correctly mapped');
    console.log('4. Data transformation issue - check if data is being modified during processing');
  });
