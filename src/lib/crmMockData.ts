import { CRMCustomer, CRMLead, CRMActivity, CRMNote, CRMTask, CRMCommunication, TransactionLog, CustomerDocument, PaymentLog, AuditLog } from '../types';

export const mockCRMCustomers: CRMCustomer[] = [
  {
    id: 'CUST-100201',
    name: 'ABC Traders',
    companyName: 'ABC Traders Private Limited',
    contactPerson: 'Abhishek Roy',
    mobileNumber: '9885544332',
    emailAddress: 'abhishek@abctraders.com',
    gstNumber: '29ABBCC1122D1Z4',
    address: '42, Brigade Road, MG Road Area',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    leadStatus: 'Order Received',
    totalOrders: 4,
    totalOrderValue: 145000,
    lastInteraction: '2026-05-31T11:45:00Z',
    paymentStatus: 'Paid (Partial)'
  },
  {
    id: 'CUST-100202',
    name: 'Zenith Wholesale',
    companyName: 'Zenith Global Fabrics Ltd',
    contactPerson: 'Zayn Malik',
    mobileNumber: '8776655443',
    emailAddress: 'procurement@zenithfabrics.com',
    gstNumber: '27AABBCC9988E2Z6',
    address: 'Sector 4, MIDC Industrial Area, Mahape',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    leadStatus: 'Negotiation',
    totalOrders: 2,
    totalOrderValue: 285000,
    lastInteraction: '2026-05-30T16:20:00Z',
    paymentStatus: 'Outstanding'
  },
  {
    id: 'CUST-100203',
    name: 'Apex Retail Store',
    companyName: 'Apex Clothing Retailers',
    contactPerson: 'Preeti Sharma',
    mobileNumber: '9988112233',
    emailAddress: 'preeti@apexclothing.in',
    gstNumber: '07GGHHJ4455K3Z7',
    address: 'Connaught Place, Inner Circle',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    leadStatus: 'Quotation Sent',
    totalOrders: 1,
    totalOrderValue: 48000,
    lastInteraction: '2026-05-29T14:10:00Z',
    paymentStatus: 'Paid (Full)'
  },
  {
    id: 'CUST-100204',
    name: 'South Distributors',
    companyName: 'South Garments Distributor Pool',
    contactPerson: 'Ravi Teja',
    mobileNumber: '9122334455',
    emailAddress: 'ravi@southdistributors.com',
    gstNumber: '36HHJJG5566M4Z2',
    address: 'Gachibowli, Financial District',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    leadStatus: 'Interested',
    totalOrders: 0,
    totalOrderValue: 0,
    lastInteraction: '2026-05-28T09:30:00Z',
    paymentStatus: 'None'
  },
  {
    id: 'CUST-100205',
    name: 'Kolkata Saree House',
    companyName: 'Kolkata Saree Emporium',
    contactPerson: 'Subhasish Bose',
    mobileNumber: '9833445566',
    emailAddress: 'subhasish@sareeemporium.com',
    gstNumber: '19AAFFG8899N9Z9',
    address: 'College Street, Bowbazar',
    country: 'India',
    state: 'West Bengal',
    city: 'Kolkata',
    leadStatus: 'Converted',
    totalOrders: 3,
    totalOrderValue: 320000,
    lastInteraction: '2026-05-27T17:05:00Z',
    paymentStatus: 'Paid (Full)'
  }
];

