import { Star, Heart, ArrowRight } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useInView } from '../hooks/useInView';

const products = [
  {
    id: 1,
    name: 'The Heritage Ankara Dress',
    price: 45000,
    originalPrice: 55000,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=600',
    customizable: true,
  },
  {
    id: 2,
    name: 'Kente Accented Blazer',
    price: 65000,
    rating: 4.8,
    reviews: 87,
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600',
    customizable: true,
  },
  {
    id: 3,
    name: 'Adire Flow Pants',
    price: 35000,
    rating: 4.7,
    reviews: 64,
    image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=600',
    customizable: true,
  },
];

export default function Bestsellers() {
  const { ref, isVisible } = useInView();

  return (
    <section id="bestsellers" className="py-20 sm:py-28 bg-earth-50">
      <div className="section-container" ref={ref}>
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-terra-600 font-body text-sm font-semibold tracking-widest uppercase">
            Most Loved
          </span>
          <h2 className="heading-lg text-night-950 mt-2">Bestsellers</h2>
          <p className="body-md max-w-xl mx-auto mt-3">
            The pieces our community keeps coming back for.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`group ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <div className="card-hover">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-earth-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="img-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Sale tag */}
                  {product.originalPrice && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-terra-600 text-white text-xs font-bold tracking-wider uppercase rounded-full">
                      Save ₦{(product.originalPrice - product.price).toLocaleString('en-NG')}
                    </span>
                  )}

                  {/* Wishlist */}
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-night-800 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 duration-300">
                    <Heart size={18} />
                  </button>

                  {/* Customizable badge */}
                  {product.customizable && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-night-950 text-xs font-semibold rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
                        Customizable
                      </span>
                    </div>
                  )}
                  {/* Quick action overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <RouterLink to={`/order?product=${product.id}`} className="w-full btn-primary text-xs py-3 rounded-lg flex items-center justify-center gap-2">
                      Customize & Order
                      <ArrowRight size={14} />
                    </RouterLink>
                  </div>
                </div>

                <div className="flex flex-col flex-1 gap-2 p-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        size={14}
                        className={si < Math.floor(product.rating) ? 'fill-kente-500 text-kente-500' : 'text-earth-300'}
                      />
                    ))}
                    <span className="text-xs text-earth-500 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-night-950 group-hover:text-terra-700 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold text-night-950">
                      ₦{product.price.toLocaleString('en-NG')}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-earth-400 line-through">
                        ₦{product.originalPrice.toLocaleString('en-NG')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
