import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product);
    setAdded(true);
    showToast('Ajouté au panier', 'success');
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <a
      href={`#/product/${product.id}`}
      className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-stone-300" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-slate-900 px-4 py-1.5 rounded-full text-sm font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Plus que {product.stock}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-xs text-stone-400 mb-2">{product.category.name}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-brand-700 text-base">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              outOfStock
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                : added
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
            }`}
            aria-label="Ajouter au panier"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </a>
  );
}
