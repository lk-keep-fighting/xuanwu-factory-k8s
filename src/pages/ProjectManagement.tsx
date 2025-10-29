import { useEffect, useState } from 'react';
import { Plus, Copy, Settings, Trash2, FolderOpen } from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Database } from '../lib/database.types';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除此项目吗？此操作将删除项目下的所有应用！')) return;

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

  if (loading) {
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <div>
            <h2 className="section__title">项目管理</h2>
            <p className="section__subtitle">管理所有部署项目，每个项目对应一个独立的Kubernetes命名空间</p>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            新建项目
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="card card--bordered text-center py-12">
            <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无项目</h3>
            <p className="text-gray-500 mb-4">开始创建第一个项目来部署应用</p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              新建项目
            </button>
          </div>
        ) : (
          <div className="grid grid--cols-3">
            {projects.map((project) => (
              <div className="card card--bordered" key={project.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-500">命名空间: {project.namespace}</p>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  创建时间: {new Date(project.created_at).toLocaleString('zh-CN')}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="button button--secondary flex-1"
                    onClick={() => navigate(`/projects/${project.id}/applications`)}
                  >
                    <Settings size={14} />
                    管理应用
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => openCopyModal(project)}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    className="button button--ghost text-red-600"
                    onClick={() => handleDeleteProject(project.id)}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">新建项目</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">项目名称</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例如: 电商平台"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Kubernetes 命名空间</label>
                <input
                  type="text"
                  className="input"
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value.toLowerCase() })}
                  required
                  placeholder="例如: ecommerce-platform"
                  pattern="[a-z0-9-]+"
                  title="只能包含小写字母、数字和连字符"
                />
                <p className="text-xs text-gray-500 mt-1">只能包含小写字母、数字和连字符</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">描述（可选）</label>
                <textarea
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="项目描述..."
                />
              </div>
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

      {showCopyModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowCopyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">复制项目</h3>
            <p className="text-sm text-gray-600 mb-4">
              将复制 <strong>{selectedProject.name}</strong> 的所有配置和应用到新项目
            </p>
            <form onSubmit={handleCopyProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">新项目名称</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">新命名空间</label>
                <input
                  type="text"
                  className="input"
                  value={formData.namespace}
                  onChange={(e) => setFormData({ ...formData, namespace: e.target.value.toLowerCase() })}
                  required
                  pattern="[a-z0-9-]+"
                  title="只能包含小写字母、数字和连字符"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setShowCopyModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="button button--primary">
                  复制
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
