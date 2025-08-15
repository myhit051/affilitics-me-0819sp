

interface ShopeeOrder {
  'เลขที่คำสั่งซื้อ': string;
  'รหัสสินค้า': string;
  'ชื่อสินค้า': string;
  'ราคาสินค้า(฿)': string;
  'คอมมิชชั่นสินค้า(%)': string;
  'คอมมิชชั่นสินค้าโดยรวม(฿)': string;
  'วันที่สั่งซื้อ': string;
  'เวลาที่สั่งซื้อ': string;
  'สถานะ': string;
  'วิธีการชำระ': string;
  'ผู้ให้บริการโลจิสติกส์': string;
  'ยอดขายสินค้าโดยรวม(฿)': string;
  'ช่องทาง': string;
  'Sub_id1'?: string;
  'Sub_id2'?: string;
  'Sub_id3'?: string;
  'Sub_id4'?: string;
  'Sub_id5'?: string;
  sub_id: string;
}

interface LazadaOrder {
  'Check Out ID': string;
  'Order Number': string;
  'Order Time': string;
  'SKU': string;
  'Item Name': string;
  'Sales Channel': string;
  'Order Amount': string;
  'Shipping Fee': string;
  'Voucher Amount': string;
  'Buyer Paid Amount': string;
  'Shipping Provider': string;
  'Order Status': string;
  'Payment Method': string;
  'Customer Name': string;
  'Customer Phone Number': string;
  'Shipping Address': string;
  'Billing Address': string;
  'Payout': string;
  'Aff Sub ID'?: string;
  'Sub ID 1'?: string;
  'Sub ID 2'?: string;
  'Sub ID 3'?: string;
  'Sub ID 4'?: string;
  'Sub ID': string;
  'Validity': string;
}

interface FacebookAd {
  'Campaign name': string;
  'Ad set name': string;
  'Ad name': string;
  'Amount spent (THB)': string;
  'Impressions': string;
  'Link clicks': string;
  'Landing page views': string;
  'Reach': string;
  'Frequency': string;
  'CPM (cost per 1,000 impressions)': string;
  'CPC (cost per link click)': string;
  'CTR (link click-through rate)': string;
  'Date': string;
  'Sub ID': string;
}

export interface CalculatedMetrics {
  totalAdsSpent: number;
  totalComSP: number;
  totalComLZD: number;
  totalCom: number;
  totalOrdersSP: number;
  totalOrdersLZD: number;
  totalAmountSP: number;
  totalAmountLZD: number;
  profit: number;
  roi: number;
  cpoSP: number;
  cpoLZD: number;
  cpcLink: number;
  apcLZD: number;
  validOrdersLZD: number;
  invalidOrdersLZD: number;
  totalLinkClicks: number;
  totalReach: number;
  totalRevenue: number;
  totalProfit: number;
  revenueChange: number;
  profitChange: number;
  roiChange: number;
  ordersChange: number;
  // Filtered data for other components
  filteredShopeeOrders?: ShopeeOrder[];
  filteredLazadaOrders?: LazadaOrder[];
  filteredFacebookAds?: FacebookAd[];
}

const parseNumber = (value: string | number | undefined): number => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;

  const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

function matchSubIdWithAds(subId: string, facebookAds: FacebookAd[]): number {
  if (!subId) return 0;
  
  return facebookAds.reduce((total, ad) => {
    const campaignName = ad['Campaign name'] || '';
    const adSetName = ad['Ad set name'] || '';
    const adName = ad['Ad name'] || '';
    
    const allNames = `${campaignName} ${adSetName} ${adName}`.toLowerCase();
    
    if (subId && typeof subId === 'string' && allNames.includes(subId.toLowerCase())) {
      return total + parseNumber(ad['Amount spent (THB)']);
    }
    
    return total;
  }, 0);
}

