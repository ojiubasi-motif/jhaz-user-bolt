import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, ChevronLeft, ChevronRight, Upload, Info,
  CreditCard, Building2, Phone, Smartphone,
  Lock, ShieldCheck, Pencil, Tag, X,
  CheckCircle2, Package, Mail, Calendar, Copy,
  Truck, Zap, ShoppingBag,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

type OutfitStyle = 'agbada' | 'ankara' | 'kaftan' | 'aso-oke' | 'babariga' | 'iro-buba' | 'senator';
type EmbroideryStyle = 'none' | 'minimal' | 'moderate' | 'elaborate';
type NecklineType = 'round' | 'v-neck' | 'mandarin' | 'open-collar';
type SleeveLength = 'short' | 'three-quarter' | 'full' | 'cap';
type DeliveryMethod = 'standard' | 'express';

interface FabricSelection {
  type: 'preset' | 'custom';
  presetId?: string;
  customImageUrl?: string;
  notes?: string;
}

interface Measurements {
  chest: number;
  waist: number;
  hips: number;
  height: number;
  shoulderWidth: number;
  saveForFuture: boolean;
}

interface Personalization {
  embroideryStyle: EmbroideryStyle;
  necklineType: NecklineType;
  sleeveLength: SleeveLength;
  addLining: boolean;
  accessories: string[];
  specialRequests: string;
}

interface DeliveryDetails {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  preferredDate: string;
  deliveryMethod: DeliveryMethod;
}

