import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  ArrowRight,
  BarChart3,
  Settings,
  Upload,
  Facebook,
  ShoppingCart,
  Globe,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-blue-500">Affilitics</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Comprehensive affiliate marketing analytics and campaign management platform
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = "/"}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            View Dashboard
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.href = "/import"}
          >
            <Upload className="mr-2 h-5 w-5" />
            Import Data
          </Button>
        </div>
      </div>

      {/* No Data State */}
      <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-4xl mx-auto">
        <div className="text-8xl animate-pulse">📊</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          เริ่มต้นวิเคราะห์ข้อมูลของคุณ
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          อัปโหลดไฟล์ CSV/XLSX จาก Shopee, Lazada และ Facebook Ads 
          เพื่อเริ่มต้นวิเคราะห์ผลการดำเนินงานและวางแผนการยิงแอดอย่างมีประสิทธิภาพ
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => window.location.href = "/import"} 
            size="lg" 
            className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 border-0"
          >
            <Upload className="mr-3 h-6 w-6" />
            เริ่มต้น Import Data
          </Button>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              🛒 Shopee
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              🛍️ Lazada
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              📘 Facebook Ads
            </Badge>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel hover:shadow-lg transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-500" />
              Facebook Ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Real-time Facebook advertising analytics and campaign management
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Live API</Badge>
              <Button size="sm" variant="ghost" onClick={() => window.location.href = "/facebook-live"}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:shadow-lg transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              Shopee Affiliate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track Shopee affiliate performance and commission data
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">File Import</Badge>
              <Button size="sm" variant="ghost" onClick={() => window.location.href = "/shopee"}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:shadow-lg transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Lazada Affiliate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor Lazada affiliate campaigns and earnings
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">File Import</Badge>
              <Button size="sm" variant="ghost" onClick={() => window.location.href = "/lazada"}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = "/import"}
            >
              <Upload className="h-6 w-6 mb-2" />
              Import Data
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = "/"}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = "/planning"}
            >
              <Target className="h-6 w-6 mb-2" />
              Campaign Planning
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = "/facebook-live"}
            >
              <Activity className="h-6 w-6 mb-2" />
              Facebook Live
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-500" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              วิเคราะห์ประสิทธิภาพของแคมเปญและ ROI อย่างละเอียด
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Data Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              นำเข้าข้อมูลจากหลายแพลตฟอร์มและรวมข้อมูลเข้าด้วยกัน
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Real-time Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              ติดตามผลการดำเนินงานแบบ real-time จาก Facebook Ads API
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
