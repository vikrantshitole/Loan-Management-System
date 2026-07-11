import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PublicLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullPage label="Loading…" />;
  }

  if (isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="app-shell">
          <Sidebar />
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default PublicLayout;