export function calculateMetrics(
  shopeeOrders: ShopeeOrder[],
  lazadaOrders: LazadaOrder[],
  facebookAds: FacebookAd[],
  selectedSubIds: string[] = [],
  selectedValidity: string = "all",
  selectedChannels: string[] = [],
  selectedPlatform: string = "all"
): CalculatedMetrics {
  console.log('Calculating metrics with data:', {
    shopeeOrders: shopeeOrders.length,
    lazadaOrders: lazadaOrders.length,
    facebookAds: facebookAds.length,
    selectedSubIds,
    selectedValidity,
    selectedChannels,
    selectedPlatform
  });

  // Filter Shopee orders based on selected Sub IDs, channels, and platform
  let filteredShopeeOrders = selectedPlatform === "all" || selectedPlatform === "Shopee" ? shopeeOrders : [];
  console.log('🔍 INITIAL SHOPEE ORDERS:', filteredShopeeOrders.length);
  
  if (selectedSubIds.length > 0 && !selectedSubIds.includes('all')) {
    filteredShopeeOrders = filteredShopeeOrders.filter(order => {
      const orderSubIds = [
        order['Sub_id1'],
        order['Sub_id2'],
        order['Sub_id3'],
        order['Sub_id4'],
        order['Sub_id5']
      ].filter(Boolean);
      
      return orderSubIds.some(subId => selectedSubIds.includes(subId || ''));
    });
  }

  if (selectedChannels.length > 0 && !selectedChannels.includes('all')) {
    filteredShopeeOrders = filteredShopeeOrders.filter(order => 
      selectedChannels.includes(order['ช่องทาง'] || '')
    );
  }
  
  console.log('🔍 AFTER ALL FILTERS - SHOPEE ORDERS:', filteredShopeeOrders.length);

  // Filter Lazada orders based on selected Sub IDs, platform, and channels
  // If channels are selected, exclude Lazada data (channels are Shopee-specific)
  let filteredLazadaOrders = (selectedChannels.length > 0 && !selectedChannels.includes('all')) 
    ? [] 
    : (selectedPlatform === "all" || selectedPlatform === "Lazada" ? lazadaOrders : []);
  
  if (selectedSubIds.length > 0 && !selectedSubIds.includes('all')) {
    filteredLazadaOrders = filteredLazadaOrders.filter(order => {
      const orderSubIds = [
        order['Aff Sub ID'],
        order['Sub ID 1'],
        order['Sub ID 2'],
        order['Sub ID 3'],
        order['Sub ID 4']
      ].filter(Boolean);
      
      return orderSubIds.some(subId => selectedSubIds.includes(subId || ''));
    });
  }

  // Filter Lazada orders by validity
  if (selectedValidity !== "all") {
    filteredLazadaOrders = filteredLazadaOrders.filter(order => 
      order['Validity'] === selectedValidity
    );
  }

  // Calculate Shopee metrics - count unique orders by "เลขที่คำสั่งซื้อ"
  console.log('calculateMetrics - filteredShopeeOrders count:', filteredShopeeOrders.length);
  console.log('calculateMetrics - sample Shopee order:', filteredShopeeOrders[0]);
  
  const uniqueShopeeOrders = new Map();
  filteredShopeeOrders.forEach(order => {
    const orderId = order['เลขที่คำสั่งซื้อ'];
    if (!uniqueShopeeOrders.has(orderId)) {
      // Create a copy of the order to avoid modifying original data
      uniqueShopeeOrders.set(orderId, {
        ...order,
        'คอมมิชชั่นสินค้าโดยรวม(฿)': parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']),
        'ยอดขายสินค้าโดยรวม(฿)': parseNumber(order['ยอดขายสินค้าโดยรวม(฿)'])
      });
    } else {
      // If duplicate, add commission to existing order
      const existing = uniqueShopeeOrders.get(orderId);
      existing['คอมมิชชั่นสินค้าโดยรวม(฿)'] += parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
      existing['ยอดขายสินค้าโดยรวม(฿)'] += parseNumber(order['ยอดขายสินค้าโดยรวม(฿)']);
    }
  });

  const totalComSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    const commission = typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)'] === 'number' 
      ? order['คอมมิชชั่นสินค้าโดยรวม(฿)'] 
      : parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    return sum + commission;
  }, 0);
  
  // Debug: Show raw vs calculated totals
  const rawShopeeTotal = filteredShopeeOrders.reduce((sum, order) => {
    return sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
  }, 0);
  
  console.log('🔍 SHOPEE COMMISSION DEBUG:');
  console.log('Raw total (all filtered orders):', rawShopeeTotal);
  console.log('Calculated total (after dedup):', totalComSP);
  console.log('Difference:', rawShopeeTotal - totalComSP);

  console.log('calculateMetrics - uniqueShopeeOrders count:', uniqueShopeeOrders.size);
  console.log('calculateMetrics - totalComSP:', totalComSP);
  console.log('🔍 SHOPEE DEBUG - filteredShopeeOrders.length:', filteredShopeeOrders.length);
  
  // Debug: Check sample Shopee order and commission fields
  if (filteredShopeeOrders.length > 0) {
    console.log('🔍 SHOPEE SAMPLE ORDER:', filteredShopeeOrders[0]);
    console.log('🔍 SHOPEE ALL FIELDS:', Object.keys(filteredShopeeOrders[0]));
    
    // Check all possible commission fields
    const commissionFields = [
      'คอมมิชชั่นสินค้าโดยรวม(฿)',
      'คอมมิชชั่น',
      'Commission',
      'commission',
      'Total Commission'
    ];
    
    commissionFields.forEach(field => {
      if (filteredShopeeOrders[0][field] !== undefined) {
        console.log(`🔍 FOUND COMMISSION FIELD "${field}":`, filteredShopeeOrders[0][field]);
      }
    });
  }

  const totalOrdersSP = uniqueShopeeOrders.size;
  
  const totalAmountSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    return sum + (typeof order['ยอดขายสินค้าโดยรวม(฿)'] === 'number' 
      ? order['ยอดขายสินค้าโดยรวม(฿)'] 
      : parseNumber(order['ยอดขายสินค้าโดยรวม(฿)']));
  }, 0);

  // Calculate Lazada metrics - count unique orders by "Check Out ID"
  const uniqueLazadaOrders = new Map();
  filteredLazadaOrders.forEach(order => {
    const checkoutId = order['Check Out ID'];
    if (!uniqueLazadaOrders.has(checkoutId)) {
      // Create a copy of the order to avoid modifying original data
      uniqueLazadaOrders.set(checkoutId, {
        ...order,
        'Payout': parseNumber(order['Payout']),
        'Order Amount': parseNumber(order['Order Amount'])
      });
    } else {
      // If duplicate, add payout and amount to existing order
      const existing = uniqueLazadaOrders.get(checkoutId);
      existing['Payout'] += parseNumber(order['Payout']);
      existing['Order Amount'] += parseNumber(order['Order Amount']);
    }
  });

  const totalComLZD = Array.from(uniqueLazadaOrders.values()).reduce((sum, order) => {
    const commission = typeof order['Payout'] === 'number' 
      ? order['Payout'] 
      : parseNumber(order['Payout']);
    return sum + commission;
  }, 0);
  
  // Debug: Show raw vs calculated totals
  const rawLazadaTotal = filteredLazadaOrders.reduce((sum, order) => {
    return sum + parseNumber(order['Payout']);
  }, 0);
  
  console.log('🔍 LAZADA COMMISSION DEBUG:');
  console.log('Raw total (all filtered orders):', rawLazadaTotal);
  console.log('Calculated total (after dedup):', totalComLZD);
  console.log('Difference:', rawLazadaTotal - totalComLZD);

  const totalOrdersLZD = uniqueLazadaOrders.size;
  
  const totalAmountLZD = Array.from(uniqueLazadaOrders.values()).reduce((sum, order) => {
    return sum + (typeof order['Order Amount'] === 'number' 
      ? order['Order Amount'] 
      : parseNumber(order['Order Amount']));
  }, 0);

  // Separate valid and invalid orders for Lazada
  const validOrdersLZD = Array.from(uniqueLazadaOrders.values()).filter(order => 
    order['Order Status'] === 'shipped' || 
    order['Order Status'] === 'delivered' ||
    (typeof order['Payout'] === 'number' ? order['Payout'] : parseNumber(order['Payout'])) > 0
  ).length;
  
  const invalidOrdersLZD = totalOrdersLZD - validOrdersLZD;

  // Calculate Facebook Ads metrics
  // Filter by platform first
  let filteredFacebookAds = selectedPlatform === "all" || selectedPlatform === "Facebook" ? facebookAds : [];
  
  // If channels are selected, exclude Facebook data (channels are Shopee-specific)
  if (selectedChannels.length > 0 && !selectedChannels.includes('all')) {
    filteredFacebookAds = [];
  }
  
  // Filter by Sub IDs
  if (selectedSubIds.length > 0 && !selectedSubIds.includes('all')) {
    filteredFacebookAds = filteredFacebookAds.filter(ad => {
      const campaignName = ad['Campaign name'] || '';
      const adSetName = ad['Ad set name'] || '';
      const adName = ad['Ad name'] || '';
      
      const allNames = `${campaignName} ${adSetName} ${adName}`.toLowerCase();
      
      return selectedSubIds.some(subId => subId && typeof subId === 'string' && allNames.includes(subId.toLowerCase()));
    });
  }

  const totalAdsSpent = filteredFacebookAds.reduce((sum, ad) => {
    return sum + parseNumber(ad['Amount spent (THB)']);
  }, 0);

  const totalLinkClicks = filteredFacebookAds.reduce((sum, ad) => {
    return sum + parseNumber(ad['Link clicks']);
  }, 0);

  const totalReach = filteredFacebookAds.reduce((sum, ad) => {
    return sum + parseNumber(ad['Reach']);
  }, 0);

  // Calculate derived metrics
  const totalCom = totalComSP + totalComLZD;
  const profit = totalCom - totalAdsSpent;
  const roi = totalAdsSpent > 0 ? (profit / totalAdsSpent) * 100 : 0;
  const cpoSP = totalOrdersSP > 0 ? totalAdsSpent / totalOrdersSP : 0;
  const cpoLZD = validOrdersLZD > 0 ? totalAdsSpent / validOrdersLZD : 0;
  
  const apcLZD = totalAdsSpent > 0 ? totalAmountLZD / totalAdsSpent : 0;
  
  const avgCpcLink = filteredFacebookAds.length > 0 
    ? filteredFacebookAds.reduce((sum, ad) => sum + parseNumber(ad['CPC (cost per link click)']), 0) / filteredFacebookAds.length
    : 0;

  const metrics: CalculatedMetrics = {
    totalAdsSpent,
    totalComSP,
    totalComLZD,
    totalCom,
    totalOrdersSP,
    totalOrdersLZD,
    totalAmountSP,
    totalAmountLZD,
    profit,
    roi,
    cpoSP,
    cpoLZD,
    cpcLink: avgCpcLink,
    apcLZD,
    validOrdersLZD,
    invalidOrdersLZD,
    totalLinkClicks,
    totalReach,
    totalRevenue: totalCom,
    totalProfit: profit,
    revenueChange: 0,
    profitChange: 0,
    roiChange: 0,
    ordersChange: 0
  };

  console.log('Calculated metrics:', metrics);
  
  // Return metrics with filtered data
  return {
    ...metrics,
    filteredShopeeOrders,
    filteredLazadaOrders,
    filteredFacebookAds
  };
}

