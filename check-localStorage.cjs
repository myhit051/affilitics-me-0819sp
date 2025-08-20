const fs = require('fs');

console.log('=== CHECKING LOCALSTORAGE DATA ===');
console.log('Note: localStorage is browser-specific, so we cannot directly access it from Node.js');
console.log('However, we can check if there are any stored data files or configurations');

// Check if there are any data files in the project
console.log('\n=== CHECKING FOR DATA FILES ===');
const dataFiles = [];
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    if (file.includes('data') || file.includes('cache') || file.includes('store')) {
      dataFiles.push(file);
    }
  });
} catch (error) {
  console.log('Error reading directory:', error.message);
}

if (dataFiles.length > 0) {
  console.log('Found potential data files:');
  dataFiles.forEach(file => console.log(`- ${file}`));
} else {
  console.log('No data files found');
}

console.log('\n=== SOLUTION ===');
console.log('The issue is likely that the system has stored calculatedMetrics with filtered data.');
console.log('To fix this:');
console.log('1. Open browser developer tools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Find localStorage for your domain');
console.log('4. Look for keys like:');
console.log('   - affiliateMetrics');
console.log('   - affiliateData');
console.log('   - calculatedMetrics');
console.log('5. Delete these keys or clear all localStorage');
console.log('6. Refresh the page');
console.log('7. Re-import your data');

console.log('\n=== ALTERNATIVE SOLUTION ===');
console.log('If you cannot access localStorage, try:');
console.log('1. Open browser in incognito/private mode');
console.log('2. Import your data again');
console.log('3. This will start with a clean slate');
