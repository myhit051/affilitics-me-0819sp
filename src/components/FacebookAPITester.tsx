import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { FacebookAPITester, FacebookTestResult } from '@/utils/facebook-test';

export const FacebookAPITesterComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<FacebookTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  
  const tester = new FacebookAPITester();

  const runTest = useCallback(async (token?: string) => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const tokenToUse = token || manualToken;
      const results = await tester.runFullTest(tokenToUse);
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [manualToken, tester]);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Facebook API Tester
          </CardTitle>
          <CardDescription>
            ทดสอบการเชื่อมต่อและดึงข้อมูลจาก Facebook API กับข้อมูลจริง
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>วิธีการทดสอบ:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>ใส่ Facebook Access Token ด้านล่าง (หรือทดสอบการตั้งค่าโดยไม่ใส่ token)</li>
                    <li>คลิก "เริ่มทดสอบทั้งหมด" เพื่อทดสอบการเชื่อมต่อ</li>
                    <li>ดูผลการทดสอบด้านล่าง</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 หากไม่มี Access Token สามารถได้รับจาก <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Graph API Explorer</a>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>สถานะ:</span>
                <Badge variant={manualToken ? "default" : "secondary"}>
                  {manualToken ? "มี Token แล้ว" : "ยังไม่มี Token"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-token">หรือใส่ Access Token แบบแมนนวล:</Label>
              <div className="flex gap-2">
                <Input
                  id="manual-token"
                  type="password"
                  placeholder="ใส่ Facebook Access Token..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                />
                <Button
                  onClick={() => setManualToken('')}
                  variant="outline"
                  size="sm"
                >
                  ล้าง
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => runTest()}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? 'กำลังทดสอบ...' : 'เริ่มทดสอบทั้งหมด'}
              </Button>
              
              <Button
                onClick={() => setTestResults([])}
                variant="outline"
                disabled={isRunning}
              >
                ล้างผลลัพธ์
              </Button>
            </div>

            {!manualToken && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  💡 เคล็ดลับ: ใส่ Facebook Access Token เพื่อทดสอบการดึงข้อมูลจริง หรือทดสอบการตั้งค่าโดยไม่ใส่ token
                </AlertDescription>
              </Alert>
            )}

            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ผลการทดสอบ</h3>
                {testResults.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.success)}
                          <CardTitle className="text-base">{result.message}</CardTitle>
                        </div>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "สำเร็จ" : "ล้มเหลว"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    {(result.data || result.error) && (
                      <CardContent className="pt-0">
                        {result.error && (
                          <Alert variant="destructive" className="mb-4">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{result.error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {result.data && (
                          <div className="space-y-2">
                            <Label>ข้อมูลที่ได้รับ:</Label>
                            <Textarea
                              value={JSON.stringify(result.data, null, 2)}
                              readOnly
                              className="font-mono text-sm"
                              rows={6}
                            />
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookAPITesterComponent;