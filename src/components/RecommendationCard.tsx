import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  BarChart3, 
  Zap, 
  Clock, 
  Lightbulb,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecommendationData {
  id: string;
  type: 'budget' | 'subid' | 'platform' | 'timing' | 'creative';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  expectedROI: number;
  priority: number;
  details?: string[];
  actionItems?: string[];
}

interface RecommendationCardProps {
  recommendation: RecommendationData;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'positive' | 'negative') => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onFeedback,
  showActions = true,
  compact = false
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'budget': return <Target className="h-4 w-4" />;
      case 'subid': return <BarChart3 className="h-4 w-4" />;
      case 'platform': return <Zap className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'creative': return <Lightbulb className="h-4 w-4" />;
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'budget': return 'งบประมาณ';
      case 'subid': return 'Sub ID';
      case 'platform': return 'แพลตฟอร์ม';
      case 'timing': return 'เวลา';
      case 'creative': return 'โฆษณา';
      default: return 'ทั่วไป';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high': return 'สูง';
      case 'medium': return 'กลาง';
      case 'low': return 'ต่ำ';
      default: return 'ไม่ระบุ';
    }
  };

  const handleFeedback = (feedbackType: 'positive' | 'negative') => {
    setFeedback(feedbackType);
    onFeedback?.(recommendation.id, feedbackType);
  };

  const handleAccept = () => {
    onAccept?.(recommendation.id);
  };

  const handleReject = () => {
    onReject?.(recommendation.id);
  };

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200",
      compact ? "p-3" : "p-4",
      feedback === 'positive' ? "border-green-500/50 bg-green-500/5" : 
      feedback === 'negative' ? "border-red-500/50 bg-red-500/5" : 
      "border hover:border-muted-foreground/20"
    )}>
      <CardContent className="p-0">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-1.5 rounded-md bg-muted/50">
                {getRecommendationIcon(recommendation.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium truncate",
                  compact ? "text-sm" : "text-sm"
                )}>
                  {recommendation.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    {getTypeLabel(recommendation.type)}
                  </Badge>
                  <Badge 
                    className={cn(getImpactColor(recommendation.impact), "text-xs px-1.5 py-0.5")} 
                    variant="outline"
                  >
                    {getImpactLabel(recommendation.impact)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {recommendation.confidence}%
              </Badge>
              {(recommendation.details || recommendation.actionItems) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className={cn(
            "text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {recommendation.description}
          </p>

          {/* Expected ROI */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Expected ROI: </span>
              <span className={cn(
                "font-medium",
                recommendation.expectedROI > 0 ? "text-green-600" : "text-red-600"
              )}>
                {recommendation.expectedROI > 0 ? '+' : ''}{recommendation.expectedROI}%
              </span>
            </div>
            
            {/* Priority indicator */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    i < recommendation.priority ? "bg-orange-500" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t">
              {recommendation.details && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">รายละเอียด:</h5>
                  <ul className="space-y-1">
                    {recommendation.details.map((detail, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-1.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendation.actionItems && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">ขั้นตอนการดำเนินการ:</h5>
                  <ul className="space-y-1">
                    {recommendation.actionItems.map((action, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-[10px] font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-2 border-t">
              {/* Feedback buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('positive')}
                  className={cn(
                    "h-7 px-2 text-xs",
                    feedback === 'positive' && "bg-green-500/10 text-green-600"
                  )}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('negative')}
                  className={cn(
                    "h-7 px-2 text-xs",
                    feedback === 'negative' && "bg-red-500/10 text-red-600"
                  )}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleReject}
                  className="h-7 px-2 text-xs"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  ไม่สนใจ
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAccept}
                  className="h-7 px-2 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ใช้คำแนะนำ
                </Button>
              </div>
            </div>
          )}

          {/* Feedback confirmation */}
          {feedback && (
            <div className={cn(
              "text-xs p-2 rounded-md flex items-center gap-2",
              feedback === 'positive' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
            )}>
              {feedback === 'positive' ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  ขอบคุณสำหรับ feedback! AI จะเรียนรู้จากการตอบกลับของคุณ
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  ขอบคุณสำหรับ feedback! เราจะปรับปรุงคำแนะนำให้ดีขึ้น
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}