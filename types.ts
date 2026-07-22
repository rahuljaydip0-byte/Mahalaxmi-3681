export type WorkType = 
  | 'Hand Embroidery'
  | 'Machine Embroidery'
  | 'Mirror Work'
  | 'Stone Work'
  | 'Zari Work'
  | 'Sequins Work'
  | 'Custom Embroidery'
  | 'Cutwork Embroidery'
  | 'Gota Patti'
  | 'Resham Embroidery';

export type ProductCategory = 
  | 'Neck Embroidery'
  | 'Front Panel'
  | 'Back Design'
  | 'Sleeves'
  | 'Dupatta Border'
  | 'Full Suit Embroidery'
  | 'Bridal Embroidery'
  | 'Arabic Floral Embroidery'
  | 'International Collection'
  | 'Luxury Collection'
  | 'Mirror Work'
  | 'Stone Work'
  | 'Zari Work'
  | 'Sequins Work'
  | 'Hand Embroidery'
  | 'Machine Embroidery'
  | 'Custom Embroidery';

export type CollectionName = 
  | 'Bridal Collection'
  | 'International Collection'
  | 'Luxury Collection'
  | 'Royal Heritage'
  | 'Velvet Couture'
  | 'Silk Resonance'
  | 'Festival Elegance'
  | 'Modern Arabic';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface VirtualModelView {
  viewType: 'front' | 'side' | 'back' | 'detail';
  label: string;
  imageUrl: string;
}

export interface VirtualModelTryOn {
  detectedClothingType: string;
  detectedGender: 'men' | 'women' | 'kids';
  imageSourceType: 'flat_lay' | 'folded' | 'hanging' | 'mannequin' | 'cutout' | 'model';
  originalImage: string;
  modelViews: VirtualModelView[];
  generatedAt: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: ProductCategory;
  collections: CollectionName[];
  price: number;
  originalPrice?: number;
  description: string;
  fabric: string;
  workType: WorkType[];
  images: string[];
  model3dUrl?: string; // 3D GLB/GLTF Model URL for immersive 3D viewer
  virtualModel?: VirtualModelTryOn;
  aiGeneratedImages?: string[];
  threeSixtyImages?: string[]; // Frame URLs for 360 viewer
  videoUrl?: string;
  availableColors: ProductColor[];
  availableSizes: string[];
  isNewArrival?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  minOrderQty?: number;
}

export interface CategoryItem {
  id: string;
  name: ProductCategory;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

export interface CollectionItem {
  id: string;
  name: CollectionName;
  tagline: string;
  description: string;
  bannerImage: string;
  productCount: number;
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  type: 'image' | 'video';
  description?: string;
  createdAt: string;
}

export interface VideoShowcaseItem {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  duration?: string;
  featured?: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  tag: string;
  active: boolean;
}

export interface CustomerReview {
  id: string;
  clientName: string;
  location: string;
  rating: number;
  comment: string;
  productTitle?: string;
  avatarUrl?: string;
  verifiedPurchase: boolean;
  createdAt: string;
  status: 'approved' | 'pending';
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  productTitle?: string;
  productSku?: string;
  message: string;
  status: 'new' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface WebsiteSettings {
  brandName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  cityCountry: string;
  businessHours: string;
  announcementText: string;
  showAnnouncement: boolean;
  instagramUrl: string;
  facebookUrl: string;
  pinterestUrl: string;
  youtubeUrl: string;
  metaTitle: string;
  metaDescription: string;
  currencySymbol: string;
  currencyCode: string;
  catalogDownloadUrl?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin';
  lastLogin?: string;
}

export interface CustomerUser {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  shippingAddress?: string;
  cityCountry?: string;
  pincode?: string;
  avatarUrl?: string;
}

export type OrderStatus = 
  | 'Pending Admin Approval'
  | 'Approved'
  | 'Rejected'
  | 'More Information Requested'
  | 'Inquiry'
  | 'Quote Sent'
  | 'Quote Accepted'
  | 'Advance Paid'
  | 'Production Started'
  | 'Ready'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Pending Approval'
  | 'In Production (Embroidery)'
  | 'Quality Check'
  | 'Dispatched (Priority Air Express)'
  | 'Cancelled';

export interface GuestVerificationInfo {
  method: 'email' | 'whatsapp';
  status: 'Pending Verification' | 'Email Verified ✅' | 'WhatsApp Verified ✅' | 'Approved' | 'Rejected' | 'More Info Requested';
  verifiedAt?: string;
  otpCode?: string;
  ipAddress?: string;
  deviceInfo?: string;
  browser?: string;
  attemptsCount: number;
  resendAvailableAt?: string;
  expiresAt?: string;
  whatsappNumber?: string;
  adminApprovalStatus?: 'Pending Admin Approval' | 'Approved' | 'Rejected' | 'More Info Requested';
  adminNotes?: string;
  
