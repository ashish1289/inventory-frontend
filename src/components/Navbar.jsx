import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize theme from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    if (localStorage.getItem('theme') === 'dark') return true;
    if (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle (if we implement mobile later) */}
        <button onClick={onMenuClick} className="md:hidden text-text hover:bg-surface-hover p-2 rounded-md">
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-text">
            {user?.departmentName || 'Central Administration'}
          </h1>
          {user?.stationCode && (
            <span className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded border border-border mt-1 inline-block">
              Station Code: {user.stationCode}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full text-text hover:bg-surface-hover transition-colors border border-border"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} className="text-accent" /> : <Moon size={18} className="text-primary" />}
        </button>

        {/* Profile indicator - click to open profile page */}
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 border-l border-border pl-4 hover:bg-surface-hover rounded-md py-1 px-2 transition-colors"
          title="My Profile"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-text">{user?.name}</p>
            <p className="text-xs text-text-muted">{user?.email}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
