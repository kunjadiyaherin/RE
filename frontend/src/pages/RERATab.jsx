import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, AlertTriangle, XCircle, Info, Calendar } from 'lucide-react';
import { apiService } from '../apiService';

export default function RERATab() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (codeToSearch = query) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await apiService.verifyProject(codeToSearch);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        status: 'Unverified',
        message: 'Network error or database query failed during regulatory verification.',
        details: null
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = [
    { label: "Lodha World Towers (Disputes Flag)", code: "P51900008345" },
    { label: "Maple Tree Garden Homes (Verified)", code: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA00289/280917" },
    { label: "Life Republic Pune (Delayed Risk)", code: "P52100026453" }
  ];

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Project Legitimacy Verification</h1>
        <p class="text-sm text-brand-muted">Cross-reference real estate builders and projects against official state RERA records.</p>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search Panel */}
        <div class="glass-panel p-5 rounded-lg space-y-4 h-fit">
          <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Search Regulatory Records</h2>
          <p class="text-xs text-brand-muted leading-relaxed">Enter an official state RERA registration number (e.g. MahaRERA or GujRERA codes) to audit license legitimacy.</p>
          
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. P51900008345"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              class="bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded p-2 flex items-center justify-center shrink-0"
            >
              <Search class="w-4 h-4" />
            </button>
          </div>

          <div class="pt-4 border-t border-brand-border space-y-3">
            <p class="text-xs font-semibold text-brand-text">Sample Public Project Codes:</p>
            <div class="space-y-2">
              {sampleCodes.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item.code);
                    handleSearch(item.code);
                  }}
                  class="w-full text-left p-2.5 bg-brand-bg hover:bg-brand-border rounded border border-brand-border text-xs text-brand-accent hover:text-brand-text truncate transition-colors"
                >
                  <p class="font-semibold text-[10px] text-brand-text">{item.label}</p>
                  <span class="text-[9px] text-brand-muted block mt-0.5">{item.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Report Display */}
        <div class="lg:col-span-2 space-y-6">
          {!searched ? (
            <div class="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-3 h-[300px]">
              <Info class="w-12 h-12 text-brand-muted" />
              <h3 class="text-base font-semibold text-brand-text">Legitimacy Audit Awaiting Input</h3>
              <p class="text-xs text-brand-muted max-w-sm">Enter a registration code or select a sample profile on the left to review the official public record audit sheet.</p>
            </div>
          ) : loading ? (
            <div class="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-3 h-[300px]">
              <div class="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin"></div>
              <p class="text-xs text-brand-muted">Retrieving regulatory ledger logs from GujRERA/MahaRERA API...</p>
            </div>
          ) : (
            <div class="space-y-6">
              
              {/* Audit Badge Card */}
              <div class={`glass-panel p-5 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 ${
                result.status === 'Verified' ? 'border-l-brand-success' : result.status === 'Risky' ? 'border-l-brand-warning' : 'border-l-brand-danger'
              }`}>
                <div>
                  <div class="flex items-center gap-2">
                    <span class={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      result.status === 'Verified' ? 'bg-brand-success/10 text-brand-success' : result.status === 'Risky' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-danger/10 text-brand-danger'
                    }`}>
                      {result.status}
                    </span>
                    <h3 class="text-sm font-semibold text-brand-muted">Project Audit Score</h3>
                  </div>
                  <p class="text-sm text-brand-text mt-2 font-medium">{result.message}</p>
                </div>
                <div class="shrink-0">
                  {result.status === 'Verified' && <CheckCircle class="w-12 h-12 text-brand-success" />}
                  {result.status === 'Risky' && <AlertTriangle class="w-12 h-12 text-brand-warning" />}
                  {result.status === 'Unverified' && <XCircle class="w-12 h-12 text-brand-danger" />}
                </div>
              </div>

              {/* Project Ledger Details */}
              {result.details && (
                <div class="glass-panel p-6 rounded-lg space-y-6">
                  <div class="border-b border-brand-border pb-4 flex justify-between items-start">
                    <div>
                      <span class="text-[10px] text-brand-accent font-bold uppercase tracking-wider">{result.details.state} RERA Record</span>
                      <h2 class="text-lg font-bold text-brand-text mt-1">{result.details.projectName}</h2>
                    </div>
                    <span class="text-[10px] bg-brand-border px-2 py-1 rounded text-brand-text font-semibold uppercase">{result.details.projectType}</span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-1">
                      <p class="text-[10px] text-brand-muted uppercase font-semibold">Registration License</p>
                      <p class="text-xs font-semibold text-brand-text select-all">{result.details.registrationNumber}</p>
                    </div>

                    <div class="space-y-1">
                      <p class="text-[10px] text-brand-muted uppercase font-semibold">Promoter / Builder Entity</p>
                      <p class="text-xs font-semibold text-brand-accent hover:underline cursor-pointer">{result.details.builderName}</p>
                    </div>

                    <div class="space-y-1">
                      <p class="text-[10px] text-brand-muted uppercase font-semibold">Locality / Micro-market</p>
                      <p class="text-xs font-semibold text-brand-text">{result.details.locality}, {result.details.city}</p>
                    </div>

                    <div class="space-y-1">
                      <p class="text-[10px] text-brand-muted uppercase font-semibold">Total Plot Area</p>
                      <p class="text-xs font-semibold text-brand-text">{result.details.totalAreaSqm.toLocaleString()} Sq Meters</p>
                    </div>

                    <div class="space-y-1">
                      <p class="text-[10px] text-brand-muted uppercase font-semibold">RERA Commencement Status</p>
                      <span class={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        result.details.completionStatus === 'Completed' ? 'bg-brand-success/10 text-brand-success' : result.details.completionStatus === 'Ongoing' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-warning/10 text-brand-warning'
                      }`}>{result.details.completionStatus}</span>
                    </div>

                    <div class="space-y-1">
                      <p class="text-[10px] text-brand-muted uppercase font-semibold">Timeline Delays Checked</p>
                      <p class={`text-xs font-bold ${result.details.delayedMonths > 0 ? 'text-brand-warning' : 'text-brand-success'}`}>
                        {result.details.delayedMonths > 0 ? `${result.details.delayedMonths} Months Beyond Target` : 'On Schedule'}
                      </p>
                    </div>
                  </div>

                  {/* Legal Disputations check */}
                  {result.details.legalDisputeFlags && (
                    <div class="p-4 bg-brand-danger/10 border border-brand-danger rounded-lg flex gap-3">
                      <ShieldAlert class="w-5 h-5 text-brand-danger shrink-0 mt-0.5" />
                      <div>
                        <h4 class="text-xs font-bold text-brand-text">Active Legal Dispute Flagged</h4>
                        <p class="text-[11px] text-brand-muted mt-1 leading-relaxed">{result.details.disputeDetails}</p>
                      </div>
                    </div>
                  )}

                  {/* Approvals Checklist */}
                  <div class="space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-brand-text">Government Approvals & NOC Checklist</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.details.legalApprovals.map((app, idx) => (
                        <div key={idx} class="p-2.5 bg-brand-bg rounded border border-brand-border flex items-center gap-2">
                          <div class="w-2 h-2 rounded-full bg-brand-success"></div>
                          <span class="text-xs text-brand-text font-medium">{app}</span>
                          <span class="text-[9px] text-brand-success font-semibold ml-auto uppercase bg-brand-success/10 px-1 rounded">Verified</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
