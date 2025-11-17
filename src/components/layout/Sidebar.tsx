import React from 'react';
import { NavLink } from 'react-router-dom';
import { Phone, LayoutDashboard, LogOut, Menu, X, Smartphone, Building2, Users, Shield, Activity } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { admin, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      logout();
    }
  };

  const allNavItems = [
    {
      to: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
    },
    {
      to: '/call-logs',
      icon: <Phone className="w-5 h-5" />,
      label: 'Call Logs',
    },
    {
      to: '/devices',
      icon: <Smartphone className="w-5 h-5" />,
      label: 'Devices',
      allowedRoles: ['super_admin', 'manager'], // Hide from trainee
    },
  ];

  // Filter nav items based on admin role
  const navItems = allNavItems.filter((item) => {
    if (item.allowedRoles && admin?.admin_role) {
      return item.allowedRoles.includes(admin.admin_role);
    }
    return true; // Show items without role restrictions
  });

  // Administration menu items (filtered based on role)
  const allAdminNavItems = [
    {
      to: '/branches',
      icon: <Building2 className="w-5 h-5" />,
      label: 'Branches',
      allowedRoles: ['super_admin'], // Only super_admin can access
    },
    {
      to: '/users',
      icon: <Users className="w-5 h-5" />,
      label: 'App Users',
    },
    {
      to: '/admins',
      icon: <Shield className="w-5 h-5" />,
      label: 'Admins',
      allowedRoles: ['super_admin'], // Only super_admin can access
    },
    {
      to: '/login-activities',
      icon: <Activity className="w-5 h-5" />,
      label: 'Login Activity',
      allowedRoles: ['super_admin', 'manager'], // Hide from trainee
    },
  ];

  // Filter menu items based on admin role
  const adminNavItems = allAdminNavItems.filter((item) => {
    if (item.allowedRoles && admin?.admin_role) {
      return item.allowedRoles.includes(admin.admin_role);
    }
    return true; // Show items without role restrictions
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-sidebar z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <Phone className="w-6 h-6 text-rose-500" />
            <span className="text-xl font-bold text-white">CallLogs</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-4 py-3 rounded-md
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-sidebar-hover text-rose-500'
                      : 'text-neutral-300 hover:bg-sidebar-hover hover:text-white'
                  }
                `
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Admin Section */}
          <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Administration
            </p>
          </div>
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-4 py-3 rounded-md
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-sidebar-hover text-rose-500'
                      : 'text-neutral-300 hover:bg-sidebar-hover hover:text-white'
                  }
                `
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin section */}
        <div className="px-4 py-4 border-t border-neutral-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-semibold">
              {admin?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name}</p>
              <p className="text-xs text-neutral-400 truncate">{admin?.email}</p>
              <p className="text-xs text-rose-400 truncate capitalize">{admin?.admin_role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3 px-4 py-3 rounded-md
              text-neutral-300 hover:bg-sidebar-hover hover:text-white
              transition-colors duration-200
            "
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
