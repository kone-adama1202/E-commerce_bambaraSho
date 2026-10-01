import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Package, Smartphone, Shirt, Footprints, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { TrustSection } from '@/components/TrustSection';

type SphereEntry = {
  name: string;
  image: string; // adresse en ligne (href) de l'image
  href: string;  // page ouverte au clic
  icon: React.ComponentType<{ className?: string }>;
};

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`;
const UP = (id: string) => `https://unsplash.com/photos/${id}/download?w=400`;

/* Images de la boule : remplace n'importe quelle adresse par la tienne.
   Si une image ne charge pas, une icône s'affiche à la place. */
const SPHERE_ITEMS: SphereEntry[] = [
  { name: 'Maillots', image: UP('zZKYttOrB0Y'), href: '#/products?search=maillot', icon: Shirt },
  { name: 'Chaussures', image: U('1542291026-7eec264c27ff'), href: '#/products?search=chaussure', icon: Footprints },
  { name: 'iPhone', image: U('1511707171634-5f897ff02aa9'), href: '#/products?search=iphone', icon: Smartphone },
  { name: 'Smartphones', image: U('1598327105666-5b89351aff97'), href: '#/products?search=smartphone', icon: Smartphone },
  { name: 'Maillots', image: UP('lQpFRPrepQ8'), href: '#/products?search=maillot', icon: Shirt },
  { name: 'Chaussures', image: U('1491553895911-0055eca6402d'), href: '#/products?search=chaussure', icon: Footprints },
  { name: 'iPhone', image: U('1592750475338-74b7b21085ab'), href: '#/products?search=iphone', icon: Smartphone },
  { name: 'Smartphones', image: U('1556656793-08538906a9f8'), href: '#/products?search=smartphone', icon: Smartphone },
  { name: 'Maillots', image: UP('xtRWIviknsw'), href: '#/products?search=maillot', icon: Shirt },
  { name: 'Chaussures', image: U('1549298916-b41d501d3772'), href: '#/products?search=chaussure', icon: Footprints },
  { name: 'iPhone', image: U('1510557880182-3d4d3cba35a5'), href: '#/products?search=iphone', icon: Smartphone },
  { name: 'Chaussures', image: U('1600185365926-3a2ce3cdb9eb'), href: '#/products?search=chaussure', icon: Footprints },
];

