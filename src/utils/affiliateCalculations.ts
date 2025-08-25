

interface ShopeeOrder {
  'รหัสการสั่งซื้อ': string; // ใช้เป็น key หลักสำหรับ unique orders
  'รหัสสินค้า': string;
  'ชื่อสินค้า': string;
  'ชื่อรายการสินค้า': string; // เพิ่มฟิลด์ใหม่
  'ราคาสินค้า(฿)': string;
  'คอมมิชชั่นสินค้า(%)': string;
  'คอมมิชชั่นสินค้าโดยรวม(฿)': string;
  'วันที่สั่งซื้อ': string;
  'เวลาที่สั่งซื้อ': string;
  'สถานะ': string;
  'วิธีการชำระ': string;
  'ผู้ให้บริการโลจิสติกส์': string;
  'ยอดขายสินค้าโดยรวม(฿)': string;
  'มูลค่าซื้อ(฿)': string; // เพิ่มฟิลด์ใหม่
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
  'Sku Order ID': string; // เพิ่มคอลัมน์ Sku Order ID
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
  unitsLZD: number; // New field for Units calculation
  // Filtered data for other components
  filteredShopeeOrders?: ShopeeOrder[];
  filteredLazadaOrders?: LazadaOrder[];
  filteredFacebookAds?: FacebookAd[];
}

