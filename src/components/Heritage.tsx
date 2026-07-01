import { Leaf, Handshake, ShieldCheck } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const values = [
  {
    icon: Leaf,
    metric: '100%',
    label: 'Natural Fibers',
    desc: 'We use only organic cotton, raw silk, and plant-dyed fabrics sourced directly from African artisans.',
  },
  {
    icon: Handshake,
    metric: '50+',
    label: 'Artisan Partners',
    desc: 'Every piece supports local weavers, dyers, and tailors across West and East Africa.',
  },
  {
    icon: ShieldCheck,
    metric: '1 Year',
    label: 'Craft Guarantee',
    desc: 'We stand behind our craftsmanship. Every seam, stitch, and finish is guaranteed for a full year.',
  },
];

export default function Heritage() {
  const { ref, isVisible } = useInView();

  return (
    <section id="heritage" className="py-20 sm:py-28 bg-night-950 lg:bg-earth-50 text-earth-50 lg:text-night-950 relative overflow-hidden">
      {/* Decorative background for desktop */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-terra-100/30 blur-3xl hidden lg:block" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-kente-100/20 blur-3xl hidden lg:block" />

      {/* Mobile background image & gradient overlay (matches Customize.tsx style) */}
      <div className="absolute inset-0 lg:hidden z-0">
        <img
          src="/images/craftsmanship.webp"
          alt="Premium Ankara fabric craftsmanship details background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-night-950/96 via-night-950/80 to-night-950/95" />
      </div>

      <div className="section-container relative z-10" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image (Desktop only) */}
          <div className={`hidden lg:block ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-earth-200/40">
                <img
                  src="/images/craftsmanship.webp"
                  alt="Premium Ankara fabric craftsmanship details"
                  className="img-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-white rounded-xl p-6 shadow-xl max-w-[240px] border border-earth-100">
                <p className="font-display text-3xl font-bold text-terra-600">12+</p>
                <p className="text-sm text-earth-600 font-medium mt-1">
                  Preserving African textile traditions
                </p>
              </div>
            </div>
          </div>

          {/* Right: Content (On mobile, this is overlaying the background image) */}
          <div className="space-y-8 relative z-10">
            <div className={isVisible ? 'animate-slide-in-right' : 'opacity-0'}>
              <span className="text-terra-400 lg:text-terra-600 font-body text-sm font-semibold tracking-widest uppercase">
                Our Commitment
              </span>
              <h2 className="heading-lg text-earth-50 lg:text-night-950 mt-2">
                Conscious Craftsmanship
              </h2>
              <p className="body-md text-earth-300 lg:text-earth-700 mt-4 leading-relaxed">
                We honor the hands that weave, dye, and stitch every piece. Our
                process is rooted in respect for tradition, the environment, and
                the artisans who make it all possible.
              </p>
            </div>

            <div className="space-y-6">
              {values.map((v, i) => (
                <div
                  key={v.label}
                  className={`flex gap-5 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
                  style={{ animationDelay: `${(i + 1) * 150}ms` }}
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-terra-900/30 lg:bg-terra-100 flex items-center justify-center border border-terra-500/20 lg:border-none">
                    <v.icon size={24} className="text-terra-400 lg:text-terra-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl font-bold text-earth-50 lg:text-night-950">
                        {v.metric}
                      </span>
                      <span className="font-body text-sm font-semibold text-terra-400 lg:text-terra-600">
                        {v.label}
                      </span>
                    </div>
                    <p className="text-earth-400 lg:text-earth-600 mt-1 leading-relaxed text-sm">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile-only float card display */}
            <div className="lg:hidden mt-8 animate-fade-up">
              <div className="bg-night-950/80 backdrop-blur-md rounded-xl p-5 border border-earth-800/60 max-w-[280px]">
                <p className="font-display text-2xl font-bold text-terra-400">12+</p>
                <p className="text-xs text-earth-300 font-medium mt-1">
                  Preserving African textile traditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
