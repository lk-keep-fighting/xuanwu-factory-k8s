import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Play, Settings, Trash2, GitBranch, Package, ArrowLeft } from 'lucide-react';
import { projectService } from '../services/projectService';
import { applicationService } from '../services/applicationService';
import { gitlabService } from '../services/gitlabService';
import { buildTemplateService } from '../services/buildTemplateService';
import type { Database } from '../lib/database.types';
import StatusBadge from '../components/ui/StatusBadge';

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

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('确定要删除此应用吗？此操作将删除所有部署记录！')) return;

    try {
      await applicationService.deleteApplication(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('删除应用失败');
    }
  };

  const getStatusTone = (status: Application['status']) => {
    switch (status) {
      case 'deployed':
        return 'success';
      case 'building':
        return 'info';
      case 'failed':
        return 'critical';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: Application['status']) => {
    const statusMap = {
      pending: '等待中',
      building: '构建中',
      deployed: '已部署',
      failed: '失败',
      stopped: '已停止',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">项目不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page__section">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => navigate('/project-management')}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h2 className="section__title">{project.name}</h2>
            <p className="section__subtitle">命名空间: {project.namespace}</p>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            新建应用
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="card card--bordered text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无应用</h3>
            <p className="text-gray-500 mb-4">在此项目中创建第一个应用</p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              新建应用
            </button>
          </div>
        ) : (
          <div className="stack stack--gap-lg">
            {applications.map((app) => (
              <div className="card card--bordered" key={app.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{app.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <GitBranch size={14} />
                        {app.gitlab_branch}
                      </span>
                      <span>{app.gitlab_repo}</span>
                    </div>
                  </div>
                  <StatusBadge tone={getStatusTone(app.status)}>
                    {getStatusText(app.status)}
                  </StatusBadge>
                </div>

                <div className="grid grid--cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">构建方式</span>
                    <p className="font-medium">{app.build_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">创建时间</span>
                    <p className="font-medium">{new Date(app.created_at).toLocaleString('zh-CN')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">更新时间</span>
                    <p className="font-medium">{new Date(app.updated_at).toLocaleString('zh-CN')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => navigate(`/applications/${app.id}/deploy`)}
                  >
                    <Play size={14} />
                    部署
                  </button>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => navigate(`/applications/${app.id}/settings`)}
                  >
                    <Settings size={14} />
                    配置
                  </button>
                  <button
                    type="button"
                    className="button button--ghost text-red-600"
                    onClick={() => handleDeleteApplication(app.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">新建应用</h3>
            <form onSubmit={handleCreateApplication}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">应用名称</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例如: 用户服务"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">GitLab 仓库</label>
                <input
                  type="text"
                  className="input"
                  value={formData.gitlab_repo}
                  onChange={(e) => setFormData({ ...formData, gitlab_repo: e.target.value })}
                  required
                  placeholder="例如: git@gitlab.com:group/project.git"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">分支</label>
                <input
                  type="text"
                  className="input"
                  value={formData.gitlab_branch}
                  onChange={(e) => setFormData({ ...formData, gitlab_branch: e.target.value })}
                  required
                  placeholder="main"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">构建方式</label>
                <select
                  className="input"
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

              {formData.build_type === 'dockerfile' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Dockerfile 路径</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.dockerfile_path}
                    onChange={(e) => setFormData({ ...formData, dockerfile_path: e.target.value })}
                    placeholder="Dockerfile"
                  />
                </div>
              )}

              {formData.build_type !== 'dockerfile' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">模板配置</label>
                  <p className="text-sm text-gray-500 mb-2">
                    使用 {formData.build_type} 构建模板，可在应用创建后进行详细配置
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="button button--primary">
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
