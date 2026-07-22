import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { generateOrderAgreementPDF } from '../services/internationalProtectionService';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  Copy, 
  ExternalLink, 
  MessageCircle, 
  Sparkles, 
  User, 
  LogOut, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  X,
  ArrowRight,
  Edit3,
  MapPin,
  Phone,
  Save,
  Check,
  Cloud,
  Download,
  Lock
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { 
    orders, 
    customerUser, 
    loginCustomer, 
    logoutCustomer, 
    updateCustomerProfile,
    settings, 
    openWhatsAppInquiry, 
    addToast, 
    setCurrentPage 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'production' | 'dispatched' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSwitchEmailModal, setShowSwitchEmailModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Profile edit fields
  const [profileName, setProfileName] = useState(customerUser?.displayName || 'Parmar Jaydip');
  const [profilePhone, setProfilePhone] = useState(customerUser?.phone || '+91 98765 12345');
  const [profileAddress, setProfileAddress] = useState(customerUser?.shippingAddress || '402 Mahalakshmi Complex, Ring Road');
  const [profileCity, setProfileCity] = useState(customerUser?.cityCountry || 'Ahmedabad, Gujarat, India');
  const [profilePincode, setProfilePincode] = useState(customerUser?.pincode || '380001');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Sync profile fields when customerUser changes
  useEffect(() => {
    if (customerUser) {
      setProfileName(customerUser.displayName || '');
      setProfilePhone(customerUser.phone || '');
      setProfileAddress(customerUser.shippingAddress || '');
      setProfileCity(customerUser.cityCountry || '');
      setProfilePincode(customerUser.pincode || '');
    }
  }, [customerUser]);

  // Active email
  const currentEmail = customerUser?.email || 'parmarjaydip881987@gmail.com';
  const currentName = customerUser?.displayName || 'Parmar Jaydip';

  // Filter orders for the current user
  const userOrders = orders.filter(o => 
    o.customerEmail.toLowerCase().trim() === currentEmail.toLowerCase().trim()
  );

  // Tab Filtering
  const filteredOrders = userOrders.filter(order => {
    // Tab match
    let matchesTab = true;
    if (activeTab === 'production') {
      matchesTab = order.status === 'In Production (Embroidery)' || order.status === 'Pending Approval' || order.status === 'Quality Check';
    } else if (activeTab === 'dispatched') {
      matchesTab = order.status === 'Dispatched (Priority Air Express)';
    } else if (activeTab === 'delivered') {
      matchesTab = order.status === 'Delivered';
    }

    // Search query match
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = order.id.toLowerCase().includes(q);
      const matchTracking = order.trackingNumber?.toLowerCase().includes(q) || false;
      const matchItem = order.items.some(i => 
        i.productTitle.toLowerCase().includes(q) || 
        (i.sku && i.sku.toLowerCase().includes(q))
      );
      matchesSearch = matchId || matchTracking || matchItem;
    }

    return matchesTab && matchesSearch;
  });

  // Calculate stats
  const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const inProductionCount = userOrders.filter(o => o.status === 'In Production (Embroidery)' || o.status === 'Quality Check').length;
  const dispatchedCount = userOrders.filter(o => o.status === 'Dispatched (Priority Air Express)').length;

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    addToast(`Tracking number ${tracking} copied to clipboard!`, 'success');
  };

  const handleSwitchAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    const nameToUse = inputName.trim() || inputEmail.split('@')[0];
    loginCustomer({
      uid: `usr-${Date.now()}`,
      email: inputEmail.trim(),
      displayName: nameToUse
    });
    setShowSwitchEmailModal(false);
    setInputEmail('');
    setInputName('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast("Please enter your name", "error");
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateCustomerProfile({
        displayName: profileName.trim(),
        phone: profilePhone.trim(),
        shippingAddress: profileAddress.trim(),
        cityCountry: profileCity.trim(),
        pincode: profilePincode.trim()
      });
      setShowProfileModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      addToast("Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusProgress = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending Approval': return 15;
      case 'In Production (Embroidery)': return 45;
      case 'Quality Check': return 70;
      case 'Dispatched (Priority Air Express)': return 88;
      case 'Delivered': return 100;
      case 'Cancelled': return 0;
      default: return 20;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'In Production (Embroidery)':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>In Production (Artisan Handwork)</span>
          </span>
        );
      case 'Quality Check':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quality & Bead Inspection</span>
          </span>
        );
      case 'Dispatched (Priority Air Express)':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatched Air Express</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Artisan Approval</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-500/10 text-neutral-400 border border-neutral-500/30">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#0d0d0d] pt-24 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Customer Profile Header */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-8 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white shadow-2xl border border-neutral-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-extrabold text-2xl flex items-center justify-center shadow-lg border border-amber-300 shrink-0">
                {currentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                    {currentName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/30">
                    VIP Client
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>Firebase Synced</span>
                  </span>
                </div>

                <p className="text-xs text-neutral-400 font-mono mt-1 flex flex-wrap items-center gap-2">
                  <span>{currentEmail}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="flex items-center gap-1 text-neutral-300 font-sans font-semibold">
                    <Phone className="w-3 h-3 text-amber-400" />
                    {customerUser?.phone || '+91 98765 12345'}
                  </span>
                  <span className="text-neutral-600">•</span>
                  <button 
                    onClick={() => setShowSwitchEmailModal(true)}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-sans text-xs font-semibold"
                  >
                    Switch Account
                  </button>
                </p>

                {/* Saved Address Preview */}
                <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-start gap-2 text-xs text-neutral-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-200">
                      {customerUser?.shippingAddress || '402 Mahalakshmi Complex, Ring Road'}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {customerUser?.cityCountry || 'Ahmedabad, Gujarat, India'} {customerUser?.pincode ? `- ${customerUser.pincode}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Edit Profile Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <div className="grid grid-cols-3 gap-3 flex-1 sm:flex-none">
                <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-3 text-center min-w-[90px]">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Orders</p>
                  <p className="text-lg font-extrabold text-amber-300 font-mono mt-0.5">{userOrders.length}</p>
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-3 text-center min-w-[90px]">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Workshop</p>
                  <p className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">{inProductionCount}</p>
                </div>
                <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-3 text-center min-w-[90px]">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">In Transit</p>
                  <p className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">{dispatchedCount}</p>
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(true)}
                className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border border-amber-300 shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile & Address</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-500" />
              <span>My Embroidery Orders & Live Status</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Track your artisan embroidery progress, air express shipping, and order history.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, SKU, Motif..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            All Orders ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'production'
                ? 'bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            In Production ({inProductionCount})
          </button>
          <button
            onClick={() => setActiveTab('dispatched')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'dispatched'
                ? 'bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            Air Dispatched ({dispatchedCount})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'delivered'
                ? 'bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            Delivered ({userOrders.filter(o => o.status === 'Delivered').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center shadow-lg">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
              No Orders Found for {currentEmail}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
              You don't have any embroidery design orders in this section. Explore our royal collections or place a custom order request with our master artisans.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage('collections')}
                className="px-6 py-3 bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span>Browse Couture Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSwitchEmailModal(true)}
                className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              >
                Check Orders Under Different Email
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const progressPct = getStatusProgress(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-neutral-100 dark:border-neutral-800 gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className="font-mono text-base font-extrabold text-neutral-900 dark:text-white">
                          #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                        
                        {/* Guest Verification Badge */}
                        {order.verificationInfo && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            order.verificationInfo.status.includes('Verified')
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}>
                            {order.verificationInfo.status}
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}>
                          Payment: {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        Placed on {new Date(order.orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-left lg:text-right">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Total Order Value</p>
                        <p className="text-xl font-serif font-extrabold text-amber-600 dark:text-amber-400">
                          {settings.currencySymbol}{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span>Specs / Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Progress Tracker */}
                  <div className="mb-8 bg-neutral-50 dark:bg-neutral-950/60 p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Crafting & Fulfillment Progress</span>
                      </span>
                      <span className="font-mono text-amber-500">{progressPct}% Complete</span>
                    </div>

                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden mb-4">
                      <div 
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className={`flex flex-col ${progressPct >= 15 ? 'text-amber-500 font-bold' : 'text-neutral-400'}`}>
                        <span>1. Order Placed</span>
                        <span className="text-[9px] font-normal text-neutral-400">Design Specifications</span>
                      </div>
                      <div className={`flex flex-col ${progressPct >= 45 ? 'text-amber-500 font-bold' : 'text-neutral-400'}`}>
                        <span>2. In Production</span>
                        <span className="text-[9px] font-normal text-neutral-400">Zari & Hand Embroidery</span>
                      </div>
                      <div className={`flex flex-col ${progressPct >= 70 ? 'text-amber-500 font-bold' : 'text-neutral-400'}`}>
                        <span>3. Quality Audit</span>
                        <span className="text-[9px] font-normal text-neutral-400">Stone & Sequin Check</span>
                      </div>
                      <div className={`flex flex-col ${progressPct >= 88 ? 'text-emerald-500 font-bold' : 'text-neutral-400'}`}>
                        <span>4. Air Dispatched</span>
                        <span className="text-[9px] font-normal text-neutral-400">Express Courier Delivery</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-4 mb-6">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      Ordered Embroidery Designs ({order.items.length})
                    </p>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-start gap-4">
                          <img
                            src={item.image}
                            alt={item.productTitle}
                            className="w-20 h-24 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-bold text-sm text-neutral-900 dark:text-white truncate">
                              {item.productTitle}
                            </h4>
                            {item.sku && (
                              <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                                SKU: {item.sku}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                              {item.fabric && (
                                <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                                  Fabric: {item.fabric}
                                </span>
                              )}
                              {item.color && (
                                <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                                  Color: {item.color}
                                </span>
                              )}
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-neutral-500 italic mt-1 bg-amber-500/5 p-1.5 rounded border border-amber-500/20">
                                Custom Note: {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                              {settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              ({settings.currencySymbol}{item.price.toLocaleString()} each)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Tracking Info Card */}
                  <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-2xl p-5 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Express Logistics: {order.courierName || 'DHL Air Express'}
                        </span>
                      </div>
                      {order.trackingNumber ? (
                        <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
                          <span>Tracking: {order.trackingNumber}</span>
                          <button
                            onClick={() => handleCopyTracking(order.trackingNumber!)}
                            className="p-1 hover:text-amber-400 transition-colors"
                            title="Copy Tracking Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400">Tracking code will be assigned upon air dispatch.</p>
                      )}
                      {order.estimatedDelivery && (
                        <p className="text-xs text-emerald-400 font-semibold">
                          Estimated Delivery: {order.estimatedDelivery}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {order.trackingNumber && (
                        <a
                          href={`https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Track Package</span>
                        </a>
                      )}
                      <button
                        onClick={() => openWhatsAppInquiry(undefined, `Hello Mahalakshmi Creation,\nI have an inquiry regarding my Order #${order.id} (${order.status}). Please update me on delivery.`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Support</span>
                      </button>
                    </div>
                  </div>

                  {/* International Order Protection System Banner */}
                  <div className="mt-4 p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 text-white space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                            International Order Protection System Record
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Permanent Firebase Evidence • Immutable Contract
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const { pdfBlob } = generateOrderAgreementPDF(order);
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(pdfBlob);
                          link.download = `Order_Agreement_${order.id}.pdf`;
                          link.click();
                          addToast(`Downloaded Order Agreement PDF for #${order.id}`, 'success');
                        }}
                        className="px-3.5 py-2 rounded-xl gold-gradient-bg text-neutral-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-102 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Agreement PDF</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                        <span className="text-[10px] text-neutral-400 font-mono uppercase block">Advance Requirement</span>
                        <p className="font-bold text-emerald-400 font-mono">
                          Required: ${order.advancePayment?.requiredAdvanceAmount?.toLocaleString() || Math.round(order.totalAmount * 0.5).toLocaleString()} USD
                        </p>
                        <p className="text-[10px] text-neutral-300">
                          Paid: ${order.advancePayment?.paidAdvanceAmount?.toLocaleString() || 0} USD
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                        <span className="text-[10px] text-neutral-400 font-mono uppercase block">Recorded IP & Network</span>
                        <p className="font-mono text-neutral-200 text-[11px] truncate" title={order.protectionMetadata?.ipAddress || 'Verified Node'}>
                          IP: {order.protectionMetadata?.ipAddress || '127.0.0.1'}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          Sig: {order.protectionMetadata?.digitalSignature || `SIG-${order.id}`}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                        <span className="text-[10px] text-neutral-400 font-mono uppercase block">Protection Lock Status</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Immutable Submission</span>
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          Submitted specifications locked for evidence integrity
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Edit Profile & Shipping Address Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 text-neutral-900 dark:text-white shadow-2xl space-y-6 border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-4 border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-white">
                      Edit Customer Profile & Shipping Address
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Persisted to Firebase Firestore database
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)} 
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Parmar Jaydip"
                    className="w-full p-3.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                    Email Address (Account Identifier)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentEmail}
                    className="w-full p-3.5 rounded-xl text-xs bg-neutral-200/60 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +91 98765 12345"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                    Shipping Address (Street / Building / Suite) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                    <textarea
                      rows={2}
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="e.g. 402 Mahalakshmi Complex, Ring Road"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                      City, State & Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="e.g. Ahmedabad, Gujarat, India"
                      className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                      Postal / Pincode
                    </label>
                    <input
                      type="text"
                      value={profilePincode}
                      onChange={(e) => setProfilePincode(e.target.value)}
                      placeholder="e.g. 380001"
                      className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-3 bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Saving to Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile to Firebase</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Switch Account Modal */}
        {showSwitchEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 text-neutral-900 dark:text-white shadow-2xl space-y-5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between border-b pb-3 border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-sm">Switch Account / Check Orders</span>
                </div>
                <button onClick={() => setShowSwitchEmailModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter your email address to view all embroidery design orders linked to your account.
              </p>

              {/* Quick Google Sign In */}
              <button
                type="button"
                onClick={() => {
                  loginCustomer({
                    uid: 'usr-google-8819',
                    email: 'parmarjaydip881987@gmail.com',
                    displayName: 'Parmar Jaydip'
                  });
                  setShowSwitchEmailModal(false);
                }}
                className="w-full py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold text-xs rounded-2xl border border-neutral-300 dark:border-neutral-700 shadow flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                </svg>
                <span>Continue as Parmar Jaydip (Google)</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800"></div>
                <span className="px-3 text-[10px] uppercase text-neutral-400 font-mono">Or Manual Email</span>
                <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>

              <form onSubmit={handleSwitchAccountSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="e.g. Parmar Jaydip"
                    className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                    Customer Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="e.g. parmarjaydip881987@gmail.com"
                    className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition-all"
                >
                  View My Orders
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Invoice / Specification Modal */}
        {selectedOrderForInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl p-8 text-neutral-900 dark:text-white shadow-2xl space-y-6 border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-4 border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">
                    Mahalakshmi Creation Specification Sheet
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">Invoice #{selectedOrderForInvoice.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrderForInvoice(null)} 
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Client Name</p>
                  <p className="font-bold text-neutral-900 dark:text-white">{selectedOrderForInvoice.customerName}</p>
                  <p className="text-neutral-500 font-mono">{selectedOrderForInvoice.customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Order Date & Payment</p>
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {new Date(selectedOrderForInvoice.orderDate).toLocaleDateString()}
                  </p>
                  <p className="text-amber-500 font-bold">{selectedOrderForInvoice.paymentStatus}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Itemized Specifications</p>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                  {selectedOrderForInvoice.items.map((item, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{item.productTitle}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">SKU: {item.sku} | Fabric: {item.fabric || 'Standard Silk'}</p>
                      </div>
                      <p className="font-bold font-mono text-amber-600 dark:text-amber-400">
                        Qty {item.quantity} × {settings.currencySymbol}{item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm font-bold">
                <span>Grand Total</span>
                <span className="font-serif text-lg text-amber-500">
                  {settings.currencySymbol}{selectedOrderForInvoice.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow"
                >
                  Print Specification Sheet
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
