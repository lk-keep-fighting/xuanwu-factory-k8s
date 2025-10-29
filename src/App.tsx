import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectManagement from './pages/ProjectManagement';
import ApplicationManagement from './pages/ApplicationManagement';
import ApplicationDeployment from './pages/ApplicationDeployment';
import GitLabIntegration from './pages/GitLabIntegration';
import Environments from './pages/Environments';
import Databases from './pages/Databases';
import Backups from './pages/Backups';
import Monitoring from './pages/Monitoring';
import Logs from './pages/Logs';
import Infrastructure from './pages/Infrastructure';

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project-management" element={<ProjectManagement />} />
        <Route path="/projects/:projectId/applications" element={<ApplicationManagement />} />
        <Route path="/applications/:applicationId/deploy" element={<ApplicationDeployment />} />
        <Route path="/gitlab-integration" element={<GitLabIntegration />} />
        <Route path="/environments" element={<Environments />} />
        <Route path="/databases" element={<Databases />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
