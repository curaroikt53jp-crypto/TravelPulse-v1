
import React from 'react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-home', label: '總覽' },
    { id: 'flights', icon: 'fa-plane', label: '航班' },
    { id: 'hotels', icon: 'fa-hotel', label: '住宿' },
    { id: 'itinerary', icon: 'fa-calendar-alt', label: '行程' },
    { id: 'shopping', icon: 'fa-shopping-cart', label: '購物' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-[#eee] flex justify-around items-center h-20 px-2 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id as ViewType)}
          className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative ${
            currentView === item.id ? 'text-[#333]' : 'text-gray-300'
          }`}
        >
          <i className={`fas ${item.icon} text-lg mb-1`}></i>
          <span className="text-[9px] font-bold tracking-widest">{item.label}</span>
          {currentView === item.id && (
            <div className="absolute top-0 w-8 h-1 bg-[#333] rounded-full"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
