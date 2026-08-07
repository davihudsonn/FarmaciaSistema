import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import Pedidos from '@/pages/Pedidos';
import NovoPedido from '@/pages/NovoPedido';
import Relatorio from '@/pages/Relatorio';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}
            >
              <Route element={<AppLayout />}>
                <Route path="/" element={<Pedidos />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path="/novo-pedido" element={<NovoPedido />} />
                <Route path="/relatorio" element={<Relatorio />} />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;