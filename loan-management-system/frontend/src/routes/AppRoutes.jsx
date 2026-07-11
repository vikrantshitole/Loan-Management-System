import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import EmiCalculatorPage from '../pages/EmiCalculatorPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/emi-calculator" element={<EmiCalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
