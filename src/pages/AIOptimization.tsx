import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Brain,
  TrendingUp, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Lightbulb,
  Zap,
  RefreshCw,
  Settings,
  Download
} from "lucide-react";
import { useImportedData } from "@/hooks/useImportedData";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import PredictionChart from "@/components/PredictionChart";
import RecommendationCard, { RecommendationData } from "@/components/RecommendationCard";

// Mock recommendations data (will be replaced with real AI service)
const mockRecommendations: RecommendationData[] = [
  {
    id: '1',
    type: 'budget',
    title: 'เพิ่มงบประมาณ Sub ID: SP001',
    description: 'Sub ID นี้มี ROI สูงสุด (245%) และมีแนวโน้มเติบโตต่อเนื่อง แนะนำเพิ่มงบ 30% เพื่อเพิ่มกำไร',
    impact: 'high',
    confidence: 92,
    expectedROI: 245,
    priority: 3,
    details: [
      'ROI ปัจจุบัน: 245% (สูงกว่าเฉลี่ย 89%)',
      'Conversion rate: 8.5% (สูงกว่าเฉลี่ย 3.2%)',
      'Cost per order: ฿85 (ต่ำกว่าเฉลี่ย 45%)',
      'แนวโน้ม 7 วันที่ผ่านมา: เพิ่มขึ้น 15%'
    ],
    actionItems: [
      'เพิ่มงบประมาณจาก ฿5,000 เป็น ฿6,500 ต่อวัน',
      'ขยายเวลาการแสดงโฆษณาในช่วง peak hours (14:00-18:00)',
      'ทดสอบ creative ใหม่ที่คล้ายกับ top performing ads',
      'ติดตามผลลัพธ์และปรับงบตามประสิทธิภาพ'
    ]
  },
  {
    id: '2',
    type: 'platform',
    title: 'ปรับกลยุทธ์ Facebook Ads',
    description: 'ประสิทธิภาพ Facebook Ads ลดลง 15% ในสัปดาห์ที่ผ่านมา เนื่องจาก CPM เพิ่มขึ้นและ CTR ลดลง',
    impact: 'medium',
    confidence: 78,
    expectedROI: -15,
    priority: 2,
    details: [
      'CPM เพิ่มขึ้น 25% จาก ฿45 เป็น ฿56',
      'CTR ลดลง 18% จาก 2.8% เป็น 2.3%',
      'CPC เพิ่มขึ้น 32% จาก ฿1.2 เป็น ฿1.6',
      'Frequency เพิ่มขึ้นเป็น 3.2 (สูงกว่าที่แนะนำ)'
    ],
    actionItems: [
      'ลดงบประมาณ Facebook Ads ลง 20% ชั่วคราว',
      'สร้าง creative ใหม่เพื่อลด ad fatigue',
      'ปรับ targeting เพื่อหา audience ใหม่',
      'ทดสอบ placement ใหม่ (Stories, Reels)',
      'พิจารณาเปลี่ยนไปใช้ Shopee/Lazada Ads มากขึ้น'
    ]
  },
  {
    id: '3',
    type: 'timing',
    title: 'เพิ่มงบช่วงเวลา Golden Hours',
    description: 'การวิเคราะห์พบว่าช่วง 14:00-18:00 มี conversion rate สูงกว่าเฉลี่ย 35% แต่งบประมาณยังไม่เพียงพอ',
    impact: 'medium',
    confidence: 85,
    expectedROI: 35,
    priority: 2,
    details: [
      'Conversion rate ช่วง 14:00-18:00: 6.8%',
      'Conversion rate เฉลี่ยทั้งวัน: 4.2%',
      'งบประมาณปัจจุบันในช่วงนี้: 25% ของงบรวม',
      'โอกาสที่พลาด: ประมาณ 45 orders ต่อวัน'
    ],
    actionItems: [
      'เพิ่มงบประมาณช่วง 14:00-18:00 เป็น 40% ของงบรวม',
      'ตั้ง dayparting ใน Facebook Ads Manager',
      'ปรับ bid strategy เป็น highest volume ในช่วงนี้',
      'ติดตาม performance และปรับแต่งต่อไป'
    ]
  },
  {
    id: '4',
    type: 'subid',
    title: 'หยุด Sub ID ที่ขาดทุน: FB002',
    description: 'Sub ID FB002 มี ROI ติดลบ -12% และแนวโน้มแย่ลงต่อเนื่อง ควรหยุดหรือปรับปรุงทันที',
    impact: 'high',
    confidence: 88,
    expectedROI: -12,
    priority: 3,
    details: [
      'ROI ปัจจุบัน: -12% (ขาดทุน ฿2,400 ใน 7 วัน)',
      'Cost per order: ฿180 (สูงกว่าเฉลี่ย 95%)',
      'Conversion rate: 1.8% (ต่ำกว่าเฉลี่ย 57%)',
      'แนวโน้ม: แย่ลงต่อเนื่อง 3 สัปดาห์'
    ],
    actionItems: [
      'หยุด Sub ID FB002 ทันที',
      'วิเคราะห์สาเหตุที่ประสิทธิภาพแย่',
      'ทดสอบ creative และ targeting ใหม่',
      'ถ้าไม่ดีขึ้นใน 3 วัน ให้ปิดถาวร',
      'นำงบไปใช้กับ Sub ID ที่มีประสิทธิภาพดีกว่า'
    ]
  },
  {
    id: '5',
    type: 'creative',
    title: 'อัพเดท Creative สำหรับ Lazada',
    description: 'Creative ปัจจุบันสำหรับ Lazada มี CTR ลดลงต่อเนื่อง แนะนำสร้าง creative ใหม่ตามเทรนด์ที่กำลังมาแรง',
    impact: 'low',
    confidence: 72,
    expectedROI: 18,
    priority: 1,
    details: [
      'CTR ลดลง 22% ในเดือนที่ผ่านมา',
      'Creative อายุ 45 วัน (แนะนำเปลี่ยนทุก 30 วัน)',
      'Engagement rate ลดลง 15%',
      'เทรนด์ใหม่: Video ads มี performance ดีกว่า static 40%'
    ],
    actionItems: [
      'สร้าง video creative 3-5 รูปแบบใหม่',
      'ใช้ trending audio และ effects',
      'ทดสอบ UGC (User Generated Content) style',
      'A/B test กับ creative เดิมเป็นเวลา 7 วัน',
      'เก็บ creative ที่ performance ดีที่สุด'
    ]
  }
];

