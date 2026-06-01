export interface PaymentPreferences {
  codEnabled: boolean;
  qrEnabled: boolean;
  upiQrCode?: string; // Base64 UPI Image
  bankQrCode?: string; // Base64 Bank QR Image
  razorpayEnabled: boolean;
  razorpayKeyId?: string;
  razorpaySecret?: string;
  razorpayAccountDetails?: string;
  advancePaymentPercentage: number; // e.g. 0 means full collection, or 10, 25, 50
  minimumOrderValue: number; // minimum total amount to checkout
}

export interface FactoryProfile {
  id: string;
  name: string;
  category: string;
  gstNumber: string;
  address: string;
  logo: string;
  description: string;
  email?: string;
  phone?: string;
  paymentPreferences?: PaymentPreferences;
}

export interface CatalogueAnalytics {
  views: number;
  uniqueVisitors: number;
  countries: { name: string; count: number }[];
  cities: { name: string; count: number }[];
  devices: { mobile: number; desktop: number; tablet: number };
  productClicks: { productId: string; name: string; clicks: number }[];
  cartAdditions: number;
  quoteRequests: number;
}

export interface Catalogue {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  status: 'Live' | 'Draft' | 'Archived';
  createdAt: string;
  updatedAt: string;
  views: number;
  ordersCount: number;
  productIds: string[];
  visibility?: 'Public' | 'Password Protected' | 'Private';
  password?: string;
  expiryDate?: string;
  analytics?: CatalogueAnalytics;
}

export interface Product {
  id: string;
  name: string;
  articleCode: string;
  sku: string;
  category: string;
  description: string;
  material: string;
  size: string;
  color: string;
  moq: number;
  offerPrice: number;
  mrp: number;
  availableQuantity: number;
  deliveryTimeDays: number;
  images: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  companyName: string;
  totalAmount: number;
  status: 'Received' | 'Confirmed' | 'Production' | 'Quality Check' | 'Dispatched' | 'Delivered';
  items: CartItem[];
  catalogueId?: string;
  catalogueUrl?: string;
  
  // New details (Optional for backward compatibility with mock orders)
  mobileNumber?: string;
  altMobileNumber?: string;
  emailAddress?: string;
  gstNumber?: string;

  deliveryAddress?: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };

  orderInstructions?: {
    preferredDate?: string;
    timePreference?: string;
    specialInstructions?: string;
    loadingUnloading?: string;
  };

  logistics?: {
    transporterPreference?: string;
    pickupType: 'Self Pickup' | 'Factory Pickup' | 'Door Delivery';
  };

  pricingSummary?: {
    subtotal: number;
    freightCharges: number;
    taxes: number;
    total: number;
    advanceRequired?: number; 
  };

  payment?: {
    method: 'COD' | 'QR' | 'Razorpay';
    status: 'Pending' | 'Awaiting Verification' | 'Paid (Partial)' | 'Paid (Full)' | 'Rejected';
    screenshotUrl?: string; // QR Base64 screenshot proof
    paymentLinkId?: string;
    paymentId?: string;
    transactionId?: string;
    receiptNumber?: string;
    amountPaid?: number;
  };
}

export interface QuotationThreadMessage {
  id: string;
  sender: 'buyer' | 'factory';
  message: string;
  date: string;
  pricing?: {
    unitPrice?: number;
    quantity?: number;
    freight?: number;
    gst?: number;
    totalAmount?: number;
  };
}

export interface QuoteRequest {
  id: string;
  date: string;
  customerName: string;
  targetPrice: number;
  status: 'Pending' | 'Under Review' | 'Quotation Sent' | 'Responded' | 'Accepted' | 'Rejected' | 'Revision Requested';
  product: Product;
  quantity: number;
  specialRequirements: string;
  catalogueId?: string;
  catalogueUrl?: string;
  buyerDetails?: {
    companyName?: string;
    mobile?: string;
    email?: string;
    deliveryLocation?: string;
  };
  factoryResponse?: {
    unitPrice: number;
    quantity?: number;
    discount?: number;
    freight?: number;
    gst?: number;
    deliveryTimeline?: string;
    paymentTerms?: string;
    validUntil?: string;
    remarks?: string;
  };
  thread?: QuotationThreadMessage[];
}