export const mockCRMLeads: CRMLead[] = [
  {
    id: 'LEAD-100201',
    customerId: 'CUST-100201',
    customerName: 'Abhishek Roy',
    companyName: 'ABC Traders Private Limited',
    email: 'abhishek@abctraders.com',
    mobile: '9885544332',
    source: 'Catalogue View',
    status: 'Order Received',
    date: '2026-05-12',
    notes: 'Viewed catalogue Summer Collection multiple times.',
    assignedUser: 'Sachin Sharma'
  },
  {
    id: 'LEAD-100202',
    customerId: 'CUST-100202',
    customerName: 'Zayn Malik',
    companyName: 'Zenith Global Fabrics Ltd',
    email: 'procurement@zenithfabrics.com',
    mobile: '8776655443',
    source: 'Quotation Requested',
    status: 'Negotiation',
    date: '2026-05-13',
    notes: 'Requested quotation with high quantity B2B discounts.',
    assignedUser: 'Sachin Sharma'
  },
  {
    id: 'LEAD-100203',
    customerId: 'CUST-100203',
    customerName: 'Preeti Sharma',
    companyName: 'Apex Clothing Retailers',
    email: 'preeti@apexclothing.in',
    mobile: '9988112233',
    source: 'Added to Cart',
    status: 'Quotation Sent',
    date: '2026-05-14',
    notes: 'Cart items saved. Followed up with pricing matrix.',
    assignedUser: 'Admin Team'
  },
  {
    id: 'LEAD-100204',
    customerId: 'CUST-100204',
    customerName: 'Ravi Teja',
    companyName: 'South Garments Distributor Pool',
    email: 'ravi@southdistributors.com',
    mobile: '9122334455',
    source: 'Enquiry Submitted',
    status: 'Interested',
    date: '2026-05-15',
    notes: 'Interested in Cotton Polo bulk manufacturing.',
    assignedUser: 'Unassigned'
  },
  {
    id: 'LEAD-100205',
    customerId: 'CUST-100205',
    customerName: 'Subhasish Bose',
    companyName: 'Kolkata Saree Emporium',
    email: 'subhasish@sareeemporium.com',
    mobile: '9833445566',
    source: 'Catalogue View',
    status: 'Converted',
    date: '2026-05-10',
    notes: 'Closed bulk workwear contract.',
    assignedUser: 'Sachin Sharma'
  }
];

export const mockCRMActivities: CRMActivity[] = [
  // Chronological timeline for individual ABC Traders
  {
    id: 'ACT-9001',
    customerId: 'CUST-100201',
    date: '2026-05-12',
    type: 'Catalogue Viewed',
    description: 'Catalogue "Summer Collection 2026" Viewed',
    catalogueName: 'Summer Collection 2026'
  },
  {
    id: 'ACT-9002',
    customerId: 'CUST-100201',
    date: '2026-05-12',
    type: 'Product Viewed',
    description: 'Product "Premium Cotton Polo Shirt" viewed from share link',
    productName: 'Premium Cotton Polo Shirt'
  },
  {
    id: 'ACT-9003',
    customerId: 'CUST-100201',
    date: '2026-05-13',
    type: 'Quotation Requested',
    description: 'Quotation Requested for 150 Cotton Polo Shirts (Target: ₹340)',
    productName: 'Premium Cotton Polo Shirt',
    details: 'Quantity: 150 items. Special: Custom Logo embroidery requested.'
  },
  {
    id: 'ACT-9004',
    customerId: 'CUST-100201',
    date: '2026-05-14',
    type: 'Quotation Sent',
    description: 'Approved wholesale quote of ₹360 with custom embroidery Sent to Buyer via email and WhatsApp.',
    details: 'Sent by: Sachin Sharma'
  },
  {
    id: 'ACT-9005',
    customerId: 'CUST-100201',
    date: '2026-05-15',
    type: 'Order Placed',
    description: 'Order placed matching RFQ agreement (Invoice Value: ₹54,000)',
    details: 'Order ID: ORD-50102'
  },
  {
    id: 'ACT-9006',
    customerId: 'CUST-100201',
    date: '2026-05-15',
    type: 'Payment Received',
    description: 'Advance payment of 25% verified via UPI QR ScreenProof (₹13,500)',
    details: 'Screenshot verified by accounting.'
  },
  {
    id: 'ACT-9007',
    customerId: 'CUST-100201',
    date: '2026-05-17',
    type: 'Order Dispatched',
    description: 'Wholesale shipment dispatched via VRL Logistics',
    details: 'Challan ID: CHAL-9201. Consignment ID: VRL-BLR-0021'
  },
  {
    id: 'ACT-9008',
    customerId: 'CUST-100201',
    date: '2026-05-18',
    type: 'Delivered',
    description: 'Shipment delivered and bulk delivery proof verified at Roy Warehousing CP.',
    details: 'Completed by door cargo agent.'
  }
];

