import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ChevronRight, Package, Trash2, Pencil } from 'lucide-react';

// ── Types (mirrors Order.tsx) ──────────────────────────────────────────────

type OutfitStyle = string;

interface FabricSelection {
  type: 'preset' | 'custom';
  presetId?: string;
  presetName?: string;
  presetColor?: string;
  presetPrice?: number;
  presetYardsPerUnit?: number;
  presetUnit?: string;
  customImageUrl?: string;
  notes?: string;
}

interface Measurements {
  chest: number; waist: number; hips: number;
  height: number; shoulderWidth: number; saveForFuture: boolean;
  fabricQty?: number;
  fabricUnit?: string;
}

interface Personalization {
  specialRequests: string;
}

interface OrderData {
  productId?: string;
  productName?: string;
  style: OutfitStyle | null;
  customStyleInfo?: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    image: string;
  } | null;
  fabric: FabricSelection | null;
  measurements: Measurements | null;
  personalization: Personalization | null;
  delivery: null;
  promoCode: string;
}

interface CartItem {
  id: string;
  order: OrderData;
}

// ── Constants (mirrors Order.tsx) ─────────────────────────────────────────

const OUTFIT_STYLES = [
  { id: 'agbada',   name: 'Agbada',    basePrice: 85000,  image: 'https://images.pexels.com/photos/7679865/pexels-photo-7679865.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'ankara',   name: 'Ankara',    basePrice: 45000,  image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'kaftan',   name: 'Kaftan',    basePrice: 55000,  image: 'https://images.pexels.com/photos/6764007/pexels-photo-6764007.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'aso-oke',  name: 'Aso-Oke',   basePrice: 120000, image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'babariga', name: 'Babariga',  basePrice: 75000,  image: 'https://images.pexels.com/photos/7679863/pexels-photo-7679863.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'iro-buba', name: 'Iro & Buba',basePrice: 65000,  image: 'https://images.pexels.com/photos/6140663/pexels-photo-6140663.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'senator',  name: 'Senator',   basePrice: 60000,  image: 'https://images.pexels.com/photos/7679727/pexels-photo-7679727.jpeg?auto=compress&cs=tinysrgb&w=400' },
] as const;

const FABRIC_PRESETS = [
  { id: 'cotton-white',     name: 'Premium Cotton — White',      color: '#FFFFFF',  price: 0     },
  { id: 'cotton-cream',     name: 'Premium Cotton — Cream',      color: '#FDF6EC',  price: 0     },
  { id: 'silk-gold',        name: 'Silk Blend — Gold',           color: '#D4A017',  price: 15000 },
  { id: 'silk-green',       name: 'Silk Blend — Deep Green',     color: '#1B4332',  price: 15000 },
  { id: 'lace-white',       name: 'Swiss Lace — White',          color: '#FFFEFA',  price: 25000 },
  { id: 'lace-champagne',   name: 'Swiss Lace — Champagne',      color: '#F7E7CE',  price: 25000 },
  { id: 'brocade-burgundy', name: 'Brocade — Burgundy',          color: '#722F37',  price: 20000 },
  { id: 'brocade-navy',     name: 'Brocade — Navy',              color: '#1B2A4E',  price: 20000 },
] as const;



const CART_KEY = 'jhaz_cart';

// ── Helpers ───────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('jhaz-cart-updated'));
}

function itemSubtotal(order: OrderData): number {
  const basePrice = order.customStyleInfo?.basePrice ?? OUTFIT_STYLES.find((s) => s.id === order.style)?.basePrice ?? 0;
  const fabricQty = order.measurements?.fabricQty || 2.0;
  const yardsPerUnit = order.fabric?.presetYardsPerUnit || 1.0;
  const unitsNeeded = Math.ceil(fabricQty / yardsPerUnit);
  const fabricPrice = order.fabric?.type === 'preset'
    ? (order.fabric.presetPrice ?? 0)
    : 0;
  const fee = fabricPrice * unitsNeeded;
  return basePrice + fee;
}

