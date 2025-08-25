import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data interfaces (will be replaced with real AI services later)
interface AIRecommendation {
  id: string;
  type: 'budget' | 'subid' | 'platform' | 'timing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  expectedROI: number;
  priority: number;
}

interface AIPrediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
}

interface AIInsight {
  id: string;
  category: 'performance' | 'opportunity' | 'warning';
  title: string;
  description: string;
  value: string;
  change?: number;
}

// Mock data (will be replaced with real AI analysis)
const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'budget',
    title: 'เพิ่มงบ Sub ID: SP001',
    description: 'Sub ID นี้มี ROI สูงสุด (245%) แนะนำเพิ่มงบ 30% เพื่อเพิ่มกำไร',
    impact: 'high',
    confidence: 92,
    expectedROI: 245,
    priority: 1
  },
  {
    id: '2',
    type: 'platform',
    title: 'ลดงบ Facebook Ads',
    description: 'ประสิทธิภาพ Facebook ลดลง 15% ในสัปดาห์ที่ผ่านมา',
    impact: 'medium',
    confidence: 78,
    expectedROI: -15,
    priority: 2
  },
  {
    id: '3',
    type: 'timing',
    title: 'เพิ่มงบช่วง 14:00-18:00',
    description: 'ช่วงเวลานี้มี conversion rate สูงกว่าเฉลี่ย 35%',
    impact: 'medium',
    confidence: 85,
    expectedROI: 35,
    priority: 3
  }
];

const mockPredictions: AIPrediction[] = [
  {
    metric: 'ROI',
    current: 156,
    predicted: 178,
    confidence: 87,
    trend: 'up',
    timeframe: '7 วันข้างหน้า'
  },
  {
    metric: 'Total Commission',
    current: 45600,
    predicted: 52300,
    confidence: 82,
    trend: 'up',
    timeframe: '7 วันข้างหน้า'
  },
  {
    metric: 'Ad Spend',
    current: 28900,
    predicted: 31200,
    confidence: 90,
    trend: 'up',
    timeframe: '7 วันข้างหน้า'
  }
];

const mockInsights: AIInsight[] = [
  {
    id: '1',
    category: 'performance',
    title: 'Top Performer',
    description: 'Sub ID ที่ดีที่สุด',
    value: 'SP001 (ROI 245%)',
    change: 12
  },
  {
    id: '2',
    category: 'opportunity',
    title: 'Growth Opportunity',
    description: 'แพลตฟอร์มที่มีโอกาสเติบโต',
    value: 'Lazada (+35%)',
    change: 35
  },
  {
    id: '3',
    category: 'warning',
    title: 'Needs Attention',
    description: 'Sub ID ที่ต้องปรับปรุง',
    value: 'FB002 (ROI -12%)',
    change: -12
  }
];

export default function AIInsightsPanel() {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'predictions' | 'insights'>('recommendations');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'budget': return <Target className="h-4 w-4" />;
      case 'subid': return <BarChart3 className="h-4 w-4" />;
      case 'platform': return <Zap className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'performance': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <Card className="modern-card bg-gradient-to-br from-purple-500/10 to-blue-600/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
              <p className="text-sm text-muted-foreground">ข้อมูลเชิงลึกและคำแนะนำจาก AI</p>
            </div>
          </div>
          <Button 
            onClick={simulateAnalysis}
            disabled={isAnalyzing}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                วิเคราะห์...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                วิเคราะห์ใหม่
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('recommendations')}
            className={cn(
              "flex-1 text-xs",
              activeTab === 'recommendations' && "bg-background shadow-sm"
            )}
          >
            <Target className="h-3 w-3 mr-1" />
            คำแนะนำ
          </Button>
          <Button
            variant={activeTab === 'predictions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('predictions')}
            className={cn(
              "flex-1 text-xs",
              activeTab === 'predictions' && "bg-background shadow-sm"
            )}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            การทำนาย
          </Button>
          <Button
            variant={activeTab === 'insights' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('insights')}
            className={cn(
              "flex-1 text-xs",
              activeTab === 'insights' && "bg-background shadow-sm"
            )}
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            ข้อมูลเชิงลึก
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">คำแนะนำจาก AI</h3>
            {mockRecommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(rec.type)}
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(rec.impact)} variant="outline">
                      {rec.impact === 'high' ? 'สูง' : rec.impact === 'medium' ? 'กลาง' : 'ต่ำ'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.confidence}%
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Expected ROI: </span>
                    <span className={cn(
                      "font-medium",
                      rec.expectedROI > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {rec.expectedROI > 0 ? '+' : ''}{rec.expectedROI}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      ไม่สนใจ
                    </Button>
                    <Button size="sm" className="h-7 px-2 text-xs bg-gradient-to-r from-green-500 to-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ใช้คำแนะนำ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">การทำนายประสิทธิภาพ</h3>
            {mockPredictions.map((pred, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{pred.metric}</h4>
                  <Badge variant="outline" className="text-xs">
                    {pred.confidence}% แม่นยำ
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">ปัจจุบัน: </span>
                    <span className="font-medium">
                      {pred.metric === 'ROI' ? `${pred.current}%` : formatCurrency(pred.current)}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">ทำนาย: </span>
                    <span className={cn(
                      "font-medium",
                      pred.trend === 'up' ? "text-green-600" : pred.trend === 'down' ? "text-red-600" : "text-gray-600"
                    )}>
                      {pred.metric === 'ROI' ? `${pred.predicted}%` : formatCurrency(pred.predicted)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {pred.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : pred.trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <BarChart3 className="h-3 w-3 text-gray-500" />
                  )}
                  <span>{pred.timeframe}</span>
                </div>
                <Progress 
                  value={pred.confidence} 
                  className="mt-2 h-1"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">ข้อมูลเชิงลึก</h3>
            {mockInsights.map((insight) => (
              <div key={insight.id} className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.category)}
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                  </div>
                  {insight.change && (
                    <div className={cn(
                      "flex items-center text-xs font-medium",
                      insight.change > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {insight.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{Math.abs(insight.change)}%</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{insight.description}</p>
                <p className="text-sm font-medium">{insight.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="p-4 rounded-lg border bg-muted/50 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">กำลังวิเคราะห์ข้อมูลด้วย AI...</p>
            <Progress value={65} className="mt-2 h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}