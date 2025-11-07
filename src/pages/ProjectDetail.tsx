import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Copy, Trash2, Package, Activity,
  GitBranch, Clock, User, Terminal, FileText
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { applicationService } from '../services/applicationService';
import type { Database } from '../lib/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Project = Database['public']['Tables']['projects']['Row'];
type Application = Database['public']['Tables']['applications']['Row'];

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploymentStats, setDeploymentStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    building: 0,
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      const [projectData, appsData] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getProjectApplications(projectId),
      ]);

      setProject(projectData);
      setApplications(appsData);

      // 统计部署信息
      const stats = {
        total: 0,
        success: 0,
        failed: 0,
        building: 0,
      };

      for (const app of appsData) {
        const deployments = await applicationService.getApplicationDeployments(app.id);
        stats.total += deployments.length;
        stats.success += deployments.filter((d: any) => d.status === 'deployed').length;
        stats.failed += deployments.filter((d: any) => d.status === 'failed').length;
        stats.building += deployments.filter((d: any) => d.status === 'building' || d.status === 'deploying').length;
      }

      setDeploymentStats(stats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
      <div className="flex items-center gap-4 mb-8">
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
            <Badge variant="outline" className="font-mono">
              {project.namespace}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            复制
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            设置
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">应用数量</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {applications.filter(app => app.status === 'deployed').length} 运行中
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">部署总数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deploymentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {deploymentStats.success} 成功
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deploymentStats.total > 0 
                ? Math.round((deploymentStats.success / deploymentStats.total) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {deploymentStats.failed} 失败
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{formatDate(project.created_at)}</div>
            {project.created_by && (
              <p className="text-xs text-muted-foreground">
                by {project.created_by}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="applications">应用</TabsTrigger>
          <TabsTrigger value="activity">活动</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>项目信息</CardTitle>
              <CardDescription>项目的基本配置和详细信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">项目名称</p>
                    <p className="text-sm">{project.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">命名空间</p>
                    <p className="text-sm font-mono">{project.namespace}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">创建时间</p>
                    <p className="text-sm">{formatDate(project.created_at)}</p>
                  </div>
                </div>
                {project.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">描述</p>
                    <p className="text-sm">{project.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kubernetes 资源</CardTitle>
              <CardDescription>项目在集群中的资源使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">命名空间</p>
                    <p className="text-xs text-muted-foreground">Kubernetes Namespace</p>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {project.namespace}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Deployments</p>
                    <p className="text-xs text-muted-foreground">部署的应用数量</p>
                  </div>
                  <Badge>{applications.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Services</p>
                    <p className="text-xs text-muted-foreground">服务数量</p>
                  </div>
                  <Badge>{applications.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card className="py-16">
              <CardContent className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无应用</h3>
                <p className="text-muted-foreground mb-6">
                  在此项目中创建第一个应用
                </p>
                <Button onClick={() => navigate(`/projects/${projectId}/applications`)}>
                  <Package className="mr-2 h-4 w-4" />
                  管理应用
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {app.gitlab_repo}
                        </CardDescription>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        <span>{app.gitlab_branch}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{app.build_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>更新于 {formatDate(app.updated_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>项目的最新操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Terminal className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">项目创建</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(project.created_at)}
                    </p>
                  </div>
                </div>
                {applications.map((app) => (
                  <div key={app.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-green-500/10 p-2">
                      <Package className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">应用 "{app.name}" 创建</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(app.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>项目设置</CardTitle>
              <CardDescription>管理项目配置和权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">危险区域</p>
                <p className="text-xs text-muted-foreground mb-4">
                  这些操作是不可逆的，请谨慎操作
                </p>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">删除项目</p>
                    <p className="text-xs text-muted-foreground">
                      删除此项目及其所有应用和部署
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    删除项目
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
