import { Database, HardDriveDownload, ShieldCheck } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { databases } from '../data/mockData';

const Databases = () => {
  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">数据库服务</h2>
          <p className="section__subtitle">一键部署与管理 MySQL、Redis、PostgreSQL 等云原生数据库</p>
        </div>
        <div className="grid grid--cols-3">
          <div className="card card--bordered">
            <div className="card__icon card__icon--primary">
              <Database size={20} />
            </div>
            <h3>即时启动</h3>
            <p>通过模板快速创建数据库实例，自动绑定持久化存储。</p>
          </div>
          <div className="card card--bordered">
            <div className="card__icon card__icon--success">
              <ShieldCheck size={20} />
            </div>
            <h3>安全加固</h3>
            <p>默认开启访问控制、TLS 加密以及审计日志。</p>
          </div>
          <div className="card card--bordered">
            <div className="card__icon card__icon--warning">
              <HardDriveDownload size={20} />
            </div>
            <h3>备份与恢复</h3>
            <p>支持全量/增量备份，自定义计划与跨区域存储。</p>
          </div>
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">实例概览</h2>
          <p className="section__subtitle">统一可视化数据库状态、容量与连接信息</p>
        </div>
        <div className="stack stack--gap-lg">
          {databases.map((databaseService) => (
            <div className="card card--database" key={databaseService.id}>
              <div className="card__header">
                <div>
                  <h3>{databaseService.id}</h3>
                  <p className="muted">{databaseService.type} · {databaseService.version}</p>
                </div>
                <StatusBadge tone={databaseService.status === '运行中' ? 'success' : 'info'}>
                  {databaseService.status}
                </StatusBadge>
              </div>
              <div className="database__grid">
                <div>
                  <span className="database__label">存储容量</span>
                  <span>{databaseService.storage}</span>
                </div>
                <div>
                  <span className="database__label">连接串</span>
                  <code className="code-block">{databaseService.connectionUri}</code>
                </div>
                <div>
                  <span className="database__label">自动备份</span>
                  <StatusBadge tone={databaseService.autoBackup ? 'success' : 'warning'}>
                    {databaseService.autoBackup ? '已开启' : '未启用'}
                  </StatusBadge>
                </div>
                <div>
                  <span className="database__label">最后备份</span>
                  <span>{databaseService.lastBackupAt}</span>
                </div>
              </div>
              <div className="database__actions">
                <button type="button" className="button button--secondary">数据导出</button>
                <button type="button" className="button button--primary">调整资源</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Databases;
