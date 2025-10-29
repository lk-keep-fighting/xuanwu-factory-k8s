import { GitMerge, GitPullRequest, Settings, Terminal, Wrench } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import EnvironmentPill from '../components/ui/EnvironmentPill';
import { projects } from '../data/mockData';

const Projects = () => {
  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">GitLab 集成</h2>
          <p className="section__subtitle">在 玄武工厂 中统一管理 Git 提交触发的构建与部署</p>
        </div>
        <div className="grid grid--cols-3">
          <div className="card card--bordered">
            <div className="card__icon card__icon--primary">
              <GitMerge size={20} />
            </div>
            <h3>项目接入</h3>
            <p>连接 GitLab Group，自动同步项目、分支以及 Webhook。</p>
            <button type="button" className="button button--ghost">
              管理 GitLab Token
            </button>
          </div>
          <div className="card card--bordered">
            <div className="card__icon card__icon--success">
              <Wrench size={20} />
            </div>
            <h3>Dockerfile & Compose</h3>
            <p>支持单容器 Dockerfile 与多容器 Docker Compose 模式，自由配置 Build 阶段。</p>
            <button type="button" className="button button--ghost">
              新建构建模板
            </button>
          </div>
          <div className="card card--bordered">
            <div className="card__icon card__icon--warning">
              <GitPullRequest size={20} />
            </div>
            <h3>合并请求预览环境</h3>
            <p>自动为 Merge Request 分配临时环境，验证后自动销毁。</p>
            <button type="button" className="button button--ghost">
              查看环境策略
            </button>
          </div>
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">项目与流水线详情</h2>
          <p className="section__subtitle">为每个项目配置独立的构建策略、部署环境与自动回滚</p>
        </div>
        <div className="stack stack--gap-lg">
          {projects.map((project) => (
            <div className="card card--project" key={project.id}>
              <div className="card__header">
                <div>
                  <h3>{project.name}</h3>
                  <p className="muted">{project.repository}</p>
                </div>
                <StatusBadge
                  tone={
                    project.status === '运行中'
                      ? 'success'
                      : project.status === '构建中'
                      ? 'info'
                      : 'critical'
                  }
                >
                  {project.status}
                </StatusBadge>
              </div>

              <div className="project__meta">
                <div>
                  <span className="project__label">GitLab 分组</span>
                  <span>{project.gitlabGroup}</span>
                </div>
                <div>
                  <span className="project__label">跟踪分支</span>
                  <span>{project.branch}</span>
                </div>
                <div>
                  <span className="project__label">部署方式</span>
                  <span>{project.deploymentStrategy === 'compose' ? 'Docker Compose' : 'Dockerfile'}</span>
                </div>
                <div>
                  <span className="project__label">最后部署</span>
                  <span>{project.lastDeployedAt}</span>
                </div>
              </div>

              <div className="project__environments">
                <span className="project__label">关联环境</span>
                <div className="project__env-tags">
                  {project.environments.map((type) => (
                    <EnvironmentPill key={type} type={type} />
                  ))}
                </div>
              </div>

              <div className="project__footer">
                <button type="button" className="button button--secondary">
                  <Terminal size={16} />
                  执行部署脚本
                </button>
                <button type="button" className="button button--primary">
                  <Settings size={16} />
                  配置流水线
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Projects;
