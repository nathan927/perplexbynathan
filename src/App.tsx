import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MainInterface } from './components/MainInterface';
import { ErrorBoundary } from './components/ErrorBoundary';
import './i18n/index'; // 初始化國際化
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="dark min-h-screen bg-slate-900 text-white">
          <MainInterface />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
