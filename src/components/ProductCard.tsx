import { ShoppingBag, Check, Eye } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { useToast } from '@/context/ToastContext';

/**
 * Champs optionnels utilisés si présents dans ton type Product
 * (à ajouter à `@/types` si besoin) :
 *   description?: string;
 *   category?: string | { name: string };
 *   compare_at_price?: number;   // ancien prix (prix barré)
 *   images?: string[];           // galerie : la 2e image s'affiche au survol
 */
type ProductExtras = {
  description?: string | null;
  category?: string | { name: string } | null;
  compare_at_price?: number | null;
  images?: string[] | null;
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const extra = product as Product & ProductExtras;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  const categoryLabel =
    typeof extra.category === 'string' ? extra.category : extra.category?.name;
  const hoverImage = extra.images?.[1];

  const hasDiscount =
    !!extra.compare_at_price && extra.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / extra.compare_at_price!) * 100)
    : 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || added) return;
    addToCart(product);
    setAdded(true);
    showToast('Ajouté au panier', 'success');
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <a
      href={`#/product/${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* ───────── Image ───────── */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                hoverImage ? 'group-hover:opacity-0' : ''
              } ${outOfStock ? 'grayscale' : ''}`}
            />
            {/* 2e photo : fondu croisé au survol */}
            {hoverImage && (
              <img
                src={hoverImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover scale-105 opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 motion-reduce:transition-none"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-stone-300" />
          </div>
        )}

        {/* Dégradé au survol */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges (haut gauche) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {hasDiscount && !outOfStock && (
            <span className="bg-rose-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {lowStock && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Plus que {product.stock}
            </span>
          )}
        </div>

        {/* Panneau qui glisse depuis le bas au survol */}
        {!outOfStock && (
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 p-3 translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 motion-reduce:transition-none"
          >
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white/90">
              <Eye className="w-3.5 h-3.5" />
              Voir le détail
            </span>
            <button
              onClick={handleAdd}
              aria-label={added ? 'Ajouté au panier' : 'Ajouter au panier'}
              className={`ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold shadow-lg transition-colors duration-300 ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-brand-700 hover:bg-brand-600 hover:text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Ajouté
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Ajouter
                </>
              )}
            </button>
          </div>
        )}

        {/* Rupture de stock */}
        {outOfStock && (
          <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-slate-900 px-4 py-1.5 rounded-full text-sm font-semibold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* ───────── Détails ───────── */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {categoryLabel && (
          <span className="text-xs font-medium text-stone-500">
            {categoryLabel}
          </span>
        )}

        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 transition-colors group-hover:text-brand-600">
          {product.name}
        </h3>

        {extra.description && (
          <p className="text-xs leading-relaxed text-stone-500 line-clamp-2">
            {extra.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-brand-700 text-lg">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(extra.compare_at_price!)}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              outOfStock
                ? 'text-rose-600'
                : lowStock
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                outOfStock
                  ? 'bg-rose-500'
                  : lowStock
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
            />
            {outOfStock ? 'Indisponible' : lowStock ? 'Stock limité' : 'En stock'}
          </span>
        </div>
      </div>
    </a>
  );
}