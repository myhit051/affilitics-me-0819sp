import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Save,
  FolderOpen,
  Star,
  Clock
} from "lucide-react";

interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  type: 'campaign' | 'analysis' | 'planning' | 'research';
  status: 'active' | 'completed' | 'paused' | 'draft';
  budget?: number;
  targetROI?: number;
  startDate?: string;
  endDate?: string;
  platforms: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function Workspace() {
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<WorkspaceProject | null>(null);
  const [newProject, setNewProject] = useState<Partial<WorkspaceProject>>({
    name: '',
    description: '',
    type: 'campaign',
    status: 'draft',
    platforms: [],
    notes: ''
  });

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('affilitics-workspace-projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Error loading workspace projects:', error);
      }
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('affilitics-workspace-projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = () => {
    if (!newProject.name) return;

    const project: WorkspaceProject = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description || '',
      type: newProject.type as WorkspaceProject['type'],
      status: newProject.status as WorkspaceProject['status'],
      budget: newProject.budget,
      targetROI: newProject.targetROI,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      platforms: newProject.platforms || [],
      notes: newProject.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects([...projects, project]);
    setNewProject({
      name: '',
      description: '',
      type: 'campaign',
      status: 'draft',
      platforms: [],
      notes: ''
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;

    setProjects(projects.map(p => 
      p.id === editingProject.id 
        ? { ...editingProject, updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const getTypeIcon = (type: WorkspaceProject['type']) => {
    switch (type) {
      case 'campaign': return <Target className="h-4 w-4" />;
      case 'analysis': return <TrendingUp className="h-4 w-4" />;
      case 'planning': return <Calendar className="h-4 w-4" />;
      case 'research': return <Star className="h-4 w-4" />;
      default: return <FolderOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: WorkspaceProject['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'draft': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getTypeColor = (type: WorkspaceProject['type']) => {
    switch (type) {
      case 'campaign': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'analysis': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'planning': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'research': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Workspace
            </h1>
            <p className="text-muted-foreground">จัดการโปรเจกต์และวางแผนการทำงาน</p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              สร้างโปรเจกต์ใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>สร้างโปรเจกต์ใหม่</DialogTitle>
              <DialogDescription>
                สร้างโปรเจกต์ใหม่เพื่อจัดการและติดตามงานของคุณ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ชื่อโปรเจกต์</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="เช่น Campaign Q1 2024"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ประเภท</label>
                  <Select 
                    value={newProject.type} 
                    onValueChange={(value) => setNewProject({...newProject, type: value as WorkspaceProject['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">คำอธิบาย</label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="อธิบายโปรเจกต์ของคุณ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">งบประมาณ (฿)</label>
                  <Input
                    type="number"
                    value={newProject.budget || ''}
                    onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target ROI (%)</label>
                  <Input
                    type="number"
                    value={newProject.targetROI || ''}
                    onChange={(e) => setNewProject({...newProject, targetROI: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">วันที่เริ่ม</label>
                  <Input
                    type="date"
                    value={newProject.startDate || ''}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">วันที่สิ้นสุด</label>
                  <Input
                    type="date"
                    value={newProject.endDate || ''}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">หมายเหตุ</label>
                <Textarea
                  value={newProject.notes}
                  onChange={(e) => setNewProject({...newProject, notes: e.target.value})}
                  placeholder="บันทึกเพิ่มเติม..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateProject}>
                <Save className="h-4 w-4 mr-2" />
                สร้างโปรเจกต์
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center space-y-6 bg-card/95 backdrop-blur-lg p-12 rounded-3xl border-2 border-border/50 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl animate-pulse">💼</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            เริ่มต้นสร้าง Workspace
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            สร้างโปรเจกต์แรกของคุณเพื่อจัดการและติดตามงาน
            วางแผน campaign และวิเคราะห์ผลลัพธ์อย่างเป็นระบบ
          </p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg" 
            className="px-8 py-4 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 border-0"
          >
            <Plus className="mr-3 h-6 w-6" />
            สร้างโปรเจกต์แรก
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(project.type)}
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="secondary" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant="secondary" className={getTypeColor(project.type)}>
                    {project.type}
                  </Badge>
                </div>

                {(project.budget || project.targetROI) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.budget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">฿{formatCurrency(project.budget)}</span>
                      </div>
                    )}
                    {project.targetROI && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="font-medium">{project.targetROI}%</span>
                      </div>
                    )}
                  </div>
                )}

                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {project.startDate && new Date(project.startDate).toLocaleDateString('th-TH')}
                    {project.startDate && project.endDate && ' - '}
                    {project.endDate && new Date(project.endDate).toLocaleDateString('th-TH')}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  อัปเดตล่าสุด: {new Date(project.updatedAt).toLocaleDateString('th-TH')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>แก้ไขโปรเจกต์</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลโปรเจกต์ของคุณ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ชื่อโปรเจกต์</label>
                  <Input
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">สถานะ</label>
                  <Select 
                    value={editingProject.status} 
                    onValueChange={(value) => setEditingProject({...editingProject, status: value as WorkspaceProject['status']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">คำอธิบาย</label>
                <Textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">หมายเหตุ</label>
                <Textarea
                  value={editingProject.notes}
                  onChange={(e) => setEditingProject({...editingProject, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProject(null)}>
                ยกเลิก
              </Button>
              <Button onClick={handleUpdateProject}>
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}