/**
 * Purchases Component
 * Displays and manages purchase records
 * 
 * Location: src/components/Purchases.js
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import apiService from '../services/apiService';

function Purchases({ user }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiService.getPurchases();
      setPurchases(data);
    } catch (err) {
      setError('Failed to load purchase records');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold text-white">Purchase Records</h2>
          <p className="text-slate-400 mt-1">Equipment procurement history</p>
        </div>
        {user.role !== 'logistics' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold">
            <Plus className="w-4 h-4" />
            New Purchase
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Purchases Table */}
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
                  Base
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No purchase records found
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(purchase.purchase_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">
                        {purchase.equipment_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {purchase.equipment_category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      {purchase.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {purchase.base_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-500 font-bold">
                      ${purchase.cost?.toLocaleString() || '0'}
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

export default Purchases;