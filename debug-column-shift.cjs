const fs = require('fs');
const csv = require('csv-parser');

// Test CSV reading with column analysis
const orders = [];
fs.createReadStream('test file/10or.csv')
  .pipe(csv())
  .on('data', (row) => {
    orders.push(row);
  })
  .on('end', () => {
    console.log('=== TESTING COLUMN SHIFT ISSUE ===');
    console.log(`Total orders: ${orders.length}`);
    
    // Check specific problematic orders
    console.log('\n=== CHECKING PROBLEMATIC ORDERS ===');
    
    // Order 2508184JEEDTEU
    const order1 = orders.find(o => o['รหัสการสั่งซื้อ'] === '2508184JEEDTEU');
    if (order1) {
      console.log('\n📋 Order 2508184JEEDTEU:');
      console.log('  Sub_id1:', order1['Sub_id1']);
      console.log('  Sub_id2:', order1['Sub_id2']);
      console.log('  Sub_id3:', order1['Sub_id3']);
      console.log('  Sub_id4:', order1['Sub_id4']);
      console.log('  Sub_id5:', order1['Sub_id5']);
      console.log('  สถานะของผู้ซื้อ:', order1['สถานะของผู้ซื้อ']);
      console.log('  ช่องทาง:', order1['ช่องทาง']);
    }
    
    // Order 2508196TWGMSH9
    const order2 = orders.find(o => o['รหัสการสั่งซื้อ'] === '2508196TWGMSH9');
    if (order2) {
      console.log('\n📋 Order 2508196TWGMSH9:');
      console.log('  Sub_id1:', order2['Sub_id1']);
      console.log('  Sub_id2:', order2['Sub_id2']);
      console.log('  Sub_id3:', order2['Sub_id3']);
      console.log('  Sub_id4:', order2['Sub_id4']);
      console.log('  Sub_id5:', order2['Sub_id5']);
      console.log('  ค่าบริการ MCN(฿):', order2['ค่าบริการ MCN(฿)']);
      console.log('  ช่องทาง:', order2['ช่องทาง']);
    }
    
    // Check all orders for column shift patterns
    console.log('\n=== CHECKING ALL ORDERS FOR COLUMN SHIFT ===');
    orders.forEach((order, index) => {
      const orderId = order['รหัสการสั่งซื้อ'];
      const subId1 = order['Sub_id1'];
      const subId2 = order['Sub_id2'];
      const subId3 = order['Sub_id3'];
      const subId4 = order['Sub_id4'];
      const subId5 = order['Sub_id5'];
      const channel = order['ช่องทาง'];
      
      // Check if Sub_id1 contains unexpected values
      if (subId1 && (subId1 === 'ที่มีอยู่' || subId1 === '0' || subId1 === 'Websites' || subId1 === 'Facebook')) {
        console.log(`⚠️  Order ${index + 1} (${orderId}): Sub_id1 contains unexpected value: "${subId1}"`);
        console.log(`    Sub_id2: "${subId2}"`);
        console.log(`    Sub_id3: "${subId3}"`);
        console.log(`    Sub_id4: "${subId4}"`);
        console.log(`    Sub_id5: "${subId5}"`);
        console.log(`    Channel: "${channel}"`);
      }
    });
    
    // Check raw CSV data for potential parsing issues
    console.log('\n=== CHECKING RAW CSV DATA ===');
    const rawData = fs.readFileSync('test file/10or.csv', 'utf8');
    const lines = rawData.split('\n');
    
    console.log('Header line:', lines[0]);
    console.log('Number of columns in header:', lines[0].split(',').length);
    
    // Check specific problematic lines
    const problematicLines = lines.filter(line => 
      line.includes('2508184JEEDTEU') || line.includes('2508196TWGMSH9')
    );
    
    problematicLines.forEach((line, index) => {
      console.log(`\nProblematic line ${index + 1}:`);
      console.log('Raw line:', line);
      console.log('Number of commas:', (line.match(/,/g) || []).length);
      console.log('Split by comma:', line.split(','));
    });
    
    // Check if there are extra commas or missing commas
    console.log('\n=== CHECKING FOR CSV PARSING ISSUES ===');
    lines.forEach((line, lineIndex) => {
      if (lineIndex === 0) return; // Skip header
      
      const commaCount = (line.match(/,/g) || []).length;
      const expectedCommaCount = (lines[0].match(/,/g) || []).length;
      
      if (commaCount !== expectedCommaCount) {
        console.log(`⚠️  Line ${lineIndex + 1}: Expected ${expectedCommaCount} commas, found ${commaCount}`);
        console.log(`    Line: ${line.substring(0, 100)}...`);
      }
    });
  });
