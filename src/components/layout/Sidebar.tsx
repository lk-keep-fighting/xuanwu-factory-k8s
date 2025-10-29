import { NavLink } from 'react-router-dom';
import { navigationItems } from '../../data/navigation';
import { clsx } from 'clsx';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">玄</div>
        <div>
          <p className="sidebar__title">玄武工厂</p>
          <p className="sidebar__subtitle">Kubernetes 应用工厂</p>
        </div>
      </div>
      <nav className="sidebar__nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx('sidebar__nav-item', isActive && 'sidebar__nav-item--active')
              }
            >
              <Icon className="sidebar__nav-icon" size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
