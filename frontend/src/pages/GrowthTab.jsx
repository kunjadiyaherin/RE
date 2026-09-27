import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Zap, Construction, ShieldCheck } from 'lucide-react';
import { apiService } from '../apiService';

export default function GrowthTab() {
  const [city, setCity] = useState('Ahmedabad');
  const [growthData, setGrowthData] = useState([]);
  const [infraProjects, setInfraProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [growth, infra] = await Promise.all([
          apiService.getAreaGrowth({ city }),
          apiService.getInfrastructureProjects({ city }).catch(() => [])
        ]);
        setGrowthData(growth);
        setInfraProjects(infra);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [city]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-brand-success';
    if (score >= 80) return 'text-brand-accent';
    return 'text-brand-warning';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-brand-success';
    if (score >= 80) return 'bg-brand-accent';
    return 'bg-brand-warning';
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Correlating Smart City infrastructure maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-brand-text">Area Growth Intelligence</h1>
          <p class="text-sm text-brand-muted">Evaluate local micro-market investment scores driven by state infrastructure projects.</p>
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

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Index List */}
        <div class="lg:col-span-1 space-y-4">
          <div class="glass-panel p-5 rounded-lg space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Locality Growth Scores</h2>
            
            <div class="space-y-4">
              {growthData.map((area, idx) => (
                <div key={idx} class="p-4 bg-brand-bg rounded border border-brand-border space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-brand-text">{area.locality}</h3>
                    <span class={`text-sm font-extrabold font-mono ${getScoreColor(area.finalGrowthScore)}`}>
                      {area.finalGrowthScore}/100
                    </span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div class="w-full bg-brand-border rounded-full h-1.5 overflow-hidden">
                    <div 
                      class={`h-full ${getScoreBgColor(area.finalGrowthScore)}`}
                      style={{ width: `${area.finalGrowthScore}%` }}
                    ></div>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-[10px] text-brand-muted pt-1">
                    <p>Metro Proximity: <b>{area.metroProximityKm} Km</b></p>
                    <p>Highway Proximity: <b>{area.highwayProximityKm} Km</b></p>
                  </div>

                  {area.impactingProjects.length > 0 && (
                    <div class="pt-2 border-t border-brand-border/40 flex items-start gap-1.5 text-[10px]">
                      <Zap class="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                      <p class="text-brand-muted leading-relaxed">
                        <span class="text-brand-success font-semibold">Active Catalyst:</span> {area.impactingProjects.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infrastructure Projects Timeline */}
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-panel p-5 rounded-lg space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Public Capital Infrastructure Log</h2>
              <span class="text-[9px] bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded text-brand-accent font-bold uppercase">Smart City Mission</span>
            </div>

            <div class="space-y-4">
              {infraProjects.map((proj, idx) => (
                <div key={idx} class="p-4 bg-brand-bg rounded border border-brand-border space-y-3">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-brand-border/40">
                    <div>
                      <span class="text-[9px] text-brand-accent font-bold uppercase tracking-wider">{proj.projectType}</span>
                      <h3 class="text-xs font-bold text-brand-text mt-0.5">{proj.projectName}</h3>
                    </div>
                    <div class="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <span class="text-[9px] bg-brand-border px-2 py-0.5 rounded text-brand-text font-semibold uppercase">Cost: ₹{proj.estimatedCostINR_Crores} Cr</span>
                      <span class="text-[9px] bg-brand-success/10 text-brand-success px-2 py-0.5 rounded font-extrabold uppercase">Target {proj.expectedCompletionYear}</span>
                    </div>
                  </div>

                  <p class="text-[11px] text-brand-muted leading-relaxed">{proj.description}</p>
                  
                  <div class="pt-2 flex flex-wrap items-center gap-3 text-[10px] text-brand-muted">
                    <span class="flex items-center gap-1">
                      <Construction class="w-3.5 h-3.5 text-brand-warning" /> <b>Status:</b> {proj.status}
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <MapPin class="w-3.5 h-3.5 text-brand-accent" /> <b>Catalyst Zones:</b> {proj.affectedLocalities.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
              {infraProjects.length === 0 && (
                <div class="text-center p-6 text-brand-muted text-xs">No active public works logged for the selected city index.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
