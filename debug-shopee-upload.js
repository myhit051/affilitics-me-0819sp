// Debug script to check Shopee upload and StatsCard display issues
console.log('🔍 Debugging Shopee upload and StatsCard issues...');

// Function to check localStorage data
function checkLocalStorageData() {
  console.log('📊 Checking localStorage data...');
  
  const keys = ['affiliateData', 'affiliateMetrics'];
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`✅ ${key} exists:`, {
          type: typeof parsed,
          shopeeOrders: parsed.shopeeOrders ? parsed.shopeeOrders.length : 'N/A',
          totalComSP: parsed.totalComSP || 'N/A',
          totalOrdersSP: parsed.totalOrdersSP || 'N/A',
          totalAmountSP: parsed.totalAmountSP || 'N/A'
        });
        
        if (parsed.shopeeOrders && parsed.shopeeOrders.length > 0) {
          console.log('🔍 Sample Shopee order:', {
            orderId: parsed.shopeeOrders[0]['รหัสการสั่งซื้อ'],
            commission: parsed.shopeeOrders[0]['คอมมิชชั่นสินค้าโดยรวม(฿)'],
            amount: parsed.shopeeOrders[0]['มูลค่าซื้อ(฿)'],
            status: parsed.shopeeOrders[0]['สถานะการสั่งซื้อ'],
            allKeys: Object.keys(parsed.shopeeOrders[0])
          });
        }
      } else {
        console.log(`❌ ${key} not found`);
      }
    } catch (error) {
      console.error(`❌ Error parsing ${key}:`, error);
    }
  });
}

// Function to simulate data processing
function simulateDataProcessing() {
  console.log('🔄 Simulating data processing...');
  
  try {
    const affiliateData = localStorage.getItem('affiliateData');
    if (!affiliateData) {
      console.log('❌ No affiliateData found in localStorage');
      return;
    }
    
    const data = JSON.parse(affiliateData);
    if (!data.shopeeOrders || data.shopeeOrders.length === 0) {
      console.log('❌ No Shopee orders found');
      return;
    }
    
    // Simulate the calculation logic from affiliateCalculations.ts
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
    
    console.log('📊 Calculated metrics:', {
      totalComSP: Math.round(totalComSP * 100) / 100,
      totalOrdersSP,
      totalAmountSP: Math.round(totalAmountSP * 100) / 100,
      uniqueOrdersCount: uniqueShopeeOrders.size,
      cancelledOrders: data.shopeeOrders.filter(order => {
        const status = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
        return status === 'ยกเลิก' || status === 'cancelled';
      }).length
    });
    
  } catch (error) {
    console.error('❌ Error in data processing simulation:', error);
  }
}

// Function to check React component state
function checkReactState() {
  console.log('🔍 Checking React component state...');
  
  // Check if we're on the Shopee Affiliate page
  const currentPath = window.location.pathname;
  console.log('📍 Current path:', currentPath);
  
  if (currentPath.includes('shopee') || currentPath === '/') {
    console.log('✅ On Shopee Affiliate page');
    
    // Check for StatsCard components
    const statsCards = document.querySelectorAll('[data-testid="stats-card"], .stats-card, [class*="stats"]');
    console.log('📊 StatsCard components found:', statsCards.length);
    
    statsCards.forEach((card, index) => {
      console.log(`📊 StatsCard ${index + 1}:`, {
        text: card.textContent?.trim(),
        className: card.className,
        children: card.children.length
      });
    });
  }
}

// Function to check for errors in console
function checkForErrors() {
  console.log('🔍 Checking for errors...');
  
  // Check if there are any error messages in the page
  const errorElements = document.querySelectorAll('.error, [class*="error"], .alert, [class*="alert"]');
  console.log('❌ Error elements found:', errorElements.length);
  
  errorElements.forEach((error, index) => {
    console.log(`❌ Error ${index + 1}:`, {
      text: error.textContent?.trim(),
      className: error.className
    });
  });
}

// Run all checks
console.log('🚀 Starting comprehensive debug...');
checkLocalStorageData();
simulateDataProcessing();
checkReactState();
checkForErrors();

// Add event listener for file upload
document.addEventListener('DOMContentLoaded', () => {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  console.log('📁 File inputs found:', fileInputs.length);
  
  fileInputs.forEach((input, index) => {
    console.log(`📁 File input ${index + 1}:`, {
      accept: input.accept,
      multiple: input.multiple,
      name: input.name,
      id: input.id
    });
    
    input.addEventListener('change', (e) => {
      const files = e.target.files;
      console.log(`📁 File selected in input ${index + 1}:`, {
        fileCount: files.length,
        fileNames: Array.from(files).map(f => f.name),
        fileSizes: Array.from(files).map(f => f.size)
      });
    });
  });
});

console.log('✅ Debug script loaded. Check console for results.');
