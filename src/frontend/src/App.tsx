import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './components/IndexPage';
import PlayerPage from './components/PlayerPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/player/:scriptID" element={<PlayerPage />} />
      </Routes>
    </Router>
  );
};

export default App; 