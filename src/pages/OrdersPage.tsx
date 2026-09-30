import { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, FileText, ChevronDown, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" /> },
  shipped: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-700', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
};

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data as Order[] ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!itemsByOrder[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      setItemsByOrder(prev => ({ ...prev, [orderId]: data as OrderItem[] ?? [] }));
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Connexion requise</h1>
        <p className="text-stone-500 mb-6">Connectez-vous pour consulter vos commandes.</p>
        <a href="#/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">Se connecter</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-stone-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
          <Package className="w-10 h-10 text-stone-300" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-2">Aucune commande</h1>
        <p className="text-stone-500 mb-6">Vous n'avez pas encore passé de commande.</p>
        <a href="#/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">Voir les produits</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Mes commandes</h1>

      <div className="space-y-3">
        {orders.map(order => {
          const config = STATUS_CONFIG[order.status];
          const expanded = expandedId === order.id;
          const items = itemsByOrder[order.id] || [];

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full p-5 flex items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display font-bold text-slate-900">{order.order_number}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-bold text-brand-700">{formatPrice(order.total)}</span>
                  <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded && (
                <div className="border-t border-stone-100 p-5 animate-slide-up">
                  {/* Status tracker */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200" />
                        <div
                          className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all"
                          style={{ width: `${(STATUS_STEPS.indexOf(order.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                        {STATUS_STEPS.map(step => {
                          const statusConfig = STATUS_CONFIG[step];
                          const completed = STATUS_STEPS.indexOf(order.status) >= STATUS_STEPS.indexOf(step);
                          return (
                            <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                                completed ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-stone-200 text-stone-300'
                              }`}>
                                {statusConfig.icon}
                              </div>
                              <span className={`text-xs ${completed ? 'text-slate-900 font-medium' : 'text-stone-400'}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {items.length === 0 ? (
                      <p className="text-sm text-stone-400">Chargement des articles...</p>
                    ) : items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm py-2 border-b border-stone-50 last:border-0">
                        <span className="text-slate-700">{item.product_name} × {item.quantity}</span>
                        <span className="font-medium text-slate-900">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery info */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-start gap-2 text-stone-600">
                      <MapPin className="w-4 h-4 mt-0.5 text-stone-400 shrink-0" />
                      <span>{order.delivery_address}, {order.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>

                  {/* Total + invoice */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-sm text-stone-500">Total: </span>
                      <span className="font-display font-bold text-lg text-brand-700">{formatPrice(order.total)}</span>
                    </div>
                    {order.status === 'delivered' && order.payment_status === 'paid' && (
                      <InvoiceButton order={order} items={items} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InvoiceButton({ order, items }: { order: Order; items: OrderItem[] }) {
  function generateInvoice() {
    const win = window.open('', '_blank');
    if (!win) return;

    const rows = items.map(item => `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${formatPrice(item.unit_price)}</td>
        <td style="text-align:right">${formatPrice(item.total)}</td>
      </tr>
    `).join('');

    win.document.write(`
      <!doctype html>
      <html><head><title>Facture ${order.order_number}</title>
      <style>
        body { font-family: 'Inter', sans-serif; max-width: 700px; margin: 40px auto; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; }
        .logo span { color: #d97706; }
        .invoice-title { font-size: 28px; font-weight: 700; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f5f5f4; padding: 16px; border-radius: 12px; }
        .info-box h4 { font-size: 12px; text-transform: uppercase; color: #78716c; margin: 0 0 8px; }
        .info-box p { margin: 2px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f5f5f4; padding: 12px; text-align: left; font-size: 13px; }
        td { padding: 12px; border-bottom: 1px solid #e7e5e4; font-size: 14px; }
        .total { text-align: right; font-size: 20px; font-weight: 700; margin-top: 10px; }
        .total span { color: #d97706; }
        .footer { margin-top: 40px; text-align: center; color: #78716c; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; }
      </style></head><body>
        <div class="header">
          <div class="logo">Bambara<span>Shop</span></div>
          <span class="status-badge">PAYÉE</span>
        </div>
        <div class="invoice-title">Facture</div>
        <div class="info-grid">
          <div class="info-box">
            <h4>Commande</h4>
            <p><strong>${order.order_number}</strong></p>
            <p>${formatDate(order.created_at)}</p>
          </div>
          <div class="info-box">
            <h4>Client</h4>
            <p><strong>${order.customer_name}</strong></p>
            <p>${order.customer_phone}</p>
            <p>${order.delivery_address}, ${order.city}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>Produit</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="total">Total: <span>${formatPrice(order.total)}</span></div>
        <div class="footer">
          <p>Bambara Shop — Bamako, Mali · Paiement à la livraison</p>
          <p>Merci de votre confiance!</p>
        </div>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <button
      onClick={generateInvoice}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
    >
      <FileText className="w-4 h-4" /> Télécharger la facture
    </button>
  );
}