export default function AIOptimization() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  
  const { 
    hasData, 
    calculatedMetrics, 
    dailyMetrics,
    importedData 
  } = useImportedData();

  // Simulate AI analysis
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const progressSteps = [
      { step: 'กำลังโหลดข้อมูล...', progress: 20 },
      { step: 'วิเคราะห์ประสิทธิภาพ Sub ID...', progress: 40 },
      { step: 'ประเมินแนวโน้มและรูปแบบ...', progress: 60 },
      { step: 'สร้างคำแนะนำ...', progress: 80 },
      { step: 'เสร็จสิ้น!', progress: 100 }
    ];

    for (const { progress } of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(progress);
    }
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }, 500);
  };

  const handleRecommendationAccept = (id: string) => {
    console.log('Accepted recommendation:', id);
    // TODO: Implement recommendation acceptance logic
  };

  const handleRecommendationReject = (id: string) => {
    console.log('Rejected recommendation:', id);
    // TODO: Implement recommendation rejection logic
  };

  const handleRecommendationFeedback = (id: string, feedback: 'positive' | 'negative') => {
    console.log('Feedback for recommendation:', id, feedback);
    // TODO: Implement feedback collection logic
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const getStatValue = (key: string, defaultValue: number = 0) => {
    if (hasData && calculatedMetrics) {
      const value = calculatedMetrics[key as keyof typeof calculatedMetrics];
      return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
    }
    return defaultValue;
  };

  // Show empty state if no data
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">🤖</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Campaign Optimization
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            นำเข้าข้อมูลแคมเปญของคุณก่อนเพื่อให้ AI สามารถวิเคราะห์และให้คำแนะนำที่เป็นประโยชน์
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = "/import"} 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 border-0"
            >
              <Brain className="mr-3 h-6 w-6" />
              เริ่มต้นใช้ AI
            </Button>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                🎯 Smart Recommendations
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                📈 Performance Predictions
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                💡 Optimization Insights
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30">
            <Brain className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Campaign Optimization
            </h1>
            <p className="text-muted-foreground">
              ข้อมูลเชิงลึกและคำแนะนำจาก AI เพื่อเพิ่มประสิทธิภาพแคมเปญของคุณ
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            ตั้งค่า AI
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export รายงาน
          </Button>
          <Button 
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                วิเคราะห์...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                วิเคราะห์ใหม่
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              <div className="flex-1">
                <h3 className="font-medium mb-2">กำลังวิเคราะห์ข้อมูลด้วย AI...</h3>
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {analysisProgress}% เสร็จสิ้น
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall ROI</p>
                <p className="text-2xl font-bold text-green-600">
                  {getStatValue('roi', 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sub IDs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {importedData?.shopeeOrders?.length ? 
                    [...new Set([
                      ...importedData.shopeeOrders.map(o => o.sub_id),
                      ...importedData.lazadaOrders?.map(o => o['Sub ID']) || [],
                      ...importedData.facebookAds?.map(o => o['Sub ID']) || []
                    ])].length : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Recommendations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockRecommendations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockRecommendations.filter(r => r.expectedROI < 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecommendations.slice(0, 3).map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAccept={handleRecommendationAccept}
                  onReject={handleRecommendationReject}
                  onFeedback={handleRecommendationFeedback}
                  compact={true}
                />
              ))}
              <Button variant="outline" className="w-full">
                ดูคำแนะนำทั้งหมด ({mockRecommendations.length})
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictions */}
        <div className="space-y-6">
          <PredictionChart 
            title="ROI Prediction"
            metric="ROI"
            currentValue={getStatValue('roi', 0)}
            predictedValue={getStatValue('roi', 0) * 1.15}
            confidence={87}
            trend="up"
            timeframe="7 วันข้างหน้า"
            unit="%"
          />
        </div>
      </div>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            คำแนะนำทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onAccept={handleRecommendationAccept}
              onReject={handleRecommendationReject}
              onFeedback={handleRecommendationFeedback}
              compact={false}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}