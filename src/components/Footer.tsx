import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-stone-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Bambara<span className="text-brand-500">Shop</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Votre boutique en ligne au Mali. Maillots, smartphones, chaussures, tissus et plus encore.
              Paiement à la livraison partout au Mali.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/" className="hover:text-brand-400 transition-colors">Accueil</a></li>
              <li><a href="#/products" className="hover:text-brand-400 transition-colors">Produits</a></li>
              <li><a href="#/categories" className="hover:text-brand-400 transition-colors">Catégories</a></li>
              <li><a href="#/cart" className="hover:text-brand-400 transition-colors">Panier</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Aide</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/orders" className="hover:text-brand-400 transition-colors">Suivre ma commande</a></li>
              <li><a href="#/auth" className="hover:text-brand-400 transition-colors">Mon compte</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500" />
                <span>+223 70 00 00 00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500" />
                <span>contact@bambarashop.ml</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Bamako, Mali</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Bambara Shop. Tous droits réservés.
          </p>
          <p className="text-xs text-stone-500">Paiement à la livraison · Livraison au Mali</p>
        </div>
      </div>
    </footer>
  );
}
