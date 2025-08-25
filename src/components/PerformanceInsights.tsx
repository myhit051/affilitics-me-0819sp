import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award,
  AlertCircle,
  Calendar,
  Filter,
  ArrowRight,
  Star,
  Zap,
  Clock,
  DollarSign,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerformanceMetric {
  id: string;
  name: string;
  currentValue: number;
  benchmarkValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  category: 'roi' | 'cost' | 'volume' | 'efficiency';
  priority: 'high' | 'medium' | 'low';
}

export interface BenchmarkData {
  period: string;
  label: string;
  metrics: PerformanceMetric[];
}

export interface TopPerformer {
  id: string;
  name: string;
  type: 'subid' | 'platform' | 'timeperiod' | 'category';
  value: number;
  unit: string;
  improvement: number;
  description: string;
}

export interface InsightData {
  id: string;
  title: string;
  description: string;
  type: 'pattern' | 'opportunity' | 'risk' | 'benchmark';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations?: string[];
}

interface PerformanceInsightsProps {
  benchmarkPeriod?: 'week' | 'month' | 'quarter';
  showTopPerformers?: boolean;
  showPatterns?: boolean;
  maxInsights?: number;
}

// Mock data generators
const generateMockMetrics = (): PerformanceMetric[] => [
  {
    id: '1',
    name: 'Overall ROI',
    currentValue: 156,
    benchmarkValue: 142,
    unit: '%',
    trend: 'up',
    changePercent: 9.9,
    category: 'roi',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Cost Per Order',
    currentValue: 45,
    benchmarkValue: 52,
    unit: '฿',
    trend: 'down',
    changePercent: -13.5,
    category: 'cost',
    priority: 'high'
  },
  {
    id: '3',
    name: 'Daily Orders',
    currentValue: 127,
    benchmarkValue: 98,
    unit: 'orders',
    trend: 'up',
    changePercent: 29.6,
    category: 'volume',
    priority: 'medium'
  },
  {
    id: '4',
    name: 'Conversion Rate',
    currentValue: 3.2,
    benchmarkValue: 2.8,
    unit: '%',
    trend: 'up',
    changePercent: 14.3,
    category: 'efficiency',
    priority: 'medium'
  },
  {
    id: '5',
    name: 'Ad Spend Efficiency',
    currentValue: 0.78,
    benchmarkValue: 0.65,
    unit: 'ratio',
    trend: 'up',
    changePercent: 20.0,
    category: 'efficiency',
    priority: 'high'
  }
];

const generateMockTopPerformers = (): TopPerformer[] => [
  {
    id: '1',
    name: 'SP001',
    type: 'subid',
    value: 234,
    unit: '%',
    improvement: 45,
    description: 'Sub ID ที่มีประสิทธิภาพสูงสุดในช่วง 7 วันที่ผ่านมา'
  },
  {
    id: '2',
    name: 'Shopee',
    type: 'platform',
    value: 167,
    unit: '%',
    improvement: 23,
    description: 'แพลตฟอร์มที่ให้ ROI สูงสุดเมื่อเทียบกับค่าเฉลี่ย'
  },
  {
    id: '3',
    name: '14:00-18:00',
    type: 'timeperiod',
    value: 189,
    unit: '%',
    improvement: 34,
    description: 'ช่วงเวลาที่มีประสิทธิภาพสูงสุดของวัน'
  },
  {
    id: '4',
    name: 'Electronics',
    type: 'category',
    value: 198,
    unit: '%',
    improvement: 28,
    description: 'หมวดหมู่สินค้าที่ให้ผลตอบแทนดีที่สุด'
  }
];

const generateMockInsights = (): InsightData[] => [
  {
    id: '1',
    title: 'รูปแบบการใช้จ่ายที่มีประสิทธิภาพ',
    description: 'AI พบว่าการใช้จ่ายโฆษณาในช่วง 10:00-14:00 ให้ ROI สูงกว่าเฉลี่ย 23%',
    type: 'pattern',
    confidence: 89,
    impact: 'high',
    actionable: true,
    recommendations: [
      'เพิ่มงบประมาณในช่วงเวลา 10:00-14:00',
      'ลดงบประมาณในช่วงเวลาที่มีประสิทธิภาพต่ำ',
      'ทดสอบการขยายเวลาไปยัง 09:00-15:00'
    ]
  },
  {
    id: '2',
    title: 'โอกาสในการปรับปรุง Sub ID',
    description: 'Sub ID LZD002 มีศักยภาพในการปรับปรุง ROI ได้อีก 15-20% หากปรับ targeting',
    type: 'opportunity',
    confidence: 76,
    impact: 'medium',
    actionable: true,
    recommendations: [
      'ปรับ audience targeting ให้แคบลง',
      'ทดสอบ creative ใหม่สำหรับ demographic หลัก',
      'เพิ่ม negative keywords เพื่อลดการแสดงผลที่ไม่เกี่ยวข้อง'
    ]
  },
  {
    id: '3',
    title: 'ความเสี่ยงจากการพึ่งพา Sub ID เดียว',
    description: 'Sub ID SP001 สร้างรายได้ 45% ของทั้งหมด ซึ่งอาจเป็นความเสี่ยงหากประสิทธิภาพลดลง',
    type: 'risk',
    confidence: 92,
    impact: 'high',
    actionable: true,
    recommendations: [
      'พัฒนา Sub ID อื่นๆ เพื่อกระจายความเสี่ยง',
      'ทดสอบ Sub ID ใหม่ในหมวดหมู่ที่คล้ายกัน',
      'สร้าง backup strategy สำหรับ Sub ID หลัก'
    ]
  },
  {
    id: '4',
    title: 'เปรียบเทียบกับช่วงเดียวกันปีที่แล้ว',
    description: 'ประสิทธิภาพโดยรวมดีขึ้น 34% เมื่อเทียบกับช่วงเดียวกันปีที่แล้ว',
    type: 'benchmark',
    confidence: 95,
    impact: 'medium',
    actionable: false,
    recommendations: [
      'รักษาระดับประสิทธิภาพปัจจุบัน',
      'วิเคราะห์ปัจจัยที่ทำให้ปรับปรุงได้',
      'ขยายผลสำเร็จไปยังแคมเปญอื่นๆ'
    ]
  }
];

