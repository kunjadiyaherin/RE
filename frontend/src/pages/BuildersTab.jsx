import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, BarChart2, Award, Info, RefreshCw, Layers } from 'lucide-react';
import { apiService } from '../apiService';

export default function BuildersTab() {
  const [builders, setBuilders] = useState([]);
  const [stateFilter, setStateFilter] = useState('');
  const [selectedBuilderId, setSelectedBuilderId] = useState(null);
  const [builderDetail, setBuilderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadBuilders() {
      setLoading(true);
      try {
        const data = await apiService.getBuilders({ state: stateFilter });
        setBuilders(data);
        if (data.length > 0 && !selectedBuilderId) {
          setSelectedBuilderId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBuilders();
  }, [stateFilter]);

  useEffect(() => {
    if (!selectedBuilderId) return;
    async function loadDetail() {
      setDetailLoading(true);
      try {
        const data = await apiService.getBuilderProfile(selectedBuilderId);
        setBuilderDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetail();
  }, [selectedBuilderId]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-brand-success';
    if (score >= 80) return 'text-brand-accent';
    if (score >= 70) return 'text-brand-warning';
    return 'text-brand-danger';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-brand-success';
    if (score >= 80) return 'bg-brand-accent';
    if (score >= 70) return 'bg-brand-warning';
    return 'bg-brand-danger';
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Analyzing Developer Portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-brand-text">Builder Reputation Analytics</h1>
          <p class="text-sm text-brand-muted">Trust Scores formulated from real-world completion ratios, delivery rates, and average delay records.</p>
        </div>
        
        {/* Filters */}
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-xs text-brand-muted font-semibold uppercase">Jurisdiction:</span>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            class="bg-brand-panel border border-brand-border rounded px-3 py-1.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
          >
            <option value="">All States</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Builders List Panel */}
        <div class="glass-panel p-5 rounded-lg space-y-4 h-[650px] flex flex-col">
          <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Developer Leaderboard</h2>
          
          <div class="space-y-2 overflow-y-auto flex-1 pr-1">
            {builders.map((b) => (
              <button
                key={b._id}
                onClick={() => setSelectedBuilderId(b._id)}
                class={`w-full text-left p-4 rounded border transition-colors flex items-center justify-between ${
                  selectedBuilderId === b._id ? 'bg-brand-border border-brand-accent' : 'bg-brand-bg hover:bg-brand-border border-brand-border'
                }`}
              >
                <div>
                  <h4 class="text-xs font-bold text-brand-text">{b.builderName}</h4>
                  <div class="flex items-center gap-3 mt-1.5 text-[10px] text-brand-muted">
                    <span>Projects: {b.registrationCount}</span>
                    <span>•</span>
                    <span class={b.delayedProjects > 0 ? 'text-brand-warning' : 'text-brand-success'}>
                      Delays: {b.delayedProjects}
                    </span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class={`text-sm font-extrabold font-mono ${getScoreColor(b.calculatedTrustScore)}`}>
                    {b.calculatedTrustScore}
                  </span>
                  <span class="text-[8px] block text-brand-muted font-semibold uppercase">Trust Index</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Builder Detailed Audit Profile */}
        <div class="lg:col-span-2">
          {detailLoading || !builderDetail ? (
            <div class="glass-panel p-8 rounded-lg flex flex-col items-center justify-center text-center space-y-3 h-[650px]">
              <div class="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin"></div>
              <p class="text-xs text-brand-muted">Generating developer delivery risk matrix...</p>
            </div>
          ) : (
            <div class="glass-panel p-6 rounded-lg space-y-6 h-[650px] overflow-y-auto">
              {/* Profile Card Header */}
              <div class="border-b border-brand-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span class="text-[9px] bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded text-brand-accent font-extrabold uppercase select-all">PAN: {builderDetail.builderDetails.panNumber || 'N/A'}</span>
                  <h2 class="text-xl font-bold text-brand-text mt-2">{builderDetail.builderDetails.builderName}</h2>
                  <p class="text-xs text-brand-muted mt-1">RERA Registered Developer in {builderDetail.builderDetails.state}</p>
                </div>
                <div class="text-right shrink-0 p-4 bg-brand-bg rounded border border-brand-border">
                  <div class="text-3xl font-extrabold font-mono text-brand-text flex items-baseline justify-end gap-1">
                    <span class={getScoreColor(builderDetail.builderDetails.trustScore)}>
                      {builderDetail.builderDetails.trustScore}
                    </span>
                    <span class="text-xs text-brand-muted font-normal">/100</span>
                  </div>
                  <span class="text-[9px] text-brand-muted font-semibold uppercase tracking-wider block mt-1">
                    {builderDetail.builderDetails.ratingTier}
                  </span>
                </div>
              </div>

              {/* Progress score bar */}
              <div class="space-y-2">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-brand-muted">Reputation Score Breakdown:</span>
                  <span class={getScoreColor(builderDetail.builderDetails.trustScore)}>{builderDetail.builderDetails.trustScore}% Trust Score</span>
                </div>
                <div class="w-full bg-brand-bg rounded-full h-2.5 border border-brand-border overflow-hidden">
                  <div 
                    class={`h-full ${getScoreBgColor(builderDetail.builderDetails.trustScore)}`}
                    style={{ width: `${builderDetail.builderDetails.trustScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Delivery Stats Grid */}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div class="p-3 bg-brand-bg rounded border border-brand-border text-center">
                  <Layers class="w-4 h-4 text-brand-muted mx-auto mb-1.5" />
                  <p class="text-[9px] text-brand-muted uppercase font-semibold">Total Projects</p>
                  <p class="text-base font-bold text-brand-text mt-1">{builderDetail.builderDetails.registrationCount}</p>
                </div>

                <div class="p-3 bg-brand-bg rounded border border-brand-border text-center">
                  <Award class="w-4 h-4 text-brand-success mx-auto mb-1.5" />
                  <p class="text-[9px] text-brand-muted uppercase font-semibold">Completed</p>
                  <p class="text-base font-bold text-brand-success mt-1">{builderDetail.builderDetails.completedProjects}</p>
                </div>

                <div class="p-3 bg-brand-bg rounded border border-brand-border text-center">
                  <ShieldCheck class="w-4 h-4 text-brand-accent mx-auto mb-1.5" />
                  <p class="text-[9px] text-brand-muted uppercase font-semibold">Ongoing</p>
                  <p class="text-base font-bold text-brand-accent mt-1">{builderDetail.builderDetails.ongoingProjects}</p>
                </div>

                <div class="p-3 bg-brand-bg rounded border border-brand-border text-center">
                  <Calendar class="w-4 h-4 text-brand-warning mx-auto mb-1.5" />
                  <p class="text-[9px] text-brand-muted uppercase font-semibold">Delayed</p>
                  <p class="text-base font-bold text-brand-warning mt-1">{builderDetail.builderDetails.delayedProjects}</p>
                </div>
              </div>

              {/* Delay analytics remarks */}
              <div class="p-4 bg-brand-bg rounded border border-brand-border flex gap-3 items-center">
                <BarChart2 class="w-5 h-5 text-brand-accent shrink-0" />
                <div class="text-xs">
                  <p class="font-bold text-brand-text">Historical Delivery Performance Index</p>
                  <p class="text-brand-muted mt-1 leading-relaxed">
                    Average delay duration across all projects is <b>{builderDetail.builderDetails.averageDelayMonths} months</b>. 
                    {builderDetail.builderDetails.averageDelayMonths === 0 ? ' No material schedule overruns have been recorded on their projects.' : ' Delivery ratios indicates structured timeline overruns in earlier phases.'}
                  </p>
                </div>
              </div>

              {/* Portfolio RERA List */}
              <div class="space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-brand-text">RERA Project Portfolio Details</h4>
                <div class="space-y-2">
                  {builderDetail.projects.map((p, idx) => (
                    <div key={idx} class="p-3 bg-brand-bg rounded border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h5 class="text-xs font-bold text-brand-text">{p.projectName}</h5>
                        <p class="text-[10px] text-brand-muted mt-1 select-all">{p.registrationNumber} • {p.locality}, {p.city}</p>
                      </div>
                      <div class="flex items-center gap-3 self-end md:self-auto">
                        <span class={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          p.completionStatus === 'Completed' ? 'bg-brand-success/10 text-brand-success' : p.completionStatus === 'Ongoing' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-warning/10 text-brand-warning'
                        }`}>{p.completionStatus}</span>
                        {p.delayedMonths > 0 && (
                          <span class="text-[9px] bg-brand-danger/10 text-brand-danger px-1.5 py-0.5 rounded font-semibold">+ {p.delayedMonths}m delay</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
