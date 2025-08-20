const fs = require('fs');
const csv = require('csv-parser');

// Simulate the getLatestOrders function from ShopeeAffiliate.tsx
function getLatestOrders(shopeeOrders) {
  if (!shopeeOrders.length) return [];
  
  // Sort by time (newest first) and take latest 20
  const sortedOrders = [...shopeeOrders].sort((a, b) => {
    const timeA = new Date(a['เวลาที่สั่งซื้อ'] || a['วันที่สั่งซื้อ'] || '');
    const timeB = new Date(b['เวลาที่สั่งซื้อ'] || b['วันที่สั่งซื้อ'] || '');
    return timeB.getTime() - timeA.getTime();
  });
  
  return sortedOrders.slice(0, 20);
}

// Test the function
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== TESTING ALL LIST TABLE ===');
    console.log(`Total orders: ${orders.length}`);
    
    const latestOrders = getLatestOrders(orders);
    console.log(`Latest 20 orders: ${latestOrders.length}`);
    
    console.log('\n=== LATEST 20 ORDERS ===');
    latestOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order['รหัสการสั่งซื้อ']} - ${order['เวลาที่สั่งซื้อ']} - ${order['คอมมิชชั่นสินค้าโดยรวม(฿)']} ฿`);
    });
    
    console.log('\n=== COMMISSION SUMMARY ===');
    const totalCommission = latestOrders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);
    
    console.log(`Total Commission in latest 20: ${totalCommission} ฿`);
    console.log(`Average Commission per order: ${(totalCommission / latestOrders.length).toFixed(2)} ฿`);
    
    console.log('\n=== CHANNEL BREAKDOWN ===');
    const channelStats = {};
    latestOrders.forEach(order => {
      const channel = order['ช่องทาง'] || 'Unknown';
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      if (!channelStats[channel]) {
        channelStats[channel] = { count: 0, commission: 0 };
      }
      channelStats[channel].count++;
      channelStats[channel].commission += commission;
    });
    
    Object.entries(channelStats).forEach(([channel, stats]) => {
      console.log(`${channel}: ${stats.count} orders, ${stats.commission} ฿`);
    });
    
    console.log('\n=== SUB ID BREAKDOWN ===');
    const subIdStats = {};
    latestOrders.forEach(order => {
      const subIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      subIds.forEach(subId => {
        if (!subIdStats[subId]) {
          subIdStats[subId] = { count: 0, commission: 0 };
        }
        subIdStats[subId].count++;
        subIdStats[subId].commission += commission / subIds.length; // Divide commission among sub IDs
      });
    });
    
    Object.entries(subIdStats)
      .sort((a, b) => b[1].commission - a[1].commission)
      .forEach(([subId, stats]) => {
        console.log(`${subId}: ${stats.count} orders, ${stats.commission.toFixed(2)} ฿`);
      });
    
    console.log('\n=== VERIFICATION ===');
    console.log('This table should show the actual data being displayed in the UI');
    console.log('If the commission total here matches the UI, then the data is correct');
    console.log('If not, there might be a filtering issue in the UI');
  });
