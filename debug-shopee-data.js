// Debug script to check Shopee data in localStorage
console.log('🔍 Debugging Shopee data in localStorage...');

// Check all relevant localStorage keys
const keys = [
  'affiliateData',
  'affiliateRawData', 
  'affiliateMetrics',
  'affiliateSubIdAnalysis',
  'affiliatePlatformAnalysis',
  'affiliateDailyMetrics'
];

keys.forEach(key => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`📊 ${key}:`, {
        exists: true,
        type: typeof parsed,
        isArray: Array.isArray(parsed),
        keys: typeof parsed === 'object' ? Object.keys(parsed) : null,
        shopeeOrders: parsed.shopeeOrders ? parsed.shopeeOrders.length : 'N/A',
        sampleShopeeOrder: parsed.shopeeOrders && parsed.shopeeOrders.length > 0 ? parsed.shopeeOrders[0] : 'N/A'
      });
    } else {
      console.log(`❌ ${key}: Not found`);
    }
  } catch (error) {
    console.error(`❌ Error parsing ${key}:`, error);
  }
});

// Check specific Shopee data structure
try {
  const affiliateData = localStorage.getItem('affiliateData');
  if (affiliateData) {
    const data = JSON.parse(affiliateData);
    if (data.shopeeOrders && data.shopeeOrders.length > 0) {
      console.log('🔍 Shopee Orders Sample:', {
        totalOrders: data.shopeeOrders.length,
        firstOrder: data.shopeeOrders[0],
        orderKeys: Object.keys(data.shopeeOrders[0]),
        commissionField: data.shopeeOrders[0]['คอมมิชชั่นสินค้าโดยรวม(฿)'],
        orderIdField: data.shopeeOrders[0]['รหัสการสั่งซื้อ'],
        statusField: data.shopeeOrders[0]['สถานะการสั่งซื้อ']
      });
    } else {
      console.log('❌ No Shopee orders found in affiliateData');
    }
  }
} catch (error) {
  console.error('❌ Error checking Shopee data:', error);
}

// Check calculated metrics
try {
  const metrics = localStorage.getItem('affiliateMetrics');
  if (metrics) {
    const parsedMetrics = JSON.parse(metrics);
    console.log('📊 Calculated Metrics:', {
      totalComSP: parsedMetrics.totalComSP,
      totalOrdersSP: parsedMetrics.totalOrdersSP,
      totalAmountSP: parsedMetrics.totalAmountSP,
      allKeys: Object.keys(parsedMetrics)
    });
  } else {
    console.log('❌ No calculated metrics found');
  }
} catch (error) {
  console.error('❌ Error checking metrics:', error);
}
