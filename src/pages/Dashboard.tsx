import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StatsCard from "@/components/StatsCard";
import CampaignTable from "@/components/CampaignTable";
import DataSourceIndicator from "@/components/DataSourceIndicator";
import SubIdTable from "@/components/SubIdTable";
import TopProductsTable from "@/components/TopProductsTable";
import TopCategoryTable from "@/components/TopCategoryTable";
import TopAdsTable from "@/components/TopAdsTable";
import TopCategoryDonutChart from "@/components/TopCategoryDonutChart";
import StatsChart from "@/components/StatsChart";
import OrderChart from "@/components/OrderChart";
import ComChart from "@/components/ComChart";
import AdsChart from "@/components/AdsChart";
import DateRangeSelector from "@/components/DateRangeSelector";
import SubIdFilter from "@/components/SubIdFilter";
import PlatformFilter from "@/components/PlatformFilter";
import ChannelFilter from "@/components/ChannelFilter";
import { useImportedData } from "@/hooks/useImportedData";
import { generateTraditionalCampaigns } from "@/utils/affiliateCalculations";
import { DollarSign, TrendingUp, Target, ShoppingCart, Upload, RotateCcw, Trash2 } from "lucide-react";
import AffiliatePerformanceChart from "@/components/AffiliatePerformanceChart";