export default function PerformanceInsights({
  benchmarkPeriod = 'month',
  showTopPerformers = true,
  showPatterns = true,
  maxInsights = 5
}: PerformanceInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'performers' | 'insights'>('metrics');
  
  const metrics = generateMockMetrics();
  const topPerformers = generateMockTopPerformers();
  const insights = generateMockInsights().slice(0, maxInsights);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'roi': return <TrendingUp className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'volume': return <BarChart3 className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'roi': return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'cost': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'volume': return 'text-purple-600 bg-purple-500/10 border-purple-500/20';
      case 'efficiency': return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
      default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subid': return <Target className="h-4 w-4" />;
      case 'platform': return <BarChart3 className="h-4 w-4" />;
      case 'timeperiod': return <Clock className="h-4 w-4" />;
      case 'category': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <Activity className="h-4 w-4" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'risk': return <AlertCircle className="h-4 w-4" />;
      case 'benchmark': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'opportunity': return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'risk': return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'benchmark': return 'text-purple-600 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === '฿') {
      return `฿${value.toLocaleString('th-TH')}`;
    } else if (unit === 'orders') {
      return `${value} orders`;
    } else if (unit === 'ratio') {
      return value.toFixed(2);
    }
    return value.toString();
  };

  const getBenchmarkLabel = (period: string) => {
    switch (period) {
      case 'week': return 'สัปดาห์ที่แล้ว';
      case 'month': return 'เดือนที่แล้ว';
      case 'quarter': return 'ไตรมาสที่แล้ว';
      default: return 'ช่วงก่อนหน้า';
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  return (
    <Card className="modern-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Performance Insights</CardTitle>
              <p className="text-sm text-muted-foreground">การวิเคราะห์ประสิทธิภาพด้วย AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              เทียบกับ{getBenchmarkLabel(benchmarkPeriod)}
            </Badge>
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="h-3 w-3 mr-1" />
              ตัวกรอง
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={selectedTab === 'metrics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('metrics')}
            className="text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            เมตริก
          </Button>
          {showTopPerformers && (
            <Button
              variant={selectedTab === 'performers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('performers')}
              className="text-xs"
            >
              <Award className="h-3 w-3 mr-1" />
              ผู้นำ
            </Button>
          )}
          {showPatterns && (
            <Button
              variant={selectedTab === 'insights' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('insights')}
              className="text-xs"
            >
              <Star className="h-3 w-3 mr-1" />
              ข้อมูลเชิงลึก
            </Button>
          )}
        </div>

        {/* Metrics Tab */}
        {selectedTab === 'metrics' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                ทั้งหมด
              </Button>
              {['roi', 'cost', 'volume', 'efficiency'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1 capitalize">{category}</span>
                </Button>
              ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    getCategoryColor(metric.category)
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(metric.category)}
                      <h4 className="font-medium text-sm">{metric.name}</h4>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        metric.priority === 'high' ? 'border-red-500/50 text-red-600' :
                        metric.priority === 'medium' ? 'border-yellow-500/50 text-yellow-600' :
                        'border-green-500/50 text-green-600'
                      )}
                    >
                      {metric.priority}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">ปัจจุบัน</span>
                      <span className="font-semibold">
                        {formatValue(metric.currentValue, metric.unit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">เปรียบเทียบ</span>
                      <span className="text-sm">
                        {formatValue(metric.benchmarkValue, metric.unit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">เปลี่ยนแปลง</span>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : (
                          <ArrowRight className="h-3 w-3 text-gray-500" />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          metric.changePercent > 0 ? "text-green-600" : 
                          metric.changePercent < 0 ? "text-red-600" : "text-gray-600"
                        )}>
                          {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers Tab */}
        {selectedTab === 'performers' && showTopPerformers && (
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div
                key={performer.id}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-orange-600 text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      {getTypeIcon(performer.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{performer.name}</h4>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {performer.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {performer.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">ค่า: </span>
                          <span className="font-medium">
                            {formatValue(performer.value, performer.unit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ปรับปรุง: </span>
                          <span className="font-medium text-green-600">
                            +{performer.improvement}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-xs">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insights Tab */}
        {selectedTab === 'insights' && showPatterns && (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "p-4 rounded-lg border",
                  getInsightColor(insight.type)
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {insight.confidence}% แม่นยำ
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    
                    <Badge
                      className={cn(
                        "text-xs",
                        insight.impact === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        insight.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                        'bg-green-500/10 text-green-600 border-green-500/20'
                      )}
                      variant="outline"
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>

                  {insight.recommendations && insight.actionable && (
                    <div className="pt-2 border-t border-current/10">
                      <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        คำแนะนำ:
                      </h5>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="text-xs flex items-start gap-2">
                            <div className="w-3 h-3 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-medium mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>อัปเดตล่าสุด: เมื่อสักครู่</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{filteredMetrics.length} เมตริก</span>
              {showTopPerformers && <span>{topPerformers.length} ผู้นำ</span>}
              {showPatterns && <span>{insights.length} ข้อมูลเชิงลึก</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}