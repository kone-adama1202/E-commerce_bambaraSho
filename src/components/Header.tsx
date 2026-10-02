import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Search,
  ChevronDown,
  HelpCircle,
  Truck,
  ShieldCheck,
  Headphones,
  Home,
  Store,
  LayoutGrid,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { navigate } from '@/lib/router';

/* Palette Jumia : orange #F68B1E (hover #E07B0F), texte #282828, fond gris #F1F1F2 */

const PROMOS = [
  { icon: Truck, text: 'Livraison rapide partout' },
  { icon: ShieldCheck, text: 'Paiement à la livraison disponible' },
  { icon: Headphones, text: 'Service client à votre écoute' },
];

const HEADER_STYLES = `
@keyframes hdrPromoIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes hdrBadgePop { 0% { transform: scale(0.4); } 55% { transform: scale(1.35); } 100% { transform: scale(1); } }
@keyframes hdrWiggle { 0%,100% { transform: rotate(0); } 20% { transform: rotate(-14deg); } 45% { transform: rotate(10deg); } 70% { transform: rotate(-6deg); } }
@keyframes hdrShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes hdrMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes hdrDropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes hdrPass {
  from { left: 100%; transform: translateX(0); }
  to   { left: 0%;   transform: translateX(-100%); }
}
@keyframes hdrFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes hdrTileIn { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.hdr-promo-in { animation: hdrPromoIn .5s cubic-bezier(.22,1,.36,1); }
.hdr-badge-pop { animation: hdrBadgePop .45s cubic-bezier(.34,1.56,.64,1); }
.hdr-wiggle { animation: hdrWiggle .6s ease-in-out; transform-origin: 50% 0%; }
.hdr-shimmer { background-size: 200% 100%; animation: hdrShimmer 6s linear infinite; }
.hdr-marquee { animation: hdrMarquee 9s linear infinite; will-change: transform; }
.hdr-logo:hover .hdr-marquee { animation-play-state: paused; }
.hdr-pass { left: 50%; transform: translateX(-50%); animation: hdrPass 7s linear infinite; will-change: left, transform; }
.hdr-logo:active .hdr-pass { animation-play-state: paused; }
.hdr-drop-in { animation: hdrDropIn .22s cubic-bezier(.22,1,.36,1); transform-origin: top right; }
.hdr-fade-in { animation: hdrFade .25s ease-out; }
.hdr-tile-in { animation: hdrTileIn .42s cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) {
  .hdr-promo-in, .hdr-badge-pop, .hdr-wiggle, .hdr-shimmer, .hdr-drop-in, .hdr-marquee, .hdr-fade-in, .hdr-tile-in, .hdr-pass { animation: none !important; }
}
`;

const pathOf = (h: string) => h.split('?')[0];

