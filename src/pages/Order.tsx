import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, ChevronLeft, ChevronRight, Upload, Info,
  Lock, ShieldCheck, Pencil, Tag, X,
  CheckCircle2, Package, Mail, Calendar, Copy,
  Truck, Zap, ShoppingBag, Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, fetchProductByIdOrSlug } from '../store/slices/catalogSlice';
import { fetchApi } from '../lib/apiClient';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

type OutfitStyle = string;
type DeliveryMethod = 'standard' | 'express';

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
  id?: string;
  chest: number;
  waist: number;
  hips: number;
  height: number;
  shoulderWidth: number;
  saveForFuture: boolean;
  fabricQty?: number;
  fabricUnit?: string;
}

interface Personalization {
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
  delivery: DeliveryDetails | null;
  promoCode: string;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const STEPS = [
  { id: 1, name: 'Style' },
  { id: 2, name: 'Measurements' },
  { id: 3, name: 'Fabric' },
  { id: 4, name: 'Personalize' },
  { id: 5, name: 'Cart' },
  { id: 6, name: 'Delivery' },
  { id: 7, name: 'Summary' },
  { id: 8, name: 'Order Details' },
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
  const basePrice = order.customStyleInfo?.basePrice || OUTFIT_STYLES.find((s) => s.id === order.style)?.basePrice || 0;
  const fabricQty = order.measurements?.fabricQty || 2.0;
  const yardsPerUnit = order.fabric?.presetYardsPerUnit || 1.0;
  const unitsNeeded = Math.ceil(fabricQty / yardsPerUnit);
  const fabricPrice = order.fabric?.type === 'preset'
    ? (order.fabric.presetPrice ?? 0)
    : 0;
  const customizationFee = fabricPrice * unitsNeeded;
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
  const dispatch = useAppDispatch();
  const productId = searchParams.get('product');
  const { products, activeProduct } = useAppSelector((state) => state.catalog);

  // Fetch products on mount if not loaded
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Fetch specific product by ID/slug when productId changes
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductByIdOrSlug(productId));
    }
  }, [dispatch, productId]);

  // Find the selected product (populated with fabrics)
  const currentProduct = activeProduct;

  // Derive fabrics from currentProduct.fabrics if present, fallback to static FABRIC_PRESETS
  const fabricOptions = useMemo(() => {
    if (!currentProduct || !currentProduct.fabrics || currentProduct.fabrics.length === 0) {
      return FABRIC_PRESETS.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        price: p.price,
        imageUrl: undefined as string | undefined,
        yardsPerUnit: 1.0,
        unit: 'yard',
      }));
    }

    const list: Array<{ id: string; name: string; color: string; price: number; imageUrl?: string; yardsPerUnit: number; unit: string }> = [];
    for (const f of currentProduct.fabrics) {
      if (f.properties) {
        for (const prop of f.properties) {
          if (!prop.isActive || !prop.inStock) continue;
          list.push({
            id: `${f.id}::${prop.colorName}`,
            name: `${f.name} — ${prop.colorName}`,
            color: prop.colorCode || '#eee',
            price: prop.priceModifier || 0,
            imageUrl: prop.imageUrl,
            yardsPerUnit: prop.yardsPerUnit || 1.0,
            unit: prop.unit || 'yard',
          });
        }
      }
    }
    return list;
  }, [currentProduct]);

  // Derive styles from currentProduct.styleOptions if present, fallback to static OUTFIT_STYLES
  const outfitStyles = useMemo(() => {
    if (!currentProduct || !currentProduct.styleOptions || currentProduct.styleOptions.length === 0) {
      return OUTFIT_STYLES;
    }
    return currentProduct.styleOptions.map((style) => ({
      id: style.name,
      name: style.name,
      description: style.description || 'Custom tailored style option',
      basePrice: currentProduct.price + style.priceModifier,
      image: style.imgUrl || currentProduct.image_url || 'https://images.pexels.com/photos/7679865/pexels-photo-7679865.jpeg?auto=compress&cs=tinysrgb&w=400',
    }));
  }, [currentProduct]);

  // Derive step from URL — default to 1
  const currentStep = useMemo(() => {
    const s = parseInt(searchParams.get('step') || '1', 10);
    return isNaN(s) || s < 1 || s > 8 ? 1 : s;
  }, [searchParams]);

  const goToStep = useCallback((step: number) => {
    setSearchParams({ step: String(step) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const handleNext = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const handleBack = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  const { user } = useAppSelector((state) => state.auth);
  const [paymentReference, setPaymentReference] = useState('');
  const [confirmedOrderInfo, setConfirmedOrderInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load Paystack script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const [orderData, setOrderData] = useState<OrderData>({
    style: null,
    fabric: null,
    measurements: null,
    personalization: null,
    delivery: null,
    promoCode: '',
  });

  // Initialize and update productId and productName in orderData when URL/product changes
  useEffect(() => {
    if (productId) {
      setOrderData((prev) => ({ ...prev, productId }));
    }
  }, [productId]);

  useEffect(() => {
    if (currentProduct) {
      setOrderData((prev) => {
        if (prev.productName === currentProduct.name && prev.productId === currentProduct.id) return prev;
        return {
          ...prev,
          productId: currentProduct.id,
          productName: currentProduct.name,
        };
      });
    }
  }, [currentProduct]);

  // Auto-select default style when currentProduct is loaded and orderData.style is null
  useEffect(() => {
    if (currentProduct && !orderData.style && outfitStyles.length > 0) {
      const defaultStyleName = currentProduct.defaultStyle || currentProduct.styleOptions?.[0]?.name;
      if (defaultStyleName) {
        const styleObj = outfitStyles.find((style) => style.id === defaultStyleName) || outfitStyles[0];
        setOrderData((prev) => ({
          ...prev,
          style: styleObj.id,
          customStyleInfo: styleObj,
        }));
      }
    }
  }, [currentProduct, orderData.style, outfitStyles]);

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
    const personalization: Personalization = orderData.personalization ?? {
      specialRequests: '',
    };
    const item: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      order: { ...orderData, personalization },
    };
    setCartItems((prev) => [...prev, item]);
    // Reset wizard for potential next item
    setOrderData({
      productId: orderData.productId,
      productName: orderData.productName,
      style: null,
      fabric: null,
      measurements: null,
      personalization: null,
      delivery: null,
      promoCode: '',
    });
    goToStep(5);
  }, [orderData, goToStep]);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleEditCartItem = useCallback((item: CartItem) => {
    setOrderData(item.order);
    setCartItems((prev) => prev.filter((c) => c.id !== item.id));
    goToStep(1);
  }, [goToStep]);

  // Load item for editing if edit param is present in URL
  const editItemId = searchParams.get('edit');
  useEffect(() => {
    if (editItemId && cartItems.length > 0) {
      const itemToEdit = cartItems.find((item) => item.id === editItemId);
      if (itemToEdit) {
        setOrderData(itemToEdit.order);
        setCartItems((prev) => prev.filter((item) => item.id !== editItemId));
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete('edit');
          return next;
        });
      }
    }
  }, [editItemId, cartItems, setSearchParams]);

  const handlePaymentComplete = useCallback((ref: string, orderDetails?: { orderId?: string; totalAmount?: number }) => {
    // Capture order details before clearing cart
    const itemsCount = cartItems.length;
    const itemsSubtotal = cartItems.reduce((sum, item) => {
      const { basePrice, customizationFee } = calculateOrderTotal(item.order);
      return sum + basePrice + customizationFee;
    }, 0);
    const deliveryFee = orderData.delivery ? DELIVERY_PRICES[orderData.delivery.deliveryMethod] : 0;
    const totalPaid = orderDetails?.totalAmount || (itemsSubtotal + deliveryFee);
    const orderId = orderDetails?.orderId || `JHZ-${Date.now().toString(36).toUpperCase()}`;
    const styleObj = OUTFIT_STYLES.find((s) => s.id === cartItems[0]?.order?.style || orderData.style);

    setConfirmedOrderInfo({
      orderId,
      paymentReference: ref,
      totalPaid,
      itemCount: itemsCount,
      deliveryMethod: orderData.delivery?.deliveryMethod || 'standard',
      deliveryAddress: orderData.delivery ? `${orderData.delivery.city}, ${orderData.delivery.state}` : 'N/A',
      styleName: styleObj ? styleObj.name : 'Outfit',
      estimatedDelivery: orderData.delivery?.deliveryMethod === 'express'
        ? addDays(new Date(), 10)
        : addDays(new Date(), 21),
    });

    setPaymentReference(ref);
    // Clear cart on successful payment
    setCartItems([]);
    goToStep(8);
  }, [goToStep, cartItems, orderData]);

  const payOrder = async (orderInfo: any) => {
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      throw new Error("Paystack library not loaded. Please wait a moment and try again.");
    }

    return new Promise<void>((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_b2798c2707fdae38dc44c692030b3139d97a049b",
        email: user?.email,
        amount: orderInfo.totalAmount * 100, // in kobo
        ref: orderInfo.reference,
        access_code: orderInfo.paystackAccessCode,
        onClose: () => {
          reject(new Error("Payment cancelled."));
        },
        callback: function (response: any) {
          (async () => {
            try {
              await fetchApi(`/orders/verify/${response.reference}`, {
                method: "POST",
              });
              resolve();
            } catch (err: any) {
              reject(new Error(`Verification failed: ${err.message || err}`));
            }
          })();
        }
      });
      handler.openIframe();
    });
  };

  const handlePay = async () => {
    if (!user) {
      setPaymentError("You must be logged in to proceed.");
      navigate(`/login?redirect=${encodeURIComponent('/order?step=7')}`);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      let activeOrder = createdOrders[0] || null;
      if (!activeOrder) {
        const payloadItems = cartItems.map((item) => {
          const presetId = item.order.fabric?.presetId;
          const fabricId = presetId && /^[a-f\d]{24}/i.test(presetId)
            ? presetId
            : undefined;

          return {
            productId: item.order.productId,
            measurement: {
              chest: item.order.measurements?.chest,
              waist: item.order.measurements?.waist,
              hip: item.order.measurements?.hips,
              shoulder: item.order.measurements?.shoulderWidth,
              length: item.order.measurements?.height,
              notes: item.order.personalization?.specialRequests || undefined,
            },
            fabricId,
            styleOptionName: item.order.customStyleInfo?.name || 'Standard',
            notes: item.order.personalization?.specialRequests || undefined,
          };
        });

        // Compute frontend expected total for backend verification
        const frontendItemsSubtotal = cartItems.reduce((sum, item) => {
          const { basePrice, customizationFee } = calculateOrderTotal(item.order);
          return sum + basePrice + customizationFee;
        }, 0);
        const frontendDeliveryFee = orderData.delivery ? DELIVERY_PRICES[orderData.delivery.deliveryMethod] : 0;
        const frontendDiscount = orderData.promoCode === 'JHAZ10' ? (frontendItemsSubtotal + frontendDeliveryFee) * 0.1 : 0;
        const expectedTotal = frontendItemsSubtotal + frontendDeliveryFee - frontendDiscount;

        const res = await fetchApi('/orders', {
          method: 'POST',
          body: JSON.stringify({
            items: payloadItems,
            promoCode: orderData.promoCode || undefined,
            expectedTotal,
            delivery: orderData.delivery ? {
              fullName: orderData.delivery.fullName,
              phoneNumber: orderData.delivery.phoneNumber,
              address: orderData.delivery.address,
              city: orderData.delivery.city,
              state: orderData.delivery.state,
              country: orderData.delivery.country,
              deliveryMethod: orderData.delivery.deliveryMethod,
            } : undefined,
          }),
        });
        setCreatedOrders([res]);
        activeOrder = res;
      }

      // Perform single payment
      await payOrder(activeOrder);

      // Payment completed successfully!
      setIsProcessing(false);
      handlePaymentComplete(activeOrder.reference, { orderId: activeOrder.orderId, totalAmount: activeOrder.totalAmount });
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "An unexpected error occurred during payment.");
      setIsProcessing(false);
    }
  };

  const handlePayLater = async () => {
    if (!user) {
      setPaymentError("You must be logged in to proceed.");
      navigate(`/login?redirect=${encodeURIComponent('/order?step=7')}`);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const payloadItems = cartItems.map((item) => {
        const presetId = item.order.fabric?.presetId;
        const fabricId = presetId && /^[a-f\d]{24}/i.test(presetId)
          ? presetId
          : undefined;

        return {
          productId: item.order.productId,
          measurement: {
            chest: item.order.measurements?.chest,
            waist: item.order.measurements?.waist,
            hip: item.order.measurements?.hips,
            shoulder: item.order.measurements?.shoulderWidth,
            length: item.order.measurements?.height,
            notes: item.order.personalization?.specialRequests || undefined,
          },
          fabricId,
          styleOptionName: item.order.customStyleInfo?.name || 'Standard',
          notes: item.order.personalization?.specialRequests || undefined,
        };
      });

      // Compute frontend expected total for backend verification
      const frontendItemsSubtotal = cartItems.reduce((sum, item) => {
        const { basePrice, customizationFee } = calculateOrderTotal(item.order);
        return sum + basePrice + customizationFee;
      }, 0);
      const frontendDeliveryFee = orderData.delivery ? DELIVERY_PRICES[orderData.delivery.deliveryMethod] : 0;
      const frontendDiscount = orderData.promoCode === 'JHAZ10' ? (frontendItemsSubtotal + frontendDeliveryFee) * 0.1 : 0;
      const expectedTotal = frontendItemsSubtotal + frontendDeliveryFee - frontendDiscount;

      const res = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: payloadItems,
          promoCode: orderData.promoCode || undefined,
          expectedTotal,
          delivery: orderData.delivery ? {
            fullName: orderData.delivery.fullName,
            phoneNumber: orderData.delivery.phoneNumber,
            address: orderData.delivery.address,
            city: orderData.delivery.city,
            state: orderData.delivery.state,
            country: orderData.delivery.country,
            deliveryMethod: orderData.delivery.deliveryMethod,
          } : undefined,
        }),
      });

      setIsProcessing(false);
      handlePaymentComplete(`OFFLINE_${res.reference || Date.now()}`, { orderId: res.orderId, totalAmount: res.totalAmount });
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "An unexpected error occurred while placing offline order.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 pt-20 sm:pt-24">
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
      <div className="sticky top-20 sm:top-24 z-30 bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-sm">
        <div className="section-container">
          <ProgressBar currentStep={currentStep} />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-earth-200/60 p-6 sm:p-8">
          {currentStep === 1 && (
            <StepStyleSelection
              selected={orderData.style}
              outfitStyles={outfitStyles}
              onSelect={(s) => {
                const styleObj = outfitStyles.find((style) => style.id === s);
                setOrderData((prev) => ({
                  ...prev,
                  style: s,
                  customStyleInfo: styleObj,
                }));
              }}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepMeasurements
              measurements={orderData.measurements}
              productId={productId || undefined}
              onUpdate={(m) => updateOrderData('measurements', m)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepFabricSelection
              fabric={orderData.fabric}
              fabricOptions={fabricOptions}
              onSelect={(f) => updateOrderData('fabric', f)}
              onNext={handleNext}
              onBack={handleBack}
              fabricQty={orderData.measurements?.fabricQty || 2.0}
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
              onEdit={handleEditCartItem}
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
              onEditItem={handleEditCartItem}
              onApplyPromo={(code) => updateOrderData('promoCode', code)}
              onNext={isOnline ? handlePay : handlePayLater}
              onBack={handleBack}
              isProcessing={isProcessing}
              paymentError={paymentError}
              isOnline={isOnline}
              createdOrders={createdOrders}
            />
          )}
          {currentStep === 8 && (
            <StepConfirmation
              order={orderData}
              cartItems={cartItems}
              paymentReference={paymentReference}
              confirmedOrderInfo={confirmedOrderInfo}
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
  const currentStepInfo = STEPS.find((s) => s.id === currentStep);
  return (
    <div className="w-full py-4 px-1">
      {/* Mobile progress indicator */}
      <div className="md:hidden flex flex-col items-center">
        <div className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider">
          Step {currentStep} of {STEPS.length}
        </div>
        <div className="text-sm font-bold text-night-950 mt-0.5">
          {currentStepInfo?.name}
        </div>
        <div className="w-full bg-earth-200 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-terra-600 to-kente-500 transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop progress timeline */}
      <div className="hidden md:block relative">
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
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${done
                      ? 'border-terra-600 bg-terra-600 text-white'
                      : active
                        ? 'border-kente-500 bg-kente-500 text-white'
                        : 'border-earth-300 bg-earth-50 text-earth-400'
                    }`}
                >
                  {done ? <Check size={14} /> : step.id}
                </div>
                <span
                  className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center max-w-[52px] sm:max-w-none leading-tight ${done || active ? 'text-night-950' : 'text-earth-400'
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
  const hasBack = showBack && onBack;
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-earth-150 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-t-0 md:border-0 md:shadow-none md:p-0 md:mt-8 flex items-center gap-3 w-full">
      {hasBack && (
        <button
          onClick={onBack}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-earth-300 text-sm font-medium text-night-900 hover:border-terra-400 transition-colors min-h-[44px]"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 min-h-[44px] ${!hasBack ? 'w-full md:w-auto' : ''
          } ${nextDisabled
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
  outfitStyles,
  onSelect,
  onNext,
}: {
  selected: string | null;
  outfitStyles: readonly any[];
  onSelect: (s: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Choose Your Style</h2>
        <p className="mt-1 text-earth-500 text-sm">Select the traditional outfit style you'd like us to create.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {outfitStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${selected === style.id
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

      <StepNav onNext={onNext} nextDisabled={!selected} nextLabel="Continue to Measurements" showBack={false} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 2 – Fabric Selection
// ═══════════════════════════════════════════════════════

function StepFabricSelection({
  fabric,
  fabricOptions,
  onSelect,
  onNext,
  onBack,
  fabricQty,
}: {
  fabric: FabricSelection | null;
  fabricOptions: Array<{ id: string; name: string; color: string; price: number; imageUrl?: string; yardsPerUnit: number; unit: string }>;
  onSelect: (f: FabricSelection) => void;
  onNext: () => void;
  onBack: () => void;
  fabricQty: number;
}) {
  const [notes, setNotes] = useState(fabric?.notes || '');
  const [customImage, setCustomImage] = useState<string | null>(
    fabric?.type === 'custom' ? fabric.customImageUrl || null : null,
  );

  const handlePreset = (id: string) => {
    const opt = fabricOptions.find(o => o.id === id);
    if (opt) {
      onSelect({
        type: 'preset',
        presetId: id,
        presetName: opt.name,
        presetColor: opt.color,
        presetPrice: opt.price,
        presetYardsPerUnit: opt.yardsPerUnit,
        presetUnit: opt.unit,
        notes
      });
    }
  };
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
          {fabricOptions.map((p) => {
            const unitsNeeded = Math.ceil(fabricQty / p.yardsPerUnit);
            const totalFabricCost = p.price * unitsNeeded;

            return (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={`relative p-3 rounded-xl border-2 text-left transition-all ${fabric?.type === 'preset' && fabric.presetId === p.id
                    ? 'border-kente-500 ring-2 ring-kente-500/30'
                    : 'border-earth-200 hover:border-terra-400'
                  }`}
              >
                <div
                  className="h-14 w-full rounded-lg mb-2 border border-earth-200 bg-cover bg-center"
                  style={{
                    backgroundColor: p.color,
                    backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : 'none'
                  }}
                />
                <p className="text-xs font-semibold text-night-950 truncate" title={p.name}>{p.name}</p>
                <p className="text-[10px] text-earth-500">
                  {p.price === 0
                    ? 'Included'
                    : `+${formatNaira(totalFabricCost)} (${unitsNeeded} ${p.unit}${unitsNeeded > 1 ? 's' : ''})`
                  }
                </p>
                {p.price > 0 && (
                  <p className="text-[8px] text-earth-400 mt-0.5">
                    {p.yardsPerUnit} yd per {p.unit}
                  </p>
                )}
                {fabric?.type === 'preset' && fabric.presetId === p.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-kente-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload */}
      <div>
        <h3 className="font-display text-base font-semibold text-night-950 mb-3">Or Upload Your Own</h3>
        <label
          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${customImage
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
          className="w-full px-4 py-3 border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all resize-none"
        />
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!fabric} nextLabel="Continue to Personalize" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Step 3 – Measurements
// ═══════════════════════════════════════════════════════

function StepMeasurements({
  measurements,
  productId,
  onUpdate,
  onNext,
  onBack,
}: {
  measurements: Measurements | null;
  productId?: string;
  onUpdate: (m: Measurements) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const hasExistingFormValues = measurements && (measurements.chest > 0 || measurements.waist > 0 || measurements.hips > 0);
  const [form, setForm] = useState<Measurements>(
    measurements || { chest: 0, waist: 0, hips: 0, height: 0, shoulderWidth: 0, saveForFuture: false, fabricQty: 2.0, fabricUnit: 'yards' },
  );

  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [newProfileName, setNewProfileName] = useState('My Custom Fit');
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formula, setFormula] = useState<any>(null);

  const [showGuide, setShowGuide] = useState<string | null>(null);

  const calculateYards = useCallback((m: any, formulaConfig: any) => {
    if (!formulaConfig || !m.chest || !m.hips || !m.height || !m.shoulderWidth) {
      return 2.0;
    }
    const { ease, fabricWidth, garmentLengthMultiplier, sleeveLengthMultiplier, allowance, divisor, minYards } = formulaConfig;
    const maxCirc = Math.max(m.chest, m.hips);
    const flatWidth = (maxCirc / 2) + ease;
    const numLengths = (flatWidth * 2 > fabricWidth) ? 2 : 1;
    const garmentLength = m.height * garmentLengthMultiplier;
    const sleeveLength = m.shoulderWidth * sleeveLengthMultiplier;
    const totalLengthCm = (garmentLength * numLengths) + sleeveLength + allowance;
    const yards = totalLengthCm / divisor;
    return Math.max(minYards, Math.round(yards * 100) / 100);
  }, []);

  // Load profiles and formula config
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        setLoadingProfiles(true);
        const formulaData = await fetchApi('/orders/fabric-formula');
        if (!active) return;
        setFormula(formulaData);

        if (user) {
          const data = await fetchApi('/orders/measurements');
          if (!active) return;
          const list = data || [];
          setSavedProfiles(list);

          if (list.length > 0 && !hasExistingFormValues) {
            const defaultProf = list.find((m: any) => m.isDefault) || list[0];
            setSelectedProfileId(defaultProf.id);
            const mapped = {
              id: defaultProf.id,
              chest: defaultProf.chest || 0,
              waist: defaultProf.waist || 0,
              hips: defaultProf.hip || 0,
              height: defaultProf.length || 0,
              shoulderWidth: defaultProf.shoulder || 0,
              saveForFuture: false,
              fabricQty: 2.0,
              fabricUnit: 'yards',
            };
            mapped.fabricQty = calculateYards(mapped, formulaData);
            setForm(mapped);
            onUpdate(mapped);
            setIsCreatingNew(false);
          } else if (list.length === 0) {
            setIsCreatingNew(true);
          }
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        if (active) setLoadingProfiles(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [user, hasExistingFormValues, calculateYards]);

  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    const prof = savedProfiles.find((p) => p.id === profileId);
    if (prof) {
      const mapped = {
        id: prof.id,
        chest: prof.chest || 0,
        waist: prof.waist || 0,
        hips: prof.hip || 0,
        height: prof.length || 0,
        shoulderWidth: prof.shoulder || 0,
        saveForFuture: false,
        fabricQty: 2.0,
        fabricUnit: 'yards',
      };
      if (formula) {
        mapped.fabricQty = calculateYards(mapped, formula);
      }
      setForm(mapped);
      onUpdate(mapped);
    }
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedProfileId(null);
    const cleared = {
      chest: 0,
      waist: 0,
      hips: 0,
      height: 0,
      shoulderWidth: 0,
      saveForFuture: true,
      fabricQty: 2.0,
      fabricUnit: 'yards',
    };
    setForm(cleared);
    onUpdate(cleared);
  };

  const handleCancelCreateNew = () => {
    setIsCreatingNew(false);
    if (savedProfiles.length > 0) {
      const defaultProf = savedProfiles.find((m: any) => m.isDefault) || savedProfiles[0];
      handleProfileChange(defaultProf.id);
    }
  };

  const handleContinue = async () => {
    if (!isValid) return;

    if (user && isCreatingNew) {
      if (form.saveForFuture) {
        try {
          setIsSaving(true);
          setApiError(null);
          const res = await fetchApi('/orders/measurements', {
            method: 'POST',
            body: JSON.stringify({
              profileName: newProfileName || 'My Custom Fit',
              isDefault: savedProfiles.length === 0, // Set default if it's their first profile
              chest: form.chest,
              waist: form.waist,
              hip: form.hips,
              shoulder: form.shoulderWidth,
              length: form.height,
              notes: 'Saved from order customization wizard',
            }),
          });

          const mapped = {
            id: res.id,
            chest: form.chest,
            waist: form.waist,
            hips: form.hips,
            height: form.height,
            shoulderWidth: form.shoulderWidth,
            saveForFuture: form.saveForFuture,
            fabricQty: form.fabricQty,
            fabricUnit: form.fabricUnit,
          };
          setForm(mapped);
          onUpdate(mapped);
          onNext();
        } catch (err: any) {
          setApiError(err.message || 'Failed to save measurement profile.');
        } finally {
          setIsSaving(false);
        }
      } else {
        const mapped = {
          chest: form.chest,
          waist: form.waist,
          hips: form.hips,
          height: form.height,
          shoulderWidth: form.shoulderWidth,
          saveForFuture: false,
          fabricQty: form.fabricQty,
          fabricUnit: form.fabricUnit,
        };
        setForm(mapped);
        onUpdate(mapped);
        onNext();
      }
    } else {
      if (user && selectedProfileId) {
        const original = savedProfiles.find(p => p.id === selectedProfileId);
        const changed = original && (
          original.chest !== form.chest ||
          original.waist !== form.waist ||
          original.hip !== form.hips ||
          original.length !== form.height ||
          original.shoulder !== form.shoulderWidth
        );

        if (changed) {
          try {
            setIsSaving(true);
            setApiError(null);
            await fetchApi(`/orders/measurements/${selectedProfileId}`, {
              method: 'PUT',
              body: JSON.stringify({
                profileName: original.profileName,
                isDefault: original.isDefault,
                chest: form.chest,
                waist: form.waist,
                hip: form.hips,
                shoulder: form.shoulderWidth,
                length: form.height,
                notes: original.notes,
              }),
            });
          } catch (err: any) {
            setApiError(err.message || 'Failed to update measurement profile.');
            setIsSaving(false);
            return;
          } finally {
            setIsSaving(false);
          }
        }

        const mapped = {
          id: selectedProfileId,
          chest: form.chest,
          waist: form.waist,
          hips: form.hips,
          height: form.height,
          shoulderWidth: form.shoulderWidth,
          saveForFuture: false,
          fabricQty: form.fabricQty,
          fabricUnit: form.fabricUnit,
        };
        onUpdate(mapped);
      }
      onNext();
    }
  };

  const handleChange = (field: keyof Measurements, value: number | boolean) => {
    const updated = { ...form, [field]: value };
    if (formula) {
      const yards = calculateYards(updated, formula);
      updated.fabricQty = yards;
      updated.fabricUnit = 'yards';
    }
    setForm(updated);
    onUpdate(updated);
  };

  const isValid = form.chest > 0 && form.waist > 0 && form.hips > 0 && form.height > 0 && form.shoulderWidth > 0;

  const fields: { key: 'chest' | 'waist' | 'hips' | 'height' | 'shoulderWidth'; label: string }[] = [
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

      {/* Guest user login prompt */}
      {!user && (
        <div className="bg-terra-50 border border-terra-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-terra-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-night-950">Already have a measurement profile?</p>
              <p className="text-xs text-earth-600 mt-0.5">
                Log in to retrieve your saved measurements and bypass manual entry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate(`/login?redirect=${encodeURIComponent(`/order?product=${productId || ''}&step=2`)}`);
            }}
            className="px-4 py-2 bg-terra-600 text-white text-xs font-bold rounded-lg hover:bg-terra-700 transition-colors shrink-0 shadow-sm"
          >
            Log In
          </button>
        </div>
      )}

      {/* Authenticated user saved profile manager */}
      {user && (
        <div className="bg-earth-50 rounded-xl p-4 border border-earth-200/80 mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold text-earth-500 uppercase tracking-wider">Saved Measurements</p>
              <p className="text-xs font-medium text-night-950 mt-0.5">
                {isCreatingNew ? 'Creating new profile' : 'Using saved profile'}
              </p>
            </div>
            {savedProfiles.length > 0 && (
              <button
                type="button"
                onClick={isCreatingNew ? handleCancelCreateNew : handleStartCreateNew}
                className="text-xs font-bold text-terra-600 hover:text-terra-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-earth-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isCreatingNew && savedProfiles.length >= 2}
              >
                {isCreatingNew ? 'Use Saved Profile' : 'Create New Profile'}
              </button>
            )}
          </div>

          {!isCreatingNew && savedProfiles.length >= 2 && (
            <p className="text-[11px] text-terra-600 font-semibold bg-white p-2.5 rounded-xl border border-earth-200 shadow-sm">
              ⚠️ Maximum of 2 saved measurement profiles reached. Select a profile below to edit/update its values.
            </p>
          )}

          {loadingProfiles ? (
            <p className="text-xs text-earth-400">Loading saved profiles...</p>
          ) : savedProfiles.length > 0 && !isCreatingNew ? (
            <div>
              <label className="block text-xs font-semibold text-night-950 mb-1.5">Select Profile</label>
              <select
                value={selectedProfileId || ''}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              >
                {savedProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profileName} {p.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : isCreatingNew ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-night-950 mb-1.5">New Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Slim fit, Groom"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-earth-500">You don't have any saved profiles yet. Your measurements will be saved under a new profile name.</p>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-night-950 mb-1.5">Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Default Profile"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Real-time fabric requirement banner */}
      {isValid && form.fabricQty && form.fabricQty > 0 ? (
        <div className="bg-terra-50 border border-terra-100 rounded-xl p-4 flex items-center justify-between text-sm animate-fade-in shadow-sm">
          <div>
            <p className="font-semibold text-night-950 font-display">Estimated Fabric Required</p>
            <p className="text-xs text-earth-600 mt-0.5">Calculated in real-time using standard tailors' layout rules.</p>
          </div>
          <div className="text-right">
            <span className="font-display font-extrabold text-terra-700 text-lg">{form.fabricQty} Yards</span>
          </div>
        </div>
      ) : null}

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
            <div className="flex items-center w-full border border-earth-200 rounded-xl bg-white focus-within:border-terra-500 focus-within:ring-1 focus-within:ring-terra-500 transition-all overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, (form[key] || 0) - 0.5);
                  handleChange(key, val);
                }}
                className="w-11 h-11 flex items-center justify-center text-earth-600 hover:text-terra-600 active:bg-earth-100 border-r border-earth-150 transition-colors select-none font-bold text-lg"
                aria-label={`Decrease ${label}`}
              >
                —
              </button>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="0.0"
                value={form[key] || ''}
                onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                className="flex-1 text-center py-2.5 px-3 text-base font-body text-night-950 bg-transparent focus:outline-none border-none placeholder-earth-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => {
                  const val = (form[key] || 0) + 0.5;
                  handleChange(key, val);
                }}
                className="w-11 h-11 flex items-center justify-center text-earth-600 hover:text-terra-600 active:bg-earth-100 border-l border-earth-150 transition-colors select-none font-bold text-lg"
                aria-label={`Increase ${label}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Visual guide mini */}
      <div className="bg-earth-50 rounded-xl p-4 border border-earth-200">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-[10px]">
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
      {(!user || isCreatingNew) && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <span
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${form.saveForFuture ? 'bg-terra-600 border-terra-600' : 'border-earth-400 group-hover:border-terra-400'
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
      )}

      {apiError && (
        <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {apiError}
        </div>
      )}

      <StepNav
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!isValid || isSaving}
        nextLabel={isSaving ? 'Saving profile...' : 'Continue to Fabric'}
      />
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
      specialRequests: '',
    },
  );

  const handleChange = <K extends keyof Personalization>(key: K, value: Personalization[K]) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Personalise Your Outfit</h2>
        <p className="mt-1 text-earth-500 text-sm">Add any special instructions or preferences for your design.</p>
      </div>

      {/* Special requests */}
      <div>
        <label className="block text-sm font-semibold text-night-950 mb-1.5 font-display text-lg">Special Requests (Optional)</label>
        <textarea
          rows={6}
          placeholder="Specify neckline preferences, sleeve preferences, style accents, lining, or any other notes for our tailors..."
          value={form.specialRequests}
          onChange={(e) => handleChange('specialRequests', e.target.value)}
          className="w-full px-4 py-3 border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all resize-none shadow-sm"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-earth-150 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-t-0 md:border-0 md:shadow-none md:p-0 md:mt-8 flex items-center gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-earth-300 text-sm font-medium text-night-900 hover:border-terra-400 transition-colors min-h-[44px]"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onAddToCart}
          className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold btn-primary min-h-[44px]"
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

  const inputCls = 'w-full px-4 py-2.5 border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all';

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
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.deliveryMethod === 'standard'
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
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.deliveryMethod === 'express'
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
  onEdit,
  onAddAnother,
  onCheckout,
}: {
  cartItems: CartItem[];
  onRemove: (id: string) => void;
  onEdit: (item: CartItem) => void;
  onAddAnother: () => void;
  onCheckout: () => void;
}) {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

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
          const fabric = item.order.fabric?.type === 'preset'
            ? {
              name: item.order.fabric.presetName || FABRIC_PRESETS.find((f) => f.id === item.order.fabric?.presetId)?.name || 'Custom Fabric',
              color: item.order.fabric.presetColor || FABRIC_PRESETS.find((f) => f.id === item.order.fabric?.presetId)?.color || '#eee',
              price: item.order.fabric.presetPrice ?? FABRIC_PRESETS.find((f) => f.id === item.order.fabric?.presetId)?.price ?? 0,
            }
            : null;
          const { basePrice, customizationFee } = calculateOrderTotal(item.order);
          const itemTotal = basePrice + customizationFee;
          return (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl border border-earth-200 bg-earth-50">
              {style && (
                <div
                  className="relative group/img shrink-0 cursor-pointer overflow-hidden rounded-lg border border-earth-200 w-16 h-20 bg-earth-100"
                  onClick={() => setActiveImageUrl(style.image)}
                  title="View larger image"
                >
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-105 duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <span className="text-[10px] text-white font-semibold">Zoom</span>
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-extrabold text-night-950">
                  {item.order.productName || style?.name || 'Custom Outfit'}
                </p>
                <div className="mt-1.5 space-y-1 text-xs text-earth-500">
                  {item.order.customStyleInfo && (
                    <p>Style: <span className="font-semibold text-night-800">{item.order.customStyleInfo.name}</span></p>
                  )}
                  {fabric && (
                    <p>
                      Fabric: <span className="font-semibold text-night-800">{fabric.name}</span>{' '}
                      <span className="text-terra-600 font-medium">
                        ({fabric.price > 0 ? `+${formatNaira(fabric.price)}` : 'Included'})
                      </span>
                    </p>
                  )}
                  {item.order.personalization?.specialRequests && (
                    <p className="italic text-earth-400 mt-1">
                      Request: "{item.order.personalization.specialRequests}"
                    </p>
                  )}
                </div>
                <p className="mt-3 text-sm font-bold text-kente-600">{formatNaira(itemTotal)}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove item"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-earth-400 hover:text-terra-600 hover:bg-terra-50 transition-colors"
                  title="Edit customization"
                >
                  <Pencil size={18} />
                </button>
              </div>
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-earth-150 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-t-0 md:border-0 md:shadow-none md:p-0 md:mt-8 flex items-center gap-3 w-full">
        <button
          onClick={onAddAnother}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-earth-300 text-sm font-semibold text-night-950 hover:border-terra-400 transition-colors min-h-[44px]"
        >
          <Package size={16} />
          <span className="truncate">Add Outfit</span>
        </button>
        <button
          onClick={onCheckout}
          className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-kente-600 hover:bg-kente-700 text-white transition-all min-h-[44px]"
        >
          Checkout
          <ChevronRight size={16} />
        </button>
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

// ═══════════════════════════════════════════════════════
// Step 6 – Order Summary
// ═══════════════════════════════════════════════════════

function StepOrderSummary({
  order,
  cartItems,
  onEditStep,
  onEditItem,
  onApplyPromo,
  onNext,
  onBack,
  isProcessing,
  paymentError,
  isOnline,
  createdOrders,
}: {
  order: OrderData;
  cartItems: CartItem[];
  onEditStep: (step: number) => void;
  onEditItem: (item: CartItem) => void;
  onApplyPromo: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing: boolean;
  paymentError: string | null;
  isOnline: boolean;
  createdOrders: any[];
}) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
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

  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const handleRefreshCartPrices = async () => {
    setIsRefreshingPrices(true);
    try {
      let failedCount = 0;
      const updatedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          if (!item.order.productId) return item;
          try {
            // Fetch the latest product details
            const product = await fetchApi(`/v1/products/${item.order.productId}`, { skipAuth: true });
            if (!product) {
              failedCount++;
              return item;
            }

            // Clone the order to avoid mutations
            const updatedOrder = JSON.parse(JSON.stringify(item.order));

          // 1. Update style base price
          const selectedStyleName = updatedOrder.customStyleInfo?.name || 'Standard';
          let updatedBasePrice = product.basePrice || 0;

          if (selectedStyleName.toLowerCase() !== 'standard' && selectedStyleName.toLowerCase() !== 'original') {
            const matchedStyle = product.styleOptions?.find(
              (s: any) => s.name.toLowerCase() === selectedStyleName.toLowerCase()
            );
            if (matchedStyle) {
              updatedBasePrice = (product.basePrice || 0) + (matchedStyle.priceModifier || 0);
            }
          }

          if (updatedOrder.customStyleInfo) {
            updatedOrder.customStyleInfo.basePrice = updatedBasePrice;
          }

          // 2. Update fabric selection details
          if (updatedOrder.fabric && updatedOrder.fabric.type === 'preset' && updatedOrder.fabric.presetId) {
            const presetId = updatedOrder.fabric.presetId;
            let matchedProp: any = null;
            let matchedFabricName = '';

            // Handle database fabric presetIds (format: fabricId::colorName)
            const parts = presetId.split('::');
            const fabricIdFromPreset = parts[0];
            const colorNameFromPreset = parts[1];

            for (const f of (product.fabrics || [])) {
              const fId = (f.id || f._id || '').toString();
              if (fabricIdFromPreset && fId === fabricIdFromPreset) {
                const prop = f.properties?.find((p: any) => {
                  if (colorNameFromPreset && p.colorName) {
                    return p.colorName.toLowerCase() === colorNameFromPreset.toLowerCase();
                  }
                  const pId = (p._id || p.id || '').toString();
                  return pId === presetId || pId === fabricIdFromPreset;
                });
                if (prop) {
                  matchedProp = prop;
                  matchedFabricName = f.name;
                  break;
                }
              }
            }

            if (matchedProp) {
              updatedOrder.fabric.presetPrice = matchedProp.priceModifier || 0;
              updatedOrder.fabric.presetYardsPerUnit = matchedProp.yardsPerUnit || 1.0;
              updatedOrder.fabric.presetUnit = matchedProp.unit || 'yard';
              updatedOrder.fabric.presetName = `${matchedFabricName} — ${matchedProp.colorName}`;
            }
          }

            return {
              ...item,
              order: updatedOrder,
            };
          } catch (e) {
            console.warn(`Could not refresh prices for productId=${item.order.productId}:`, e);
            failedCount++;
            return item;
          }
        })
      );

      // Save back to local storage
      saveCart(updatedCartItems);

      if (failedCount > 0) {
        alert("Some items in your cart are no longer active or available, and their prices could not be updated. Please review your cart items.");
      }

      // Reload page to reflect updated cart
      window.location.reload();
    } catch (err) {
      console.error('Failed to refresh cart prices:', err);
      alert('Failed to refresh prices. Please check your connection.');
    } finally {
      setIsRefreshingPrices(false);
    }
  };


  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-night-950">Order Summary</h2>
        <p className="mt-1 text-earth-500 text-sm">Review your order before proceeding to payment.</p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {cartItems.map((item, index) => {
          const itemStyle = item.order.customStyleInfo || OUTFIT_STYLES.find((s) => s.id === item.order.style);
          const { basePrice, customizationFee } = calculateOrderTotal(item.order);
          const itemTotal = basePrice + customizationFee;

          return (
            <div key={item.id} className="bg-earth-50 rounded-xl p-5 border border-earth-200 space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-earth-200 pb-3">
                <div>
                  <span className="text-[10px] text-terra-600 font-semibold tracking-widest uppercase">
                    Item {index + 1}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-night-950">
                    {item.order.productName || itemStyle?.name || 'Custom Outfit'}
                  </h3>
                </div>
                <button
                  onClick={() => onEditItem(item)}
                  className="text-xs text-terra-600 hover:text-terra-800 font-semibold flex items-center gap-1 shrink-0 ml-3"
                  title="Edit item customization"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-earth-600">
                {/* Style */}
                <div>
                  <span className="block text-[10px] text-earth-400 uppercase font-semibold">Style Option</span>
                  <span className="font-semibold text-night-950">{item.order.customStyleInfo?.name || 'Standard'}</span>
                </div>

                {/* Fabric */}
                <div>
                  <span className="block text-[10px] text-earth-400 uppercase font-semibold">Fabric</span>
                  {item.order.fabric?.type === 'preset' ? (
                    <div className="flex flex-col mt-0.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border border-earth-200" style={{ backgroundColor: item.order.fabric.presetColor }} />
                        <span className="font-semibold text-night-950">{item.order.fabric.presetName}</span>
                      </div>
                      {item.order.measurements?.fabricQty && (
                        <div className="text-xs text-earth-500 font-medium mt-0.5">
                          Required: <span className="font-semibold text-night-950">{item.order.measurements.fabricQty} yards</span>
                          <span> ({Math.ceil(item.order.measurements.fabricQty / (item.order.fabric.presetYardsPerUnit || 1.0))} {item.order.fabric.presetUnit || 'yard'}{Math.ceil(item.order.measurements.fabricQty / (item.order.fabric.presetYardsPerUnit || 1.0)) > 1 ? 's' : ''} needed)</span>
                          {item.order.fabric.presetPrice && item.order.fabric.presetPrice > 0 ? (
                            <span> at <span className="font-semibold text-terra-600">{formatNaira(item.order.fabric.presetPrice)}</span> per {item.order.fabric.presetUnit || 'yard'}</span>
                          ) : null}
                        </div>
                      )}
                      <div className="text-terra-600 text-xs font-semibold mt-0.5">
                        Fabric Cost: {item.order.fabric.presetPrice && item.order.fabric.presetPrice > 0 ? `+${formatNaira(item.order.fabric.presetPrice * Math.ceil((item.order.measurements?.fabricQty || 2.0) / (item.order.fabric.presetYardsPerUnit || 1.0)))}` : 'Included'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col mt-0.5 space-y-1">
                      <span className="font-semibold text-night-950">Custom Fabric Uploaded</span>
                      {item.order.measurements?.fabricQty && (
                        <div className="text-xs text-earth-500 font-medium">
                          Required: <span className="font-semibold text-night-950">{item.order.measurements.fabricQty} yards</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Measurements */}
                {item.order.measurements && (
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] text-earth-400 uppercase font-semibold mb-1">Measurements</span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-white rounded-lg p-2.5 border border-earth-200/60 text-xs text-center sm:text-left">
                      <div><span className="text-earth-400 block text-[9px] uppercase">Chest</span><span className="font-bold text-night-950">{item.order.measurements.chest}cm</span></div>
                      <div><span className="text-earth-400 block text-[9px] uppercase">Waist</span><span className="font-bold text-night-950">{item.order.measurements.waist}cm</span></div>
                      <div><span className="text-earth-400 block text-[9px] uppercase">Hips</span><span className="font-bold text-night-950">{item.order.measurements.hips}cm</span></div>
                      <div><span className="text-earth-400 block text-[9px] uppercase">Height</span><span className="font-bold text-night-950">{item.order.measurements.height}cm</span></div>
                      <div><span className="text-earth-400 block text-[9px] uppercase">Shoulder</span><span className="font-bold text-night-950">{item.order.measurements.shoulderWidth}cm</span></div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div className="sm:col-span-2">
                  <span className="block text-[10px] text-earth-400 uppercase font-semibold">Special Requests</span>
                  <p className="text-night-950 italic mt-0.5 text-xs">
                    {item.order.personalization?.specialRequests ? `"${item.order.personalization.specialRequests}"` : 'No special requests'}
                  </p>
                </div>
              </div>

              <div className="border-t border-earth-200/60 pt-3 flex justify-between items-center text-sm">
                <span className="text-earth-500 font-medium">Item Subtotal</span>
                <span className="font-bold text-kente-600">{formatNaira(itemTotal)}</span>
              </div>
            </div>
          );
        })}

        {/* Delivery Details */}
        {order.delivery && (
          <div className="bg-earth-50 rounded-xl p-5 border border-earth-200 space-y-3 shadow-sm">
            <div className="flex justify-between items-start border-b border-earth-200 pb-3">
              <div>
                <h3 className="font-display text-base font-extrabold text-night-950">Delivery Address</h3>
              </div>
              <button
                onClick={() => onEditStep(6)}
                className="text-xs text-terra-600 hover:text-terra-800 font-semibold flex items-center gap-1 shrink-0 ml-3"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
            <div className="text-sm text-earth-600 space-y-1">
              <p className="font-semibold text-night-950">{order.delivery.fullName} · {order.delivery.phoneNumber}</p>
              <p>{order.delivery.address}</p>
              <p>{order.delivery.city}, {order.delivery.state}, Nigeria</p>
              <p className="font-semibold text-terra-700 mt-2">
                {order.delivery.deliveryMethod === 'express' ? 'Express' : 'Standard'} Delivery (+{formatNaira(DELIVERY_PRICES[order.delivery.deliveryMethod])})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Promo code */}
      <div className="border border-earth-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={14} className="text-kente-600" />
          <span className="text-sm font-semibold text-night-950">Promo Code</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-earth-200 rounded-xl text-base md:text-sm font-body text-night-950 placeholder-earth-400 focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
          />
          <button onClick={handleApplyPromo} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-earth-300 text-sm font-semibold text-night-950 hover:border-terra-400 transition-colors min-h-[44px]">
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

      {/* Error display */}
      {paymentError && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <div className="flex items-start justify-between gap-3">
            <span className="flex-1">❌ {paymentError}</span>
            {paymentError.includes('Price mismatch') && (
              <button
                onClick={handleRefreshCartPrices}
                disabled={isRefreshingPrices}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:text-red-950 underline shrink-0 disabled:opacity-50"
              >
                {isRefreshingPrices ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                    </svg>
                    Refresh Cart
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
          📡 You are offline. Order will be saved and you can pay later when you reconnect.
        </div>
      )}

      {/* Auth warning */}
      {!user && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700 border border-amber-200">
          🔑 You must be logged in to place an order.
        </div>
      )}

      {/* Security badges (Only shown when online) */}
      {isOnline && (
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
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-earth-150 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-t-0 md:border-0 md:shadow-none md:p-0 md:mt-8 flex items-center gap-3 w-full">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-earth-300 text-sm font-medium text-night-900 hover:border-terra-400 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {!user ? (
          <button
            onClick={() => navigate(`/login?redirect=${encodeURIComponent('/order?step=7')}`)}
            className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-terra-600 hover:bg-terra-700 text-white transition-all shadow-sm min-h-[44px]"
          >
            Log In to Continue
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isProcessing}
            className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-kente-600 hover:bg-kente-700 text-white transition-all disabled:opacity-60 min-h-[44px]"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                {createdOrders.length > 0 ? "Initializing..." : "Creating..."}
              </>
            ) : isOnline ? (
              <>Pay <span className="hidden sm:inline">Now with Paystack</span> ({formatNaira(grandTotal)})</>
            ) : (
              <>Save <span className="hidden sm:inline">Order</span> & Pay Later ({formatNaira(grandTotal)})</>
            )}
          </button>
        )}
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
  confirmedOrderInfo,
}: {
  order: OrderData;
  cartItems: CartItem[];
  paymentReference: string;
  confirmedOrderInfo?: {
    orderId: string;
    paymentReference: string;
    totalPaid: number;
    itemCount: number;
    deliveryMethod: string;
    deliveryAddress: string;
    styleName: string;
    estimatedDelivery: Date;
  } | null;
}) {
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const totalPaid = confirmedOrderInfo?.totalPaid ?? (() => {
    const itemsSubtotal = cartItems.reduce((sum, item) => {
      const { basePrice, customizationFee } = calculateOrderTotal(item.order);
      return sum + basePrice + customizationFee;
    }, 0);
    const deliveryFee = order.delivery ? DELIVERY_PRICES[order.delivery.deliveryMethod] : 0;
    return itemsSubtotal + deliveryFee;
  })();

  const styleName = confirmedOrderInfo?.styleName || OUTFIT_STYLES.find((s) => s.id === cartItems[0]?.order?.style || order.style)?.name || 'Outfit';
  const orderId = confirmedOrderInfo?.orderId || `JHZ-${Date.now().toString(36).toUpperCase()}`;

  const estimatedDelivery = confirmedOrderInfo?.estimatedDelivery || (order.delivery?.deliveryMethod === 'express'
    ? addDays(new Date(), 10)
    : addDays(new Date(), 21));

  const itemCount = confirmedOrderInfo?.itemCount ?? cartItems.length;
  const deliveryMethod = confirmedOrderInfo?.deliveryMethod || order.delivery?.deliveryMethod || 'standard';
  const deliveryAddress = confirmedOrderInfo?.deliveryAddress || (order.delivery ? `${order.delivery.city}, ${order.delivery.state}` : 'N/A');

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
          Thank you for choosing Jhaz-Imprints. Your custom {styleName} is now being prepared.
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
            <p className="font-mono text-xs text-night-800" title={paymentReference}>
              {paymentReference.length > 20
                ? `${paymentReference.slice(0, 10)}...${paymentReference.slice(-8)}`
                : paymentReference}
            </p>
          </div>
          <button onClick={() => copy(paymentReference, 'ref')} className="text-earth-400 hover:text-terra-600 transition-colors">
            {copiedRef ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-earth-500">Items</span><span className="font-semibold text-night-950">{itemCount} outfit{itemCount !== 1 ? 's' : ''}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Delivery Method</span><span className="font-semibold text-night-950 capitalize">{deliveryMethod}</span></div>
          <div className="flex justify-between"><span className="text-earth-500">Delivery Address</span><span className="font-semibold text-night-950 text-right max-w-[200px]">{deliveryAddress}{deliveryAddress !== 'N/A' && !deliveryAddress.toLowerCase().includes('nigeria') ? ', Nigeria' : ''}</span></div>
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
          to="/my-orders"
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
