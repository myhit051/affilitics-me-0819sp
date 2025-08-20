import { useState } from "react";
import DataImport from "@/components/DataImport";
import { Upload, Database, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DataImportPage() {
  const [storedData, setStoredData] = useState<{
    shopee: { data: any[], fileName: string, timestamp: Date, size: number, rowCount: number } | null;
    lazada: { data: any[], fileName: string, timestamp: Date, size: number, rowCount: number } | null;
    facebook: { data: any[], fileName: string, timestamp: Date, size: number, rowCount: number } | null;
  }>({
    shopee: null,
    lazada: null,
    facebook: null,
  });

  const handleDataImported = (data: any) => {
    console.log('Data imported successfully:', data);
    
    // Process and save data to localStorage
    try {
      // Save raw data to localStorage
      localStorage.setItem('affiliateData', JSON.stringify(data));
      localStorage.setItem('affiliateRawData', JSON.stringify(data));
      
      // Calculate basic metrics
      const totalRows = data.totalRows || 0;
      const shopeeCount = data.shopeeOrders?.length || 0;
      const lazadaCount = data.lazadaOrders?.length || 0;
      const facebookCount = data.facebookAds?.length || 0;
      
      // Save basic metrics
      const basicMetrics = {
        totalRows,
        shopeeCount,
        lazadaCount,
        facebookCount,
        importTime: new Date().toISOString()
      };
      
      localStorage.setItem('affiliateMetrics', JSON.stringify(basicMetrics));
      console.log('✅ Data saved to localStorage:', {
        affiliateData: data,
        basicMetrics: basicMetrics
      });
      
      // Force reload the page to ensure data is loaded properly
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      
      // Still navigate even if localStorage fails
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  };

  const getTotalRows = () => {
    return (storedData.shopee?.rowCount || 0) + 
           (storedData.lazada?.rowCount || 0) + 
           (storedData.facebook?.rowCount || 0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Upload className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Data Import
          </h1>
          <p className="text-muted-foreground">อัปโหลดและจัดการไฟล์ข้อมูลจากแพลตฟอร์มต่างๆ</p>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                🛒
              </div>
              Shopee Affiliate
            </CardTitle>
            <CardDescription>อัปโหลดไฟล์ CSV/XLSX จาก Shopee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Commission data</div>
              <div>• Order information</div>
              <div>• Product details</div>
              <div>• Sub ID tracking</div>
            </div>
            {storedData.shopee && (
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  {storedData.shopee.rowCount.toLocaleString()} rows imported
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                🛍️
              </div>
              Lazada Affiliate
            </CardTitle>
            <CardDescription>อัปโหลดไฟล์ CSV/XLSX จาก Lazada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Commission data</div>
              <div>• Order information</div>
              <div>• Product details</div>
              <div>• Performance metrics</div>
            </div>
            {storedData.lazada && (
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  {storedData.lazada.rowCount.toLocaleString()} rows imported
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                📘
              </div>
              Facebook Ads
            </CardTitle>
            <CardDescription>อัปโหลดไฟล์ CSV/XLSX จาก Facebook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Campaign data</div>
              <div>• Ad performance</div>
              <div>• Spend & impressions</div>
              <div>• Click metrics</div>
            </div>
            {storedData.facebook && (
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  {storedData.facebook.rowCount.toLocaleString()} rows imported
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Data Status */}
      {getTotalRows() > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              Current Data Status
            </CardTitle>
            <CardDescription>ข้อมูลที่อัปโหลดแล้วในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {storedData.shopee && (
                <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">Shopee</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{storedData.shopee.fileName}</div>
                    <div>{storedData.shopee.rowCount.toLocaleString()} rows</div>
                    <div>{formatFileSize(storedData.shopee.size)}</div>
                  </div>
                </div>
              )}
              
              {storedData.lazada && (
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-purple-600">Lazada</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{storedData.lazada.fileName}</div>
                    <div>{storedData.lazada.rowCount.toLocaleString()} rows</div>
                    <div>{formatFileSize(storedData.lazada.size)}</div>
                  </div>
                </div>
              )}
              
              {storedData.facebook && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-600">Facebook</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{storedData.facebook.fileName}</div>
                    <div>{storedData.facebook.rowCount.toLocaleString()} rows</div>
                    <div>{formatFileSize(storedData.facebook.size)}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-600">
                  Total: {getTotalRows().toLocaleString()} rows imported
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Import Component */}
      <DataImport 
        onDataImported={handleDataImported}
        onNavigateToDashboard={() => window.location.href = "/"}
        storedData={storedData}
        onStoredDataUpdate={setStoredData}
      />
    </div>
  );
}