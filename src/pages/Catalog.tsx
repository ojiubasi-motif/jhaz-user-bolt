import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Heart, ArrowRight, Package, Palette, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, fetchCategories } from '../store/slices/catalogSlice';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string;
  fabric_type: string | null;
  image_url: string | null;
  is_customizable: boolean;
  rating: number;
  review_count: number;
  tag: string | null;
  gender: string;
  occasion: string;
  shipping_badge: string;
}

interface Filters {
  category: string[];
  gender: string[];
  occasion: string[];
  search: string;
}

type FilterKey = 'category' | 'gender' | 'occasion';

const SECTION_TITLES: Record<FilterKey, string> = {
  category: 'Category',
  gender: 'Gender',
  occasion: 'Occasion',
};

const INITIAL_FILTERS: Filters = {
  category: [],
  gender: [],
  occasion: [],
  search: '',
};

// Maps homepage category names → matching catalog category filter values
const HOMEPAGE_CATEGORY_MAP: Record<string, string[]> = {
  'Dresses & Gowns':      ['Ankara Casual', 'Iro & Buba', 'Kente Gown'],
  'Tops & Blouses':       ['Dashiki', 'Ankara Casual', 'Blazer Top'],
  'Bottoms & Skirts':     ['Iro & Buba'],
  'Jackets & Outerwear':  ['Boubou', 'Agbada'],
  'Matching Sets':        ['Senator', 'Agbada', 'Kaftan'],
  'Accessories':          ['Isiagu'],
};

