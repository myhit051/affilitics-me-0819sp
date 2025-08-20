const fs = require('fs');

// Read the original CSV file
const originalData = fs.readFileSync('test file/10or.csv', 'utf8');
const lines = originalData.split('\n');

console.log('=== FIXING CSV FILE ===');
console.log(`Total lines: ${lines.length}`);

// Fix the problematic lines
const fixedLines = lines.map((line, index) => {
  if (index === 0) return line; // Keep header as is
  
  // Fix line 9 (2508196TWGMSH9)
  if (line.includes('2508196TWGMSH9')) {
    console.log('🔧 Fixing line 9 (2508196TWGMSH9)...');
    // The issue is with the product name containing commas
    // We need to properly quote the product name
    const parts = line.split(',');
    const productNameStart = parts.findIndex(part => part.includes('GOODRIDE'));
    if (productNameStart !== -1) {
      // Find where the product name ends
      let productNameEnd = productNameStart;
      for (let i = productNameStart; i < parts.length; i++) {
        if (parts[i].includes('147366905370')) {
          productNameEnd = i - 1;
          break;
        }
      }
      
      // Reconstruct the line with proper quoting
      const beforeProduct = parts.slice(0, productNameStart);
      const productName = parts.slice(productNameStart, productNameEnd + 1).join(',');
      const afterProduct = parts.slice(productNameEnd + 1);
      
      const fixedLine = [
        ...beforeProduct,
        `"${productName}"`,
        ...afterProduct
      ].join(',');
      
      console.log('  Fixed line:', fixedLine.substring(0, 100) + '...');
      return fixedLine;
    }
  }
  
  // Fix line 14 (2508184JEEDTEU)
  if (line.includes('2508184JEEDTEU')) {
    console.log('🔧 Fixing line 14 (2508184JEEDTEU)...');
    // The issue is with the product name containing comma
    const parts = line.split(',');
    const productNameStart = parts.findIndex(part => part.includes('[ลด 1'));
    if (productNameStart !== -1) {
      // Find where the product name ends
      let productNameEnd = productNameStart;
      for (let i = productNameStart; i < parts.length; i++) {
        if (parts[i].includes('256329021821')) {
          productNameEnd = i - 1;
          break;
        }
      }
      
      // Reconstruct the line with proper quoting
      const beforeProduct = parts.slice(0, productNameStart);
      const productName = parts.slice(productNameStart, productNameEnd + 1).join(',');
      const afterProduct = parts.slice(productNameEnd + 1);
      
      const fixedLine = [
        ...beforeProduct,
        `"${productName}"`,
        ...afterProduct
      ].join(',');
      
      console.log('  Fixed line:', fixedLine.substring(0, 100) + '...');
      return fixedLine;
    }
  }
  
  return line;
});

// Write the fixed CSV file
const fixedData = fixedLines.join('\n');
fs.writeFileSync('test file/10or-fixed.csv', fixedData, 'utf8');

console.log('\n✅ Fixed CSV file saved as: test file/10or-fixed.csv');

// Verify the fix
console.log('\n=== VERIFYING FIX ===');
const fixedLinesArray = fixedData.split('\n');
console.log('Header columns:', fixedLinesArray[0].split(',').length);

// Check problematic lines
const problematicLines = fixedLinesArray.filter(line => 
  line.includes('2508184JEEDTEU') || line.includes('2508196TWGMSH9')
);

problematicLines.forEach((line, index) => {
  const commaCount = (line.match(/,/g) || []).length;
  const expectedCommaCount = (fixedLinesArray[0].match(/,/g) || []).length;
  console.log(`Line ${index + 1}: ${commaCount} commas (expected: ${expectedCommaCount})`);
  
  if (commaCount === expectedCommaCount) {
    console.log('  ✅ Fixed!');
  } else {
    console.log('  ❌ Still has issues');
  }
});
