import { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import type { Order } from '@/types';

const MALI_CITIES = ['Bamako', 'Sikasso', 'Ségou', 'Kayes', 'Mopti', 'Tombouctou', 'Gao', 'Kidal', 'Koulikoro', 'Bougouni', 'Koutiala', 'San'];

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null);

  const [form, setForm] = useState({
    customer_name: profile?.full_name || '',
    customer_phone: profile?.phone || '',
    delivery_address: '',
    city: 'Bamako',
    notes: '',
  });

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Panier vide</h1>
        <p className="text-stone-500 mb-6">Ajoutez des produits avant de passer commande.</p>
        <a href="#/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">
          Voir les produits
        </a>
      </div>
    );
  }

  if (!user && !success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Connexion requise</h1>
        <p className="text-stone-500 mb-6">Connectez-vous pour passer une commande et suivre son état.</p>
        <a href="#/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">
          Se connecter / S'inscrire
        </a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: totalPrice,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          delivery_address: form.delivery_address,
          city: form.city,
          notes: form.notes || null,
          status: 'pending',
          payment_method: 'cash_on_delivery',
          payment_status: 'unpaid',
        })
        .select()
        .single();

      if (orderError) throw orderError;
      const order = orderData as Order;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setSuccess({ orderNumber: order.order_number });
      showToast('Commande passée avec succès!', 'success');
    } catch (err) {
      showToast('Erreur lors de la commande. Veuillez réessayer.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 animate-scale-in">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Commande confirmée!</h1>
        <p className="text-stone-600 mb-1">Votre numéro de commande est</p>
        <p className="font-display font-bold text-xl text-brand-600 mb-6">{success.orderNumber}</p>
        <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <p className="text-sm font-medium text-slate-900">Paiement à la livraison</p>
          </div>
          <p className="text-sm text-stone-500">
            Vous recevrez votre commande et pourrez vérifier les produits avant d'effectuer le paiement.
            Vous pouvez suivre l'état de votre commande dans la section « Mes commandes ».
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <a href="#/orders" className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors">
            Suivre ma commande
          </a>
          <a href="#/products" className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-900 font-semibold transition-colors">
            Continuer mes achats
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <a href="#/cart" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au panier
      </a>
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4">Informations de livraison</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom complet" required>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={e => setForm({ ...form, customer_name: e.target.value })}
                  className="input"
                  placeholder="Votre nom"
                />
              </Field>
              <Field label="Téléphone" required>
                <input
                  type="tel"
                  required
                  value={form.customer_phone}
                  onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                  className="input"
                  placeholder="+223 70 00 00 00"
                />
              </Field>
              <Field label="Ville" required>
                <select
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="input cursor-pointer"
                >
                  {MALI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Adresse de livraison" required fullRow>
                <textarea
                  required
                  value={form.delivery_address}
                  onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="Quartier, rue, repère, point de référence..."
                />
              </Field>
              <Field label="Notes (optionnel)" fullRow>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="input min-h-[60px] resize-none"
                  placeholder="Instructions de livraison..."
                />
              </Field>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-brand-50 rounded-2xl border border-brand-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              <h3 className="font-semibold text-slate-900">Paiement à la livraison</h3>
            </div>
            <p className="text-sm text-stone-600">
              Vous paierez en espèces au moment de la réception de votre commande.
              Vérifiez vos articles avant de payer.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-display font-bold text-lg text-slate-900 mb-4">Votre commande</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-stone-600 truncate mr-2">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium text-slate-900 shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Sous-total</span>
                <span className="font-medium text-slate-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Livraison</span>
                <span className="text-emerald-600">À calculer</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-stone-100 pt-4 mb-5">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-display font-bold text-xl text-brand-700">{formatPrice(totalPrice)}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-lg shadow-brand-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
              ) : (
                'Confirmer la commande'
              )}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          background: #f5f5f4;
          border: 1px solid transparent;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children, fullRow }: { label: string; required?: boolean; children: React.ReactNode; fullRow?: boolean }) {
  return (
    <div className={fullRow ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
