import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLayout from './AppLayout';
import Loader from '../ui/Loader';
import Navbar from './Navbar';

const PublicLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullPage label="Loading…" />;
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
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
