import React from 'react';
import { Menu, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-neutral-600 hover:text-neutral-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          {title && (
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
          )}
        </div>

        {/* Search bar - optional for future use */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              className="
                w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
                transition-colors duration-200
              "
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Additional header actions can go here */}
        </div>
      </div>
    </header>
  );
};
