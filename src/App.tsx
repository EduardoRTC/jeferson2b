import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './components/providers';
import { Header } from './components/layout/header';
import { Sidebar } from './components/layout/sidebar';
import { Suspense, lazy } from 'react';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/dashboard'));
const Products = lazy(() => import('./pages/products'));
const Orders = lazy(() => import('./pages/orders'));
const Customers = lazy(() => import('./pages/customers'));
const Suppliers = lazy(() => import('./pages/suppliers'));
const Transactions = lazy(() => import('./pages/transactions'));

function App() {
  return (
    <Router>
      <Providers>
        <div className="h-full relative">
          <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
            <Sidebar />
          </div>
          <main className="md:pl-72 pb-10">
            <Header />
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  Carregando...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/pedidos" element={<Orders />} />
                <Route path="/clientes" element={<Customers />} />
                <Route path="/fornecedores" element={<Suppliers />} />
                <Route path="/transacoes" element={<Transactions />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Providers>
    </Router>
  );
}

export default App;