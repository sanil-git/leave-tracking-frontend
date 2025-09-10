import React from 'react';
import { Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, Star } from 'lucide-react';

/**
 * ProductDemo component - Interactive-looking dashboard preview showing PlanWise in action
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 */
const ProductDemo = ({ 
  title = "See PlanWise in Action",
  subtitle = "Experience how our AI-powered platform transforms your leave planning"
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
            {subtitle}
          </p>
        </div>

        {/* Interactive Dashboard Preview */}
        <div className="relative scroll-animate" id="product-demo">
          {/* Main Dashboard Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">PlanWise Dashboard</h3>
                  <p className="text-sm text-gray-500">Welcome back, Sarah!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left: Full Calendar View */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">March 2024</h4>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                        <span className="text-gray-600">‹</span>
                      </button>
                      <button className="w-8 h-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                        <span className="text-gray-600">›</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Full Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                      <div key={i} className="text-center text-gray-500 py-2 font-medium text-sm">{day}</div>
                    ))}
                    {Array.from({length: 35}, (_, i) => {
                      const day = i - 6; // Start from -6 to show previous month days
                      const isCurrentMonth = day > 0 && day <= 31;
                      const isHighlighted = [15, 16, 17, 22, 23].includes(day);
                      const isToday = day === 16;
                      
                      return (
                        <div 
                          key={i} 
                          className={`text-center py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 cursor-pointer ${
                            !isCurrentMonth ? 'text-gray-300' :
                            isToday ? 'bg-purple-600 text-white font-bold shadow-lg' :
                            isHighlighted ? 'bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200' :
                            'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {isCurrentMonth ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Leave Balances & Insights */}
              <div className="space-y-6">
                {/* Leave Balances Panel */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Leave Balances</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Earned Leave</div>
                          <div className="text-2xl font-bold text-purple-700">12 days</div>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Sick Leave</div>
                          <div className="text-2xl font-bold text-green-700">8 days</div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Casual Leave</div>
                          <div className="text-2xl font-bold text-blue-700">3 days</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Long Weekends Panel */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">Smart Insights</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">Long Weekend Detected!</div>
                          <div className="text-xs text-gray-600">Mar 15-18 (4 days off)</div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">Optimal Booking</div>
                          <div className="text-xs text-gray-600">Book flights 2 weeks early</div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">Team Sync</div>
                          <div className="text-xs text-gray-600">3 colleagues also planning leave</div>
                        </div>
                        <Calendar className="w-5 h-5 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Elements */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="absolute top-1/2 -right-6 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;