type MobileLink = { href: string; label: string; icon: LucideIcon; badge?: number };

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [bump, setBump] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [hash, setHash] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'
  );
  const prevItems = useRef(totalItems);
  const headerRef = useRef<HTMLElement>(null);
  const scrollSources = useRef(new Map<EventTarget, number>());
  const prevPath = useRef(pathOf(typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'));

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, []);

  // Header qui se compacte au scroll. Fonctionne avec le scroll de la page ET avec
  // un conteneur de page scrollable (ex. layout admin en overflow-auto).
  useEffect(() => {
    const sources = scrollSources.current;

    const update = () => {
      // oublie les conteneurs qui ont disparu avec la page précédente
      sources.forEach((_, k) => {
        if (k instanceof HTMLElement && !k.isConnected) sources.delete(k);
      });
      const top = Math.max(0, ...sources.values());
      // hystérésis : évite le va-et-vient quand la page est courte
      setScrolled(prev => (prev ? top > 8 : top > 56));
    };

    const onScroll = (e: Event) => {
      const t = e.target;
      if (t === document || t === document.documentElement || t === document.body) {
        sources.set(window, window.scrollY);
      } else if (t instanceof HTMLElement) {
        if (t.closest('[data-hdr-ignore]')) return; // menu mobile du header
        if (t.scrollHeight <= t.clientHeight) return; // pas de scroll vertical
        if (t.clientHeight < window.innerHeight * 0.5) return; // petites listes, carrousels
        sources.set(t, t.scrollTop);
      } else {
        return;
      }
      update();
    };

    sources.set(window, window.scrollY);
    update();
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('scroll', onScroll, true);
      sources.clear();
    };
  }, []);

  // Hauteur du header exposée aux autres pages : var(--header-h)
  // + les liens d'ancre ne passent plus sous le header.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    update();
    root.style.setProperty('scroll-padding-top', 'var(--header-h)');
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--header-h');
      root.style.removeProperty('scroll-padding-top');
    };
  }, []);

  // Lien actif + fermeture des menus + retour en haut à chaque changement de page
  // (un simple changement de filtre, ex. ?category=..., ne remonte pas la page)
  useEffect(() => {
    const onHash = () => {
      const next = window.location.hash || '#/';
      setHash(next);
      closeAll();
      if (pathOf(next) !== prevPath.current) {
        prevPath.current = pathOf(next);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        scrollSources.current.forEach((_, k) => {
          if (k instanceof HTMLElement) k.scrollTop = 0;
        });
        scrollSources.current.clear();
        scrollSources.current.set(window, 0);
        setScrolled(false);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [closeAll]);

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!mobileOpen && !userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, userMenuOpen, closeAll]);

  // Empêche la page de défiler derrière le menu mobile
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Le menu flottant se cale juste sous le header, même si celui-ci change de hauteur
  useLayoutEffect(() => {
    if (!mobileOpen) return;
    const el = headerRef.current;
    if (!el) return;
    const update = () => setMenuTop(el.getBoundingClientRect().bottom);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobileOpen]);

  // Ferme le menu mobile si l'écran devient large (rotation, redimensionnement)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Messages du bandeau qui défilent
  useEffect(() => {
    const id = setInterval(() => setPromoIndex(i => (i + 1) % PROMOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  // Animation du panier quand on ajoute un article
  useEffect(() => {
    if (totalItems > prevItems.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 650);
      prevItems.current = totalItems;
      return () => clearTimeout(t);
    }
    prevItems.current = totalItems;
  }, [totalItems]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      closeAll();
    }
  }

  function isActive(href: string) {
    if (href === '#/') return hash === '#/' || hash === '' || hash === '#';
    return hash.startsWith(href);
  }

  const displayName = profile?.full_name?.split(' ')[0] || 'Compte';
  const initial = (profile?.full_name || user?.email || '?').trim().charAt(0).toUpperCase();
  const Promo = PROMOS[promoIndex];

  const mobileLinks: MobileLink[] = [
    { href: '#/', label: 'Accueil', icon: Home },
    { href: '#/products', label: 'Produits', icon: Store },
    { href: '#/categories', label: 'Catégories', icon: LayoutGrid },
    { href: '#/cart', label: 'Panier', icon: ShoppingCart, badge: totalItems },
    ...(user ? [{ href: '#/orders', label: 'Mes commandes', icon: Package }] : []),
    ...(user && isAdmin
      ? [{ href: '#/admin', label: 'Administration', icon: LayoutDashboard }]
      : []),
  ];

  return (
    <>
      <header
        ref={headerRef}
        // Toucher un lien dans le header ferme toujours les menus
        onClick={e => {
          if ((e.target as HTMLElement).closest('a')) closeAll();
        }}
        className={`sticky top-0 z-50 pt-[env(safe-area-inset-top)] bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled
            ? 'shadow-[0_6px_20px_-6px_rgba(0,0,0,0.18)]'
            : 'shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]'
        }`}
      >
        <style>{HEADER_STYLES}</style>

        {/* Bandeau promo animé (se replie au scroll) */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
          }`}
        >
          <div className="hdr-shimmer bg-gradient-to-r from-[#F68B1E] via-[#FFA64D] to-[#F68B1E] text-white text-xs sm:text-base font-medium h-8 sm:h-10 flex items-center justify-center px-3 sm:px-4">
            <span key={promoIndex} className="hdr-promo-in flex items-center gap-2 max-w-full min-w-0">
              <Promo.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">{Promo.text}</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div
            className={`flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-8 transition-[height] duration-300 ease-out ${
              scrolled ? 'h-[60px] sm:h-16 md:h-[72px]' : 'h-16 sm:h-[72px] md:h-24'
            }`}
          >
            {/* Bouton menu mobile */}
            <button
              onClick={() => {
                setUserMenuOpen(false);
                setMobileOpen(v => !v);
              }}
              className={`md:hidden shrink-0 w-11 h-11 flex items-center justify-center rounded-full active:scale-90 transition-all duration-300 ${
                mobileOpen ? 'bg-[#FFF3E5]' : 'bg-[#F4F4F5]'
              }`}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              <HamburgerIcon open={mobileOpen} />
            </button>

            {/* Recherche - mobile (à la place du titre) */}
            <form onSubmit={handleSearch} className="md:hidden flex-1 min-w-0">
              <div className="relative rounded-full transition-shadow duration-300 focus-within:shadow-[0_0_0_4px_rgba(246,139,30,0.18)]">
                <input
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={closeAll}
                  placeholder="Rechercher un produit"
                  aria-label="Rechercher un produit"
                  className="w-full h-11 pl-4 pr-12 rounded-full bg-[#F4F4F5] border-2 border-transparent text-base text-[#282828] placeholder:text-[#75757A] outline-none focus:bg-white focus:border-[#F68B1E] transition-all [&::-webkit-search-cancel-button]:appearance-none"
                />
                <button
                  type="submit"
                  aria-label="Rechercher"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#F68B1E] hover:bg-[#E07B0F] text-white flex items-center justify-center shadow-sm active:scale-90 transition-all"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
              </div>
            </form>

            {/* Search bar - desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex shrink-0 w-[250px] lg:w-[340px] xl:w-[420px] items-stretch rounded-lg transition-shadow duration-300 focus-within:shadow-[0_0_0_4px_rgba(246,139,30,0.18)]"
            >
              <div className="relative flex-1 group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#75757A] transition-colors group-focus-within/search:text-[#F68B1E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className={`w-full pl-12 pr-4 rounded-l-lg bg-[#F1F1F2] border-2 border-transparent text-base text-[#282828] placeholder:text-[#75757A] outline-none focus:bg-white focus:border-[#F68B1E] transition-all duration-300 ${
                    scrolled ? 'h-11' : 'h-[52px]'
                  }`}
                />
              </div>
              <button
                type="submit"
                aria-label="Rechercher"
                className={`px-4 xl:px-8 rounded-r-lg bg-[#F68B1E] hover:bg-[#E07B0F] active:scale-[0.97] text-white text-base font-bold uppercase tracking-wide transition-all duration-300 ${
                  scrolled ? 'h-11' : 'h-[52px]'
                }`}
              >
                <span className="hidden xl:inline">Rechercher</span>
                <Search className="w-5 h-5 xl:hidden" />
              </button>
            </form>

            {/* Titre - desktop (à la place du champ de recherche) */}
            <LogoMarquee scrolled={scrolled} variant="row" className="hidden md:flex flex-1 min-w-0" />

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-2 ml-auto shrink-0">
              {/* Compte */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setUserMenuOpen(v => !v);
                    }}
                    aria-label="Mon compte"
                    aria-expanded={userMenuOpen}
                    className="group flex items-center justify-center gap-2 min-w-11 h-11 px-2 lg:px-4 rounded-full bg-[#F4F4F5] lg:bg-transparent hover:bg-[#FFF3E5] hover:text-[#F68B1E] active:scale-95 transition-all text-[#282828]"
                  >
                    <User className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" />
                    <span className="hidden lg:block text-base font-medium max-w-[110px] truncate">
                      Salut, {displayName}
                    </span>
                    <ChevronDown
                      className={`hidden lg:block w-4 h-4 transition-transform duration-300 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="hdr-drop-in absolute right-0 mt-2 w-[min(16rem,calc(100vw-1.5rem))] bg-white rounded-2xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 mb-1 border-b border-[#EDEDED] bg-gradient-to-r from-[#FFF3E5] to-white">
                        <p className="text-sm font-semibold text-[#282828] truncate">
                          {profile?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-[#75757A] truncate">{user.email}</p>
                      </div>
                      <MenuItem
                        icon={<Package className="w-5 h-5" />}
                        label="Mes commandes"
                        onClick={() => { navigate('/orders'); setUserMenuOpen(false); }}
                      />
                      {isAdmin && (
                        <MenuItem
                          icon={<LayoutDashboard className="w-5 h-5" />}
                          label="Administration"
                          onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                        />
                      )}
                      <div className="px-4 pt-2 mt-1 border-t border-[#EDEDED]">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); navigate('/'); }}
                          className="w-full h-10 rounded-lg bg-[#F68B1E] hover:bg-[#E07B0F] active:scale-[0.97] text-white text-sm font-bold uppercase tracking-wide transition-all"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="#/auth"
                  aria-label="Connexion"
                  className="group flex items-center justify-center gap-2 min-w-11 h-11 px-2 lg:px-4 rounded-full bg-[#F4F4F5] lg:bg-transparent hover:bg-[#FFF3E5] hover:text-[#F68B1E] active:scale-95 transition-all text-[#282828]"
                >
                  <User className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" />
                  <span className="hidden lg:block text-base font-medium">Connexion</span>
                </a>
              )}

              {/* Aide */}
              <a
                href="#/"
                className="group hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-[#FFF3E5] hover:text-[#F68B1E] active:scale-95 transition-all text-[#282828]"
              >
                <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-base font-medium">Aide</span>
              </a>

              {/* Panier */}
              <a
                href="#/cart"
                className="group flex items-center justify-center gap-2 min-w-11 h-11 px-2 lg:px-4 rounded-full bg-[#F4F4F5] lg:bg-transparent hover:bg-[#FFF3E5] hover:text-[#F68B1E] active:scale-95 transition-all text-[#282828]"
                aria-label={totalItems > 0 ? `Panier, ${totalItems} article${totalItems > 1 ? 's' : ''}` : 'Panier'}
              >
                <span className="relative">
                  <ShoppingCart
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                      bump ? 'hdr-wiggle' : ''
                    }`}
                  />
                  {totalItems > 0 && (
                    <span
                      key={totalItems}
                      className="hdr-badge-pop absolute -top-2 -right-2.5 bg-[#F68B1E] text-white text-[11px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white"
                    >
                      {totalItems}
                    </span>
                  )}
                </span>
                <span className="hidden lg:block text-base font-medium">Panier</span>
              </a>
            </div>
          </div>

          {/* Titre - mobile (à la place de la recherche) */}
          <div
            className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
              scrolled ? 'max-h-0 opacity-0' : 'max-h-14 opacity-100'
            }`}
          >
            <LogoMarquee scrolled={scrolled} variant="strip" className="flex w-full pb-2" />
          </div>
        </div>

        {/* Navigation secondaire - desktop */}
        <nav className="hidden md:block border-t border-[#EDEDED]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4 pb-4">
            <NavLink href="#/" label="Accueil" active={isActive('#/')} />
            <NavLink href="#/products" label="Produits" active={isActive('#/products')} />
            <NavLink href="#/categories" label="Catégories" active={isActive('#/categories')} />
          </div>
        </nav>
      </header>

      {/* Fond assombri : toucher n'importe où à côté ferme tout.
          Placé hors du <header> car backdrop-blur y piégerait un élément "fixed". */}
      {(mobileOpen || userMenuOpen) && (
        <div
          onClick={closeAll}
          aria-hidden="true"
          className={`fixed inset-0 z-40 ${
            mobileOpen
              ? 'hdr-fade-in bg-[#1F1408]/50 backdrop-blur-[3px] touch-none md:bg-transparent md:backdrop-blur-none'
              : ''
          }`}
        />
      )}

      {/* Menu mobile : carte flottante compacte sous le header */}
      <div
        onClick={e => {
          if ((e.target as HTMLElement).closest('a')) closeAll();
        }}
        aria-hidden={!mobileOpen}
        data-hdr-ignore="true"
        style={{ top: menuTop + 8, maxHeight: `calc(100dvh - ${menuTop + 8}px - 12px)` }}
        className={`md:hidden fixed inset-x-3 z-[45] overflow-y-auto overscroll-contain rounded-3xl bg-white p-2.5 shadow-[0_24px_60px_-14px_rgba(40,20,0,0.5)] ring-1 ring-black/5 origin-top transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
          mobileOpen
            ? 'visible opacity-100 translate-y-0 scale-100'
            : 'invisible opacity-0 -translate-y-3 scale-[0.96]'
        }`}
      >
        {/* Carte d'accueil / profil */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F68B1E] to-[#FFA64D] px-3.5 py-3 text-[#282828] ${
            mobileOpen ? 'hdr-tile-in' : ''
          }`}
        >
          <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20" />
          <span className="pointer-events-none absolute -bottom-10 right-8 h-20 w-20 rounded-full bg-white/15" />

          {user ? (
            <div className="relative flex items-center gap-3">
              <span className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-white font-display text-lg font-extrabold text-[#F68B1E] shadow-md ring-2 ring-white/50">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-extrabold leading-tight truncate">
                  Salut, {displayName}
                </p>
                <p className="text-xs font-medium text-[#282828]/75 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-extrabold leading-tight">Bienvenue !</p>
                <p className="text-xs font-medium text-[#282828]/80">Suivez vos commandes.</p>
              </div>
              <a
                href="#/auth"
                className="shrink-0 flex h-10 items-center justify-center rounded-xl bg-[#282828] px-4 text-xs font-bold uppercase tracking-wide text-white shadow-md active:scale-[0.96] transition-transform"
              >
                Connexion
              </a>
            </div>
          )}
        </div>

        {/* Tuiles de navigation */}
        <nav className="mt-2 grid grid-cols-2 gap-2">
          {mobileLinks.map((link, i) => (
            <MobileTile
              key={link.href}
              {...link}
              active={isActive(link.href)}
              animate={mobileOpen}
              index={i + 1}
              wide={mobileLinks.length % 2 === 1 && i === mobileLinks.length - 1}
            />
          ))}
        </nav>

        {user && (
          <button
            onClick={() => { signOut(); closeAll(); navigate('/'); }}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#75757A] hover:bg-[#FFF3E5] hover:text-[#F68B1E] active:scale-[0.98] transition-all"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        )}
      </div>
    </>
  );
}

/* Hamburger animé qui se transforme en croix */
function HamburgerIcon({ open }: { open: boolean }) {
  const bar = 'absolute left-0 h-[2px] rounded-full transition-all duration-300 ease-out';
  return (
    <span className="relative block w-5 h-4" aria-hidden="true">
      <span
        className={`${bar} w-full ${
          open ? 'top-[7px] rotate-45 bg-[#F68B1E]' : 'top-0 bg-[#282828]'
        }`}
      />
      <span
        className={`${bar} top-[7px] bg-[#282828] ${
          open ? 'w-full opacity-0 scale-x-0' : 'w-3.5 opacity-100'
        }`}
      />
      <span
        className={`${bar} w-full ${
          open ? 'top-[7px] -rotate-45 bg-[#F68B1E]' : 'top-[14px] bg-[#282828]'
        }`}
      />
    </span>
  );
}

function LogoMarquee({
  scrolled,
  variant,
  className = '',
}: {
  scrolled: boolean;
  variant: 'row' | 'strip';
  className?: string;
}) {
  const mask = 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)';

  // Mobile : un seul titre traverse l'écran. Le suivant ne démarre
  // que lorsque le précédent a complètement disparu.
  if (variant === 'strip') {
    return (
      <a href="#/" aria-label="BambaraShop" className={`hdr-logo ${className}`}>
        <span
          className="relative block h-9 w-full overflow-hidden"
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        >
          <span className="hdr-pass absolute inset-y-0 flex items-center gap-3 whitespace-nowrap font-display text-2xl font-extrabold tracking-tight text-[#282828] sm:text-3xl">
            <span>
              Bambara<span className="text-[#F68B1E]">Shop</span>
            </span>
            <span className="h-2 w-2 rounded-full bg-[#F68B1E]" />
          </span>
        </span>
      </a>
    );
  }

  // Desktop / tablette : défilement continu
  const size = scrolled ? 'text-2xl md:text-3xl' : 'text-3xl lg:text-4xl';

  return (
    <a href="#/" aria-label="BambaraShop" className={`hdr-logo items-center ${className}`}>
      <span className="block w-full overflow-hidden" style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <span className="hdr-marquee inline-flex whitespace-nowrap">
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              aria-hidden={i > 0}
              className={`inline-flex items-center gap-4 pr-4 font-display font-extrabold tracking-tight text-[#282828] transition-[font-size] duration-300 ${size}`}
            >
              <span>
                Bambara<span className="text-[#F68B1E]">Shop</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#F68B1E]" />
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`group relative px-6 py-3.5 flex items-center justify-center text-base font-medium transition-colors ${
        active ? 'text-[#F68B1E]' : 'text-[#282828] hover:text-[#F68B1E]'
      }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-t bg-[#F68B1E] transition-all duration-300 ease-out ${
          active ? 'w-full' : 'w-0 group-hover:w-full'
        }`}
      />
    </a>
  );
}