export const mockCRMNotes: CRMNote[] = [
  {
    id: 'NTE-2026-1',
    customerId: 'CUST-100201',
    author: 'Sachin Sharma',
    note: 'Spoke with Roy. They might need an extra batch of 200 light blue shirts by June. Keep dye mixtures ready.',
    createdAt: '2026-05-16T10:00:00Z'
  },
  {
    id: 'NTE-2026-2',
    customerId: 'CUST-100202',
    author: 'Admin Team',
    note: 'Demanding the maximum wholesale volume discount of 35%. Margins are tight. Negotiate on standard logistics payment terms.',
    createdAt: '2026-05-29T11:30:00Z'
  }
];

export const mockCRMTasks: CRMTask[] = [
  {
    id: 'TSK-301',
    customerId: 'CUST-100201',
    customerName: 'Abhishek Roy',
    title: 'Confirm dispatch of light blue polo custom batch',
    dueDate: '2026-06-03',
    priority: 'High',
    assignedUser: 'Sachin Sharma',
    status: 'Pending'
  },
  {
    id: 'TSK-302',
    customerId: 'CUST-100202',
    customerName: 'Zayn Malik',
    title: 'Follow up quotation and finalize bulk price',
    dueDate: '2026-06-02',
    priority: 'Medium',
    assignedUser: 'Sachin Sharma',
    status: 'In Progress'
  },
  {
    id: 'TSK-303',
    customerId: 'CUST-100203',
    customerName: 'Preeti Sharma',
    title: 'Collect payment balance invoice 202-A',
    dueDate: '2026-06-05',
    priority: 'High',
    assignedUser: 'Finance Team',
    status: 'Pending'
  }
];

export const mockCommunications: CRMCommunication[] = [
  {
    id: 'COM-401',
    customerId: 'CUST-100201',
    type: 'WhatsApp',
    date: '2026-05-14',
    time: '11:45 AM',
    recipient: '+91 9885544332',
    message: 'Hello Abhishek, we have approved your RFQ for 150 Cotton Polos. The special rate will be ₹360 per item with logo stitching. Click here to confirm order.',
    deliveryStatus: 'Delivered'
  },
  {
    id: 'COM-402',
    customerId: 'CUST-100201',
    type: 'Email',
    date: '2026-05-14',
    time: '11:50 AM',
    recipient: 'abhishek@abctraders.com',
    subject: 'Quotation Offer - RFQ-901 Cotton Polo Bulk',
    message: 'Dear Roy, Please find attached the wholesale contract for your Cotton Polo requirements...',
    deliveryStatus: 'Sent'
  },
  {
    id: 'COM-403',
    customerId: 'CUST-100202',
    type: 'WhatsApp',
    date: '2026-05-30',
    time: '04:15 PM',
    recipient: '+91 8776655443',
    message: 'Hi Zayn Malik, I sent over the fabric density guidelines we talked about. Please let me know your thoughts.',
    deliveryStatus: 'Delivered'
  }
];