interface SubIdPerformance {
  id: string;
  orders: number;
  commission: number;
  adSpent: number;
  roi: number;
  platform: string;
}

export interface DailyMetrics {
  date: string;
  totalCom: number;
  adSpend: number;
  profit: number;
  roi: number;
}

export function analyzeDailyPerformance(
  shopeeOrders: ShopeeOrder[],
  lazadaOrders: LazadaOrder[],
  facebookAds: FacebookAd[]
): DailyMetrics[] {
  console.log('analyzeDailyPerformance called with:', {
    shopeeCount: shopeeOrders.length,
    lazadaCount: lazadaOrders.length,
    facebookCount: facebookAds.length
  });
  
  const dailyMap: { [key: string]: DailyMetrics } = {};

  // Process Facebook Ads
  facebookAds.forEach(ad => {
    const dateStr = ad['Day'] || ad['Date'];
    if (dateStr) {
      try {
        const adDate = new Date(dateStr);
        if (adDate && !isNaN(adDate.getTime())) {
          const dateKey = adDate.toISOString().split('T')[0];
          
          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = {
              date: dateKey,
              totalCom: 0,
              adSpend: 0,
              profit: 0,
              roi: 0
            };
          }
          
          dailyMap[dateKey].adSpend += parseNumber(ad['Amount spent (THB)']);
        }
      } catch (error) {
        // Skip invalid dates
      }
    }
  });

  // Process unique Shopee orders
  const uniqueShopeeOrders = new Map();
  shopeeOrders.forEach(order => {
    const orderId = order['เลขที่คำสั่งซื้อ'];
    if (!uniqueShopeeOrders.has(orderId)) {
      uniqueShopeeOrders.set(orderId, order);
    }
  });

  Array.from(uniqueShopeeOrders.values()).forEach(order => {
    const possibleDateColumns = ['เวลาที่สั่งซื้อ', 'วันที่สั่งซื้อ', 'Order Time', 'Order Date', 'Date'];
    let orderDate = null;
    let dateKey = null;
    
    // Try to parse date from multiple columns
    for (const column of possibleDateColumns) {
      if (order[column]) {
        try {
          const parsedDate = new Date(order[column]);
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            orderDate = parsedDate;
            dateKey = orderDate.toISOString().split('T')[0];
            break;
          }
        } catch (error) {
          // Continue to next column
        }
      }
    }
    
    // If no valid date found, use today's date as fallback
    if (!dateKey) {
      const today = new Date();
      dateKey = today.toISOString().split('T')[0];
    }
    
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        date: dateKey,
        totalCom: 0,
        adSpend: 0,
        profit: 0,
        roi: 0
      };
    }
    
    dailyMap[dateKey].totalCom += parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
  });

  // Process unique Lazada orders
  const uniqueLazadaOrders = new Map();
  lazadaOrders.forEach(order => {
    const checkoutId = order['Check Out ID'];
    if (!uniqueLazadaOrders.has(checkoutId)) {
      uniqueLazadaOrders.set(checkoutId, order);
    }
  });

  Array.from(uniqueLazadaOrders.values()).forEach(order => {
    const dateStr = order['Conversion Time'] || order['Order Time'];
    if (dateStr) {
      try {
        const orderDate = new Date(dateStr);
        if (orderDate && !isNaN(orderDate.getTime())) {
          const dateKey = orderDate.toISOString().split('T')[0];
          
          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = {
              date: dateKey,
              totalCom: 0,
              adSpend: 0,
              profit: 0,
              roi: 0
            };
          }
          
          dailyMap[dateKey].totalCom += parseNumber(order['Payout']);
        }
      } catch (error) {
        // Skip invalid dates
      }
    }
  });

  // Calculate profit and ROI for each day
  Object.values(dailyMap).forEach(day => {
    day.profit = day.totalCom - day.adSpend;
    day.roi = day.adSpend > 0 ? (day.profit / day.adSpend) * 100 : 0;
  });

  const result = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  console.log('analyzeDailyPerformance result:', {
    totalDays: result.length,
    sampleData: result.slice(0, 3)
  });
  
  return result;
}

