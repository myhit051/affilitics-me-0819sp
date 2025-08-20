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

  // Debug logging
  console.log('🔍 LAZADA AFFILIATE DEBUG:', {
    hasData,
    lazadaOrdersLength: lazadaOrders.length,
    importedDataKeys: importedData ? Object.keys(importedData) : null,
    sampleLazadaOrder: lazadaOrders.length > 0 ? lazadaOrders[0] : null
  });

  // Parse numbers safely
  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

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
      // Filter out invalid orders
      if (order['Validity'] === 'invalid') return false;
      
      // Apply filters
      if (selectedSubIds.length > 0) {
        const orderSubIds = [
          order['Aff Sub ID'],
          order['Sub ID 1'],
          order['Sub ID 2'],
          order['Sub ID 3'],
          order['Sub ID 4']
        ].filter(Boolean);
        if (!orderSubIds.some(subId => selectedSubIds.includes(subId))) return false;
      }
      
      // Apply date filter
      if (dateRange?.from || dateRange?.to) {
        const orderDate = new Date(order['Conversion Time']);
        if (dateRange?.from && orderDate < dateRange.from) return false;
        if (dateRange?.to && orderDate > dateRange.to) return false;
      }
      return true;
    });

    // Count unique orders by Check Out ID
    const uniqueOrderIds = new Set();
    filteredOrders.forEach(order => {
      const checkoutId = order['Check Out ID'];
      if (checkoutId) {
        uniqueOrderIds.add(checkoutId);
      }
    });

    console.log('🔍 LAZADA STATS DEBUG:', {
      originalOrders: lazadaOrders.length,
      filteredOrders: filteredOrders.length,
      uniqueOrders: uniqueOrderIds.size,
      totalCommission: filteredOrders.reduce((sum, order) => sum + parseNumber(order['Payout']), 0),
      totalAmount: filteredOrders.reduce((sum, order) => sum + parseNumber(order['Order Amount']), 0),
      sampleOrder: filteredOrders.length > 0 ? filteredOrders[0] : null,
      validityCounts: {
        valid: lazadaOrders.filter(order => order['Validity'] === 'valid').length,
        invalid: lazadaOrders.filter(order => order['Validity'] === 'invalid').length,
        undefined: lazadaOrders.filter(order => !order['Validity']).length
      }
    });

    const totalCommission = filteredOrders.reduce((sum, order) => sum + parseNumber(order['Payout']), 0);
    const totalAmount = filteredOrders.reduce((sum, order) => sum + parseNumber(order['Order Amount']), 0);
    const totalOrders = uniqueOrderIds.size;
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Top products - count unique orders by Check Out ID
    const productStats = filteredOrders.reduce((acc, order) => {
      const product = order['Product Name'] || order['Product'] || 'Unknown Product';
      const checkoutId = order['Check Out ID'];
      
      if (!acc[product]) {
        acc[product] = { 
          commission: 0, 
          orders: new Set(), 
          amount: 0,
          orderIds: new Set()
        };
      }
      
      acc[product].commission += parseNumber(order['Payout']);
      acc[product].amount += parseNumber(order['Order Amount']);
      if (checkoutId) {
        acc[product].orderIds.add(checkoutId);
      }
      
      return acc;
    }, {} as Record<string, { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }>);

    // Convert Set to count for final result
    const topProducts = Object.entries(productStats)
      .map(([product, stats]) => ({ 
        product, 
        commission: (stats as { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }).commission, 
        orders: (stats as { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }).orderIds.size, 
        amount: (stats as { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }).amount 
      }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 10);

    // Top Sub IDs - count unique orders by Check Out ID
    const subIdStats = filteredOrders.reduce((acc, order) => {
      const subIds = [
        order['Aff Sub ID'],
        order['Sub ID 1'],
        order['Sub ID 2'],
        order['Sub ID 3'],
        order['Sub ID 4']
      ].filter(Boolean);
      const checkoutId = order['Check Out ID'];
      
      subIds.forEach(subId => {
        if (!acc[subId]) {
          acc[subId] = { commission: 0, orders: new Set(), amount: 0, orderIds: new Set() };
        }
        acc[subId].commission += parseNumber(order['Payout']);
        acc[subId].amount += parseNumber(order['Order Amount']);
        if (checkoutId) {
          acc[subId].orderIds.add(checkoutId);
        }
      });
      return acc;
    }, {} as Record<string, { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }>);

    const topSubIds = Object.entries(subIdStats)
      .map(([subId, stats]) => ({ 
        subId, 
        commission: (stats as { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }).commission, 
        orders: (stats as { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }).orderIds.size, 
        amount: (stats as { commission: number; orders: Set<string>; amount: number; orderIds: Set<string> }).amount 
      }))
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
          title="Total Sales"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-sm">Products</th>
                    <th className="text-right py-2 px-3 font-medium text-sm">Total Com</th>
                    <th className="text-right py-2 px-3 font-medium text-sm">Total Order</th>
                    <th className="text-right py-2 px-3 font-medium text-sm">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3">
                        <div className="font-medium text-sm max-w-[200px] truncate" title={product.product}>
                          {product.product.length > 30 ? product.product.substring(0, 30) + '...' : product.product}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-purple-600">
                        ฿{formatCurrency(product.commission)}
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-muted-foreground">
                        {product.orders}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-purple-600">
                        ฿{formatCurrency(product.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-sm">Sub ID</th>
                    <th className="text-right py-2 px-3 font-medium text-sm">Total Com</th>
                    <th className="text-right py-2 px-3 font-medium text-sm">Total Order</th>
                    <th className="text-right py-2 px-3 font-medium text-sm">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSubIds.map((subId, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3">
                        <div className="font-medium text-sm max-w-[150px] truncate" title={subId.subId}>
                          {subId.subId.length > 20 ? subId.subId.substring(0, 20) + '...' : subId.subId}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-purple-600">
                        ฿{formatCurrency(subId.commission)}
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-muted-foreground">
                        {subId.orders}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-purple-600">
                        ฿{formatCurrency(subId.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}