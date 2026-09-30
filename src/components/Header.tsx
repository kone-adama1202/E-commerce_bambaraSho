import { useState } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Package, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { navigate } from '@/lib/router';

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <a href="#/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-600/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 hidden sm:block">
              Bambara<span className="text-brand-600">Shop</span>
            </span>
          </a>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-stone-100 border border-transparent focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all text-sm outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          </form>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="#/" label="Accueil" />
            <NavLink href="#/products" label="Produits" />
            <NavLink href="#/categories" label="Catégories" />
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <a
              href="#/cart"
              className="relative p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </a>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-scale-in origin-top-right">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'Utilisateur'}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>
                      <MenuItem icon={<Package className="w-4 h-4" />} label="Mes commandes" onClick={() => { navigate('/orders'); setUserMenuOpen(false); }} />
                      {isAdmin && (
                        <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Administration" onClick={() => { navigate('/admin'); setUserMenuOpen(false); }} />
                      )}
                      <MenuItem icon={<LogOut className="w-4 h-4" />} label="Déconnexion" onClick={() => { signOut(); setUserMenuOpen(false); navigate('/'); }} danger />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a href="#/auth" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                <User className="w-4 h-4" />
                Connexion
              </a>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 border border-transparent focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all text-sm outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </form>
            <div className="flex flex-col gap-1">
              <MobileNavLink href="#/" label="Accueil" onClick={() => setMobileOpen(false)} />
              <MobileNavLink href="#/products" label="Produits" onClick={() => setMobileOpen(false)} />
              <MobileNavLink href="#/categories" label="Catégories" onClick={() => setMobileOpen(false)} />
              {user ? (
                <>
                  <MobileNavLink href="#/orders" label="Mes commandes" onClick={() => setMobileOpen(false)} />
                  {isAdmin && <MobileNavLink href="#/admin" label="Administration" onClick={() => setMobileOpen(false)} />}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); navigate('/'); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </>
              ) : (
                <MobileNavLink href="#/auth" label="Connexion / Inscription" onClick={() => setMobileOpen(false)} />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-stone-50 transition-colors">
      {label}
    </a>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-stone-50 transition-colors">
      {label}
    </a>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-stone-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
