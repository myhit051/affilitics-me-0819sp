const fs = require('fs');
const csv = require('csv-parser');

// Simulate the current filter logic from ShopeeAffiliate.tsx
function applyCurrentFilters(orders, selectedSubIds = [], selectedChannels = [], dateRange = null) {
  console.log('🔍 Applying filters:', {
    selectedSubIds,
    selectedChannels,
    dateRange: dateRange ? {
      from: dateRange.from,
      to: dateRange.to
    } : null
  });

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
        console.log(`❌ Filtered out order ${order['รหัสการสั่งซื้อ']} by Sub ID filter`);
        return false;
      }
    }
    
    // Filter by Channels
    if (selectedChannels.length > 0 && !selectedChannels.includes(order['ช่องทาง'] || '')) {
      console.log(`❌ Filtered out order ${order['รหัสการสั่งซื้อ']} by Channel filter (channel: ${order['ช่องทาง']})`);
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
        if (dateRange?.from && orderDate < dateRange.from) {
          console.log(`❌ Filtered out order ${order['รหัสการสั่งซื้อ']} by Date filter (date: ${orderDate})`);
          return false;
        }
        if (dateRange?.to && orderDate > dateRange.to) {
          console.log(`❌ Filtered out order ${order['รหัสการสั่งซื้อ']} by Date filter (date: ${orderDate})`);
          return false;
        }
      }
    }
    
    return true;
  });
}

// Test different filter scenarios to find what matches the current display
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== TESTING DIFFERENT FILTER SCENARIOS ===');
    
    // Test 1: No filters (should show 156.48)
    console.log('\n=== SCENARIO 1: NO FILTERS ===');
    const noFilters = applyCurrentFilters(orders);
    const total1 = noFilters.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
    console.log(`Result: ${total1.toFixed(2)} ฿ (${noFilters.length} orders)`);
    
    // Test 2: Filter by specific channels
    console.log('\n=== SCENARIO 2: FILTER BY CHANNELS ===');
    const channels = ['Facebook', 'Websites', 'Shopeevideo-Shopee'];
    channels.forEach(channel => {
      const filtered = applyCurrentFilters(orders, [], [channel]);
      const total = filtered.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
      console.log(`Channel "${channel}": ${total.toFixed(2)} ฿ (${filtered.length} orders)`);
    });
    
    // Test 3: Filter by specific Sub IDs
    console.log('\n=== SCENARIO 3: FILTER BY SUB IDS ===');
    const subIds = ['mng', 'tunis', 'paris'];
    subIds.forEach(subId => {
      const filtered = applyCurrentFilters(orders, [subId]);
      const total = filtered.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
      console.log(`Sub ID "${subId}": ${total.toFixed(2)} ฿ (${filtered.length} orders)`);
    });
    
    // Test 4: Filter by date range (2025-08-18 only)
    console.log('\n=== SCENARIO 4: FILTER BY DATE RANGE ===');
    const dateFilter = applyCurrentFilters(orders, [], [], {
      from: new Date('2025-08-18'),
      to: new Date('2025-08-18')
    });
    const total4 = dateFilter.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
    console.log(`Date range 2025-08-18: ${total4.toFixed(2)} ฿ (${dateFilter.length} orders)`);
    
    // Test 5: Filter by date range (2025-08-19 only)
    console.log('\n=== SCENARIO 5: FILTER BY DATE RANGE ===');
    const dateFilter2 = applyCurrentFilters(orders, [], [], {
      from: new Date('2025-08-19'),
      to: new Date('2025-08-19')
    });
    const total5 = dateFilter2.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
    console.log(`Date range 2025-08-19: ${total5.toFixed(2)} ฿ (${dateFilter2.length} orders)`);
    
    // Test 6: Filter by multiple Sub IDs
    console.log('\n=== SCENARIO 6: FILTER BY MULTIPLE SUB IDS ===');
    const multiSubIdFilter = applyCurrentFilters(orders, ['mng', 'tunis']);
    const total6 = multiSubIdFilter.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
    console.log(`Sub IDs ["mng", "tunis"]: ${total6.toFixed(2)} ฿ (${multiSubIdFilter.length} orders)`);
    
    // Test 7: Filter by channel and Sub ID
    console.log('\n=== SCENARIO 7: FILTER BY CHANNEL AND SUB ID ===');
    const channelSubIdFilter = applyCurrentFilters(orders, ['mng'], ['Facebook']);
    const total7 = channelSubIdFilter.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
    console.log(`Channel "Facebook" + Sub ID "mng": ${total7.toFixed(2)} ฿ (${channelSubIdFilter.length} orders)`);
    
    // Find which scenario matches 107.98
    console.log('\n=== FINDING MATCH FOR 107.98 ===');
    const targetValue = 107.98;
    
    // Test all combinations
    const allChannels = ['Facebook', 'Websites', 'Shopeevideo-Shopee'];
    const allSubIds = ['mng', 'tunis', 'paris', 'MOAUG25', '30444549'];
    
    // Test single channel
    allChannels.forEach(channel => {
      const filtered = applyCurrentFilters(orders, [], [channel]);
      const total = filtered.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
      if (Math.abs(total - targetValue) < 0.1) {
        console.log(`🎯 MATCH FOUND: Channel "${channel}" = ${total.toFixed(2)} ฿`);
      }
    });
    
    // Test single Sub ID
    allSubIds.forEach(subId => {
      const filtered = applyCurrentFilters(orders, [subId]);
      const total = filtered.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
      if (Math.abs(total - targetValue) < 0.1) {
        console.log(`🎯 MATCH FOUND: Sub ID "${subId}" = ${total.toFixed(2)} ฿`);
      }
    });
    
    // Test date ranges
    const dates = ['2025-08-18', '2025-08-19'];
    dates.forEach(date => {
      const filtered = applyCurrentFilters(orders, [], [], {
        from: new Date(date),
        to: new Date(date)
      });
      const total = filtered.reduce((sum, order) => sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'), 0);
      if (Math.abs(total - targetValue) < 0.1) {
        console.log(`🎯 MATCH FOUND: Date "${date}" = ${total.toFixed(2)} ฿`);
      }
    });
  });
