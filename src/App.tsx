import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { AuthPage } from '@/pages/AuthPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { AdminPage } from '@/pages/AdminPage';
import { useRoute } from '@/lib/router';

function Router() {
  const route = useRoute();
  const { path, params } = route;

  if (path === '/' || path === '') return <HomePage />;
  if (path === '/products') return <ProductsPage search={params.search ?? null} categorySlug={params.category ?? null} />;
  if (path.startsWith('/product/')) return <ProductDetailPage productId={path.split('/')[2]} />;
  if (path === '/cart') return <CartPage />;
  if (path === '/checkout') return <CheckoutPage />;
  if (path === '/orders') return <OrdersPage />;
  if (path === '/categories') return <CategoriesPage />;
  if (path === '/auth') return <AuthPage />;
  if (path === '/admin') return <AdminPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">404</h1>
      <p className="text-stone-500 mb-6">Cette page n'existe pas.</p>
      <a href="#/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">Retour à l'accueil</a>
    </div>
  );
}

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
