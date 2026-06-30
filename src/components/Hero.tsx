import { Link } from 'react-router-dom';
import { ArrowRight, Palette } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-night-950">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-banner.jpg"
          alt="African traditional fashion wear banner"
          className="w-full h-full object-cover object-top"
        />
        {/* Overlay gradient to darken and focus */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="section-container relative z-10 pt-28 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Glassmorphic Content Card */}
          <div className="lg:col-span-7 bg-night-950/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-10 md:p-12 max-w-2xl space-y-8 shadow-2xl animate-fade-up">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-terra-500/20 text-terra-300 border border-terra-500/30 font-body text-xs font-semibold tracking-widest uppercase rounded-full">
                  <Palette size={14} />
                  Made to Your Measure
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[1.15] tracking-tight text-white">
                Rooted in <br />
                <span className="text-gradient italic">Heritage.</span> <br />
                Crafted for <br />
                <span className="text-gradient italic">You.</span>
              </h1>

              <p className="text-earth-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
                Handcrafted African fashion you can personalize. From Ankara prints
                to Kente accents, every piece tells your story.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/catalog" className="btn-primary group w-full sm:w-auto text-center justify-center flex items-center">
                Start Customizing
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/catalog" className="btn-secondary w-full sm:w-auto text-center border-white/20 text-white hover:bg-white/10 justify-center flex items-center">
                Shop Collection
              </Link>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-white/10">
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-white">500+</p>
                <p className="text-xs sm:text-sm text-earth-300 font-medium">Custom Orders</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-white">40+</p>
                <p className="text-xs sm:text-sm text-earth-300 font-medium">Fabric Patterns</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-white">100%</p>
                <p className="text-xs sm:text-sm text-earth-300 font-medium">Handcrafted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