export const mockTransactionLogs: TransactionLog[] = [
  {
    id: 'TLOG-1',
    category: 'Catalogue',
    type: 'Catalogue Viewed',
    description: 'Catalogue "Summer Collection 2026" was viewed by buyer from Bangalore.',
    timestamp: '2026-05-31T17:15:00Z',
    metadata: { catalogueId: 'CAT-2026-SUM' }
  },
  {
    id: 'TLOG-2',
    category: 'Sales',
    type: 'Cart Created',
    description: 'B2B Cart initiated for Apex Retail Store containing PRD-101 (200 units).',
    timestamp: '2026-05-31T16:40:00Z',
    metadata: { customerName: 'Apex Retail Store', amount: 98000 }
  },
  {
    id: 'TLOG-3',
    category: 'Sales',
    type: 'Quote Requested',
    description: 'RFQ-912 submitted for Industrial Coveralls by ABC Traders.',
    timestamp: '2026-05-31T11:45:00Z',
    metadata: { customerName: 'ABC Traders', amount: 54000 }
  },
  {
    id: 'TLOG-4',
    category: 'Payment',
    type: 'Payment Verified',
    description: 'UPI QR screenshot verified for ₹13,500 advance for ORD-50102.',
    timestamp: '2026-05-31T11:30:00Z',
    metadata: { orderId: 'ORD-50102', amount: 13500 }
  },
  {
    id: 'TLOG-5',
    category: 'Order',
    type: 'Order Confirmed',
    description: 'ORD-50102 has been flagged as confirmed and dispatched to shopfloor queue.',
    timestamp: '2026-05-31T10:15:00Z',
    metadata: { orderId: 'ORD-50102' }
  },
  {
    id: 'TLOG-6',
    category: 'Communication',
    type: 'WhatsApp Sent',
    description: 'Follow-up WhatsApp message sent to Preeti Sharma regarding pending payment.',
    timestamp: '2026-05-31T09:00:00Z',
    metadata: { customerName: 'Preeti Sharma' }
  }
];

export const mockCustomerDocuments: CustomerDocument[] = [
  {
    id: 'DOC-501',
    customerId: 'CUST-100201',
    name: 'Invoice_ORD-50102.pdf',
    type: 'Invoice',
    date: '2026-05-15',
    url: '#',
    fileSize: '142 KB'
  },
  {
    id: 'DOC-502',
    customerId: 'CUST-100201',
    name: 'PO_RoyTraders_442.pdf',
    type: 'PO',
    date: '2026-05-13',
    url: '#',
    fileSize: '88 KB'
  },
  {
    id: 'DOC-503',
    customerId: 'CUST-100202',
    name: 'DeliveryChallan_ZNT_82.pdf',
    type: 'Delivery Challan',
    date: '2026-05-28',
    url: '#',
    fileSize: '210 KB'
  }
];

export const mockPaymentLogs: PaymentLog[] = [
  {
    id: 'PAYG-101',
    customerId: 'CUST-100201',
    customerName: 'ABC Traders',
    amount: 13500,
    method: 'QR',
    status: 'Received',
    date: '2026-05-15',
    orderId: 'ORD-50102'
  },
  {
    id: 'PAYG-102',
    customerId: 'CUST-100202',
    customerName: 'Zenith Wholesale',
    amount: 72000,
    method: 'Razorpay',
    status: 'Received',
    date: '2026-05-28',
    orderId: 'ORD-50103'
  },
  {
    id: 'PAYG-103',
    customerId: 'CUST-100203',
    customerName: 'Apex Retail Store',
    amount: 48000,
    method: 'COD',
    status: 'Pending',
    date: '2026-05-30',
    orderId: 'ORD-50104'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-3105-1',
    user: 'Sachin Sharma',
    action: 'Updated Price of Product MCS101',
    date: '2026-05-31',
    time: '11:45 AM',
    ipAddress: '192.168.1.55'
  },
  {
    id: 'AUD-3105-2',
    user: 'Sachin Sharma',
    action: 'Created Shared Catalogue B2B Link "Summer Season 2026"',
    date: '2026-05-31',
    time: '10:30 AM',
    ipAddress: '192.168.1.55'
  },
  {
    id: 'AUD-3005-1',
    user: 'Sachin Sharma',
    action: 'Verified QR Payment Screenshot for ORD-50102',
    date: '2026-05-30',
    time: '04:20 PM',
    ipAddress: '192.168.1.21'
  }
];
