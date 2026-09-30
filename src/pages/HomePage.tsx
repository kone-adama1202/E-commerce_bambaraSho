import { useEffect, useState } from 'react';
import { ArrowRight, Truck, ShieldCheck, Package, Smartphone, Shirt, Footprints, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order').limit(6),
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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Paiement à la livraison partout au Mali
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              La boutique en ligne<br />
              <span className="bg-gradient-to-r from-brand-400 to-amber-500 bg-clip-text text-transparent">100% malienne</span>
            </h1>
            <p className="text-lg text-stone-300 leading-relaxed mb-8 max-w-xl">
              Maillots, smartphones, chaussures, tissus, bazins et bien plus.
              Commandez en ligne, payez à la réception. Simple, sûr, accessible.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-brand-500/30"
              >
                Découvrir les produits
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#/categories"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all"
              >
                Parcourir par catégorie
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustBadge icon={<Truck className="w-6 h-6" />} title="Livraison au Mali" desc="Partout à Bamako et en région" />
            <TrustBadge icon={<ShieldCheck className="w-6 h-6" />} title="Paiement à la livraison" desc="Vérifiez avant de payer" />
            <TrustBadge icon={<Package className="w-6 h-6" />} title="Suivi de commande" desc="Suivez l'état en temps réel" />
          </div>
        </div>
      </section>

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
