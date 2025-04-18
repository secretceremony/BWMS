import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Stok from './pages/stok';
import Laporan from './pages/Reports';
import Login from './pages/Login';
import LayoutDasar from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <LayoutDasar>
              <Dashboard />
            </LayoutDasar>
          }
        />
        <Route
          path="/stok"
          element={
            <LayoutDasar>
              <Stok />
            </LayoutDasar>
          }
        />
        <Route
          path="/laporan"
          element={
            <LayoutDasar>
              <Laporan />
            </LayoutDasar>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
