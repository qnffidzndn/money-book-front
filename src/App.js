import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { TabProvider } from './context/TabContext';
import Layout from './components/Layout';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route
            path="*"
            element={
              <TabProvider>
                <Layout />
              </TabProvider>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
