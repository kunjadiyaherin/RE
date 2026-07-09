import React, { useState, useEffect } from 'react';
import { RefreshCw, BarChart2, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { apiService } from '../apiService';

export default function ComparisonTab() {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('investmentScore');

  useEffect(() => {
    async function loadComparisons() {
      setLoading(true);
      try {
        const data = await apiService.getCityComparison();
        setComparisons(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadComparisons();
  }, []);

  const handleSort = (field) => {
    setSortField(field);
  };

  const sortedComparisons = [...comparisons].sort((a, b) => b[sortField] - a[sortField]);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Running city comparison matrices...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Compare Cities</h1>
        <p class="text-sm text-brand-muted">Side-by-side analytical benchmarking of India's core property markets based on development indices.</p>
      </div>

      {/* Comparison Grid Table */}
      <div class="glass-panel p-5 rounded-lg space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-brand-border pb-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Municipal Analytics Leaderboard</h2>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-brand-muted">Sort By Rank:</span>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              class="bg-brand-bg border border-brand-border rounded px-2.5 py-1 text-xs text-brand-accent focus:outline-none cursor-pointer"
            >
              <option value="investmentScore">Investment Attractiveness</option>
              <option value="infrastructureGrowth">Infrastructure Growth</option>
              <option value="realEstateDemand">Real Estate Demand</option>
              <option value="averageTransactionValueINR">Average Transaction Value</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-brand-border text-brand-muted uppercase font-bold text-[10px] tracking-wider bg-brand-bg">
                <th class="p-4">Rank / City</th>
                <th class="p-4 text-center">Infra Growth (1-100)</th>
                <th class="p-4 text-center">Demand Index (1-100)</th>
                <th class="p-4 text-center">Avg Ticket Value</th>
                <th class="p-4 text-center">Urban Expansion</th>
                <th class="p-4 text-center">Investment Attractiveness</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-border/40">
              {sortedComparisons.map((cityData, index) => (
                <tr key={index} class="hover:bg-brand-border/20 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <span class="w-5 h-5 bg-brand-border rounded-full flex items-center justify-center font-bold text-[10px] text-brand-accent font-mono">
                        {index + 1}
                      </span>
                      <div>
                        <h4 class="font-bold text-brand-text text-sm">{cityData.city}</h4>
                        <p class="text-[9px] text-brand-muted mt-0.5 leading-relaxed max-w-[250px]">{cityData.keyDrivers}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td class="p-4 text-center font-bold font-mono text-brand-text">
                    {cityData.infrastructureGrowth}%
                  </td>
                  
                  <td class="p-4 text-center font-bold font-mono text-brand-text">
                    {cityData.realEstateDemand}%
                  </td>

                  <td class="p-4 text-center font-mono text-brand-text font-medium">
                    ₹{(cityData.averageTransactionValueINR / 100000).toFixed(1)} Lakhs
                  </td>

                  <td class="p-4 text-center font-mono text-brand-muted">
                    + {cityData.urbanExpansionRate}%
                  </td>

                  <td class="p-4 text-center">
                    <span class={`inline-block font-bold text-xs font-mono px-3 py-1 rounded ${
                      cityData.investmentScore >= 90 ? 'bg-brand-success/15 text-brand-success' : 'bg-brand-accent/15 text-brand-accent'
                    }`}>
                      {cityData.investmentScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Warning */}
      <div class="p-4 bg-brand-bg border border-brand-border rounded-lg flex gap-3">
        <Info class="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
        <p class="text-xs text-brand-muted leading-relaxed">
          <b>Data Sourcing:</b> Urban expansion rates and household income profiles are compiled from the Census of India registries and city-specific master zoning development plans (Smart City mission logs). Metrics updates are triggered bi-annually.
        </p>
      </div>

    </div>
  );
}
