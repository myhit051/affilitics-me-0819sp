import React from 'react';
import { CloudSyncPanel } from '@/components/CloudSyncPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Shield, 
  Users, 
  Smartphone,
  CheckCircle,
  Info
} from 'lucide-react';

export default function CloudSync() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cloud Sync</h1>
        <p className="text-muted-foreground">
          ซิงค์ข้อมูลกับ Cloud เพื่อเข้าถึงจากหลายเครื่อง และแชร์กับทีม
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Cloud Sync Panel */}
        <div className="lg:col-span-2">
          <CloudSyncPanel />
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                ฟีเจอร์ Cloud Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Cloud className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium">เข้าถึงจากทุกที่</div>
                  <div className="text-sm text-muted-foreground">
                    เปิดดูข้อมูลจากเครื่องคอมพิวเตอร์หรือมือถือใดก็ได้
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">ความปลอดภัย</div>
                  <div className="text-sm text-muted-foreground">
                    ข้อมูลถูกเข้ารหัสและเก็บอย่างปลอดภัย
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium">แชร์กับทีม</div>
                  <div className="text-sm text-muted-foreground">
                    แชร์ข้อมูลกับสมาชิกในทีมได้อย่างง่ายดาย
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium">Auto Sync</div>
                  <div className="text-sm text-muted-foreground">
                    ซิงค์ข้อมูลอัตโนมัติเมื่อมีการเปลี่ยนแปลง
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle>วิธีการตั้งค่า</CardTitle>
              <CardDescription>
                ขั้นตอนการเปิดใช้งาน Cloud Sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div className="text-sm">
                  เลือก Cloud Provider (Firebase หรือ Supabase)
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div className="text-sm">
                  สร้างโปรเจคและได้รับ API Keys
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div className="text-sm">
                  ตั้งค่าใน Settings → Cloud Configuration
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <div className="text-sm">
                  เริ่มใช้งาน Cloud Sync ได้เลย!
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Cloud Providers</CardTitle>
              <CardDescription>
                เลือก Provider ที่เหมาะกับคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Firebase (Google)</div>
                <div className="text-xs text-muted-foreground">
                  ฟรี 1GB • Real-time sync • ง่ายต่อการตั้งค่า
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">แนะนำ</Badge>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Supabase</div>
                <div className="text-xs text-muted-foreground">
                  ฟรี 500MB • Open Source • PostgreSQL
                </div>
              </div>

              <div className="p-3 border rounded-lg opacity-60">
                <div className="font-medium text-sm">AWS DynamoDB</div>
                <div className="text-xs text-muted-foreground">
                  Pay-as-you-use • Enterprise grade
                </div>
                <Badge variant="outline" className="mt-1 text-xs">เร็วๆ นี้</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}