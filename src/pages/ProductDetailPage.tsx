import { useEffect, useState } from 'react';
import { ShoppingBag, Minus, Plus, ArrowLeft, Check, Truck, ShieldCheck, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export function ProductDetailPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', productId)
        .maybeSingle();
      setProduct(data as Product | null);
      setLoading(false);
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-stone-100 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-100 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-stone-100 rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="w-12 h-12 mx-auto mb-3 text-stone-300" />
        <p className="text-stone-500">Produit introuvable.</p>
        <a href="#/products" className="inline-flex items-center gap-2 mt-4 text-brand-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour aux produits
        </a>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    addToCart(product, quantity);
    showToast('Ajouté au panier', 'success');
  }

  function handleBuyNow() {
    if (!product || outOfStock) return;
    addToCart(product, quantity);
    window.location.hash = '/checkout';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <a href="#/products" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </a>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-stone-100 rounded-3xl overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-20 h-20 text-stone-300" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-slate-900 px-6 py-2 rounded-full font-semibold">Rupture de stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <a href={`#/products?category=${product.category.slug}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 mb-2">
              {product.category.name}
            </a>
          )}
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-4">{product.name}</h1>
          <p className="font-display font-extrabold text-3xl text-brand-700 mb-6">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            {outOfStock ? (
              <span className="text-sm font-medium text-red-600">Rupture de stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm font-medium text-amber-600">Plus que {product.stock} en stock</span>
            ) : (
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> En stock
              </span>
            )}
          </div>

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-slate-700">Quantité:</span>
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!outOfStock && (
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleBuyNow}
                className="flex-1 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-lg shadow-brand-600/20"
              >
                Acheter maintenant
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Ajouter au panier
              </button>
            </div>
          )}

          {/* Trust indicators */}
          <div className="border-t border-stone-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <Truck className="w-5 h-5 text-brand-600" /> Livraison à Bamako et en région
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <ShieldCheck className="w-5 h-5 text-brand-600" /> Paiement à la livraison — vérifiez avant de payer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
