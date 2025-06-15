import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
  <header className="bg-gray-900 text-white py-4 px-6 shadow flex items-center">
    <Link to="/" className="text-2xl font-bold hover:underline">
      VibeParse
    </Link>
  </header>
);

export default Header; 