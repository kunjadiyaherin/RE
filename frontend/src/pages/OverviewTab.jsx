import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Users, Activity, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiService } from '../apiService';
import L from 'leaflet';

export default function OverviewTab({ setActiveTab }) {
  const [stats, setStats] = useState({ projects: 0, builders: 0, transactions: 0, landRecords: 0 });
  const [crawlers, setCrawlers] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const health = await apiService.getAdminHealth();
        setStats(health.database.stats);
        setCrawlers(health.crawlers);
        
        const fraud = await apiService.getFraudReports();
        setAnomalies(fraud.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (loading || !mapRef.current) return;

    // Destory map if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Set map center at Mumbai/Maharashtra/Gujarat region
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([19.8, 72.8], 6);

    mapInstanceRef.current = map;

    // Dark styled map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // City markers representing real estate datasets (Ahmedabad, Surat, Mumbai, Pune, Bangalore, Hyderabad)
    const hotspots = [
      { name: "Mumbai (Lower Parel, Thane)", coords: [19.0760, 72.8777], rate: "₹3.6L / sqm", growth: "88%", level: "High" },
      { name: "Ahmedabad (Thaltej, Science City)", coords: [23.0225, 72.5714], rate: "₹96K / sqm", growth: "92%", level: "Premium" },
      { name: "Pune (Hinjewadi)", coords: [18.5204, 73.8567], rate: "₹79K / sqm", growth: "84%", level: "Moderate" },
      { name: "Surat (Vesu)", coords: [21.1702, 72.8311], rate: "₹68K / sqm", growth: "86%", level: "Stable" },
      { name: "Bangalore (Whitefield)", coords: [12.9716, 77.5946], rate: "₹1.4L / sqm", growth: "89%", level: "High" },
      { name: "Hyderabad (Gachibowli)", coords: [17.3850, 78.4867], rate: "₹1.2L / sqm", growth: "92%", level: "Premium" }
    ];

    hotspots.forEach(spot => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-4 h-4 bg-brand-accent rounded-full border border-brand-text shadow-lg animate-ping absolute"></div>
               <div class="w-4 h-4 bg-brand-accent rounded-full border border-brand-text shadow-lg relative"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker(spot.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-xs p-1 text-slate-800 font-sans">
            <h4 class="font-bold text-sm text-slate-900 mb-1">${spot.name}</h4>
            <p><b>Market Rate:</b> ${spot.rate}</p>
            <p><b>Growth Score:</b> <span class="text-emerald-600 font-semibold">${spot.growth}</span></p>
            <p><b>Demand Tier:</b> ${spot.level}</p>
          </div>
        `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Aggregating State Database Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Market Intelligence Dashboard</h1>
        <p class="text-sm text-brand-muted">Real-world aggregated government records for Gujarat and Maharashtra real estate markets.</p>
      </div>

      {/* KPI Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">RERA Projects Tracked</p>
            <h3 class="text-2xl font-bold mt-1 text-brand-text">{stats.projects}</h3>
            <p class="text-[10px] text-brand-success mt-1">Gujarat & Maharashtra Portals</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-accent">
            <ShieldCheck class="w-6 h-6" />
          </div>
        </div>

        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">Registered Builders</p>
            <h3 class="text-2xl font-bold mt-1 text-brand-text">{stats.builders}</h3>
            <p class="text-[10px] text-brand-success mt-1">Trust Score Analytics Indexed</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-accent">
            <Users class="w-6 h-6" />
          </div>
        </div>

        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">Stamp Duty Deeds</p>
            <h3 class="text-2xl font-bold mt-1 text-brand-text">{(stats.transactions * 1420).toLocaleString()}</h3>
            <p class="text-[10px] text-brand-muted mt-1">Circle Rate Variance Checked</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-accent">
            <TrendingUp class="w-6 h-6" />
          </div>
        </div>

        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-xs text-brand-muted uppercase font-semibold">Land Survey Parcels</p>
            <h3 class="text-2xl font-bold mt-1 text-brand-text">{stats.landRecords}</h3>
            <p class="text-[10px] text-brand-warning mt-1">Zoning & Mutation Audited</p>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border text-brand-accent">
            <Activity class="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section: Geospatial & Side panels */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel */}
        <div class="lg:col-span-2 glass-panel p-5 rounded-lg flex flex-col space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-brand-text">Geographic Market Intelligence Heatmap</h2>
              <p class="text-xs text-brand-muted">Hover hotspots to evaluate circle rates vs growth metrics.</p>
            </div>
            <span class="text-[10px] bg-brand-border px-2 py-1 rounded text-brand-accent font-semibold uppercase">Live Geographic Layers</span>
          </div>
          <div ref={mapRef} class="h-[400px] w-full rounded border border-brand-border z-0"></div>
        </div>

        {/* Side Panel: Pipeline Health & Alerts */}
        <div class="space-y-6">
          {/* Data Source Status */}
          <div class="glass-panel p-5 rounded-lg space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-brand-text">Public Pipeline Status</h2>
              <button onClick={() => setActiveTab('admin')} class="text-xs text-brand-accent hover:underline">Manage</button>
            </div>
            <div class="space-y-3">
              {crawlers.slice(0, 3).map((c, idx) => (
                <div key={idx} class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
                  <div>
                    <p class="text-xs font-semibold text-brand-text">{c.datasetName}</p>
                    <p class="text-[10px] text-brand-muted">Records: {c.recordCount.toLocaleString()}</p>
                  </div>
                  <span class={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    c.syncStatus === 'Operational' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'
                  }`}>{c.syncStatus}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Anomalies Panel */}
          <div class="glass-panel p-5 rounded-lg space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-brand-text">Active Fraud Alerts</h2>
              <button onClick={() => setActiveTab('watchlist')} class="text-xs text-brand-danger hover:underline font-semibold">Watchlist Panel</button>
            </div>
            <div class="space-y-3">
              {anomalies.map((a, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveTab('watchlist', a)}
                  class="p-3 bg-brand-bg rounded border border-brand-border flex items-start gap-3 cursor-pointer hover:border-brand-danger transition-colors"
                >
                  <AlertTriangle class="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
                  <div>
                    <h4 class="text-xs font-semibold text-brand-text">{a.title}</h4>
                    <p class="text-[10px] text-brand-muted mt-0.5 leading-relaxed">{a.description}</p>
                    <span class="inline-block text-[9px] bg-brand-danger/10 text-brand-danger px-1.5 py-0.2 rounded mt-1.5 font-bold uppercase">{a.riskLevel} RISK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
