import { FactoryProfile, Product, Order, QuoteRequest, Analytics, Catalogue } from '../types';

export const mockFactory: FactoryProfile = {
  id: 'FCT-001',
  name: 'Apex Textiles & Garments',
  category: 'Textile Manufacturers',
  gstNumber: '29ABCDE1234F1Z5',
  address: 'Plot 42, Industrial Area Phase 1, Bangalore, Karnataka',
  logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop&q=80',
  description: 'Leading manufacturer of premium cotton apparel and industrial workwear with over 20 years of export experience.',
  email: 'sales@apextextiles.com',
  phone: '+91 9988776655',
  paymentPreferences: {
    codEnabled: true,
    qrEnabled: true,
    upiQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=apexsales@axisbank%26pn=Apex%20Textiles%26am=0.00%26cu=INR', // Default simulated UPI pay qr
    bankQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bank://pay?acc=1234567890&ifsc=UTIB0001234',
    razorpayEnabled: true,
    razorpayKeyId: 'rzp_test_apex123',
    razorpaySecret: 'apex_secret_xyz789',
    razorpayAccountDetails: 'Apex Textiles Ltd - HDFC Current A/C 99008877665544',
    advancePaymentPercentage: 25, // 25% advance collection setup
    minimumOrderValue: 2000 // minimum shopping list order
  }
};

export const mockCatalogues: Catalogue[] = [
  {
    id: 'CAT-2026-SUM',
    name: 'Summer Collection 2026',
    description: 'Lightweight summer apparel and activewear for the upcoming season.',
    coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop&q=80',
    status: 'Live',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-15T14:30:00Z',
    views: 1240,
    ordersCount: 45,
    productIds: ['PRD-101', 'PRD-104'],
    analytics: {
      views: 1240,
      uniqueVisitors: 812,
      countries: [
        { name: 'India', count: 650 },
        { name: 'Bangladesh', count: 98 },
        { name: 'United Arab Emirates', count: 42 },
        { name: 'United States', count: 22 }
      ],
      cities: [
        { name: 'Bangalore', count: 320 },
        { name: 'Mumbai', count: 180 },
        { name: 'Delhi', count: 110 },
        { name: 'Dhaka', count: 98 },
        { name: 'Dubai', count: 42 }
      ],
      devices: { mobile: 742, desktop: 398, tablet: 100 },
      productClicks: [
        { productId: 'PRD-101', name: 'Premium Cotton Polo Shirt', clicks: 458 },
        { productId: 'PRD-104', name: 'Breathable Running T-Shirt', clicks: 312 }
      ],
      cartAdditions: 128,
      quoteRequests: 18
    }
  },
  {
    id: 'CAT-IND-01',
    name: 'Industrial Workwear',
    description: 'Heavy-duty uniforms and safety gear for factory floors.',
    coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop&q=80',
    status: 'Live',
    createdAt: '2026-03-12T09:15:00Z',
    updatedAt: '2026-04-20T11:00:00Z',
    views: 850,
    ordersCount: 112,
    productIds: ['PRD-102'],
    analytics: {
      views: 850,
      uniqueVisitors: 412,
      countries: [
        { name: 'India', count: 390 },
        { name: 'Germany', count: 12 },
        { name: 'United Kingdom', count: 10 }
      ],
      cities: [
        { name: 'Mumbai', count: 150 },
        { name: 'Chennai', count: 120 },
        { name: 'Bangalore', count: 80 },
        { name: 'Delhi', count: 40 }
      ],
      devices: { mobile: 310, desktop: 490, tablet: 50 },
      productClicks: [
        { productId: 'PRD-102', name: 'Industrial Safety Coverall', clicks: 395 }
      ],
      cartAdditions: 86,
      quoteRequests: 32
    }
  },
  {
    id: 'CAT-DRAFT-01',
    name: 'Winter Collection 2026',
    description: 'Upcoming winter styles. Still finalizing products.',
    coverImage: 'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?w=600&h=400&fit=crop&q=80',
    status: 'Draft',
    createdAt: '2026-05-28T16:20:00Z',
    updatedAt: '2026-05-30T10:05:00Z',
    views: 0,
    ordersCount: 0,
    productIds: ['PRD-103'],
    analytics: {
      views: 0,
      uniqueVisitors: 0,
      countries: [],
      cities: [],
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      productClicks: [],
      cartAdditions: 0,
      quoteRequests: 0
    }
  }
];

