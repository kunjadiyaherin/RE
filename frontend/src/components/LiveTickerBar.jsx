import React, { useEffect, useState } from 'react';
import { apiService } from '../apiService';
import { Globe, TrendingUp, Wind, RefreshCw, DollarSign } from 'lucide-react';

export default function LiveTickerBar({ selectedCurrency = 'INR', onCurrencyChange }) {
  const [ticker, setTicker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTicker = async () => {
    try {
      const data = await apiService.getLiveTicker();
      setTicker(data);
    } catch (err) {
      console.warn('Ticker error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 60000); // 1 minute live refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono gap-3 z-30 select-none">
      {/* Left: Stitch Live Indicator */}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-dashed border-cyan-400/40 text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          STITCH LIVE OPEN DATA
        </span>
        <span className="hidden md:inline text-[11px] text-slate-400">
          Source: OpenStreetMap • Open-Meteo • Frankfurter • World Bank
        </span>
      </div>

      {/* Center: Live Metrics Ticker */}
      <div className="flex items-center gap-4 overflow-x-auto py-0.5 text-[11px]">
        {/* USD/INR */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 font-sans">USD/INR:</span>
          <span className="font-bold text-emerald-400">₹{ticker?.forex?.INR ? ticker.forex.INR.toFixed(2) : '95.82'}</span>
        </div>

        {/* EUR/INR */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 font-sans">EUR/INR:</span>
          <span className="font-bold text-cyan-400">₹{ticker?.forex?.INR && ticker?.forex?.EUR ? (ticker.forex.INR / ticker.forex.EUR).toFixed(2) : '108.50'}</span>
        </div>

        {/* World Bank CPI Inflation */}
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-sans">India CPI:</span>
          <span className="font-bold text-amber-300">{ticker?.macro?.cpiInflation || 4.8}%</span>
        </div>

        {/* Open-Meteo Live City Temp & AQI */}
        {ticker?.cities?.map(city => (
          <div key={city.name} className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-sans">{city.name}:</span>
            <span className="text-slate-200">{city.temperature}°C</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1 rounded">AQI {city.aqi}</span>
          </div>
        ))}
      </div>

      {/* Right: Currency Toggle */}
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <span className="text-[10px] text-slate-400 uppercase hidden lg:inline">Valuation Base:</span>
        <div className="inline-flex rounded-lg p-0.5 bg-slate-900/90 border border-white/10 text-[10px]">
          {['INR', 'USD', 'EUR'].map(cur => (
            <button
              key={cur}
              onClick={() => onCurrencyChange && onCurrencyChange(cur)}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedCurrency === cur 
                  ? 'bg-cyan-500 text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cur === 'INR' ? '₹ INR' : cur === 'USD' ? '$ USD' : '€ EUR'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