export function analyzeSubIdPerformance(
  shopeeOrders: ShopeeOrder[],
  lazadaOrders: LazadaOrder[],
  facebookAds: FacebookAd[],
  totalAdsSpent: number
): SubIdPerformance[] {
  const subIdMap: { [key: string]: { commission: number; orders: number; adSpent: number; platform: string } } = {};

  // Process unique Shopee orders
  const uniqueShopeeOrders = new Map();
  shopeeOrders.forEach(order => {
    const orderId = order['เลขที่คำสั่งซื้อ'];
    if (!uniqueShopeeOrders.has(orderId)) {
      uniqueShopeeOrders.set(orderId, order);
    }
  });

  Array.from(uniqueShopeeOrders.values()).forEach((order) => {
    const subIds = [
      order['Sub_id1'],
      order['Sub_id2'],
      order['Sub_id3'],
      order['Sub_id4'],
      order['Sub_id5']
    ].filter(Boolean);

    subIds.forEach(subId => {
      if (!subIdMap[subId]) {
        subIdMap[subId] = { commission: 0, orders: 0, adSpent: 0, platform: 'Shopee' };
      }
      subIdMap[subId].commission += parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
      subIdMap[subId].orders++;
      subIdMap[subId].adSpent = matchSubIdWithAds(subId, facebookAds);
      if (subIdMap[subId].platform !== 'Shopee' && subIdMap[subId].platform !== 'Mixed') {
        subIdMap[subId].platform = 'Mixed';
      }
    });
  });

  // Process unique Lazada orders
  const uniqueLazadaOrders = new Map();
  lazadaOrders.forEach(order => {
    const checkoutId = order['Check Out ID'];
    if (!uniqueLazadaOrders.has(checkoutId)) {
      uniqueLazadaOrders.set(checkoutId, order);
    }
  });

  Array.from(uniqueLazadaOrders.values()).forEach((order) => {
    const subIds = [
      order['Aff Sub ID'],
      order['Sub ID 1'],
      order['Sub ID 2'],
      order['Sub ID 3'],
      order['Sub ID 4']
    ].filter(Boolean);

    subIds.forEach(subId => {
      if (!subIdMap[subId]) {
        subIdMap[subId] = { commission: 0, orders: 0, adSpent: 0, platform: 'Lazada' };
      }
      subIdMap[subId].commission += parseNumber(order['Payout']);
      subIdMap[subId].orders++;
      subIdMap[subId].adSpent = matchSubIdWithAds(subId, facebookAds);
      if (subIdMap[subId].platform !== 'Lazada' && subIdMap[subId].platform !== 'Mixed') {
        subIdMap[subId].platform = 'Mixed';
      }
    });
  });

  const subIdPerformance: SubIdPerformance[] = Object.entries(subIdMap).map(
    ([id, data]) => {
      const roi = data.adSpent > 0 ? ((data.commission - data.adSpent) / data.adSpent) * 100 : 0;
      return {
        id,
        orders: data.orders,
        commission: data.commission,
        adSpent: data.adSpent,
        roi: roi,
        platform: data.platform,
      };
    }
  );

  return subIdPerformance.sort((a, b) => b.commission - a.commission);
}

