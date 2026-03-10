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
      <div className="px-5 py-6 border-b border-sidebar flex flex-col items-center gap-3">
        <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-xl p-1.5 shadow-lg border border-slate-200/10">
          <img src="/Bbsr_police_commissionerate.png" alt="Police Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col items-center text-center">
          <h2 className="font-black text-[17px] leading-tight text-white tracking-widest uppercase">
            Police
          </h2>
          <h3 className="font-semibold text-[12px] leading-tight text-slate-300 uppercase tracking-[0.15em] mt-0.5">
            Commissionerate
          </h3>
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-1.5 bg-accent/10 px-3 py-0.5 rounded-full border border-accent/20">
            Inventory System
          </p>
        </div>
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
