import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Topbar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
