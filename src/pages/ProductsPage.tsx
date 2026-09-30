import { useEffect, useState } from 'react';
import { SlidersHorizontal, X, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';

interface Props {
  search: string | null;
  categorySlug: string | null;
}

export function ProductsPage({ search, categorySlug }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data as Category[] ?? []);
    });
  }, []);

  useEffect(() => {
    setSelectedCategory(categorySlug);
  }, [categorySlug]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      let query = supabase.from('products').select('*, category:categories(*)').eq('active', true);

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (selectedCategory) {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', selectedCategory).maybeSingle();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }

      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query;
      setProducts(data as Product[] ?? []);
      setLoading(false);
    }
    loadProducts();
  }, [search, selectedCategory, sortBy]);

  const currentCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1">
          {search ? `Résultats pour « ${search} »` : currentCategory ? currentCategory.name : 'Tous les produits'}
        </h1>
        <p className="text-sm text-stone-500">
          {loading ? 'Chargement...' : `${products.length} produit${products.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 bg-white rounded-2xl border border-stone-100 p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Catégories</h3>
            <div className="space-y-1">
              <CategoryButton label="Tous" active={!selectedCategory} onClick={() => setSelectedCategory(null)} />
              {categories.map(cat => (
                <CategoryButton
                  key={cat.id}
                  label={cat.name}
                  active={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-medium text-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtrer
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="ml-auto px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-medium text-slate-700 outline-none focus:border-brand-400 cursor-pointer"
            >
              <option value="newest">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun produit trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h4 className="font-medium text-sm text-slate-700 mb-3">Catégories</h4>
            <div className="space-y-1">
              <CategoryButton label="Tous" active={!selectedCategory} onClick={() => { setSelectedCategory(null); setShowFilters(false); }} />
              {categories.map(cat => (
                <CategoryButton
                  key={cat.id}
                  label={cat.name}
                  active={selectedCategory === cat.slug}
                  onClick={() => { setSelectedCategory(cat.slug); setShowFilters(false); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-stone-50'
      }`}
    >
      {label}
    </button>
  );
}
