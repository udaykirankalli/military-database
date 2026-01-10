/**
 * Dashboard Component
 * Displays metrics with filters and detailed breakdowns
 * 
 * Location: src/components/Dashboard.js
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Package, TrendingUp, Users, Filter, X, Calendar, MapPin, Box } from 'lucide-react';
import apiService from '../services/apiService';

function Dashboard({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: '',
    equipmentTypeId: ''
  });
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load bases and equipment types for filters
      const [basesData, typesData] = await Promise.all([
        apiService.getBases(),
        apiService.getEquipmentTypes()
      ]);
      
      setBases(basesData);
      setEquipmentTypes(typesData);
      
      // Load metrics with current filters
      await loadMetrics();
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build filter object, only including non-empty values
      const filterParams = {};
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      if (filters.baseId) filterParams.baseId = filters.baseId;
      if (filters.equipmentTypeId) filterParams.equipmentTypeId = filters.equipmentTypeId;

      const data = await apiService.getDashboardMetrics(filterParams);
      setMetrics(data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setShowFiltersModal(false);
    loadMetrics();
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      baseId: '',
      equipmentTypeId: ''
    });
    setShowFiltersModal(false);
    // Reload without filters
    setTimeout(() => loadMetrics(), 100);
  };

  const hasActiveFilters = () => {
    return filters.startDate || filters.endDate || filters.baseId || filters.equipmentTypeId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg">
        <p className="font-semibold mb-1">Error Loading Dashboard</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadMetrics}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div
      className={`glass-card p-6 hover:border-slate-600 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/60 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${color.replace('text', 'bg')}/10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">
        {value?.toLocaleString() || 0}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Dashboard Overview</h2>
          <p className="text-white/60 mt-1">Real-time asset tracking and metrics</p>
        </div>
        <button 
          onClick={() => setShowFiltersModal(true)}
          className={`glass-button flex items-center gap-2 px-4 py-2 ${
            hasActiveFilters() ? 'ring-2 ring-emerald-500/50' : ''
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters() && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/60 text-sm font-medium">Active Filters:</span>
            {filters.startDate && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                From: {new Date(filters.startDate).toLocaleDateString()}
              </span>
            )}
            {filters.endDate && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                To: {new Date(filters.endDate).toLocaleDateString()}
              </span>
            )}
            {filters.baseId && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                Base: {bases.find(b => b.id === parseInt(filters.baseId))?.name}
              </span>
            )}
            {filters.equipmentTypeId && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                Type: {equipmentTypes.find(t => t.id === parseInt(filters.equipmentTypeId))?.name}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium hover:bg-red-500/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Opening Balance"
          value={metrics?.openingBalance}
          icon={Package}
          color="text-blue-500"
        />
        <StatCard
          title="Closing Balance"
          value={metrics?.closingBalance}
          icon={Package}
          color="text-green-500"
        />
        <StatCard
          title="Net Movement"
          value={metrics?.netMovement}
          icon={TrendingUp}
          color="text-emerald-500"
          onClick={() => setShowNetMovementModal(true)}
        />
        <StatCard
          title="Assigned"
          value={metrics?.assigned}
          icon={Users}
          color="text-purple-500"
        />
        <StatCard
          title="Expended"
          value={metrics?.expended}
          icon={Package}
          color="text-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Trend Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Asset Balance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { month: 'Jan', opening: 1100, closing: 1150 },
                { month: 'Feb', opening: 1150, closing: 1200 },
                { month: 'Mar', opening: 1200, closing: 1250 },
                { month: 'Apr', opening: 1250, closing: metrics?.closingBalance || 1250 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="opening"
                stroke="#3b82f6"
                name="Opening"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="closing"
                stroke="#10b981"
                name="Closing"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Movement Breakdown Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Movement Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Purchases', value: metrics?.purchases || 0, fill: '#10b981' },
                { name: 'Transfer In', value: metrics?.transferIn || 0, fill: '#3b82f6' },
                { name: 'Transfer Out', value: metrics?.transferOut || 0, fill: '#ef4444' },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowFiltersModal(false)}
        >
          <div
            className="glass-card p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Filter Dashboard</h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Base Filter */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Base
                </label>
                <select
                  value={filters.baseId}
                  onChange={(e) => setFilters({...filters, baseId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All Bases</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
                </select>
              </div>

              {/* Equipment Type Filter */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Equipment Type
                </label>
                <select
                  value={filters.equipmentTypeId}
                  onChange={(e) => setFilters({...filters, equipmentTypeId: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All Equipment Types</option>
                  {equipmentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors border border-white/10"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Net Movement Modal */}
      {showNetMovementModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowNetMovementModal(false)}
        >
          <div
            className="glass-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Net Movement Details</h3>
              <button
                onClick={() => setShowNetMovementModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white/80 font-medium">Purchases</span>
                <span className="text-emerald-400 font-bold text-lg">
                  +{metrics?.purchases?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white/80 font-medium">Transfer In</span>
                <span className="text-emerald-400 font-bold text-lg">
                  +{metrics?.transferIn?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white/80 font-medium">Transfer Out</span>
                <span className="text-red-400 font-bold text-lg">
                  -{metrics?.transferOut?.toLocaleString() || 0}
                </span>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">Net Movement</span>
                  <span className="text-emerald-400 font-bold text-2xl">
                    {metrics?.netMovement?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNetMovementModal(false)}
              className="w-full mt-6 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;