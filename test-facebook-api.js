// Facebook API Test Script
// รันสคริปต์นี้ใน browser console เพื่อทดสอบ Facebook API

console.log('🚀 เริ่มทดสอบ Facebook API...');

// ตัวแปรสำหรับเก็บผลการทดสอบ
window.facebookTestResults = [];

// ฟังก์ชันทดสอบการตั้งค่า
async function testFacebookConfig() {
  console.log('🔧 ทดสอบการตั้งค่า Facebook API...');
  
  try {
    // ตรวจสอบ environment variables
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const apiVersion = import.meta.env.VITE_FACEBOOK_API_VERSION;
    const redirectUri = import.meta.env.VITE_FACEBOOK_REDIRECT_URI;
    const scopes = import.meta.env.VITE_FACEBOOK_SCOPES;
    
    const result = {
      test: 'Configuration',
      success: !!(appId && apiVersion && redirectUri && scopes),
      data: {
        hasAppId: !!appId,
        apiVersion: apiVersion || 'not set',
        redirectUri: redirectUri || 'not set',
        scopes: scopes || 'not set'
      },
      timestamp: new Date().toISOString()
    };
    
    window.facebookTestResults.push(result);
    
    if (result.success) {
      console.log('✅ การตั้งค่า Facebook API ถูกต้อง');
      console.log('📋 รายละเอียด:', result.data);
    } else {
      console.log('❌ การตั้งค่า Facebook API ไม่ครบถ้วน');
      console.log('📋 รายละเอียด:', result.data);
    }
    
    return result;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบการตั้งค่า:', error);
    return {
      test: 'Configuration',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ฟังก์ชันทดสอบการเชื่อมต่อ API
async function testFacebookConnection(accessToken) {
  console.log('🔗 ทดสอบการเชื่อมต่อ Facebook API...');
  
  if (!accessToken) {
    console.log('⚠️ ไม่พบ Access Token - ข้ามการทดสอบการเชื่อมต่อ');
    return {
      test: 'Connection',
      success: false,
      error: 'No access token provided',
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
    const data = await response.json();
    
    if (response.ok) {
      const result = {
        test: 'Connection',
        success: true,
        data: {
          userId: data.id,
          userName: data.name
        },
        timestamp: new Date().toISOString()
      };
      
      window.facebookTestResults.push(result);
      console.log('✅ เชื่อมต่อ Facebook API สำเร็จ');
      console.log('👤 ผู้ใช้:', data.name, '(ID:', data.id, ')');
      return result;
    } else {
      throw new Error(data.error?.message || 'API connection failed');
    }
  } catch (error) {
    console.error('❌ ไม่สามารถเชื่อมต่อ Facebook API ได้:', error);
    return {
      test: 'Connection',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ฟังก์ชันทดสอบดึงข้อมูล Ad Accounts
async function testFacebookAdAccounts(accessToken) {
  console.log('📊 ทดสอบดึงข้อมูล Ad Accounts...');
  
  if (!accessToken) {
    console.log('⚠️ ไม่พบ Access Token - ข้ามการทดสอบ Ad Accounts');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (response.ok) {
      const result = {
        test: 'Ad Accounts',
        success: true,
        data: {
          totalAccounts: data.data?.length || 0,
          accounts: data.data?.map(account => ({
            id: account.id,
            name: account.name,
            status: account.account_status,
            currency: account.currency,
            timezone: account.timezone_name
          })) || []
        },
        timestamp: new Date().toISOString()
      };
      
      window.facebookTestResults.push(result);
      console.log(`✅ พบ Ad Accounts จำนวน ${result.data.totalAccounts} accounts`);
      
      if (result.data.accounts.length > 0) {
        console.log('📋 รายการ Ad Accounts:');
        result.data.accounts.forEach((account, index) => {
          console.log(`  ${index + 1}. ${account.name} (${account.id}) - ${account.status}`);
        });
      }
      
      return result;
    } else {
      throw new Error(data.error?.message || 'Failed to fetch ad accounts');
    }
  } catch (error) {
    console.error('❌ ไม่สามารถดึงข้อมูล Ad Accounts ได้:', error);
    return {
      test: 'Ad Accounts',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ฟังก์ชันทดสอบดึงข้อมูล Campaigns
async function testFacebookCampaigns(accessToken, accountId) {
  console.log(`🎯 ทดสอบดึงข้อมูล Campaigns จาก Account ${accountId}...`);
  
  if (!accessToken || !accountId) {
    console.log('⚠️ ไม่พบ Access Token หรือ Account ID - ข้ามการทดสอบ Campaigns');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id,name,status,objective,created_time,updated_time&limit=5&access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (response.ok) {
      const result = {
        test: 'Campaigns',
        success: true,
        data: {
          accountId: accountId,
          totalCampaigns: data.data?.length || 0,
          campaigns: data.data?.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            createdTime: campaign.created_time,
            updatedTime: campaign.updated_time
          })) || []
        },
        timestamp: new Date().toISOString()
      };
      
      window.facebookTestResults.push(result);
      console.log(`✅ พบ Campaigns จำนวน ${result.data.totalCampaigns} campaigns`);
      
      if (result.data.campaigns.length > 0) {
        console.log('📋 รายการ Campaigns:');
        result.data.campaigns.forEach((campaign, index) => {
          console.log(`  ${index + 1}. ${campaign.name} (${campaign.id}) - ${campaign.status}`);
        });
      }
      
      return result;
    } else {
      throw new Error(data.error?.message || 'Failed to fetch campaigns');
    }
  } catch (error) {
    console.error('❌ ไม่สามารถดึงข้อมูล Campaigns ได้:', error);
    return {
      test: 'Campaigns',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ฟังก์ชันทดสอบดึงข้อมูล Insights
async function testFacebookInsights(accessToken, campaignId) {
  console.log(`📈 ทดสอบดึงข้อมูล Insights จาก Campaign ${campaignId}...`);
  
  if (!accessToken || !campaignId) {
    console.log('⚠️ ไม่พบ Access Token หรือ Campaign ID - ข้ามการทดสอบ Insights');
    return null;
  }
  
  try {
    const dateRange = {
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      until: new Date().toISOString().split('T')[0] // today
    };
    
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${campaignId}/insights?fields=impressions,clicks,spend,ctr,cpm,cpp&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}&access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (response.ok) {
      const result = {
        test: 'Insights',
        success: true,
        data: {
          campaignId: campaignId,
          dateRange: dateRange,
          insights: data.data?.[0] || null,
          hasData: data.data?.length > 0
        },
        timestamp: new Date().toISOString()
      };
      
      window.facebookTestResults.push(result);
      console.log(`✅ ดึงข้อมูล Insights สำเร็จ (${dateRange.since} - ${dateRange.until})`);
      
      if (result.data.insights) {
        console.log('📊 ข้อมูลสถิติ:');
        const insights = result.data.insights;
        console.log(`  - Impressions: ${insights.impressions || 'N/A'}`);
        console.log(`  - Clicks: ${insights.clicks || 'N/A'}`);
        console.log(`  - Spend: ${insights.spend || 'N/A'}`);
        console.log(`  - CTR: ${insights.ctr || 'N/A'}%`);
        console.log(`  - CPM: ${insights.cpm || 'N/A'}`);
      } else {
        console.log('📊 ไม่มีข้อมูลสถิติในช่วงเวลาที่เลือก');
      }
      
      return result;
    } else {
      throw new Error(data.error?.message || 'Failed to fetch insights');
    }
  } catch (error) {
    console.error('❌ ไม่สามารถดึงข้อมูล Insights ได้:', error);
    return {
      test: 'Insights',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ฟังก์ชันรันการทดสอบทั้งหมด
async function runFullFacebookTest(accessToken) {
  console.log('🚀 เริ่มการทดสอบ Facebook API แบบเต็มรูปแบบ...');
  console.log('='.repeat(60));
  
  // ล้างผลการทดสอบเก่า
  window.facebookTestResults = [];
  
  // 1. ทดสอบการตั้งค่า
  const configResult = await testFacebookConfig();
  
  if (!configResult.success) {
    console.log('❌ การตั้งค่าไม่ถูกต้อง - หยุดการทดสอบ');
    return window.facebookTestResults;
  }
  
  if (!accessToken) {
    console.log('⚠️ ไม่พบ Access Token - ข้ามการทดสอบ API');
    console.log('💡 วิธีการใช้งาน:');
    console.log('   1. เข้าสู่ระบบ Facebook ผ่าน UI');
    console.log('   2. หรือรัน: runFullFacebookTest("YOUR_ACCESS_TOKEN")');
    return window.facebookTestResults;
  }
  
  // 2. ทดสอบการเชื่อมต่อ
  const connectionResult = await testFacebookConnection(accessToken);
  
  if (!connectionResult.success) {
    console.log('❌ ไม่สามารถเชื่อมต่อ API ได้ - หยุดการทดสอบ');
    return window.facebookTestResults;
  }
  
  // 3. ทดสอบ Ad Accounts
  const accountsResult = await testFacebookAdAccounts(accessToken);
  
  if (!accountsResult?.success || !accountsResult.data?.accounts?.length) {
    console.log('❌ ไม่พบ Ad Accounts - หยุดการทดสอบ');
    return window.facebookTestResults;
  }
  
  // 4. ทดสอบ Campaigns (ใช้ account แรก)
  const firstAccount = accountsResult.data.accounts[0];
  const campaignsResult = await testFacebookCampaigns(accessToken, firstAccount.id);
  
  if (campaignsResult?.success && campaignsResult.data?.campaigns?.length > 0) {
    // 5. ทดสอบ Insights (ใช้ campaign แรก)
    const firstCampaign = campaignsResult.data.campaigns[0];
    await testFacebookInsights(accessToken, firstCampaign.id);
  }
  
  // แสดงสรุปผลการทดสอบ
  console.log('\n📋 สรุปผลการทดสอบ Facebook API:');
  console.log('='.repeat(60));
  
  const successCount = window.facebookTestResults.filter(r => r.success).length;
  const totalCount = window.facebookTestResults.length;
  
  window.facebookTestResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.test}`);
    if (result.error) {
      console.log(`   ข้อผิดพลาด: ${result.error}`);
    }
  });
  
  console.log(`\n📊 ผลรวม: ${successCount}/${totalCount} การทดสอบสำเร็จ`);
  
  if (successCount === totalCount) {
    console.log('🎉 การทดสอบทั้งหมดสำเร็จ! ระบบพร้อมใช้งานกับข้อมูล Facebook จริง');
  } else {
    console.log('⚠️ มีการทดสอบบางส่วนที่ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าและสิทธิ์การเข้าถึง');
  }
  
  console.log('\n💾 ผลการทดสอบถูกเก็บไว้ใน window.facebookTestResults');
  
  return window.facebookTestResults;
}

// Export functions to global scope
window.testFacebookConfig = testFacebookConfig;
window.testFacebookConnection = testFacebookConnection;
window.testFacebookAdAccounts = testFacebookAdAccounts;
window.testFacebookCampaigns = testFacebookCampaigns;
window.testFacebookInsights = testFacebookInsights;
window.runFullFacebookTest = runFullFacebookTest;

console.log('✅ Facebook API Test Script โหลดเสร็จแล้ว!');
console.log('');
console.log('📖 วิธีการใช้งาน:');
console.log('1. รันการทดสอบทั้งหมด: runFullFacebookTest()');
console.log('2. รันการทดสอบทั้งหมดพร้อม token: runFullFacebookTest("YOUR_ACCESS_TOKEN")');
console.log('3. ทดสอบแยกส่วน:');
console.log('   - testFacebookConfig()');
console.log('   - testFacebookConnection("ACCESS_TOKEN")');
console.log('   - testFacebookAdAccounts("ACCESS_TOKEN")');
console.log('   - testFacebookCampaigns("ACCESS_TOKEN", "ACCOUNT_ID")');
console.log('   - testFacebookInsights("ACCESS_TOKEN", "CAMPAIGN_ID")');
console.log('');
console.log('🚀 เริ่มต้นด้วย: runFullFacebookTest()');