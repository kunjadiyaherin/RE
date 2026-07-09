import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  Info,
  Download,
  Search,
  MessageSquare
} from 'lucide-react';

export default function GuidanceTab() {
  const [subTab, setSubTab] = useState('roadmap'); // 'roadmap', 'portals', 'docs', 'advisor'
  
  // Interactive Checklist State
  const [completedSteps, setCompletedSteps] = useState({
    budget: true,
    reraVerify: false,
    titleSearch: false,
    encumbrance: false,
    draftAgreement: false,
    circleRateCheck: false,
    stampDutyPay: false,
    mutationRecord: false
  });

  const toggleStep = (stepKey) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const calculateProgress = () => {
    const total = Object.keys(completedSteps).length;
    const completed = Object.values(completedSteps).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  // Document Vault State
  const [selectedDoc, setSelectedDoc] = useState('sale_agreement');

  const documents = {
    sale_agreement: {
      title: "Agreement for Sale (Draft)",
      description: "Crucial contract specifying terms of purchase, payment timeline, penalties for builder delay, and specifications of construction.",
      whyImportant: "Legally binds the builder. It protects against arbitrary changes in planning or rate hikes post-booking.",
      verifyTip: "Verify that RERA delay penalties (usually SBI MCLR + 2%) are explicitly stated, and builder-favored clauses are modified.",
      checklist: ["RERA registration number listed", "Exact floor plan & carpet area matched", "Payment stages tied to construction progress", "Force Majeure definitions restricted"]
    },
    title_deed: {
      title: "Title Deed / Parent Deed",
      description: "Establishes owner's absolute legal title over the land. Traces historical sales, partitions, and gift deeds over the last 30 years.",
      whyImportant: "Without clean title records, a builder cannot construct legally and banks will refuse to disburse home loans.",
      verifyTip: "Demand a Title Search Report certified by a licensed advocate specializing in real estate property laws.",
      checklist: ["Owner names match land tax receipts", "Property chain trace completed for 30 years", "No pending property litigation records", "Original documents inspected"]
    },
    encumbrance: {
      title: "Encumbrance Certificate (EC Form 15)",
      description: "Official record from the Sub-Registrar certifying that the property is free from monetary and legal liabilities (like active mortgages).",
      whyImportant: "If a property is mortgaged, the lender holds a charge. The owner cannot legally transfer ownership until the bank issues an NOC.",
      verifyTip: "Look for Form 15. If a property has zero liabilities registered, the Registrar will issue Form 16 (Nil Encumbrance Certificate).",
      checklist: ["Covers the full 30-year trace window", "No active mortgage charge registered", "Sub-registrar office seal verified", "Owner names match current records"]
    },
    occupancy_certificate: {
      title: "Occupancy Certificate (OC)",
      description: "Official document issued by local municipal body (BMC, AMC, PMC) declaring that construction complies with approved building plans.",
      whyImportant: "Moving in without an OC is illegal, and local authorities can disconnect water, electricity, or execute eviction notices.",
      verifyTip: "Do not accept a simple 'Completion Certificate'. An OC is mandatory for legal possession and municipal utility hookups.",
      checklist: ["Issued by local municipal planning body", "Building configuration matches approval", "Fire NOC and water supply clearances attached", "No structural layout deviations flagged"]
    },
    allotment_letter: {
      title: "Allotment Letter",
      description: "Formal letter issued by the builder acknowledging block booking, confirming unit specifications, payment plans, and specifications.",
      whyImportant: "Issued before the sale agreement is signed. Captures initial terms and booking amount receipt confirmation.",
      verifyTip: "Verify that room numbers, parking allocations, and carpet area definitions match your selection exactly.",
      checklist: ["Booking amount receipt is attached", "Carpet area matches floor plan details", "Allocated car parking slot specified", "Initial possession date committed"]
    }
  };

  // FAQ Advisor State
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  const advisorQuestions = [
    {
      q: "What is the difference between carpet area and super built-up area?",
      a: "Carpet area is the net usable floor area of an apartment, excluding the area covered by external walls, areas under services shafts, and exclusive balcony or verandah. RERA makes it mandatory for developers to sell homes solely based on carpet area. Super built-up area includes common areas like corridors, lift lobbies, and clubs, which can inflate the cost sheet by 30-40%."
    },
    {
      q: "What is a 7/12 (Satbara) extract, and how is it used in Gujarat and Maharashtra?",
      a: "The 7/12 (Satbara Utara) is an official land record extract maintained by the revenue departments of Maharashtra and Gujarat. It contains survey numbers, owner name details, cultivation details, and outstanding loans. It is the core proof of ownership for non-agricultural and agricultural land and must be checked to confirm that the developer actually owns the land before construction."
    },
    {
      q: "What action can I take if the developer delays possession beyond the committed RERA date?",
      a: "Under RERA Section 18, home buyers have the right to claim a full refund along with interest (usually SBI MCLR + 2%) from the date of delay until the refund is processed. Alternatively, if you wish to stay in the project, the developer must pay you monthly interest compensation for every month of delay until possession is handed over."
    },
    {
      q: "What is mutation of land records, and why is it necessary after purchase?",
      a: "Mutation (called 'Dakhil Kharij' or 'Namkaran') is the process of updating the government's land revenue registry to show that the ownership of the property has changed. While registration marks the transaction, mutation establishes your name in the government land records for property tax assessments and future sales."
    }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Real Estate Guidance Hub</h1>
        <p class="text-sm text-brand-muted">A comprehensive due diligence toolkit providing structural workflows, document analysis templates, official records links, and compliance guidelines.</p>
      </div>

      {/* Subtab Navigation */}
      <div class="flex border-b border-brand-border/60 pb-1.5 gap-2 select-none overflow-x-auto">
        <button 
          onClick={() => setSubTab('roadmap')}
          class={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            subTab === 'roadmap' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Buyer's Roadmap
        </button>
        <button 
          onClick={() => setSubTab('portals')}
          class={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            subTab === 'portals' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Official Compliance Portals
        </button>
        <button 
          onClick={() => setSubTab('docs')}
          class={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            subTab === 'docs' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Document Vault & Checksheets
        </button>
        <button 
          onClick={() => setSubTab('advisor')}
          class={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            subTab === 'advisor' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Compliance Q&A Advisor
        </button>
      </div>

      {/* Content Area */}
      <div class="animate-fade-in">
        
        {/* ROADMAP SUBTAB */}
        {subTab === 'roadmap' && (
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checklist items */}
            <div class="lg:col-span-2 space-y-5">
              <div class="glass-panel p-5 rounded-lg space-y-4">
                <div class="flex items-center justify-between border-b border-brand-border/60 pb-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-brand-text">Due Diligence Checklist</h3>
                  <span class="text-[10px] text-brand-accent font-bold bg-brand-accent/15 px-2 py-0.5 rounded border border-brand-accent/20">
                    Progress: {calculateProgress()}%
                  </span>
                </div>

                {/* Progress bar */}
                <div class="w-full bg-brand-bg rounded-full h-2 overflow-hidden border border-brand-border/40">
                  <div 
                    class="bg-brand-accent h-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>

                {/* Tasks list */}
                <div class="space-y-3 pt-2">
                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Phase 1: Pre-booking verification</h4>
                  
                  <div 
                    onClick={() => toggleStep('budget')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.budget ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.budget && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Verify Budget and Hidden Costs</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Factor in stamp duty (5-7%), registration charges (1%), maintenance deposits, and GST (5% for under-construction).</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleStep('reraVerify')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.reraVerify ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.reraVerify && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">RERA Portal Registration Check</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Lookup developer profile on official MahaRERA/GujRERA portals. Confirm committed possession dates and legal disputes.</p>
                    </div>
                  </div>

                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-muted pt-2">Phase 2: Legal Title Audit</h4>

                  <div 
                    onClick={() => toggleStep('titleSearch')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.titleSearch ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.titleSearch && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Conduct Title Search (30 Years)</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Audit parent deeds to verify that the developer holds absolute land transfer ownership with no pending family or court litigations.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleStep('encumbrance')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.encumbrance ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.encumbrance && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Obtain Encumbrance Certificate (EC)</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Ensure the property is free of bank mortgages or unpaid debts. Secure Form 16 (Nil Encumbrance Certificate).</p>
                    </div>
                  </div>

                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-muted pt-2">Phase 3: Purchase Agreement</h4>

                  <div 
                    onClick={() => toggleStep('draftAgreement')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.draftAgreement ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.draftAgreement && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Audit Draft Sale Agreement</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Ensure RERA guidelines are followed. Check for delay penalty commitments and carpet area specifications before paying booking amount.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleStep('circleRateCheck')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.circleRateCheck ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.circleRateCheck && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Calculate Valuation Against Circle Rates</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Compute government circle rates for the locality to avoid penal tax under Section 56(2)(x) of Income Tax Act if purchased below guide value.</p>
                    </div>
                  </div>

                  <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-muted pt-2">Phase 4: Registration & Mutation</h4>

                  <div 
                    onClick={() => toggleStep('stampDutyPay')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.stampDutyPay ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.stampDutyPay && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Stamp Duty Payment & Sub-Registrar Registry</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Register the sale deed in the local sub-registrar office within 4 months of execution to make the transaction legally valid.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleStep('mutationRecord')}
                    class="flex items-start gap-3 p-3 bg-brand-bg/40 border border-brand-border/30 rounded cursor-pointer hover:border-brand-border transition-colors select-none"
                  >
                    <div class={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completedSteps.mutationRecord ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border'
                    }`}>
                      {completedSteps.mutationRecord && <CheckCircle2 class="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <h5 class="text-xs font-bold text-brand-text">Execute Property Mutation (Namkaran)</h5>
                      <p class="text-[10px] text-brand-muted mt-0.5">Submit the registered sale deed copy to the municipal corporation/tehsildar registry to update land records and tax receipts to your name.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Sidebar quick info card */}
            <div class="space-y-5">
              <div class="glass-panel p-5 rounded-lg space-y-4">
                <div class="flex items-center gap-2 text-brand-accent border-b border-brand-border/60 pb-3">
                  <Info class="w-4 h-4" />
                  <h3 class="text-xs font-bold uppercase tracking-wider text-brand-text">Due Diligence Rule</h3>
                </div>
                <div class="text-xs space-y-3 leading-relaxed text-brand-muted">
                  <p>In India, real estate transactions are subject to the principle of <strong class="text-brand-text">Caveat Emptor</strong> (Buyer Beware).</p>
                  <p>Legally registered transaction deeds protect your claim to ownership, but they do <strong class="text-brand-text">not</strong> guarantee that the builder possesses the required clearances to construct or occupy the property.</p>
                  <p class="bg-brand-danger/10 border border-brand-danger/20 p-3 rounded text-[10px] text-brand-danger font-medium leading-relaxed">
                    Always cross-check municipal building clearance approvals and wait for the Occupancy Certificate (OC) before moving in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PORTALS SUBTAB */}
        {subTab === 'portals' && (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Portals cards */}
            <div class="glass-panel p-5 rounded-lg flex flex-col justify-between hover-card-lift">
              <div>
                <span class="text-[9px] px-2 py-0.5 bg-brand-accent/15 border border-brand-accent/25 rounded text-brand-accent font-bold uppercase tracking-wider">Maharashtra</span>
                <h3 class="text-sm font-bold text-brand-text mt-3">MahaRERA Official Directory</h3>
                <p class="text-xs text-brand-muted mt-2 leading-relaxed">Official search engine for builders, real estate projects, and agents registered under Maharashtra RERA. Look up project extension applications and active litigation reports.</p>
              </div>
              <a 
                href="https://maharerait.maharashtra.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                class="mt-5 text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1.5"
              >
                <span>Browse MahaRERA Portal</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>

            <div class="glass-panel p-5 rounded-lg flex flex-col justify-between hover-card-lift">
              <div>
                <span class="text-[9px] px-2 py-0.5 bg-brand-accent/15 border border-brand-accent/25 rounded text-brand-accent font-bold uppercase tracking-wider">Gujarat</span>
                <h3 class="text-sm font-bold text-brand-text mt-3">GujRERA Project Registry</h3>
                <p class="text-xs text-brand-muted mt-2 leading-relaxed">Official database for verified projects in Ahmedabad, Surat, and Gujarat. Audit files of structural engineers, completion certificates, and quarterly development logs.</p>
              </div>
              <a 
                href="https://gujrera.gujarat.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                class="mt-5 text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1.5"
              >
                <span>Browse GujRERA Portal</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>

            <div class="glass-panel p-5 rounded-lg flex flex-col justify-between hover-card-lift">
              <div>
                <span class="text-[9px] px-2 py-0.5 bg-brand-accent/15 border border-brand-accent/25 rounded text-brand-accent font-bold uppercase tracking-wider">Gujarat</span>
                <h3 class="text-sm font-bold text-brand-text mt-3">AnyROR Gujarat Land Records</h3>
                <p class="text-xs text-brand-muted mt-2 leading-relaxed">Official rural and urban land registry repository. Look up 8A, 7/12 extract reports, mutation progress, and survey numbers dynamically.</p>
              </div>
              <a 
                href="https://anyror.gujarat.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                class="mt-5 text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1.5"
              >
                <span>Browse AnyROR Gujarat</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>

            <div class="glass-panel p-5 rounded-lg flex flex-col justify-between hover-card-lift">
              <div>
                <span class="text-[9px] px-2 py-0.5 bg-brand-accent/15 border border-brand-accent/25 rounded text-brand-accent font-bold uppercase tracking-wider">Maharashtra</span>
                <h3 class="text-sm font-bold text-brand-text mt-3">MahaBhumi (Bhulekh Mahabhumi)</h3>
                <p class="text-xs text-brand-muted mt-2 leading-relaxed">Official portal for retrieving 7/12 extract certificates, 8A extracts, and mutation logs. Review the names of co-owners and legal land mortgage burdens.</p>
              </div>
              <a 
                href="https://mahabhulekh.maharashtra.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                class="mt-5 text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1.5"
              >
                <span>Browse MahaBhumi Portal</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>

            <div class="glass-panel p-5 rounded-lg flex flex-col justify-between hover-card-lift">
              <div>
                <span class="text-[9px] px-2 py-0.5 bg-brand-accent/15 border border-brand-accent/25 rounded text-brand-accent font-bold uppercase tracking-wider">Maharashtra</span>
                <h3 class="text-sm font-bold text-brand-text mt-3">IGR Maharashtra Stamp Registry</h3>
                <p class="text-xs text-brand-muted mt-2 leading-relaxed">Official Inspector General of Registration and Stamps index database. Inspect index 2 extracts, stamp duty calculator metrics, and certified transaction registries.</p>
              </div>
              <a 
                href="https://igrmaharashtra.gov.in" 
                target="_blank" 
                rel="noreferrer" 
                class="mt-5 text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1.5"
              >
                <span>Browse IGR Maharashtra</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </a>
            </div>

            <div class="glass-panel p-5 rounded-lg flex flex-col justify-between hover-card-lift border-dashed">
              <div class="flex flex-col items-center justify-center text-center h-full py-6">
                <HelpCircle class="w-8 h-8 text-brand-muted" />
                <h3 class="text-sm font-bold text-brand-text mt-3">Need Title Counsel?</h3>
                <p class="text-[10px] text-brand-muted mt-1 leading-relaxed max-w-[200px]">Review the document directory or consult local sub-registrar guidelines before final fee transfers.</p>
              </div>
            </div>
          </div>
        )}

        {/* DOCS SUBTAB */}
        {subTab === 'docs' && (
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of documents */}
            <div class="space-y-2">
              <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-3 select-none">Essential Paperwork</h4>
              {Object.entries(documents).map(([key, doc]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDoc(key)}
                  class={`w-full text-left p-4 rounded border transition-all flex items-start justify-between gap-3 ${
                    selectedDoc === key 
                      ? 'bg-brand-accent/10 border-brand-accent text-brand-text shadow-sm' 
                      : 'bg-brand-panel border-brand-border/60 text-brand-muted hover:text-brand-text hover:bg-brand-border/20'
                  }`}
                >
                  <div class="flex items-start gap-3">
                    <FileText class="w-4 h-4 shrink-0 mt-0.5 text-brand-accent" />
                    <div>
                      <span class="block text-xs font-bold text-brand-text">{doc.title}</span>
                      <span class="block text-[9px] text-brand-muted mt-0.5 line-clamp-1">{doc.description}</span>
                    </div>
                  </div>
                  <ArrowRight class="w-3.5 h-3.5 shrink-0 text-brand-muted mt-0.5" />
                </button>
              ))}
            </div>

            {/* Selected document detailed sheet */}
            <div class="lg:col-span-2">
              <div class="glass-panel p-5 rounded-lg space-y-5">
                <div class="border-b border-brand-border/60 pb-3 flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-extrabold text-brand-text">{documents[selectedDoc].title}</h3>
                    <span class="text-[9px] text-brand-accent font-semibold uppercase tracking-widest block mt-0.5">Security Validation Manual</span>
                  </div>
                  <button 
                    onClick={() => alert(`Simulating PDF check-sheet download for: ${documents[selectedDoc].title}`)}
                    class="bg-brand-border hover:bg-brand-border/80 text-brand-text rounded px-3 py-1.5 text-[9px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download class="w-3.5 h-3.5" />
                    <span>Get PDF Template</span>
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Legal Summary & Purpose</h4>
                    <p class="text-xs text-brand-text leading-relaxed mt-1">{documents[selectedDoc].description}</p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-brand-bg/40 border border-brand-border/40 rounded space-y-1.5">
                      <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-success flex items-center gap-1">
                        <CheckCircle2 class="w-3.5 h-3.5 fill-current" />
                        <span>Why It is Important</span>
                      </h4>
                      <p class="text-[10px] text-brand-muted leading-relaxed">{documents[selectedDoc].whyImportant}</p>
                    </div>

                    <div class="p-4 bg-brand-bg/40 border border-brand-border/40 rounded space-y-1.5">
                      <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-warning flex items-center gap-1">
                        <AlertCircle class="w-3.5 h-3.5" />
                        <span>How to Validate It</span>
                      </h4>
                      <p class="text-[10px] text-brand-muted leading-relaxed">{documents[selectedDoc].verifyTip}</p>
                    </div>
                  </div>

                  <div class="border-t border-brand-border/40 pt-3">
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-brand-text mb-3">Key Audit Checklist Items</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {documents[selectedDoc].checklist.map((item, idx) => (
                        <div key={idx} class="flex items-center gap-2 p-2 bg-brand-panel border border-brand-border/30 rounded text-[10px] text-brand-muted">
                          <CheckCircle2 class="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADVISOR SUBTAB */}
        {subTab === 'advisor' && (
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left selector */}
            <div class="space-y-4">
              <div class="glass-panel p-5 rounded-lg space-y-3">
                <div class="flex items-center gap-2 text-brand-accent">
                  <MessageSquare class="w-4 h-4" />
                  <h3 class="text-xs font-bold uppercase tracking-wider text-brand-text">Compliance Advisor</h3>
                </div>
                <p class="text-[10px] text-brand-muted leading-relaxed">Select a question below. The advisor agent compiles official guidelines according to RERA acts and legal jurisprudence.</p>
              </div>

              <div class="space-y-2">
                {advisorQuestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuestion(idx)}
                    class={`w-full text-left p-3.5 rounded border transition-all text-xs font-semibold ${
                      selectedQuestion === idx 
                        ? 'bg-brand-accent text-white border-brand-accent' 
                        : 'bg-brand-panel border-brand-border/60 text-brand-text hover:bg-brand-border/40'
                    }`}
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Right chat panel */}
            <div class="lg:col-span-2">
              <div class="glass-panel rounded-lg flex flex-col h-[400px] justify-between">
                
                {/* Chat window */}
                <div class="p-5 flex-1 overflow-y-auto space-y-4">
                  {selectedQuestion === null ? (
                    <div class="flex flex-col items-center justify-center text-center h-full text-brand-muted">
                      <HelpCircle class="w-12 h-12 text-brand-border animate-pulse-glowing" />
                      <p class="text-xs font-bold mt-4 text-brand-text">Advisor Inactive</p>
                      <p class="text-[10px] text-brand-muted max-w-[260px] mt-1 leading-relaxed">Select one of the legal due-diligence questions on the left panel to execute an advisor consult query.</p>
                    </div>
                  ) : (
                    <div class="space-y-4">
                      {/* User message */}
                      <div class="flex items-start gap-3 justify-end">
                        <div class="bg-brand-border/60 border border-brand-border px-3 py-2.5 rounded max-w-[80%] text-xs text-brand-text font-semibold">
                          {advisorQuestions[selectedQuestion].q}
                        </div>
                      </div>
                      
                      {/* System response */}
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0 select-none">
                          AI
                        </div>
                        <div class="bg-brand-bg border border-brand-border px-4 py-3 rounded max-w-[80%] text-xs text-brand-muted leading-relaxed space-y-2">
                          <p class="font-bold text-brand-text border-b border-brand-border pb-1 mb-2">Legal Guidance Response:</p>
                          <p>{advisorQuestions[selectedQuestion].a}</p>
                          <span class="block text-[8px] text-brand-accent font-semibold pt-1 uppercase">Source: RERA Act 2016 & Regional Rules</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer simulation */}
                <div class="p-3.5 border-t border-brand-border/60 bg-brand-bg/40 flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Submit a custom legal consultation query..." 
                    disabled 
                    class="flex-1 bg-brand-panel border border-brand-border rounded px-3 py-2 text-[10px] text-brand-muted cursor-not-allowed focus:outline-none"
                  />
                  <button 
                    disabled 
                    class="bg-brand-accent/50 text-white rounded px-4 py-2 text-[10px] font-bold cursor-not-allowed transition-colors"
                  >
                    Query
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
