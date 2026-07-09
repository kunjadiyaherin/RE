import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RefreshCw, ArrowUpRight, TrendingUp, Calendar } from 'lucide-react';
import { apiService } from '../apiService';

export default function HistoricalTab() {
  const [selectedArea, setSelectedArea] = useState('Ahmedabad - Thaltej');
  const [timeline, setTimeline] = useState('5Y'); // 1M, 6M, 1Y, 5Y
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const areas = [
    { label: "Ahmedabad - Thaltej", city: "Ahmedabad", locality: "Thaltej" },
    { label: "Ahmedabad - Science City", city: "Ahmedabad", locality: "Science City" },
    { label: "Ahmedabad - SG Highway", city: "Ahmedabad", locality: "Sarkhej-Gandhinagar Highway" },
    { label: "Mumbai - Lower Parel", city: "Mumbai", locality: "Lower Parel" },
    { label: "Mumbai - Thane West", city: "Mumbai", locality: "Thane West" },
    { label: "Mumbai - Powai", city: "Mumbai", locality: "Powai" },
    { label: "Mumbai - Worli", city: "Mumbai", locality: "Worli" },
    { label: "Mumbai - Pokhran Road", city: "Mumbai", locality: "Pokhran Road" },
    { label: "Pune - Hinjewadi", city: "Pune", locality: "Hinjewadi" },
    { label: "Pune - Wakad", city: "Pune", locality: "Wakad" },
    { label: "Surat - Vesu", city: "Surat", locality: "Vesu" },
    { label: "Surat - Adajan", city: "Surat", locality: "Adajan" }
  ];

  useEffect(() => {
    async function loadTrends() {
      setLoading(true);
      try {
        const area = areas.find(a => a.label === selectedArea);
        const forecastData = await apiService.getForecast(area.city, area.locality);
        
        let points = forecastData.historicalPoints || [];
        
        // Filter points based on timeline duration selection
        if (timeline === '1Y') {
          points = points.slice(-4); // last 4 quarters
        } else if (timeline === '6M') {
          points = points.slice(-2); // last 2 quarters
        }
        
        setTrends(points);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, [selectedArea, timeline]);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Aggregating Transaction ledger volumes...</p>
        </div>
      </div>
    );
  }

  const currentRate = trends.length > 0 ? trends[trends.length - 1].price : 0;
  const initialRate = trends.length > 0 ? trends[0].price : 0;
  const appreciationPercent = initialRate > 0 ? Math.round(((currentRate - initialRate) / initialRate) * 100) : 0;

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-brand-text">Historical Market Trend Engine</h1>
          <p class="text-sm text-brand-muted">Aggregated transaction rate movements compiled from sub-registrar registries.</p>
        </div>
        
        {/* Filters */}
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            class="bg-brand-panel border border-brand-border rounded px-3 py-1.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
          >
            {areas.map((a, i) => (
              <option key={i} value={a.label}>{a.label}</option>
            ))}
          </select>

          <div class="flex items-center bg-brand-panel border border-brand-border rounded overflow-hidden">
            {['6M', '1Y', '5Y'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeline(t)}
                class={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  timeline === t ? 'bg-brand-accent text-white' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Panel */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">Active Base Valuation</p>
            <h3 class="text-xl font-bold mt-1 text-brand-text">₹{currentRate.toLocaleString()} / Sqm</h3>
            <p class="text-[10px] text-brand-muted mt-1">Current quarter index average</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-accent shrink-0">
            <TrendingUp class="w-5 h-5" />
          </div>
        </div>

        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">Timeline Growth Rate</p>
            <h3 class="text-xl font-bold mt-1 text-brand-success flex items-center gap-1">
              <ArrowUpRight class="w-5 h-5" /> + {appreciationPercent}%
            </h3>
            <p class="text-[10px] text-brand-muted mt-1">Appreciation over chosen horizon</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-success shrink-0">
            <ArrowUpRight class="w-5 h-5" />
          </div>
        </div>

        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">Index Sample Horizon</p>
            <h3 class="text-xl font-bold mt-1 text-brand-text">{timeline === '5Y' ? '5 Years (18 Quarters)' : timeline === '1Y' ? '1 Year (4 Quarters)' : '6 Months'}</h3>
            <p class="text-[10px] text-brand-muted mt-1">Official registry publications filtered</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-accent shrink-0">
            <Calendar class="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Price appreciation index */}
        <div class="glass-panel p-5 rounded-lg space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Index Rate Appreciation (INR / Sqm)</h2>
          <div class="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101726', borderColor: '#1F2E4D', color: '#F3F4F6', fontSize: '11px', borderRadius: '4px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                {/* Solid Area fill (No Gradient) */}
                <Area type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.15} name="Rate Per Sqm" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction volume index */}
        <div class="glass-panel p-5 rounded-lg space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Aggregated Quarter Transaction Volumes</h2>
          <div class="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101726', borderColor: '#1F2E4D', color: '#F3F4F6', fontSize: '11px', borderRadius: '4px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                {/* Solid Bar fill (No Gradient) */}
                <Bar dataKey="price" name="Index Volume Indicator" fill="#6366F1" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
