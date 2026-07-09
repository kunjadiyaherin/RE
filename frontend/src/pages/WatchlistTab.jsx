import React, { useState, useEffect } from 'react';
import { Bookmark, Bell, Plus, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { apiService } from '../apiService';

export default function WatchlistTab() {
  const [watchlist, setWatchlist] = useState({ savedCities: [], savedLocalities: [] });
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState('');
  const [newLocality, setNewLocality] = useState({ city: 'Ahmedabad', locality: '' });

  useEffect(() => {
    async function loadWatchlist() {
      setLoading(true);
      try {
        const data = await apiService.getWatchlist();
        setWatchlist(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlist();
  }, []);

  const handleAddCity = async () => {
    if (!newCity.trim()) return;
    try {
      const { watchlist: updated } = await apiService.addToWatchlist('city', newCity.trim());
      setWatchlist(updated);
      setNewCity('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCity = async (cityToRemove) => {
    try {
      const { watchlist: updated } = await apiService.removeFromWatchlist('city', cityToRemove);
      setWatchlist(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLocality = async () => {
    if (!newLocality.locality.trim()) return;
    try {
      const { watchlist: updated } = await apiService.addToWatchlist('locality', {
        city: newLocality.city,
        locality: newLocality.locality.trim()
      });
      setWatchlist(updated);
      setNewLocality({ ...newLocality, locality: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLocality = async (locToRemove) => {
    try {
      const { watchlist: updated } = await apiService.removeFromWatchlist('locality', locToRemove);
      setWatchlist(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[70vh]">
        <div class="flex flex-col items-center gap-3">
          <RefreshCw class="w-8 h-8 animate-spin text-brand-accent" />
          <p class="text-brand-muted text-sm font-semibold">Loading Watchlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Investor Watchlist</h1>
        <p class="text-sm text-brand-muted">Benchmark target markets, monitor pending infrastructure completions, and receive automated alerts on circle rate adjustments.</p>
      </div>

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Watchlist Cities */}
        <div class="glass-panel p-5 rounded-lg space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Followed Cities</h2>
          
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Surat"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
            />
            <button
              onClick={handleAddCity}
              class="bg-brand-accent hover:bg-brand-accent/90 text-white rounded px-3 flex items-center justify-center gap-1.5 shrink-0 text-xs font-bold transition-colors"
            >
              <Plus class="w-4 h-4" /> Add
            </button>
          </div>

          <div class="space-y-2 pt-2">
            {watchlist.savedCities.map((city, idx) => (
              <div key={idx} class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
                <span class="text-xs font-semibold text-brand-text">{city}</span>
                <button
                  onClick={() => handleRemoveCity(city)}
                  class="text-brand-muted hover:text-brand-danger transition-colors p-1"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {watchlist.savedCities.length === 0 && (
              <p class="text-center p-4 text-[11px] text-brand-muted">No cities followed yet.</p>
            )}
          </div>
        </div>

        {/* Watchlist Localities */}
        <div class="glass-panel p-5 rounded-lg space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Monitored Localities</h2>
          
          <div class="flex gap-2">
            <select
              value={newLocality.city}
              onChange={(e) => setNewLocality({ ...newLocality, city: e.target.value })}
              class="bg-brand-bg border border-brand-border rounded px-2 py-2 text-xs text-brand-text focus:outline-none cursor-pointer shrink-0"
            >
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
            </select>
            <input
              type="text"
              placeholder="Locality name e.g. Thaltej"
              value={newLocality.locality}
              onChange={(e) => setNewLocality({ ...newLocality, locality: e.target.value })}
              class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLocality()}
            />
            <button
              onClick={handleAddLocality}
              class="bg-brand-accent hover:bg-brand-accent/90 text-white rounded px-3 flex items-center justify-center gap-1.5 shrink-0 text-xs font-bold transition-colors"
            >
              <Plus class="w-4 h-4" /> Add
            </button>
          </div>

          <div class="space-y-2 pt-2">
            {watchlist.savedLocalities.map((loc, idx) => (
              <div key={idx} class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
                <div>
                  <span class="text-xs font-semibold text-brand-text">{loc.locality}</span>
                  <span class="text-[9px] text-brand-muted block mt-0.5">{loc.city} Index</span>
                </div>
                <button
                  onClick={() => handleRemoveLocality(loc)}
                  class="text-brand-muted hover:text-brand-danger transition-colors p-1"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {watchlist.savedLocalities.length === 0 && (
              <p class="text-center p-4 text-[11px] text-brand-muted">No micro-market sectors followed yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Alert settings */}
      <div class="glass-panel p-5 rounded-lg space-y-4">
        <div class="flex items-center gap-2">
          <Bell class="w-4 h-4 text-brand-accent" />
          <h2 class="text-sm font-bold uppercase tracking-wider text-brand-text">Market Trigger Alerts</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
            <span class="text-xs text-brand-text">Circle Rate Increases &gt; 5%</span>
            <span class="text-[10px] bg-brand-success/10 text-brand-success px-2 py-0.5 rounded font-bold uppercase">Active</span>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
            <span class="text-xs text-brand-text">Builder Trust score drop alert</span>
            <span class="text-[10px] bg-brand-success/10 text-brand-success px-2 py-0.5 rounded font-bold uppercase">Active</span>
          </div>
          <div class="p-3 bg-brand-bg rounded border border-brand-border flex items-center justify-between">
            <span class="text-xs text-brand-text">Metro proximity approval alerts</span>
            <span class="text-[10px] bg-brand-success/10 text-brand-success px-2 py-0.5 rounded font-bold uppercase">Active</span>
          </div>
        </div>
      </div>

    </div>
  );
}
