import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import DateRangeSelector from "@/components/DateRangeSelector";
import SubIdFilter from "@/components/SubIdFilter";
import ChannelFilter from "@/components/ChannelFilter";
import { useImportedData } from "@/hooks/useImportedData";
import { Facebook, TrendingUp, Target, DollarSign, RotateCcw, Upload, Eye, MousePointer } from "lucide-react";

export default function FacebookAdsFile() {
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { 
    importedData, 
    calculatedMetrics, 
    hasData, 
    loading
  } = useImportedData();

  const facebookAds = importedData?.facebookAds || [];

  const getFacebookStats = () => {
    if (!hasData || !facebookAds.length) {
      return {
        totalSpent: 0,
        totalImpressions: 0,
        totalClicks: 0,
        avgCPC: 0,
        avgCPM: 0,
        avgCTR: 0,
        topCampaigns: [],
        topAdSets: []
      };
    }

    const filteredAds = facebookAds.filter(ad => {
      // Apply filters
      if (selectedSubIds.length > 0 && !selectedSubIds.includes(ad.subId)) return false;
      if (selectedChannels.length > 0 && !selectedChannels.includes(ad.channel)) return false;
      if (dateRange?.from && new Date(ad.date) < dateRange.from) return false;
      if (dateRange?.to && new Date(ad.date) > dateRange.to) return false;
      return true;
    });

    const totalSpent = filteredAds.reduce((sum, ad) => sum + (ad.spent || 0), 0);
    const totalImpressions = filteredAds.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const totalClicks = filteredAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    
    const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Top campaigns
    const campaignStats = filteredAds.reduce((acc, ad) => {
      const campaign = ad.campaignName || 'Unknown Campaign';
      if (!acc[campaign]) {
        acc[campaign] = { spent: 0, impressions: 0, clicks: 0 };
      }
      acc[campaign].spent += ad.spent || 0;
      acc[campaign].impressions += ad.impressions || 0;
      acc[campaign].clicks += ad.clicks || 0;
      return acc;
    }, {} as Record<string, { spent: number; impressions: number; clicks: number }>);

    const topCampaigns = Object.entries(campaignStats)
      .map(([campaign, stats]) => ({ 
        campaign, 
        ...stats,
        cpc: stats.clicks > 0 ? stats.spent / stats.clicks : 0,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);

    // Top Ad Sets
    const adSetStats = filteredAds.reduce((acc, ad) => {
      const adSet = ad.adSetName || 'Unknown Ad Set';
      if (!acc[adSet]) {
        acc[adSet] = { spent: 0, impressions: 0, clicks: 0 };
      }
      acc[adSet].spent += ad.spent || 0;
      acc[adSet].impressions += ad.impressions || 0;
      acc[adSet].clicks += ad.clicks || 0;
      return acc;
    }, {} as Record<string, { spent: number; impressions: number; clicks: number }>);

    const topAdSets = Object.entries(adSetStats)
      .map(([adSet, stats]) => ({ 
        adSet, 
        ...stats,
        cpc: stats.clicks > 0 ? stats.spent / stats.clicks : 0,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);

    return {
      totalSpent,
      totalImpressions,
      totalClicks,
      avgCPC,
      avgCPM,
      avgCTR,
      topCampaigns,
      topAdSets
    };
  };

  const stats = getFacebookStats();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US');
  };

  const handleResetFilters = () => {
    setSelectedSubIds([]);
    setSelectedChannels([]);
    setDateRange(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-lg">กำลังโหลดข้อมูล Facebook Ads...</div>
        </div>
      </div>
    );
  }

  if (!hasData || !facebookAds.length) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">📘</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Facebook Ads (File) Analytics
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            อัปโหลดไฟล์ข้อมูล Facebook Ads เพื่อเริ่มวิเคราะห์ผลการดำเนินงาน
            และติดตามประสิทธิภาพของแต่ละ campaign
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = "/import"} 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 border-0"
            >
              <Upload className="mr-3 h-6 w-6" />
              Import Facebook Ads Data
            </Button>
            <div className="text-sm text-muted-foreground">
              หรือใช้ <Button variant="link" onClick={() => window.location.href = "/facebook-live"} className="p-0 h-auto">Facebook Ads (Live)</Button> สำหรับข้อมูล Real-time
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Facebook className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Facebook Ads (File)
          </h1>
          <p className="text-muted-foreground">วิเคราะห์ข้อมูล Facebook Ads จากไฟล์ที่อัปโหลด</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
        <DateRangeSelector 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <SubIdFilter
          shopeeOrders={[]}
          lazadaOrders={[]}
          selectedSubIds={selectedSubIds}
          onSubIdChange={setSelectedSubIds}
        />

        <ChannelFilter
          shopeeOrders={facebookAds}
          selectedChannels={selectedChannels}
          onChannelChange={setSelectedChannels}
        />

        <Button 
          variant="outline" 
          onClick={handleResetFilters}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          รีเซ็ตตัวกรอง
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Spent"
          value={`$${formatCurrency(stats.totalSpent)}`}
          change={0}
          icon={<DollarSign className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="0ms"
        />
        <StatsCard
          title="Total Impressions"
          value={formatNumber(stats.totalImpressions)}
          change={0}
          icon={<Eye className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="100ms"
        />
        <StatsCard
          title="Total Clicks"
          value={formatNumber(stats.totalClicks)}
          change={0}
          icon={<MousePointer className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="200ms"
        />
        <StatsCard
          title="Avg CPC"
          value={`$${formatCurrency(stats.avgCPC)}`}
          change={0}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="300ms"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatsCard
          title="Avg CPM"
          value={`$${formatCurrency(stats.avgCPM)}`}
          change={0}
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="0ms"
        />
        <StatsCard
          title="Avg CTR"
          value={`${stats.avgCTR.toFixed(2)}%`}
          change={0}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="100ms"
        />
      </div>

      {/* Top Campaigns & Ad Sets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-500" />
              Top Campaigns
            </CardTitle>
            <CardDescription>Campaign ที่ใช้งบประมาณสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{campaign.campaign}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(campaign.clicks)} clicks • CTR {campaign.ctr.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      ${formatCurrency(campaign.spent)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      CPC ${formatCurrency(campaign.cpc)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Top Ad Sets
            </CardTitle>
            <CardDescription>Ad Set ที่ใช้งบประมาณสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topAdSets.map((adSet, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{adSet.adSet}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(adSet.clicks)} clicks • CTR {adSet.ctr.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      ${formatCurrency(adSet.spent)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      CPC ${formatCurrency(adSet.cpc)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}