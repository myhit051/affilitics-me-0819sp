const fs = require('fs');
const csv = require('csv-parser');

// Simulate the parseNumber function from the system
const parseNumber = (value) => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;

  const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  const result = isNaN(parsed) ? 0 : parsed;
  
  return result;
};

// Simulate the deduplication logic from the system
function calculateCommissionLikeSystem(orders) {
  const uniqueShopeeOrders = new Map();
  
  orders.forEach(order => {
    const orderId = order['รหัสการสั่งซื้อ'] || order['เลขที่คำสั่งซื้อ'];
    
    if (!uniqueShopeeOrders.has(orderId)) {
      uniqueShopeeOrders.set(orderId, {
        ...order,
        'คอมมิชชั่นสินค้าโดยรวม(฿)': parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']),
        'มูลค่าซื้อ(฿)': parseNumber(order['มูลค่าซื้อ(฿)'])
      });
    } else {
      const existing = uniqueShopeeOrders.get(orderId);
      existing['คอมมิชชั่นสินค้าโดยรวม(฿)'] += parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
      existing['มูลค่าซื้อ(฿)'] += parseNumber(order['มูลค่าซื้อ(฿)']);
    }
  });

  const totalComSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    const commission = typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)'] === 'number' 
      ? order['คอมมิชชั่นสินค้าโดยรวม(฿)'] 
      : parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    return sum + commission;
  }, 0);

  return {
    totalCommission: totalComSP,
    uniqueOrders: uniqueShopeeOrders,
    orderDetails: Array.from(uniqueShopeeOrders.entries()).map(([orderId, order]) => ({
      orderId,
      commission: order['คอมมิชชั่นสินค้าโดยรวม(฿)'],
      amount: order['มูลค่าซื้อ(฿)']
    }))
  };
}

// Read CSV and process
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== RAW DATA ===');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order['รหัสการสั่งซื้อ']}: ${order['คอมมิชชั่นสินค้าโดยรวม(฿)']} ฿`);
    });

    console.log('\n=== SYSTEM CALCULATION ===');
    const result = calculateCommissionLikeSystem(orders);
    
    console.log('Unique Orders:');
    result.orderDetails.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderId}: ${order.commission} ฿ (Amount: ${order.amount} ฿)`);
    });
    
    console.log(`\nTotal Commission: ${result.totalCommission} ฿`);
    console.log(`Number of unique orders: ${result.uniqueOrders.size}`);
    
    // Manual calculation for comparison
    console.log('\n=== MANUAL CALCULATION ===');
    const manualTotal = orders.reduce((sum, order) => {
      return sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    }, 0);
    console.log(`Manual total (all rows): ${manualTotal} ฿`);
    console.log(`Difference: ${manualTotal - result.totalCommission} ฿`);
  });