const HERO_STYLES = `
@keyframes heroBlob { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,-30px) scale(1.15); } }
@keyframes heroBlob2 { from { transform: translate(0,0) scale(1.1); } to { transform: translate(-50px,30px) scale(0.95); } }
@keyframes heroParticle { 0%,100% { transform: translateY(0); opacity: .15; } 50% { transform: translateY(-26px); opacity: .85; } }
@keyframes heroSpin { to { transform: rotate(360deg); } }
@keyframes heroSpinRev { to { transform: rotate(-360deg); } }
.hero-blob { animation: heroBlob 14s ease-in-out infinite alternate; }
.hero-blob-2 { animation: heroBlob2 18s ease-in-out infinite alternate; }
.hero-particle { animation: heroParticle 8s ease-in-out infinite; }
.hero-ring { animation: heroSpin 30s linear infinite; }
.hero-ring-rev { animation: heroSpinRev 48s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .hero-blob, .hero-blob-2, .hero-particle, .hero-ring, .hero-ring-rev { animation: none !important; }
}
`;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i % 7) * 0.9,
  duration: 6 + (i % 5) * 2,
}));

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order').limit(6),
        // Astuce : ajoute .eq('featured', true) ici si tu as une colonne "favori"
        supabase.from('products').select('*, category:categories(*)').eq('active', true).order('created_at', { ascending: false }).limit(8),
      ]);
      setCategories(cats as Category[] ?? []);
      setProducts(prods as Product[] ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    'maillots': <Shirt className="w-6 h-6" />,
    'smartphones': <Smartphone className="w-6 h-6" />,
    'chaussures': <Footprints className="w-6 h-6" />,
    'tissus': <Sparkles className="w-6 h-6" />,
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[calc(100dvh-9.5rem)] sm:min-h-[calc(100dvh-10.5rem)] md:min-h-[calc(100dvh-13rem)] flex items-center">
        <style>{HERO_STYLES}</style>

        {/* Fond animé assorti à la boule */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="hero-blob absolute -top-24 left-[10%] w-96 h-96 bg-brand-500/25 rounded-full blur-3xl" />
          <div className="hero-blob-2 absolute -bottom-32 right-[5%] w-[28rem] h-[28rem] bg-amber-600/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, #000, transparent 70%)',
              maskImage: 'radial-gradient(ellipse at 70% 50%, #000, transparent 70%)',
            }}
          />
          {PARTICLES.map((pt, i) => (
            <span
              key={i}
              className="hero-particle absolute rounded-full bg-brand-300"
              style={{
                left: `${pt.left}%`,
                top: `${pt.top}%`,
                width: pt.size,
                height: pt.size,
                animationDelay: `${pt.delay}s`,
                animationDuration: `${pt.duration}s`,
              }}
            />
          ))}
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-center">
            {/* Boule 3D : nos produits favoris */}
            <div className="lg:order-2">
              <ProductSphere />
            </div>

            {/* Textes à côté de la boule */}
            <div className="lg:order-1 text-center lg:text-left">
             
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white leading-tight mb-3 sm:mb-4">
                Fɛn min i b'a fɛ,<br />
                <span className="bg-gradient-to-r from-brand-400 to-amber-500 bg-clip-text text-transparent">an b'a lase i ka so</span>
              </h1>
              <p className="hidden sm:block text-sm sm:text-base text-stone-300 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                Maillots, smartphones, chaussures, tissus, bazins et bien plus.
                Commandez en ligne, payez à la réception. Simple, sûr, accessible.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <a
                  href="#/products"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-brand-500/30"
                >
                  Découvrir les produits
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#/categories"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all"
                >
                  Parcourir par catégorie
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <TrustSection />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl text-slate-900">Catégories</h2>
            <a href="#/categories" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Tout voir <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <a
                key={cat.id}
                href={`#/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-stone-100 hover:border-brand-300 hover:shadow-lg hover:shadow-stone-200/50 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                  {categoryIcons[cat.slug] ?? <Package className="w-6 h-6" />}
                </div>
                <span className="text-sm font-medium text-slate-700 text-center group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-slate-900">Nouveautés</h2>
          <a href="#/products" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Tout voir <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  );
}

/* Boule 3D : les produits sont répartis sur une sphère qui tourne.
   Glisser pour la faire tourner à la main, survol = pause. */
function ProductSphere() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const angleRef = useRef(0);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ x: number } | null>(null);
  const [size, setSize] = useState(320);

  // 14 produits répartis régulièrement sur la sphère (spirale de Fibonacci)
  const items = useMemo(
    () => Array.from({ length: 14 }, (_, i) => SPHERE_ITEMS[i % SPHERE_ITEMS.length]),
    []
  );

  const points = useMemo(
    () =>
      items.map((_, i) => {
        const n = items.length;
        const y = 1 - (2 * (i + 0.5)) / n;
        const r = Math.sqrt(1 - y * y);
        const t = i * Math.PI * (3 - Math.sqrt(5));
        return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
      }),
    [items]
  );

  // Taille adaptée à l'écran
  useEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;
    const update = () => {
      const vh = window.innerHeight;
      const stacked = window.innerWidth < 1024;
      // hauteur disponible pour que tout le hero tienne à l'écran
      const maxByHeight = stacked ? vh * 0.36 : vh - 270;
      setSize(Math.round(Math.max(200, Math.min(el.clientWidth * 0.86, 500, maxByHeight))));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [items.length]);

  // Animation de rotation (mise à jour directe du DOM, sans re-render)
  useEffect(() => {
    if (points.length === 0) return;
    const R = size * 0.38;
    const tilt = -0.35;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let speed = 0;
    let last = performance.now();
    let raf = 0;

    function render() {
      const cosA = Math.cos(angleRef.current);
      const sinA = Math.sin(angleRef.current);
      points.forEach((p, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const x = p.x * cosA + p.z * sinA;
        const z = -p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z * sinT;
        const z2 = p.y * sinT + z * cosT;
        const d = (z2 + 1) / 2; // 0 = derrière, 1 = devant
        el.style.transform = `translate(-50%, -50%) translate(${x * R}px, ${y2 * R}px) scale(${0.5 + 0.6 * d})`;
        el.style.opacity = String(0.25 + 0.75 * d);
        el.style.zIndex = String(Math.round(d * 100));
        el.style.pointerEvents = d > 0.45 ? 'auto' : 'none';
      });
    }

    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const target = pausedRef.current || dragRef.current || reduce ? 0 : 0.4;
      speed += (target - speed) * Math.min(1, dt * 4);
      angleRef.current += speed * dt;
      render();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [points, size]);

  const D = Math.round(size * 0.25);

  return (
    <div className="px-2">
      <div
        ref={wrapRef}
        className="relative mx-auto select-none cursor-grab active:cursor-grabbing mb-2"
        style={{ width: size, height: size, touchAction: 'pan-y' }}
        aria-label="Nos produits favoris"
        onPointerEnter={() => { pausedRef.current = true; }}
        onPointerLeave={() => { pausedRef.current = false; dragRef.current = null; }}
        onPointerDown={e => { dragRef.current = { x: e.clientX }; }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerMove={e => {
          if (!dragRef.current) return;
          angleRef.current += (e.clientX - dragRef.current.x) * 0.008;
          dragRef.current.x = e.clientX;
        }}
      >
        {/* Halo derrière la boule */}
        <div className="absolute inset-[12%] rounded-full bg-brand-500/20 blur-3xl" />

        {/* Anneaux en orbite */}
        <div className="hero-ring absolute inset-[-8%] rounded-full border border-white/15 pointer-events-none">
          <span className="absolute -top-1 left-1/2 w-2.5 h-2.5 -translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_14px_rgba(251,146,60,0.9)]" />
        </div>
        <div className="hero-ring-rev absolute inset-[-16%] rounded-full border border-dashed border-white/10 pointer-events-none">
          <span className="absolute -bottom-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
        </div>

        {items.map((p, i) => (
          <SphereItem
            key={i}
            item={p}
            diameter={D}
            setRef={el => { itemRefs.current[i] = el; }}
          />
        ))}
      </div>
    </div>
  );
}

function SphereItem({
  item,
  diameter,
  setRef,
}: {
  item: SphereEntry;
  diameter: number;
  setRef: (el: HTMLAnchorElement | null) => void;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = item.icon;

  return (
    <a
      ref={setRef}
      href={item.href}
      draggable={false}
      className="group absolute left-1/2 top-1/2 will-change-transform"
      style={{ width: diameter, height: diameter }}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-800 ring-4 ring-white/10 group-hover:ring-brand-400 shadow-xl shadow-black/40 transition-shadow duration-300 flex items-center justify-center">
        {!failed ? (
          <img
            src={item.image}
            alt={item.name}
            loading="eager"
            decoding="async"
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-1/3 h-1/3 text-white/50" />
        )}
      </div>
    </a>
  );
}

function TrustBadge({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-stone-500">{desc}</p>
      </div>
    </div>
  );
}