import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Tag, ClipboardList, Plus, Edit2, Trash2, X, Search, Loader2, TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDate } from '@/lib/format';
import type { Product, Category, Order, OrderStatus, OrderItem } from '@/types';
import { navigate } from '@/lib/router';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders';

export function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Accès refusé</h1>
        <p className="text-stone-500 mb-6">Vous devez être administrateur pour accéder à cette page.</p>
        <a href="#/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-6">Administration</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-stone-100 p-1 overflow-x-auto hide-scrollbar">
        <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label="Tableau de bord" />
        <TabButton active={tab === 'products'} onClick={() => setTab('products')} icon={<Package className="w-4 h-4" />} label="Produits" />
        <TabButton active={tab === 'categories'} onClick={() => setTab('categories')} icon={<Tag className="w-4 h-4" />} label="Catégories" />
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={<ClipboardList className="w-4 h-4" />} label="Commandes" />
      </div>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'orders' && <OrdersTab />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
        active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-slate-600 hover:bg-stone-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ============================================================
// Dashboard Tab
// ============================================================
function DashboardTab() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: orders }] = await Promise.all([
        supabase.from('products').select('id, price, stock').eq('active', true),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      const allOrders = orders as Order[] ?? [];
      const revenue = allOrders.filter(o => o.status === 'delivered' && o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
      setStats({
        products: prods?.length ?? 0,
        orders: allOrders.length,
        revenue,
        pending: allOrders.filter(o => o.status === 'pending').length,
      });
      setRecentOrders(allOrders);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-5 h-5" />} label="Produits actifs" value={stats.products.toString()} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Commandes" value={stats.orders.toString()} color="bg-brand-50 text-brand-600" />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Revenus" value={formatPrice(stats.revenue)} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="En attente" value={stats.pending.toString()} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Commandes récentes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-stone-400 text-sm">Aucune commande pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0">
                <div>
                  <span className="font-medium text-slate-900 text-sm">{order.order_number}</span>
                  <p className="text-xs text-stone-500">{order.customer_name} · {formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-slate-900 text-sm">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{label}</p>
    </div>
  );
}

// ============================================================
// Products Tab
// ============================================================
function ProductsTab() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setProducts(prods as Product[] ?? []);
    setCategories(cats as Category[] ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(product: Product) {
    if (!confirm(`Supprimer « ${product.name} » ?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      showToast('Erreur lors de la suppression', 'error');
    } else {
      showToast('Produit supprimé', 'success');
      load();
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase hidden sm:table-cell">Catégorie</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Prix</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase hidden sm:table-cell">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                          {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600 hidden sm:table-cell">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-center hidden sm:table-cell">
                      <span className={p.stock <= 5 ? 'text-red-600 font-medium' : 'text-slate-600'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                        {p.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-brand-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-2 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-stone-400 py-8 text-sm">Aucun produit trouvé.</p>}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

// ============================================================
// Product Form Modal
// ============================================================
function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    active: product?.active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);
    const payload = {
      name: form.name,
      slug: product?.slug || slug,
      description: form.description || null,
      price: parseInt(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (product) {
      ({ error } = await supabase.from('products').update(payload).eq('id', product.id));
    } else {
      ({ error } = await supabase.from('products').insert(payload));
    }

    if (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } else {
      showToast(product ? 'Produit modifié' : 'Produit ajouté', 'success');
      onSaved();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-display font-bold text-lg text-slate-900">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nom du produit" required>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input" />
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="admin-input min-h-[80px] resize-none" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prix (FCFA)" required>
              <input type="number" required min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="admin-input" />
            </FormField>
            <FormField label="Stock" required>
              <input type="number" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="admin-input" />
            </FormField>
          </div>
          <FormField label="Catégorie">
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="admin-input cursor-pointer">
              <option value="">Aucune</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="URL de l'image">
            <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="admin-input" placeholder="https://..." />
          </FormField>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-5 h-5 rounded accent-brand-600" />
            <span className="text-sm font-medium text-slate-700">Produit visible sur la boutique</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-900 font-medium transition-colors">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
        <style>{`.admin-input { width:100%; padding:0.625rem 0.875rem; border-radius:0.75rem; background:#f5f5f4; border:1px solid transparent; font-size:0.875rem; outline:none; transition:all 0.2s; } .admin-input:focus { border-color:#f59e0b; background:white; box-shadow:0 0 0 3px rgba(245,158,11,0.1); }`}</style>
      </div>
    </div>
  );
}

// ============================================================
// Categories Tab
// ============================================================
function CategoriesTab() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data as Category[] ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(cat: Category) {
    if (!confirm(`Supprimer « ${cat.name} » ?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', cat.id);
    if (error) {
      showToast('Erreur lors de la suppression', 'error');
    } else {
      showToast('Catégorie supprimée', 'success');
      load();
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Ajouter une catégorie
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-stone-400">/{cat.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(cat); setShowForm(true); }} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-brand-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-sm text-stone-500">{cat.description}</p>}
              <p className="text-xs text-stone-400 mt-2">Ordre: {cat.sort_order}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    sort_order: category?.sort_order?.toString() || '0',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const payload = {
      name: form.name,
      slug,
      description: form.description || null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    let error;
    if (category) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', category.id));
    } else {
      ({ error } = await supabase.from('categories').insert(payload));
    }

    if (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } else {
      showToast(category ? 'Catégorie modifiée' : 'Catégorie ajoutée', 'success');
      onSaved();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-display font-bold text-lg text-slate-900">{category ? 'Modifier' : 'Nouvelle catégorie'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nom" required>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="admin-input" />
          </FormField>
          <FormField label="Slug (URL)">
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="admin-input" placeholder="auto-généré si vide" />
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="admin-input min-h-[60px] resize-none" />
          </FormField>
          <FormField label="Ordre d'affichage">
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className="admin-input" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-900 font-medium transition-colors">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
        <style>{`.admin-input { width:100%; padding:0.625rem 0.875rem; border-radius:0.75rem; background:#f5f5f4; border:1px solid transparent; font-size:0.875rem; outline:none; transition:all 0.2s; } .admin-input:focus { border-color:#f59e0b; background:white; box-shadow:0 0 0 3px rgba(245,158,11,0.1); }`}</style>
      </div>
    </div>
  );
}

// ============================================================
// Orders Tab
// ============================================================
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data as Order[] ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!itemsByOrder[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      setItemsByOrder(prev => ({ ...prev, [orderId]: data as OrderItem[] ?? [] }));
    }
  }

  async function updateStatus(order: Order, status: OrderStatus) {
    const updates: Record<string, string | boolean | null> = { status, updated_at: new Date().toISOString() };
    if (status === 'delivered') {
      updates.payment_status = 'paid';
    }
    const { error } = await supabase.from('orders').update(updates).eq('id', order.id);
    if (error) {
      showToast('Erreur', 'error');
    } else {
      showToast('Statut mis à jour', 'success');
      load();
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Toutes" />
        <FilterChip active={filter === 'pending'} onClick={() => setFilter('pending')} label="En attente" />
        <FilterChip active={filter === 'confirmed'} onClick={() => setFilter('confirmed')} label="Confirmées" />
        <FilterChip active={filter === 'shipped'} onClick={() => setFilter('shipped')} label="Expédiées" />
        <FilterChip active={filter === 'delivered'} onClick={() => setFilter('delivered')} label="Livrées" />
        <FilterChip active={filter === 'cancelled'} onClick={() => setFilter('cancelled')} label="Annulées" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center text-stone-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune commande.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const expanded = expandedId === order.id;
            const items = itemsByOrder[order.id] || [];
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <button onClick={() => toggleExpand(order.id)} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-slate-900 text-sm">{order.order_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-stone-500">{order.customer_name} · {order.customer_phone} · {formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-slate-900 text-sm">{formatPrice(order.total)}</span>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-stone-100 p-4 animate-slide-up">
                    <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                      <div><span className="text-stone-400">Adresse: </span><span className="text-slate-700">{order.delivery_address}, {order.city}</span></div>
                      <div><span className="text-stone-400">Paiement: </span><span className="text-slate-700">{order.payment_status === 'paid' ? 'Payé' : 'À payer'} (livraison)</span></div>
                      {order.notes && <div className="sm:col-span-2"><span className="text-stone-400">Notes: </span><span className="text-slate-700">{order.notes}</span></div>}
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-xs font-semibold text-stone-500 uppercase mb-2">Articles</p>
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-stone-50">
                          <span className="text-slate-700">{item.product_name} × {item.quantity}</span>
                          <span className="font-medium text-slate-900">{formatPrice(item.total)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status update */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <p className="w-full text-xs font-semibold text-stone-500 uppercase mb-1">Changer le statut</p>
                      {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order, status)}
                          disabled={order.status === status}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            order.status === status
                              ? 'bg-slate-900 text-white'
                              : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
        active ? 'bg-brand-600 text-white' : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================
// Shared components
// ============================================================
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}
