import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FacebookConnectionPanel from "@/components/FacebookConnectionPanel";
import FacebookSetupStatus from "@/components/FacebookSetupStatus";
import FacebookConfigChecker from "@/components/FacebookConfigChecker";
import { useFacebookAuth } from "@/hooks/useFacebookAuth";
import { 
  Link, 
  Facebook, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  ExternalLink,
  RefreshCw,
  Shield
} from "lucide-react";

export default function ConnectAPIs() {
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected, user, loading, error, connect, disconnect } = useFacebookAuth();

  const handleRefreshConnection = async () => {
    setRefreshing(true);
    try {
      // Refresh connection status
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Connect APIs
            </h1>
            <p className="text-muted-foreground">เชื่อมต่อและจัดการ API connections</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleRefreshConnection}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Facebook API Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Facebook className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Facebook Marketing API
                  {isConnected ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  เชื่อมต่อกับ Facebook Marketing API เพื่อดึงข้อมูล Ads แบบ Real-time
                </CardDescription>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/facebook-live"}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Live Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/facebook-test"}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Test API
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          {isConnected && user ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                เชื่อมต่อสำเร็จกับ Facebook account: <strong>{user.name}</strong> ({user.email})
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Facebook Setup Status */}
          <FacebookSetupStatus />

          {/* Facebook Config Checker */}
          <FacebookConfigChecker />

          {/* Facebook Connection Panel */}
          <FacebookConnectionPanel />

          {/* API Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Real-time Data
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                ดึงข้อมูล Campaign, Ad Sets, และ Ads แบบ Real-time
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/facebook-live"}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                เปิด Facebook Live Data
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                API Testing
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                ทดสอบการเชื่อมต่อและ API endpoints
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/facebook-test"}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                เปิด API Tester
              </Button>
            </div>
          </div>

          {/* API Permissions */}
          <div className="space-y-3">
            <h4 className="font-medium">Required Permissions</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'ads_read',
                'ads_management',
                'business_management',
                'pages_read_engagement',
                'pages_show_list',
                'read_insights'
              ].map((permission) => (
                <Badge key={permission} variant="secondary" className="justify-center">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon APIs */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <Link className="h-5 w-5 text-gray-500" />
            </div>
            Other APIs
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            API connections อื่นๆ ที่จะเพิ่มในอนาคต
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded bg-orange-500/10 flex items-center justify-center">
                  🛒
                </div>
                <span className="font-medium">Shopee API</span>
              </div>
              <p className="text-sm text-muted-foreground">
                เชื่อมต่อกับ Shopee Affiliate API
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded bg-purple-500/10 flex items-center justify-center">
                  🛍️
                </div>
                <span className="font-medium">Lazada API</span>
              </div>
              <p className="text-sm text-muted-foreground">
                เชื่อมต่อกับ Lazada Affiliate API
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded bg-red-500/10 flex items-center justify-center">
                  📺
                </div>
                <span className="font-medium">Google Ads API</span>
              </div>
              <p className="text-sm text-muted-foreground">
                เชื่อมต่อกับ Google Ads API
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Documentation & Setup
          </CardTitle>
          <CardDescription>
            คู่มือการตั้งค่าและใช้งาน API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.open('/facebook-setup', '_blank')}
            >
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Facebook Setup Guide</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                คู่มือการตั้งค่า Facebook App และ API
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.open('/api-docs', '_blank')}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="font-medium">API Documentation</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                เอกสารประกอบการใช้งาน API ทั้งหมด
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}