const parseNumber = (value: string | number | undefined): number => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;

  const parsed = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  const result = isNaN(parsed) ? 0 : parsed;
  
  // Debug logging for commission and amount fields
  if (typeof value === 'string' && (
    value.includes('คอมมิชชั่น') || 
    value.includes('มูลค่า') || 
    value.includes('Payout') ||
    value.includes('Amount')
  )) {
    console.log('🔍 parseNumber debug:', {
      originalValue: value,
      cleanedValue: value.toString().replace(/[^0-9.-]/g, ''),
      parsed: parsed,
      result: result
    });
  }
  
  return result;
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

  // Calculate Shopee metrics - count unique orders by "รหัสการสั่งซื้อ" and exclude cancelled orders
  console.log('calculateMetrics - filteredShopeeOrders count:', filteredShopeeOrders.length);
  console.log('calculateMetrics - sample Shopee order:', filteredShopeeOrders[0]);
  
  const uniqueShopeeOrders = new Map();
  filteredShopeeOrders.forEach(order => {
    // ใช้ 'รหัสการสั่งซื้อ' เป็น key หลัก และไม่นับออเดอร์ที่ยกเลิก
    const orderId = order['รหัสการสั่งซื้อ'];
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    
    // ข้ามออเดอร์ที่ยกเลิก
    if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
      return;
    }
    
    if (!uniqueShopeeOrders.has(orderId)) {
      // Create a copy of the order to avoid modifying original data
      uniqueShopeeOrders.set(orderId, {
        ...order,
        'คอมมิชชั่นสินค้าโดยรวม(฿)': parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']),
        'ยอดขายสินค้าโดยรวม(฿)': parseNumber(order['ยอดขายสินค้าโดยรวม(฿)']),
        'มูลค่าซื้อ(฿)': parseNumber(order['มูลค่าซื้อ(฿)'])
      });
    } else {
      // If duplicate, add commission to existing order
      const existing = uniqueShopeeOrders.get(orderId);
      existing['คอมมิชชั่นสินค้าโดยรวม(฿)'] += parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
      existing['ยอดขายสินค้าโดยรวม(฿)'] += parseNumber(order['ยอดขายสินค้าโดยรวม(฿)']);
      existing['มูลค่าซื้อ(฿)'] += parseNumber(order['มูลค่าซื้อ(฿)']);
    }
  });

  const totalComSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    const commission = typeof order['คอมมิชชั่นสินค้าโดยรวม(฿)'] === 'number' 
      ? order['คอมมิชชั่นสินค้าโดยรวม(฿)'] 
      : parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    return sum + commission;
  }, 0);
  
  // ปัดเศษเป็น 2 ตำแหน่งทศนิยม
  const roundedTotalComSP = Math.round(totalComSP * 100) / 100;
  
  // Debug: Show raw vs calculated totals
  const rawShopeeTotal = filteredShopeeOrders.reduce((sum, order) => {
    return sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
  }, 0);
  
  console.log('🔍 SHOPEE COMMISSION DEBUG:');
  console.log('Raw total (all filtered orders):', rawShopeeTotal);
  console.log('Calculated total (after dedup):', totalComSP);
  console.log('Rounded total (2 decimal places):', roundedTotalComSP);
  console.log('Difference:', rawShopeeTotal - totalComSP);

  console.log('calculateMetrics - uniqueShopeeOrders count:', uniqueShopeeOrders.size);
  console.log('calculateMetrics - totalComSP:', totalComSP);
  console.log('calculateMetrics - roundedTotalComSP:', roundedTotalComSP);
  console.log('🔍 SHOPEE DEBUG - filteredShopeeOrders.length:', filteredShopeeOrders.length);
  
  // Debug: Show unique order IDs for verification
  console.log('🔍 UNIQUE ORDER IDs:', Array.from(uniqueShopeeOrders.keys()));
  
  // Debug: Count cancelled orders
  const cancelledOrders = filteredShopeeOrders.filter(order => {
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    return orderStatus === 'ยกเลิก' || orderStatus === 'cancelled';
  });
  console.log('🔍 CANCELLED ORDERS COUNT:', cancelledOrders.length);
  console.log('🔍 CANCELLED ORDER STATUSES:', [...new Set(cancelledOrders.map(order => order['สถานะการสั่งซื้อ'] || order['สถานะ']))]);
  
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
  
  // เปลี่ยนจากการใช้ 'ยอดขายสินค้าโดยรวม(฿)' เป็น 'มูลค่าซื้อ(฿)'
  const totalAmountSP = Array.from(uniqueShopeeOrders.values()).reduce((sum, order) => {
    return sum + (typeof order['มูลค่าซื้อ(฿)'] === 'number' 
      ? order['มูลค่าซื้อ(฿)'] 
      : parseNumber(order['มูลค่าซื้อ(฿)']));
  }, 0);

  // Calculate Lazada metrics according to new specifications
  // Filter orders by Status='Fulfilled' or 'Delivered' and Validity='valid' - using actual Lazada column names
  const fulfilledValidOrders = filteredLazadaOrders.filter(order => 
    (order['Status'] === 'Fulfilled' || order['Status'] === 'Delivered') &&
    order['Validity'] === 'valid'
  );

  // "Units" - Count rows that pass filtering (1 row = 1 unit)
  const unitsLZD = fulfilledValidOrders.length;

  // "Order LZD" (Total Orders) - Count distinct SKU-level orders using Sku Order ID field
  const uniqueSkuOrders = new Set();
  fulfilledValidOrders.forEach(order => {
    uniqueSkuOrders.add(order['Sku Order ID']);
  });
  const totalOrdersLZD = uniqueSkuOrders.size;

  // "Com LZD" (Total Commission) - Sum Payout for filtered orders
  const totalComLZD = fulfilledValidOrders.reduce((sum, order) => {
    return sum + parseNumber(order['Payout']);
  }, 0);
  
  // Debug: Show calculation details
  console.log('🔍 LAZADA CALCULATION DEBUG:');
  console.log('Filtered orders (Fulfilled + Valid):', fulfilledValidOrders.length);
  console.log('Unique SKU orders:', totalOrdersLZD);
  console.log('Units (total rows):', unitsLZD);
  console.log('Total commission:', totalComLZD);

  const totalAmountLZD = fulfilledValidOrders.reduce((sum, order) => {
    return sum + parseNumber(order['Order Amount']);
  }, 0);

  // Separate valid and invalid orders for Lazada (keeping existing logic for compatibility)
  const validOrdersLZD = fulfilledValidOrders.length;
  
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
    totalComSP: roundedTotalComSP, // ใช้ค่าที่ปัดเศษแล้ว
    totalComLZD,
    totalCom: roundedTotalComSP + totalComLZD, // รวมค่าที่ปัดเศษแล้ว
    totalOrdersSP,
    totalOrdersLZD,
    totalAmountSP,
    totalAmountLZD,
    profit: (roundedTotalComSP + totalComLZD) - totalAdsSpent, // คำนวณ profit ใหม่
    roi: totalAdsSpent > 0 ? (((roundedTotalComSP + totalComLZD) - totalAdsSpent) / totalAdsSpent) * 100 : 0, // คำนวณ ROI ใหม่
    cpoSP,
    cpoLZD,
    cpcLink: avgCpcLink,
    apcLZD,
    validOrdersLZD,
    invalidOrdersLZD,
    totalLinkClicks,
    totalReach,
    totalRevenue: roundedTotalComSP + totalComLZD, // ใช้ค่าที่ปัดเศษแล้ว
    totalProfit: (roundedTotalComSP + totalComLZD) - totalAdsSpent, // คำนวณ profit ใหม่
    revenueChange: 0,
    profitChange: 0,
    roiChange: 0,
    ordersChange: 0,
    unitsLZD // New field for Units calculation
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
  ordersSP: number; // เพิ่มฟิลด์สำหรับนับ Shopee orders
  ordersLZD: number; // เพิ่มฟิลด์สำหรับนับ Lazada orders
}

