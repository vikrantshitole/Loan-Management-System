import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const customerLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/apply-loan', label: 'Apply Loan' },
  { to: '/emi-calculator', label: 'EMI Calculator' },
];

const adminLinks = [{ to: '/admin', label: 'Admin Dashboard' }];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
