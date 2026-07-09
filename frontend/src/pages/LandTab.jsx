import React, { useState } from 'react';
import { FileText, ShieldAlert, CheckCircle, Info, Calendar, GitCommit } from 'lucide-react';
import { apiService } from '../apiService';

export default function LandTab() {
  const [params, setParams] = useState({
    state: 'Gujarat',
    district: 'Ahmedabad',
    taluka: 'Daskroi',
    village: 'Jetalpur',
    surveyNumber: '142/A'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (lookupParams = params) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await apiService.lookupLand(lookupParams);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        found: false,
        message: 'Database query timeout or sub-registrar portal connection issues.',
        record: null
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleSurveys = [
    { label: "Jetalpur Survey 142/A (NA Residential)", state: "Gujarat", district: "Ahmedabad", taluka: "Daskroi", village: "Jetalpur", surveyNumber: "142/A" },
    { label: "Dumas Survey 228/1 (Agri - CRZ Restriction)", state: "Gujarat", district: "Surat", taluka: "Choryasi", village: "Dumas", surveyNumber: "228/1" },
    { label: "Maan Survey 89/5 (NA Mulshi)", state: "Maharashtra", district: "Pune", taluka: "Mulshi", village: "Maan", surveyNumber: "89/5" }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Land Intelligence Dashboard</h1>
        <p class="text-sm text-brand-muted">Search cadastral maps, land ownership registers (7/12 & 8A forms), zoning categories, and mutation timelines.</p>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search Parameters Form */}
        <div class="glass-panel p-5 rounded-lg space-y-4 h-fit">
          <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Cadastral Search</h2>
          
          <div class="space-y-3">
            <div>
              <label class="text-[10px] text-brand-muted uppercase font-bold block mb-1">State Jurisdiction</label>
              <select
                value={params.state}
                onChange={(e) => {
                  const state = e.target.value;
                  const defaults = state === 'Gujarat' 
                    ? { district: 'Ahmedabad', taluka: 'Daskroi', village: 'Jetalpur', surveyNumber: '142/A' }
                    : { district: 'Pune', taluka: 'Mulshi', village: 'Maan', surveyNumber: '89/5' };
                  setParams({ state, ...defaults });
                }}
                class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
              >
                <option value="Gujarat">Gujarat (AnyROR)</option>
                <option value="Maharashtra">Maharashtra (Bhulekh)</option>
              </select>
            </div>

            <div>
              <label class="text-[10px] text-brand-muted uppercase font-bold block mb-1">District / Revenue Area</label>
              <input
                type="text"
                value={params.district}
                onChange={(e) => setParams({ ...params, district: e.target.value })}
                class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[10px] text-brand-muted uppercase font-bold block mb-1">Taluka / Tehsil</label>
                <input
                  type="text"
                  value={params.taluka}
                  onChange={(e) => setParams({ ...params, taluka: e.target.value })}
                  class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label class="text-[10px] text-brand-muted uppercase font-bold block mb-1">Village</label>
                <input
                  type="text"
                  value={params.village}
                  onChange={(e) => setParams({ ...params, village: e.target.value })}
                  class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            <div>
              <label class="text-[10px] text-brand-muted uppercase font-bold block mb-1">Survey Number / Gut Number</label>
              <input
                type="text"
                placeholder="e.g. 142/A"
                value={params.surveyNumber}
                onChange={(e) => setParams({ ...params, surveyNumber: e.target.value })}
                class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
              />
            </div>

            <button
              onClick={() => handleLookup()}
              disabled={loading}
              class="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded py-2 text-xs font-bold transition-colors mt-2"
            >
              Verify Survey Index
            </button>
          </div>

          <div class="pt-4 border-t border-brand-border space-y-3">
            <p class="text-xs font-semibold text-brand-text">Sample Public Registers:</p>
            <div class="space-y-2">
              {sampleSurveys.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setParams(item);
                    handleLookup(item);
                  }}
                  class="w-full text-left p-2.5 bg-brand-bg hover:bg-brand-border rounded border border-brand-border text-xs text-brand-accent hover:text-brand-text truncate transition-colors"
                >
                  <p class="font-semibold text-[10px] text-brand-text">{item.label}</p>
                  <span class="text-[9px] text-brand-muted block mt-0.5">{item.state} • Survey {item.surveyNumber}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Survey Verification Output Display */}
        <div class="lg:col-span-2 space-y-6">
          {!searched ? (
            <div class="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-3 h-[380px]">
              <FileText class="w-12 h-12 text-brand-muted" />
              <h3 class="text-base font-semibold text-brand-text">Land Records Auditing</h3>
              <p class="text-xs text-brand-muted max-w-sm">Enter survey specifications or select a sample registry entry on the left to verify mutation timelines and land classifications.</p>
            </div>
          ) : loading ? (
            <div class="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-3 h-[380px]">
              <div class="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin"></div>
              <p class="text-xs text-brand-muted">Fetching official RoR records (Form 7/12) from database...</p>
            </div>
          ) : !result.found ? (
            <div class="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-3 h-[380px] border-l-4 border-l-brand-danger">
              <ShieldAlert class="w-12 h-12 text-brand-danger" />
              <h3 class="text-base font-bold text-brand-text">No Matching Survey Record Found</h3>
              <p class="text-xs text-brand-muted max-w-sm">{result.message}</p>
            </div>
          ) : (
            <div class="space-y-6">
              
              {/* Record Summary */}
              <div class="glass-panel p-6 rounded-lg space-y-6">
                <div class="border-b border-brand-border pb-4 flex justify-between items-start">
                  <div>
                    <span class="text-[10px] text-brand-accent font-bold uppercase tracking-wider">{result.record.state} Revenue Registry</span>
                    <h2 class="text-lg font-bold text-brand-text mt-1">Survey Number {result.record.surveyNumber}</h2>
                    <p class="text-xs text-brand-muted mt-1">Village: {result.record.village}, Taluka: {result.record.taluka}, District: {result.record.district}</p>
                  </div>
                  <span class={`text-[10px] px-2.5 py-1 rounded text-white font-bold uppercase ${
                    result.record.landCategory.includes('Agricultural') ? 'bg-brand-warning' : 'bg-brand-success'
                  }`}>{result.record.landCategory}</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <p class="text-[10px] text-brand-muted uppercase font-semibold">Registered Land Owner</p>
                    <p class="text-xs font-semibold text-brand-text select-all">{result.record.ownerName}</p>
                  </div>

                  <div class="space-y-1">
                    <p class="text-[10px] text-brand-muted uppercase font-semibold">Total Land Area (Hectares)</p>
                    <p class="text-xs font-semibold text-brand-text">{result.record.areaHectares} Ha ({Math.round(result.record.areaHectares * 2.471)} Acres)</p>
                  </div>
                </div>

                {/* Government Restrictions Box */}
                <div class="space-y-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-brand-text">Regulatory Restrictions & Buffer Zones</h4>
                  <div class="p-4 bg-brand-bg border border-brand-border rounded-lg flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <ShieldAlert class={`w-5 h-5 ${result.record.governmentRestrictions.some(r => r.toLowerCase() !== 'none') ? 'text-brand-danger' : 'text-brand-success'}`} />
                      <div class="text-xs">
                        {result.record.governmentRestrictions.map((res, i) => (
                          <p key={i} class="font-semibold text-brand-text">{res}</p>
                        ))}
                      </div>
                    </div>
                    {result.record.governmentRestrictions.some(r => r.toLowerCase() !== 'none') ? (
                      <span class="text-[10px] bg-brand-danger/10 text-brand-danger px-2 py-0.5 rounded font-bold uppercase shrink-0">CRITICAL HOLD</span>
                    ) : (
                      <span class="text-[10px] bg-brand-success/10 text-brand-success px-2 py-0.5 rounded font-bold uppercase shrink-0">CLEAR ZONE</span>
                    )}
                  </div>
                </div>

                {/* Mutation History Timeline */}
                <div class="space-y-4 pt-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-brand-text">Property Mutation Transfer History (Form 6 Ledger)</h4>
                  <div class="space-y-4 pl-3 relative border-l border-brand-border ml-2">
                    {result.record.mutationHistory.map((mut, idx) => (
                      <div key={idx} class="relative pl-6">
                        {/* Bullet point node */}
                        <div class="absolute -left-[16px] top-1 bg-brand-bg p-0.5 text-brand-accent">
                          <GitCommit class="w-3.5 h-3.5" />
                        </div>
                        <div class="p-3 bg-brand-bg rounded border border-brand-border">
                          <div class="flex flex-col md:flex-row md:items-center justify-between gap-1.5 pb-2 border-b border-brand-border/40">
                            <span class="text-[9px] bg-brand-border px-1.5 py-0.5 rounded text-brand-text font-bold select-all">Mutation Ref: {mut.mutationNumber}</span>
                            <span class="text-[10px] text-brand-muted flex items-center gap-1.5">
                              <Calendar class="w-3 h-3 text-brand-muted" /> {new Date(mut.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div class="text-[11px] space-y-0.5">
                              <p class="text-brand-muted font-semibold">Transaction Parties:</p>
                              <p class="text-brand-text"><span class="text-brand-muted">Seller:</span> {mut.seller}</p>
                              <p class="text-brand-text"><span class="text-brand-muted">Buyer:</span> {mut.buyer}</p>
                            </div>
                            <div class="text-[11px] space-y-0.5">
                              <p class="text-brand-muted font-semibold">Legal Category & Remarks:</p>
                              <p class="text-brand-text"><span class="text-brand-muted">Type:</span> {mut.mutationType}</p>
                              <p class="text-brand-text"><span class="text-brand-muted">Notes:</span> {mut.remarks}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