export const mockProducts: Product[] = [
  {
    id: 'PRD-101',
    name: 'Premium Cotton Polo Shirt',
    articleCode: 'POLO-2024-C',
    sku: 'APX-P-001',
    category: 'Apparel',
    description: 'High-quality 100% combed cotton polo shirt. Pre-shrunk and bio-washed for extra softness. Perfect for corporate uniforms.',
    material: '100% Cotton, 220 GSM',
    size: 'S, M, L, XL, XXL',
    color: 'Navy Blue, Black, White',
    moq: 100,
    offerPrice: 350,
    mrp: 599,
    availableQuantity: 5000,
    deliveryTimeDays: 7,
    images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'PRD-102',
    name: 'Industrial Safety Coverall',
    articleCode: 'SAFE-CVR-22',
    sku: 'APX-S-042',
    category: 'Workwear',
    description: 'Heavy-duty poly-cotton coverall with reflective tapes. Multiple utility pockets and reinforced stitching suitable for factory floors.',
    material: '65% Polyester, 35% Cotton',
    size: 'M, L, XL, XXL, 3XL',
    color: 'Orange, Royal Blue',
    moq: 50,
    offerPrice: 850,
    mrp: 1299,
    availableQuantity: 2000,
    deliveryTimeDays: 14,
    images: ['https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'PRD-103',
    name: 'Denim Jean Jacket - Classic',
    articleCode: 'DNM-JKT-C',
    sku: 'APX-D-011',
    category: 'Apparel',
    description: 'Classic fit denim jacket. Vintage wash with metallic button closures.',
    material: '100% Denim Cotton',
    size: 'S, M, L, XL',
    color: 'Vintage Wash Blue',
    moq: 200,
    offerPrice: 650,
    mrp: 1499,
    availableQuantity: 1500,
    deliveryTimeDays: 10,
    images: ['https://images.unsplash.com/photo-1495105718506-69cd1817dd90?w=600&h=600&fit=crop&q=80']
  },
  {
    id: 'PRD-104',
    name: 'Breathable Running T-Shirt',
    articleCode: 'SPORT-TS-01',
    sku: 'APX-SP-001',
    category: 'Sportswear',
    description: 'Moisture-wicking athletic t-shirt. Lightweight and breathable for intense workouts.',
    material: '100% Polyester Mesh',
    size: 'S, M, L, XL, XXL',
    color: 'Neon Green, Black, Grey',
    moq: 300,
    offerPrice: 210,
    mrp: 499,
    availableQuantity: 10000,
    deliveryTimeDays: 5,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80']
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-50012',
    date: '2026-05-28',
    customerName: 'Rajesh Kumar',
    companyName: 'Global Retailers Ltd',
    totalAmount: 35000,
    status: 'Production',
    items: [
      { product: mockProducts[0], quantity: 100 }
    ]
  },
  {
    id: 'ORD-50011',
    date: '2026-05-25',
    customerName: 'Sarah Jenkins',
    companyName: 'Safety First Supplies',
    totalAmount: 42500,
    status: 'Dispatched',
    items: [
      { product: mockProducts[1], quantity: 50 }
    ]
  },
  {
    id: 'ORD-50010',
    date: '2026-05-20',
    customerName: 'Amit Patel',
    companyName: 'Boutique Threads',
    totalAmount: 130000,
    status: 'Delivered',
    items: [
      { product: mockProducts[2], quantity: 200 }
    ]
  }
];

export const mockQuotes: QuoteRequest[] = [
  {
    id: 'RFQ-901',
    date: '2026-05-30',
    customerName: 'Vijay Singh',
    targetPrice: 320,
    status: 'Pending',
    product: mockProducts[0],
    quantity: 500,
    specialRequirements: 'Need logo embroidery on left chest. Standard packing.'
  },
  {
    id: 'RFQ-900',
    date: '2026-05-29',
    customerName: 'Elena Rodriguez',
    targetPrice: 200,
    status: 'Responded',
    product: mockProducts[3],
    quantity: 1000,
    specialRequirements: 'Custom neck label instead of standard tag.'
  }
];

export const mockAnalytics: Analytics = {
  totalCatalogues: 4,
  totalOrders: 156,
  pendingQuotations: 12,
  revenue: 8450000,
  recentEnquiries: 24
};
