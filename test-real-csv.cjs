const fs = require('fs');

// Copy the parseCSVLine function
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      // Regular character
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Test with the real CSV file
console.log('=== TESTING WITH REAL CSV FILE ===');

const csvContent = fs.readFileSync('test file/10or.csv', 'utf8');
const lines = csvContent.split('\n');

console.log(`Total lines: ${lines.length}`);

// Parse header
const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
console.log(`Header columns: ${headers.length}`);

// Test problematic orders
const problematicOrders = [
  '2508196TWGMSH9',
  '2508184JEEDTEU'
];

problematicOrders.forEach(orderId => {
  console.log(`\n=== TESTING ORDER ${orderId} ===`);
  
  const orderLine = lines.find(line => line.includes(orderId));
  if (orderLine) {
    const values = parseCSVLine(orderLine);
    console.log(`Values length: ${values.length}`);
    
    // Find the commission and status columns
    const commissionIndex = headers.findIndex(h => h === 'คอมมิชชั่นสินค้าโดยรวม(฿)');
    const statusIndex = headers.findIndex(h => h === 'สถานะสินค้า Affiliate');
    const subId1Index = headers.findIndex(h => h === 'Sub_id1');
    const channelIndex = headers.findIndex(h => h === 'ช่องทาง');
    
    console.log(`Commission index: ${commissionIndex}`);
    console.log(`Status index: ${statusIndex}`);
    console.log(`Sub_id1 index: ${subId1Index}`);
    console.log(`Channel index: ${channelIndex}`);
    
    if (commissionIndex !== -1) {
      console.log(`Commission value: "${values[commissionIndex]}"`);
    }
    if (statusIndex !== -1) {
      console.log(`Status value: "${values[statusIndex]}"`);
    }
    if (subId1Index !== -1) {
      console.log(`Sub_id1 value: "${values[subId1Index]}"`);
    }
    if (channelIndex !== -1) {
      console.log(`Channel value: "${values[channelIndex]}"`);
    }
    
    // Check if the values are correct
    if (orderId === '2508196TWGMSH9') {
      const expectedCommission = '41.58';
      const expectedStatus = 'รอดำเนินการ';
      const expectedSubId1 = '37492180';
      const expectedChannel = 'Websites';
      
      console.log('\nVerification:');
      console.log(`Commission: ${values[commissionIndex] === expectedCommission ? '✅' : '❌'} (expected: ${expectedCommission})`);
      console.log(`Status: ${values[statusIndex] === expectedStatus ? '✅' : '❌'} (expected: ${expectedStatus})`);
      console.log(`Sub_id1: ${values[subId1Index] === expectedSubId1 ? '✅' : '❌'} (expected: ${expectedSubId1})`);
      console.log(`Channel: ${values[channelIndex] === expectedChannel ? '✅' : '❌'} (expected: ${expectedChannel})`);
    }
    
    if (orderId === '2508184JEEDTEU') {
      const expectedCommission = '66.1625';
      const expectedStatus = 'สำเร็จ';
      const expectedSubId1 = '30444549';
      const expectedChannel = 'Websites';
      
      console.log('\nVerification:');
      console.log(`Commission: ${values[commissionIndex] === expectedCommission ? '✅' : '❌'} (expected: ${expectedCommission})`);
      console.log(`Status: ${values[statusIndex] === expectedStatus ? '✅' : '❌'} (expected: ${expectedStatus})`);
      console.log(`Sub_id1: ${values[subId1Index] === expectedSubId1 ? '✅' : '❌'} (expected: ${expectedSubId1})`);
      console.log(`Channel: ${values[channelIndex] === expectedChannel ? '✅' : '❌'} (expected: ${expectedChannel})`);
    }
  } else {
    console.log(`Order ${orderId} not found`);
  }
});

// Calculate total commission
console.log('\n=== CALCULATING TOTAL COMMISSION ===');
let totalCommission = 0;
let orderCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = parseCSVLine(line);
  const commissionIndex = headers.findIndex(h => h === 'คอมมิชชั่นสินค้าโดยรวม(฿)');
  
  if (commissionIndex !== -1 && values[commissionIndex]) {
    const commission = parseFloat(values[commissionIndex]) || 0;
    totalCommission += commission;
    orderCount++;
  }
}

console.log(`Total orders: ${orderCount}`);
console.log(`Total commission: ${totalCommission} ฿`);
console.log(`Expected total: 156.475 ฿`);
console.log(`Match: ${Math.abs(totalCommission - 156.475) < 0.01 ? '✅' : '❌'}`);