interface PlatformPerformance {
  id: number;
  platform: string;
  icon: string;
  orders: number;
  commission: number;
  adSpend: number;
  roi: number;
  status: string;
  change: number;
}

export function analyzePlatformPerformance(
  shopeeOrders: ShopeeOrder[],
  lazadaOrders: LazadaOrder[],
  totalAdsSpent: number
): PlatformPerformance[] {
  // Count unique Shopee orders
  const uniqueShopeeOrders = new Set(shopeeOrders.map(order => order['เลขที่คำสั่งซื้อ']));
  const shopeeCommission = shopeeOrders.reduce((sum, order) => {
    return sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
  }, 0);
  const shopeeOrdersCount = uniqueShopeeOrders.size;
  const shopeeROI = totalAdsSpent > 0 ? (shopeeCommission / totalAdsSpent) * 100 : 0;

  // Count unique Lazada orders
  const uniqueLazadaOrders = new Set(lazadaOrders.map(order => order['Check Out ID']));
  const lazadaCommission = lazadaOrders.reduce((sum, order) => {
    return sum + parseNumber(order['Payout']);
  }, 0);
  const lazadaOrdersCount = uniqueLazadaOrders.size;
  const lazadaROI = totalAdsSpent > 0 ? (lazadaCommission / totalAdsSpent) * 100 : 0;

  const facebookAdSpend = totalAdsSpent;
  const facebookROI = totalAdsSpent > 0 ? ((totalAdsSpent * 0.2) / totalAdsSpent) * 100 : 0;

  const platformData: PlatformPerformance[] = [
    {
      id: 1,
      platform: "Shopee",
      icon: "🛒",
      orders: shopeeOrdersCount,
      commission: shopeeCommission,
      adSpend: totalAdsSpent / 2,
      roi: shopeeROI,
      status: shopeeROI > 50 ? 'good' : 'average',
      change: 5.2,
    },
    {
      id: 2,
      platform: "Lazada",
      icon: "🛍️",
      orders: lazadaOrdersCount,
      commission: lazadaCommission,
      adSpend: totalAdsSpent / 2,
      roi: lazadaROI,
      status: lazadaROI > 60 ? 'excellent' : 'good',
      change: -2.8,
    },
    {
      id: 3,
      platform: "Facebook Ads",
      icon: "📘",
      orders: 0,
      commission: 0,
      adSpend: facebookAdSpend,
      roi: facebookROI,
      status: facebookROI > 15 ? 'average' : 'bad',
      change: 12.5,
    },
  ];

  return platformData;
}

