import React, { useState } from 'react';
import axios from 'axios';
import treeData from './main_tree.json';
import TreeSelector from './TreeSelector';

const Step5 = ({ onNext, onPrev, formData, setFormData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [treeConfig, setTreeConfig] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle data change from TreeSelector
  const handleTreeDataChange = (config) => {
    setTreeConfig(config);
  };

  const handleSubmit = async () => {
    // Check if configuration is valid
    if (!treeConfig || !treeConfig.isValid) {
      setError('Please configure at least the root node with percentage off information');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const payload = {
        card_id: formData?.cardId?.toString() || "1", // Converting to string as per sample
        userid: formData?.userId?.toString() || localStorage.getItem('user_id')?.toString() || "2", // Converting to string as per sample
        percentageoff_data: treeConfig.data
      };
      
      // Make POST request to the percentage-off endpoint
      const response = await axios.post('http://localhost:5000/percentage-off', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Percentage Off Response:', response.data);
      
      // Store response data if needed
      setFormData({
        ...formData,
        percentageOffData: response.data
      });
      
      setSuccessMessage('Percentage offers configured successfully!');
      
      // Move to next step or complete the process
      setTimeout(() => {
        if (onNext) {
          onNext(response.data);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting percentage off data:', err);
      setError(err.response?.data?.message || 'Failed to submit percentage off data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to next without saving (skip this step)
  const handleSkip = () => {
    if (onNext) {
      onNext();
    }
  };
  
  return (
    <div className="space-y-6 min-h-[600px] pb-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2">
          🎯 Configure Percentage Offers
        </h3>
        <p className="text-green-100">Step 5: Set up special percentage-off offers for your credit card</p>
      </div>
      
      {/* Display Card Information from Previous Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-800">Card Configuration Summary</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bank</p>
            <p className="font-semibold text-gray-900">{formData.bankName || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Card Name</p>
            <p className="font-semibold text-gray-900">{formData.cardName || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Point Type</p>
            <p className="font-semibold text-gray-900">{formData.pointName || formData.newPoint?.point_name || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Card ID</p>
            <p className="font-semibold text-gray-900">#{formData.cardId || 'Pending'}</p>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-blue-800 font-medium">Optional Configuration</p>
            <p className="text-blue-700 text-sm mt-1">
              Configure percentage-off offers for specific categories. This step is optional - you can skip it if you don't want to offer percentage discounts.
            </p>
          </div>
        </div>
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
      )}
      
      {/* Success message display */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start">
          <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}
      
      {/* Tree Selector Component for Percentage Offers */}
      <TreeSelector 
        treeData={treeData}
        onDataChange={handleTreeDataChange}
        requiredRoot={true}
        title="Configure Percentage Off Categories"
        instructions="Select the categories where you want to offer percentage discounts. The root node defines the default discount rate. You can optionally select specific categories for different discount percentages. Note: The 'no_of_points' field will represent the percentage off value."
      />
      
      {/* Debug view - remove in production */}
      {treeConfig && treeConfig.selectedCount > 0 && (
        <details className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          <summary className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold text-gray-700">Developer View - Payload Preview</span>
            </div>
            <span className="text-xs text-gray-500">Click to expand</span>
          </summary>
          <div className="p-6 bg-gray-900 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2 font-mono">POST http://localhost:5000/percentage-off</p>
            <pre className="text-xs text-green-400 overflow-auto font-mono">
              {JSON.stringify({
                card_id: formData?.cardId?.toString() || "1",
                userid: formData?.userId?.toString() || localStorage.getItem('user_id')?.toString() || "2",
                percentageoff_data: treeConfig.data
              }, null, 2)}
            </pre>
          </div>
        </details>
      )}
      
      {/* Navigation buttons */}
      <div className="mt-8">
        <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <button
            onClick={onPrev}
            className="flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Skip This Step
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !treeConfig?.isValid}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                loading || !treeConfig?.isValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Offers
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5;