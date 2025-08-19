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
import { ShoppingCart, TrendingUp, Target, DollarSign, RotateCcw, Upload } from "lucide-react";

export default function LazadaAffiliate() {
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { 
    importedData, 
    calculatedMetrics, 
    hasData, 
    loading
  } = useImportedData();

  const lazadaOrders = importedData?.lazadaOrders || [];

  const getLazadaStats = () => {
    if (!hasData || !lazadaOrders.length) {
      return {
        totalCommission: 0,
        totalOrders: 0,
        totalAmount: 0,
        avgOrderValue: 0,
        topProducts: [],
        topSubIds: []
      };
    }

    const filteredOrders = lazadaOrders.filter(order => {
      // Apply filters
      if (selectedSubIds.length > 0 && !selectedSubIds.includes(order.subId)) return false;
      if (selectedChannels.length > 0 && !selectedChannels.includes(order.channel)) return false;
      if (dateRange?.from && new Date(order.date) < dateRange.from) return false;
      if (dateRange?.to && new Date(order.date) > dateRange.to) return false;
      return true;
    });

    const totalCommission = filteredOrders.reduce((sum, order) => sum + (order.commission || 0), 0);
    const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Top products
    const productStats = filteredOrders.reduce((acc, order) => {
      const product = order.productName || 'Unknown Product';
      if (!acc[product]) {
        acc[product] = { commission: 0, orders: 0, amount: 0 };
      }
      acc[product].commission += order.commission || 0;
      acc[product].amount += order.amount || 0;
      acc[product].orders += 1;
      return acc;
    }, {} as Record<string, { commission: number; orders: number; amount: number }>);

    const topProducts = Object.entries(productStats)
      .map(([product, stats]) => ({ product, ...stats }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 10);

    // Top Sub IDs
    const subIdStats = filteredOrders.reduce((acc, order) => {
      const subId = order.subId || 'Unknown';
      if (!acc[subId]) {
        acc[subId] = { commission: 0, orders: 0, amount: 0 };
      }
      acc[subId].commission += order.commission || 0;
      acc[subId].amount += order.amount || 0;
      acc[subId].orders += 1;
      return acc;
    }, {} as Record<string, { commission: number; orders: number; amount: number }>);

    const topSubIds = Object.entries(subIdStats)
      .map(([subId, stats]) => ({ subId, ...stats }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 10);

    return {
      totalCommission,
      totalOrders,
      totalAmount,
      avgOrderValue,
      topProducts,
      topSubIds
    };
  };

  const stats = getLazadaStats();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <div className="text-lg">กำลังโหลดข้อมูล Lazada...</div>
        </div>
      </div>
    );
  }

  if (!hasData || !lazadaOrders.length) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">🛍️</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Lazada Affiliate Analytics
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            อัปโหลดไฟล์ข้อมูล Lazada Affiliate เพื่อเริ่มวิเคราะห์ผลการดำเนินงาน
            และติดตามประสิทธิภาพของแต่ละ campaign
          </p>
          <Button 
            onClick={() => window.location.href = "/import"} 
            size="lg" 
            className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 border-0"
          >
            <Upload className="mr-3 h-6 w-6" />
            Import Lazada Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Lazada Affiliate
          </h1>
          <p className="text-muted-foreground">วิเคราะห์ผลการดำเนินงาน Lazada Affiliate</p>
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
          lazadaOrders={lazadaOrders}
          selectedSubIds={selectedSubIds}
          onSubIdChange={setSelectedSubIds}
        />

        <ChannelFilter
          shopeeOrders={lazadaOrders}
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
          title="Total Commission"
          value={formatCurrency(stats.totalCommission)}
          change={0}
          icon={<DollarSign className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="0ms"
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(stats.totalAmount)}
          change={0}
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="100ms"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={0}
          icon={<Target className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="200ms"
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          change={0}
          icon={<ShoppingCart className="h-4 w-4 text-purple-500" />}
          colorClass="from-purple-500/10 to-purple-600/5"
          animationDelay="300ms"
        />
      </div>

      {/* Top Products & Sub IDs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-500" />
              Top Products
            </CardTitle>
            <CardDescription>สินค้าที่ทำรายได้สูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{product.product}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.orders} orders • ฿{formatCurrency(product.amount)} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      ฿{formatCurrency(product.commission)}
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
              <Target className="h-5 w-5 text-purple-500" />
              Top Sub IDs
            </CardTitle>
            <CardDescription>Sub ID ที่ทำรายได้สูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSubIds.map((subId, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{subId.subId}</div>
                    <div className="text-xs text-muted-foreground">
                      {subId.orders} orders • ฿{formatCurrency(subId.amount)} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      ฿{formatCurrency(subId.commission)}
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