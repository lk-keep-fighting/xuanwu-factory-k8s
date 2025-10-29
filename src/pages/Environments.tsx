import EnvironmentPill from '../components/ui/EnvironmentPill';
import StatusBadge from '../components/ui/StatusBadge';
import { environments, projects } from '../data/mockData';

const Environments = () => {
  const environmentProjects = environments.map((environment) => {
    return {
      environment,
      projects: projects.filter((project) => project.environments.includes(environment.type))
    };
  });

  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">多环境部署编排</h2>
          <p className="section__subtitle">定义生产、预览、测试等丰富环境，实现全链路交付</p>
        </div>
        <div className="stack stack--gap-lg">
          {environmentProjects.map(({ environment, projects: relatedProjects }) => (
            <div className="card card--environment" key={environment.name}>
              <div className="card__header">
                <div>
                  <h3>{environment.name}</h3>
                  <div className="environment__meta">
                    <EnvironmentPill type={environment.type} />
                    <span className="muted">{environment.cluster}</span>
                  </div>
                </div>
                <StatusBadge
                  tone={
                    environment.status === '健康'
                      ? 'success'
                      : environment.status === '告警'
                      ? 'warning'
                      : 'critical'
                  }
                >
                  {environment.status}
                </StatusBadge>
              </div>

              <div className="environment__grid">
                <div>
                  <h4>资源配额</h4>
                  <dl className="description-list">
                    <div>
                      <dt>副本数</dt>
                      <dd>{environment.replicas}</dd>
                    </div>
                    <div>
                      <dt>CPU</dt>
                      <dd>{environment.cpu}</dd>
                    </div>
                    <div>
                      <dt>内存</dt>
                      <dd>{environment.memory}</dd>
                    </div>
                    <div>
                      <dt>访问入口</dt>
                      <dd>
                        <a href={environment.url} className="link" target="_blank" rel="noreferrer">
                          {environment.url}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4>已部署项目</h4>
                  {relatedProjects.length === 0 ? (
                    <p className="muted">暂未关联项目</p>
                  ) : (
                    <ul className="list">
                      {relatedProjects.map((project) => (
                        <li key={project.id}>
                          <span>{project.name}</span>
                          <span className="muted">{project.branch}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4>自动化策略</h4>
                  <ul className="list list--bulleted">
                    <li>支持按分支或标签自动部署</li>
                    <li>可配置蓝绿、金丝雀、滚动多种发布策略</li>
                    <li>自动化健康检查与失败回滚</li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Environments;
