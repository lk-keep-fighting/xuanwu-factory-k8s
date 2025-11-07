import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Play, Settings, Trash2, GitBranch, Package, ArrowLeft, 
  ExternalLink, Clock, RefreshCw, Activity
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { applicationService } from '../services/applicationService';
import { gitlabService } from '../services/gitlabService';
import { buildTemplateService } from '../services/buildTemplateService';
import type { Database } from '../lib/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Project = Database['public']['Tables']['projects']['Row'];
type Application = Database['public']['Tables']['applications']['Row'];
type BuildTemplate = Database['public']['Tables']['build_templates']['Row'];

const ApplicationManagement = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [templates, setTemplates] = useState<BuildTemplate[]>([]);
  const [gitlabConfigs, setGitlabConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gitlab_repo: '',
    gitlab_branch: 'main',
    build_type: 'dockerfile' as const,
    dockerfile_path: 'Dockerfile',
    build_config: {},
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      const [projectData, appsData, templatesData, configsData] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getProjectApplications(projectId),
        buildTemplateService.getAllTemplates(),
        gitlabService.getAllConfigs(),
      ]);

      setProject(projectData);
      setApplications(appsData);
      setTemplates(templatesData);
      setGitlabConfigs(configsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      await applicationService.createApplication({
        project_id: projectId,
        ...formData,
        build_config: formData.build_type === 'dockerfile' 
          ? null 
          : formData.build_config,
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        gitlab_repo: '',
        gitlab_branch: 'main',
        build_type: 'dockerfile',
        dockerfile_path: 'Dockerfile',
        build_config: {},
      });
      loadData();
    } catch (error) {
      console.error('Failed to create application:', error);
      alert('创建应用失败');
    }
  };

  const handleDeleteApplication = async (id: string, name: string) => {
    if (!confirm(`确定要删除应用 "${name}" 吗？此操作将删除所有部署记录！`)) return;

    try {
      await applicationService.deleteApplication(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('删除应用失败');
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const statusConfig = {
      deployed: { label: '已部署', variant: 'success' as const },
      building: { label: '构建中', variant: 'info' as const },
      pending: { label: '等待中', variant: 'warning' as const },
      failed: { label: '失败', variant: 'destructive' as const },
      stopped: { label: '已停止', variant: 'outline' as const },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBuildTypeLabel = (buildType: string) => {
    const labels: Record<string, string> = {
      dockerfile: 'Dockerfile',
      java17: 'Java 17',
      java21: 'Java 21',
      python: 'Python',
      nodejs: 'Node.js',
    };
    return labels[buildType] || buildType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
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

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">项目不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/project-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="font-mono text-xs">
                {project.namespace}
              </Badge>
              {project.description && (
                <span className="text-sm text-muted-foreground">{project.description}</span>
              )}
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            新建应用
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">应用总数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">运行中</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'deployed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">构建中</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'building').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">失败</CardTitle>
              <ExternalLink className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'failed').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无应用</h3>
            <p className="text-muted-foreground mb-6">
              在此项目中创建第一个应用
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建应用
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{app.name}</CardTitle>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        <span>{app.gitlab_branch}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{getBuildTypeLabel(app.build_type)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>更新于 {formatDate(app.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-1">
                  {app.gitlab_repo}
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => navigate(`/applications/${app.id}/deploy`)}
                  size="sm"
                >
                  <Play className="mr-2 h-3 w-3" />
                  部署
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/applications/${app.id}/settings`)}
                >
                  <Settings className="mr-2 h-3 w-3" />
                  配置
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteApplication(app.id, app.name)}
                  className="ml-auto"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  删除
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Application Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新建应用</DialogTitle>
            <DialogDescription>
              创建一个新应用并关联 GitLab 仓库
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateApplication}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">应用名称 *</Label>
                <Input
                  id="app-name"
                  placeholder="例如: 用户服务"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gitlab-repo">GitLab 仓库 *</Label>
                <Input
                  id="gitlab-repo"
                  placeholder="例如: git@gitlab.com:group/project.git"
                  value={formData.gitlab_repo}
                  onChange={(e) => setFormData({ ...formData, gitlab_repo: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">分支 *</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={formData.gitlab_branch}
                    onChange={(e) => setFormData({ ...formData, gitlab_branch: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="build-type">构建方式 *</Label>
                  <select
                    id="build-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.build_type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      build_type: e.target.value as any,
                    })}
                  >
                    <option value="dockerfile">自定义 Dockerfile</option>
                    <option value="java17">Java 17 模板</option>
                    <option value="java21">Java 21 模板</option>
                    <option value="python">Python 模板</option>
                    <option value="nodejs">Node.js 模板</option>
                  </select>
                </div>
              </div>

              {formData.build_type === 'dockerfile' && (
                <div className="space-y-2">
                  <Label htmlFor="dockerfile-path">Dockerfile 路径</Label>
                  <Input
                    id="dockerfile-path"
                    placeholder="Dockerfile"
                    value={formData.dockerfile_path}
                    onChange={(e) => setFormData({ ...formData, dockerfile_path: e.target.value })}
                  />
                </div>
              )}

              {formData.build_type !== 'dockerfile' && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    使用 <strong>{getBuildTypeLabel(formData.build_type)}</strong> 构建模板，
                    可在应用创建后进行详细配置
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button type="submit">创建应用</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationManagement;
