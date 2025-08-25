// Test script to verify Shopee upload fix
console.log('🧪 Testing Shopee upload fix...');

// Function to simulate the fix
function testShopeeUploadFix() {
  console.log('📊 Testing localStorage data structure...');
  
  // Check if the fix is working
  const affiliateData = localStorage.getItem('affiliateData');
  const affiliateMetrics = localStorage.getItem('affiliateMetrics');
  
  if (affiliateData) {
    const data = JSON.parse(affiliateData);
    console.log('✅ affiliateData exists:', {
      shopeeOrders: data.shopeeOrders ? data.shopeeOrders.length : 0,
      lazadaOrders: data.lazadaOrders ? data.lazadaOrders.length : 0,
      facebookAds: data.facebookAds ? data.facebookAds.length : 0
    });
    
    if (data.shopeeOrders && data.shopeeOrders.length > 0) {
      console.log('🔍 Sample Shopee order structure:', {
        orderId: data.shopeeOrders[0]['รหัสการสั่งซื้อ'],
        commission: data.shopeeOrders[0]['คอมมิชชั่นสินค้าโดยรวม(฿)'],
        amount: data.shopeeOrders[0]['มูลค่าซื้อ(฿)'],
        status: data.shopeeOrders[0]['สถานะการสั่งซื้อ']
      });
    }
  } else {
    console.log('❌ No affiliateData found');
  }
  
  if (affiliateMetrics) {
    const metrics = JSON.parse(affiliateMetrics);
    console.log('✅ affiliateMetrics exists:', {
      totalComSP: metrics.totalComSP || 'N/A',
      totalOrdersSP: metrics.totalOrdersSP || 'N/A',
      totalAmountSP: metrics.totalAmountSP || 'N/A',
      hasProperMetrics: !!(metrics.totalComSP && metrics.totalOrdersSP && metrics.totalAmountSP)
    });
    
    // Check if metrics have proper structure (not basic metrics)
    const isBasicMetrics = metrics.shopeeCount !== undefined;
    if (isBasicMetrics) {
      console.log('⚠️ Using basic metrics (fallback)');
    } else {
      console.log('✅ Using proper calculated metrics');
    }
  } else {
    console.log('❌ No affiliateMetrics found');
  }
}

// Function to test the calculation logic
function testCalculationLogic() {
  console.log('🧮 Testing calculation logic...');
  
  const affiliateData = localStorage.getItem('affiliateData');
  if (!affiliateData) {
    console.log('❌ No data to test');
    return;
  }
  
  const data = JSON.parse(affiliateData);
  if (!data.shopeeOrders || data.shopeeOrders.length === 0) {
    console.log('❌ No Shopee orders to test');
    return;
  }
  
  // Simulate the calculation logic
  const uniqueShopeeOrders = new Map();
  data.shopeeOrders.forEach(order => {
    const orderId = order['รหัสการสั่งซื้อ'];
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    
    // Skip cancelled orders
    if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
      return;
    }
    
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
  
  const totalComSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    return sum + (typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)'] === 'number' 
      ? order['คอมมิชชั่นสินค้าโดยรวม(฿)'] 
      : parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'));
  }, 0);
  
  const totalOrdersSP = uniqueShopeeOrders.size;
  
  const totalAmountSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    return sum + (typeof order['มูลค่าซื้อ(฿)'] === 'number' 
      ? order['มูลค่าซื้อ(฿)'] 
      : parseFloat(order['มูลค่าซื้อ(฿)'] || '0'));
  }, 0);
  
  console.log('📊 Calculation test results:', {
    totalComSP: Math.round(totalComSP * 100) / 100,
    totalOrdersSP,
    totalAmountSP: Math.round(totalAmountSP * 100) / 100,
    uniqueOrdersCount: uniqueShopeeOrders.size,
    cancelledOrders: data.shopeeOrders.filter(order => {
      const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      return status === 'ยกเลิก' || status === 'cancelled';
    }).length
  });
}

// Function to test StatsCard display
function testStatsCardDisplay() {
  console.log('📊 Testing StatsCard display...');
  
  // Check if we're on the Shopee Affiliate page
  const currentPath = window.location.pathname;
  if (currentPath.includes('shopee') || currentPath === '/') {
    console.log('✅ On Shopee Affiliate page');
    
    // Look for StatsCard components
    const statsCards = document.querySelectorAll('[class*="stats"], [class*="card"]');
    console.log('📊 Found potential StatsCard components:', statsCards.length);
    
    // Look for specific metrics display
    const commissionElements = document.querySelectorAll('*:contains("Commission"), *:contains("Commission")');
    const orderElements = document.querySelectorAll('*:contains("Orders"), *:contains("Orders")');
    const amountElements = document.querySelectorAll('*:contains("Sales"), *:contains("Amount")');
    
    console.log('🔍 Found metric elements:', {
      commission: commissionElements.length,
      orders: orderElements.length,
      amount: amountElements.length
    });
  } else {
    console.log('❌ Not on Shopee Affiliate page');
  }
}

// Run all tests
console.log('🚀 Starting comprehensive test...');
testShopeeUploadFix();
testCalculationLogic();
testStatsCardDisplay();

console.log('✅ Test completed. Check console for results.');
