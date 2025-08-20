const fs = require('fs');
const csv = require('csv-parser');

// Simulate the filter logic from ShopeeAffiliate.tsx
function applyFilters(orders, selectedSubIds = [], selectedChannels = [], dateRange = null) {
  return orders.filter(order => {
    // Filter by Sub IDs
    if (selectedSubIds.length > 0) {
      const orderSubIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      if (!orderSubIds.some(subId => selectedSubIds.includes(subId || ''))) {
        return false;
      }
    }
    
    // Filter by Channels
    if (selectedChannels.length > 0 && !selectedChannels.includes(order['ช่องทาง'] || '')) {
      return false;
    }
    
    // Filter by Date Range
    if (dateRange?.from || dateRange?.to) {
      const possibleDateColumns = ['เวลาที่สั่งซื้อ', 'วันที่สั่งซื้อ', 'Order Time', 'Order Date', 'Date'];
      let orderDate = null;
      
      for (const column of possibleDateColumns) {
        if (order[column]) {
          try {
            orderDate = new Date(order[column]);
            if (!isNaN(orderDate.getTime())) break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (orderDate) {
        if (dateRange?.from && orderDate < dateRange.from) return false;
        if (dateRange?.to && orderDate > dateRange.to) return false;
      }
    }
    
    return true;
  });
}

// Simulate the commission calculation
function calculateCommission(orders) {
  const uniqueShopeeOrders = new Map();
  
  orders.forEach(order => {
    const orderId = order['รหัสการสั่งซื้อ'] || order['เลขที่คำสั่งซื้อ'];
    
    if (!uniqueShopeeOrders.has(orderId)) {
      uniqueShopeeOrders.set(orderId, {
        ...order,
        'คอมมิชชั่นสินค้าโดยรวม(฿)': parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'),
        'มูลค่าซื้อ(฿)': parseFloat(order['มูลค่าซื้อ(฿)'] || '0')
      });
    } else {
      const existing = uniqueShopeeOrders.get(orderId);
      existing['คอมมิชชั่นสินค้าโดยรวม(฿)'] += parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      existing['มูลค่าซื้อ(฿)'] += parseFloat(order['มูลค่าซื้อ(฿)'] || '0');
    }
  });

  const totalCommission = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    return sum + (typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)'] === 'number'
      ? order['คอมมิชชั่นสินค้าโดยรวม(฿)']
      : parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'));
  }, 0);

  return {
    totalCommission: Math.round(totalCommission * 100) / 100,
    uniqueOrders: uniqueShopeeOrders.size,
    orderDetails: Array.from(uniqueShopeeOrders.entries()).map(([orderId, order]) => ({
      orderId,
      commission: order['คอมมิชชั่นสินค้าโดยรวม(฿)'],
      amount: order['มูลค่าซื้อ(฿)']
    }))
  };
}

// Read CSV and test different filter scenarios
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== ORIGINAL DATA ===');
    console.log(`Total orders: ${orders.length}`);
    
    // Test 1: No filters
    console.log('\n=== TEST 1: NO FILTERS ===');
    const noFilters = applyFilters(orders);
    const result1 = calculateCommission(noFilters);
    console.log(`Filtered orders: ${noFilters.length}`);
    console.log(`Total Commission: ${result1.totalCommission} ฿`);
    console.log(`Unique orders: ${result1.uniqueOrders}`);
    
    // Test 2: Filter by specific Sub ID
    console.log('\n=== TEST 2: FILTER BY SUB ID "mng" ===');
    const subIdFilter = applyFilters(orders, ['mng']);
    const result2 = calculateCommission(subIdFilter);
    console.log(`Filtered orders: ${subIdFilter.length}`);
    console.log(`Total Commission: ${result2.totalCommission} ฿`);
    console.log(`Unique orders: ${result2.uniqueOrders}`);
    
    // Test 3: Filter by specific Channel
    console.log('\n=== TEST 3: FILTER BY CHANNEL "Facebook" ===');
    const channelFilter = applyFilters(orders, [], ['Facebook']);
    const result3 = calculateCommission(channelFilter);
    console.log(`Filtered orders: ${channelFilter.length}`);
    console.log(`Total Commission: ${result3.totalCommission} ฿`);
    console.log(`Unique orders: ${result3.uniqueOrders}`);
    
    // Test 4: Filter by multiple Sub IDs
    console.log('\n=== TEST 4: FILTER BY MULTIPLE SUB IDS ["mng", "tunis"] ===');
    const multiSubIdFilter = applyFilters(orders, ['mng', 'tunis']);
    const result4 = calculateCommission(multiSubIdFilter);
    console.log(`Filtered orders: ${multiSubIdFilter.length}`);
    console.log(`Total Commission: ${result4.totalCommission} ฿`);
    console.log(`Unique orders: ${result4.uniqueOrders}`);
    
    // Test 5: Filter by date range (2025-08-18 only)
    console.log('\n=== TEST 5: FILTER BY DATE RANGE (2025-08-18 only) ===');
    const dateFilter = applyFilters(orders, [], [], {
      from: new Date('2025-08-18'),
      to: new Date('2025-08-18')
    });
    const result5 = calculateCommission(dateFilter);
    console.log(`Filtered orders: ${dateFilter.length}`);
    console.log(`Total Commission: ${result5.totalCommission} ฿`);
    console.log(`Unique orders: ${result5.uniqueOrders}`);
    
    // Show which orders are being filtered out
    console.log('\n=== DETAILED ANALYSIS ===');
    console.log('Orders that would be filtered out by Sub ID "mng" filter:');
    orders.forEach((order, index) => {
      const orderSubIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      if (!orderSubIds.some(subId => ['mng'].includes(subId || ''))) {
        console.log(`  ${index + 1}. Order ${order['รหัสการสั่งซื้อ']}: ${order['คอมมิชชั่นสินค้าโดยรวม(฿)']} ฿ (Sub IDs: ${orderSubIds.join(', ')})`);
      }
    });
  });
