import { useState } from 'react';
import { ShoppingBag, Mail, Lock, User as UserIcon, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { navigate } from '@/lib/router';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Connexion réussie', 'success');
        navigate('/');
      }
    } else {
      const { error } = await signUp(form.email, form.password, form.full_name, form.phone);
      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Compte créé avec succès', 'success');
        navigate('/');
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/30 mb-4">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl text-slate-900">
              {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-sm text-stone-500 mt-1 text-center">
              {mode === 'signin' ? 'Connectez-vous pour passer commande' : 'Rejoignez Bambara Shop aujourd\'hui'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <InputField
                  icon={<UserIcon className="w-4 h-4" />}
                  type="text"
                  placeholder="Nom complet"
                  value={form.full_name}
                  onChange={v => setForm({ ...form, full_name: v })}
                  required
                />
                <InputField
                  icon={<Phone className="w-4 h-4" />}
                  type="tel"
                  placeholder="Téléphone (+223 ...)"
                  value={form.phone}
                  onChange={v => setForm({ ...form, phone: v })}
                  required
                />
              </>
            )}
            <InputField
              icon={<Mail className="w-4 h-4" />}
              type="email"
              placeholder="Adresse email"
              value={form.email}
              onChange={v => setForm({ ...form, email: v })}
              required
            />
            <InputField
              icon={<Lock className="w-4 h-4" />}
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={v => setForm({ ...form, password: v })}
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-lg shadow-brand-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="text-xs text-stone-400 text-center mt-4">
              Le premier compte créé devient automatiquement administrateur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon, type, placeholder, value, onChange, required, minLength,
}: {
  icon: React.ReactNode; type: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-100 border border-transparent focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all text-sm outline-none"
      />
    </div>
  );
}
