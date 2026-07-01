import { Link } from 'react-router-dom';
import { ArrowRight, Palette } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[650px] lg:min-h-screen flex items-center overflow-hidden bg-earth-50 pt-20 sm:pt-24">
      {/* Background Image only visible on mobile/tablet (below lg) */}
      <div className="absolute inset-0 z-0 lg:hidden">
        <img
          src="/images/hero-banner.jpg"
          alt="African traditional fashion wear couple background"
          className="w-full h-full object-cover object-top"
        />
        {/* Mild gradient overlay starting from the top-left */}
        <div className="absolute inset-0 bg-gradient-to-br from-earth-50/95 via-earth-50/65 to-transparent z-10" />
      </div>

      <div className="section-container relative z-10 py-12 lg:py-16 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Content - transparent background, text positioned top-left, scaled dynamically */}
          <div className="lg:col-span-6 space-y-8 animate-fade-up text-left max-w-xl lg:max-w-none">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-terra-100 text-terra-800 border border-terra-200/50 font-body text-xs font-semibold tracking-widest uppercase rounded-full">
                  <Palette size={14} />
                  Made to Your Measure
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-night-950">
                Rooted in <br />
                <span className="text-gradient italic">Heritage.</span> <br />
                Crafted for <br />
                <span className="text-gradient italic">You.</span>
              </h1>

              <p className="text-earth-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
                Handcrafted African fashion you can personalize. From Ankara prints
                to Kente accents, every piece tells your story.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/catalog" className="btn-primary group w-full sm:w-auto text-center justify-center flex items-center">
                Start Customizing
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/catalog" className="btn-secondary w-full sm:w-auto text-center border-earth-300 text-[#1C1916] hover:bg-earth-100/50 justify-center flex items-center">
                Shop Collection
              </Link>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 pt-4 border-t border-earth-300/60 max-w-md">
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-night-950">500+</p>
                <p className="text-xs sm:text-sm text-earth-600 font-medium">Custom Orders</p>
              </div>
              <div className="w-px h-10 bg-earth-300" />
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-night-950">40+</p>
                <p className="text-xs sm:text-sm text-earth-600 font-medium">Fabric Patterns</p>
              </div>
              <div className="w-px h-10 bg-earth-300" />
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-night-950">100%</p>
                <p className="text-xs sm:text-sm text-earth-600 font-medium">Handcrafted</p>
              </div>
            </div>
          </div>

          {/* Right: Bounded 3:4 Aspect Image - only visible on desktop (lg and up) */}
          <div className="hidden lg:col-span-6 lg:flex justify-center lg:justify-end animate-fade-up">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img
                src="/images/hero-banner.jpg"
                alt="African traditional fashion wear couple"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
