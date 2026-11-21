import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, Check, Loader2 } from 'lucide-react';
import crystalImg from '../../assets/images/crystal_reward.png';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

export const DailyReward = ({ onClaimSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { success } = useToast();
  const { syncProfile } = useAuth();
  const queryClient = useQueryClient();

  // Query live dashboard state to inspect daily login claim status
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/');
      return res.data;
    },
    staleTime: 1000 * 30,
  });

  const isClaimed = dashboardData?.has_claimed_login_reward ?? false;

  const handleClaim = async () => {
    if (isClaimed || loading) return;
    setLoading(true);

    try {
      const res = await apiClient.post('/rewards/daily-login/claim/');
      if (res.data.profile && syncProfile) {
        syncProfile(res.data.profile);
      }
      if (!res.data.already_claimed) {
        success('Daily Reward Claimed! 💎', '+50 XP has been added to your progression.');
      } else {
        success('Already Claimed', 'Daily reward was already claimed today.');
      }
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (onClaimSuccess) onClaimSuccess(50);
    } catch (e) {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mt-auto pt-3 pb-2 px-3">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amethyst/30 rounded-full blur-2xl pointer-events-none" />

      {/* Crystal Image */}
      <div className="relative z-10 flex justify-center -mb-3">
        <img
          src={crystalImg}
          alt="Amethyst Crystal Reward"
          className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(123,63,207,0.8)] animate-float"
        />
      </div>

      {/* Reward Card */}
      <div className="relative z-10 rounded-2xl bg-[#0E071A]/85 border border-amethyst/50 p-3 text-center backdrop-blur-md">
        <div className="text-xs font-medium text-text-2">Daily Login Reward</div>
        <div className="text-sm font-bold font-mono text-cyan text-glow-cyan mt-0.5 mb-2.5">
          +50 XP
        </div>

        <button
          onClick={handleClaim}
          disabled={isClaimed || loading}
          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 select-none ${
            isClaimed
              ? 'bg-amethyst/30 text-text-3 border border-amethyst/40 cursor-default'
              : 'bg-cyan text-jet hover:bg-[#33EBFF] hover:shadow-glow-cyan-md active:scale-95 shadow-glow-cyan-sm'
          }`}
        >
          {isClaimed ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span>Claimed</span>
            </>
          ) : (
            <>
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5 fill-current" />}
              <span>{loading ? 'Claiming...' : 'Claim'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DailyReward;
