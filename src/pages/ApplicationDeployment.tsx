import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { deploymentService } from '../services/deploymentService';
import type { Database } from '../lib/database.types';

type Application = Database['public']['Tables']['applications']['Row'];
type Deployment = Database['public']['Tables']['deployments']['Row'];

const ApplicationDeployment = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (applicationId) {
      loadData();
    }
  }, [applicationId]);

  useEffect(() => {
    if (currentDeployment && currentDeployment.status !== 'deployed' && currentDeployment.status !== 'failed') {
      let unsubscribe: (() => void) | null = null;
      
      deploymentService.subscribeToDeployment(
        currentDeployment.id,
        (updatedDeployment) => {
          setCurrentDeployment(updatedDeployment);
          if (updatedDeployment.status === 'deployed' || updatedDeployment.status === 'failed') {
            loadDeployments();
          }
        }
      ).then((unsub) => {
        unsubscribe = unsub;
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [currentDeployment]);

  const loadData = async () => {
    if (!applicationId) return;

    try {
      const [appData, deploymentsData] = await Promise.all([
        applicationService.getApplicationById(applicationId),
        applicationService.getApplicationDeployments(applicationId),
      ]);

      setApplication(appData);
      setDeployments(deploymentsData);
      setVersion(`v${Date.now()}`);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeployments = async () => {
    if (!applicationId) return;
    
    try {
      const deploymentsData = await applicationService.getApplicationDeployments(applicationId);
      setDeployments(deploymentsData);
    } catch (error) {
      console.error('Failed to load deployments:', error);
    }
  };

  const handleDeploy = async () => {
    if (!applicationId || deploying) return;

    setDeploying(true);
    try {
      const deployment = await deploymentService.startDeployment(applicationId, version);
      setCurrentDeployment(deployment);
      setVersion(`v${Date.now()}`);
    } catch (error) {
      console.error('Failed to start deployment:', error);
      alert('启动部署失败');
    } finally {
      setDeploying(false);
    }
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
      case 'rolled_back':
        return <XCircle className="text-red-600" size={20} />;
      case 'building':
      case 'deploying':
      case 'pending':
        return <Clock className="text-blue-600 animate-spin" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: Deployment['status']) => {
    const statusMap = {
      pending: '等待中',
      building: '构建中',
      deploying: '部署中',
      deployed: '已部署',
      failed: '失败',
      rolled_back: '已回滚',
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

  if (!application) {
    return (
      <div className="page">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">应用不存在</p>
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h2 className="section__title">{application.name}</h2>
            <p className="section__subtitle">
              {application.gitlab_repo} @ {application.gitlab_branch}
            </p>
          </div>
        </div>

        <div className="card card--bordered mb-6">
          <h3 className="font-semibold text-lg mb-4">部署新版本</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">版本号</label>
              <input
                type="text"
                className="input"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
              />
            </div>
            <button
              type="button"
              className="button button--primary"
              onClick={handleDeploy}
              disabled={deploying || !version}
            >
              <Play size={16} />
              {deploying ? '启动中...' : '开始部署'}
            </button>
          </div>
        </div>

        {currentDeployment && (
          <div className="card card--bordered mb-6">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(currentDeployment.status)}
              <div>
                <h3 className="font-semibold text-lg">当前部署: {currentDeployment.version}</h3>
                <p className="text-sm text-gray-500">
                  状态: {getStatusText(currentDeployment.status)}
                </p>
              </div>
            </div>

            {currentDeployment.build_logs && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">构建日志</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {currentDeployment.build_logs}
                </pre>
              </div>
            )}

            {currentDeployment.deploy_logs && (
              <div>
                <h4 className="font-medium mb-2">部署日志</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {currentDeployment.deploy_logs}
                </pre>
              </div>
            )}

            {currentDeployment.status === 'deployed' && currentDeployment.image_url && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle size={16} />
                  <span className="font-medium">部署成功！</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  镜像: {currentDeployment.image_url}
                </p>
                <p className="text-sm text-green-700">
                  应用现在可以通过服务访问
                </p>
              </div>
            )}

            {currentDeployment.status === 'failed' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle size={16} />
                  <span className="font-medium">部署失败</span>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  请检查日志以了解失败原因
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-semibold text-lg mb-4">部署历史</h3>
          {deployments.length === 0 ? (
            <div className="card card--bordered text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无部署记录</h3>
              <p className="text-gray-500">开始第一次部署</p>
            </div>
          ) : (
            <div className="stack stack--gap-md">
              {deployments.map((deployment) => (
                <div className="card card--bordered" key={deployment.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <h4 className="font-medium">{deployment.version}</h4>
                        <p className="text-sm text-gray-500">
                          开始于 {new Date(deployment.started_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {getStatusText(deployment.status)}
                      </span>
                      {deployment.completed_at && (
                        <p className="text-xs text-gray-500">
                          完成于 {new Date(deployment.completed_at).toLocaleString('zh-CN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ApplicationDeployment;