export default function Dashboard() {
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [selectedValidity, setSelectedValidity] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [originalData, setOriginalData] = useState<any>(null);
  
  const { 
    importedData, 
    calculatedMetrics, 
    dailyMetrics,
    loading: importLoading, 
    processImportedData, 
    resetToOriginalData,
    clearAllData,
    hasData, 
    rawShopeeCommission,
    uniqueShopeeOrderCount
  } = useImportedData();

  // Note: Auto-processing is now handled by the useImportedData hook itself
  // No need to manually trigger processImportedData here

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedMetadata = localStorage.getItem('affilitics-stored-metadata');
    if (storedMetadata) {
      try {
        const metadata = JSON.parse(storedMetadata);
        // Note: Actual data is not stored in localStorage due to size limits
        // This is just for showing that data was previously imported
        console.log('Found stored data metadata:', metadata);
      } catch (error) {
        console.error('Error loading stored data metadata:', error);
      }
    }
  }, []);

  const getStatValue = (key: string, defaultValue: number = 0) => {
    if (hasData && calculatedMetrics) {
      const value = calculatedMetrics[key as keyof typeof calculatedMetrics];
      return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
    }
    return defaultValue;
  };

  // Debug logging for Dashboard
  console.log('🔍 DASHBOARD DEBUG:', {
    hasData,
    hasCalculatedMetrics: !!calculatedMetrics,
    importedDataKeys: importedData ? Object.keys(importedData) : null,
    shopeeOrdersCount: importedData?.shopeeOrders?.length || 0,
    lazadaOrdersCount: importedData?.lazadaOrders?.length || 0,
    facebookAdsCount: importedData?.facebookAds?.length || 0,
    calculatedMetricsKeys: calculatedMetrics ? Object.keys(calculatedMetrics) : null,
    totalComLZD: calculatedMetrics?.totalComLZD,
    totalOrdersLZD: calculatedMetrics?.totalOrdersLZD,
    unitsLZD: calculatedMetrics?.unitsLZD
  });

  const formatCurrency = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const handleResetFilters = () => {
    setSelectedSubIds([]);
    setSelectedValidity("all");
    setSelectedPlatform("all");
    setSelectedChannels([]);
    setDateRange(undefined);
    
    if (originalData) {
      resetToOriginalData(originalData);
    }
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
      <DateRangeSelector 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {hasData && (
        <>
          <SubIdFilter
            shopeeOrders={importedData?.shopeeOrders || []}
            lazadaOrders={importedData?.lazadaOrders || []}
            selectedSubIds={selectedSubIds}
            onSubIdChange={setSelectedSubIds}
          />

          <ChannelFilter
            shopeeOrders={importedData?.shopeeOrders || []}
            selectedChannels={selectedChannels}
            onChannelChange={setSelectedChannels}
          />

          <PlatformFilter
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
          />

          <Select value={selectedValidity} onValueChange={setSelectedValidity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="🔍 Validity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Validity</SelectItem>
              <SelectItem value="valid">Valid Only</SelectItem>
              <SelectItem value="invalid">Invalid Only</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            รีเซ็ตตัวกรอง
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                ล้างข้อมูลทั้งหมด
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการล้างข้อมูลทั้งหมด</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมดที่ import และประมวลผลแล้ว? 
                  การดำเนินการนี้จะ:
                  <br />• ลบข้อมูลที่ import ทั้งหมด
                  <br />• ลบการวิเคราะห์และ metrics ทั้งหมด
                  <br />• ลบข้อมูลที่เก็บไว้ใน localStorage
                  <br />• ไม่สามารถกู้คืนได้
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    clearAllData();
                    setOriginalData(null);
                    // Redirect ไปหน้า Index หลังจากล้างข้อมูล
                    window.location.href = "/";
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  ล้างข้อมูลทั้งหมด
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );

  if (importLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-lg text-white/70">กำลังประมวลผลข้อมูล...</div>
          <div className="text-sm text-white/50">กรุณารอสักครู่</div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">🎯</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ยินดีต้อนรับสู่ Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            อัปโหลดไฟล์ CSV/XLSX จาก Shopee, Lazada และ Facebook Ads 
            เพื่อเริ่มต้นวิเคราะห์ผลการดำเนินงานและวางแผนการยิงแอดอย่างมีประสิทธิภาพ
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = "/import"} 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 border-0"
            >
              <Upload className="mr-3 h-6 w-6" />
              เริ่มต้น Import Data
            </Button>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                🛒 Shopee
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                🛍️ Lazada
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                📘 Facebook Ads
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderFilters()}

      {/* Data Source Indicator */}
      {(importedData?.dataSourceStats || importedData?.mergeResults) && (
        <DataSourceIndicator 
          dataSourceStats={importedData.dataSourceStats}
          mergeResults={importedData.mergeResults}
          conflictAnalysis={importedData.conflictAnalysis}
          mergeReport={importedData.mergeReport}
        />
      )}

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Ad Spend"
          value={formatCurrency(getStatValue('totalAdsSpent', 0))}
          change={0}
          icon={<DollarSign className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="0ms"
        />
        <StatsCard
          title="Total Com"
          value={formatCurrency(getStatValue('totalCom', 0))}
          change={0}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          colorClass="from-green-500/10 to-green-600/5"
          animationDelay="100ms"
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(getStatValue('profit', 0))}
          change={0}
          icon={<Target className="h-4 w-4 text-blue-500" />}
          colorClass="from-blue-500/10 to-blue-600/5"
          animationDelay="200ms"
        />
        <StatsCard
          title="Overall ROI"
          value={`${getStatValue('roi', 0).toFixed(1)}%`}
          change={0}
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="300ms"
        />
      </div>

      {/* Platform Specific Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Com SP"
          value={formatCurrency(rawShopeeCommission)}
          change={0}
          icon={<ShoppingCart className="h-4 w-4 text-orange-500" />}
          colorClass="from-orange-500/10 to-orange-600/5"
          animationDelay="0ms"
        />
        <StatsCard
          title="Com LZD"
          value={formatCurrency(getStatValue('totalComLZD', 0))}
          change={0}
          icon={<ShoppingCart className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="100ms"
        />
        <StatsCard
          title="Order SP"
          value={uniqueShopeeOrderCount.toLocaleString()}
          change={0}
          icon={<Target className="h-4 w-4 text-orange-500" />}
          colorClass="from-orange-500/10 to-orange-600/5"
          animationDelay="200ms"
        />
        <StatsCard
          title="Order LZD"
          value={getStatValue('totalOrdersLZD', 0).toLocaleString()}
          change={0}
          icon={<Target className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="300ms"
        />
      </div>

      {/* Charts */}
      <StatsChart 
        dailyMetrics={dailyMetrics || []}
        calculatedMetrics={calculatedMetrics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderChart 
          dailyMetrics={dailyMetrics || []}
          calculatedMetrics={calculatedMetrics}
        />
        <ComChart 
          dailyMetrics={dailyMetrics || []}
          calculatedMetrics={calculatedMetrics}
        />
      </div>

      <AdsChart 
        dailyMetrics={dailyMetrics || []}
        calculatedMetrics={calculatedMetrics}
      />

      <AffiliatePerformanceChart 
        dailyMetrics={dailyMetrics || []}
      />

      {/* 🚀 Campaign Performance */}
      <SubIdTable 
        shopeeOrders={importedData?.shopeeOrders || []}
        lazadaOrders={importedData?.lazadaOrders || []}
        facebookAds={importedData?.facebookAds || []}
        selectedSubIds={[]}
        selectedChannels={[]}
        selectedPlatform="all"
        dateRange={undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable 
          shopeeOrders={importedData?.shopeeOrders || []}
          lazadaOrders={importedData?.lazadaOrders || []}
          selectedSubIds={[]}
          selectedChannels={[]}
          selectedPlatform="all"
          dateRange={undefined}
        />

        <div className="space-y-6">
          <TopCategoryTable 
            shopeeOrders={importedData?.shopeeOrders || []}
            lazadaOrders={importedData?.lazadaOrders || []}
            selectedSubIds={[]}
            selectedChannels={[]}
            selectedPlatform="all"
            dateRange={undefined}
          />
          
          <TopCategoryDonutChart 
            shopeeOrders={importedData?.shopeeOrders || []}
            lazadaOrders={importedData?.lazadaOrders || []}
            selectedSubIds={[]}
            selectedChannels={[]}
            selectedPlatform="all"
            dateRange={undefined}
          />
        </div>
      </div>

      <TopAdsTable 
        facebookAds={importedData?.facebookAds || []}
        selectedSubIds={[]}
        selectedChannels={[]}
        selectedPlatform="all"
        dateRange={undefined}
      />

      {/* Campaign Performance Table - Moved to bottom with pagination */}
      <CampaignTable 
        campaigns={generateTraditionalCampaigns(
          importedData?.shopeeOrders || [],
          importedData?.lazadaOrders || [],
          importedData?.facebookAds || []
        )}
        facebookAds={importedData?.facebookAds || []}
        showPlatform={selectedPlatform}
      />
    </div>
  );
}