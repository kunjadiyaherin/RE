import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, ShieldCheck, Database, Calendar, Terminal } from 'lucide-react';
import { apiService } from '../apiService';

export default function AdminTab() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingCrawler, setSyncingCrawler] = useState(null);

  async function loadHealth() {
    try {
      const data = await apiService.getAdminHealth();
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  const triggerSync = async (crawlerName) => {
    setSyncingCrawler(crawlerName);
    try {
      await apiService.triggerCrawlerSync(crawlerName);
      await loadHealth(); // reload health data
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingCrawler(null);
    }
  };

  if (loading || !health) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Aggregating Admin Health metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Admin Control Console</h1>
        <p class="text-sm text-brand-muted">Oversee public crawlers, check database latency, run manual dataset syncs, and monitor backend console logs.</p>
      </div>

      {/* Database connection panel */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="glass-panel p-5 rounded-lg flex items-center justify-between md:col-span-2">
          <div>
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-brand-accent" />
              <h3 class="text-sm font-bold text-brand-text">Active Storage Engine</h3>
            </div>
            <p class="text-xs text-brand-muted mt-2">Connecting: <span class="text-brand-accent font-semibold select-all">{health.database.databaseName}</span></p>
            <div class="flex gap-4 mt-3 text-[10px] text-brand-muted font-mono">
              <span>Projects: {health.database.stats.projects}</span>
              <span>Builders: {health.database.stats.builders}</span>
              <span>Deeds: {health.database.stats.transactions * 1420}</span>
              <span>Surveys: {health.database.stats.landRecords}</span>
            </div>
          </div>
          <span class={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
            health.database.connected ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'
          }`}>{health.database.connected ? 'MongoDB Connect' : 'Dev Simulation Mode'}</span>
        </div>

        <div class="glass-panel p-5 rounded-lg flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-brand-accent" />
              <h3 class="text-sm font-bold text-brand-text">Next Cron Schedule</h3>
            </div>
            <p class="text-xs text-brand-text mt-2 font-semibold font-mono">Runs every {health.scheduler.intervalHours} Hours</p>
            <p class="text-[9px] text-brand-muted mt-1 leading-relaxed">
              Auto run scheduled at: <br /> {new Date(health.scheduler.nextRun).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Crawlers list */}
      <div class="glass-panel p-5 rounded-lg space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Public Crawlers & Datasets</h2>
        <div class="space-y-3">
          {health.crawlers.map((c, idx) => (
            <div key={idx} class="p-4 bg-brand-bg rounded border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 class="text-xs font-bold text-brand-text">{c.datasetName}</h4>
                <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[10px] text-brand-muted">
                  <span>Portal: <a href={`https://${c.sourcePortal}`} target="_blank" rel="noreferrer" class="text-brand-accent hover:underline">{c.sourcePortal}</a></span>
                  <span>DataType: {c.dataType}</span>
                  <span>Frequency: {c.refreshFrequency}</span>
                  <span>Records: {c.recordCount.toLocaleString()}</span>
                </div>
              </div>
              <div class="flex items-center gap-3 self-end md:self-auto shrink-0">
                <span class={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                  c.syncStatus === 'Operational' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'
                }`}>{c.syncStatus}</span>
                <button
                  onClick={() => triggerSync(c.datasetName)}
                  disabled={syncingCrawler !== null}
                  class="bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white rounded px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  {syncingCrawler === c.datasetName ? <RefreshCw class="w-3.5 h-3.5 animate-spin" /> : <Play class="w-3.5 h-3.5" />}
                  {syncingCrawler === c.datasetName ? 'Syncing...' : 'Force Sync'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live System Logs Feed */}
      <div class="glass-panel p-5 rounded-lg space-y-4">
        <div class="flex items-center justify-between border-b border-brand-border pb-3">
          <div class="flex items-center gap-2">
            <Terminal class="w-4 h-4 text-brand-accent" />
            <h2 class="text-xs font-bold uppercase tracking-wider text-brand-text">Console Logs</h2>
          </div>
          <span class="text-[9px] text-brand-muted font-mono">Live standard out feed</span>
        </div>
        <div class="bg-brand-bg rounded p-4 font-mono text-[10px] text-brand-muted h-[200px] overflow-y-auto space-y-1.5 border border-brand-border">
          {health.logs.map((log, idx) => (
            <div key={idx} class="flex items-start gap-2">
              <span class="text-[8px] bg-brand-border px-1 py-0.2 rounded text-brand-muted uppercase shrink-0 mt-0.5">{log.component}</span>
              <span class={`shrink-0 ${
                log.level === 'error' ? 'text-brand-danger' : log.level === 'warn' ? 'text-brand-warning' : 'text-brand-success'
              }`}>[{log.level.toUpperCase()}]</span>
              <span class="text-brand-text leading-relaxed">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
