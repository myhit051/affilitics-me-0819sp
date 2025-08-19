import { useState } from "react";
import { DateRange } from "react-day-picker";
import AdPlanning from "@/components/AdPlanning";
import DateRangeSelector from "@/components/DateRangeSelector";
import { useImportedData } from "@/hooks/useImportedData";
import { Target, Upload, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdPlanningPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { importedData, hasData, loading } = useImportedData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <div className="text-lg">กำลังโหลดข้อมูลสำหรับการวางแผน...</div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">🎯</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Ad Planning & Strategy
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            อัปโหลดข้อมูลจาก Shopee, Lazada และ Facebook Ads 
            เพื่อเริ่มวางแผนการยิงแอดและวิเคราะห์ ROI ที่เหมาะสม
          </p>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = "/import"} 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-300 border-0"
            >
              <Upload className="mr-3 h-6 w-6" />
              Import Data เพื่อเริ่มวางแผน
            </Button>
            <div className="text-sm text-muted-foreground">
              ต้องการข้อมูลจากทั้ง 3 แพลตฟอร์มเพื่อการวิเคราะห์ที่แม่นยำ
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Ad Planning & Strategy
          </h1>
          <p className="text-muted-foreground">วางแผนการยิงแอดและวิเคราะห์ ROI ที่เหมาะสม</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-card rounded-lg border">
        <DateRangeSelector 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          เลือกช่วงเวลาเพื่อวิเคราะห์แนวโน้มและวางแผน
        </div>
      </div>

      {/* Ad Planning Component */}
      <AdPlanning 
        shopeeOrders={importedData?.shopeeOrders || []}
        lazadaOrders={importedData?.lazadaOrders || []}
        facebookAds={importedData?.facebookAds || []}
        dateRange={dateRange}
      />
    </div>
  );
}