import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import {
  LayoutDashboard,
  Users,
  Tags,
  Package,
  Send,
  History,
  Inbox,
  Archive,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users / Stations', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Transfer Inventory', path: '/admin/transfer', icon: Send },
    { name: 'Transactions', path: '/admin/transactions', icon: History },
  ];

  const deptLinks = [
    { name: 'Dashboard', path: '/department/dashboard', icon: LayoutDashboard },
    { name: 'Received Items', path: '/department/received', icon: Inbox },
    { name: 'My Inventory', path: '/department/inventory', icon: Archive },
  ];

  const links = isAdmin ? adminLinks : deptLinks;

  return (
    <aside className="w-64 bg-sidebar text-sidebar min-h-screen flex flex-col shadow-xl flex-shrink-0 border-r border-sidebar transition-all">
      {/* Brand area */}
      <div className="px-5 py-6 border-b border-sidebar flex items-center gap-3.5">
        <div className="w-12 h-12 flex-shrink-0 bg-slate-50 rounded-xl p-1 shadow-lg border border-slate-200/10">
          <img src="/Bbsr_police_commissionerate.png" alt="Police Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-black text-[16px] leading-none text-white tracking-widest uppercase mb-1">
            Police
          </h2>
          <h3 className="font-semibold text-[11px] leading-none text-slate-300 uppercase tracking-[0.15em] mb-1.5">
            Commissionerate
          </h3>
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest">
            Inventory System
          </p>
        </div>
      </div>

      {/* User Info (mini) */}
      <div className="px-6 py-4 bg-sidebar-hover border-y border-sidebar mb-4">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-sidebar-muted capitalize mt-0.5">{user.role}</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex flex-row items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium",
                isActive 
                  ? "bg-secondary text-secondary-foreground shadow-sm" 
                  : "text-sidebar hover:bg-sidebar-hover"
              )}
            >
              <Icon size={18} className={isActive ? "text-secondary-foreground" : "text-sidebar-muted"} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-sidebar mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-sidebar hover:bg-secondary/90 hover:text-white rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
