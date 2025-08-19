/**
 * Cloud Authentication Panel
 * คอมโพเนนต์สำหรับจัดการ authentication ใน Cloud Storage
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  UserPlus, 
  LogOut, 
  Shield, 
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useFirebaseAuth, CloudUser } from '@/lib/firebase-auth';

export function CloudAuthPanel() {
  const [currentUser, setCurrentUser] = useState<CloudUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    signInAnonymously, 
    signOut, 
    getCurrentUser, 
    onAuthStateChanged 
  } = useFirebaseAuth();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, [onAuthStateChanged]);

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInAnonymously();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            ผู้ใช้ปัจจุบัน
          </CardTitle>
          <CardDescription>
            ข้อมูลผู้ใช้ที่เข้าสู่ระบบแล้ว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>สถานะ:</span>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              เข้าสู่ระบบแล้ว
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>ประเภท:</span>
            <Badge variant={currentUser.isAnonymous ? "secondary" : "default"}>
              {currentUser.isAnonymous ? "ผู้ใช้ไม่ระบุตัวตน" : "ผู้ใช้ลงทะเบียน"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>User ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {currentUser.uid.slice(0, 16)}...
            </code>
          </div>
          
          {currentUser.displayName && (
            <div className="flex items-center justify-between">
              <span>ชื่อ:</span>
              <span>{currentUser.displayName}</span>
            </div>
          )}
          
          {currentUser.email && (
            <div className="flex items-center justify-between">
              <span>อีเมล:</span>
              <span>{currentUser.email}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <Button 
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          เข้าสู่ระบบ Cloud Storage
        </CardTitle>
        <CardDescription>
          กรุณาเข้าสู่ระบบเพื่อใช้งาน Cloud Storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="anonymous" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="anonymous">ไม่ระบุตัวตน</TabsTrigger>
            <TabsTrigger value="email" disabled>อีเมล (เร็วๆ นี้)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="anonymous" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">เข้าสู่ระบบแบบไม่ระบุตัวตน</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                สามารถใช้งาน Cloud Storage ได้ทันทีโดยไม่ต้องลงทะเบียน
                ข้อมูลจะถูกเก็บไว้สำหรับ session นี้
              </p>
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <Button 
                onClick={handleAnonymousSignIn}
                disabled={isLoading}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบไม่ระบุตัวตน'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" placeholder="your@email.com" disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input id="password" type="password" placeholder="••••••••" disabled />
              </div>
              
              <Button className="w-full" disabled>
                <Key className="mr-2 h-4 w-4" />
                เข้าสู่ระบบด้วยอีเมล (เร็วๆ นี้)
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                ฟีเจอร์นี้จะพร้อมใช้งานในเวอร์ชันถัดไป
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
