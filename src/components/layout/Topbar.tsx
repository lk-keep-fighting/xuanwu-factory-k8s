import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationItems } from '../../data/navigation';
import { Bell, Gitlab, RefreshCcw } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();

  const currentNav = useMemo(() => {
    return navigationItems.find((item) => item.path === location.pathname);
  }, [location.pathname]);

  return (
    <header className="topbar">
      <div>
        <p className="topbar__breadcrumb">{currentNav?.label ?? '概览'}</p>
        <p className="topbar__subtitle">管理 GitLab 应用、环境、数据库与 Kubernetes 集群</p>
      </div>
      <div className="topbar__actions">
        <Link to="/projects" className="topbar__link">
          <Gitlab size={18} />
          GitLab 集成
        </Link>
        <button type="button" className="topbar__icon-btn" aria-label="触发同步">
          <RefreshCcw size={18} />
        </button>
        <button type="button" className="topbar__icon-btn" aria-label="通知中心">
          <Bell size={18} />
        </button>
        <div className="topbar__avatar">XF</div>
      </div>
    </header>
  );
};

export default Topbar;