interface OrderData {
  style: OutfitStyle | null;
  fabric: FabricSelection | null;
  measurements: Measurements | null;
  personalization: Personalization | null;
  delivery: DeliveryDetails | null;
  promoCode: string;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const STEPS = [
  { id: 1, name: 'Style' },
  { id: 2, name: 'Fabric' },
  { id: 3, name: 'Measurements' },
  { id: 4, name: 'Personalize' },
  { id: 5, name: 'Cart' },
  { id: 6, name: 'Delivery' },
  { id: 7, name: 'Summary' },
  { id: 8, name: 'Payment' },
  { id: 9, name: 'Done' },
];

const OUTFIT_STYLES = [
  { id: 'agbada', name: 'Agbada', description: 'Traditional flowing robe', basePrice: 85000, image: 'https://images.pexels.com/photos/7679865/pexels-photo-7679865.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'ankara', name: 'Ankara', description: 'Vibrant African prints', basePrice: 45000, image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'kaftan', name: 'Kaftan', description: 'Elegant loose-fitting garment', basePrice: 55000, image: 'https://images.pexels.com/photos/6764007/pexels-photo-6764007.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'aso-oke', name: 'Aso-Oke', description: 'Hand-woven ceremonial fabric', basePrice: 120000, image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'babariga', name: 'Babariga', description: 'Flowing outer garment', basePrice: 75000, image: 'https://images.pexels.com/photos/7679863/pexels-photo-7679863.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'iro-buba', name: 'Iro & Buba', description: 'Traditional wrapper set', basePrice: 65000, image: 'https://images.pexels.com/photos/6140663/pexels-photo-6140663.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'senator', name: 'Senator', description: 'Modern Nigerian formal wear', basePrice: 60000, image: 'https://images.pexels.com/photos/7679727/pexels-photo-7679727.jpeg?auto=compress&cs=tinysrgb&w=400' },
] as const;

const FABRIC_PRESETS = [
  { id: 'cotton-white', name: 'Premium Cotton — White', color: '#FFFFFF', price: 0 },
  { id: 'cotton-cream', name: 'Premium Cotton — Cream', color: '#FDF6EC', price: 0 },
  { id: 'silk-gold', name: 'Silk Blend — Gold', color: '#D4A017', price: 15000 },
  { id: 'silk-green', name: 'Silk Blend — Deep Green', color: '#1B4332', price: 15000 },
  { id: 'lace-white', name: 'Swiss Lace — White', color: '#FFFEFA', price: 25000 },
  { id: 'lace-champagne', name: 'Swiss Lace — Champagne', color: '#F7E7CE', price: 25000 },
  { id: 'brocade-burgundy', name: 'Brocade — Burgundy', color: '#722F37', price: 20000 },
  { id: 'brocade-navy', name: 'Brocade — Navy', color: '#1B2A4E', price: 20000 },
] as const;

const DELIVERY_PRICES = { standard: 3500, express: 7500 } as const;

const CUSTOMIZATION_PRICES = {
  embroidery: { none: 0, minimal: 5000, moderate: 12000, elaborate: 25000 },
  lining: 8000,
  accessories: 3000,
} as const;

const EMBROIDERY_OPTIONS: { value: EmbroideryStyle; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'Clean, simple finish' },
  { value: 'minimal', label: 'Minimal', description: 'Subtle collar & cuff accents' },
  { value: 'moderate', label: 'Moderate', description: 'Elegant front-panel patterns' },
  { value: 'elaborate', label: 'Elaborate', description: 'Full intricate embroidery' },
];

const NECKLINE_OPTIONS: { value: NecklineType; label: string }[] = [
  { value: 'round', label: 'Round Neck' },
  { value: 'v-neck', label: 'V-Neck' },
  { value: 'mandarin', label: 'Mandarin Collar' },
  { value: 'open-collar', label: 'Open Collar' },
];

const SLEEVE_OPTIONS: { value: SleeveLength; label: string }[] = [
  { value: 'short', label: 'Short Sleeve' },
  { value: 'three-quarter', label: '¾ Sleeve' },
  { value: 'full', label: 'Full Length' },
  { value: 'cap', label: 'Cap Sleeve' },
];

const ACCESSORY_OPTIONS = [
  { id: 'cap', label: 'Matching Cap / Fila' },
  { id: 'shoes', label: 'Matching Shoes' },
  { id: 'bag', label: 'Matching Bag' },
  { id: 'jewelry', label: 'Jewellery Set' },
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const SUPPORTED_COUNTRIES = ['Nigeria'] as const;

const MEASUREMENT_GUIDES: Record<string, string> = {
  chest: 'Measure around the fullest part of your chest, keeping the tape horizontal.',
  waist: 'Measure around your natural waistline, keeping the tape comfortably loose.',
  hips: 'Measure around the fullest part of your hips, about 20 cm below your waist.',
  height: 'Stand straight against a wall and measure from floor to top of head.',
  shoulderWidth: 'Measure from the edge of one shoulder to the edge of the other.',
};

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// Cart item = one complete customization cycle
interface CartItem {
  id: string;
  order: OrderData;
}

const CART_KEY = 'jhaz_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('jhaz-cart-updated'));
}

function calculateOrderTotal(order: OrderData) {
  const style = OUTFIT_STYLES.find((s) => s.id === order.style);
  const basePrice = style?.basePrice || 0;
  const fabric = FABRIC_PRESETS.find((f) => f.id === order.fabric?.presetId);
  let customizationFee = fabric?.price || 0;
  if (order.personalization) {
    customizationFee += CUSTOMIZATION_PRICES.embroidery[order.personalization.embroideryStyle];
    if (order.personalization.addLining) customizationFee += CUSTOMIZATION_PRICES.lining;
    customizationFee += order.personalization.accessories.length * CUSTOMIZATION_PRICES.accessories;
  }
  const deliveryFee = order.delivery ? DELIVERY_PRICES[order.delivery.deliveryMethod] : 0;
  const subtotal = basePrice + customizationFee + deliveryFee;
  const discount = order.promoCode === 'JHAZ10' ? subtotal * 0.1 : 0;
  return { basePrice, customizationFee, deliveryFee, discount, total: subtotal - discount };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ═══════════════════════════════════════════════════════
// Main Order Page
// ═══════════════════════════════════════════════════════

export default function Order() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive step from URL — default to 1
  const currentStep = useMemo(() => {
    const s = parseInt(searchParams.get('step') || '1', 10);
    return isNaN(s) || s < 1 || s > 9 ? 1 : s;
  }, [searchParams]);

  const goToStep = useCallback((step: number) => {
    setSearchParams({ step: String(step) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const handleNext = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const handleBack = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  const [paymentReference, setPaymentReference] = useState('');
  const [orderData, setOrderData] = useState<OrderData>({
    style: null,
    fabric: null,
    measurements: null,
    personalization: null,
    delivery: null,
    promoCode: '',
  });

  // Multi-item cart
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);

  // Keep localStorage in sync whenever cartItems changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const updateOrderData = useCallback(<K extends keyof OrderData>(key: K, value: OrderData[K]) => {
    setOrderData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // "Add to Cart" — called from Step 4
  const handleAddToCart = useCallback(() => {
    // @claude-1
    const personalization: Personalization = orderData.personalization ?? {
      embroideryStyle: 'none',
      necklineType: 'round',
      sleeveLength: 'full',
      addLining: false,
      accessories: [],
      specialRequests: '',
    };
    const item: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      order: { ...orderData, personalization },
    };
    setCartItems((prev) => [...prev, item]);
    // Reset wizard for potential next item
    setOrderData({ style: null, fabric: null, measurements: null, personalization: null, delivery: null, promoCode: '' });
    goToStep(5);
  }, [orderData, goToStep]);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handlePaymentComplete = useCallback((ref: string) => {
    setPaymentReference(ref);
    // Clear cart on successful payment
    setCartItems([]);
    goToStep(9);
  }, [goToStep]);

  return (
    <div className="min-h-screen bg-earth-50 pt-16 sm:pt-20">
      {/* Page header */}
      <div className="bg-gradient-to-br from-night-950 via-night-900 to-night-950 text-earth-50 py-10 sm:py-14">
        <div className="section-container text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Create Your Custom Outfit</h1>
          <p className="mt-2 text-earth-300 text-sm sm:text-base max-w-xl mx-auto">
            Handcrafted African fashion, tailored just for you — from fabric to finish.
          </p>
        </div>
      </div>

      {/* Progress bar — sticky below navbar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-sm">
        <div className="section-container">
          <ProgressBar currentStep={currentStep} />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-earth-200/60 p-6 sm:p-8">
          {currentStep === 1 && (
            <StepStyleSelection
              selected={orderData.style}
              onSelect={(s) => updateOrderData('style', s)}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepFabricSelection
              fabric={orderData.fabric}
              onSelect={(f) => updateOrderData('fabric', f)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepMeasurements
              measurements={orderData.measurements}
              onUpdate={(m) => updateOrderData('measurements', m)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepPersonalization
              personalization={orderData.personalization}
              onUpdate={(p) => updateOrderData('personalization', p)}
              onAddToCart={handleAddToCart}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <StepCart
              cartItems={cartItems}
              onRemove={handleRemoveFromCart}
              onAddAnother={() => navigate('/catalog')}
              onCheckout={() => goToStep(6)}
            />
          )}
          {currentStep === 6 && (
            <StepDelivery
              delivery={orderData.delivery}
              onUpdate={(d) => updateOrderData('delivery', d)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 7 && (
            <StepOrderSummary
              order={orderData}
              cartItems={cartItems}
              onEditStep={goToStep}
              onApplyPromo={(code) => updateOrderData('promoCode', code)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 8 && (
            <StepPayment
              order={orderData}
              cartItems={cartItems}
              onComplete={handlePaymentComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 9 && (
            <StepConfirmation
              order={orderData}
              cartItems={cartItems}
              paymentReference={paymentReference}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Progress Bar
// ═══════════════════════════════════════════════════════

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full py-4 px-1">
      <div className="relative">
        {/* Track bg */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-earth-200 rounded-full" />
        {/* Track fill */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-terra-600 to-kente-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {/* Dots */}
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    done
                      ? 'border-terra-600 bg-terra-600 text-white'
                      : active
                        ? 'border-kente-500 bg-kente-500 text-white'
                        : 'border-earth-300 bg-earth-50 text-earth-400'
                  }`}
                >
                  {done ? <Check size={14} /> : step.id}
                </div>
                <span
                  className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center max-w-[52px] sm:max-w-none leading-tight ${
                    done || active ? 'text-night-950' : 'text-earth-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step nav buttons (reused by every step)
// ═══════════════════════════════════════════════════════

function StepNav({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  showBack = true,
  nextClassName = '',
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  nextClassName?: string;
}) {
  return (
    <div className="flex justify-between pt-6 border-t border-earth-100 mt-6">
      {showBack && onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-earth-300 text-sm font-medium text-night-900 hover:border-terra-400 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      ) : <span />}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
          nextDisabled
            ? 'bg-earth-200 text-earth-400 cursor-not-allowed'
            : nextClassName || 'btn-primary'
        }`}
      >
        {nextLabel}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 1 – Style Selection
// ═══════════════════════════════════════════════════════

function StepStyleSelection({
  selected,
  onSelect,
  onNext,
}: {
  selected: OutfitStyle | null;
  onSelect: (s: OutfitStyle) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Choose Your Style</h2>
        <p className="mt-1 text-earth-500 text-sm">Select the traditional outfit style you'd like us to create.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {OUTFIT_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id as OutfitStyle)}
            className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              selected === style.id
                ? 'border-kente-500 ring-2 ring-kente-500/30'
                : 'border-earth-200 hover:border-terra-400'
            }`}
          >
            <div className="aspect-[3/4] relative">
              <img src={style.image} alt={style.name} className="img-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-night-950/20 to-transparent" />
              {selected === style.id && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-kente-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 inset-x-0 p-3 text-left">
              <h3 className="font-display text-sm font-semibold text-white">{style.name}</h3>
              <p className="text-[10px] text-white/70 mt-0.5 leading-tight">{style.description}</p>
              <p className="text-xs font-bold text-kente-400 mt-1">From {formatNaira(style.basePrice)}</p>
            </div>
          </button>
        ))}
      </div>

      <StepNav onNext={onNext} nextDisabled={!selected} nextLabel="Continue to Fabric" showBack={false} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 2 – Fabric Selection
// ═══════════════════════════════════════════════════════

function StepFabricSelection({
  fabric,
  onSelect,
  onNext,
  onBack,
}: {
  fabric: FabricSelection | null;
  onSelect: (f: FabricSelection) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [notes, setNotes] = useState(fabric?.notes || '');
  const [customImage, setCustomImage] = useState<string | null>(
    fabric?.type === 'custom' ? fabric.customImageUrl || null : null,
  );

  const handlePreset = (id: string) => onSelect({ type: 'preset', presetId: id, notes });
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      onSelect({ type: 'custom', customImageUrl: url, notes });
    }
  };
  const handleNotes = (val: string) => {
    setNotes(val);
    if (fabric) onSelect({ ...fabric, notes: val });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Select Your Fabric</h2>
        <p className="mt-1 text-earth-500 text-sm">Choose from our premium swatches or upload your own.</p>
      </div>

      {/* Preset swatches */}
      <div>
        <h3 className="font-display text-base font-semibold text-night-950 mb-3">Premium Fabric Swatches</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FABRIC_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                fabric?.type === 'preset' && fabric.presetId === p.id
                  ? 'border-kente-500 ring-2 ring-kente-500/30'
                  : 'border-earth-200 hover:border-terra-400'
              }`}
            >
              <div
                className="h-14 w-full rounded-lg mb-2 border border-earth-200"
                style={{ backgroundColor: p.color }}
              />
              <p className="text-xs font-semibold text-night-950 truncate">{p.name}</p>
              <p className="text-[10px] text-earth-500">{p.price === 0 ? 'Included' : `+${formatNaira(p.price)}`}</p>
              {fabric?.type === 'preset' && fabric.presetId === p.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-kente-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div>
        <h3 className="font-display text-base font-semibold text-night-950 mb-3">Or Upload Your Own</h3>
        <label
          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            customImage
              ? 'border-kente-500 bg-kente-50'
              : 'border-earth-300 hover:border-terra-400 bg-earth-50'
          }`}
        >
          {customImage ? (
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-lg bg-cover bg-center border border-earth-200" style={{ backgroundImage: `url(${customImage})` }} />
              <div className="text-left">
                <p className="text-sm font-semibold text-night-950">Custom fabric uploaded</p>
                <p className="text-[10px] text-earth-500">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={24} className="text-earth-400 mb-1" />
              <p className="text-sm text-earth-600">Click to upload fabric photo</p>
              <p className="text-[10px] text-earth-400">PNG, JPG up to 5 MB</p>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-1.5">Notes for the Tailor (Optional)</label>
        <textarea
          rows={3}
          placeholder="Any specific fabric preferences, patterns, or instructions..."
          value={notes}
          onChange={(e) => handleNotes(e.target.value)}
          className="w-full px-4 py-3 border border-earth-200 rounded-xl text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all resize-none"
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!fabric} nextLabel="Continue to Measurements" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 3 – Measurements
// ═══════════════════════════════════════════════════════

function StepMeasurements({
  measurements,
  onUpdate,
  onNext,
  onBack,
}: {
  measurements: Measurements | null;
  onUpdate: (m: Measurements) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<Measurements>(
    measurements || { chest: 0, waist: 0, hips: 0, height: 0, shoulderWidth: 0, saveForFuture: false },
  );
  const [showGuide, setShowGuide] = useState<string | null>(null);

  const handleChange = (field: keyof Measurements, value: number | boolean) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onUpdate(updated);
  };

  const isValid = form.chest > 0 && form.waist > 0 && form.hips > 0 && form.height > 0 && form.shoulderWidth > 0;

  const fields: { key: string; label: string }[] = [
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' },
    { key: 'height', label: 'Height' },
    { key: 'shoulderWidth', label: 'Shoulder Width' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Your Measurements</h2>
        <p className="mt-1 text-earth-500 text-sm">Enter body measurements in centimetres for a perfect fit.</p>
      </div>

      {/* Size guide banner */}
      <div className="bg-kente-50 border border-kente-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-kente-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-night-950">Need help measuring?</p>
          <p className="text-xs text-earth-600 mt-0.5">
            Click the <Info size={12} className="inline" /> icon next to each field for guidance. For best results, have someone help.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-night-950">{label} (cm)</label>
              <button
                type="button"
                onClick={() => setShowGuide(showGuide === key ? null : key)}
                className="text-earth-400 hover:text-terra-600 transition-colors"
              >
                <Info size={14} />
              </button>
            </div>
            {showGuide === key && (
              <p className="text-[11px] text-terra-700 bg-terra-50 rounded-lg px-3 py-2 mb-2 border border-terra-100">
                {MEASUREMENT_GUIDES[key]}
              </p>
            )}
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder={`Enter ${label.toLowerCase()}`}
              value={form[key as keyof Measurements] || ''}
              onChange={(e) => handleChange(key as keyof Measurements, parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-earth-200 rounded-xl text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            />
          </div>
        ))}
      </div>

      {/* Visual guide mini */}
      <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
        <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
          {['C', 'W', 'H', 'Ht', 'S'].map((letter, i) => (
            <div key={letter} className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-terra-100 flex items-center justify-center mb-1">
                <span className="text-terra-700 font-bold text-xs">{letter}</span>
              </div>
              <span className="text-earth-500">{fields[i].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save for future */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <span
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            form.saveForFuture ? 'bg-terra-600 border-terra-600' : 'border-earth-400 group-hover:border-terra-400'
          }`}
          onClick={() => handleChange('saveForFuture', !form.saveForFuture)}
        >
          {form.saveForFuture && (
            <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-sm text-earth-700 group-hover:text-night-950 transition-colors" onClick={() => handleChange('saveForFuture', !form.saveForFuture)}>
          Save my measurements for future orders
        </span>
      </label>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} nextLabel="Continue to Personalization" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 4 – Personalization
// ═══════════════════════════════════════════════════════

function StepPersonalization({
  personalization,
  onUpdate,
  onAddToCart,
  onBack,
}: {
  personalization: Personalization | null;
  onUpdate: (p: Personalization) => void;
  onAddToCart: () => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<Personalization>(
    personalization || {
      embroideryStyle: 'none',
      necklineType: 'round',
      sleeveLength: 'full',
      addLining: false,
      accessories: [],
      specialRequests: '',
    },
  );

  const handleChange = <K extends keyof Personalization>(key: K, value: Personalization[K]) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onUpdate(updated);
  };

  const toggleAccessory = (id: string) => {
    const updated = form.accessories.includes(id)
      ? form.accessories.filter((a) => a !== id)
      : [...form.accessories, id];
    handleChange('accessories', updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Personalise Your Outfit</h2>
        <p className="mt-1 text-earth-500 text-sm">Customise every detail to make it uniquely yours.</p>
      </div>

      {/* Embroidery */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-2">Embroidery Style</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMBROIDERY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('embroideryStyle', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                form.embroideryStyle === opt.value
                  ? 'border-kente-500 bg-kente-50'
                  : 'border-earth-200 hover:border-terra-400'
              }`}
            >
              <p className="text-sm font-semibold text-night-950">{opt.label}</p>
              <p className="text-[10px] text-earth-500 mt-0.5">{opt.description}</p>
              <p className="text-[11px] font-bold text-kente-600 mt-1.5">
                {CUSTOMIZATION_PRICES.embroidery[opt.value] === 0 ? 'Included' : `+${formatNaira(CUSTOMIZATION_PRICES.embroidery[opt.value])}`}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Neckline */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-2">Neckline Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NECKLINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('necklineType', opt.value)}
              className={`py-3 px-3 rounded-xl border-2 text-center transition-all ${
                form.necklineType === opt.value
                  ? 'border-kente-500 bg-kente-50'
                  : 'border-earth-200 hover:border-terra-400'
              }`}
            >
              <p className="text-sm font-semibold text-night-950">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sleeve */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-2">Sleeve Length</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SLEEVE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChange('sleeveLength', opt.value)}
              className={`py-3 px-3 rounded-xl border-2 text-center transition-all ${
                form.sleeveLength === opt.value
                  ? 'border-kente-500 bg-kente-50'
                  : 'border-earth-200 hover:border-terra-400'
              }`}
            >
              <p className="text-sm font-semibold text-night-950">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lining */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-earth-200 bg-earth-50">
        <label className="flex items-center gap-3 cursor-pointer group" onClick={() => handleChange('addLining', !form.addLining)}>
          <span
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              form.addLining ? 'bg-terra-600 border-terra-600' : 'border-earth-400 group-hover:border-terra-400'
            }`}
          >
            {form.addLining && (
              <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-night-950">Add Premium Lining</p>
            <p className="text-[10px] text-earth-500">Soft inner lining for extra comfort</p>
          </div>
        </label>
        <span className="text-sm font-bold text-kente-600">+{formatNaira(CUSTOMIZATION_PRICES.lining)}</span>
      </div>

      {/* Accessories */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-2">
          Add Matching Accessories
          <span className="font-normal text-earth-500 ml-2">(+{formatNaira(CUSTOMIZATION_PRICES.accessories)} each)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ACCESSORY_OPTIONS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => toggleAccessory(acc.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                form.accessories.includes(acc.id)
                  ? 'border-kente-500 bg-kente-50'
                  : 'border-earth-200 hover:border-terra-400'
              }`}
            >
              <span
                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  form.accessories.includes(acc.id)
                    ? 'bg-kente-500 border-kente-500'
                    : 'border-earth-400'
                }`}
              >
                {form.accessories.includes(acc.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-night-950">{acc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-1.5">Special Requests (Optional)</label>
        <textarea
          rows={3}
          placeholder="Any other customisation requests or notes for our tailors..."
          value={form.specialRequests}
          onChange={(e) => handleChange('specialRequests', e.target.value)}
          className="w-full px-4 py-3 border border-earth-200 rounded-xl text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all resize-none"
        />
      </div>

      <div className="flex justify-between pt-6 border-t border-earth-100 mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-earth-300 text-sm font-medium text-night-900 hover:border-terra-400 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onAddToCart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold btn-primary"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 5 – Delivery
// ═══════════════════════════════════════════════════════

function StepDelivery({
  delivery,
  onUpdate,
  onNext,
  onBack,
}: {
  delivery: DeliveryDetails | null;
  onUpdate: (d: DeliveryDetails) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<DeliveryDetails>(
    delivery || { fullName: '', phoneNumber: '', address: '', city: '', state: '', country: 'Nigeria', preferredDate: '', deliveryMethod: 'standard' },
  );

  // unused import suppressor – ShoppingBag used in Step 4 patch above
  // void ShoppingBag; //@claude-2

  const handleChange = <K extends keyof DeliveryDetails>(field: K, value: DeliveryDetails[K]) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onUpdate(updated);
  };

  const isValid = form.fullName.trim() !== '' && form.phoneNumber.trim() !== '' && form.address.trim() !== '' && form.city.trim() !== '' && form.state !== '';

  const inputCls = 'w-full px-4 py-2.5 border border-earth-200 rounded-xl text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Delivery Details</h2>
        <p className="mt-1 text-earth-500 text-sm">Where should we deliver your custom outfit?</p>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-semibold text-night-950">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-night-950 mb-1.5">Full Name</label>
            <input className={inputCls} placeholder="Enter your full name" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night-950 mb-1.5">Phone Number</label>
            <input className={inputCls} type="tel" placeholder="+234 XXX XXX XXXX" value={form.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-semibold text-night-950">Delivery Address</h3>
        <div>
          <label className="block text-sm font-semibold text-night-950 mb-1.5">Country</label>
          <select
            value={form.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className={inputCls}
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-night-950 mb-1.5">Street Address</label>
          <input className={inputCls} placeholder="Enter your street address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-night-950 mb-1.5">City</label>
            <input className={inputCls} placeholder="Enter city" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-night-950 mb-1.5">State</label>
            <select
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={inputCls}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preferred date */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-1.5">Preferred Delivery Date (Optional)</label>
        <input
          type="date"
          className={inputCls}
          value={form.preferredDate}
          onChange={(e) => handleChange('preferredDate', e.target.value)}
        />
      </div>

      {/* Delivery method */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-2">Delivery Method</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleChange('deliveryMethod', 'standard')}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              form.deliveryMethod === 'standard'
                ? 'border-kente-500 bg-kente-50'
                : 'border-earth-200 hover:border-terra-400'
            }`}
          >
            <Truck size={20} className="text-terra-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-night-950">Standard Delivery</p>
              <p className="text-[11px] text-earth-500">14–21 business days</p>
              <p className="text-xs font-bold text-kente-600 mt-1.5">{formatNaira(DELIVERY_PRICES.standard)}</p>
            </div>
          </button>
          <button
            onClick={() => handleChange('deliveryMethod', 'express')}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              form.deliveryMethod === 'express'
                ? 'border-kente-500 bg-kente-50'
                : 'border-earth-200 hover:border-terra-400'
            }`}
          >
            <Zap size={20} className="text-kente-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-night-950">Express Delivery</p>
              <p className="text-[11px] text-earth-500">7–10 business days</p>
              <p className="text-xs font-bold text-kente-600 mt-1.5">{formatNaira(DELIVERY_PRICES.express)}</p>
            </div>
          </button>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!isValid} nextLabel="Continue to Summary" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 5 – Cart
// ═══════════════════════════════════════════════════════

function StepCart({
  cartItems,
  onRemove,
  onAddAnother,
  onCheckout,
}: {
  cartItems: CartItem[];
  onRemove: (id: string) => void;
  onAddAnother: () => void;
  onCheckout: () => void;
}) {
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => {
      const { basePrice, customizationFee } = calculateOrderTotal(item.order);
      return sum + basePrice + customizationFee;
    }, 0),
    [cartItems]
  );

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-earth-100 flex items-center justify-center">
            <ShoppingBag size={36} className="text-earth-400" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-night-950">Your Cart is Empty</h2>
          <p className="mt-2 text-earth-500 text-sm">Browse our catalog and customise your perfect outfit.</p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm btn-primary"
        >
          Start Shopping
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Your Cart</h2>
        <p className="mt-1 text-earth-500 text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} ready for checkout.</p>
      </div>

      <div className="space-y-4">
        {cartItems.map((item) => {
          const style = OUTFIT_STYLES.find((s) => s.id === item.order.style);
          const fabric = FABRIC_PRESETS.find((f) => f.id === item.order.fabric?.presetId);
          const { basePrice, customizationFee } = calculateOrderTotal(item.order);
          const itemTotal = basePrice + customizationFee;
          return (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl border border-earth-200 bg-earth-50">
              {style && (
                <img src={style.image} alt={style.name}
                  className="w-16 h-20 object-cover rounded-lg shrink-0 border border-earth-200" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-night-950">{style?.name ?? 'Custom Outfit'}</p>
                <div className="mt-1 space-y-0.5 text-[11px] text-earth-500">
                  {fabric && <p>Fabric: {fabric.name}</p>}
                  {item.order.personalization && (
                    <>
                      <p>Embroidery: {item.order.personalization.embroideryStyle}</p>
                      <p>Neckline: {item.order.personalization.necklineType} · Sleeves: {item.order.personalization.sleeveLength}</p>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm font-bold text-kente-600">{formatNaira(itemTotal)}</p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-lg text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart total */}
      <div className="flex justify-between items-center p-4 rounded-xl bg-night-950 text-white">
        <span className="font-semibold text-earth-300">Items Total</span>
        <span className="font-display text-xl font-bold text-kente-400">{formatNaira(cartTotal)}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-earth-100">
        <button
          onClick={onAddAnother}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-earth-300 text-sm font-semibold text-night-950 hover:border-terra-400 transition-colors"
        >
          <Package size={16} />
          Add Another Outfit
        </button>
        <button
          onClick={onCheckout}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-kente-600 hover:bg-kente-700 text-white transition-all"
        >
          Checkout
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 6 – Order Summary
// ═══════════════════════════════════════════════════════

function StepOrderSummary({
  order,
  cartItems,
  onEditStep,
  onApplyPromo,
  onNext,
  onBack,
}: {
  order: OrderData;
  cartItems: CartItem[];
  onEditStep: (step: number) => void;
  onApplyPromo: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [promoCode, setPromoCode] = useState(order.promoCode);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(order.promoCode === 'JHAZ10');

  const itemsSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => {
      const { basePrice, customizationFee } = calculateOrderTotal(item.order);
      return sum + basePrice + customizationFee;
    }, 0),
    [cartItems]
  );
  const deliveryFee = order.delivery ? DELIVERY_PRICES[order.delivery.deliveryMethod] : 0;
  const discount = order.promoCode === 'JHAZ10' ? (itemsSubtotal + deliveryFee) * 0.1 : 0;
  const grandTotal = itemsSubtotal + deliveryFee - discount;
  const pricing = useMemo(() => calculateOrderTotal(order), [order]);
  const style = OUTFIT_STYLES.find((s) => s.id === order.style);
  const fabric = FABRIC_PRESETS.find((f) => f.id === order.fabric?.presetId);

  const estimatedDelivery = order.delivery?.deliveryMethod === 'express'
    ? addDays(new Date(), 10)
    : addDays(new Date(), 21);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'JHAZ10') {
      onApplyPromo(promoCode.toUpperCase());
      setPromoSuccess(true);
      setPromoError('');
    } else if (promoCode.trim() === '') {
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoSuccess(false);
    }
  };

  // Summary section card
  const SummaryCard = ({ title, stepNum, children }: { title: string; stepNum: number; children: React.ReactNode }) => (
    <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">{children}</div>
        <button onClick={() => onEditStep(stepNum)} className="text-xs text-terra-600 hover:text-terra-800 font-semibold flex items-center gap-1 shrink-0 ml-3">
          <Pencil size={12} />
          Edit
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Order Summary</h2>
        <p className="mt-1 text-earth-500 text-sm">Review your order before proceeding to payment.</p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <SummaryCard title="Outfit Style" stepNum={1}>
          <h3 className="text-sm font-semibold text-night-950">Outfit Style</h3>
          <p className="text-sm text-earth-600">{style?.name}</p>
          <p className="text-xs font-semibold text-kente-600">{formatNaira(style?.basePrice || 0)}</p>
        </SummaryCard>

        <SummaryCard title="Fabric" stepNum={2}>
          <h3 className="text-sm font-semibold text-night-950">Fabric</h3>
          {order.fabric?.type === 'preset' ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-5 w-5 rounded border border-earth-200" style={{ backgroundColor: fabric?.color }} />
              <span className="text-sm text-earth-600">{fabric?.name}</span>
            </div>
          ) : (
            <p className="text-sm text-earth-600">Custom fabric uploaded</p>
          )}
          {order.fabric?.notes && <p className="text-[10px] text-earth-500 mt-1 italic">Note: {order.fabric.notes}</p>}
        </SummaryCard>

        <SummaryCard title="Measurements" stepNum={3}>
          <h3 className="text-sm font-semibold text-night-950">Measurements</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-1 text-xs text-earth-600">
            <span>Chest: {order.measurements?.chest}cm</span>
            <span>Waist: {order.measurements?.waist}cm</span>
            <span>Hips: {order.measurements?.hips}cm</span>
            <span>Height: {order.measurements?.height}cm</span>
            <span>Shoulder: {order.measurements?.shoulderWidth}cm</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Personalization" stepNum={4}>
          <h3 className="text-sm font-semibold text-night-950">Personalisation</h3>
          <div className="mt-1 space-y-0.5 text-xs text-earth-600">
            <p>Embroidery: {order.personalization?.embroideryStyle}</p>
            <p>Neckline: {order.personalization?.necklineType}</p>
            <p>Sleeves: {order.personalization?.sleeveLength}</p>
            {order.personalization?.addLining && <p>Premium Lining: Yes</p>}
            {(order.personalization?.accessories?.length ?? 0) > 0 && (
              <p>Accessories: {order.personalization?.accessories.join(', ')}</p>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="Delivery" stepNum={6}>
          <h3 className="text-sm font-semibold text-night-950">Delivery</h3>
          <div className="mt-1 space-y-0.5 text-xs text-earth-600">
            <p>{order.delivery?.fullName} · {order.delivery?.phoneNumber}</p>
            <p>{order.delivery?.address}</p>
            <p>{order.delivery?.city}, {order.delivery?.state}, Nigeria</p>
            <p className="font-semibold text-night-950 mt-1">
              {order.delivery?.deliveryMethod === 'express' ? 'Express' : 'Standard'} Delivery
            </p>
          </div>
        </SummaryCard>
      </div>

      {/* Promo code */}
      <div className="border border-earth-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={14} className="text-kente-600" />
          <span className="text-sm font-semibold text-night-950">Promo Code</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-earth-200 rounded-xl text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
          />
          <button onClick={handleApplyPromo} className="px-5 py-2.5 rounded-xl border border-earth-300 text-sm font-semibold text-night-950 hover:border-terra-400 transition-colors">
            Apply
          </button>
        </div>
        {promoError && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><X size={12} />{promoError}</p>
        )}
        {promoSuccess && (
          <p className="text-xs text-savanna-700 mt-2 flex items-center gap-1"><Check size={12} />10% discount applied!</p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border border-earth-200 rounded-xl p-4 bg-white">
        <h3 className="text-sm font-semibold text-night-950 mb-3">Price Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-earth-600"><span>Items Subtotal ({cartItems.length})</span><span>{formatNaira(itemsSubtotal)}</span></div>
          <div className="flex justify-between text-earth-600"><span>Delivery Fee</span><span>{formatNaira(deliveryFee)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-savanna-700"><span>Discount (JHAZ10)</span><span>-{formatNaira(discount)}</span></div>
          )}
          <div className="border-t border-earth-200 pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-night-950">Total</span>
              <span className="text-terra-700">{formatNaira(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated delivery */}
      <p className="text-center text-sm text-earth-500">
        <span className="font-semibold text-night-950">Estimated Delivery:</span>{' '}
        {formatDate(estimatedDelivery)}
      </p>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Proceed to Payment" nextClassName="bg-kente-600 hover:bg-kente-700 text-white" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 7 – Payment (Paystack Dummy)
// ═══════════════════════════════════════════════════════

function StepPayment({
  order,
  cartItems,
  onComplete,
  onBack,
}: {
  order: OrderData;
  cartItems: CartItem[];
  onComplete: (ref: string) => void;
  onBack: () => void;
}) {
  type PayMethod = 'card' | 'bank' | 'ussd' | 'mobile';
  const METHODS = [
    { id: 'card' as PayMethod, label: 'Card Payment', desc: 'Debit/Credit Card', Icon: CreditCard },
    { id: 'bank' as PayMethod, label: 'Bank Transfer', desc: 'Direct bank transfer', Icon: Building2 },
    { id: 'ussd' as PayMethod, label: 'USSD', desc: 'Pay with USSD code', Icon: Phone },
    { id: 'mobile' as PayMethod, label: 'Mobile Money', desc: 'Mobile wallet', Icon: Smartphone },
  ];

  const [selectedMethod, setSelectedMethod] = useState<PayMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const pricing = useMemo(() => {
    const itemsSubtotal = cartItems.reduce((sum, item) => {
      const { basePrice, customizationFee } = calculateOrderTotal(item.order);
      return sum + basePrice + customizationFee;
    }, 0);
    const deliveryFee = order.delivery ? DELIVERY_PRICES[order.delivery.deliveryMethod] : 0;
    const total = itemsSubtotal + deliveryFee;
    return { total };
  }, [order, cartItems]);

  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    const ref = `PSK_${Date.now()}_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    setIsProcessing(false);
    onComplete(ref);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Secure Payment</h2>
        <p className="mt-1 text-earth-500 text-sm">Complete your order with Paystack secure checkout.</p>
      </div>

      {/* Paystack branding */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 text-white font-bold px-2 py-0.5 rounded text-xs tracking-wide">paystack</div>
            <span className="text-xs text-earth-500">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1 text-savanna-700">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-semibold">256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-night-950 rounded-xl p-6 text-center">
        <p className="text-earth-400 text-sm">Amount to Pay</p>
        <p className="font-display text-3xl font-bold text-kente-400 mt-1">{formatNaira(pricing.total)}</p>
      </div>

      {/* Payment methods */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-2">Select Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          {METHODS.map(({ id, label, desc, Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedMethod(id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                selectedMethod === id
                  ? 'border-kente-500 bg-kente-50'
                  : 'border-earth-200 hover:border-terra-400'
              }`}
            >
              <Icon size={20} className={selectedMethod === id ? 'text-kente-600' : 'text-earth-400'} />
              <div>
                <p className="text-sm font-semibold text-night-950">{label}</p>
                <p className="text-[10px] text-earth-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card form mock */}
      {selectedMethod === 'card' && (
        <div className="border border-earth-200 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-night-950 mb-1">Card Number</label>
            <div className="flex items-center border border-earth-200 rounded-xl px-4 py-2.5">
              <CreditCard size={16} className="text-earth-400 mr-2 shrink-0" />
              <input type="text" placeholder="0000 0000 0000 0000" disabled={isProcessing} className="flex-1 bg-transparent outline-none text-sm font-body text-night-950 placeholder-earth-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-night-950 mb-1">Expiry Date</label>
              <input type="text" placeholder="MM/YY" disabled={isProcessing} className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm font-body text-night-950 placeholder-earth-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-night-950 mb-1">CVV</label>
              <input type="text" placeholder="123" disabled={isProcessing} className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm font-body text-night-950 placeholder-earth-400" />
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'bank' && (
        <div className="border border-earth-200 rounded-xl p-4 bg-earth-50">
          <p className="text-sm text-earth-600">You will receive bank transfer details after clicking "Place Order & Pay". Complete the transfer within 30 minutes.</p>
        </div>
      )}

      {selectedMethod === 'ussd' && (
        <div className="border border-earth-200 rounded-xl p-4 bg-earth-50">
          <p className="text-sm text-earth-600">Select your bank and dial the USSD code on your phone to complete payment.</p>
        </div>
      )}

      {selectedMethod === 'mobile' && (
        <div className="border border-earth-200 rounded-xl p-4 bg-earth-50">
          <p className="text-sm text-earth-600">Pay using your mobile money wallet. Supported: OPay, Palmpay, Kuda, GTB Mobile.</p>
        </div>
      )}

      {/* Security badges */}
      <div className="flex items-center justify-center gap-5 py-3 border-y border-earth-200">
        <div className="flex items-center gap-1.5 text-earth-500">
          <Lock size={14} />
          <span className="text-[10px] font-semibold">Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-earth-500">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-semibold">Secured by Paystack</span>
        </div>
        <div className="bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] tracking-wide">paystack</div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-earth-300 text-sm font-medium text-night-900 hover:border-terra-400 transition-colors disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-kente-600 hover:bg-kente-700 text-white transition-all disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing…
            </>
          ) : (
            <>Place Order & Pay {formatNaira(pricing.total)}</>
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 8 – Order Confirmation
// ═══════════════════════════════════════════════════════

function StepConfirmation({
  order,
  cartItems,
  paymentReference,
}: {
  order: OrderData;
  cartItems: CartItem[];
  paymentReference: string;
}) {
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const totalPaid = useMemo(() => {
    const itemsSubtotal = cartItems.reduce((sum, item) => {
      const { basePrice, customizationFee } = calculateOrderTotal(item.order);
      return sum + basePrice + customizationFee;
    }, 0);
    const deliveryFee = order.delivery ? DELIVERY_PRICES[order.delivery.deliveryMethod] : 0;
    return itemsSubtotal + deliveryFee;
  }, [order, cartItems]);
  const style = OUTFIT_STYLES.find((s) => s.id === cartItems[0]?.order?.style || order.style);
  const orderId = `JHZ-${Date.now().toString(36).toUpperCase()}`;

  const estimatedDelivery = order.delivery?.deliveryMethod === 'express'
    ? addDays(new Date(), 10)
    : addDays(new Date(), 21);

  const copy = (text: string, type: 'order' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'order') { setCopiedOrder(true); setTimeout(() => setCopiedOrder(false), 2000); }
    else { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); }
  };

  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-savanna-400 rounded-full animate-ping opacity-25" />
          <div className="relative bg-savanna-600 rounded-full p-4">
            <CheckCircle2 size={48} className="text-white" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-night-950">Order Placed Successfully!</h2>
        <p className="mt-2 text-earth-500 text-sm">
          Thank you for choosing Jhaz-Imprints. Your custom {style?.name} is now being prepared.
        </p>
      </div>

      {/* Order details card */}
      <div className="bg-earth-50 rounded-xl p-5 border border-earth-200 text-left space-y-4">
        {/* Order ID */}
        <div className="flex justify-between items-center pb-3 border-b border-earth-200">
          <div>
            <p className="text-[10px] text-earth-500 uppercase tracking-wider">Order ID</p>
            <p className="font-mono font-bold text-night-950">{orderId}</p>
          </div>
          <button onClick={() => copy(orderId, 'order')} className="text-earth-400 hover:text-terra-600 transition-colors">
            {copiedOrder ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Payment ref */}
        <div className="flex justify-between items-center pb-3 border-b border-earth-200">
          <div>
            <p className="text-[10px] text-earth-500 uppercase tracking-wider">Paystack Reference</p>
            <p className="font-mono text-xs text-night-800">{paymentReference}</p>
          </div>
          <button onClick={() => copy(paymentReference, 'ref')} className="text-earth-400 hover:text-terra-600 transition-colors">
            {copiedRef ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-earth-500">Items</span><span className="font-semibold text-night-950">{cartItems.length} outfit{cartItems.length !== 1 ? 's' : ''}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Delivery Method</span><span className="font-semibold text-night-950 capitalize">{order.delivery?.deliveryMethod}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Delivery Address</span><span className="font-semibold text-night-950 text-right max-w-[200px]">{order.delivery?.city}, {order.delivery?.state}, Nigeria</span></div>
          <div className="flex justify-between pt-2 border-t border-earth-200">
            <span className="font-bold text-night-950">Total Paid</span>
            <span className="font-bold text-terra-700">{formatNaira(totalPaid)}</span>
          </div>
        </div>
      </div>

      {/* Estimated delivery banner */}
      <div className="bg-night-950 rounded-xl p-4 flex items-center justify-center gap-3">
        <Calendar size={22} className="text-kente-400" />
        <div className="text-left">
          <p className="text-earth-400 text-xs">Estimated Delivery</p>
          <p className="text-white font-display font-bold">{formatDate(estimatedDelivery)}</p>
        </div>
      </div>

      {/* Email notice */}
      <div className="flex items-center justify-center gap-2 text-earth-500">
        <Mail size={16} />
        <p className="text-xs">A confirmation email has been sent to your email address.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link
          to="/catalog"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm btn-primary"
        >
          <Package size={16} />
          Track Your Order
        </Link>
        <Link
          to="/catalog"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-earth-300 text-night-950 hover:border-terra-400 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Support */}
      <div className="pt-4 border-t border-earth-200">
        <p className="text-xs text-earth-500">
          Questions? Contact us at{' '}
          <a href="mailto:info@jhaz-imprints.com" className="text-terra-600 hover:underline">info@jhaz-imprints.com</a>
          {' '}or call{' '}
          <a href="tel:+2348031234567" className="text-terra-600 hover:underline">+234 803 123 4567</a>
        </p>
      </div>
    </div>
  );
}
