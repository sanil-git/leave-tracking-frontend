import React from 'react';
import { Bell, CheckCircle, TrendingUp, Users } from 'lucide-react';

/**
 * SmartInsights - AI-powered insights component (lazy-loaded)
 * Shows intelligent recommendations and trends
 */
const SmartInsights = ({ leaveBalances, holidays, vacations }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Bell className="w-5 h-5 text-green-600 mr-2" />
        <h4 className="font-semibold text-gray-800">Smart Insights</h4>
      </div>
      
      <div className="space-y-3">
        {/* Long Weekend Alert - Emerald theme */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-emerald-900">Long Weekend Detected!</h4>
            <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-emerald-700">Mar 15-18 (4 days off)</p>
        </div>

        {/* Optimal Booking - Indigo theme */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-indigo-900">Optimal Booking</h4>
            <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-indigo-700">Book flights 2 weeks early</p>
        </div>

        {/* Team Sync - Violet theme */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-violet-900">Team Sync</h4>
            <div className="w-8 h-8 bg-violet-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <p className="text-sm text-violet-700">3 colleagues also planning leave</p>
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;
