import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Upload, 
  BarChart3, 
  Target, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Play,
  BookOpen,
  Lightbulb
} from "lucide-react";

export default function GettingStarted() {
  const steps = [
    {
      id: 1,
      title: "Import Your Data",
      description: "อัปโหลดไฟล์ข้อมูลจาก Shopee, Lazada และ Facebook Ads",
      icon: <Upload className="h-6 w-6" />,
      action: "เริ่ม Import",
      link: "/import",
      color: "blue"
    },
    {
      id: 2,
      title: "Explore Dashboard",
      description: "ดูภาพรวมและวิเคราะห์ผลการดำเนินงานของคุณ",
      icon: <BarChart3 className="h-6 w-6" />,
      action: "ดู Dashboard",
      link: "/",
      color: "green"
    },
    {
      id: 3,
      title: "Plan Your Campaigns",
      description: "ใช้เครื่องมือวางแผนเพื่อเพิ่มประสิทธิภาพ",
      icon: <Target className="h-6 w-6" />,
      action: "เริ่มวางแผน",
      link: "/planning",
      color: "purple"
    },
    {
      id: 4,
      title: "Connect Live Data",
      description: "เชื่อมต่อ Facebook API สำหรับข้อมูล Real-time",
      icon: <Zap className="h-6 w-6" />,
      action: "Connect API",
      link: "/connect",
      color: "orange"
    }
  ];

  const features = [
    {
      title: "Multi-Platform Analytics",
      description: "วิเคราะห์ข้อมูลจาก Shopee, Lazada และ Facebook Ads ในที่เดียว",
      icon: "📊"
    },
    {
      title: "Real-time Facebook Data",
      description: "ดึงข้อมูล Facebook Ads แบบ Real-time ผ่าน API",
      icon: "⚡"
    },
    {
      title: "Advanced Planning Tools",
      description: "เครื่องมือวางแผน Campaign และคำนวณ ROI",
      icon: "🎯"
    },
    {
      title: "Workspace Management",
      description: "จัดการโปรเจกต์และติดตามงานอย่างเป็นระบบ",
      icon: "💼"
    },
    {
      title: "Data Import & Export",
      description: "อัปโหลดและส่งออกข้อมูลได้หลายรูปแบบ",
      icon: "📁"
    },
    {
      title: "Performance Monitoring",
      description: "ติดตามประสิทธิภาพและแนวโน้มอย่างต่อเนื่อง",
      icon: "📈"
    }
  ];

  const getStepColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="h-10 w-10 text-blue-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Getting Started
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          ยินดีต้อนรับสู่ Affilitics.me - แพลตฟอร์มวิเคราะห์ Affiliate Marketing ที่ครบครัน
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Play className="h-3 w-3 mr-1" />
            Quick Start Guide
          </Badge>
        </div>
      </div>

      {/* Quick Start Steps */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">เริ่มต้นใน 4 ขั้นตอน</h2>
          <p className="text-muted-foreground">ทำตามขั้นตอนเหล่านี้เพื่อเริ่มใช้งานอย่างเต็มประสิทธิภาพ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <Card key={step.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getStepColor(step.color)}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${getStepColor(step.color)} flex items-center justify-center text-white`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Step {step.id}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-1">{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
                <Button 
                  onClick={() => window.location.href = step.link}
                  className={`w-full bg-gradient-to-r ${getStepColor(step.color)} hover:opacity-90 text-white border-0`}
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">ฟีเจอร์หลัก</h2>
          <p className="text-muted-foreground">เครื่องมือที่จะช่วยให้คุณวิเคราะห์และเพิ่มประสิทธิภาพได้อย่างมืออาชีพ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">{feature.icon}</span>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips & Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Tips & Best Practices
          </CardTitle>
          <CardDescription>
            เคล็ดลับสำหรับการใช้งานที่มีประสิทธิภาพ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Data Import Tips
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• ใช้ไฟล์ CSV หรือ XLSX ที่มีข้อมูลครบถ้วน</li>
                <li>• ตรวจสอบ column headers ให้ถูกต้อง</li>
                <li>• อัปโหลดข้อมูลจากทั้ง 3 แพลตฟอร์มเพื่อการวิเคราะห์ที่แม่นยำ</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Analysis Best Practices
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                <li>• ใช้ Date Range Filter เพื่อวิเคราะห์ช่วงเวลาที่เฉพาะเจาะจง</li>
                <li>• ติดตาม ROI และ Performance metrics อย่างสม่ำเสมอ</li>
                <li>• ใช้ Workspace เพื่อจัดการโปรเจกต์อย่างเป็นระบบ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            ลิงก์ด่วนไปยังฟีเจอร์ที่ใช้บ่อย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = "/import"}
            >
              <Upload className="h-6 w-6 text-blue-500" />
              <span className="text-sm">Import Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = "/"}
            >
              <BarChart3 className="h-6 w-6 text-green-500" />
              <span className="text-sm">Dashboard</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = "/connect"}
            >
              <Zap className="h-6 w-6 text-orange-500" />
              <span className="text-sm">Connect API</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.location.href = "/workspace"}
            >
              <Target className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Workspace</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}