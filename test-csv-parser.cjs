// Test the new CSV parsing function
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

// Test cases
console.log('=== TESTING NEW CSV PARSER ===');

// Test 1: Normal CSV line
const test1 = 'a,b,c,d';
console.log('Test 1 (Normal):', test1);
console.log('Result:', parseCSVLine(test1));

// Test 2: CSV with quoted field containing comma
const test2 = 'a,"b,c",d,e';
console.log('\nTest 2 (Quoted with comma):', test2);
console.log('Result:', parseCSVLine(test2));

// Test 3: CSV with escaped quotes
const test3 = 'a,"b""c",d,e';
console.log('\nTest 3 (Escaped quotes):', test3);
console.log('Result:', parseCSVLine(test3));

// Test 4: Problematic line from the actual CSV
const test4 = '2508196TWGMSH9,รอดำเนินการ,209235066253656,2025-08-18 23:51:06,,2025-08-18 20:00:13,ORANGE.Wheels,102891797,Preferred(Non-CB),22680258965,"GOODRIDE (ยาง1เส้น) ขายดี 175/65R14,185/65R14,175/65R15,185/55R15,185/60R15,185/65R15,195/55R15,195/60R15",147366905370,Normal Product,,รถยนต์ อะไหล่และอุปกรณ์เสริมรถยนต์,ชิ้นส่วนอะไหล่รถยนต์,ยางรถและอุปกรณ์เสริม,1320,2,คอมมิชชั่นจาก Shopee,,2376,,1.75%,41.58,0.00%,0,41.58,41.58,0,41.58,,0,0.00%,0,100.00%,41.58,รอดำเนินการ,สถานะของสินค้านี้คือ อยู่ระหว่างดำเนินการ คอมมิชชั่นจะถูกคำนวณเพื่อจ่ายหลังสถานะเป็นสำเร็จแล้วเท่านั้น,คำสั่งซื้อจากร้านค้าต่างกัน,ที่มีอยู่,37492180,tunis,mng,m39GOODRIDESportRS0116,,Websites';
console.log('\nTest 4 (Problematic line):');
console.log('Input length:', test4.length);
const result4 = parseCSVLine(test4);
console.log('Result length:', result4.length);
console.log('Product name field:', result4[10]); // Should be the product name
console.log('Commission field:', result4[28]); // Should be the commission
console.log('Status field:', result4[35]); // Should be the status

// Test 5: Another problematic line
const test5 = '2508184JEEDTEU,สำเร็จ,209157251206898,2025-08-18 02:14:11,2025-08-19 11:02:51,2025-08-18 02:13:30,GQ Outlet,168932539,Shopee Mall(Non-CB),13005823462,"[ลด 1,000.-] GQ Everyday Trouser กางเกงทำงานผ้า Smooth Poly ผ้าทนการใช้งา ดูแพง มี 2 ทรง Slim กับ Tailored",256329021821,Normal Product,,เสื้อผ้าผู้ชาย,กางเกงขายาว,กางเกงขายาว,590,1,คอมมิชชั่นจากร้านค้า,,395,,1.75%,6.9125,15.00%,59.25,66.1625,6.9125,59.25,66.1625,,0,0.00%,0,100.00%,66.1625,สำเร็จ,,สั่งซื้อในร้านค้าเดียวกัน,ที่มีอยู่,30444549,tunis,mng,m39gq0903,,Websites';
console.log('\nTest 5 (Another problematic line):');
console.log('Input length:', test5.length);
const result5 = parseCSVLine(test5);
console.log('Result length:', result5.length);
console.log('Product name field:', result5[10]); // Should be the product name
console.log('Commission field:', result5[28]); // Should be the commission
console.log('Status field:', result5[35]); // Should be the status

console.log('\n=== VERIFICATION ===');
console.log('If the product name field contains the full product name with commas,');
console.log('and the commission/status fields are correct, then the parser is working!');
