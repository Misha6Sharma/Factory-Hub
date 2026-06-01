import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  QuoteRequest, 
  FactoryProfile, 
  Analytics, 
  Catalogue,
  CRMCustomer,
  CRMLead,
  CRMActivity,
  CRMNote,
  CRMTask,
  CRMCommunication,
  TransactionLog,
  CustomerDocument,
  PaymentLog,
  AuditLog
} from '../types';
import { mockProducts, mockOrders, mockQuotes, mockFactory, mockAnalytics, mockCatalogues } from './data';
import { 
  mockCRMCustomers, 
  mockCRMLeads, 
  mockCRMActivities, 
  mockCRMNotes, 
  mockCRMTasks, 
  mockCommunications, 
  mockTransactionLogs, 
  mockCustomerDocuments, 
  mockPaymentLogs, 
  mockAuditLogs 
} from './crmMockData';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

interface StoreContextType {
  factory: FactoryProfile;
  products: Product[];
  catalogues: Catalogue[];
  orders: Order[];
  quotes: QuoteRequest[];
  analytics: Analytics;
  cart: CartItem[];
  currentUser: User | null;
  authLoading: boolean;
  activeCatalogueId: string | null;
  selectCatalogue: (catalogueId: string) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => Promise<void>;
  createCatalogue: (catalogue: Catalogue) => Promise<void>;
  deleteCatalogue: (catalogueId: string) => Promise<void>;
  updateCatalogue: (catalogue: Catalogue) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  placeOrder: (orderData: Partial<Order>) => Promise<string>;
  requestQuote: (quote: any) => Promise<void>;
  replyQuote?: (quoteId: string, response: any) => Promise<void>; // Make optional to not break anything temporarily
  updateQuoteStatus?: (quoteId: string, status: any) => Promise<void>;
  updateFactoryProfile: (factoryProfile: FactoryProfile) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  trackCatalogueView: (catalogueId: string) => Promise<void>;
  trackProductClick: (catalogueId: string, productId: string, productName: string) => Promise<void>;
  trackCartAddition: (catalogueId: string) => Promise<void>;
  trackQuoteRequest: (catalogueId: string) => Promise<void>;

  // CRM State
  customers: CRMCustomer[];
  leads: CRMLead[];
  crmActivities: CRMActivity[];
  crmNotes: CRMNote[];
  crmTasks: CRMTask[];
  communications: CRMCommunication[];
  transactionLogs: TransactionLog[];
  documents: CustomerDocument[];
  paymentLogs: PaymentLog[];
  auditLogs: AuditLog[];

