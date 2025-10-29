import StatusBadge from '../components/ui/StatusBadge';
import { backupPolicies, databases } from '../data/mockData';

const Backups = () => {
  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">自动备份策略</h2>
          <p className="section__subtitle">配置多种备份计划，保障数据库数据安全与恢复能力</p>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>策略名称</th>
                <th>目标实例</th>
                <th>执行计划</th>
                <th>保留策略</th>
                <th>状态</th>
                <th>最近执行</th>
              </tr>
            </thead>
            <tbody>
              {backupPolicies.map((policy) => {
                const target = databases.find((database) => database.id === policy.target);
                return (
                  <tr key={policy.id}>
                    <td>{policy.name}</td>
                    <td>
                      <div className="table__primary">
                        <p>{policy.target}</p>
                        <span>{target ? `${target.type} ${target.version}` : '自定义目标'}</span>
                      </div>
                    </td>
                    <td>{policy.schedule}</td>
                    <td>{policy.retention}</td>
                    <td>
                      <StatusBadge tone={policy.status === '启用' ? 'success' : 'warning'}>
                        {policy.status}
                      </StatusBadge>
                    </td>
                    <td>{policy.lastRun}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page__section">
        <h2 className="section__title">备份存储策略</h2>
        <div className="grid grid--cols-2">
          <div className="card">
            <h3>对象存储归档</h3>
            <ul className="list list--bulleted">
              <li>支持 S3、OSS、COS 等多种云存储</li>
              <li>自动加密、生命周期管理</li>
              <li>跨区域备份，满足合规要求</li>
            </ul>
          </div>
          <div className="card">
            <h3>恢复流程</h3>
            <ol className="list list--numbered">
              <li>选择备份点或 PITR 时间点</li>
              <li>指定目标环境与命名空间</li>
              <li>一键恢复并自动健康校验</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Backups;
