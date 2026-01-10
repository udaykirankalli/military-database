/**
 * Transfers Component
 * Displays and manages inter-base transfers
 * 
 * Location: src/components/Transfers.js
 */

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import apiService from '../services/apiService';

function Transfers({ user }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.getTransfers();
      setTransfers(data);
    } catch (err) {
      setError('Failed to load transfer records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'in_transit') return <Clock className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-emerald-900/50 text-emerald-400 border-emerald-700';
    if (status === 'in_transit') return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
    return 'bg-blue-900/50 text-blue-400 border-blue-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Transfer Records</h2>
          <p className="text-slate-400 mt-1">Inter-base equipment movements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold">
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Transfers Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No transfer records found
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className="hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">
                        {transfer.equipment_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {transfer.equipment_category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      {transfer.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {transfer.from_base_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {transfer.to_base_name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          transfer.status
                        )}`}
                      >
                        {getStatusIcon(transfer.status)}
                        {transfer.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transfers;