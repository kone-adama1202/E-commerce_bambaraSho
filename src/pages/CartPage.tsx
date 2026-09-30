import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Votre panier est vide</h1>
        <p className="text-stone-500 mb-6">Découvrez nos produits et ajoutez-les à votre panier.</p>
        <a
          href="#/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
        >
          Voir les produits <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-900">
          Mon panier <span className="text-stone-400 text-lg">({totalItems})</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-stone-500 hover:text-red-600 transition-colors">
          Vider le panier
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div
              key={item.product.id}
              className="flex gap-4 bg-white rounded-2xl border border-stone-100 p-4 animate-slide-up"
            >
              <a
                href={`#/product/${item.product.id}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-stone-100 overflow-hidden shrink-0"
              >
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-stone-300" />
                  </div>
                )}
              </a>

              <div className="flex-1 min-w-0">
                <a href={`#/product/${item.product.id}`} className="font-medium text-slate-900 text-sm sm:text-base hover:text-brand-600 transition-colors line-clamp-2">
                  {item.product.name}
                </a>
                <p className="text-brand-700 font-semibold text-sm mt-1">{formatPrice(item.product.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <a href="#/products" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 transition-colors pt-2">
            <ArrowLeft className="w-4 h-4" /> Continuer mes achats
          </a>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-stone-600">
                <span>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                <span className="font-medium text-slate-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Livraison</span>
                <span className="text-emerald-600 font-medium">À calculer</span>
              </div>
            </div>
            <div className="border-t border-stone-100 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-display font-bold text-xl text-brand-700">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <a
              href="#/checkout"
              className="block w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-center transition-colors shadow-lg shadow-brand-600/20"
            >
              Passer la commande
            </a>
            <p className="text-xs text-stone-400 text-center mt-3">Paiement à la livraison</p>
          </div>
        </div>
      </div>
    </div>
  );
}
