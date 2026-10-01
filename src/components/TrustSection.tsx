import { useEffect, useRef, useState } from 'react';
import { Truck, ShieldCheck, Eye } from 'lucide-react';

type Variant = 'ride' | 'scan' | 'watch';

/* ───────────────────────────────────────────────────────────────
   IMAGES : colle ici l'adresse (URL) complète de n'importe quelle image en ligne.
   - Le 1er lien est utilisé en priorité.
   - Si il ne charge pas, le suivant est essayé automatiquement.
   - Si aucun ne charge, la carte affiche un fond sombre avec l'icône.
   ─────────────────────────────────────────────────────────────── */
const ITEMS: {
  variant: Variant;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  images: string[];
  alt: string;
}[] = [
  {
    variant: 'ride',
    title: 'Livraison au Mali',
    desc: 'Partout à Bamako et en région',
    icon: Truck,
    alt: 'Livreur à moto dans la rue',
    images: [
      'https://images.unsplash.com/photo-1572195577046-2f25894c06fc?auto=format&fit=crop&w=900&q=80',
      'https://unsplash.com/photos/afDu-GuxjjM/download?w=900',
      'https://unsplash.com/photos/AWPXQaG35oA/download?w=900',
    ],
  },
  {
    variant: 'scan',
    title: 'Paiement à la livraison',
    desc: 'Vérifiez avant de payer',
    icon: ShieldCheck,
    alt: 'Colis tenu en main pour vérification',
    images: [
      'https://img.magnific.com/vecteurs-libre/cute-money-holding-money-bag-cartoon-vector-icon-illustration-finances-objet-icon-isole-plat_138676-14083.jpg?semt=ais_hybrid&w=740&q=80',
    ],
  },
  {
    variant: 'watch',
    title: 'Suivi de commande',
    desc: "Suivez l'état en temps réel",
    icon: Eye,
    alt: 'Gros plan sur un œil humain',
    images: [
      'https://thumbs.dreamstime.com/b/d%C3%A9finissez-l-oeil-dr%C3%B4le-%C3%A9motions-animateurs-%C3%A9l%C3%A9ment-d-un-visage-de-personne-yeux-tir%C3%A9s-par-la-main-avec-des-paupi%C3%A8res-194122727.jpg',
    ],
  },
];

const TRUST_STYLES = `
@keyframes trustIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes trustPan { from { transform: scale(1.2) translateX(-4%); } to { transform: scale(1.2) translateX(4%); } }
@keyframes trustDrift { from { transform: scale(1.04); } to { transform: scale(1.14); } }
@keyframes trustBreath { from { transform: scale(1.04); } to { transform: scale(1.2); } }
@keyframes trustRoad { to { background-position: -32px 0; } }
@keyframes trustScan { 0% { top: 6%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { top: 94%; opacity: 0; } }
@keyframes trustPulse { 0% { transform: scale(.5); opacity: .75; } 100% { transform: scale(2.2); opacity: 0; } }
@keyframes trustFrame { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(.92); opacity: 1; } }
.trust-in { animation: trustIn .7s cubic-bezier(.22,1,.36,1) both; }
.trust-pan { animation: trustPan 8s ease-in-out infinite alternate; }
.trust-drift { animation: trustDrift 9s ease-in-out infinite alternate; }
.trust-breath { animation: trustBreath 6s ease-in-out infinite alternate; }
.trust-road {
  background-image: repeating-linear-gradient(90deg, rgba(255,255,255,.9) 0 16px, transparent 16px 32px);
  background-size: 32px 100%;
  animation: trustRoad .7s linear infinite;
}
.trust-scan { animation: trustScan 3.2s ease-in-out infinite; }
.trust-ring { animation: trustPulse 3s ease-out infinite; }
.trust-frame { animation: trustFrame 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .trust-in, .trust-pan, .trust-drift, .trust-breath, .trust-road, .trust-scan, .trust-ring, .trust-frame { animation: none !important; }
}
`;

export function TrustSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  // Les cartes apparaissent l'une après l'autre quand la section entre à l'écran
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-b border-stone-200 bg-white">
      <style>{TRUST_STYLES}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {ITEMS.map((item, i) => (
            <TrustCard key={item.variant} item={item} visible={visible} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustCard({
  item,
  visible,
  index,
}: {
  item: (typeof ITEMS)[number];
  visible: boolean;
  index: number;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const failed = imgIndex >= item.images.length;
  const Icon = item.icon;

  const imageMotion =
    item.variant === 'ride' ? 'trust-pan' : item.variant === 'watch' ? 'trust-breath' : 'trust-drift';

  return (
    <article
      style={{ animationDelay: `${index * 140}ms` }}
      className={`group relative isolate h-40 sm:h-56 lg:h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        visible ? 'trust-in' : 'opacity-0'
      }`}
    >
      {/* Photo : le conteneur gère le zoom au survol, l'image gère l'animation continue */}
      {!failed ? (
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100">
          <img
            key={imgIndex}
            src={item.images[imgIndex]}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgIndex(n => n + 1)}
            className={`h-full w-full object-cover ${imageMotion}`}
          />
        </div>
      ) : (
        <Icon className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/15" />
      )}

      {/* Dégradé pour garder le texte lisible */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-slate-900/10" />

      {/* ───── Animations propres à chaque photo ───── */}

      {/* Moto : ligne de route qui défile sous la carte */}
      {item.variant === 'ride' && (
        <span className="trust-road pointer-events-none absolute inset-x-0 bottom-0 h-[3px]" aria-hidden="true" />
      )}

      {/* Vérification : viseur + ligne de scan qui balaie la photo */}
      {item.variant === 'scan' && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="trust-frame relative h-24 w-24 sm:h-28 sm:w-28">
              <span className="absolute left-0 top-0 h-5 w-5 rounded-tl-md border-l-2 border-t-2 border-white/90" />
              <span className="absolute right-0 top-0 h-5 w-5 rounded-tr-md border-r-2 border-t-2 border-white/90" />
              <span className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-md border-b-2 border-l-2 border-white/90" />
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-br-md border-b-2 border-r-2 border-white/90" />
            </div>
          </div>
          <span
            className="trust-scan pointer-events-none absolute inset-x-0 h-0.5 bg-brand-400 shadow-[0_0_18px_4px_rgba(251,146,60,0.7)]"
            aria-hidden="true"
          />
        </>
      )}

      {/* Œil : ondes qui se propagent depuis le centre, comme un regard qui suit */}
      {item.variant === 'watch' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="trust-ring absolute h-20 w-20 rounded-full border border-white/60" />
          <span
            className="trust-ring absolute h-20 w-20 rounded-full border border-brand-300/70"
            style={{ animationDelay: '1.5s' }}
          />
        </div>
      )}

      {/* Icône */}
      <span className="absolute left-3 top-3 sm:left-4 sm:top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transform-none">
        <Icon className="h-5 w-5" />
      </span>

      {/* Texte */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 pb-4 sm:p-5 sm:pb-6">
        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">{item.title}</h3>
        <p className="mt-0.5 text-xs text-white/85 sm:text-sm">{item.desc}</p>
      </div>
    </article>
  );
}