/* Tuile compacte du menu mobile : icône + libellé sur une ligne */
function MobileTile({
  href,
  label,
  icon: Icon,
  badge,
  active,
  animate,
  index,
  wide,
}: MobileLink & { active: boolean; animate: boolean; index: number; wide: boolean }) {
  return (
    <a
      href={href}
      style={{ animationDelay: `${60 + index * 40}ms` }}
      className={`relative flex items-center gap-2.5 rounded-xl border px-2.5 py-2 min-h-[52px] active:scale-[0.97] transition-all ${
        wide ? 'col-span-2' : ''
      } ${animate ? 'hdr-tile-in' : ''} ${
        active
          ? 'border-[#F68B1E]/40 bg-[#FFF3E5] text-[#E07B0F]'
          : 'border-transparent bg-[#F7F7F8] text-[#282828] hover:bg-[#FFF3E5]'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active ? 'bg-[#F68B1E] text-white shadow-sm shadow-[#F68B1E]/30' : 'bg-white text-[#F68B1E] shadow-sm'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">{label}</span>
      {!!badge && badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F68B1E] px-1.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </a>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#282828] hover:bg-[#FFF3E5] hover:text-[#F68B1E] hover:pl-6 transition-all"
    >
      <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
      {label}
    </button>
  );
}