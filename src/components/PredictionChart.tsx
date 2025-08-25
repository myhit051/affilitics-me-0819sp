import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionData {
  date: string;
  historical?: number;
  predicted?: number;
  confidenceUpper?: number;
  confidenceLower?: number;
  isHistorical: boolean;
}

interface PredictionChartProps {
  title?: string;
  metric?: string;
  data?: PredictionData[];
  currentValue?: number;
  predictedValue?: number;
  confidence?: number;
  trend?: 'up' | 'down' | 'stable';
  timeframe?: string;
  unit?: string;
  showConfidenceInterval?: boolean;
}

// Mock prediction data generator
const generateMockPredictionData = (
  metric: string,
  currentValue: number,
  predictedValue: number,
  days: number = 14
): PredictionData[] => {
  const data: PredictionData[] = [];
  const today = new Date();
  
  // Historical data (last 7 days)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic historical values with some variance
    const variance = currentValue * 0.1 * (Math.random() - 0.5);
    const historicalValue = currentValue + variance;
    
    data.push({
      date: date.toISOString().split('T')[0],
      historical: Math.max(0, historicalValue),
      isHistorical: true
    });
  }
  
  // Prediction data (next 7 days)
  const changePerDay = (predictedValue - currentValue) / days;
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const predictedVal = currentValue + (changePerDay * i);
    const confidenceRange = predictedVal * 0.15; // 15% confidence range
    
    data.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.max(0, predictedVal),
      confidenceUpper: Math.max(0, predictedVal + confidenceRange),
      confidenceLower: Math.max(0, predictedVal - confidenceRange),
      isHistorical: false
    });
  }
  
  return data;
};

// Mock data for different metrics
const mockPredictions = {
  roi: {
    title: "ROI Prediction",
    metric: "ROI",
    currentValue: 156,
    predictedValue: 178,
    confidence: 87,
    trend: 'up' as const,
    timeframe: "7 วันข้างหน้า",
    unit: "%"
  },
  commission: {
    title: "Commission Prediction", 
    metric: "Total Commission",
    currentValue: 45600,
    predictedValue: 52300,
    confidence: 82,
    trend: 'up' as const,
    timeframe: "7 วันข้างหน้า",
    unit: "฿"
  },
  adSpend: {
    title: "Ad Spend Prediction",
    metric: "Ad Spend", 
    currentValue: 28900,
    predictedValue: 31200,
    confidence: 90,
    trend: 'up' as const,
    timeframe: "7 วันข้างหน้า",
    unit: "฿"
  }
};

export default function PredictionChart({ 
  title = "AI Predictions",
  metric = "ROI",
  data,
  currentValue,
  predictedValue,
  confidence,
  trend,
  timeframe,
  unit = "",
  showConfidenceInterval = true
}: PredictionChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof mockPredictions>('roi');
  
  // Use mock data for now
  const predictionData = mockPredictions[selectedMetric];
  const chartData = generateMockPredictionData(
    predictionData.metric,
    predictionData.currentValue,
    predictionData.predictedValue
  );

  const formatValue = (value: number) => {
    if (predictionData.unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    return `${value.toLocaleString('th-TH', { maximumFractionDigits: 0 })}${predictionData.unit}`;
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'historical') return [formatValue(value), 'ข้อมูลจริง'];
    if (name === 'predicted') return [formatValue(value), 'การทำนาย'];
    if (name === 'confidenceUpper') return [formatValue(value), 'ขอบเขตบน'];
    if (name === 'confidenceLower') return [formatValue(value), 'ขอบเขตล่าง'];
    return [formatValue(value), name];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const changePercent = ((predictionData.predictedValue - predictionData.currentValue) / predictionData.currentValue * 100);

  return (
    <Card className="modern-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Predictions</CardTitle>
              <p className="text-sm text-muted-foreground">การทำนายประสิทธิภาพด้วย AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {predictionData.confidence}% แม่นยำ
            </Badge>
            {predictionData.confidence < 70 && (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metric Selector */}
        <div className="flex gap-2">
          {Object.entries(mockPredictions).map(([key, pred]) => (
            <Button
              key={key}
              variant={selectedMetric === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric(key as keyof typeof mockPredictions)}
              className="text-xs"
            >
              {pred.metric}
            </Button>
          ))}
        </div>

        {/* Current vs Predicted */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">ปัจจุบัน</div>
            <div className="text-lg font-semibold">
              {formatValue(predictionData.currentValue)}
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">ทำนาย ({predictionData.timeframe})</div>
            <div className="flex items-center gap-2">
              <div className={cn("text-lg font-semibold", getTrendColor(predictionData.trend))}>
                {formatValue(predictionData.predictedValue)}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(predictionData.trend)}
                <span className={cn("text-xs font-medium", getTrendColor(predictionData.trend))}>
                  {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (predictionData.unit === "%") return `${value}%`;
                  return value.toLocaleString('th-TH', { notation: 'compact' });
                }}
                className="text-xs"
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('th-TH');
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              
              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey="historical"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                name="ข้อมูลจริง"
                connectNulls={false}
              />
              
              {/* Predicted data line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                name="การทำนาย"
                connectNulls={false}
              />
              
              {/* Confidence interval */}
              {showConfidenceInterval && (
                <>
                  <Line
                    type="monotone"
                    dataKey="confidenceUpper"
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    name="ขอบเขตบน"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidenceLower"
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    name="ขอบเขตล่าง"
                    connectNulls={false}
                  />
                </>
              )}
              
              {/* Reference line for today */}
              <ReferenceLine 
                x={new Date().toISOString().split('T')[0]} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                label={{ value: "วันนี้", position: "top" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Summary */}
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">สรุปการทำนาย</h4>
              <p className="text-xs text-muted-foreground mb-2">
                จากการวิเคราะห์ข้อมูลในอดีต AI คาดการณ์ว่า {predictionData.metric} จะ
                {predictionData.trend === 'up' ? 'เพิ่มขึ้น' : predictionData.trend === 'down' ? 'ลดลง' : 'คงที่'} 
                {' '}{Math.abs(changePercent).toFixed(1)}% ใน{predictionData.timeframe}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">ความแม่นยำ: </span>
                  <span className="font-medium">{predictionData.confidence}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ช่วงความเชื่อมั่น: </span>
                  <span className="font-medium">±15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        {predictionData.confidence < 70 && (
          <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">คำเตือน</span>
            </div>
            <p className="text-xs text-yellow-600">
              ความแม่นยำของการทำนายต่ำกว่า 70% เนื่องจากข้อมูลมีความผันผวนสูง 
              แนะนำให้รวบรวมข้อมูลเพิ่มเติมเพื่อความแม่นยำที่ดีขึ้น
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}