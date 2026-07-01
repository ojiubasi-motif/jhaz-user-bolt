import { Palette, Ruler, Sparkles, Check } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useState } from 'react';

const fabrics = [
  { name: 'Ankara', color: 'bg-terra-500', desc: 'Bold wax prints' },
  { name: 'Kente', color: 'bg-kente-500', desc: 'Woven royal cloth' },
  { name: 'Adire', color: 'bg-savanna-500', desc: 'Indigo resist dye' },
  { name: 'Batik', color: 'bg-terra-700', desc: 'Hand-painted motifs' },
];

const steps = [
  {
    icon: Palette,
    title: 'Choose Your Fabric',
    desc: 'Select from 40+ authentic African fabrics, from vibrant Ankara to regal Kente.',
  },
  {
    icon: Ruler,
    title: 'Your Perfect Fit',
    desc: 'Send your measurements or use our AI sizing guide for a tailored fit.',
  },
  {
    icon: Sparkles,
    title: 'Add Your Details',
    desc: 'Customize sleeves, hem length, neckline, and accents to make it yours.',
  },
];

export default function Customize() {
  const { ref, isVisible } = useInView();
  const [selectedFabric, setSelectedFabric] = useState(0);

  return (
    <section id="customize" className="py-20 sm:py-28 bg-night-950 text-earth-50 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.03) 35px, rgba(255,255,255,0.03) 70px)`,
        }} />
      </div>

      {/* Mobile background image & gradient overlay (matches Hero.tsx style) */}
      <div className="absolute inset-0 lg:hidden z-0">
        <img
          src="/images/how-it-works.jpg"
          alt="Tailor cutting custom fabric background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-night-950/96 via-night-950/80 to-night-950/95" />
      </div>

      <div className="section-container relative z-10" ref={ref}>
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-terra-400 font-body text-sm font-semibold tracking-widest uppercase">
            Your Design, Your Way
          </span>
          <h2 className="heading-lg text-earth-50 mt-2">
            How Customization Works
          </h2>
          <p className="body-md text-earth-400 max-w-2xl mx-auto mt-4">
            Every piece is made-to-order, tailored to your unique style. Choose your fabric, your fit, and your finishing touches.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Steps & Fabric Controls */}
          <div className="space-y-8 relative z-10">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`flex gap-6 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="shrink-0 w-14 h-14 rounded-xl bg-terra-600/20 border border-terra-500/30 flex items-center justify-center">
                  <step.icon size={24} className="text-terra-400" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-earth-100">
                    {step.title}
                  </h3>
                  <p className="text-earth-400 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Fabric selector */}
            <div className={`mt-10 pt-8 border-t border-earth-800/80 ${isVisible ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
              <p className="text-xs text-earth-500 font-semibold tracking-widest uppercase mb-4">
                Pick Your Fabric
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fabrics.map((fabric, i) => (
                  <button
                    key={fabric.name}
                    onClick={() => setSelectedFabric(i)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedFabric === i
                        ? 'bg-terra-600/25 border border-terra-500/60 shadow-lg shadow-terra-950/20'
                        : 'bg-earth-900/60 border border-earth-800 hover:border-earth-600'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${fabric.color}`} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-earth-200">{fabric.name}</p>
                      <p className="text-xs text-earth-500">{fabric.desc}</p>
                    </div>
                    {selectedFabric === i && (
                      <Check size={14} className="text-terra-400 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile-only interactive card displaying live choices over the background image */}
            <div className="lg:hidden mt-8 animate-fade-up">
              <div className="bg-night-950/85 backdrop-blur-md rounded-xl p-5 border border-earth-800/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display text-base font-semibold text-earth-100">
                      Custom {fabrics[selectedFabric].name} Dress
                    </p>
                    <p className="text-xs text-earth-400 mt-0.5">
                      {fabrics[selectedFabric].desc}
                    </p>
                  </div>
                  <span className="font-display text-xl font-bold text-terra-400">$135</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-terra-600/20 text-terra-400 text-[10px] font-medium rounded">
                    Made to Order
                  </span>
                  <span className="px-2 py-0.5 bg-savanna-600/20 text-savanna-400 text-[10px] font-medium rounded">
                    7-10 Days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Preview (Desktop only) */}
          <div className={`hidden lg:block ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-earth-800/40">
              <img
                src="/images/how-it-works.jpg"
                alt="Tailor cutting custom fabric"
                className="img-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />

              {/* Overlay info */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="bg-night-950/80 backdrop-blur-md rounded-xl p-6 border border-earth-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-display text-lg font-semibold text-earth-100">
                        Custom {fabrics[selectedFabric].name} Dress
                      </p>
                      <p className="text-sm text-earth-400 mt-1">
                        {fabrics[selectedFabric].desc}
                      </p>
                    </div>
                    <span className="font-display text-2xl font-bold text-terra-400">$135</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-terra-600/20 text-terra-400 text-xs font-medium rounded">
                      Made to Order
                    </span>
                    <span className="px-2 py-1 bg-savanna-600/20 text-savanna-400 text-xs font-medium rounded">
                      7-10 Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
