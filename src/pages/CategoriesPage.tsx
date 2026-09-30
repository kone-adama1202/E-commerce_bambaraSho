import { useEffect, useState } from 'react';
import { Package, ArrowRight, Smartphone, Shirt, Footprints, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('category_id').eq('active', true),
      ]);
      const c = cats as Category[] ?? [];
      setCategories(c);
      const countMap: Record<string, number> = {};
      (prods ?? []).forEach(p => {
        if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      });
      setCounts(countMap);
      setLoading(false);
    }
    load();
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    'maillots': <Shirt className="w-7 h-7" />,
    'smartphones': <Smartphone className="w-7 h-7" />,
    'chaussures': <Footprints className="w-7 h-7" />,
    'tissus': <Sparkles className="w-7 h-7" />,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-stone-100 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-stone-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-2">Catégories</h1>
      <p className="text-stone-500 mb-6">Parcourez nos produits par catégorie</p>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune catégorie disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <a
              key={cat.id}
              href={`#/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                  {categoryIcons[cat.slug] ?? <Package className="w-7 h-7" />}
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="relative font-display font-bold text-lg text-slate-900 mt-4 mb-1">{cat.name}</h3>
              {cat.description && <p className="relative text-sm text-stone-500 mb-3">{cat.description}</p>}
              <p className="relative text-xs text-stone-400">{counts[cat.id] || 0} produit{(counts[cat.id] || 0) > 1 ? 's' : ''}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
