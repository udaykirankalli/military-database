/**
 * Advanced iOS-Style App with Glassmorphism
 * Location: src/App.js
 */

import React, { useState, useEffect } from 'react';
import { Shield, Package, TrendingUp, Users, LogOut, Bell, Settings, Search } from 'lucide-react';
import apiService from './services/apiService';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Transfers from './components/Transfers';
import Assignments from './components/Assignments';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    apiService.clearToken();
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 border-4 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 font-medium">Loading Military Asset System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Shield, component: Dashboard, color: 'emerald' },
    { id: 'purchases', name: 'Purchases', icon: Package, component: Purchases, color: 'blue' },
    { id: 'transfers', name: 'Transfers', icon: TrendingUp, component: Transfers, color: 'purple' },
    { id: 'assignments', name: 'Assignments', icon: Users, component: Assignments, color: 'pink' },
  ];

  const CurrentComponent = navigation.find((n) => n.id === currentPage)?.component || Dashboard;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section with Glass Effect */}
            <div className="flex items-center gap-4">
              <div className="relative group floating">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Military Asset System
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-white/60 font-medium">{user.name}</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button className="glass-button p-3 group relative overflow-hidden">
                <Search className="w-5 h-5 text-white/80 group-hover:text-white transition-colors relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              {/* Notifications */}
              <button className="glass-button p-3 group relative">
                <Bell className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>

              {/* Settings */}
              <button className="glass-button p-3 group">
                <Settings className="w-5 h-5 text-white/80 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>

              {/* User Role Badge */}
              <div className="hidden md:block glass-card px-4 py-2">
                <span className="text-sm text-white/90 font-semibold capitalize">
                  {user.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="glass-button flex items-center gap-2 px-4 py-2 group hover:bg-red-500/20 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 text-white/80 group-hover:text-red-400 transition-colors" />
                <span className="hidden sm:inline text-white/80 group-hover:text-red-400 font-medium transition-colors">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* iOS-Style Navigation Cards */}
      <nav className="sticky top-20 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              const colorClasses = {
                emerald: 'from-emerald-400 to-emerald-600',
                blue: 'from-blue-400 to-blue-600',
                purple: 'from-purple-400 to-purple-600',
                pink: 'from-pink-400 to-pink-600',
              };

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[120px] transition-all duration-300 group ${
                    isActive 
                      ? 'glass-card scale-105' 
                      : 'bg-white/5 hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  {/* Icon with Glass Effect */}
                  <div className={`relative ${isActive ? 'floating' : ''}`}>
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[item.color]} rounded-xl blur-lg opacity-75`}></div>
                    )}
                    <div className={`relative p-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${colorClasses[item.color]} shadow-lg` 
                        : 'bg-white/10 group-hover:bg-white/20'
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors ${
                        isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                  }`}>
                    {item.name}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeInUp">
          <CurrentComponent user={user} />
        </div>
      </main>

      {/* Glass Footer */}
      <footer className="backdrop-blur-xl bg-white/5 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-semibold">
                    Military Asset Management System
                  </p>
                  <p className="text-white/40 text-xs">
                    © 2025 All rights reserved
                  </p>
                </div>
              </div>
              
    
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;