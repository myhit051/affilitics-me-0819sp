const fs = require('fs');
const csv = require('csv-parser');

// Simulate the processImportedData function
function processImportedData(data, selectedSubIds = [], selectedValidity = "all", selectedChannels = [], dateRange, selectedPlatform = "all") {
  console.log('🔍 processImportedData called with:', {
    dataLength: data.shopeeOrders.length,
    selectedSubIds,
    selectedValidity,
    selectedChannels,
    dateRange,
    selectedPlatform
  });

  // Simulate filterDataByDate
  function filterDataByDate(data, dateRange) {
    console.log('🔍 filterDataByDate called with:', {
      hasDateRange: !!dateRange,
      dateRange: dateRange,
      condition: !dateRange?.from || !dateRange?.to
    });

    if (!dateRange?.from || !dateRange?.to) {
      console.log('✅ No date range specified, returning all data');
      return data;
    }

    console.log('❌ Date range specified, filtering data...');
    return data;
  }

  // Simulate calculateMetrics
  function calculateMetrics(shopeeOrders, lazadaOrders, facebookAds, selectedSubIds, selectedValidity, selectedChannels, selectedPlatform) {
    console.log('🔍 calculateMetrics called with:', {
      shopeeOrdersLength: shopeeOrders.length,
      selectedSubIds,
      selectedValidity,
      selectedChannels,
      selectedPlatform
    });

    // Simulate the filtering logic from affiliateCalculations.ts
    let filteredShopeeOrders = selectedPlatform === "all" || selectedPlatform === "Shopee" ? shopeeOrders : [];
    
    if (selectedSubIds.length > 0 && !selectedSubIds.includes('all')) {
      filteredShopeeOrders = filteredShopeeOrders.filter(order => {
        const orderSubIds = [
          order['Sub_id1'],
          order['Sub_id2'],
          order['Sub_id3'],
          order['Sub_id4'],
          order['Sub_id5']
        ].filter(Boolean);
        
        return orderSubIds.some(subId => selectedSubIds.includes(subId || ''));
      });
    }

    if (selectedChannels.length > 0 && !selectedChannels.includes('all')) {
      filteredShopeeOrders = filteredShopeeOrders.filter(order => 
        selectedChannels.includes(order['ช่องทาง'] || '')
      );
    }

    console.log('🔍 AFTER FILTERS - SHOPEE ORDERS:', filteredShopeeOrders.length);

    // Calculate commission
    const totalComSP = filteredShopeeOrders.reduce((sum, order) => {
      return sum + parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
    }, 0);

    return {
      totalComSP: Math.round(totalComSP * 100) / 100,
      totalOrdersSP: filteredShopeeOrders.length,
      filteredShopeeOrders
    };
  }

  // Simulate the actual process
  const dateFilteredData = filterDataByDate(data, dateRange);
  
  const metrics = calculateMetrics(
    dateFilteredData.shopeeOrders,
    dateFilteredData.lazadaOrders,
    dateFilteredData.facebookAds,
    selectedSubIds,
    selectedValidity,
    selectedChannels,
    selectedPlatform
  );

  return metrics;
}

// Test the function
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== TESTING processImportedData ===');
    console.log(`Total orders: ${orders.length}`);
    
    const testData = {
      shopeeOrders: orders,
      lazadaOrders: [],
      facebookAds: []
    };

    // Test 1: Default call (like in useImportedData)
    console.log('\n=== TEST 1: Default call (processImportedData(data)) ===');
    const result1 = processImportedData(testData);
    console.log(`Result: ${result1.totalComSP} ฿ (${result1.totalOrdersSP} orders)`);

    // Test 2: Explicit call with no filters
    console.log('\n=== TEST 2: Explicit call with no filters ===');
    const result2 = processImportedData(testData, [], "all", [], undefined, "all");
    console.log(`Result: ${result2.totalComSP} ฿ (${result2.totalOrdersSP} orders)`);

    // Test 3: Call with specific channel filter
    console.log('\n=== TEST 3: Call with channel filter ["Websites"] ===');
    const result3 = processImportedData(testData, [], "all", ["Websites"], undefined, "all");
    console.log(`Result: ${result3.totalComSP} ฿ (${result3.totalOrdersSP} orders)`);

    // Test 4: Call with specific Sub ID filter
    console.log('\n=== TEST 4: Call with Sub ID filter ["tunis"] ===');
    const result4 = processImportedData(testData, ["tunis"], "all", [], undefined, "all");
    console.log(`Result: ${result4.totalComSP} ฿ (${result4.totalOrdersSP} orders)`);

    console.log('\n=== CONCLUSION ===');
    console.log('The issue is that the default call should return 156.48 ฿');
    console.log('If it returns 107.98 ฿, there might be a bug in the filtering logic');
  });
