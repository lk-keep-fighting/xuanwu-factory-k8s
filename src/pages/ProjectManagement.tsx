import { useEffect, useState } from 'react';
import { Plus, Copy, Settings, Trash2, FolderOpen, Package, ExternalLink, Calendar, User } from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Database } from '../lib/database.types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type Project = Database['public']['Tables']['projects']['Row'];

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    namespace: '',
    description: '',
  });
  const [projectStats, setProjectStats] = useState<Record<string, { apps: number; deployments: number }>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      loadProjectStats();
    }
  }, [projects]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectStats = async () => {
    const stats: Record<string, { apps: number; deployments: number }> = {};
    
    for (const project of projects) {
      try {
        const apps = await projectService.getProjectApplications(project.id);
        stats[project.id] = {
          apps: apps.length,
          deployments: 0, // TODO: 计算部署数量
        };
      } catch (error) {
        console.error(`Failed to load stats for project ${project.id}:`, error);
      }
    }
    
    setProjectStats(stats);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.createProject(formData);
      setShowCreateModal(false);
      setFormData({ name: '', namespace: '', description: '' });
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('创建项目失败，请检查命名空间是否已存在');
    }
  };

  const handleCopyProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      await projectService.copyProject(
        selectedProject.id,
        formData.name,
        formData.namespace
      );
      setShowCopyModal(false);
      setSelectedProject(null);
      setFormData({ name: '', namespace: '', description: '' });
      loadProjects();
    } catch (error) {
      console.error('Failed to copy project:', error);
      alert('复制项目失败，请检查命名空间是否已存在');
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`确定要删除项目 "${name}" 吗？此操作将删除项目下的所有应用和部署！`)) return;

    try {
      await projectService.deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('删除项目失败');
    }
  };

  const openCopyModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: `${project.name} (副本)`,
      namespace: `${project.namespace}-copy`,
      description: project.description || '',
    });
    setShowCopyModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">项目管理</h1>
          <p className="text-muted-foreground mt-2">
            管理所有部署项目，每个项目对应一个独立的 Kubernetes 命名空间
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              活跃项目管理
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总应用数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(projectStats).reduce((sum, stat) => sum + stat.apps, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              跨所有项目
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">命名空间</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Kubernetes 隔离
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无项目</h3>
            <p className="text-muted-foreground mb-6">
              开始创建第一个项目来部署应用
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const stats = projectStats[project.id] || { apps: 0, deployments: 0 };
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="font-mono text-xs">
                          {project.namespace}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {project.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.apps}</div>
                        <div className="text-xs text-muted-foreground">应用</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.deployments}</div>
                        <div className="text-xs text-muted-foreground">部署</div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>创建于 {formatDate(project.created_at)}</span>
                      </div>
                      {project.created_by && (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>创建者: {project.created_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    查看
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}/applications`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    应用
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openCopyModal(project)}
                    title="复制项目"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    title="删除项目"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建项目</DialogTitle>
            <DialogDescription>
              创建一个新项目来组织和管理你的应用
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">项目名称 *</Label>
                <Input
                  id="name"
                  placeholder="例如: 电商平台"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="namespace">Kubernetes 命名空间 *</Label>
                <Input
                  id="namespace"
                  placeholder="例如: ecommerce-platform"
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value.toLowerCase() })}
                  pattern="[a-z0-9-]+"
                  title="只能包含小写字母、数字和连字符"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  只能包含小写字母、数字和连字符
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">描述（可选）</Label>
                <Textarea
                  id="description"
                  placeholder="项目描述..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button type="submit">创建项目</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Copy Project Dialog */}
      <Dialog open={showCopyModal} onOpenChange={setShowCopyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>复制项目</DialogTitle>
            <DialogDescription>
              将复制 <strong>{selectedProject?.name}</strong> 的所有配置和应用到新项目
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCopyProject}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="copy-name">新项目名称 *</Label>
                <Input
                  id="copy-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="copy-namespace">新命名空间 *</Label>
                <Input
                  id="copy-namespace"
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value.toLowerCase() })}
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCopyModal(false)}>
                取消
              </Button>
              <Button type="submit">复制</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagement;
