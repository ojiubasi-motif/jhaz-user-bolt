import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';

export default function Newsletter() {
  const { ref, isVisible } = useInView();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-night-950 text-earth-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)`,
      }} />

      <div className="section-container relative z-10" ref={ref}>
        <div className={`max-w-2xl mx-auto text-center ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-terra-400 font-body text-sm font-semibold tracking-widest uppercase">
            Stay Connected
          </span>
          <h2 className="heading-lg text-earth-50 mt-2">
            Join the Jhaz-imprints Community
          </h2>
          <p className="text-earth-400 mt-4 leading-relaxed">
            Be the first to see new collections, get exclusive customization
            options, and receive stories from our artisan partners.
          </p>

          {submitted ? (
            <div className="mt-8 px-6 py-4 bg-savanna-600/20 border border-savanna-500/30 rounded-xl">
              <p className="text-savanna-300 font-medium">
                Welcome to Jhaz-imprints. Check your inbox for something special.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-4 bg-earth-900/50 border border-earth-700 text-earth-100 placeholder-earth-500 rounded-lg font-body text-sm focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              />
              <button
                type="submit"
                className="btn-primary rounded-lg group"
              >
                Subscribe
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}

          <p className="text-xs text-earth-600 mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