// รวมยอดคอมมิชชั่น Shopee ทุกแถว (ไม่ deduplicate)
export function sumShopeeCommissionRaw(shopeeOrders: ShopeeOrder[]): number {
  return shopeeOrders.reduce((sum, order) => sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']), 0);
}

// Interface for traditional campaign data
export interface TraditionalCampaign {
  id: number;
  name: string;
  platform: string;
  subId: string;
  orders: number;
  commission: number;
  adSpend: number;
  roi: number;
  status: string;
  startDate: string;
  performance: string;
}

// Generate traditional campaign data from Shopee and Lazada orders
export function generateTraditionalCampaigns(
  shopeeOrders: ShopeeOrder[],
  lazadaOrders: LazadaOrder[],
  facebookAds: FacebookAd[]
): TraditionalCampaign[] {
  const campaigns: TraditionalCampaign[] = [];
  let campaignId = 1;

  // Group Shopee orders by Sub ID
  const shopeeSubIdGroups: { [key: string]: ShopeeOrder[] } = {};
  shopeeOrders.forEach(order => {
    const subIds = [
      order['Sub_id1'],
      order['Sub_id2'],
      order['Sub_id3'],
      order['Sub_id4'],
      order['Sub_id5']
    ].filter(Boolean);

    subIds.forEach(subId => {
      if (subId) {
        if (!shopeeSubIdGroups[subId]) {
          shopeeSubIdGroups[subId] = [];
        }
        shopeeSubIdGroups[subId].push(order);
      }
    });
  });

  // Create campaigns from Shopee Sub ID groups
  Object.entries(shopeeSubIdGroups).forEach(([subId, orders]) => {
    const uniqueOrders = new Map();
    orders.forEach(order => {
      const orderId = order['เลขที่คำสั่งซื้อ'];
      if (!uniqueOrders.has(orderId)) {
        uniqueOrders.set(orderId, order);
      }
    });

    const totalCommission = Array.from(uniqueOrders.values()).reduce((sum, order) => {
      return sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    }, 0);

    const adSpent = matchSubIdWithAds(subId, facebookAds);
    const roi = adSpent > 0 ? ((totalCommission - adSpent) / adSpent) * 100 : 0;

    // Get the latest order date
    const latestDate = Array.from(uniqueOrders.values()).reduce((latest, order) => {
      const orderDate = new Date(order['วันที่สั่งซื้อ'] || order['เวลาที่สั่งซื้อ'] || '');
      return orderDate > latest ? orderDate : latest;
    }, new Date(0));

    const getPerformanceLabel = (roi: number) => {
      if (roi >= 100) return 'excellent';
      if (roi >= 50) return 'good';
      if (roi >= 0) return 'average';
      return 'poor';
    };

    campaigns.push({
      id: campaignId++,
      name: `Shopee Campaign - ${subId}`,
      platform: 'Shopee',
      subId,
      orders: uniqueOrders.size,
      commission: Math.round(totalCommission * 100) / 100,
      adSpend: Math.round(adSpent * 100) / 100,
      roi: Math.round(roi * 10) / 10,
      status: uniqueOrders.size > 0 ? 'active' : 'paused',
      startDate: latestDate.toISOString().split('T')[0],
      performance: getPerformanceLabel(roi)
    });
  });

  // Group Lazada orders by Sub ID
  const lazadaSubIdGroups: { [key: string]: LazadaOrder[] } = {};
  lazadaOrders.forEach(order => {
    const subIds = [
      order['Aff Sub ID'],
      order['Sub ID 1'],
      order['Sub ID 2'],
      order['Sub ID 3'],
      order['Sub ID 4']
    ].filter(Boolean);

    subIds.forEach(subId => {
      if (subId) {
        if (!lazadaSubIdGroups[subId]) {
          lazadaSubIdGroups[subId] = [];
        }
        lazadaSubIdGroups[subId].push(order);
      }
    });
  });

  // Create campaigns from Lazada Sub ID groups
  Object.entries(lazadaSubIdGroups).forEach(([subId, orders]) => {
    const uniqueOrders = new Map();
    orders.forEach(order => {
      const checkoutId = order['Check Out ID'];
      if (!uniqueOrders.has(checkoutId)) {
        uniqueOrders.set(checkoutId, order);
      }
    });

    const totalCommission = Array.from(uniqueOrders.values()).reduce((sum, order) => {
      return sum + parseNumber(order['Payout']);
    }, 0);

    const adSpent = matchSubIdWithAds(subId, facebookAds);
    const roi = adSpent > 0 ? ((totalCommission - adSpent) / adSpent) * 100 : 0;

    // Get the latest order date
    const latestDate = Array.from(uniqueOrders.values()).reduce((latest, order) => {
      const orderDate = new Date(order['Order Time'] || '');
      return orderDate > latest ? orderDate : latest;
    }, new Date(0));

    const getPerformanceLabel = (roi: number) => {
      if (roi >= 100) return 'excellent';
      if (roi >= 50) return 'good';
      if (roi >= 0) return 'average';
      return 'poor';
    };

    campaigns.push({
      id: campaignId++,
      name: `Lazada Campaign - ${subId}`,
      platform: 'Lazada',
      subId,
      orders: uniqueOrders.size,
      commission: Math.round(totalCommission * 100) / 100,
      adSpend: Math.round(adSpent * 100) / 100,
      roi: Math.round(roi * 10) / 10,
      status: uniqueOrders.size > 0 ? 'active' : 'paused',
      startDate: latestDate.toISOString().split('T')[0],
      performance: getPerformanceLabel(roi)
    });
  });

  return campaigns.sort((a, b) => b.commission - a.commission);
}