// ── Cart Page ─────────────────────────────────────────────────────────────

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  // Keep navbar badge in sync
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const remove = (id: string) => setItems((prev: CartItem[]) => prev.filter((c: CartItem) => c.id !== id));
  const clear  = () => setItems([]);

  const cartTotal = useMemo(
    () => items.reduce((sum: number, item: CartItem) => sum + itemSubtotal(item.order), 0),
    [items],
  );

  // Checkout → go into Order wizard at the Delivery step (step 6)
  // Cart items are already in localStorage so Order.tsx will pick them up
  const handleCheckout = () => navigate('/order?step=6');

  // ── Empty state ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-earth-50 pt-16 sm:pt-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-earth-100 flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-earth-300" />
        </div>
        <h1 className="font-display text-3xl font-bold text-night-950">Your Cart is Empty</h1>
        <p className="mt-3 text-earth-500 max-w-sm">
          You haven't added any custom outfits yet. Browse the catalog and start customizing.
        </p>
        <Link to="/catalog" className="mt-8 btn-primary rounded-xl inline-flex items-center gap-2">
          Browse Catalog
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  // ── Filled cart ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-earth-50 pt-16 sm:pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-night-950 via-night-900 to-night-950 text-earth-50 py-10 sm:py-14">
        <div className="section-container">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Your Cart</h1>
          <p className="mt-1 text-earth-300 text-sm">
            {items.length} custom outfit{items.length !== 1 ? 's' : ''} ready for checkout
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Item list ──────────────────────────────────────────────── */}
          <div className="flex-1 space-y-4">
            {/* List header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-night-950">
                Order Items
              </h2>
              <button
                onClick={clear}
                className="flex items-center gap-1.5 text-xs text-earth-400 hover:text-red-500 transition-colors font-medium"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>

            {items.map((item: CartItem, index: number) => {
              const style  = item.order.customStyleInfo || OUTFIT_STYLES.find((s) => s.id === item.order.style);
              const fabric = item.order.fabric?.type === 'preset'
                ? {
                    id: item.order.fabric.presetId,
                    name: item.order.fabric.presetName || FABRIC_PRESETS.find((f) => f.id === item.order.fabric?.presetId)?.name || 'Custom Fabric',
                    color: item.order.fabric.presetColor || FABRIC_PRESETS.find((f) => f.id === item.order.fabric?.presetId)?.color || '#eee',
                    price: item.order.fabric.presetPrice ?? 0,
                    yardsPerUnit: item.order.fabric.presetYardsPerUnit || 1.0,
                    unit: item.order.fabric.presetUnit || 'yard',
                  }
                : null;
              const total  = itemSubtotal(item.order);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-earth-200/60 shadow-sm p-4 flex gap-4 group"
                >
                  {/* Outfit thumbnail */}
                  <div
                    className="relative group/img shrink-0 w-20 h-28 rounded-xl overflow-hidden border border-earth-100 bg-earth-100 cursor-pointer"
                    onClick={() => style && setActiveImageUrl(style.image)}
                    title="View larger image"
                  >
                    {style ? (
                      <>
                        <img
                          src={style.image}
                          alt={style.name}
                          className="w-full h-full object-cover transition-transform group-hover/img:scale-105 duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <span className="text-xs text-white font-semibold">Zoom</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-earth-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {/* Item number + name */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-terra-600 font-semibold tracking-widest uppercase">
                          Item {index + 1}
                        </span>
                        <h3 className="font-display text-base font-extrabold text-night-950 leading-snug">
                          {item.order.productName || style?.name || 'Custom Outfit'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => navigate(`/order?step=1&edit=${item.id}`)}
                          className="p-1.5 rounded-lg text-earth-400 hover:text-terra-600 hover:bg-terra-50 transition-all"
                          title="Edit Customization"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          className="p-1.5 rounded-lg text-earth-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Remove item"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Customization Details */}
                    <div className="mt-1.5 space-y-1 text-xs text-earth-500">
                      {item.order.customStyleInfo && (
                        <p>Style: <span className="font-semibold text-night-800">{item.order.customStyleInfo.name}</span></p>
                      )}
                      {fabric && (
                        <p className="flex items-center gap-1.5 flex-wrap">
                          Fabric: 
                          <span
                            className="w-2 h-2 rounded-full border border-earth-300 inline-block"
                            style={{ backgroundColor: fabric.color }}
                          />
                          <span className="font-semibold text-night-800">{fabric.name.split('—')[1]?.trim() ?? fabric.name}</span>
                          {item.order.measurements?.fabricQty && (
                            <span className="text-earth-500 font-medium">
                              ({item.order.measurements.fabricQty} yd needed - {Math.ceil(item.order.measurements.fabricQty / fabric.yardsPerUnit)} {fabric.unit}{Math.ceil(item.order.measurements.fabricQty / fabric.yardsPerUnit) > 1 ? 's' : ''} req.)
                            </span>
                          )}
                          <span className="text-terra-600 font-medium">
                            ({fabric.price > 0 ? `+${formatNaira(fabric.price * Math.ceil((item.order.measurements?.fabricQty || 2.0) / fabric.yardsPerUnit))}` : 'Included'})
                          </span>
                        </p>
                      )}
                      {item.order.personalization?.specialRequests && (
                        <p className="italic text-earth-400 mt-1">
                          Request: "{item.order.personalization.specialRequests}"
                        </p>
                      )}
                    </div>

                    {/* Item price */}
                    <p className="mt-3 font-display text-lg font-bold text-kente-600">
                      {formatNaira(total)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Add another */}
            <Link
              to="/catalog"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-dashed border-earth-300 text-sm font-semibold text-earth-500 hover:border-terra-400 hover:text-terra-600 transition-colors"
            >
              <Package size={16} />
              Add Another Outfit
            </Link>
          </div>

          {/* ── Order summary sidebar ───────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-earth-200/60 shadow-sm p-6 sticky top-28">
              <h2 className="font-display text-lg font-bold text-night-950 mb-5">
                Order Total
              </h2>

              {/* Per-item breakdown */}
              <div className="space-y-3 mb-5">
                {items.map((item: CartItem, index: number) => {
                  const style = item.order.customStyleInfo || OUTFIT_STYLES.find((s) => s.id === item.order.style);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-earth-600 truncate mr-2">
                        {index + 1}. {style?.name ?? 'Custom Outfit'}
                      </span>
                      <span className="font-semibold text-night-950 shrink-0">
                        {formatNaira(itemSubtotal(item.order))}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-earth-200 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-earth-500">Items subtotal</span>
                  <span className="font-semibold text-night-950">{formatNaira(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-sm text-earth-500">Delivery</span>
                  <span className="text-xs text-earth-400 italic">calculated at checkout</span>
                </div>
              </div>

              {/* Grand total */}
              <div className="bg-night-950 rounded-xl px-4 py-3 flex justify-between items-center mb-5">
                <span className="text-earth-300 text-sm font-medium">Total (excl. delivery)</span>
                <span className="font-display text-xl font-bold text-kente-400">
                  {formatNaira(cartTotal)}
                </span>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-kente-600 hover:bg-kente-700 text-white transition-all"
              >
                Proceed to Checkout
                <ChevronRight size={16} />
              </button>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-earth-400">
                <span className="text-[10px] font-medium">🔒 Secure Checkout</span>
                <span className="text-[10px] font-medium">✦ Handcrafted</span>
                <span className="text-[10px] font-medium">📦 Tracked</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setActiveImageUrl(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setActiveImageUrl(null)}
          >
            <X size={24} />
          </button>
          <img
            src={activeImageUrl}
            alt="Enlarged style preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  );
}