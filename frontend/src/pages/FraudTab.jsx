import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Play, RefreshCw, CheckCircle, BarChart2 } from 'lucide-react';
import { apiService } from '../apiService';

export default function FraudTab() {
  const [anomalies, setAnomalies] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('All');
  const [lastScanTime, setLastScanTime] = useState(null);

  useEffect(() => {
    runScan(true);
  }, []);

  const runScan = async (silent = false) => {
    if (!silent) setScanning(true);
    else setLoading(true);
    try {
      const data = await apiService.scanAnomalies();
      setAnomalies(data);
      setLastScanTime(new Date());
    } catch (err) {
      try {
        const fallback = await apiService.getFraudReports();
        setAnomalies(fallback);
        setLastScanTime(new Date());
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
      if (!silent) setTimeout(() => setScanning(false), 1200);
    }
  };

  const getRiskBadge = (level) => {
    if (level === 'High') return 'bg-brand-danger/15 text-brand-danger border-brand-danger/25';
    if (level === 'Medium') return 'bg-brand-warning/15 text-brand-warning border-brand-warning/25';
    return 'bg-brand-accent/15 text-brand-accent border-brand-accent/25';
  };

  const getTypeIcon = (type) => {
    if (type === 'Builder') return '🏗️';
    if (type === 'Project') return '🏢';
    if (type === 'Transaction') return '📋';
    return '⚠️';
  };

  const filtered = filterLevel === 'All' ? anomalies : anomalies.filter(a => a.riskLevel === filterLevel);
  const highCount = anomalies.filter(a => a.riskLevel === 'High').length;
  const mediumCount = anomalies.filter(a => a.riskLevel === 'Medium').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-brand-danger/30 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-brand-danger animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-danger animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-brand-text text-sm font-bold">Scanning Fraud Registries...</p>
            <p className="text-brand-muted text-xs mt-1">Auditing circle rates, deed mutations &amp; RERA delays</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">Fraud Detection Engine</h1>
          <p className="text-sm text-brand-muted mt-1">
            Live algorithmic scan across circle rate anomalies, dual survey mutations, and RERA delay breaches.
            {lastScanTime && <span className="ml-2 text-brand-accent font-semibold">Last scan: {lastScanTime.toLocaleTimeString()}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center bg-brand-panel border border-brand-border rounded overflow-hidden">
            {['All', 'High', 'Medium'].map(level => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  filterLevel === level
                    ? level === 'High' ? 'bg-brand-danger text-white' : level === 'Medium' ? 'bg-brand-warning text-white' : 'bg-brand-accent text-white'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            onClick={() => runScan(false)}
            disabled={scanning}
            className="bg-brand-danger hover:bg-brand-danger/90 disabled:opacity-50 text-white rounded px-4 py-2 text-xs font-bold transition-colors flex items-center gap-2"
          >
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {scanning ? 'Auditing...' : 'Re-scan Now'}
          </button>
        </div>
      </div>

      {/* Risk Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-brand-danger/10 rounded border border-brand-danger/20">
            <ShieldAlert className="w-5 h-5 text-brand-danger" />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase font-semibold">High Risk Flags</p>
            <p className="text-2xl font-extrabold text-brand-danger mt-0.5">{highCount}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-brand-warning/10 rounded border border-brand-warning/20">
            <AlertTriangle className="w-5 h-5 text-brand-warning" />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase font-semibold">Medium Risk Flags</p>
            <p className="text-2xl font-extrabold text-brand-warning mt-0.5">{mediumCount}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-brand-accent/10 rounded border border-brand-accent/20">
            <BarChart2 className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <p className="text-[10px] text-brand-muted uppercase font-semibold">Total Anomalies</p>
            <p className="text-2xl font-extrabold text-brand-text mt-0.5">{anomalies.length}</p>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="glass-panel p-5 rounded-lg">
        <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-text">
            Active Risk Anomalies ({filtered.length}{filterLevel !== 'All' ? ` ${filterLevel} Risk` : ''})
          </h2>
          <span className="text-[9px] bg-brand-danger/15 text-brand-danger px-2 py-0.5 rounded border border-brand-danger/25 font-bold uppercase tracking-wider">
            Live Algorithmic Monitor
          </span>
        </div>

        <div className="space-y-4">
          {filtered.map((anom, idx) => (
            <div
              key={idx}
              className="p-4 bg-brand-bg rounded border border-brand-border space-y-3 hover:border-brand-accent/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5 shrink-0">{getTypeIcon(anom.targetType)}</span>
                  <div>
                    <h3 className="text-xs font-bold text-brand-text">{anom.title}</h3>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      {anom.targetType} · {anom.city} · {anom.anomalyType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] bg-brand-border px-2 py-0.5 rounded text-brand-muted font-bold font-mono select-all">
                    {anom.identifier}
                  </span>
                  <span className={`text-[9px] border px-2 py-0.5 rounded font-extrabold uppercase ${getRiskBadge(anom.riskLevel)}`}>
                    {anom.riskLevel} Risk
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-brand-muted leading-relaxed">{anom.description}</p>

              {anom.evidence && (
                <div className="bg-brand-panel border border-brand-border rounded p-2.5">
                  <p className="text-[9px] text-brand-muted font-semibold uppercase mb-1.5">Evidence Index</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(anom.evidence).map(([k, v]) => (
                      <span key={k} className="text-[9px] font-mono text-brand-accent">
                        <span className="text-brand-muted">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center p-10 flex flex-col items-center justify-center space-y-3">
              <CheckCircle className="w-10 h-10 text-brand-success" />
              <p className="text-sm text-brand-text font-semibold">Compliance Scan Clear</p>
              <p className="text-xs text-brand-muted">No anomalies detected for the selected risk level filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