export interface Analytics {
  totalCatalogues: number;
  totalOrders: number;
  pendingQuotations: number;
  revenue: number;
  recentEnquiries: number;
}

export interface CRMCustomer {
  id: string; // Customer ID
  name: string;
  companyName: string;
  contactPerson?: string;
  mobileNumber?: string;
  emailAddress?: string;
  gstNumber?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  leadStatus: 'New Lead' | 'Contacted' | 'Interested' | 'Quotation Sent' | 'Negotiation' | 'Order Received' | 'Converted' | 'Lost';
  totalOrders: number;
  totalOrderValue: number;
  lastInteraction: string; // ISO date-time string
  paymentStatus?: 'Pending' | 'Paid (Partial)' | 'Paid (Full)' | 'Outstanding' | 'None';
  createdAt?: string;
}

export interface CRMLead {
  id: string;
  customerId: string;
  customerName: string;
  companyName?: string;
  email?: string;
  mobile?: string;
  source: 'Catalogue View' | 'Quotation Requested' | 'Added to Cart' | 'Enquiry Submitted' | string;
  status: 'New Lead' | 'Contacted' | 'Interested' | 'Quotation Sent' | 'Negotiation' | 'Order Received' | 'Converted' | 'Lost';
  date: string; // YYYY-MM-DD
  notes?: string;
  assignedUser?: string;
  catalogueId?: string;
}

export interface CRMActivity {
  id: string;
  customerId: string;
  date: string; // YYYY-MM-DD or ISO
  type: 'Catalogue Viewed' | 'Product Viewed' | 'Quotation Requested' | 'Quotation Sent' | 'Order Placed' | 'Payment Received' | 'Order Dispatched' | 'Delivered' | 'Manual Log' | 'WhatsApp Sent' | 'Email Sent' | 'Follow-up Scheduled' | 'Task Completed' | string;
  description: string;
  catalogueName?: string;
  productName?: string;
  details?: string;
}

export interface CRMNote {
  id: string;
  customerId: string;
  author: string;
  note: string;
  createdAt: string; // ISO string
}

export interface CRMTask {
  id: string;
  customerId?: string;
  customerName?: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Low' | 'Medium' | 'High';
  assignedUser: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface CRMCommunication {
  id: string;
  customerId?: string;
  type: 'WhatsApp' | 'Email';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  recipient: string;
  subject?: string;
  message: string;
  deliveryStatus: 'Sent' | 'Delivered' | 'Failed';
}

export interface TransactionLog {
  id: string;
  category: 'Catalogue' | 'Sales' | 'Order' | 'Payment' | 'Communication';
  type: 'Catalogue Viewed' | 'Product Viewed' | 'Product Shared' | 'Cart Created' | 'Cart Updated' | 'Quote Requested' | 'Quote Sent' | 'Quote Accepted' | 'Order Created' | 'Order Confirmed' | 'Order Modified' | 'Order Cancelled' | 'Payment Link Generated' | 'QR Payment Submitted' | 'Payment Verified' | 'COD Selected' | 'Refund Issued' | 'WhatsApp Sent' | 'Email Sent' | 'Follow-up Sent';
  description: string;
  timestamp: string; // ISO string
  metadata?: {
    customerId?: string;
    customerName?: string;
    orderId?: string;
    quoteId?: string;
    catalogueId?: string;
    productId?: string;
    productName?: string;
    amount?: number;
  };
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  name: string;
  type: 'Invoice' | 'PO' | 'Delivery Challan' | 'Payment Proof';
  date: string; // YYYY-MM-DD
  url?: string;
  fileSize?: string;
}

export interface PaymentLog {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'COD' | 'QR' | 'Razorpay' | string;
  status: 'Pending' | 'Received' | 'Refunded' | string;
  date: string; // YYYY-MM-DD
  orderId?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  ipAddress: string;
}
