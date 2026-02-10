import React, { useState, useEffect } from 'react';
import axios from 'axios';
import treeData from './main_tree.json';
import TreeSelector from './TreeSelector';

const Step4 = ({ onNext, onPrev, formData, setFormData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [treeConfig, setTreeConfig] = useState(null);
  const [initialFilledTree, setInitialFilledTree] = useState(null);

  // Handle data change from TreeSelector
  const handleTreeDataChange = (config) => {
    setTreeConfig(config);
  };

  const handleSubmit = async () => {
    // Check if configuration is valid
    if (!treeConfig || !treeConfig.isValid) {
      setError('Please fill at least the root node with points information');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        card_id: formData?.cardId || 1, // Using card ID from Step3
        point_id: formData?.pointId || 1, // Using point ID from Step2
        userid: formData?.userId || localStorage.getItem('user_id') || 1, // Using user ID from formData or localStorage
        point_data: treeConfig.data
      };
      
      // Make POST request to the endpoint
      const response = await axios.post('http://localhost:5000/card-points', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response:', response.data);
      
      // Move to next step or complete the process
      if (onNext) {
        onNext(response.data);
      }
      
    } catch (err) {
      console.error('Error submitting data:', err);
      setError(err.response?.data?.message || 'Failed to submit data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Try to fetch existing points JSON for this card and prefill the tree
  useEffect(() => {
    const fetchPoints = async () => {
      const cardId = formData?.cardId || 1;
      try {
        const resp = await axios.get(`http://localhost:5000/card-points/${cardId}`);
        if (resp?.data && resp.data.points_json) {
          setInitialFilledTree(resp.data.points_json);
        }
      } catch (err) {
        // Not fatal — no existing points, user can create new
        console.debug('No existing points JSON or fetch failed', err?.message || err);
      }
    };

    // Only fetch when cardId exists
    if (formData?.cardId) fetchPoints();
  }, [formData?.cardId]);
  
  // Navigate to next without saving (skip this step)
  const handleSkip = () => {
    if (onNext) {
      onNext();
    }
  };
  
  // Get tree data from config or return empty if needed
  const getTreeData = () => {
    return treeConfig?.data || {};
  };
  
  return (
    <div className="space-y-6 min-h-[600px] pb-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2">
          💳 Configure Points & Rewards
        </h3>
        <p className="text-blue-100">Step 4: Provide point reward rule details. Skip if none apply to this card</p>
      </div>
      
      {/* Display Card Information from Previous Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              Configure point rewards for different categories. If this card doesn't offer points, you can skip this section.
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
      
      {/* Tree Selector Component */}
      <TreeSelector 
        treeData={treeData}
        onDataChange={handleTreeDataChange}
        initialFilledTree={initialFilledTree}
        requiredRoot={true}
        title="Configure Points Categories"
        instructions="Select the categories where you want to offer points. The root node is required and defines the default points for all transactions. You can optionally select specific categories for different point rates."
      />
      
      {/* Debug view - remove in production */}
      {treeConfig && treeConfig.selectedCount > 0 && (
        <details className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
          <summary className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold text-gray-700">Developer View</span>
            </div>
            <span className="text-xs text-gray-500">Click to expand</span>
          </summary>
          <div className="p-6 bg-gray-900 border-t border-gray-200">
            <pre className="text-xs text-green-400 overflow-auto font-mono">
              {JSON.stringify({
                card_id: formData?.cardId || 1,
                point_id: formData?.pointId || 1,
                userid: formData?.userId || localStorage.getItem('user_id') || 1,
                point_data: treeConfig.data
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
          
          <div className="flex items-center gap-3">
            {treeConfig && treeConfig.selectedCount > 0 && (
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{treeConfig.selectedCount}</span> categories configured
              </div>
            )}
            
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
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
                  Submit Points
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

export default Step4;