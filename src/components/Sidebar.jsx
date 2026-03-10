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
    <aside className="w-64 bg-primary text-primary-foreground min-h-screen flex flex-col shadow-xl flex-shrink-0 border-r border-primary/20 transition-all">
      {/* Brand area */}
      <div className="p-6 border-b border-primary-foreground/10 flex items-center gap-3">
        <div className="bg-accent p-2 rounded-lg text-primary">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight tracking-wide">Police Comm.</h2>
          <p className="text-xs text-primary-foreground/70 uppercase font-semibold">Inventory System</p>
        </div>
      </div>

      {/* User Info (mini) */}
      <div className="px-6 py-4 bg-primary-foreground/5 mb-4">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-primary-foreground/60 capitalize mt-0.5">{user.role}</p>
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
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              <Icon size={18} className={isActive ? "text-secondary-foreground" : "text-primary-foreground/70"} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-primary-foreground/10 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-secondary/90 hover:text-white rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