export function analyzeDailyPerformance(
  shopeeOrders: ShopeeOrder[],
  lazadaOrders: LazadaOrder[],
  facebookAds: FacebookAd[]
): DailyMetrics[] {
  console.log('🔍 analyzeDailyPerformance called with:', {
    shopeeCount: shopeeOrders.length,
    lazadaCount: lazadaOrders.length,
    facebookCount: facebookAds.length
  });
  
  // Debug: Log first few Shopee orders
  console.log('🔍 FIRST 3 SHOPEE ORDERS:', shopeeOrders.slice(0, 3).map(order => ({
    orderId: order['รหัสการสั่งซื้อ'],
    timeOrder: order['เวลาที่สั่งซื้อ'],
    dateOrder: order['วันที่สั่งซื้อ'],
    status: order['สถานะการสั่งซื้อ'] || order['สถานะ'],
    commission: order['คอมมิชชั่นสินค้าโดยรวม(฿)']
  })));

  // Debug: Check if Shopee orders have valid dates
  const ordersWithValidDates = shopeeOrders.filter(order => {
    const possibleDateColumns = ['เวลาที่สั่งซื้อ', 'วันที่สั่งซื้อ', 'Order Time', 'Order Date', 'Date'];
    for (const column of possibleDateColumns) {
      if (order[column]) {
        try {
          const parsedDate = new Date(order[column]);
          if (!isNaN(parsedDate.getTime())) {
            return true;
          }
        } catch (e) {
          continue;
        }
      }
    }
    return false;
  });

  console.log('🔍 SHOPEE ORDERS WITH VALID DATES:', {
    total: shopeeOrders.length,
    withValidDates: ordersWithValidDates.length,
    withoutValidDates: shopeeOrders.length - ordersWithValidDates.length
  });
  
  const dailyMap: { [key: string]: DailyMetrics } = {};

  // Helper function to parse dates more reliably
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    try {
      const trimmed = dateStr.trim();
      
      // Handle Thai date format (DD/MM/YYYY or DD/MM/YYYY HH:mm:ss)
      if (trimmed.includes('/')) {
        const [datePart] = trimmed.split(' '); // Remove time part if exists
        const parts = datePart.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = parseInt(parts[2]);
          
          // Validate date parts
          if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2000) {
            return new Date(year, month, day);
          }
        }
      }
      
      // Handle ISO format (YYYY-MM-DD or YYYY-MM-DD HH:mm:ss)
      if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [datePart] = trimmed.split(' '); // Remove time part if exists
        const [year, month, day] = datePart.split('-').map(Number);
        
        // Validate date parts
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000) {
          return new Date(year, month - 1, day); // month is 0-indexed
        }
      }
      
      // Try native Date parsing as fallback
      const nativeDate = new Date(trimmed);
      if (!isNaN(nativeDate.getTime()) && nativeDate.getFullYear() >= 2000) {
        return nativeDate;
      }
      
      return null;
    } catch (error) {
      console.log('🔍 DATE PARSING ERROR:', error, 'for value:', dateStr);
      return null;
    }
  };

  // Process Facebook Ads
  console.log('🔍 Processing Facebook Ads...');
  facebookAds.forEach((ad, index) => {
    const dateStr = ad['Day'] || ad['Date'];
    console.log(`🔍 FB Ad ${index}: dateStr = "${dateStr}", amount = "${ad['Amount spent (THB)']}"`);
    
    if (dateStr) {
      const adDate = parseDate(dateStr);
      
      if (adDate) {
        // Use local date instead of UTC to avoid timezone issues
        const year = adDate.getFullYear();
        const month = String(adDate.getMonth() + 1).padStart(2, '0');
        const day = String(adDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        console.log(`🔍 FB Ad ${index}: parsed date = ${dateKey}`);
        
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = {
            date: dateKey,
            totalCom: 0,
            adSpend: 0,
            profit: 0,
            roi: 0,
            ordersSP: 0,
            ordersLZD: 0
          };
        }
        
        const adSpend = parseNumber(ad['Amount spent (THB)']);
        dailyMap[dateKey].adSpend += adSpend;
        console.log(`🔍 FB Ad ${index}: added ${adSpend} to ${dateKey}, total now: ${dailyMap[dateKey].adSpend}`);
      } else {
        console.log(`🔍 FB Ad ${index}: failed to parse date "${dateStr}"`);
      }
    }
  });

  // Process Shopee orders - combine commission for same order ID
  const orderCommissionMap = new Map();
  shopeeOrders.forEach(order => {
    const orderId = order['รหัสการสั่งซื้อ'];
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    
    // ข้ามออเดอร์ที่ยกเลิก
    if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
      return;
    }
    
    const commission = parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    
    if (!orderCommissionMap.has(orderId)) {
      orderCommissionMap.set(orderId, {
        order: order,
        totalCommission: commission
      });
    } else {
      // Add commission to existing order
      const existing = orderCommissionMap.get(orderId);
      existing.totalCommission += commission;
    }
  });
  
  console.log('🔍 ORDER COMMISSION SUMMARY:', {
    totalOrders: shopeeOrders.length,
    uniqueOrders: orderCommissionMap.size,
    uniqueOrderIds: Array.from(orderCommissionMap.keys())
  });

  console.log('🔍 Processing Shopee orders...');
  Array.from(orderCommissionMap.values()).forEach(({ order, totalCommission }, index) => {
    const possibleDateColumns = ['เวลาที่สั่งซื้อ', 'วันที่สั่งซื้อ', 'Order Time', 'Order Date', 'Date'];
    let orderDate = null;
    let dateKey = null;
    
    console.log(`🔍 Shopee Order ${index}: orderId = ${order['รหัสการสั่งซื้อ']}, commission = ${totalCommission}`);
    
    // Try to parse date from multiple columns with better date parsing
    for (const column of possibleDateColumns) {
      if (order[column]) {
        console.log(`🔍 Shopee Order ${index}: trying column "${column}" = "${order[column]}"`);
        
        orderDate = parseDate(order[column]);
        if (orderDate) {
          // Use local date instead of UTC to avoid timezone issues
          const year = orderDate.getFullYear();
          const month = String(orderDate.getMonth() + 1).padStart(2, '0');
          const day = String(orderDate.getDate()).padStart(2, '0');
          dateKey = `${year}-${month}-${day}`;
          
          console.log(`🔍 Shopee Order ${index}: parsed date = ${dateKey}`);
          break;
        }
      }
    }
    
    // If no valid date found, skip this order instead of using fallback
    if (!dateKey) {
      console.log(`🔍 Shopee Order ${index}: NO VALID DATE FOUND, skipping order`);
      return;
    }
    
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        date: dateKey,
        totalCom: 0,
        adSpend: 0,
        profit: 0,
        roi: 0,
        ordersSP: 0,
        ordersLZD: 0
      };
    }
    
    dailyMap[dateKey].totalCom += totalCommission;
    dailyMap[dateKey].ordersSP += 1; // เพิ่มการนับ Shopee orders
    
    console.log(`🔍 Shopee Order ${index}: added ${totalCommission} to ${dateKey}, total now: ${dailyMap[dateKey].totalCom}`);
  });

  // Process Lazada orders with new filtering logic
  const fulfilledValidLazadaOrders = lazadaOrders.filter(order => 
    (order['Status'] === 'Fulfilled' || order['Status'] === 'Delivered') &&
    order['Validity'] === 'valid'
  );

  // Count unique SKU orders for Lazada
  const uniqueSkuOrders = new Set();
  fulfilledValidLazadaOrders.forEach(order => {
    uniqueSkuOrders.add(order['Sku Order ID']);
  });

  console.log('🔍 Processing Lazada orders...');
  fulfilledValidLazadaOrders.forEach((order, index) => {
    const dateStr = order['Conversion Time'] || order['Order Time'];
    console.log(`🔍 Lazada Order ${index}: dateStr = "${dateStr}", payout = "${order['Payout']}"`);
    
    if (dateStr) {
      const orderDate = parseDate(dateStr);
      
      if (orderDate) {
        // Use local date instead of UTC to avoid timezone issues
        const year = orderDate.getFullYear();
        const month = String(orderDate.getMonth() + 1).padStart(2, '0');
        const day = String(orderDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        console.log(`🔍 Lazada Order ${index}: parsed date = ${dateKey}`);
        
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = {
            date: dateKey,
            totalCom: 0,
            adSpend: 0,
            profit: 0,
            roi: 0,
            ordersSP: 0,
            ordersLZD: 0
          };
        }
        
        const payout = parseNumber(order['Payout']);
        dailyMap[dateKey].totalCom += payout;
        dailyMap[dateKey].ordersLZD += 1; // เพิ่มการนับ Lazada orders
        
        console.log(`🔍 Lazada Order ${index}: added ${payout} to ${dateKey}, total now: ${dailyMap[dateKey].totalCom}`);
      } else {
        console.log(`🔍 Lazada Order ${index}: failed to parse date "${dateStr}"`);
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
    sampleData: result.slice(0, 3),
    totalCom: result.reduce((sum, day) => sum + day.totalCom, 0),
    totalAdSpend: result.reduce((sum, day) => sum + day.adSpend, 0),
    totalOrdersSP: result.reduce((sum, day) => sum + day.ordersSP, 0)
  });
  
  if (result.length === 0) {
    console.log('⚠️ WARNING: No daily metrics generated! This might be due to:');
    console.log('   - No valid dates in Shopee orders');
    console.log('   - No Facebook ads data');
    console.log('   - All orders are cancelled');
  }
  
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
    const orderId = order['รหัสการสั่งซื้อ'];
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    
    // ข้ามออเดอร์ที่ยกเลิก
    if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
      return;
    }
    
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

  // Process Lazada orders with new filtering logic
  const fulfilledValidLazadaOrders = lazadaOrders.filter(order => 
    order['Status'] === 'Fulfilled' &&
    order['Validity'] === 'valid'
  );

  fulfilledValidLazadaOrders.forEach((order) => {
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
  // Count unique Shopee orders - ใช้ 'รหัสการสั่งซื้อ' และไม่นับออเดอร์ที่ยกเลิก
  const uniqueShopeeOrders = new Set();
  let shopeeCommission = 0;
  
  shopeeOrders.forEach(order => {
    const orderId = order['รหัสการสั่งซื้อ'];
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    
    // ข้ามออเดอร์ที่ยกเลิก
    if (orderStatus !== 'ยกเลิก' && orderStatus !== 'cancelled') {
      uniqueShopeeOrders.add(orderId);
      shopeeCommission += parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
    }
  });
  
  const shopeeOrdersCount = uniqueShopeeOrders.size;
  const shopeeROI = totalAdsSpent > 0 ? (shopeeCommission / totalAdsSpent) * 100 : 0;

  // Count Lazada orders with new filtering logic
  const fulfilledValidLazadaOrders = lazadaOrders.filter(order => 
    (order['Status'] === 'Fulfilled' || order['Status'] === 'Delivered') &&
    order['Validity'] === 'valid'
  );
  
  // Count unique SKU orders for Lazada
  const uniqueSkuOrders = new Set();
  fulfilledValidLazadaOrders.forEach(order => {
    uniqueSkuOrders.add(order['Sku Order ID']);
  });
  
  const lazadaCommission = fulfilledValidLazadaOrders.reduce((sum, order) => {
    return sum + parseNumber(order['Payout']);
  }, 0);
  const lazadaOrdersCount = uniqueSkuOrders.size;
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

// รวมยอดคอมมิชชั่น Shopee ทุกแถว (ไม่ deduplicate แต่ไม่นับออเดอร์ที่ยกเลิก)
export function sumShopeeCommissionRaw(shopeeOrders: ShopeeOrder[]): number {
  return shopeeOrders.reduce((sum, order) => {
    const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
    
    // ข้ามออเดอร์ที่ยกเลิก
    if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
      return sum;
    }
    
    return sum + parseNumber(order['คอมมิชชั่นสินค้าโดยรวม(฿)']);
  }, 0);
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
      const orderId = order['รหัสการสั่งซื้อ'];
      const orderStatus = order['สถานะการสั่งซื้อ'] || order['สถานะ'];
      
      // ข้ามออเดอร์ที่ยกเลิก
      if (orderStatus === 'ยกเลิก' || orderStatus === 'cancelled') {
        return;
      }
      
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
      const dateStr = order['เวลาที่สั่งซื้อ'] || order['วันที่สั่งซื้อ'] || '';
      let orderDate: Date;
      
      if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        orderDate = new Date(year, month - 1, day);
      } else {
        orderDate = new Date(dateStr);
      }
      
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
      startDate: `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}-${String(latestDate.getDate()).padStart(2, '0')}`,
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
      const dateStr = order['Order Time'] || '';
      let orderDate: Date;
      
      if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        orderDate = new Date(year, month - 1, day);
      } else {
        orderDate = new Date(dateStr);
      }
      
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
      startDate: `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}-${String(latestDate.getDate()).padStart(2, '0')}`,
      performance: getPerformanceLabel(roi)
    });
  });

  return campaigns.sort((a, b) => b.commission - a.commission);
}
