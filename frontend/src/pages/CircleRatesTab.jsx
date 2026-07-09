import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RefreshCw, TrendingUp, Info } from 'lucide-react';
import { apiService } from '../apiService';

export default function CircleRatesTab() {
  const [city, setCity] = useState('Ahmedabad');
  const [circleRates, setCircleRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCircleRates() {
      setLoading(true);
      try {
        const data = await apiService.getCircleRates({ city });
        setCircleRates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCircleRates();
  }, [city]);

  // Map data for Recharts
  const chartData = circleRates.map(r => ({
    locality: r.locality,
    circleRate: r.circleRatePerSqm,
    marketRate: r.marketRatePerSqm
  }));

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Aggregating Local circle rate datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-brand-text">Circle Rate Analyzer</h1>
          <p class="text-sm text-brand-muted">Evaluate official municipal circle rates/stamp valuation indices against registered market sale values.</p>
        </div>
        
        {/* City Filter */}
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-xs text-brand-muted font-semibold uppercase">City Index:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            class="bg-brand-panel border border-brand-border rounded px-3 py-1.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
          >
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Surat">Surat</option>
          </select>
        </div>
      </div>

      {/* Analytics Chart Block */}
      <div class="glass-panel p-5 rounded-lg space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Valuation Gaps: Circle Rate vs Market Price (₹/Sqm)</h2>
          <span class="text-[10px] text-brand-accent bg-brand-bg px-2 py-0.5 rounded border border-brand-border font-bold uppercase">Dynamic Spread Chart</span>
        </div>

        <div class="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <XAxis dataKey="locality" stroke="#9CA3AF" fontSize={10} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#101726', borderColor: '#1F2E4D', color: '#F3F4F6', fontSize: '11px', borderRadius: '4px' }}
                itemStyle={{ color: '#F3F4F6' }}
              />
              <Legend verticalAlign="top" height={36} iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#9CA3AF' }} />
              {/* Solid fills (no gradients) */}
              <Bar dataKey="circleRate" name="Govt Circle Rate" fill="#6366F1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="marketRate" name="Avg Market Rate" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Variance Matrix Table */}
      <div class="glass-panel p-5 rounded-lg space-y-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Local Valuation Spread & Variance Index</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-brand-border text-brand-muted uppercase font-bold text-[10px] tracking-wider bg-brand-bg">
                <th class="p-3.5">Locality</th>
                <th class="p-3.5">Circle Rate (₹/Sqm)</th>
                <th class="p-3.5">Market Price (₹/Sqm)</th>
                <th class="p-3.5">Valuation Spread</th>
                <th class="p-3.5">Classification</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-border/40">
              {circleRates.map((r, index) => (
                <tr key={index} class="hover:bg-brand-border/20 transition-colors">
                  <td class="p-3.5 font-bold text-brand-text">{r.locality}</td>
                  <td class="p-3.5 font-mono font-medium text-brand-text">₹{r.circleRatePerSqm.toLocaleString()}</td>
                  <td class="p-3.5 font-mono font-medium text-brand-text">₹{r.marketRatePerSqm.toLocaleString()}</td>
                  <td class="p-3.5 font-mono font-semibold">
                    <span class={r.variancePercent > 15 ? 'text-brand-warning' : 'text-brand-success'}>
                      + {r.variancePercent}% Gap
                    </span>
                  </td>
                  <td class="p-3.5">
                    <span class={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                      r.classification === 'Premium Gap' ? 'bg-brand-warning/15 text-brand-warning' : 'bg-brand-success/15 text-brand-success'
                    }`}>{r.classification}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
