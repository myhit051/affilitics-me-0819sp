// Facebook API Console Test - Simple Version
// Copy และ paste ใน browser console เพื่อทดสอบ Facebook API

console.log('🚀 Facebook API Console Tester โหลดแล้ว!');

// ฟังก์ชันทดสอบการตั้งค่า
async function testConfig() {
  console.log('🔧 ทดสอบการตั้งค่า Facebook API...');
  
  // ตรวจสอบ environment variables (ใน development mode)
  const hasConfig = window.location.hostname === 'localhost';
  
  if (hasConfig) {
    console.log('✅ กำลังรันใน development mode - สามารถตรวจสอบการตั้งค่าได้');
    console.log('📋 App ID: 1138045931679611 (configured)');
    console.log('📋 API Version: v19.0');
    console.log('📋 Redirect URI: http://localhost:8080/auth/facebook/callback');
    console.log('📋 Scopes: ads_read,ads_management');
    return true;
  } else {
    console.log('⚠️ กำลังรันใน production mode - ไม่สามารถตรวจสอบการตั้งค่าได้');
    return false;
  }
}

// ฟังก์ชันทดสอบการเชื่อมต่อ API
async function testConnection(accessToken) {
  console.log('🔗 ทดสอบการเชื่อมต่อ Facebook API...');
  
  if (!accessToken) {
    console.log('❌ ไม่พบ Access Token');
    console.log('💡 วิธีการใช้งาน: testConnection("YOUR_ACCESS_TOKEN")');
    return false;
  }
  
  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ เชื่อมต่อ Facebook API สำเร็จ');
      console.log('👤 ผู้ใช้:', data.name, '(ID:', data.id, ')');
      return data;
    } else {
      console.log('❌ ไม่สามารถเชื่อมต่อ Facebook API ได้');
      console.log('📋 ข้อผิดพลาด:', data.error?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:', error.message);
    return false;
  }
}

// ฟังก์ชันทดสอบดึงข้อมูล Ad Accounts
async function testAdAccounts(accessToken) {
  console.log('📊 ทดสอบดึงข้อมูล Ad Accounts...');
  
  if (!accessToken) {
    console.log('❌ ไม่พบ Access Token');
    return false;
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ พบ Ad Accounts จำนวน ${data.data?.length || 0} accounts`);
      
      if (data.data?.length > 0) {
        console.log('📋 รายการ Ad Accounts:');
        data.data.forEach((account, index) => {
          console.log(`  ${index + 1}. ${account.name} (${account.id}) - ${account.account_status}`);
        });
        return data.data;
      } else {
        console.log('⚠️ ไม่พบ Ad Accounts');
        return [];
      }
    } else {
      console.log('❌ ไม่สามารถดึงข้อมูล Ad Accounts ได้');
      console.log('📋 ข้อผิดพลาด:', data.error?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาดในการดึงข้อมูล Ad Accounts:', error.message);
    return false;
  }
}

// ฟังก์ชันทดสอบดึงข้อมูล Campaigns
async function testCampaigns(accessToken, accountId) {
  console.log(`🎯 ทดสอบดึงข้อมูล Campaigns จาก Account ${accountId}...`);
  
  if (!accessToken || !accountId) {
    console.log('❌ ไม่พบ Access Token หรือ Account ID');
    return false;
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id,name,status,objective,created_time&limit=5&access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ พบ Campaigns จำนวน ${data.data?.length || 0} campaigns`);
      
      if (data.data?.length > 0) {
        console.log('📋 รายการ Campaigns:');
        data.data.forEach((campaign, index) => {
          console.log(`  ${index + 1}. ${campaign.name} (${campaign.id}) - ${campaign.status}`);
        });
        return data.data;
      } else {
        console.log('⚠️ ไม่พบ Campaigns');
        return [];
      }
    } else {
      console.log('❌ ไม่สามารถดึงข้อมูล Campaigns ได้');
      console.log('📋 ข้อผิดพลาด:', data.error?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาดในการดึงข้อมูล Campaigns:', error.message);
    return false;
  }
}

// ฟังก์ชันทดสอบแบบง่าย
async function quickTest(accessToken) {
  console.log('🚀 เริ่มการทดสอบ Facebook API แบบง่าย...');
  console.log('='.repeat(50));
  
  // 1. ทดสอบการตั้งค่า
  const configOk = await testConfig();
  
  if (!accessToken) {
    console.log('\n⚠️ ไม่พบ Access Token - ข้ามการทดสอบ API');
    console.log('💡 วิธีการใช้งาน: quickTest("YOUR_ACCESS_TOKEN")');
    console.log('\n📖 วิธีการได้รับ Access Token:');
    console.log('1. ไปที่ https://developers.facebook.com/tools/explorer/');
    console.log('2. เลือก App ของคุณ');
    console.log('3. เลือก permissions: ads_read, ads_management');
    console.log('4. คลิก "Generate Access Token"');
    console.log('5. Copy token มาใช้ในการทดสอบ');
    return;
  }
  
  // 2. ทดสอบการเชื่อมต่อ
  const connectionResult = await testConnection(accessToken);
  if (!connectionResult) {
    console.log('\n❌ การทดสอบหยุดที่การเชื่อมต่อ');
    return;
  }
  
  // 3. ทดสอบ Ad Accounts
  const accounts = await testAdAccounts(accessToken);
  if (!accounts || accounts.length === 0) {
    console.log('\n❌ การทดสอบหยุดที่ Ad Accounts');
    return;
  }
  
  // 4. ทดสอบ Campaigns (ใช้ account แรก)
  const firstAccount = accounts[0];
  const campaigns = await testCampaigns(accessToken, firstAccount.id);
  
  // สรุปผลการทดสอบ
  console.log('\n📋 สรุปผลการทดสอบ:');
  console.log('='.repeat(50));
  console.log(`✅ การตั้งค่า: ${configOk ? 'ผ่าน' : 'ไม่ผ่าน'}`);
  console.log(`✅ การเชื่อมต่อ: ${connectionResult ? 'ผ่าน' : 'ไม่ผ่าน'}`);
  console.log(`✅ Ad Accounts: ${accounts ? accounts.length + ' accounts' : 'ไม่ผ่าน'}`);
  console.log(`✅ Campaigns: ${campaigns ? campaigns.length + ' campaigns' : 'ไม่ผ่าน'}`);
  
  if (connectionResult && accounts && accounts.length > 0) {
    console.log('\n🎉 การทดสอบสำเร็จ! ระบบพร้อมใช้งานกับข้อมูล Facebook จริง');
  } else {
    console.log('\n⚠️ มีการทดสอบบางส่วนที่ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าและสิทธิ์การเข้าถึง');
  }
}

// Export functions to global scope
window.testConfig = testConfig;
window.testConnection = testConnection;
window.testAdAccounts = testAdAccounts;
window.testCampaigns = testCampaigns;
window.quickTest = quickTest;

console.log('\n📖 วิธีการใช้งาน:');
console.log('1. ทดสอบแบบง่าย: quickTest("YOUR_ACCESS_TOKEN")');
console.log('2. ทดสอบแยกส่วน:');
console.log('   - testConfig()');
console.log('   - testConnection("ACCESS_TOKEN")');
console.log('   - testAdAccounts("ACCESS_TOKEN")');
console.log('   - testCampaigns("ACCESS_TOKEN", "ACCOUNT_ID")');
console.log('\n🚀 เริ่มต้นด้วย: quickTest("YOUR_ACCESS_TOKEN")');