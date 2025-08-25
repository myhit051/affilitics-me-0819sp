import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertData {
  id: string;
  type: 'opportunity' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  actionRequired: boolean;
  dismissed?: boolean;
  viewed?: boolean;
  recommendations?: string[];
}

interface AlertPanelProps {
  alerts: AlertData[];
  onDismiss?: (alertId: string) => void;
  onMarkAsViewed?: (alertId: string) => void;
  onTakeAction?: (alertId: string) => void;
  showDismissed?: boolean;
  maxAlerts?: number;
}

// Mock alert data generator
const generateMockAlerts = (): AlertData[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'opportunity',
      title: 'Sub ID SP001 แสดงประสิทธิภาพดีเยี่ยม',
      description: 'ROI เพิ่มขึ้น 45% ในช่วง 3 วันที่ผ่านมา แนะนำให้เพิ่มงบประมาณ',
      metric: 'ROI',
      currentValue: 187,
      previousValue: 129,
      changePercent: 45,
      priority: 'high',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      actionRequired: true,
      viewed: false,
      recommendations: [
        'เพิ่มงบประมาณโฆษณาสำหรับ Sub ID นี้ 30-50%',
        'ขยายเวลาแสดงโฆษณาในช่วงที่มีประสิทธิภาพสูง',
        'ทดสอบ creative ใหม่เพื่อรักษาประสิทธิภาพ'
      ]
    },
    {
      id: '2',
      type: 'warning',
      title: 'ค่าใช้จ่ายโฆษณา Lazada เพิ่มขึ้นผิดปกติ',
      description: 'Ad Spend เพิ่มขึ้น 28% แต่ Commission เพิ่มขึ้นเพียง 12%',
      metric: 'Ad Spend',
      currentValue: 15600,
      previousValue: 12200,
      changePercent: 28,
      priority: 'medium',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      actionRequired: true,
      viewed: true,
      recommendations: [
        'ตรวจสอบการตั้งค่า bid ของแคมเปญ Lazada',
        'พิจารณาปรับ targeting เพื่อลดต้นทุน',
        'หยุดแคมเปญที่มี ROI ต่ำกว่า 100% ชั่วคราว'
      ]
    },
    {
      id: '3',
      type: 'critical',
      title: 'Sub ID LZD003 ขาดทุนต่อเนื่อง',
      description: 'ROI ติดลบ 3 วันติดต่อกัน (-15%) ควรหยุดแคมเปญทันที',
      metric: 'ROI',
      currentValue: -15,
      previousValue: 5,
      changePercent: -400,
      priority: 'high',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      actionRequired: true,
      viewed: false,
      recommendations: [
        'หยุดแคมเปญทันทีเพื่อป้องกันการขาดทุนเพิ่มเติม',
        'วิเคราะห์สาเหตุของการลดลงของประสิทธิภาพ',
        'ปรับปรุง landing page หรือ product selection'
      ]
    },
    {
      id: '4',
      type: 'info',
      title: 'แนวโน้มตลาดเปลี่ยนแปลง',
      description: 'ประสิทธิภาพโดยรวมของ Shopee ดีขึ้น 8% เมื่อเทียบกับสัปดาห์ที่แล้ว',
      metric: 'Overall Performance',
      currentValue: 156,
      previousValue: 144,
      changePercent: 8,
      priority: 'low',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      actionRequired: false,
      viewed: true,
      recommendations: [
        'พิจารณาเพิ่มสัดส่วนงบประมาณให้ Shopee',
        'ทดสอบ product categories ใหม่ใน Shopee',
        'ติดตามแนวโน้มต่อไปในสัปดาห์หน้า'
      ]
    }
  ];
};

export default function AlertPanel({
  alerts = generateMockAlerts(),
  onDismiss,
  onMarkAsViewed,
  onTakeAction,
  showDismissed = false,
  maxAlerts = 10
}: AlertPanelProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  
  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => showDismissed || !alert.dismissed)
    .sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, maxAlerts);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'info': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'opportunity': return 'โอกาส';
      case 'warning': return 'คำเตือน';
      case 'critical': return 'วิกฤต';
      case 'info': return 'ข้อมูล';
      default: return 'แจ้งเตือน';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      return date.toLocaleDateString('th-TH');
    } else if (diffHours > 0) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} นาทีที่แล้ว`;
    } else {
      return 'เมื่อสักครู่';
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'ROI') {
      return `${value}%`;
    } else if (metric === 'Ad Spend' || metric.includes('Commission')) {
      return `฿${value.toLocaleString('th-TH')}`;
    }
    return value.toString();
  };

  const handleDismiss = (alertId: string) => {
    onDismiss?.(alertId);
  };

  const handleMarkAsViewed = (alertId: string) => {
    onMarkAsViewed?.(alertId);
  };

  const handleTakeAction = (alertId: string) => {
    onTakeAction?.(alertId);
  };

  const toggleExpanded = (alertId: string) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
    if (!alerts.find(a => a.id === alertId)?.viewed) {
      handleMarkAsViewed(alertId);
    }
  };

  const unviewedCount = alerts.filter(alert => !alert.viewed && !alert.dismissed).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.dismissed).length;

  return (
    <Card className="modern-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30">
              <Bell className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">การแจ้งเตือนจาก AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unviewedCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unviewedCount} ใหม่
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge className="text-xs bg-red-500 hover:bg-red-600">
                {criticalCount} วิกฤต
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-sm mb-1">ไม่มีการแจ้งเตือน</h3>
            <p className="text-xs text-muted-foreground">
              ระบบทำงานปกติ ไม่พบปัญหาที่ต้องแก้ไข
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "border rounded-lg p-3 transition-all duration-200",
                getAlertColor(alert.type),
                !alert.viewed && "ring-2 ring-offset-2 ring-current/20",
                alert.dismissed && "opacity-50"
              )}
            >
              <div className="space-y-3">
                {/* Alert Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mt-0.5">
                      {getAlertIcon(alert.type)}
                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(alert.priority))} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {alert.title}
                        </h4>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                          {getTypeLabel(alert.type)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">ปัจจุบัน: </span>
                          <span className="font-medium">
                            {formatValue(alert.currentValue, alert.metric)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">เปลี่ยนแปลง: </span>
                          <span className={cn(
                            "font-medium",
                            alert.changePercent > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {alert.changePercent > 0 ? '+' : ''}{alert.changePercent}%
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {formatTimestamp(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      {alert.viewed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(alert.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedAlert === alert.id && alert.recommendations && (
                  <div className="pt-2 border-t border-current/10">
                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      คำแนะนำจาก AI:
                    </h5>
                    <ul className="space-y-1 mb-3">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-medium mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                    
                    {alert.actionRequired && (
                      <Button
                        size="sm"
                        onClick={() => handleTakeAction(alert.id)}
                        className="h-7 px-3 text-xs"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        ดำเนินการ
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Summary */}
        {filteredAlerts.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>รวม {filteredAlerts.length} การแจ้งเตือน</span>
                {unviewedCount > 0 && (
                  <span className="text-orange-600">{unviewedCount} ยังไม่ได้อ่าน</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>อัปเดตล่าสุด: เมื่อสักครู่</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}