export default function Catalog() {
  const dispatch = useAppDispatch();
  const { products, categories, loading } = useAppSelector((state) => state.catalog);

  const [searchParams, setSearchParams] = useSearchParams();
  const [homepageCategoryLabel, setHomepageCategoryLabel] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    gender: true,
    occasion: true,
  });

  // Fetch products and categories on mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Read ?category= param and apply matching filters whenever search params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && HOMEPAGE_CATEGORY_MAP[cat]) {
      setHomepageCategoryLabel(cat);
      setFilters((prev) => ({ ...prev, category: HOMEPAGE_CATEGORY_MAP[cat] }));
    } else {
      // Clear category filter if no valid category param
      setHomepageCategoryLabel(null);
      setFilters((prev) => ({ ...prev, category: [] }));
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search — check first so we can short-circuit early (mirrors apps/user pattern)
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.occasion || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Category — DB stores Title Case ('Agbada', 'Ankara') → exact match
      if (filters.category.length > 0 && !filters.category.includes(p.category)) return false;

      // Gender — DB stores lowercase ('men', 'women', 'kids'), filter stores Title Case ('Men')
      // Normalize both sides to lowercase for a reliable comparison
      if (
        filters.gender.length > 0 &&
        !filters.gender.some((g) => g.toLowerCase() === (p.gender || '').toLowerCase())
      ) return false;

      // Occasion — DB stores lowercase ('wedding', 'casual'), filter stores Title Case ('Wedding')
      if (
        filters.occasion.length > 0 &&
        !filters.occasion.some((o) => {
          const lowerOccasion = (p.occasion || '').toLowerCase();
          return o.toLowerCase() === lowerOccasion || (o === 'Celebrations' && lowerOccasion === 'social-events-celebrations');
        })
      ) return false;

      return true;
    });
  }, [products, filters]);

  const activeFilterCount = useMemo(() => {
    return filters.category.length + filters.gender.length + filters.occasion.length;
  }, [filters]);

  const filterOptions = useMemo(() => {
    return {
      category: categories.map((c) => c.name),
      gender: ['Men', 'Women', 'Kids', 'Unisex'],
      occasion: ['Wedding', 'Casual', 'Corporate', 'Celebrations', 'Burial'],
    };
  }, [categories]);

  // Data stats derived from full product list
  const dataStats = useMemo(() => {
    const customizable = products.filter(p => p.is_customizable).length;
    const categoriesCount = new Set(products.map(p => p.category)).size;
    return { total: products.length, customizable, categories: categoriesCount };
  }, [products]);

  // Per-option counts — keyed by the display label used in filterOptions.
  const optionCounts = useMemo(() => {
    const genderMap: Record<string, string> = {
      'men': 'Men',
      'women': 'Women',
      'kids': 'Kids',
      'unisex': 'Unisex',
    };
    const occasionMap: Record<string, string> = {
      'wedding': 'Wedding',
      'casual': 'Casual',
      'corporate': 'Corporate',
      'social-events-celebrations': 'Celebrations',
      'burial': 'Burial',
    };

    const counts: Record<string, Record<string, number>> = {
      category: {}, gender: {}, occasion: {},
    };
    products.forEach((p) => {
      // Category — stored Title Case, matches filter labels directly
      if (p.category) {
        counts.category[p.category] = (counts.category[p.category] || 0) + 1;
      }
      // Gender — normalize lowercase DB value to Title Case label
      if (p.gender) {
        const label = genderMap[p.gender.toLowerCase()] ?? p.gender;
        counts.gender[label] = (counts.gender[label] || 0) + 1;
      }
      // Occasion — normalize lowercase DB value to Title Case label
      if (p.occasion) {
        const label = occasionMap[p.occasion.toLowerCase()] ?? p.occasion;
        counts.occasion[label] = (counts.occasion[label] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const toggleFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setHomepageCategoryLabel(null);
    setSearchParams({});
  }, [setSearchParams]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // FilterSection and the sidebar content are rendered inline below,
  // NOT defined as arrow-function components inside the render body.
  // Defining components inside render causes React to remount them on every state
  // change (new function reference = different component type), which breaks checkbox
  // interaction. Instead we render JSX directly or pass props to the bottom-of-file
  // helper functions.

  return (
    <div className="min-h-screen bg-earth-50 pt-20 sm:pt-24">
      {/* Page header */}
      <div className="section-container pt-8 pb-6 animate-fade-up">
        <span className="text-terra-600 font-body text-sm font-semibold tracking-widest uppercase">
          Our Collection
        </span>
        <h1 className="heading-lg text-night-950 mt-1">Shop All</h1>
        <p className="body-md mt-2">
          Handcrafted African fashion, customizable to your vision.
        </p>

        {/* Data stats — shown once products load */}
        {!loading && products.length > 0 && (
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
                <Package size={15} className="text-terra-700" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-night-950 leading-none">{dataStats.total}</p>
                <p className="text-[11px] text-earth-500 font-medium mt-0.5">Total Pieces</p>
              </div>
            </div>
            <div className="w-px h-8 bg-earth-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
                <Palette size={15} className="text-terra-700" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-night-950 leading-none">{dataStats.customizable}</p>
                <p className="text-[11px] text-earth-500 font-medium mt-0.5">Customizable</p>
              </div>
            </div>
            <div className="w-px h-8 bg-earth-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
                <Tag size={15} className="text-terra-700" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-night-950 leading-none">{dataStats.categories}</p>
                <p className="text-[11px] text-earth-500 font-medium mt-0.5">Categories</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky search bar — stays below the fixed navbar (top-20/top-24) */}
      <div className="sticky top-20 sm:top-24 z-30 bg-earth-50/95 backdrop-blur-md border-b border-earth-200/80 shadow-sm">
        <div className="section-container py-3">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
              <input
                type="text"
                placeholder="Search dresses, fabrics, styles..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-11 pr-10 py-2.5 bg-white border border-earth-200 rounded-xl text-base font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-night-950"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-earth-200 rounded-xl text-sm font-medium text-night-950 hover:border-terra-400 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-terra-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Results count (right-aligned in search bar) */}
            {!loading && (
              <p className="hidden sm:block text-sm text-earth-500 shrink-0 ml-auto">
                Showing{' '}
                <span className="font-semibold text-night-950">{filteredProducts.length}</span>
                {' '}piece{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Active filter tags */}
          {(activeFilterCount > 0 || homepageCategoryLabel) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Homepage category tag */}
              {homepageCategoryLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terra-100 text-terra-700 text-xs font-semibold border border-terra-200">
                  Category: {homepageCategoryLabel}
                  <button
                    onClick={() => {
                      setHomepageCategoryLabel(null);
                      setFilters((prev) => ({ ...prev, category: [] }));
                      setSearchParams({});
                    }}
                    className="ml-0.5 hover:text-terra-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {!homepageCategoryLabel && filters.category.map((v) => (
                <FilterTag key={`cat-${v}`} label={v} onRemove={() => toggleFilter('category', v)} />
              ))}
              {filters.gender.map((v) => (
                <FilterTag key={`gen-${v}`} label={v} onRemove={() => toggleFilter('gender', v)} />
              ))}
              {filters.occasion.map((v) => (
                <FilterTag key={`occ-${v}`} label={v} onRemove={() => toggleFilter('occasion', v)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="section-container py-6">
        <div className="flex gap-8">

          {/* Desktop sidebar — sticky, vertically scrollable when content overflows */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-[calc(6rem+3.5rem)] bg-white rounded-2xl border border-earth-200/60 shadow-sm">
              {/* Sidebar header is outside the scroll container so it stays visible */}
              <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-earth-100">
                <h3 className="font-display text-lg font-bold text-night-950">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-terra-600 font-semibold hover:text-terra-800 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {/* Scrollable filter content — no overflow clipping on outer card */}
              <div className="overflow-y-auto max-h-[calc(100vh-16rem)] px-6 py-4">
                {(['category', 'gender', 'occasion'] as const).map((key) => (
                  <FilterSectionItem
                    key={key}
                    title={SECTION_TITLES[key]}
                    sectionKey={key}
                    options={filterOptions[key]}
                    selectedValues={filters[key]}
                    isExpanded={expandedSections[key]}
                    counts={optionCounts[key]}
                    onToggleSection={toggleSection}
                    onToggleFilter={toggleFilter}
                  />
                ))}
              </div>
            </div>
          </aside>
 
          {/* Product grid */}
          <main className="flex-1 min-w-0">
            {/* Mobile result count */}
            {!loading && (
              <p className="sm:hidden text-sm text-earth-500 mb-4">
                <span className="font-semibold text-night-950">{filteredProducts.length}</span>
                {' '}piece{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            )}
 
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden border border-earth-100">
                    <div className="aspect-square md:aspect-[4/3] bg-earth-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-earth-200 rounded w-1/3" />
                      <div className="h-4 bg-earth-200 rounded w-3/4" />
                      <div className="h-5 bg-earth-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-earth-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-earth-400" />
                </div>
                <p className="font-display text-2xl font-semibold text-night-950 mb-2">No pieces found</p>
                <p className="text-earth-500 mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="btn-secondary text-sm">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
 
      {/* Floating mobile filter toggle */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-terra-600 text-white rounded-full shadow-2xl hover:bg-terra-700 transition-all font-semibold text-sm hover:scale-105 active:scale-95"
        aria-label="Filter products"
      >
        <SlidersHorizontal size={18} />
        Filter
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 bg-white text-terra-700 text-[10px] font-extrabold rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-night-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-earth-50 shadow-2xl lg:hidden flex flex-col">
            {/* Drawer header — stays fixed at top */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-earth-200 shrink-0">
              <h3 className="font-display text-lg font-bold text-night-950">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-lg bg-earth-200 flex items-center justify-center text-night-950 hover:bg-earth-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {/* Scrollable filter body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
               {(['category', 'gender', 'occasion'] as const).map((key) => (
                 <FilterSectionItem
                   key={key}
                   title={SECTION_TITLES[key]}
                   sectionKey={key}
                   options={filterOptions[key]}
                   selectedValues={filters[key]}
                   isExpanded={expandedSections[key]}
                   counts={optionCounts[key]}
                   onToggleSection={toggleSection}
                   onToggleFilter={toggleFilter}
                 />
               ))}
            </div>
            {/* Drawer footer — stays fixed at bottom */}
            <div className="shrink-0 px-6 py-4 bg-earth-50/95 backdrop-blur-sm border-t border-earth-200">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full btn-primary rounded-xl"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terra-100 text-terra-800 text-xs font-semibold rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-terra-950 transition-colors">
        <X size={12} />
      </button>
    </span>
  );
}

// ─── FilterSectionItem ───────────────────────────────────────────────────────
// Defined OUTSIDE Catalog so React never remounts it on state change.
// Receives all needed state as props — mirrors apps/user's FilterSection pattern.
interface FilterSectionItemProps {
  title: string;
  sectionKey: FilterKey;
  options: string[];
  selectedValues: string[];
  isExpanded: boolean;
  counts: Record<string, number>;
  onToggleSection: (key: string) => void;
  onToggleFilter: (key: FilterKey, value: string) => void;
}

function FilterSectionItem({
  title,
  sectionKey,
  options,
  selectedValues,
  isExpanded,
  counts,
  onToggleSection,
  onToggleFilter,
}: FilterSectionItemProps) {
  return (
    <div className="border-b border-earth-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => onToggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="font-display text-sm font-semibold text-night-950 group-hover:text-terra-700 transition-colors">
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp size={16} className="text-earth-500" />
        ) : (
          <ChevronDown size={16} className="text-earth-500" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {options.map((option) => {
            const isChecked = selectedValues.includes(option);
            const count = counts?.[option];
            return (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer group/option"
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    isChecked
                      ? 'bg-terra-600 border-terra-600'
                      : 'border-earth-400 group-hover/option:border-terra-400'
                  }`}
                  onClick={() => onToggleFilter(sectionKey, option)}
                >
                  {isChecked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  className="flex-1 text-sm text-earth-700 group-hover/option:text-night-950 transition-colors"
                  onClick={() => onToggleFilter(sectionKey, option)}
                >
                  {option}
                </span>
                {count !== undefined && (
                  <span className="text-xs text-earth-400 tabular-nums">{count}</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [wishlist, setWishlist] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group flex flex-col rounded-[24px] overflow-hidden bg-[#F5F2EB]/50 border border-[#E3DCD0] shadow-sm hover:shadow-md transition-all duration-300 h-full">
        {/* Image Container flush with top edges, no bottom corner roundness */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative w-full aspect-[3/4] overflow-hidden bg-earth-100 cursor-zoom-in"
        >
          <img
            src={product.image_url || 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=600'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
            loading="lazy"
          />
        </div>

        {/* Info - Padded details matching Framer layout */}
        <div className="flex flex-col flex-1 p-4 gap-2 justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              {product.tag ? (
                <span className="px-2.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold rounded-[6px] uppercase tracking-wider">
                  {product.tag}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-earth-100 text-earth-700 text-[10px] font-bold rounded-[6px] uppercase tracking-wider">
                  {product.shipping_badge}
                </span>
              )}
              <span className="font-display text-sm sm:text-base font-bold text-night-950">
                ₦{product.price.toLocaleString('en-NG')}
              </span>
            </div>

            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-night-950 group-hover:text-terra-700 transition-colors leading-snug">
                {product.name}
              </h3>
              <p className="text-[11px] text-earth-500 leading-normal mt-1 line-clamp-2">
                {product.description || "Handcrafted traditional wear personalized to your size and fabric choice."}
              </p>
            </div>
          </div>
        </div>

        {/* Base buttons - statically positioned at the bottom, no hover reveal transitions */}
        <div className="flex items-center border-t border-[#E3DCD0] bg-[#FAF8F5] divide-x divide-[#E3DCD0] mt-auto">
          {/* Left: Customize Button */}
          <Link
            to={`/order?product=${product.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-night-950 hover:text-terra-700 transition-colors text-xs font-bold min-h-[44px]"
          >
            <Palette size={14} />
            Customize & Order
          </Link>
          
          {/* Right: Wishlist Button */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlist(!wishlist); }}
            className="px-4 py-3 text-night-950 hover:text-red-500 transition-colors flex items-center justify-center min-h-[44px]"
            aria-label="Toggle wishlist"
          >
            <Heart size={14} className={wishlist ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>
      </div>

      {/* Lightbox Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-transparent flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.image_url || 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=600'}
              alt={product.name}
              className="w-full h-full max-h-[85vh] object-contain rounded-xl select-none shadow-2xl"
            />
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md border border-white/10"
              aria-label="Close image modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
