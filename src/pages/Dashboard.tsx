import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import EnvironmentPill from '../components/ui/EnvironmentPill';
import {
  environments,
  pipelineActivities,
  projects,
  databases,
  backupPolicies
} from '../data/mockData';

const Dashboard = () => {
  const runningProjects = projects.filter((project) => project.status === '运行中').length;
  const buildingProjects = projects.filter((project) => project.status === '构建中').length;
  const failedProjects = projects.filter((project) => project.status === '失败').length;
  const enabledBackups = backupPolicies.filter((policy) => policy.status === '启用').length;

  return (
    <div className="page">
      <section className="page__section">
        <h2 className="section__title">概览</h2>
        <div className="grid grid--cols-4">
          <MetricCard
            title="在线项目"
            value={runningProjects}
            description={`共有 ${projects.length} 个 GitLab 项目被纳管`}
            trend={<span className="trend trend--positive">+4% WoW</span>}
          />
          <MetricCard
            title="构建中 / 失败"
            value={`${buildingProjects} / ${failedProjects}`}
            description="实时掌握正在构建与异常的部署"
            trend={<span className="trend trend--warning">请关注构建状态</span>}
          />
          <MetricCard
            title="数据库实例"
            value={databases.length}
            description="一键部署的 MySQL / Redis / PostgreSQL"
            trend={<span className="trend trend--info">2 套启用自动备份</span>}
          />
          <MetricCard
            title="有效备份策略"
            value={enabledBackups}
            description={`共有 ${backupPolicies.length} 条策略`}
            trend={<span className="trend trend--positive">SLA 100%</span>}
          />
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">最近流水线活动</h2>
          <p className="section__subtitle">GitLab 提交驱动的自动构建与部署实时呈现</p>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>项目</th>
                <th>阶段</th>
                <th>状态</th>
                <th>耗时</th>
                <th>触发人</th>
                <th>开始时间</th>
              </tr>
            </thead>
            <tbody>
              {pipelineActivities.map((activity) => {
                const project = projects.find((item) => item.id === activity.projectId);
                return (
                  <tr key={activity.id}>
                    <td>
                      <div className="table__primary">
                        <p>{project?.name ?? activity.projectId}</p>
                        <span>{project?.repository}</span>
                      </div>
                    </td>
                    <td>{activity.stage}</td>
                    <td>
                      <StatusBadge
                        tone={
                          activity.status === '成功'
                            ? 'success'
                            : activity.status === '运行中'
                            ? 'info'
                            : 'critical'
                        }
                      >
                        {activity.status}
                      </StatusBadge>
                    </td>
                    <td>{activity.duration}</td>
                    <td>{activity.triggeredBy}</td>
                    <td>{activity.startedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">环境健康</h2>
          <p className="section__subtitle">跨环境部署的状态与资源使用情况</p>
        </div>
        <div className="grid grid--cols-3">
          {environments.map((environment) => (
            <div className="card card--environment" key={environment.name}>
              <div className="card__header">
                <div>
                  <h3>{environment.name}</h3>
                  <EnvironmentPill type={environment.type} />
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
              <dl className="description-list">
                <div>
                  <dt>集群</dt>
                  <dd>{environment.cluster}</dd>
                </div>
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
                  <dt>访问域名</dt>
                  <dd>
                    <a href={environment.url} className="link" target="_blank" rel="noreferrer">
                      {environment.url}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
