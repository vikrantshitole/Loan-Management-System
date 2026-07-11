import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import PublicLayout from '../components/layout/PublicLayout';
import HomePage from '../pages/HomePage';
import EmiCalculatorPage from '../pages/EmiCalculatorPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import CustomerDashboardContainer from '../pages/CustomerDashboardContainer';
import ApplyLoanPage from '../pages/ApplyLoanPage';
import LoanStatusPage from '../pages/LoanStatusPage';
import PaymentHistoryPage from '../pages/PaymentHistoryPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/emi-calculator" element={<EmiCalculatorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<CustomerDashboardContainer />} />
          <Route path="/apply-loan" element={<ApplyLoanPage />} />
          <Route path="/loans/:id/payments" element={<PaymentHistoryPage />} />
          <Route path="/loans/:id" element={<LoanStatusPage />} />
        </Route>

        <Route element={<ProtectedLayout adminOnly />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
