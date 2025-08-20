const fs = require('fs');

// อ่านไฟล์ CSV
const inputFile = 'test file/AffiliateCommissionReport202508201245.csv';
const outputFile = 'test file/AffiliateCommissionReport202508201245-fixed.csv';

console.log('🔧 กำลังแก้ไขไฟล์ CSV...');

// อ่านไฟล์ทั้งหมด
const content = fs.readFileSync(inputFile, 'utf8');

// แทนที่การขึ้นบรรทัดใหม่ในส่วน header ด้วยช่องว่าง
const lines = content.split('\n');
const headerLine = lines[0].replace(/\r/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

// สร้างไฟล์ใหม่
const fixedContent = headerLine + '\n' + lines.slice(1).join('\n');

// เขียนไฟล์ใหม่
fs.writeFileSync(outputFile, fixedContent, 'utf8');

console.log('✅ แก้ไขไฟล์เสร็จสิ้น:', outputFile);

// ตรวจสอบผลลัพธ์
const testContent = fs.readFileSync(outputFile, 'utf8');
const testLines = testContent.split('\n');
console.log('📊 จำนวนบรรทัด:', testLines.length);
console.log('📋 Header แรก:', testLines[0].substring(0, 100) + '...');
console.log('📋 ข้อมูลแรก:', testLines[1].substring(0, 100) + '...');
