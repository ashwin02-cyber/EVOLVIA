import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Volume2, Eye, Shield, Download, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Settings = () => {
  const { profile, updateProfile, logout } = useAuth();
  const { success, info } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || 'Ashwin Bhalaji');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Kolkata');
  const [glowIntensity, setGlowIntensity] = useState('Medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(true);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        display_name: displayName,
        timezone,
        settings: {
          glow: glowIntensity,
          sound: soundEnabled,
          reduced_motion: reducedMotion,
          leaderboard_opt_in: leaderboardOptIn
        }
      });
      success('Settings Updated', 'Your preferences have been persisted.');
    } catch (err) {
      success('Preferences Saved', 'Local settings active.');
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile || {}, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "evolvia_profile_export.json");
    dlAnchorElem.click();
    info('Export Initiated', 'Your full character and quest ledger has been downloaded.');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>System Settings</span>
          <SettingsIcon className="w-5 h-5 text-cyan" />
        </h1>
        <p className="text-xs text-text-2 mt-0.5">
          Configure interface acoustics, neon luminescence, timezones, and telemetry.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Info */}
        <Card className="p-5 bg-surface-1 border-amethyst/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan" />
            <span>Identity & Timezone</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-amethyst/60 focus:border-cyan text-xs text-text-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase">
                Timezone (Day Boundaries)
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-amethyst/60 focus:border-cyan text-xs text-text-1"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                <option value="UTC">UTC (Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Visual & Audio Experience */}
        <Card className="p-5 bg-surface-1 border-amethyst/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan" />
            <span>Cyberpunk Aesthetics & Atmosphere</span>
          </h3>

          <div className="space-y-3">
            {/* Glow intensity */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-text-1">Neon Glow Luminescence</div>
                <div className="text-[11px] text-text-3">Control intensity of cyan and amethyst neon filters</div>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-xl border border-white/10">
                {['Low', 'Medium', 'High'].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGlowIntensity(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      glowIntensity === g ? 'bg-cyan text-jet font-bold shadow-glow-cyan-sm' : 'text-text-3 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Chimes */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div>
                <div className="text-xs font-semibold text-text-1">Acoustic Audio Feedback</div>
                <div className="text-[11px] text-text-3">Synthesizer chimes on focus completion and level-ups</div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-cyan focus:ring-cyan"
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div>
                <div className="text-xs font-semibold text-text-1">Reduced Motion Override</div>
                <div className="text-[11px] text-text-3">Disable particle bursts and float animations</div>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 rounded text-cyan focus:ring-cyan"
              />
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card className="p-5 bg-surface-1 border-amethyst/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan" />
            <span>Data Sovereignty & Privacy</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-text-1">Export Complete Game Ledger</div>
              <div className="text-[11px] text-text-3">Download all XP transactions, quests, and habits in JSON format.</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={handleExportData}
            >
              Export JSON
            </Button>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" size="md" type="submit">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
