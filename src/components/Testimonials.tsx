import { Star, Quote } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const testimonials = [
  {
    name: 'Amara O.',
    location: 'Lagos, Nigeria',
    text: 'The custom Ankara dress was beyond my expectations. The fit was perfect, and I could choose every detail from the neckline to the hem length. I felt like royalty at my event.',
    rating: 5,
    verified: true,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    name: 'Kwame A.',
    location: 'Accra, Ghana',
    text: "I ordered a Kente-accented blazer for my brother's wedding. The craftsmanship is incredible, and the customization process was so easy. Truly wearable art.",
    rating: 5,
    verified: true,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    name: 'Fatima D.',
    location: 'Nairobi, Kenya',
    text: "What impressed me most was how they blended traditional Kitenge patterns with a modern silhouette. My custom set gets compliments every time I wear it.",
    rating: 5,
    verified: true,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useInView();

  return (
    <section className="py-20 sm:py-28 bg-earth-100/50">
      <div className="section-container" ref={ref}>
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-terra-600 font-body text-sm font-semibold tracking-widest uppercase">
            Voices
          </span>
          <h2 className="heading-lg text-night-950 mt-2">What Our Community Says</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-white rounded-2xl p-8 shadow-sm border border-earth-200/50 hover:shadow-md transition-shadow duration-300 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <Quote size={28} className="text-terra-300 mb-4" />

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    className={si < t.rating ? 'fill-kente-500 text-kente-500' : 'text-earth-300'}
                  />
                ))}
              </div>

              <p className="text-earth-700 leading-relaxed mb-6">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-earth-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-night-950 text-sm">
                    {t.name}
                  </p>
                  <p className="text-xs text-earth-500">{t.location}</p>
                </div>
                {t.verified && (
                  <span className="ml-auto px-2 py-0.5 bg-savanna-100 text-savanna-700 text-[10px] font-semibold tracking-wider uppercase rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
