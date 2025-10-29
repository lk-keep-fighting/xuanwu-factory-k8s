import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Settings, Trash2, GitBranch } from 'lucide-react';
import { gitlabService } from '../services/gitlabService';
import type { Database } from '../lib/database.types';

type GitlabConfig = Database['public']['Tables']['gitlab_config']['Row'];

const GitLabIntegration = () => {
  const [configs, setConfigs] = useState<GitlabConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gitlab_url: 'https://gitlab.com',
    access_token: '',
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await gitlabService.getAllConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const result = await gitlabService.testConnection(formData.gitlab_url, formData.access_token);
      if (result.success) {
        setConnectionResult({
          success: true,
          message: `连接成功！已认证为: ${result.user.name} (${result.user.username})`,
        });
      } else {
        setConnectionResult({
          success: false,
          message: `连接失败: ${result.error}`,
        });
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `连接失败: ${(error as Error).message}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await gitlabService.createConfig(formData);
      setShowCreateModal(false);
      setFormData({ name: '', gitlab_url: 'https://gitlab.com', access_token: '' });
      setConnectionResult(null);
      loadConfigs();
    } catch (error) {
      console.error('Failed to create config:', error);
      alert('创建配置失败');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('确定要删除此 GitLab 配置吗？')) return;

    try {
      await gitlabService.deleteConfig(id);
      loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      alert('删除配置失败');
    }
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
            <h2 className="section__title">GitLab 集成</h2>
            <p className="section__subtitle">配置 GitLab 连接以自动同步仓库和分支信息</p>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            添加 GitLab 配置
          </button>
        </div>

        <div className="grid grid--cols-3 mb-8">
          <div className="card card--bordered">
            <div className="card__icon card__icon--primary">
              <GitBranch size={20} />
            </div>
            <h3>自动同步</h3>
            <p>连接 GitLab 后自动同步项目、分支信息</p>
          </div>
          <div className="card card--bordered">
            <div className="card__icon card__icon--success">
              <CheckCircle size={20} />
            </div>
            <h3>Webhook 集成</h3>
            <p>代码提交后自动触发构建和部署流程</p>
          </div>
          <div className="card card--bordered">
            <div className="card__icon card__icon--info">
              <Settings size={20} />
            </div>
            <h3>多实例支持</h3>
            <p>支持 GitLab.com 和自托管 GitLab 实例</p>
          </div>
        </div>

        {configs.length === 0 ? (
          <div className="card card--bordered text-center py-12">
            <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无 GitLab 配置</h3>
            <p className="text-gray-500 mb-4">添加第一个 GitLab 配置以开始集成</p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              添加配置
            </button>
          </div>
        ) : (
          <div className="stack stack--gap-lg">
            {configs.map((config) => (
              <div className="card card--bordered" key={config.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{config.name}</h3>
                    <p className="text-sm text-gray-600">{config.gitlab_url}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16} />
                    已配置
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>创建时间: {new Date(config.created_at).toLocaleString('zh-CN')}</span>
                  <span>更新时间: {new Date(config.updated_at).toLocaleString('zh-CN')}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="button button--ghost text-red-600"
                    onClick={() => handleDeleteConfig(config.id)}
                  >
                    <Trash2 size={14} />
                    删除
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
            <h3 className="text-xl font-semibold mb-4">添加 GitLab 配置</h3>
            <form onSubmit={handleCreateConfig}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">配置名称</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例如: 公司 GitLab"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">GitLab URL</label>
                <input
                  type="url"
                  className="input"
                  value={formData.gitlab_url}
                  onChange={(e) => setFormData({ ...formData, gitlab_url: e.target.value })}
                  required
                  placeholder="https://gitlab.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  GitLab.com 或自托管实例的 URL
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Access Token</label>
                <input
                  type="password"
                  className="input"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  required
                  placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  需要 api, read_repository 权限的 Personal Access Token
                </p>
              </div>

              {connectionResult && (
                <div className={`mb-4 p-3 rounded-lg ${
                  connectionResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {connectionResult.success ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    <span className="text-sm">{connectionResult.message}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setConnectionResult(null);
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !formData.gitlab_url || !formData.access_token}
                >
                  {testingConnection ? '测试中...' : '测试连接'}
                </button>
                <button 
                  type="submit" 
                  className="button button--primary"
                  disabled={!connectionResult?.success}
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitLabIntegration;
