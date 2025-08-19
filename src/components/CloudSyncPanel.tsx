import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useImportedData } from '@/hooks/useImportedData';
import { CloudAuthPanel } from '@/components/CloudAuthPanel';
import { FirebaseTest } from '@/components/FirebaseTest';
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Download, 
  Share2, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function CloudSyncPanel() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { 
    isEnabled, 
    status, 
    cloudData, 
    lastError, 
    isLoading,
    uploadToCloud,
    downloadFromCloud 
  } = useCloudSync();

  const { importedData, hasData } = useImportedData();

  const handleUpload = async () => {
    if (!hasData || !importedData) return;

    setIsUploading(true);
    try {
      const dataId = await uploadToCloud(importedData, {
        source: 'manual',
        fileName: `Data Export ${new Date().toLocaleDateString()}`,
      });
      alert(`ข้อมูลถูกอัปโหลดเรียบร้อยแล้ว! ID: ${dataId}`);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (dataId: string) => {
    setIsDownloading(true);
    try {
      const cloudData = await downloadFromCloud(dataId);
      alert('ข้อมูลถูกดาวน์โหลดเรียบร้อยแล้ว! กรุณารีเฟรชหน้าเพื่อดูข้อมูลใหม่');
      console.log('Downloaded data:', cloudData);
      window.location.reload();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด: ' + (error as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            Cloud Sync ไม่พร้อมใช้งาน
          </CardTitle>
          <CardDescription>
            กรุณาตั้งค่า Cloud Storage เพื่อใช้งานฟีเจอร์นี้
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Firebase Test Panel */}
      <FirebaseTest />
      
      {/* Authentication Panel */}
      <CloudAuthPanel />
      
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.isOnline ? (
              <Cloud className="h-5 w-5 text-green-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-red-500" />
            )}
            Cloud Sync Status
          </CardTitle>
          <CardDescription>
            สถานะการซิงค์ข้อมูลกับ Cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>สถานะการเชื่อมต่อ:</span>
            <Badge variant={status.isOnline ? "default" : "destructive"}>
              {status.isOnline ? "เชื่อมต่อแล้ว" : "ออฟไลน์"}
            </Badge>
          </div>
          
          {status.lastSync && (
            <div className="flex items-center justify-between">
              <span>ซิงค์ล่าสุด:</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(status.lastSync, { addSuffix: true })}
              </span>
            </div>
          )}

          {status.syncInProgress && (
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>กำลังซิงค์ข้อมูล...</span>
            </div>
          )}

          {lastError && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{lastError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            อัปโหลดข้อมูลไปยัง Cloud
          </CardTitle>
          <CardDescription>
            บันทึกข้อมูลปัจจุบันไปยัง Cloud เพื่อเข้าถึงจากเครื่องอื่น
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleUpload}
            disabled={!hasData || isUploading || !status.isOnline}
            className="w-full"
          >
            {isUploading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                อัปโหลดข้อมูล
              </>
            )}
          </Button>
          
          {!hasData && (
            <p className="text-sm text-muted-foreground mt-2">
              ไม่มีข้อมูลให้อัปโหลด กรุณา import ข้อมูลก่อน
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cloud Data List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            ข้อมูลใน Cloud
          </CardTitle>
          <CardDescription>
            ข้อมูลที่บันทึกไว้ใน Cloud Storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : cloudData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ไม่มีข้อมูลใน Cloud
            </div>
          ) : (
            <div className="space-y-3">
              {cloudData.map((data) => (
                <div 
                  key={data.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {data.metadata.fileName || 'ไม่มีชื่อไฟล์'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      อัปโหลดเมื่อ: {formatDistanceToNow(data.metadata.uploadedAt, { addSuffix: true })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ขนาด: {Math.round((data.metadata.fileSize || 0) / 1024)} KB
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Shopee: {data.data.shopeeOrders?.length || 0}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Lazada: {data.data.lazadaOrders?.length || 0}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Facebook: {data.data.facebookAds?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(data.id)}
                      disabled={isDownloading || !status.isOnline}
                    >
                      {isDownloading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/shared/${data.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        alert('ลิงก์แชร์ถูกคัดลอกแล้ว!');
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}