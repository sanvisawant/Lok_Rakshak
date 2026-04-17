import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingScreen from './components/layout/LandingScreen';
import './index.css';

function App() {
  const [booted, setBooted] = useState(false);

  // Initialize theme from localStorage (default: dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lr-theme') || 'dark';
  });

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light-mode');
    } else {
      html.classList.remove('light-mode');
    }
    localStorage.setItem('lr-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="App">
      <AnimatePresence>
        {!booted && (
          <LandingScreen key="landing" onComplete={() => setBooted(true)} />
        )}
      </AnimatePresence>
      {booted && (
        <DashboardLayout theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;