  // Anti-Fake & Risk Scoring
  riskScore?: number; // 0-100
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  isDisposableEmail?: boolean;
  isPhoneValid?: boolean;
  isBotVerified?: boolean;
  rateLimitExceeded?: boolean;
  rejectionReason?: string;
}

export interface InternationalProtectionMetaData {
  fullName: string;
  companyName?: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  country: string;
  ipAddress: string;
  deviceInfo: string;
  timestamp: string;
  termsAccepted: boolean;
  termsAcceptedAt: string;
  digitalSignature?: string;
}

export interface OrderAgreementDocument {
  agreementId: string;
  generatedAt: string;
  hash: string;
  pdfUrl?: string;
}

export interface OrderCommunicationRecord {
  id: string;
  type: 'chat' | 'inquiry' | 'quotation' | 'invoice' | 'receipt' | 'status_change';
  sender: 'customer' | 'admin' | 'system';
  title: string;
  content: string;
  fileUrl?: string;
  amount?: number;
  timestamp: string;
}

export interface OrderAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: 'admin' | 'customer' | 'system';
  action: string;
  previousStatus?: string;
  newStatus?: string;
  details: string;
  ipAddress?: string;
}

export interface AdvancePaymentRecord {
  requiredAdvanceAmount: number;
  paidAdvanceAmount: number;
  advancePaidAt?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  transactionReference?: string;
  isAdvanceConfirmed: boolean;
}

export interface OrderDeletionAuditLog {
  id: string;
  orderId: string;
  deletedBy: string;
  deletedAt: string;
  ipAddress: string;
  reason: string;
  actionType: 'moved_to_trash' | 'restored' | 'permanently_deleted' | 'bulk_trash_cleared';
  backupSnapshot: Order;
  verificationMethodUsed?: 'Admin Password' | 'Email OTP' | '2FA Authenticator';
}

export interface OrderItem {
  productId?: string;
  productTitle: string;
  sku?: string;
  image: string;
  quantity: number;
  price: number;
  fabric?: string;
  color?: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  whatsappNumber?: string;
  companyName?: string;
  billingAddress?: string;
  shippingAddress?: string;
  country?: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: 'Paid' | 'Advance Received' | 'Pending';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  notes?: string;
  
  // Trash & Secure Deletion Fields
  isTrashed?: boolean;
  trashedAt?: string;
  trashedBy?: string;
  trashReason?: string;

  // Guest Verification & Protection System Fields
  verificationInfo?: GuestVerificationInfo;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  protectionMetadata?: InternationalProtectionMetaData;
  agreementDocument?: OrderAgreementDocument;
  communications?: OrderCommunicationRecord[];
  auditLogs?: OrderAuditLog[];
  advancePayment?: AdvancePaymentRecord;
  isLockedByProtection?: boolean;
}

export type PageRoute = 
  | 'home'
  | 'collections'
  | 'categories'
  | 'international'
  | 'bridal'
  | 'luxury'
  | 'new-arrivals'
  | 'gallery'
  | 'product-detail'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'faq'
  | 'wishlist'
  | 'orders'
  | 'admin'
  | '404';

export type PageNav = PageRoute;

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedCollection: string;
  selectedWorkType: string;
  sortBy: 'newest' | 'trending' | 'popular' | 'alphabetical' | 'price-low' | 'price-high';
  priceRange: [number, number];
}
