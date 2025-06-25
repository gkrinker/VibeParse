import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
  <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-neutral-200">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="tracking-tight text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:opacity-80 transition">
        Vibe<span className="text-indigo-600">Parse</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link 
          to="/" 
          className="text-sm text-neutral-600 hover:text-neutral-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1"
        >
          ← Back to Home
        </Link>
      </nav>
    </div>
  </header>
);

export default Header; 