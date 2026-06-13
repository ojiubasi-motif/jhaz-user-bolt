import { Link } from 'react-router-dom';
import { ArrowRight, Palette } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-earth-50 pattern-overlay">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-terra-200/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-kente-200/15 blur-3xl animate-float delay-300" />

      {/* Decorative pattern lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-earth-200/40 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-terra-200/30 to-transparent" />

      <div className="section-container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-terra-100 text-terra-800 font-body text-xs font-semibold tracking-widest uppercase rounded-full">
                <Palette size={14} />
                Made to Your Measure
              </span>
            </div>

            <h1 className="heading-xl animate-fade-up delay-100">
              <span className="text-night-950">Rooted in</span>
              <br />
              <span className="text-gradient italic">Heritage.</span>
              <br />
              <span className="text-night-950">Crafted for</span>
              <br />
              <span className="text-gradient italic">You.</span>
            </h1>

            <p className="body-lg max-w-lg animate-fade-up delay-200">
              Handcrafted African fashion you can personalize. From Ankara prints
              to Kente accents, every piece tells your story.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-300">
              <Link to="/catalog" className="btn-primary group w-full sm:w-auto">
                Start Customizing
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/catalog" className="btn-secondary w-full sm:w-auto">
                Shop Collection
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4 animate-fade-up delay-400">
              <div>
                <p className="font-display text-3xl font-bold text-night-950">500+</p>
                <p className="text-sm text-earth-500 font-medium">Custom Orders</p>
              </div>
              <div className="w-px h-12 bg-earth-300" />
              <div>
                <p className="font-display text-3xl font-bold text-night-950">40+</p>
                <p className="text-sm text-earth-500 font-medium">Fabric Patterns</p>
              </div>
              <div className="w-px h-12 bg-earth-300" />
              <div>
                <p className="font-display text-3xl font-bold text-night-950">100%</p>
                <p className="text-sm text-earth-500 font-medium">Handcrafted</p>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] aspect-[3/4] max-w-md mx-auto lg:ml-auto">
              {/* Main image */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/hero-welcome.jpg"
                  alt="African fashion model in custom Ankara attire"
                  className="img-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950/30 via-transparent to-transparent" />
              </div>

              {/* Floating detail card */}
              <div className="absolute -bottom-6 -left-2 sm:-left-12 bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg max-w-[220px] animate-float delay-500">
                <p className="font-display text-sm font-semibold text-night-950">Custom Ankara Set</p>
                <p className="text-xs text-earth-500 mt-1">Your print. Your fit.</p>
                <p className="font-display text-lg font-bold text-terra-600 mt-2">₦120,000</p>
              </div>

              {/* Floating fabric swatch */}
              <div className="absolute -top-4 -right-2 sm:-right-8 w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white animate-float delay-700">
                <img
                  src="https://images.pexels.com/photos/6044242/pexels-photo-6044242.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Ankara fabric swatch"
                  className="img-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
