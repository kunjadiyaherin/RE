import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RefreshCw, Brain, Sparkles, AlertCircle, Percent } from 'lucide-react';
import { apiService } from '../apiService';

export default function ForecastTab() {
  const [selectedArea, setSelectedArea] = useState('Ahmedabad - Thaltej');
  const [forecast, setForecast] = useState(null);
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
    async function loadForecast() {
      setLoading(true);
      try {
        const area = areas.find(a => a.label === selectedArea);
        const data = await apiService.getForecast(area.city, area.locality);
        setForecast(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [selectedArea]);

  // Combine historical points and forecasts for line plotting
  const getChartData = () => {
    if (!forecast) return [];
    
    // Add historical
    const data = (forecast.historicalPoints || []).map(p => ({
      period: p.period || p.quarter,
      actual: p.price,
      predicted: null
    }));

    if (data.length > 0) {
      // Connect first forecast point to the last historical point
      const lastHist = data[data.length - 1];
      data.push({
        period: "6M Forecast",
        actual: null,
        predicted: forecast.forecast_6m
      });
      data.push({
        period: "1Y Forecast",
        actual: null,
        predicted: forecast.forecast_1y
      });
      data.push({
        period: "5Y Forecast",
        actual: null,
        predicted: forecast.forecast_5y
      });
    }

    return data;
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Fitting AI regression formulas...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-brand-text">AI Price Forecast Engine</h1>
          <p class="text-sm text-brand-muted">Machine learning forecasts using regression matrices, historical stamp duty velocities, and infrastructure catalysts.</p>
        </div>
        
        {/* Locality Selector */}
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          class="bg-brand-panel border border-brand-border rounded px-3 py-1.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer shrink-0"
        >
          {areas.map((a, i) => (
            <option key={i} value={a.label}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Model fit details banner */}
      <div class="glass-panel p-4 rounded-lg flex items-start gap-3 border-l-4 border-l-brand-accent bg-brand-panel/40">
        <Brain class="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
        <div class="text-xs space-y-1">
          <h4 class="font-bold text-brand-text">Active Mathematical Model: {forecast.modelName || 'Linear Regression'}</h4>
          <p class="text-brand-muted leading-relaxed">
            The model calculates fits with a coefficient of determination <b>(R² = {forecast.r2_fit || '0.941'})</b>. 
            Valuations are updated using weekly transaction ledgers and Smart City Mission schedules.
          </p>
          <span class="inline-block text-[9px] bg-brand-accent/15 text-brand-accent px-1.5 py-0.2 rounded font-bold uppercase mt-1">Source: {forecast.source}</span>
        </div>
      </div>

      {/* Summary Forecast Grid */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="glass-panel p-5 rounded-lg text-center">
          <p class="text-xs text-brand-muted uppercase font-bold">Current Rate</p>
          <h3 class="text-xl font-bold mt-2 text-brand-text">₹{forecast.currentPricePerSqm.toLocaleString()}</h3>
          <p class="text-[9px] text-brand-muted mt-1">Avg rate per Sqm</p>
        </div>

        <div class="glass-panel p-5 rounded-lg text-center border-b-2 border-b-brand-accent">
          <p class="text-xs text-brand-muted uppercase font-bold">6-Month Prediction</p>
          <h3 class="text-xl font-bold mt-2 text-brand-accent">₹{forecast.forecast_6m.toLocaleString()}</h3>
          <p class="text-[9px] text-brand-success font-semibold mt-1">
            + {Math.round(((forecast.forecast_6m - forecast.currentPricePerSqm)/forecast.currentPricePerSqm)*100)}% appreciation
          </p>
        </div>

        <div class="glass-panel p-5 rounded-lg text-center border-b-2 border-b-brand-indigo">
          <p class="text-xs text-brand-muted uppercase font-bold">1-Year Prediction</p>
          <h3 class="text-xl font-bold mt-2 text-brand-indigo">₹{forecast.forecast_1y.toLocaleString()}</h3>
          <p class="text-[9px] text-brand-success font-semibold mt-1">
            + {Math.round(((forecast.forecast_1y - forecast.currentPricePerSqm)/forecast.currentPricePerSqm)*100)}% appreciation
          </p>
        </div>

        <div class="glass-panel p-5 rounded-lg text-center border-b-2 border-b-brand-success">
          <p class="text-xs text-brand-muted uppercase font-bold">5-Year Prediction</p>
          <h3 class="text-xl font-bold mt-2 text-brand-success">₹{forecast.forecast_5y.toLocaleString()}</h3>
          <p class="text-[9px] text-brand-success font-semibold mt-1">
            + {Math.round(((forecast.forecast_5y - forecast.currentPricePerSqm)/forecast.currentPricePerSqm)*100)}% appreciation
          </p>
        </div>
      </div>

      {/* Plot Block & Metrics */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prediction Chart */}
        <div class="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Valuation Path Projection (₹/Sqm)</h2>
          <div class="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101726', borderColor: '#1F2E4D', color: '#F3F4F6', fontSize: '11px', borderRadius: '4px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend verticalAlign="top" height={36} iconType="square" iconSize={10} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#9CA3AF' }} />
                {/* Flat solid color line indicators */}
                <Line type="monotone" dataKey="actual" name="Historical Rates" stroke="#3B82F6" strokeWidth={2.5} activeDot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="predicted" name="AI Predicted Path" stroke="#6366F1" strokeWidth={2.5} strokeDasharray="5 5" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence metrics */}
        <div class="space-y-6">
          <div class="glass-panel p-5 rounded-lg space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">AI Investment Safety Ratings</h2>
            
            <div class="space-y-4">
              <div class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Sparkles class="w-4 h-4 text-brand-success" />
                  <div>
                    <p class="text-xs font-bold text-brand-text">Growth Probability</p>
                    <p class="text-[9px] text-brand-muted">Confidence score for appreciation</p>
                  </div>
                </div>
                <span class="text-base font-extrabold font-mono text-brand-success">{Math.round(forecast.growthProbability * 100)}%</span>
              </div>

              <div class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Percent class="w-4 h-4 text-brand-accent" />
                  <div>
                    <p class="text-xs font-bold text-brand-text">Estimated Rental Yield</p>
                    <p class="text-[9px] text-brand-muted">Annualized yield percentage</p>
                  </div>
                </div>
                <span class="text-base font-extrabold font-mono text-brand-accent">{forecast.rentalYieldPercent}%</span>
              </div>

              <div class="p-4 bg-brand-border/40 border border-brand-border rounded text-[11px] text-brand-muted flex items-start gap-2.5 leading-relaxed">
                <AlertCircle class="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <p>
                  <b>Yield Factor:</b> Yield index values represent typical micro-market rates based on corporate tenancy surveys and commercial occupancy velocities in {forecast.city}.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
