// Facebook API Test Utility
// ทดสอบการเชื่อมต่อ Facebook API และดึงข้อมูลจริง

import { getFacebookAPIClient } from '@/lib/facebook-api-client';
import { getFacebookConfig, validateRuntimeConfig } from '@/config/facebook';
import { getFacebookDataCache } from '@/lib/facebook-data-cache';

export interface FacebookTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

export class FacebookAPITester {
  private client: any;
  private cache: any;

  constructor() {
    this.client = getFacebookAPIClient();
    this.cache = getFacebookDataCache();
  }

  // ทดสอบการตั้งค่าพื้นฐาน
  async testConfiguration(): Promise<FacebookTestResult> {
    try {
      const config = getFacebookConfig();
      const validation = validateRuntimeConfig();

      if (!validation.isValid) {
        return {
          success: false,
          message: 'การตั้งค่า Facebook API ไม่ถูกต้อง',
          error: validation.errors.join(', '),
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'การตั้งค่า Facebook API ถูกต้อง',
        data: {
          appId: config.FACEBOOK_APP_ID ? '***configured***' : 'missing',
          apiVersion: config.FACEBOOK_API_VERSION,
          scopes: config.FACEBOOK_SCOPES,
          warnings: validation.warnings
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบการตั้งค่า',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // ทดสอบการเชื่อมต่อ API (ต้องมี access token)
  async testAPIConnection(accessToken: string): Promise<FacebookTestResult> {
    try {
      if (!accessToken) {
        return {
          success: false,
          message: 'ไม่พบ Access Token',
          error: 'Access token is required for API testing',
          timestamp: new Date()
        };
      }

      // ทดสอบดึงข้อมูล user profile
      const response = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${accessToken}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: 'ไม่สามารถเชื่อมต่อ Facebook API ได้',
          error: errorData.error?.message || 'API connection failed',
          timestamp: new Date()
        };
      }

      const userData = await response.json();
      
      return {
        success: true,
        message: 'เชื่อมต่อ Facebook API สำเร็จ',
        data: {
          userId: userData.id,
          userName: userData.name,
          apiVersion: 'v19.0'
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการทดสอบ API',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // ทดสอบดึงข้อมูล Ad Accounts
  async testAdAccounts(accessToken: string): Promise<FacebookTestResult> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: 'ไม่สามารถดึงข้อมูล Ad Accounts ได้',
          error: errorData.error?.message || 'Failed to fetch ad accounts',
          timestamp: new Date()
        };
      }

      const accountsData = await response.json();
      
      return {
        success: true,
        message: `พบ Ad Accounts จำนวน ${accountsData.data?.length || 0} accounts`,
        data: {
          totalAccounts: accountsData.data?.length || 0,
          accounts: accountsData.data?.map((account: any) => ({
            id: account.id,
            name: account.name,
            status: account.account_status,
            currency: account.currency,
            timezone: account.timezone_name
          })) || []
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Ad Accounts',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // ทดสอบดึงข้อมูล Campaigns
  async testCampaigns(accessToken: string, accountId: string): Promise<FacebookTestResult> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id,name,status,objective,created_time,updated_time&limit=10&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: 'ไม่สามารถดึงข้อมูล Campaigns ได้',
          error: errorData.error?.message || 'Failed to fetch campaigns',
          timestamp: new Date()
        };
      }

      const campaignsData = await response.json();
      
      return {
        success: true,
        message: `พบ Campaigns จำนวน ${campaignsData.data?.length || 0} campaigns`,
        data: {
          accountId,
          totalCampaigns: campaignsData.data?.length || 0,
          campaigns: campaignsData.data?.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            createdTime: campaign.created_time,
            updatedTime: campaign.updated_time
          })) || []
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Campaigns',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // ทดสอบดึงข้อมูล Insights
  async testInsights(accessToken: string, campaignId: string): Promise<FacebookTestResult> {
    try {
      const dateRange = {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        until: new Date().toISOString().split('T')[0] // today
      };

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${campaignId}/insights?fields=impressions,clicks,spend,ctr,cpm,cpp&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}&access_token=${accessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: 'ไม่สามารถดึงข้อมูล Insights ได้',
          error: errorData.error?.message || 'Failed to fetch insights',
          timestamp: new Date()
        };
      }

      const insightsData = await response.json();
      
      return {
        success: true,
        message: `ดึงข้อมูล Insights สำเร็จ (${dateRange.since} - ${dateRange.until})`,
        data: {
          campaignId,
          dateRange,
          insights: insightsData.data?.[0] || null,
          hasData: insightsData.data?.length > 0
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Insights',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // รันการทดสอบทั้งหมด
  async runFullTest(accessToken?: string): Promise<FacebookTestResult[]> {
    const results: FacebookTestResult[] = [];

    // 1. ทดสอบการตั้งค่า
    console.log('🔧 ทดสอบการตั้งค่า Facebook API...');
    const configTest = await this.testConfiguration();
    results.push(configTest);

    if (!configTest.success) {
      console.error('❌ การตั้งค่าไม่ถูกต้อง:', configTest.error);
      return results;
    }

    if (!accessToken) {
      console.log('⚠️ ไม่พบ Access Token - ข้ามการทดสอบ API');
      return results;
    }

    // 2. ทดสอบการเชื่อมต่อ API
    console.log('🔗 ทดสอบการเชื่อมต่อ Facebook API...');
    const connectionTest = await this.testAPIConnection(accessToken);
    results.push(connectionTest);

    if (!connectionTest.success) {
      console.error('❌ ไม่สามารถเชื่อมต่อ API ได้:', connectionTest.error);
      return results;
    }

    // 3. ทดสอบดึงข้อมูล Ad Accounts
    console.log('📊 ทดสอบดึงข้อมูล Ad Accounts...');
    const accountsTest = await this.testAdAccounts(accessToken);
    results.push(accountsTest);

    if (!accountsTest.success || !accountsTest.data?.accounts?.length) {
      console.error('❌ ไม่พบ Ad Accounts หรือไม่สามารถดึงข้อมูลได้');
      return results;
    }

    // 4. ทดสอบดึงข้อมูล Campaigns (ใช้ account แรก)
    const firstAccount = accountsTest.data.accounts[0];
    console.log(`🎯 ทดสอบดึงข้อมูล Campaigns จาก ${firstAccount.name}...`);
    const campaignsTest = await this.testCampaigns(accessToken, firstAccount.id);
    results.push(campaignsTest);

    if (campaignsTest.success && campaignsTest.data?.campaigns?.length > 0) {
      // 5. ทดสอบดึงข้อมูล Insights (ใช้ campaign แรก)
      const firstCampaign = campaignsTest.data.campaigns[0];
      console.log(`📈 ทดสอบดึงข้อมูล Insights จาก ${firstCampaign.name}...`);
      const insightsTest = await this.testInsights(accessToken, firstCampaign.id);
      results.push(insightsTest);
    }

    return results;
  }

  // แสดงผลการทดสอบ
  displayResults(results: FacebookTestResult[]): void {
    console.log('\n📋 สรุปผลการทดสอบ Facebook API:');
    console.log('='.repeat(50));

    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.message}`);
      
      if (result.error) {
        console.log(`   ข้อผิดพลาด: ${result.error}`);
      }
      
      if (result.data && typeof result.data === 'object') {
        console.log(`   ข้อมูล:`, JSON.stringify(result.data, null, 2));
      }
      
      console.log(`   เวลา: ${result.timestamp.toLocaleString('th-TH')}`);
      console.log('');
    });

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`📊 ผลรวม: ${successCount}/${totalCount} การทดสอบสำเร็จ`);
    
    if (successCount === totalCount) {
      console.log('🎉 การทดสอบทั้งหมดสำเร็จ! ระบบพร้อมใช้งานกับข้อมูล Facebook จริง');
    } else {
      console.log('⚠️ มีการทดสอบบางส่วนที่ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าและสิทธิ์การเข้าถึง');
    }
  }
}

// สร้าง instance สำหรับใช้งาน
export const facebookTester = new FacebookAPITester();

// Helper function สำหรับทดสอบแบบง่าย
export const testFacebookAPI = async (accessToken?: string) => {
  const tester = new FacebookAPITester();
  const results = await tester.runFullTest(accessToken);
  tester.displayResults(results);
  return results;
};