import React, { useState } from 'react';
import { Calendar, Gift, CheckCircle } from 'lucide-react';

const OnboardingModal = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [leaveBalances, setLeaveBalances] = useState({ EL: '', SL: '', CL: '' });
  const [errors, setErrors] = useState({});

  const validateBalances = () => {
    const newErrors = {};
    
    if (!leaveBalances.EL || leaveBalances.EL < 0 || leaveBalances.EL > 365) {
      newErrors.EL = 'Enter a valid number (0-365)';
    }
    if (!leaveBalances.SL || leaveBalances.SL < 0 || leaveBalances.SL > 365) {
      newErrors.SL = 'Enter a valid number (0-365)';
    }
    if (!leaveBalances.CL || leaveBalances.CL < 0 || leaveBalances.CL > 365) {
      newErrors.CL = 'Enter a valid number (0-365)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1) {
      if (validateBalances()) {
        setStep(2);
      }
    } else if (step === 2) {
      // Complete onboarding
      onComplete({
        EL: parseInt(leaveBalances.EL) || 0,
        SL: parseInt(leaveBalances.SL) || 0,
        CL: parseInt(leaveBalances.CL) || 0
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Welcome to PlanWise!</h2>
          <p className="text-center text-purple-100">Let's set up your account in 2 easy steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 p-6 bg-gray-50">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {step > 1 ? <CheckCircle size={20} /> : '1'}
          </div>
          <div className={`w-24 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Set Your Leave Balances</h3>
                <p className="text-gray-600">How many leave days do you have for this year?</p>
              </div>

              <div className="space-y-4">
                {/* EL (Earned Leave) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EL (Earned Leave)
                    <span className="text-gray-500 text-xs ml-2">Annual leave, vacation days</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={leaveBalances.EL}
                    onChange={(e) => setLeaveBalances({ ...leaveBalances, EL: e.target.value })}
                    placeholder="e.g., 20"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.EL ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.EL && <p className="text-red-500 text-sm mt-1">{errors.EL}</p>}
                </div>

                {/* SL (Sick Leave) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SL (Sick Leave)
                    <span className="text-gray-500 text-xs ml-2">Medical leave</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={leaveBalances.SL}
                    onChange={(e) => setLeaveBalances({ ...leaveBalances, SL: e.target.value })}
                    placeholder="e.g., 10"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.SL ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.SL && <p className="text-red-500 text-sm mt-1">{errors.SL}</p>}
                </div>

                {/* CL (Casual Leave) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CL (Casual Leave)
                    <span className="text-gray-500 text-xs ml-2">Personal leave</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={leaveBalances.CL}
                    onChange={(e) => setLeaveBalances({ ...leaveBalances, CL: e.target.value })}
                    placeholder="e.g., 5"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.CL ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.CL && <p className="text-red-500 text-sm mt-1">{errors.CL}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You can always update these balances later from your dashboard.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h3 className="text-2xl font-semibold text-gray-900">All Set! 🎉</h3>
              <p className="text-gray-600">Your leave balances have been configured.</p>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Your Leave Balances:</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">EL</p>
                    <p className="text-2xl font-bold text-purple-600">{leaveBalances.EL}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">SL</p>
                    <p className="text-2xl font-bold text-blue-600">{leaveBalances.SL}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">CL</p>
                    <p className="text-2xl font-bold text-green-600">{leaveBalances.CL}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-left bg-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Next steps:</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">✅ Add holidays to your calendar</p>
                  <p className="text-sm text-gray-700">✅ Plan your vacations</p>
                  <p className="text-sm text-gray-700">✅ Discover long weekend opportunities</p>
                  <p className="text-sm text-gray-700">✅ Get AI-powered vacation insights</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <button
            onClick={onSkip}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {step === 1 ? 'Skip for now' : 'Back'}
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            {step === 1 ? 'Continue' : 'Start Using PlanWise →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

