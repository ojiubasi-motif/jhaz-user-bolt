import { Link } from 'react-router-dom';
import { ArrowRight, Palette } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[650px] lg:h-[85vh] flex items-center overflow-hidden bg-earth-50">
      {/* Background Hero Image - starts below the navbar and sits on the right on desktop */}
      <div className="absolute inset-y-0 right-0 left-0 lg:left-auto lg:w-7/12 z-0 pt-20 sm:pt-24">
        <div className="w-full h-full relative">
          <img
            src="/images/hero-banner.jpg"
            alt="African traditional fashion wear couple banner"
            className="w-full h-full object-cover object-top"
          />
          {/* Ambient light gradient fading overlay */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-earth-50 via-earth-50/80 lg:from-5% lg:via-40% to-transparent" />
        </div>
      </div>

      <div className="section-container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Opaque Content Card */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-sm border border-earth-200/60 rounded-3xl p-6 sm:p-10 md:p-12 max-w-xl space-y-8 shadow-xl animate-fade-up">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-terra-100 text-terra-800 border border-terra-200/50 font-body text-xs font-semibold tracking-widest uppercase rounded-full">
                  <Palette size={14} />
                  Made to Your Measure
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[1.15] tracking-tight text-night-950">
                Rooted in <br />
                <span className="text-gradient italic">Heritage.</span> <br />
                Crafted for <br />
                <span className="text-gradient italic">You.</span>
              </h1>

              <p className="text-earth-600 text-sm sm:text-base md:text-lg leading-relaxed">
                Handcrafted African fashion you can personalize. From Ankara prints
                to Kente accents, every piece tells your story.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/catalog" className="btn-primary group w-full sm:w-auto text-center justify-center flex items-center">
                Start Customizing
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/catalog" className="btn-secondary w-full sm:w-auto text-center border-earth-300 text-[#1C1916] hover:bg-earth-100 justify-center flex items-center">
                Shop Collection
              </Link>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-earth-200">
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-night-950">500+</p>
                <p className="text-xs sm:text-sm text-earth-500 font-medium">Custom Orders</p>
              </div>
              <div className="w-px h-10 bg-earth-200" />
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-night-950">40+</p>
                <p className="text-xs sm:text-sm text-earth-500 font-medium">Fabric Patterns</p>
              </div>
              <div className="w-px h-10 bg-earth-200" />
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-night-950">100%</p>
                <p className="text-xs sm:text-sm text-earth-500 font-medium">Handcrafted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
