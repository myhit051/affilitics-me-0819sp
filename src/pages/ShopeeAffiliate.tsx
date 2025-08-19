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
import { ShoppingBag, TrendingUp, Target, DollarSign, RotateCcw, Upload } from "lucide-react";

export default function ShopeeAffiliate() {
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { 
    importedData, 
    calculatedMetrics, 
    hasData, 
    rawShopeeCommission,
    uniqueShopeeOrderCount,
    loading
  } = useImportedData();

  const shopeeOrders = importedData?.shopeeOrders || [];

  const getShopeeStats = () => {
    console.log('🔍 ShopeeAffiliate Debug:', {
      hasData,
      shopeeOrdersLength: shopeeOrders.length,
      calculatedMetrics: calculatedMetrics,
      calculatedMetricsKeys: calculatedMetrics ? Object.keys(calculatedMetrics) : null
    });

    if (calculatedMetrics) {
      console.log('📊 calculatedMetrics details:', {
        totalComSP: calculatedMetrics.totalComSP,
        totalOrdersSP: calculatedMetrics.totalOrdersSP,
        totalAmountSP: calculatedMetrics.totalAmountSP,
        totalCom: calculatedMetrics.totalCom,
        allKeys: Object.keys(calculatedMetrics),
        allValues: Object.values(calculatedMetrics)
      });
      
      // Log the entire calculatedMetrics object
      console.log('📊 calculatedMetrics full object:', calculatedMetrics);
      console.log('📊 calculatedMetrics type:', typeof calculatedMetrics);
      console.log('📊 calculatedMetrics constructor:', calculatedMetrics.constructor.name);
    }

    if (!hasData || !shopeeOrders.length) {
      console.log('❌ No data available');
      return {
        totalCommission: 0,
        totalOrders: 0,
        totalAmount: 0,
        avgOrderValue: 0,
        topProducts: [],
        topSubIds: []
      };
    }

    // ใช้ข้อมูลจาก calculatedMetrics ที่ผ่านการคำนวณแล้ว
    let totalCommission = 0;
    let totalOrders = 0;
    let totalAmount = 0;

    if (calculatedMetrics) {
      totalCommission = calculatedMetrics.totalComSP || 0;
      totalOrders = calculatedMetrics.totalOrdersSP || 0;
      totalAmount = calculatedMetrics.totalAmountSP || 0;
      console.log('✅ Using calculatedMetrics:', { totalCommission, totalOrders, totalAmount });
    } else {
      // Fallback: คำนวณเองถ้า calculatedMetrics ไม่มี
      console.log('⚠️ calculatedMetrics not available, calculating locally...');
      
      // ใช้ logic เดียวกับ affiliateCalculations.ts
      const uniqueShopeeOrders = new Map();
      shopeeOrders.forEach(order => {
        const orderId = order['รหัสการสั่งซื้อ'] || order['เลขที่คำสั่งซื้อ'];
        if (!uniqueShopeeOrders.has(orderId)) {
          uniqueShopeeOrders.set(orderId, {
            ...order,
            'คอมมิชชั่นสินค้าโดยรวม(฿)': parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'),
            'มูลค่าซื้อ(฿)': parseFloat(order['มูลค่าซื้อ(฿)'] || '0')
          });
        } else {
          const existing = uniqueShopeeOrders.get(orderId);
          existing['คอมมิชชั่นสินค้าโดยรวม(฿)'] += parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
          existing['มูลค่าซื้อ(฿)'] += parseFloat(order['มูลค่าซื้อ(฿)'] || '0');
        }
      });

      totalCommission = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
        return sum + (typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)'] === 'number'
          ? order['คอมมิชชั่นสินค้าโดยรวม(฿)']
          : parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0'));
      }, 0);

      totalOrders = uniqueShopeeOrders.size;

      totalAmount = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
        return sum + (typeof order['มูลค่าซื้อ(฿)'] === 'number'
          ? order['มูลค่าซื้อ(฿)']
          : parseFloat(order['มูลค่าซื้อ(฿)'] || '0'));
      }, 0);

      console.log('✅ Local calculation result:', { totalCommission, totalOrders, totalAmount });
    }

    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // กรองข้อมูลสำหรับ Top Products และ Top Sub IDs
    const filteredOrders = shopeeOrders.filter(order => {
      // Apply filters
      if (selectedSubIds.length > 0) {
        const orderSubIds = [
          order['Sub_id1'],
          order['Sub_id2'],
          order['Sub_id3'],
          order['Sub_id4'],
          order['Sub_id5']
        ].filter(Boolean);
        
        if (!orderSubIds.some(subId => selectedSubIds.includes(subId || ''))) {
          return false;
        }
      }
      
      if (selectedChannels.length > 0 && !selectedChannels.includes(order['ช่องทาง'] || '')) return false;
      
      // Date filtering - try multiple date columns
      if (dateRange?.from || dateRange?.to) {
        const possibleDateColumns = ['เวลาที่สั่งซื้อ', 'วันที่สั่งซื้อ', 'Order Time', 'Order Date', 'Date'];
        let orderDate = null;
        
        for (const column of possibleDateColumns) {
          if (order[column]) {
            try {
              orderDate = new Date(order[column]);
              if (!isNaN(orderDate.getTime())) break;
            } catch (e) {
              continue;
            }
          }
        }
        
        if (orderDate) {
          if (dateRange?.from && orderDate < dateRange.from) return false;
          if (dateRange?.to && orderDate > dateRange.to) return false;
        }
      }
      
      return true;
    });

    // Top products - ใช้ชื่อรายการสินค้าและคอมมิชชั่นที่ถูกต้อง
    const productStats = filteredOrders.reduce((acc, order) => {
      const product = order['ชื่อรายการสินค้า'] || 'Unknown Product';
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      if (!acc[product]) {
        acc[product] = { commission: 0, orders: 0 };
      }
      acc[product].commission += commission;
      acc[product].orders += 1;
      return acc;
    }, {} as Record<string, { commission: number; orders: number }>);

    const topProducts = Object.entries(productStats)
      .map(([product, productStats]) => ({ 
        product, 
        commission: (productStats as { commission: number; orders: number }).commission, 
        orders: (productStats as { commission: number; orders: number }).orders 
      }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 10);

    // Top Sub IDs - ใช้ Sub_id1-5 และคอมมิชชั่นที่ถูกต้อง
    const subIdStats = filteredOrders.reduce((acc, order) => {
      const subIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      const commission = parseFloat(order['คอมมิชชั่นสินค้าโดยรวม(฿)'] || '0');
      
      // ถ้ามีหลาย Sub IDs ให้แบ่ง commission เท่าๆ กัน
      const commissionPerSubId = subIds.length > 0 ? commission / subIds.length : 0;
      
      subIds.forEach(subId => {
        if (!acc[subId]) {
          acc[subId] = { commission: 0, orders: 0 };
        }
        acc[subId].commission += commissionPerSubId;
        acc[subId].orders += 1;
      });
      
      return acc;
    }, {} as Record<string, { commission: number; orders: number }>);

    const topSubIds = Object.entries(subIdStats)
      .map(([subId, subIdStats]) => ({ 
        subId, 
        commission: (subIdStats as { commission: number; orders: number }).commission, 
        orders: (subIdStats as { commission: number; orders: number }).orders 
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

  const stats = getShopeeStats();

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <div className="text-lg">กำลังโหลดข้อมูล Shopee...</div>
        </div>
      </div>
    );
  }

  if (!hasData || !shopeeOrders.length) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">🛒</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Shopee Affiliate Analytics
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            อัปโหลดไฟล์ข้อมูล Shopee Affiliate เพื่อเริ่มวิเคราะห์ผลการดำเนินงาน
            และติดตามประสิทธิภาพของแต่ละ campaign
          </p>
          <Button 
            onClick={() => window.location.href = "/import"} 
            size="lg" 
            className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 border-0"
          >
            <Upload className="mr-3 h-6 w-6" />
            Import Shopee Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Shopee Affiliate
          </h1>
          <p className="text-muted-foreground">วิเคราะห์ผลการดำเนินงาน Shopee Affiliate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
        <DateRangeSelector 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <SubIdFilter
          shopeeOrders={shopeeOrders}
          lazadaOrders={[]}
          selectedSubIds={selectedSubIds}
          onSubIdChange={setSelectedSubIds}
        />

        <ChannelFilter
          shopeeOrders={shopeeOrders}
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
          icon={<DollarSign className="h-4 w-4 text-orange-500" />}
          colorClass="from-orange-500/10 to-orange-600/5"
          animationDelay="0ms"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={0}
          icon={<Target className="h-4 w-4 text-orange-500" />}
          colorClass="from-orange-500/10 to-orange-600/5"
          animationDelay="100ms"
        />
        <StatsCard
          title="Total Sales"
          value={formatCurrency(stats.totalAmount)}
          change={0}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          colorClass="from-orange-500/10 to-orange-600/5"
          animationDelay="200ms"
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          change={0}
          icon={<ShoppingBag className="h-4 w-4 text-orange-500" />}
          colorClass="from-orange-500/10 to-orange-600/5"
          animationDelay="300ms"
        />
      </div>

      {/* Top Products & Sub IDs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
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
                      <td className="py-2 px-3 text-right font-semibold text-orange-600">
                        ฿{formatCurrency(product.commission)}
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-muted-foreground">
                        {product.orders}
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
              <Target className="h-5 w-5 text-orange-500" />
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
                      <td className="py-2 px-3 text-right font-semibold text-orange-600">
                        ฿{formatCurrency(subId.commission)}
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-muted-foreground">
                        {subId.orders}
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