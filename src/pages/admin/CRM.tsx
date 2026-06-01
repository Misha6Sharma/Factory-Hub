import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Activity, 
  Briefcase, 
  Send, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  ArrowRight, 
  Filter, 
  Upload, 
  X, 
  Edit3, 
  TrendingUp, 
  Coins, 
  AlertCircle, 
  Clock, 
  Clipboard, 
  FileText, 
  UserCheck, 
  Eye, 
  CornerDownRight, 
  Building2 
} from 'lucide-react';
import { useStore } from '../../lib/StoreContext';
import { 
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
} from '../../types';

export default function CRM() {
  const {
    // State
    customers,
    leads,
    crmActivities,
    crmNotes,
    crmTasks,
    communications,
    transactionLogs,
    documents,
    paymentLogs,
    auditLogs,
    orders,
    quotes,
    
    // Mutations
    addCRMNote,
    addCRMTask,
    updateCRMTask,
    deleteCRMTask,
    addCRMDocument,
    deleteCRMDocument,
    updateLeadStatus,
    sendCRMWhatsApp,
    sendCRMEmail,
    submitEnquiry
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'customers'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Selected Customer for Customer B2B 360 View Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CRMCustomer | null>(null);
  const [customer360Tab, setCustomer360Tab] = useState<'timeline' | 'tasks' | 'notes' | 'communications' | 'documents' | 'quotes'>('timeline');

  // Input States for New Elements
  const [newNoteText, setNewNoteText] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  
  // Scans / attachment mock upload states
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Invoice');
  const [newDocSize, setNewDocSize] = useState('45 KB');

  // Multi-channel dispatch messaging states
  const [channelMessage, setChannelMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  // Manual Lead Creation Drawer State
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualMobile, setManualMobile] = useState('');
  const [manualMessage, setManualMessage] = useState('');

  // Form Submission for manual B2B leads
  const handleManualLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualCompany || !manualEmail || !manualMobile) {
      alert("Please fill standard fields before scheduling manual lead.");
      return;
    }
    await submitEnquiry({
      name: manualName,
      companyName: manualCompany,
      email: manualEmail,
      mobile: manualMobile,
      message: manualMessage || 'Manually logged by system administrator.'
    });
    // Reset fields
    setManualName('');
    setManualCompany('');
    setManualEmail('');
    setManualMobile('');
    setManualMessage('');
    setIsNewCustomerModalOpen(false);
  };

  // Drag-and-drop simulation status shift triggers
  const shiftLeadStage = async (leadId: string, currentStatus: string, direction: 'forward' | 'backward') => {
    const pipelineStages = ['New Lead', 'Contacted', 'Interested', 'Quotation Sent', 'Under Negotiation', 'Order Received'];
    const currentIndex = pipelineStages.indexOf(currentStatus);
    if (currentIndex === -1) return;

    let nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < pipelineStages.length) {
      const nextStage = pipelineStages[nextIndex] as any;
      await updateLeadStatus(leadId, nextStage);
    }
  };

  // Add notes memo for B2B buyer
  const handleAddPrivateNote = async () => {
    if (!selectedCustomer || !newNoteText.trim()) return;
    await addCRMNote(selectedCustomer.id, newNoteText);
    setNewNoteText('');
  };

  // Add callbacks checklist scheduler
  const handleCreateCRMTask = async () => {
    if (!selectedCustomer || !newTaskTitle.trim()) return;
    await addCRMTask({
      customerId: selectedCustomer.id,
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  // Upload scanned digital assets
  const handleUploadCustomerDocument = async () => {
    if (!selectedCustomer || !newDocName.trim()) return;
    await addCRMDocument({
      id: `DOC-${Date.now()}`,
      customerId: selectedCustomer.id,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      type: newDocType as any,
      date: new Date().toISOString().split('T')[0],
      fileSize: newDocSize
    });
    setNewDocName('');
  };

  // Email notifications log dispatches
  const handleDispatchEmail = async () => {
    if (!selectedCustomer || !channelMessage.trim()) return;
    await sendCRMEmail(
      selectedCustomer.id, 
      selectedCustomer.emailAddress || 'client@factoryhub.com', 
      emailSubject || 'Ref: Wholesale Price Catalog Update', 
      channelMessage
    );
    setChannelMessage('');
    setEmailSubject('');
    alert("Wholesale notification email dispatched and logged into buyer interactions catalog!");
  };

  // WhatsApp bulk messaging alerts dispatches
  const handleDispatchWhatsApp = async () => {
    if (!selectedCustomer || !channelMessage.trim()) return;
    await sendCRMWhatsApp(
      selectedCustomer.id, 
      selectedCustomer.mobileNumber || '919599002231', 
      channelMessage
    );
    setChannelMessage('');
    alert("Wholesale alerts dispatched via WhatsApp CRM proxy and registered into history timeline!");
  };

  // Dynamic Metrics Widget Calculators
  const totalLeadsCount = leads.length;
  const activeCustomersCount = customers.filter(c => c.leadStatus !== 'Rejected').length;
  const pendingQuotationsCount = quotes.filter(q => q.status === 'Pending').length;
  const ordersCompletedCount = orders.filter(o => o.status === 'Delivered').length;
  const outstandingPaymentsSum = paymentLogs
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const revenueSum = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter lists based on Query selectors
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.leadStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with quick creation action triggers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            CRM & Customer Relationship Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review wholesale catalog activity, sales pipelines, custom B2B negotiations, and automatic visitor analytics.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wide uppercase rounded-lg shadow-sm flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Manual B2B Lead
          </button>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedCustomer(null); }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            👥 CRM Summary Dashboard
          </button>
          
          <button
            onClick={() => { setActiveTab('pipeline'); setSelectedCustomer(null); }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'pipeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            📊 Visual Sales Pipeline (Kanban)
          </button>
          
          <button
            onClick={() => { setActiveTab('customers'); setSelectedCustomer(null); }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            🗃️ Customer Master Directory
          </button>
        </nav>
      </div>

      {/* 1. overview tab component */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dashboard metrics widgets grids */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Pipeline Leads</span>
                <Briefcase className="w-4 h-4 text-orange-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{totalLeadsCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">B2B interactions logged</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Active Buyers</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{activeCustomersCount}</div>
              <p className="text-[10px] text-green-600 font-medium font-mono">● Real-time profiles</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Pending Quotes</span>
                <Clipboard className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">{pendingQuotationsCount}</div>
              <p className="text-[10px] text-red-500 font-medium">Awaiting wholesale review</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">B2B Revenue</span>
                <Coins className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">₹{revenueSum.toLocaleString()}</div>
              <p className="text-[10px] text-slate-500 font-medium">Received & processed orders</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Outstanding</span>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="mt-2 text-2xl font-black text-rose-600">₹{outstandingPaymentsSum.toLocaleString()}</div>
              <p className="text-[10px] text-orange-500 font-medium">Deposit validations pending</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Buyer Interactions Timeline logs */}
            <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Chronological Buyer Interactions Timeline
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Updates live</span>
              </div>
              
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                {crmActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No interaction records verified yet.</p>
                ) : (
                  crmActivities.map((act) => {
                    const customerRef = customers.find(c => c.id === act.customerId);
                    return (
                      <div key={act.id} className="flex gap-3 text-xs leading-relaxed border-b pb-3 border-slate-50 last:border-0 last:pb-0">
                        <div className="mt-0.5 rounded-full p-1 bg-slate-50 border shrink-0">
                          <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-900">{customerRef?.name || 'Prospect Customer'}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-md uppercase">
                              {act.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{act.date}</span>
                          </div>
                          <p className="text-slate-600">{act.description}</p>
                          {act.details && <p className="text-[11px] text-slate-400 italic font-mono">"{act.details}"</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Side summary: Audit Log Trails */}
            <div className="bg-[#0f172a] text-slate-200 shadow-sm rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Wholesale System Audit Trail
                </h3>
                <span className="text-[9px] bg-indigo-500/15 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded">Secure</span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Audit log is clean.</p>
                ) : (
                  auditLogs.map((aud) => (
                    <div key={aud.id} className="text-xs space-y-1 bg-slate-900 border border-slate-800/80 p-2.5 rounded-lg">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                        <span className="text-indigo-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {aud.user}
                        </span>
                        <span className="font-mono">{aud.date} - {aud.time}</span>
                      </div>
                      <p className="text-slate-300 font-medium">{aud.action}</p>
                      <div className="text-[9px] font-mono text-slate-500 text-right">IP: {aud.ipAddress}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Centralized B2B Transaction logs */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Centralized B2B Transaction logs
              </h3>
              <p className="text-[10px] text-slate-400">Total transaction trails: {transactionLogs.length}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase">
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Associated ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {transactionLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-slate-400">No B2B wholesale transactions registered yet.</td>
                    </tr>
                  ) : (
                    transactionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{log.id}</td>
                        <td className="p-3 text-slate-900">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.category === 'Order' ? 'bg-indigo-555/10 text-indigo-600 bg-indigo-50' : 
                            log.category === 'Payment' ? 'bg-emerald-50 text-emerald-600' :
                            log.category === 'Catalogue' ? 'bg-amber-50 text-amber-600' :
                            log.category === 'Sales' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{log.type}</td>
                        <td className="p-3 text-slate-600">{log.description}</td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">{log.timestamp.slice(0, 16).replace('T', ' ')}</td>
                        <td className="p-3 text-slate-700 font-mono">{log.metadata?.customerId || '--'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pipeline Kanban Board Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border p-4 rounded-xl text-xs space-y-2 text-slate-600 leading-relaxed font-semibold">
            🚀 <span className="text-indigo-600">Pro B2B Pipeline:</span> Drag and drop leads between visual validation steps, or use quick checkout step action arrows to shift lead lifecycle stages. Status syncs immediately with the Customer master profile catalog database.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {[
              { title: 'New Lead', color: 'border-t-slate-400 bg-slate-50/50' },
              { title: 'Contacted', color: 'border-t-indigo-400 bg-indigo-50/10' },
              { title: 'Interested', color: 'border-t-blue-400 bg-blue-50/10' },
              { title: 'Quotation Sent', color: 'border-t-amber-400 bg-amber-50/10' },
              { title: 'Under Negotiation', color: 'border-t-orange-400 bg-orange-50/10' },
              { title: 'Order Received', color: 'border-t-emerald-500 bg-emerald-50/10 border-r border-slate-100' }
            ].map((col) => {
              const columnLeads = leads.filter(l => l.status === col.title);
              return (
                <div key={col.title} className={`min-w-[200px] rounded-xl border border-slate-200/80 p-3 flex flex-col space-y-3 shrink-0 ${col.color}`}>
                  <div className="flex items-center justify-between border-b pb-2 border-slate-200/50">
                    <span className="font-black text-slate-900 text-xs tracking-tight truncate">{col.title}</span>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 font-extrabold rounded-full px-1.5 py-0.5">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 min-h-[400px]">
                    {columnLeads.length === 0 ? (
                      <div className="text-center text-[10px] text-slate-400 py-12">Empty Stage</div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div key={lead.id} className="bg-white border rounded-lg p-3 shadow-xs space-y-2.5 transition-all text-xs">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-slate-800 text-[11px] truncate leading-tight">{lead.customerName}</h4>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 font-mono shrink-0">{lead.id}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-slate-400 text-[10px] font-mono leading-tight flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {lead.companyName}
                            </p>
                            {lead.notes && (
                              <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 italic">
                                "{lead.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t pt-2 border-slate-50 text-[10px] font-bold">
                            <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => {
                              const associatedCust = customers.find(c => c.id === lead.customerId);
                              if (associatedCust) setSelectedCustomer(associatedCust);
                            }}>
                              Manage 360 &rarr;
                            </span>
                            
                            {/* Fast movement controls to bypass drag limitations inside web view environment */}
                            <div className="flex gap-1 shrink-0">
                              <button 
                                onClick={() => shiftLeadStage(lead.id, lead.status, 'backward')} 
                                className="px-1 bg-slate-100 border hover:bg-slate-200 rounded text-slate-600 font-bold"
                                title="Move Backward"
                              >
                                &larr;
                              </button>
                              <button 
                                onClick={() => shiftLeadStage(lead.id, lead.status, 'forward')} 
                                className="px-1 bg-slate-100 border hover:bg-slate-200 rounded text-slate-600 font-bold"
                                title="Move Forward"
                              >
                                &rarr;
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Customer Master Table Database tab */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Filtering row */}
          <div className="flex flex-col md:flex-row gap-3 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search database index indices by catalog ID, buyer or enterprise name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 gap-1.5 shrink-0 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Stage:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="All">All Stages</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Under Negotiation">Under Negotiation</option>
                  <option value="Order Received">Order Received</option>
                </select>
              </div>
            </div>
          </div>

          {/* Master B2B customer database list */}
          <div className="bg-white border border-slate-250/85 shadow-xs rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-500">
                    <th className="p-3.5">Customer ID</th>
                    <th className="p-3.5">Contact Name</th>
                    <th className="p-3.5">Enterprise/Company</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Region</th>
                    <th className="p-3.5">Total Orders</th>
                    <th className="p-3.5">Lifetime Value (LTV)</th>
                    <th className="p-3.5">Active Stage</th>
                    <th className="p-3.5 text-right font-extrabold">Management Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-slate-400 font-medium">No profiled buyer customers match specified filters.</td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr 
                        key={cust.id} 
                        onClick={() => setSelectedCustomer(cust)}
                        className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                      >
                        <td className="p-3.5 font-mono text-[11px] text-slate-400 tracking-tight group-hover:text-indigo-600 transition-colors">
                          {cust.id}
                        </td>
                        <td className="p-3.5 text-slate-900 group-hover:text-indigo-650 font-bold transition-colors">
                          {cust.name}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          <span className="font-bold flex items-center gap-1 text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {cust.companyName}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {cust.emailAddress || '--'}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cust.mobileNumber || '--'}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 font-bold text-[11px]">
                          {cust.city ? `${cust.city}, ${cust.state || ''}` : 'Unknown Region'}
                        </td>
                        <td className="p-3.5 text-slate-900 font-extrabold font-mono text-[11px]">
                          {cust.totalOrders} order(s)
                        </td>
                        <td className="p-3.5 text-slate-900 font-black font-semibold font-mono text-indigo-600 text-[11px]">
                          ₹{(cust.totalOrderValue || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            cust.leadStatus === 'Order Received' ? 'bg-green-100 text-green-700' :
                            cust.leadStatus === 'Quotation Sent' ? 'bg-amber-100 text-amber-700' :
                            cust.leadStatus === 'Contacted' ? 'bg-indigo-100 text-indigo-700' :
                            cust.leadStatus === 'Interested' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {cust.leadStatus || 'New Lead'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-600 rounded">
                            Customer 360 View &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER B2B 360 PROFILE OVERLAY DRAWER DIALOG BOX */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white min-h-screen shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-slate-200">
            {/* Drawer Header info */}
            <div className="bg-[#0f172a] text-slate-200 p-5 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded uppercase">
                  Customer 360 B2B Profile
                </span>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-all font-mono"
                >
                  Close [x]
                </button>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shrink-0 uppercase shadow-md">
                  {selectedCustomer.name.slice(0, 2)}
                </div>
                
                <div className="flex-1 space-y-1 overflow-hidden">
                  <h2 className="text-lg font-black text-white tracking-tight">{selectedCustomer.name}</h2>
                  <p className="text-xs text-indigo-300 font-semibold flex items-center gap-1 truncate">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {selectedCustomer.companyName}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 mt-2 font-semibold">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      {selectedCustomer.emailAddress || '--'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 shrink-0" />
                      {selectedCustomer.mobileNumber || '--'}
                    </span>
                    {selectedCustomer.city && (
                      <span className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        📍 {selectedCustomer.city}, {selectedCustomer.state}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick statistics tags inside 360 overview */}
              <div className="grid grid-cols-3 bg-slate-900 border border-slate-800 rounded-xl p-3 text-center text-xs divide-x divide-slate-800">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">Pipeline Status</div>
                  <div className="font-extrabold text-indigo-400 mt-0.5 text-[10px]">{selectedCustomer.leadStatus || 'New Lead'}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">Lifetime Orders</div>
                  <div className="font-extrabold text-slate-200 mt-0.5">{selectedCustomer.totalOrders} shipment(s)</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">Sales Value LTV</div>
                  <div className="font-black text-emerald-400 mt-0.5 font-mono text-[11px]">₹{(selectedCustomer.totalOrderValue || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Sub-tab selection row inside Customer Drawer */}
            <div className="border-b border-slate-200 bg-slate-50 shrink-0">
              <nav className="flex overflow-x-auto p-2 scrollbar-none gap-2">
                {[
                  { id: 'timeline', label: '⏳ Activity Logs' },
                  { id: 'tasks', label: '📅 Schedules & Tasks' },
                  { id: 'notes', label: '📝 Private Notes' },
                  { id: 'communications', label: '💬 Send & Communications' },
                  { id: 'documents', label: '📁 Digital Vault' },
                  { id: 'quotes', label: '🧾 Quote/Orders Index' }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setCustomer360Tab(sec.id as any)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wide shrink-0 transition-all cursor-pointer ${
                      customer360Tab === sec.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Selected Sub-tab Contents Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* TIMELINE TAB CONTROLLER */}
              {customer360Tab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b pb-1.5">Interactive Activity Chronological Log</h3>
                  <div className="relative border-l border-slate-200 pl-4 space-y-5 py-2">
                    {crmActivities.filter(a => a.customerId === selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No views, clicks, or orders logged on timeline yet.</p>
                    ) : (
                      crmActivities
                        .filter(a => a.customerId === selectedCustomer.id)
                        .map((activity) => (
                          <div key={activity.id} className="relative text-xs">
                            {/* Dot icon indicator */}
                            <span className="absolute -left-[21px] top-0.5 bg-indigo-600 w-2.5 h-2.5 rounded-full ring-4 ring-white border"></span>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wide bg-slate-100 text-slate-700 px-1.5 rounded-md">
                                  {activity.type}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{activity.date}</span>
                              </div>
                              <p className="text-slate-600 leading-relaxed">{activity.description}</p>
                              {activity.details && (
                                <p className="text-[10px] text-slate-400 bg-slate-50 p-1 rounded font-mono select-all">
                                  {activity.details}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* TASKS CHECKLIST CONTROLLER */}
              {customer360Tab === 'tasks' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Upcoming callback Schedules & Tasks</h3>
                    <span className="text-[10px] font-mono text-indigo-600">Pending events</span>
                  </div>

                  {/* Task list render */}
                  <div className="space-y-2">
                    {crmTasks.filter(t => t.customerId === selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No pending callback tasks scheduled.</p>
                    ) : (
                      crmTasks
                        .filter(t => t.customerId === selectedCustomer.id)
                        .map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg hover:bg-slate-100/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={task.status === 'Completed'}
                                onChange={async () => {
                                  await updateCRMTask({
                                    ...task,
                                    status: task.status === 'Pending' ? 'Completed' : 'Pending'
                                  });
                                }}
                                className="w-3.5 h-3.5 text-indigo-600 rounded bg-transparent focus:ring-0 cursor-pointer"
                              />
                              <div className="space-y-0.5">
                                <p className={`font-bold ${task.status === 'Completed' ? 'line-through text-slate-450 text-slate-400' : 'text-slate-800'}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                                  <span className="flex items-center gap-0.5">
                                    📅 Due: {task.dueDate}
                                  </span>
                                  <span className={`px-1.5 rounded-sm uppercase tracking-wide text-[8px] font-mono ${
                                    task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-200 text-slate-500'
                                  }`}>
                                    {task.priority} Priority
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => deleteCRMTask(task.id)}
                              className="text-slate-400 hover:text-red-500 p-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>

                  {/* New task scheduler form panel */}
                  <div className="bg-slate-50/50 border rounded-xl p-4 space-y-3 pt-3">
                    <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Add New Callback Follow-up Alert
                    </h4>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. Call to discuss wholesale payment discounts..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400">Due Date</label>
                          <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400">Task Priority</label>
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as any)}
                            className="w-full text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateCRMTask}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Schedule Task Reminder
                    </button>
                  </div>
                </div>
              )}

              {/* NOTES TIMELINE TEXT AREA */}
              {customer360Tab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b pb-1.5">Private Administrative Memos</h3>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {crmNotes.filter(n => n.customerId === selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No notes uploaded for B2B customer.</p>
                    ) : (
                      crmNotes
                        .filter(n => n.customerId === selectedCustomer.id)
                        .map((note) => (
                          <div key={note.id} className="bg-slate-50 border p-3 rounded-lg space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                              <span className="text-slate-600 font-extrabold">✍️ By: {note.author}</span>
                              <span>{note.createdAt.slice(0, 10)}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-semibold">{note.note}</p>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      placeholder="Input client specific private negotiation parameters, wholesale details, or payment conditions..."
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full text-xs font-semibold p-3 bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                    <button
                      onClick={handleAddPrivateNote}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Save Internal Memo Note
                    </button>
                  </div>
                </div>
              )}

              {/* OUTGOING BULK MESSAGING CHANNELS LOG TEMPLATES */}
              {customer360Tab === 'communications' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b pb-1.5 font-sans">Corporate Messaging Center</h3>

                  {/* Messaging channels history view */}
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                    {communications.filter(c => c.customerId === selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No dispatch logs found.</p>
                    ) : (
                      communications
                        .filter(c => c.customerId === selectedCustomer.id)
                        .map((comm) => (
                          <div key={comm.id} className="bg-slate-50 border p-2.5 rounded-lg space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide ${
                                comm.type === 'WhatsApp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {comm.type}
                              </span>
                              <span className="text-slate-400 font-mono">{comm.date} - {comm.time}</span>
                            </div>
                            <p className="font-bold text-slate-800 text-[10px]">To: {comm.recipient}</p>
                            {comm.subject && <p className="font-bold text-indigo-650 text-[10px]">Sub: {comm.subject}</p>}
                            <p className="text-slate-600 truncate">"{comm.message}"</p>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Message composition module */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-3.5 border">
                    <h4 className="font-black text-slate-850 text-[10px] uppercase tracking-wider">Multi-Channel Dispatched Text Message</h4>
                    
                    <div className="space-y-2">
                      <div className="bg-indigo-100/50 p-2.5 rounded border border-indigo-200/50 space-y-1 text-slate-600 leading-normal mb-2 text-[11px] font-semibold">
                        💡 <strong>Wholesale Bulk Templates:</strong> Pre-fill templates such as shipping dispatch status or wholesale discount links into the composition body.
                      </div>

                      <input
                        type="text"
                        placeholder="Subject Line (Email Only)"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                      />

                      <textarea
                        placeholder="Write dynamic SMS body template here..."
                        rows={3}
                        value={channelMessage}
                        onChange={(e) => setChannelMessage(e.target.value)}
                        className="w-full text-xs font-semibold p-3 bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleDispatchWhatsApp}
                        className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Dispatch WhatsApp Alert
                      </button>

                      <button
                        onClick={handleDispatchEmail}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Dispatch Email Alert
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FILE COLLECTION VAULT INVOICE SCHEME */}
              {customer360Tab === 'documents' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b pb-1.5">Scanned digital assets vault</h3>

                  <div className="space-y-2">
                    {documents.filter(d => d.customerId === selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No attachments or documents logged in digital vault.</p>
                    ) : (
                      documents
                        .filter(d => d.customerId === selectedCustomer.id)
                        .map((docum) => (
                          <div key={docum.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-red-100 text-red-650 rounded">
                                📊
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-850 text-[11px]">{docum.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                                  <span>📅 {docum.date}</span>
                                  <span>• Size: {docum.fileSize}</span>
                                  <span className="bg-slate-200 text-slate-600 px-1 font-mono uppercase text-[8px] font-bold rounded">
                                    {docum.type}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => deleteCRMDocument(docum.id)}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="bg-slate-50 border p-4 rounded-xl space-y-3 pt-3">
                    <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wide flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
                      Add Scanned Document / Blueprint Spec / Invoice
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="File Name, e.g. GSTIN_verify..."
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="col-span-2 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="text-xs font-bold px-1 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-600"
                      >
                        <option value="Invoice">Invoice</option>
                        <option value="Specification PDF">Blueprint</option>
                        <option value="Payment Proof">Payment Proof</option>
                        <option value="KYC Check">KYC Verify</option>
                      </select>
                    </div>

                    <button
                      onClick={handleUploadCustomerDocument}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Attach Scanned Digital Asset Document
                    </button>
                  </div>
                </div>
              )}

              {/* QUOTATIONS AND ORDERS LISTS */}
              {customer360Tab === 'quotes' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b pb-1.5">Quote requests & Order placements</h3>
                  
                  {/* Quotes requested */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-slate-700 uppercase text-[10px] tracking-wide flex items-center gap-1 border-l-2 border-indigo-550 pl-1.5">
                      Quote Proposals (RFQs)
                    </h4>
                    {quotes.filter(q => q.customerName === selectedCustomer.name).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No quote requests submitted from catalogs.</p>
                    ) : (
                      quotes
                        .filter(q => q.customerName === selectedCustomer.name)
                        .map((quote) => (
                          <div key={quote.id} className="bg-slate-50 border p-3 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-extrabold text-slate-800 text-[11px]">RFQ ID: {quote.id}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                                <span>📅 Date: {quote.date}</span>
                                <span>• RFQ Qty: {quote.quantity} units</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black font-semibold font-mono text-slate-900 block">₹{quote.targetPrice}/unit</span>
                              <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 uppercase tracking-wider rounded">
                                {quote.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Real processed orders */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-slate-700 uppercase text-[10px] tracking-wide flex items-center gap-1 border-l-2 border-emerald-555 pl-1.5">
                      Order Placements History
                    </h4>
                    {orders.filter(o => o.customerName === selectedCustomer.name || o.customerId === selectedCustomer.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No order placements registered inside repository.</p>
                    ) : (
                      orders
                        .filter(o => o.customerName === selectedCustomer.name || o.customerId === selectedCustomer.id)
                        .map((order) => (
                          <div key={order.id} className="bg-slate-50 border p-3 rounded-lg flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-slate-850 text-[11px]">Invoice ID: {order.id}</p>
                              <p className="text-slate-500 text-[10px] italic">
                                Contains {order.items?.length || 0} product lines
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-black font-semibold font-mono text-emerald-600 block">₹{(order.totalAmount || 0).toLocaleString()}</span>
                              <span className="text-[9px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 uppercase tracking-wider rounded">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL B2B LEAD SCHEDULING DRAWER DIALOG BOX */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Users className="w-5 h-5 text-indigo-500" />
                Schedule Manual Wholesale Lead
              </h3>
              <button 
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-mono text-xs cursor-pointer"
              >
                [x]
              </button>
            </div>

            <form onSubmit={handleManualLeadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Prospect Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Wholesale Enterprise Company <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chandra Garment Distributors Ltd"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@chandra.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Mobile Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="94421 990XX"
                    value={manualMobile}
                    onChange={(e) => setManualMobile(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 text-slate-400">Special wholesale instructions</label>
                <textarea
                  placeholder="Interactions description, target pricing negotiate requirements, bulk requirements..."
                  rows={3}
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow"
              >
                Schedule & Profile New Lead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
