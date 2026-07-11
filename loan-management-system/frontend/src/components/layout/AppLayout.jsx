import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
    </>
  );
};

export default AppLayout;
