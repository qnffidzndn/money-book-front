import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Plan from './pages/Plan';
import Savings from './pages/Savings';
import Asset from './pages/Asset';
import Emergency from './pages/Emergency';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plan" element={<Plan />} />
          <Route path="savings" element={<Savings />} />
          <Route path="asset" element={<Asset />} />
          <Route path="emergency" element={<Emergency />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
