import React, { useState } from 'react';
import { Search, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/images/avatar_ashwin.png';
import Modal from '../ui/Modal';

export const Header = ({
  displayName = 'Ashwin',
  unreadNotifications = 1,
  onOpenNotifications,
  onOpenSearch
}) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quests?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/60 backdrop-blur-md sticky top-0 z-20">
        {/* Left: Greeting */}
        <div className="flex items-center gap-1.5 text-base text-text-1">
          <span>{getGreeting()},</span>
          <span className="font-semibold text-cyan text-glow-cyan">
            {displayName}
          </span>
          <span className="text-lg">👋</span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-cyan/50 hover:bg-white/[0.08] flex items-center justify-center text-text-2 hover:text-cyan transition-all duration-200 shadow-glass"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 hover:border-cyan/50 hover:bg-white/[0.08] flex items-center justify-center text-text-2 hover:text-cyan transition-all duration-200 shadow-glass"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-cyan text-jet font-bold text-[9px] flex items-center justify-center shadow-glow-cyan-sm">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => navigate('/world')}
            className="relative w-9 h-9 rounded-full p-0.5 border border-cyan/60 shadow-glow-cyan-sm overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 ml-1"
          >
            <img
              src={defaultAvatar}
              alt={displayName}
              className="w-full h-full rounded-full object-cover object-top"
            />
          </button>
        </div>
      </header>

      {/* Quick Search Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Global Search"
        subtitle="Search your quests, habits, and questlines"
      >
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or tag..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan text-sm text-text-1 placeholder-text-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-3 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan text-jet font-semibold text-xs shadow-glow-cyan-sm hover:bg-[#33EBFF]"
            >
              Search
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Header;