  // CRM Mutations & Communication tools
  addCRMNote: (customerId: string, note: string) => Promise<void>;
  addCRMTask: (task: Partial<CRMTask>) => Promise<void>;
  updateCRMTask: (task: CRMTask) => Promise<void>;
  deleteCRMTask: (taskId: string) => Promise<void>;
  addCRMDocument: (doc: CustomerDocument) => Promise<void>;
  deleteCRMDocument: (docId: string) => Promise<void>;
  updateLeadStatus: (leadId: string, status: any) => Promise<void>;
  addCRMActivity: (activity: Partial<CRMActivity>) => Promise<void>;
  addAuditLog: (action: string) => Promise<void>;
  sendCRMWhatsApp: (customerId: string, recipient: string, msg: string) => Promise<void>;
  sendCRMEmail: (customerId: string, recipient: string, subject: string, msg: string) => Promise<void>;
  updateSalesPipelineStage: (leadId: string, stage: string) => Promise<void>;
  submitEnquiry: (enquiry: { name: string; companyName: string; email: string; mobile: string; message: string; catalogueId?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        newObj[key] = cleanUndefined(val);
      }
    }
    return newObj as T;
  }
  return obj;
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [factory, setFactory] = useState<FactoryProfile>(mockFactory);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [catalogues, setCatalogues] = useState<Catalogue[]>(mockCatalogues);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [quotes, setQuotes] = useState<QuoteRequest[]>(mockQuotes);
  const [cart, setCart] = useState<CartItem[]>([]);

  // CRM State Hooks
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [crmActivities, setCrmActivities] = useState<CRMActivity[]>([]);
  const [crmNotes, setCrmNotes] = useState<CRMNote[]>([]);
  const [crmTasks, setCrmTasks] = useState<CRMTask[]>([]);
  const [communications, setCommunications] = useState<CRMCommunication[]>([]);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeCatalogueId, setActiveCatalogueId] = useState<string | null>(() => {
    return localStorage.getItem('active_catalogue_id');
  });

  const selectCatalogue = (catalogueId: string) => {
    const previousId = localStorage.getItem('active_catalogue_id');
    if (previousId && previousId !== catalogueId) {
      // Clear cart on catalogue change (Multi-catalogue protection to prevent product mixing across catalogues)
      setCart([]);
    }
    setActiveCatalogueId(catalogueId);
    localStorage.setItem('active_catalogue_id', catalogueId);
    sessionStorage.setItem('active_catalogue_id', catalogueId);
    
    // Also save the full requested object
    const catalogue = catalogues.find(c => c.id === catalogueId);
    const slug = catalogue ? catalogue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : catalogueId;
    const catalogueData = {
      catalogueId: catalogueId,
      catalogueSlug: slug,
      catalogueUrl: window.location.pathname.startsWith('/catalogue') ? `/catalogue/${catalogueId}` : `/store/c/${catalogueId}`
    };
    localStorage.setItem('active_catalogue', JSON.stringify(catalogueData));
    sessionStorage.setItem('active_catalogue', JSON.stringify(catalogueData));
    
    // Also store cart_context linked to Factory ID and Catalogue ID
    const cartContext = {
      cartId: localStorage.getItem('cart_context') ? JSON.parse(localStorage.getItem('cart_context')!).cartId : `CART-${Math.floor(1000 + Math.random() * 9000)}`,
      factoryId: factory.id || 'FAC001',
      catalogueId: catalogueId
    };
    localStorage.setItem('cart_context', JSON.stringify(cartContext));
    sessionStorage.setItem('cart_context', JSON.stringify(cartContext));
  };

  // Test connection on boot according to skill
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'factory', 'profile'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.error("Please check your Firebase configuration or network status.");
        }
      }
    }
    testConnection();
  }, []);

  // 1. Sync public states in real-time from Firestore
  useEffect(() => {
    // 1. Factory Profile
    const unsubFactory = onSnapshot(doc(db, 'factory', 'profile'), (snapshot) => {
      if (snapshot.exists()) {
        setFactory(snapshot.data() as FactoryProfile);
      }
    }, (err) => {
      console.warn("Factory profile read connection restricted or unpopulated:", err.message);
    });

    // 2. Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Product);
      });
      if (list.length > 0) {
        setProducts(list);
      }
    }, (err) => {
      console.warn("Products read connections restricted or empty:", err.message);
    });

    // 3. Catalogues
    const unsubCatalogues = onSnapshot(collection(db, 'catalogues'), (snapshot) => {
      const list: Catalogue[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Catalogue);
      });
      if (list.length > 0) {
        setCatalogues(list);
      }
    }, (err) => {
      console.warn("Catalogues read connection restricted:", err.message);
    });

    return () => {
      unsubFactory();
      unsubProducts();
      unsubCatalogues();
    };
  }, []);

  // 2. Sync secure/authenticated-only states in real-time from Firestore
  useEffect(() => {
    if (!currentUser) {
      // For guest users, clear these collections to prevent displaying stale data or triggering unauthorized read error warnings.
      setOrders([]);
      setQuotes([]);
      setCustomers([]);
      setLeads([]);
      setCrmActivities([]);
      setCrmNotes([]);
      setCrmTasks([]);
      setCommunications([]);
      setTransactionLogs([]);
      setDocuments([]);
      setPaymentLogs([]);
      setAuditLogs([]);
      return;
    }

    // 4. Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Order);
      });
      if (list.length > 0) {
        setOrders(list);
      }
    }, (err) => {
      console.warn("Orders read connections restricted (Requires Admin credentials):", err.message);
    });

    // 5. Quote requests
    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      const list: QuoteRequest[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as QuoteRequest);
      });
      if (list.length > 0) {
        setQuotes(list);
      }
    }, (err) => {
      console.warn("Quotes read connections restricted (Requires Admin credentials):", err.message);
    });

    // 6. CRM Customers
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const list: CRMCustomer[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMCustomer);
      });
      setCustomers(list);
    }, (err) => {
      console.warn("Customers read connection restricted:", err.message);
    });

    // 7. CRM Leads
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const list: CRMLead[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMLead);
      });
      setLeads(list);
    }, (err) => {
      console.warn("Leads read connection restricted:", err.message);
    });

    // 8. CRM Activities
    const unsubActivities = onSnapshot(collection(db, 'crm_activities'), (snapshot) => {
      const list: CRMActivity[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMActivity);
      });
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCrmActivities(list);
    }, (err) => {
      console.warn("Activities read connection restricted:", err.message);
    });

    // 9. CRM Notes
    const unsubNotes = onSnapshot(collection(db, 'crm_notes'), (snapshot) => {
      const list: CRMNote[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMNote);
      });
      setCrmNotes(list);
    }, (err) => {
      console.warn("Notes read connection restricted:", err.message);
    });

    // 10. CRM Tasks
    const unsubTasks = onSnapshot(collection(db, 'crm_tasks'), (snapshot) => {
      const list: CRMTask[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMTask);
      });
      setCrmTasks(list);
    }, (err) => {
      console.warn("Tasks read connection restricted:", err.message);
    });

    // 11. CRM Communications
    const unsubComms = onSnapshot(collection(db, 'communications'), (snapshot) => {
      const list: CRMCommunication[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CRMCommunication);
      });
      setCommunications(list);
    }, (err) => {
      console.warn("Communications read connection restricted:", err.message);
    });

    // 12. CRM Transaction Logs
    const unsubTL = onSnapshot(collection(db, 'transaction_logs'), (snapshot) => {
      const list: TransactionLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as TransactionLog);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactionLogs(list);
    }, (err) => {
      console.warn("Transaction logs read connection restricted:", err.message);
    });

    // 13. CRM Documents
    const unsubDoc = onSnapshot(collection(db, 'customer_documents'), (snapshot) => {
      const list: CustomerDocument[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CustomerDocument);
      });
      setDocuments(list);
    }, (err) => {
      console.warn("Customer documents read connection restricted:", err.message);
    });

    // 14. CRM Payment Logs
    const unsubPL = onSnapshot(collection(db, 'payment_logs'), (snapshot) => {
      const list: PaymentLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as PaymentLog);
      });
      setPaymentLogs(list);
    }, (err) => {
      console.warn("Payment logs read connection restricted:", err.message);
    });

    // 15. CRM Audit Logs
    const unsubAL = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
      const list: AuditLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as AuditLog);
      });
      list.sort((a, b) => b.id.localeCompare(a.id));
      setAuditLogs(list);
    }, (err) => {
      console.warn("Audit logs read connection restricted:", err.message);
    });

    return () => {
      unsubOrders();
      unsubQuotes();
      unsubCustomers();
      unsubLeads();
      unsubActivities();
      unsubNotes();
      unsubTasks();
      unsubComms();
      unsubTL();
      unsubDoc();
      unsubPL();
      unsubAL();
    };
  }, [currentUser]);

  // Dynamically calculate the overall analytics for full data integrity
  const analytics: Analytics = {
    totalCatalogues: catalogues.length,
    totalOrders: orders.length,
    pendingQuotations: quotes.filter(q => q.status === 'Pending').length,
    revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    recentEnquiries: quotes.length + orders.length
  };

  // Bootstrap empty Firestore database with rich setup mock datasets
  const bootstrapDatabaseIfNeeded = async () => {
    try {
      const factoryRef = doc(db, 'factory', 'profile');
      const factorySnap = await getDoc(factoryRef);
      if (!factorySnap.exists()) {
        console.log("Bootstrapping dry database with seed mock data...");
        
        await setDoc(factoryRef, mockFactory);

        for (const prod of mockProducts) {
          await setDoc(doc(db, 'products', prod.id), prod);
        }

        for (const cat of mockCatalogues) {
          await setDoc(doc(db, 'catalogues', cat.id), cat);
        }

        for (const ord of mockOrders) {
          await setDoc(doc(db, 'orders', ord.id), ord);
        }

         for (const q of mockQuotes) {
          await setDoc(doc(db, 'quotes', q.id), q);
        }

        // Seeding CRM collections
        console.log("Seeding CRM specific collections...");
        for (const cust of mockCRMCustomers) {
          await setDoc(doc(db, 'customers', cust.id), cust);
        }
        for (const lead of mockCRMLeads) {
          await setDoc(doc(db, 'leads', lead.id), lead);
        }
        for (const act of mockCRMActivities) {
          await setDoc(doc(db, 'crm_activities', act.id), act);
        }
        for (const note of mockCRMNotes) {
          await setDoc(doc(db, 'crm_notes', note.id), note);
        }
        for (const task of mockCRMTasks) {
          await setDoc(doc(db, 'crm_tasks', task.id), task);
        }
        for (const comm of mockCommunications) {
          await setDoc(doc(db, 'communications', comm.id), comm);
        }
        for (const tlog of mockTransactionLogs) {
          await setDoc(doc(db, 'transaction_logs', tlog.id), tlog);
        }
        for (const docum of mockCustomerDocuments) {
          await setDoc(doc(db, 'customer_documents', docum.id), docum);
        }
        for (const pay of mockPaymentLogs) {
          await setDoc(doc(db, 'payment_logs', pay.id), pay);
        }
        for (const aud of mockAuditLogs) {
          await setDoc(doc(db, 'audit_logs', aud.id), aud);
        }

        await setDoc(doc(db, 'analytics', 'overall'), mockAnalytics);
        console.log("Database successfully seeded!");
      } else {
        // Safe CRM backfill for existing profiles
        try {
          const custCheck = await getDoc(doc(db, 'customers', 'CUST-100201'));
          if (!custCheck.exists()) {
            console.log("Factory Profile exists but CRM is unseeded. Active backfilling...");
            for (const cust of mockCRMCustomers) {
              await setDoc(doc(db, 'customers', cust.id), cust);
            }
            for (const lead of mockCRMLeads) {
              await setDoc(doc(db, 'leads', lead.id), lead);
            }
            for (const act of mockCRMActivities) {
              await setDoc(doc(db, 'crm_activities', act.id), act);
            }
            for (const note of mockCRMNotes) {
              await setDoc(doc(db, 'crm_notes', note.id), note);
            }
            for (const task of mockCRMTasks) {
              await setDoc(doc(db, 'crm_tasks', task.id), task);
            }
            for (const comm of mockCommunications) {
              await setDoc(doc(db, 'communications', comm.id), comm);
            }
            for (const tlog of mockTransactionLogs) {
              await setDoc(doc(db, 'transaction_logs', tlog.id), tlog);
            }
            for (const docum of mockCustomerDocuments) {
              await setDoc(doc(db, 'customer_documents', docum.id), docum);
            }
            for (const pay of mockPaymentLogs) {
              await setDoc(doc(db, 'payment_logs', pay.id), pay);
            }
            for (const aud of mockAuditLogs) {
              await setDoc(doc(db, 'audit_logs', aud.id), aud);
            }
            console.log("CRM backfilling finished!");
          }
        } catch (crmErr) {
          console.warn("CRM backfilling check skipped:", crmErr);
        }
      }
    } catch (err) {
      console.warn("Bootstrap skipped or restricted:", err);
    }
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        bootstrapDatabaseIfNeeded();
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      await bootstrapDatabaseIfNeeded();
    } catch (error) {
      console.error("Login failed or popup blocked: ", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      await bootstrapDatabaseIfNeeded();
    } catch (error) {
      console.error("Login with email failed: ", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      await bootstrapDatabaseIfNeeded();
    } catch (error) {
      console.error("Registration with email failed: ", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed: ", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out fail: ", error);
    }
  };

  // Cart Local functions (unauthenticated state)
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  // Mutations (Authenticated Admin operations)
  const addProduct = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      // Also scrub references from existing active catalogues
      for (const cat of catalogues) {
        if (cat.productIds.includes(productId)) {
          const updatedIds = cat.productIds.filter(id => id !== productId);
          await setDoc(doc(db, 'catalogues', cat.id), { ...cat, productIds: updatedIds });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${productId}`);
    }
  };

  const createCatalogue = async (catalogue: Catalogue) => {
    try {
      await setDoc(doc(db, 'catalogues', catalogue.id), catalogue);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `catalogues/${catalogue.id}`);
    }
  };

  const updateCatalogue = async (catalogue: Catalogue) => {
    try {
      await setDoc(doc(db, 'catalogues', catalogue.id), catalogue);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `catalogues/${catalogue.id}`);
    }
  };

  const deleteCatalogue = async (catalogueId: string) => {
    try {
      await deleteDoc(doc(db, 'catalogues', catalogueId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `catalogues/${catalogueId}`);
    }
  };

  // Helper function for transaction logs
  const addTransactionLog = async (category: 'Catalogue' | 'Sales' | 'Order' | 'Payment' | 'Communication', type: string, description: string, customerId?: string, extraMetadata?: any) => {
    try {
      const logId = `TLOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const log = {
        id: logId,
        category,
        type,
        description,
        timestamp: new Date().toISOString(),
        metadata: {
          customerId,
          ...extraMetadata
        }
      };
      await setDoc(doc(db, 'transaction_logs', logId), cleanUndefined(log));
    } catch (err) {
      console.error("Error saving transactional log:", err);
    }
  };

  // Buyer orders and RFQ submissions (Unauthenticated operations)
  const placeOrder = async (orderData: Partial<Order>) => {
    let activeCatId = localStorage.getItem('active_catalogue_id') || undefined;
    let activeCatUrl = undefined;
    const activeCatStr = localStorage.getItem('active_catalogue');
    if (activeCatStr) {
      try {
        const catData = JSON.parse(activeCatStr);
        activeCatUrl = catData.catalogueUrl || undefined;
      } catch (e) {
        console.warn(e);
      }
    }
    // Generate a random ID instead of relying on array length which is 0 for guests due to security rules
    const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Find or generate localized crm customer session
    let customerId = localStorage.getItem('crm_customer_id');
    if (!customerId) {
      customerId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('crm_customer_id', customerId);
    }

    const newOrder: Order = {
      id: newOrderId,
      date: new Date().toISOString().split('T')[0],
      customerName: orderData.customerName || 'Anonymous Buyer',
      companyName: orderData.companyName || 'Guest Company',
      totalAmount: orderData.totalAmount || cart.reduce((sum, item) => sum + (item.product.offerPrice * item.quantity), 0),
      status: 'Received',
      items: [...cart],
      catalogueId: activeCatId,
      catalogueUrl: activeCatUrl,
      customerId: customerId, // link order to CRM Customer
      ...orderData
    } as Order;

    try {
      await setDoc(doc(db, 'orders', newOrder.id), cleanUndefined(newOrder));
      
      try {
        // CRM Integration: 1. Create or Update Customer Profile
        const existingCust = customers.find(c => c.id === customerId);
        const updatedCust: CRMCustomer = {
          id: customerId!,
          name: orderData.customerName || existingCust?.name || 'Anonymous Buyer',
          companyName: orderData.companyName || existingCust?.companyName || 'Guest Company',
          contactPerson: orderData.customerName || existingCust?.contactPerson || '',
          mobileNumber: orderData.mobileNumber || existingCust?.mobileNumber || '',
          emailAddress: orderData.emailAddress || existingCust?.emailAddress || '',
          gstNumber: orderData.gstNumber || existingCust?.gstNumber || '',
          address: orderData.deliveryAddress?.addressLine1 || existingCust?.address || '',
          country: orderData.deliveryAddress?.country || existingCust?.country || 'India',
          state: orderData.deliveryAddress?.state || existingCust?.state || '',
          city: orderData.deliveryAddress?.city || existingCust?.city || '',
          leadStatus: 'Order Received',
          totalOrders: (existingCust?.totalOrders || 0) + 1,
          totalOrderValue: (existingCust?.totalOrderValue || 0) + newOrder.totalAmount,
          lastInteraction: new Date().toISOString(),
          paymentStatus: orderData.payment?.screenshotUrl ? 'Paid (Partial)' : 'Pending',
          createdAt: existingCust?.createdAt || new Date().toISOString()
        };
        await setDoc(doc(db, 'customers', customerId!), cleanUndefined(updatedCust));

        // CRM Integration: 2. Create or Update Lead Profile
        const leadId = `LEAD-${customerId?.split('-')[1]}`;
        const existingLead = leads.find(l => l.id === leadId);
        const updatedLead: CRMLead = {
          id: leadId,
          customerId: customerId!,
          customerName: updatedCust.name,
          companyName: updatedCust.companyName,
          email: updatedCust.emailAddress,
          mobile: updatedCust.mobileNumber,
          source: existingLead?.source || 'Added to Cart',
          status: 'Order Received',
          date: existingLead?.date || new Date().toISOString().split('T')[0],
          notes: existingLead?.notes || `Wholesale order ORD-${newOrderId} placed from catalogue.`,
          assignedUser: existingLead?.assignedUser || 'Sachin Sharma',
          catalogueId: activeCatId
        };
        await setDoc(doc(db, 'leads', leadId), cleanUndefined(updatedLead));

        // CRM Integration: 3. Timelines Activity Logging
        await addCRMActivity({
          customerId: customerId!,
          type: 'Order Placed',
          description: `Order Placed: ${newOrderId} (Value: ₹${newOrder.totalAmount.toLocaleString()})`,
          details: `Customer details and order successfully created.`
        });

        // CRM Integration: 4. Transaction log
        await addTransactionLog('Order', 'Order Created', `Order ${newOrderId} submitted by ${updatedCust.name}`, customerId!, {
          orderId: newOrderId,
          amount: newOrder.totalAmount,
          customerName: updatedCust.name
        });

        // CRM Integration: 5. Advance QR Payment Screen Proof attachment
        if (orderData.payment?.screenshotUrl) {
          const paymentLogId = `PAYG-${Date.now()}`;
          const payLog: PaymentLog = {
            id: paymentLogId,
            customerId: customerId!,
            customerName: updatedCust.name,
            amount: Math.round(newOrder.totalAmount * 0.25), // advance payment logging
            method: 'QR',
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            orderId: newOrderId
          };
          await setDoc(doc(db, 'payment_logs', paymentLogId), cleanUndefined(payLog));
          await addTransactionLog('Payment', 'QR Payment Submitted', `QR Verification proof uploaded for ₹${payLog.amount}`, customerId!, {
            orderId: newOrderId,
            amount: payLog.amount
          });
          
          const docId = `DOC-${Date.now()}`;
          const newDoc: CustomerDocument = {
            id: docId,
            customerId: customerId!,
            name: `Proof_Pay_${newOrderId}.png`,
            type: 'Payment Proof',
            date: new Date().toISOString().split('T')[0],
            fileSize: '120 KB'
          };
          await setDoc(doc(db, 'customer_documents', docId), cleanUndefined(newDoc));
        }
      } catch (crmErr) {
        console.warn("CRM Integration failed silently:", crmErr);
      }

      clearCart();
      return newOrderId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`);
      throw err;
    }
  };

  const updateFactoryProfile = async (factoryProfile: FactoryProfile) => {
    try {
      await setDoc(doc(db, 'factory', 'profile'), cleanUndefined(factoryProfile));
      setFactory(factoryProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'factory/profile');
    }
  };

  const updateOrder = async (order: Order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), cleanUndefined(order));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    }
  };

  const requestQuote = async (quoteInfo: any) => {
    let activeCatId = localStorage.getItem('active_catalogue_id') || undefined;
    let activeCatUrl = undefined;
    const activeCatStr = localStorage.getItem('active_catalogue');
    if (activeCatStr) {
      try {
        const catData = JSON.parse(activeCatStr);
        activeCatUrl = catData.catalogueUrl || undefined;
      } catch (e) {
        console.warn(e);
      }
    }
    // Generate a random ID instead of relying on array length which is 0 for guests
    const newQuoteId = `RFQ-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Find or generate localized crm customer session
    let customerId = localStorage.getItem('crm_customer_id');
    if (!customerId) {
      customerId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('crm_customer_id', customerId);
    }

    const newQuote: QuoteRequest = {
      id: newQuoteId,
      date: new Date().toISOString().split('T')[0],
      customerName: quoteInfo.customerName,
      targetPrice: Number(quoteInfo.targetPrice),
      status: 'Pending',
      product: quoteInfo.product,
      quantity: Number(quoteInfo.quantity),
      specialRequirements: quoteInfo.specialRequirements || '',
      catalogueId: activeCatId,
      catalogueUrl: activeCatUrl,
      buyerDetails: quoteInfo.buyerDetails
    };
    try {
      await setDoc(doc(db, 'quotes', newQuote.id), cleanUndefined(newQuote));

      try {
        // CRM Integration: 1. Create or Update Customer Profile
        const existingCust = customers.find(c => c.id === customerId);
        const updatedCust: CRMCustomer = {
          id: customerId!,
          name: quoteInfo.customerName || existingCust?.name || 'Anonymous Buyer',
          companyName: quoteInfo.companyName || existingCust?.companyName || 'Guest Company',
          contactPerson: quoteInfo.customerName || existingCust?.contactPerson || '',
          mobileNumber: quoteInfo.mobileNumber || existingCust?.mobileNumber || '',
          emailAddress: quoteInfo.emailAddress || existingCust?.emailAddress || '',
          leadStatus: 'Quotation Sent',
          totalOrders: existingCust?.totalOrders || 0,
          totalOrderValue: existingCust?.totalOrderValue || 0,
          lastInteraction: new Date().toISOString(),
          createdAt: existingCust?.createdAt || new Date().toISOString()
        };
        await setDoc(doc(db, 'customers', customerId!), cleanUndefined(updatedCust));

        // CRM Integration: 2. Create or Update Lead Profile
        const leadId = `LEAD-${customerId?.split('-')[1]}`;
        const existingLead = leads.find(l => l.id === leadId);
        const updatedLead: CRMLead = {
          id: leadId,
          customerId: customerId!,
          customerName: updatedCust.name,
          companyName: updatedCust.companyName,
          email: updatedCust.emailAddress,
          mobile: updatedCust.mobileNumber,
          source: existingLead?.source || 'Quotation Requested',
          status: 'Quotation Sent',
          date: existingLead?.date || new Date().toISOString().split('T')[0],
          notes: existingLead?.notes || `Wholesale RFQ ${newQuoteId} placed for product: ${quoteInfo.product.name}.`,
          assignedUser: existingLead?.assignedUser || 'Sachin Sharma',
          catalogueId: activeCatId
        };
        await setDoc(doc(db, 'leads', leadId), cleanUndefined(updatedLead));

        // CRM Integration: 3. Timelines Activity Logging
        await addCRMActivity({
          customerId: customerId!,
          type: 'Quotation Requested',
          description: `Requested Quote for ${quoteInfo.product.name} (Qty: ${quoteInfo.quantity}, Target Price: ₹${quoteInfo.targetPrice})`,
          productName: quoteInfo.product.name,
          details: quoteInfo.specialRequirements
        });

        // CRM Integration: 4. Transaction logging
        await addTransactionLog('Sales', 'Quote Requested', `RFQ ${newQuoteId} requested by ${updatedCust.name}`, customerId!, {
          quoteId: newQuoteId,
          productId: quoteInfo.product.id,
          productName: quoteInfo.product.name,
          amount: Number(quoteInfo.targetPrice) * Number(quoteInfo.quantity)
        });
      } catch (crmErr) {
        console.warn("CRM Integration failed silently:", crmErr);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${newQuote.id}`);
    }
  };

  const replyQuote = async (quoteId: string, responseDetails: any) => {
    try {
      if (!currentUser) throw new Error("Unauthorized");
      const existingQuote = quotes.find(q => q.id === quoteId);
      if (!existingQuote) throw new Error(`Quote not found: ${quoteId}`);
      
      const newThreadMessage = {
        id: `MSG-${Date.now()}`,
        sender: 'factory' as const,
        message: responseDetails.remarks || 'Quotation details attached.',
        date: new Date().toISOString(),
        pricing: {
          unitPrice: responseDetails.unitPrice,
          quantity: responseDetails.quantity,
          freight: responseDetails.freight,
          gst: responseDetails.gst,
          totalAmount: (responseDetails.unitPrice * (responseDetails.quantity || existingQuote.quantity)) - (responseDetails.discount || 0) + (responseDetails.freight || 0) + (responseDetails.gst || 0)
        }
      };
      
      const updatedThread = existingQuote.thread ? [...existingQuote.thread, newThreadMessage] : [newThreadMessage];

      const updatedQuote = {
        ...existingQuote,
        status: 'Quotation Sent' as const,
        factoryResponse: responseDetails,
        thread: updatedThread
      };

      await setDoc(doc(db, 'quotes', quoteId), cleanUndefined(updatedQuote));

      // Attempt CRM Integration silently if possible (mock customerID based on customerName if not found fully)
      const customer = customers.find(c => c.name === existingQuote.customerName);
      if (customer) {
        await addCRMActivity({
          customerId: customer.id,
          type: 'Quotation Sent',
          description: `Sent Quotation response for RFQ ${quoteId}`,
          productName: existingQuote.product.name,
          details: `Unit Price: ₹${responseDetails.unitPrice}, Qty: ${responseDetails.quantity || existingQuote.quantity}`
        });

        await updateLeadStatus(customer.id, 'Quotation Sent');
      }

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${quoteId}`);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: any) => {
    try {
      const existingQuote = quotes.find(q => q.id === quoteId);
      if (!existingQuote) throw new Error(`Quote not found: ${quoteId}`);
      
      const updatedQuote = {
        ...existingQuote,
        status
      };

      await setDoc(doc(db, 'quotes', quoteId), cleanUndefined(updatedQuote));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${quoteId}`);
    }
  };

  // Visitor Tracking (Unauthenticated analytics counters updates)
  const trackCatalogueView = async (catalogueId: string) => {
    const c = catalogues.find(cat => cat.id === catalogueId);
    if (!c) return;

    const originalAnalytics = c.analytics || {
      views: 0,
      uniqueVisitors: 0,
      countries: [],
      cities: [],
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      productClicks: [],
      cartAdditions: 0,
      quoteRequests: 0
    };

    const countries = originalAnalytics.countries.length > 0 
      ? [...originalAnalytics.countries] 
      : [
          { name: 'India', count: 1 },
          { name: 'Bangladesh', count: 0 },
          { name: 'United Arab Emirates', count: 0 }
        ];
    const indIndex = countries.findIndex(co => co.name === 'India');
    if (indIndex >= 0) {
      countries[indIndex] = { ...countries[indIndex], count: countries[indIndex].count + 1 };
    } else {
      countries.push({ name: 'India', count: 1 });
    }

    const cities = originalAnalytics.cities.length > 0 
      ? [...originalAnalytics.cities] 
      : [
          { name: 'Bangalore', count: 1 },
          { name: 'Mumbai', count: 0 },
          { name: 'Delhi', count: 0 }
        ];
    const blrIndex = cities.findIndex(ci => ci.name === 'Bangalore');
    if (blrIndex >= 0) {
      cities[blrIndex] = { ...cities[blrIndex], count: cities[blrIndex].count + 1 };
    } else {
      cities.push({ name: 'Bangalore', count: 1 });
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad/i.test(navigator.userAgent);
    const devices = { ...originalAnalytics.devices };
    if (isTablet) {
      devices.tablet += 1;
    } else if (isMobile) {
      devices.mobile += 1;
    } else {
      devices.desktop += 1;
    }

    try {
      await updateDoc(doc(db, 'catalogues', catalogueId), {
        views: c.views + 1,
        analytics: {
          ...originalAnalytics,
          views: originalAnalytics.views + 1,
          uniqueVisitors: originalAnalytics.uniqueVisitors === 0 ? 1 : originalAnalytics.uniqueVisitors + (Math.random() > 0.4 ? 1 : 0),
          countries,
          cities,
          devices
        }
      });

      // CRM Integration: Auto profile catalogue viewers
      try {
        let customerId = localStorage.getItem('crm_customer_id');
        if (!customerId) {
          customerId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
          localStorage.setItem('crm_customer_id', customerId);
        }
        const existingCust = customers.find(cust => cust.id === customerId);
        if (!existingCust) {
          const prospect: CRMCustomer = {
            id: customerId,
            name: `Prospect ${customerId.split('-')[1]}`,
            companyName: 'Anonymous B2B Viewer',
            leadStatus: 'New Lead',
            totalOrders: 0,
            totalOrderValue: 0,
            lastInteraction: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'customers', customerId), cleanUndefined(prospect));

          // Create lead record too
          const leadId = `LEAD-${customerId.split('-')[1]}`;
          const lead: CRMLead = {
            id: leadId,
            customerId: customerId,
            customerName: prospect.name,
            companyName: prospect.companyName,
            source: 'Catalogue View',
            status: 'New Lead',
            date: new Date().toISOString().split('T')[0],
            notes: `B2B buyer initiated view on catalogue: "${c.name}"`,
            assignedUser: 'Sachin Sharma',
            catalogueId: catalogueId
          };
          await setDoc(doc(db, 'leads', leadId), cleanUndefined(lead));
        }

        // Add timeline activity log
        await addCRMActivity({
          customerId: customerId,
          type: 'Catalogue Viewed',
          description: `Viewed catalogue "${c.name}"`,
          catalogueName: c.name
        });

        // Log centralized transaction log
        await addTransactionLog('Catalogue', 'Catalogue Viewed', `Buyer viewed catalogue "${c.name}"`, customerId, {
          catalogueId: catalogueId
        });
      } catch (crmViewErr) {
        console.warn("CRM auto trace skip on view:", crmViewErr);
      }
    } catch (err) {
      console.warn("Analytics catalog view update failed:", err);
    }
  };

  const trackProductClick = async (catalogueId: string, productId: string, productName: string) => {
    const c = catalogues.find(cat => cat.id === catalogueId);
    if (!c) return;

    const originalAnalytics = c.analytics || {
      views: 1,
      uniqueVisitors: 1,
      countries: [{ name: 'India', count: 1 }],
      cities: [{ name: 'Bangalore', count: 1 }],
      devices: { mobile: 1, desktop: 0, tablet: 0 },
      productClicks: [],
      cartAdditions: 0,
      quoteRequests: 0
    };

    const productClicks = [...originalAnalytics.productClicks];
    const prodIndex = productClicks.findIndex(p => p.productId === productId);
    if (prodIndex >= 0) {
      productClicks[prodIndex] = { ...productClicks[prodIndex], clicks: productClicks[prodIndex].clicks + 1 };
    } else {
      productClicks.push({ productId, name: productName, clicks: 1 });
    }

    try {
      await updateDoc(doc(db, 'catalogues', catalogueId), {
        analytics: {
          ...originalAnalytics,
          productClicks
        }
      });

      // CRM Integration: log click
      let customerId = localStorage.getItem('crm_customer_id');
      if (customerId) {
        await addCRMActivity({
          customerId,
          type: 'Product Viewed',
          description: `Viewed product: "${productName}"`,
          productName
        });
      }
    } catch (err) {
      console.warn("Analytics product click update failed:", err);
    }
  };

  const trackCartAddition = async (catalogueId: string) => {
    const c = catalogues.find(cat => cat.id === catalogueId);
    if (!c) return;

    const originalAnalytics = c.analytics || {
      views: 1,
      uniqueVisitors: 1,
      countries: [{ name: 'India', count: 1 }],
      cities: [{ name: 'Bangalore', count: 1 }],
      devices: { mobile: 1, desktop: 0, tablet: 0 },
      productClicks: [],
      cartAdditions: 0,
      quoteRequests: 0
    };

    try {
      await updateDoc(doc(db, 'catalogues', catalogueId), {
        analytics: {
          ...originalAnalytics,
          cartAdditions: originalAnalytics.cartAdditions + 1
        }
      });

      // CRM Integration: log activity
      let customerId = localStorage.getItem('crm_customer_id');
      if (customerId) {
        await addCRMActivity({
          customerId,
          type: 'Added to Cart',
          description: `Added items to B2B cart in catalogue "${c.name}"`,
          catalogueName: c.name
        });

        // Log transaction log
        await addTransactionLog('Sales', 'Cart Created', `B2B checkout cart updated in catalogue ${c.name}`, customerId, {
          catalogueId
        });
      }
    } catch (err) {
      console.warn("Analytics cart addition failed:", err);
    }
  };

  const trackQuoteRequest = async (catalogueId: string) => {
    const c = catalogues.find(cat => cat.id === catalogueId);
    if (!c) return;

    const originalAnalytics = c.analytics || {
      views: 1,
      uniqueVisitors: 1,
      countries: [{ name: 'India', count: 1 }],
      cities: [{ name: 'Bangalore', count: 1 }],
      devices: { mobile: 1, desktop: 0, tablet: 0 },
      productClicks: [],
      cartAdditions: 0,
      quoteRequests: 0
    };

    try {
      await updateDoc(doc(db, 'catalogues', catalogueId), {
        analytics: {
          ...originalAnalytics,
          quoteRequests: originalAnalytics.quoteRequests + 1
        }
      });
    } catch (err) {
      console.warn("Analytics quote request failed:", err);
    }
  };

  // CRM Mutation Implementations
  const addCRMNote = async (customerId: string, note: string) => {
    try {
      const noteId = `NTE-${Date.now()}`;
      const newNote: CRMNote = {
        id: noteId,
        customerId,
        author: currentUser?.displayName || 'Sachin Sharma',
        note,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'crm_notes', noteId), cleanUndefined(newNote));

      await addCRMActivity({
        customerId,
        type: 'Manual Log',
        description: `Added Note: "${note.substring(0, 60)}${note.length > 60 ? '...' : ''}"`
      });

      await addAuditLog(`Created Note for customer: ${customerId}`);
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const addCRMTask = async (task: Partial<CRMTask>) => {
    try {
      const taskId = `TSK-${Date.now()}`;
      const newTask = {
        id: taskId,
        status: 'Pending',
        assignedUser: currentUser?.displayName || 'Sachin Sharma',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        ...task
      };
      await setDoc(doc(db, 'crm_tasks', taskId), cleanUndefined(newTask));
      
      if (newTask.customerId) {
        await addCRMActivity({
          customerId: newTask.customerId,
          type: 'Follow-up Scheduled',
          description: `Scheduled Task: ${newTask.title} (Due: ${newTask.dueDate})`
        });
      }
      await addAuditLog(`Scheduled followup task: "${newTask.title}"`);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const updateCRMTask = async (task: CRMTask) => {
    try {
      await setDoc(doc(db, 'crm_tasks', task.id), cleanUndefined(task));
      if (task.status === 'Completed' && task.customerId) {
        await addCRMActivity({
          customerId: task.customerId,
          type: 'Task Completed',
          description: `Completed Task: ${task.title}`
        });
      }
      await addAuditLog(`Updated task status for task: ${task.title}`);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteCRMTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'crm_tasks', taskId));
      await addAuditLog(`Deleted followup task ID: ${taskId}`);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const addCRMDocument = async (docObj: CustomerDocument) => {
    try {
      await setDoc(doc(db, 'customer_documents', docObj.id), cleanUndefined(docObj));
      await addCRMActivity({
        customerId: docObj.customerId,
        type: 'Manual Log',
        description: `Uploaded Document: ${docObj.name} (${docObj.type})`
      });
      await addAuditLog(`Uploaded document "${docObj.name}" for customer: ${docObj.customerId}`);
    } catch (err) {
      console.error("Error uploading document:", err);
    }
  };

  const deleteCRMDocument = async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'customer_documents', docId));
      await addAuditLog(`Scrubbed document attachment ID: ${docId}`);
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const updateLeadStatus = async (leadId: string, status: any) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { status });
      const leadSnap = await getDoc(leadRef);
      if (leadSnap.exists()) {
        const leadData = leadSnap.data();
        if (leadData.customerId) {
          await updateDoc(doc(db, 'customers', leadData.customerId), { leadStatus: status });
          await addCRMActivity({
            customerId: leadData.customerId,
            type: 'Manual Log',
            description: `Lead state modified to: ${status}`
          });
          await addTransactionLog('Sales', 'Quote Sent', `Lead state changed to ${status} for customer ${leadData.customerId}`, leadData.customerId);
        }
      }
      await addAuditLog(`Updated Lead ${leadId} status to ${status}`);
    } catch (err) {
      console.error("Error shifting lead stage:", err);
    }
  };

  const addCRMActivity = async (activity: Partial<CRMActivity>) => {
    try {
      const actId = `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newActivity = {
        id: actId,
        date: new Date().toISOString().split('T')[0],
        ...activity
      };
      await setDoc(doc(db, 'crm_activities', actId), cleanUndefined(newActivity));
    } catch (err) {
      console.error("Error log CRM activity:", err);
    }
  };

  const addAuditLog = async (action: string) => {
    try {
      const audId = `AUD-${Date.now()}`;
      const now = new Date();
      const newAud: AuditLog = {
        id: audId,
        user: currentUser?.displayName || 'Sachin Sharma',
        action,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ipAddress: '192.168.1.55'
      };
      await setDoc(doc(db, 'audit_logs', audId), cleanUndefined(newAud));
    } catch (err) {
      console.error("Error logging audit trace:", err);
    }
  };

  const sendCRMWhatsApp = async (customerId: string, recipient: string, message: string) => {
    try {
      const commId = `COM-${Date.now()}`;
      const now = new Date();
      const newComm: CRMCommunication = {
        id: commId,
        customerId,
        type: 'WhatsApp',
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        recipient,
        message,
        deliveryStatus: 'Delivered'
      };
      await setDoc(doc(db, 'communications', commId), cleanUndefined(newComm));
      
      await addCRMActivity({
        customerId,
        type: 'WhatsApp Sent',
        description: `Sent WhatsApp to ${recipient}: "${message.substring(0, 50)}..."`
      });
      await addTransactionLog('Communication', 'WhatsApp Sent', `WhatsApp dispatched to +${recipient}`, customerId);
    } catch (err) {
      console.error("Error sending WhatsApp logging:", err);
    }
  };

  const sendCRMEmail = async (customerId: string, recipient: string, subject: string, message: string) => {
    try {
      const commId = `COM-${Date.now()}`;
      const now = new Date();
      const newComm: CRMCommunication = {
        id: commId,
        customerId,
        type: 'Email',
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        recipient,
        subject,
        message,
        deliveryStatus: 'Sent'
      };
      await setDoc(doc(db, 'communications', commId), cleanUndefined(newComm));

      await addCRMActivity({
        customerId,
        type: 'Email Sent',
        description: `Emailed ${recipient} - [${subject}]: "${message.substring(0, 50)}..."`
      });
      await addTransactionLog('Communication', 'Email Sent', `Email dispatched to ${recipient}`, customerId);
    } catch (err) {
      console.error("Error logging Email trace:", err);
    }
  };

  const updateSalesPipelineStage = async (leadId: string, stage: string) => {
    await updateLeadStatus(leadId, stage);
  };

  const submitEnquiry = async (enquiry: { name: string; companyName: string; email: string; mobile: string; message: string; catalogueId?: string }) => {
    let customerId = localStorage.getItem('crm_customer_id');
    if (!customerId) {
      customerId = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('crm_customer_id', customerId);
    }

    const existingCust = customers.find(c => c.id === customerId);
    const updatedCust = {
      id: customerId!,
      name: enquiry.name,
      companyName: enquiry.companyName,
      contactPerson: enquiry.name,
      mobileNumber: enquiry.mobile,
      emailAddress: enquiry.email,
      leadStatus: 'Contacted' as any,
      totalOrders: existingCust?.totalOrders || 0,
      totalOrderValue: existingCust?.totalOrderValue || 0,
      lastInteraction: new Date().toISOString(),
      createdAt: existingCust?.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, 'customers', customerId!), cleanUndefined(updatedCust));

    const leadId = `LEAD-${customerId!.split('-')[1]}`;
    const existingLead = leads.find(l => l.id === leadId);
    const lead = {
      id: leadId,
      customerId: customerId!,
      customerName: enquiry.name,
      companyName: enquiry.companyName,
      email: enquiry.email,
      mobile: enquiry.mobile,
      source: 'Enquiry Submitted',
      status: 'Contacted',
      date: new Date().toISOString().split('T')[0],
      notes: enquiry.message,
      assignedUser: existingLead?.assignedUser || 'Sachin Sharma',
      catalogueId: enquiry.catalogueId
    };
    await setDoc(doc(db, 'leads', leadId), cleanUndefined(lead));

    await addCRMActivity({
      customerId: customerId!,
      type: 'Manual Log',
      description: `Inquiry submitted: "${enquiry.message.substring(0, 80)}"`,
      details: enquiry.message
    });

    const commId = `COM-${Date.now()}`;
    const now = new Date();
    const newComm: CRMCommunication = {
      id: commId,
      customerId: customerId!,
      type: 'Email',
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      recipient: enquiry.email,
      subject: 'Thank you for your B2B wholesale enquiry',
      message: `We have received your wholesale request: "${enquiry.message}". One of our wholesale agents will follow up very shortly.`,
      deliveryStatus: 'Sent'
    };
    await setDoc(doc(db, 'communications', commId), cleanUndefined(newComm));

    await addTransactionLog('Communication', 'Email Sent', `Auto acknowledgement sent for contact form to ${enquiry.email}`, customerId!);
  };

  return (
    <StoreContext.Provider value={{
      factory, products, catalogues, orders, quotes, analytics, cart,
      currentUser, authLoading, activeCatalogueId, selectCatalogue,
      loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      addProduct, createCatalogue, deleteCatalogue, updateCatalogue, updateProduct, deleteProduct, placeOrder, requestQuote, replyQuote, updateQuoteStatus,
      updateFactoryProfile, updateOrder,
      trackCatalogueView, trackProductClick, trackCartAddition, trackQuoteRequest,
      
      // CRM State & Operations
      customers, leads, crmActivities, crmNotes, crmTasks, communications, transactionLogs, documents, paymentLogs, auditLogs,
      addCRMNote, addCRMTask, updateCRMTask, deleteCRMTask, addCRMDocument, deleteCRMDocument, updateLeadStatus, addCRMActivity,
      addAuditLog, sendCRMWhatsApp, sendCRMEmail, updateSalesPipelineStage, submitEnquiry
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
