import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, ShoppingBag, Eye, Clock, ShieldCheck, Ruler } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { fetchApi } from '../lib/apiClient';

interface OrderItem {
  productId: string;
  productName: string;
  measurement: {
    chest: number;
    waist: number;
    hip: number;
    shoulder: number;
    length: number;
    notes?: string;
  };
  fabricId: string | null;
  fabricOptionName: string;
  styleOptionName: string;
  colorName: string | null;
  basePrice: number;
  styleModifier: number;
  fabricModifier: number;
  totalAmount: number;
  notes: string | null;
}

interface PaymentInfo {
  id: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  reference: string;
  provider: string;
  createdAt: string;
}

interface StatusHistoryItem {
  id: string;
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  note: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  payment: PaymentInfo | null;
  statusHistory?: StatusHistoryItem[];
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MyOrders() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

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

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-orders');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await fetchApi(`/orders/my-orders?take=${itemsPerPage}&skip=${(currentPage - 1) * itemsPerPage}`);
        // Quizio unwrap logic returns payload directly
        if (res && res.items) {
          setOrders(res.items);
          setTotalItems(res.total || 0);
        } else {
          setOrders([]);
          setTotalItems(0);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve order history.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pages: (number | string)[] = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - 2 ||
        i === currentPage + 2
      ) {
        pages.push('...');
      }
    }
    
    return pages.filter((v, idx, arr) => {
      if (v === '...') {
        return arr[idx - 1] !== '...';
      }
      return true;
    });
  };

  const refreshOrder = async (orderId: string) => {
    try {
      const updated = await fetchApi(`/orders/${orderId}`);
      if (updated) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? updated : ord))
        );
      }
    } catch (err) {
      console.error("Error refreshing order details:", err);
    }
  };

  const toggleExpand = async (orderId: string) => {
    const isExpanding = expandedOrder !== orderId;
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
    
    if (isExpanding) {
      await refreshOrder(orderId);
    }
  };

  const payOrder = async (paystackAccessCode: string, reference: string, totalAmount: number) => {
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      throw new Error("Paystack library not loaded. Please wait a moment and try again.");
    }

    return new Promise<void>((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_b2798c2707fdae38dc44c692030b3139d97a049b",
        email: user?.email,
        amount: totalAmount * 100, // in kobo
        ref: reference,
        access_code: paystackAccessCode,
        onClose: () => {
          reject(new Error("Payment cancelled."));
        },
        callback: function(response: any) {
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

  const handleCompletePayment = async (orderId: string) => {
    setPayError(null);
    setPayingOrderId(orderId);
    try {
      // 1. Get payment intent from backend
      const res = await fetchApi(`/orders/${orderId}/payment-intent`, {
        method: "POST"
      });

      // 2. Open Paystack Modal
      await payOrder(res.paystackAccessCode, res.reference, res.amount);

      // 3. Re-fetch order status to update client view
      await refreshOrder(orderId);
    } catch (err: any) {
      console.error(err);
      setPayError(err.message || "Failed to complete payment.");
    } finally {
      setPayingOrderId(null);
    }
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'CONFIRMED':
        return 'bg-savanna-50 text-savanna-800 border-savanna-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getPaymentStatusBadgeClass = (status: PaymentInfo['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 sm:pt-32 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-terra-600"></div>
        <p className="mt-4 text-earth-600 font-medium">Retrieving your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 sm:pt-32 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-950">Unable to Load Orders</h2>
          <p className="mt-2 text-red-700 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 rounded-xl font-bold text-sm bg-terra-600 hover:bg-terra-700 text-white transition-all shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 sm:pt-32 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-earth-100 flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-earth-300" />
        </div>
        <h1 className="font-display text-3xl font-bold text-night-950">No Orders Found</h1>
        <p className="mt-3 text-earth-500 max-w-sm">
          You haven't placed any custom tailored orders yet. Build your unique outfit in the customization page.
        </p>
        <Link to="/catalog" className="mt-8 btn-primary rounded-xl inline-flex items-center gap-2">
          Start Tailoring
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 pt-24 pb-16 sm:pt-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-night-950">My Tailoring Orders</h1>
          <p className="mt-2 text-earth-500 text-sm sm:text-base">
            Track and monitor the creation and shipping progress of your custom African attire.
          </p>
        </div>

        {/* Orders list */}
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const statusHistory = [...(order.statusHistory || [])].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-earth-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:border-earth-300"
              >
                {/* Order Summary Line */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-earth-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-night-950 text-sm sm:text-base">
                        JHZ-{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-earth-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(order.createdAt)}
                      </span>
                      {order.payment && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={12} />
                          Payment: {order.payment.status === 'SUCCESS' ? 'Verified' : order.payment.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-earth-400 uppercase tracking-wider font-semibold">Total Paid</p>
                      <p className="font-bold text-terra-700 text-lg">{formatNaira(order.totalAmount)}</p>
                    </div>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-earth-300 text-night-950 hover:bg-earth-100 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Eye size={14} />
                      {isExpanded ? 'Hide details' : 'View details'}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-earth-200/80 space-y-6">
                    {/* Item list */}
                    <div className="space-y-4">
                      <h3 className="font-display text-sm font-extrabold text-night-950 uppercase tracking-wider">
                        Tailored Items ({order.items.length})
                      </h3>
                      <div className="divide-y divide-earth-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="font-semibold text-night-950 text-sm sm:text-base">
                                  {item.productName || 'Custom Outfit'}
                                </h4>
                                <p className="text-xs text-earth-500 mt-0.5">
                                  Style: <span className="font-bold text-night-900">{item.styleOptionName}</span> · Fabric: <span className="font-bold text-night-900">{item.fabricOptionName}</span>
                                </p>
                              </div>

                              {/* Measurements snapshot */}
                              {item.measurement && (
                                <div className="bg-earth-50/70 rounded-xl p-3 border border-earth-100 text-xs space-y-1.5">
                                  <p className="font-semibold text-night-950 flex items-center gap-1">
                                    <Ruler size={12} className="text-terra-600" />
                                    Measurements (Inches)
                                  </p>
                                  <div className="grid grid-cols-5 gap-2 text-earth-600 text-center">
                                    <div><p className="text-[10px] text-earth-400">Chest</p><p className="font-bold text-night-900">{item.measurement.chest}"</p></div>
                                    <div><p className="text-[10px] text-earth-400">Waist</p><p className="font-bold text-night-900">{item.measurement.waist}"</p></div>
                                    <div><p className="text-[10px] text-earth-400">Hips</p><p className="font-bold text-night-900">{item.measurement.hip}"</p></div>
                                    <div><p className="text-[10px] text-earth-400">Shoulder</p><p className="font-bold text-night-900">{item.measurement.shoulder}"</p></div>
                                    <div><p className="text-[10px] text-earth-400">Height</p><p className="font-bold text-night-900">{item.measurement.length}"</p></div>
                                  </div>
                                </div>
                              )}

                              {item.notes && (
                                <p className="text-xs text-earth-500 italic bg-earth-50/70 p-2.5 rounded-xl border border-earth-100">
                                  💡 Special requests: "{item.notes}"
                                </p>
                              )}
                            </div>

                            <div className="sm:text-right shrink-0">
                              <p className="font-bold text-night-950 text-sm sm:text-base">{formatNaira(item.totalAmount)}</p>
                              <span className="text-[10px] text-earth-400 block mt-0.5">Base: {formatNaira(item.basePrice)}</span>
                              {item.fabricModifier > 0 && <span className="text-[10px] text-earth-400 block">Fabric: +{formatNaira(item.fabricModifier)}</span>}
                              {item.styleModifier > 0 && <span className="text-[10px] text-earth-400 block">Style: +{formatNaira(item.styleModifier)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics and Reference codes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-earth-200/80 text-xs">
                      {/* Payment info */}
                      <div className="space-y-2">
                        <h4 className="font-display font-extrabold text-night-950 uppercase tracking-wider">Payment Information</h4>
                        {order.payment ? (
                          <div className="bg-earth-50/40 rounded-xl p-3 border border-earth-100 space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-earth-500">Provider</span>
                              <span className="font-semibold text-night-900">{order.payment.provider}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-earth-500">Transaction ID</span>
                              <span className="font-mono text-night-900 select-all">{order.payment.reference}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-earth-500">Status</span>
                              <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${getPaymentStatusBadgeClass(order.payment.status)}`}>
                                {order.payment.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-earth-500 italic">No payment details linked.</p>
                        )}

                        {order.status === 'PENDING' && (
                          <div className="pt-2">
                            {payError && payingOrderId === order.id && (
                              <p role="alert" className="text-red-600 mb-2 font-medium">{payError}</p>
                            )}
                            <button
                              onClick={() => handleCompletePayment(order.id)}
                              disabled={payingOrderId !== null}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-kente-600 hover:bg-kente-700 text-white transition-all disabled:opacity-55"
                            >
                              {payingOrderId === order.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                                  Processing Payment...
                                </>
                              ) : (
                                `Pay Now (${formatNaira(order.totalAmount)})`
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tailoring log history */}
                      <div className="space-y-2">
                        <h4 className="font-display font-extrabold text-night-950 uppercase tracking-wider">Tailoring Status Log</h4>
                        <div className="bg-earth-50/40 rounded-xl p-3 border border-earth-100 space-y-3">
                          {statusHistory.length > 0 ? (
                            <div className="relative border-l border-earth-200 pl-4 space-y-3">
                              {statusHistory.map((history, hIdx) => (
                                <div key={hIdx} className="relative">
                                  <span className="absolute -left-[21px] top-1 bg-terra-600 rounded-full w-2 h-2"></span>
                                  <div className="flex justify-between gap-2">
                                    <span className="font-semibold text-night-950">{history.status}</span>
                                    <span className="text-[10px] text-earth-400">{formatDate(history.createdAt)}</span>
                                  </div>
                                  {history.note && <p className="text-earth-500 mt-0.5">{history.note}</p>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-earth-500 italic">
                              <Clock size={12} />
                              <span>Order was placed successfully. Tailoring will begin shortly.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalItems > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-earth-200">
            <p className="text-xs text-earth-500 font-medium">
              Showing <span className="font-semibold text-night-950">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
              <span className="font-semibold text-night-950">{Math.min(totalItems, currentPage * itemsPerPage)}</span> of{' '}
              <span className="font-semibold text-night-950">{totalItems}</span> orders
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-earth-300 text-night-950 bg-white hover:bg-earth-100 disabled:opacity-40 disabled:hover:bg-white transition-all duration-200 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={idx} className="px-2 text-xs text-earth-400 font-medium select-none">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                      currentPage === p
                        ? 'bg-kente-600 hover:bg-kente-700 text-white'
                        : 'border border-earth-300 text-night-950 bg-white hover:bg-earth-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-earth-300 text-night-950 bg-white hover:bg-earth-100 disabled:opacity-40 disabled:hover:bg-white transition-all duration-200 flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
