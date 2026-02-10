import React, { useState, useEffect } from 'react';
import axios from 'axios';
import treeData from './main_tree.json';
import TreeSelector from './TreeSelector';

const Step6 = ({ onNext, onPrev, formData, setFormData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [treeConfig, setTreeConfig] = useState(null);
  const [initialFilledTree, setInitialFilledTree] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle data change from TreeSelector
  const handleTreeDataChange = (config) => {
    setTreeConfig(config);
  };

  // Fetch existing cashback configuration for this card (if any)
  useEffect(() => {
    const cardId = formData?.cardId;
    if (!cardId) return;

    const fetchExisting = async () => {
      setFetching(true);
      setFetchError('');
      try {
        const res = await axios.get(`http://localhost:5000/cashback/${cardId}`);
        // Expecting response like { card_id: 81, cashback_json: { ... } }
        if (res?.data && res.data.cashback_json) {
          setInitialFilledTree(res.data.cashback_json);
          // clear any previous submission messages
          setSuccessMessage('Loaded existing cashback configuration');
        }
      } catch (err) {
        // if 404 or no data, ignore but store error for visibility
        console.warn('No existing cashback configuration found or fetch failed', err);
        setFetchError(err.response?.data?.message || 'No existing cashback configuration');
      } finally {
        setFetching(false);
      }
    };

    fetchExisting();
  }, [formData?.cardId]);

  const handleSubmit = async () => {
    // Check if configuration is valid
    if (!treeConfig || !treeConfig.isValid) {
      setError('Please configure at least the root node with cashback information');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const payload = {
        card_id: formData?.cardId?.toString() || "1", // Converting to string as per sample
        userid: formData?.userId?.toString() || localStorage.getItem('user_id')?.toString() || "2", // Converting to string as per sample
        cashback_data: treeConfig.data
      };
      
      // Make POST request to the cashback endpoint
      const response = await axios.post('http://localhost:5000/cashback', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Cashback Response:', response.data);
      
      // Store response data if needed
      setFormData({
        ...formData,
        cashbackData: response.data
      });
      
      setSuccessMessage('Cashback offers configured successfully!');
      
      // Move to next step or complete the process
      setTimeout(() => {
        if (onNext) {
          onNext(response.data);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting cashback data:', err);
      setError(err.response?.data?.message || 'Failed to submit cashback data. Please try again.');
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2">
          💰 Configure Cashback Offers
        </h3>
        <p className="text-purple-100">Step 6: Provide cashback reward details. Skip if this card has none.</p>
      </div>
      
      {/* Display Card Information from Previous Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        
        {/* Show configured rewards summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Configured Rewards:</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              Points System
            </span>
            {formData.percentageOffData && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Percentage Offers
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-purple-800 font-medium">Cashback Configuration</p>
            <p className="text-purple-700 text-sm mt-1">
              Configure cashback rewards for specific categories. This step is optional - you can skip it if you prefer other reward types. 
              The 'no_of_points' field will represent the cashback percentage or amount.
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
      
      {/* Tree Selector Component for Cashback Offers */}
      {fetching && (
        <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">Loading existing cashback configuration…</div>
      )}
      {fetchError && !fetching && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100">{fetchError}</div>
      )}
      <TreeSelector 
        treeData={treeData}
        onDataChange={handleTreeDataChange}
        requiredRoot={true}
        initialFilledTree={initialFilledTree}
        title="Configure Cashback Categories"
        instructions="Select the categories where you want to offer cashback rewards. The root node defines the default cashback rate. You can optionally select specific categories for different cashback percentages or amounts. Note: The 'no_of_points' field will represent the cashback value (percentage or fixed amount)."
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
            <p className="text-xs text-gray-400 mb-2 font-mono">POST http://localhost:5000/cashback</p>
            <pre className="text-xs text-green-400 overflow-auto font-mono">
              {JSON.stringify({
                card_id: formData?.cardId?.toString() || "1",
                userid: formData?.userId?.toString() || localStorage.getItem('user_id')?.toString() || "2",
                cashback_data: treeConfig.data
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
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
                  Submit Cashback
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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

export default Step6;