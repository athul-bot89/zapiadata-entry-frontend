import React, { useState, useEffect } from 'react';

const Step1Bank = ({ formData, setFormData, nextStep }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch banks when component mounts
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/banks');
      if (!response.ok) {
        throw new Error('Failed to fetch banks');
      }
      const data = await response.json();
      setBanks(data.banks || []);
    } catch (err) {
      setError('Failed to fetch banks. Please try again.');
      console.error('Error fetching banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankChange = (e) => {
    const selectedBankId = e.target.value;
    
    if (selectedBankId) {
      // Find the selected bank object
      const selectedBank = banks.find(
        bank => bank.bank_id.toString() === selectedBankId
      );
      
      if (selectedBank) {
        // Update formData with both bankId and bankName
        setFormData({
          ...formData,
          bankId: selectedBank.bank_id,
          bankName: selectedBank.bank_name
        });
      }
    } else {
      // Clear bank data if no selection
      setFormData({
        ...formData,
        bankId: "",
        bankName: ""
      });
    }
  };

  const handleNext = () => {
    if (!formData.bankId) {
      setError('Please select a bank before proceeding');
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-4 min-h-[400px]">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Step 1: Select Your Bank
      </h3>

      {/* Bank Selection */}
      <div>
        <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
          Choose your bank
        </label>
        
        {loading ? (
          <p className="text-gray-500 text-sm">Loading banks...</p>
        ) : (
          <select
            id="bank"
            value={formData.bankId}
            onChange={handleBankChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">-- Select a Bank --</option>
            {banks.map((bank) => (
              <option key={bank.bank_id} value={bank.bank_id}>
                {bank.bank_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Bank Display */}
      {formData.bankId && formData.bankName && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected Bank:</strong> {formData.bankName}
          </p>
          <p className="text-xs text-blue-600">
            Bank ID: {formData.bankId}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Retry Button (if error loading banks) */}
      {error && banks.length === 0 && (
        <button
          type="button"
          onClick={fetchBanks}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
        >
          Retry Loading Banks
        </button>
      )}

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!formData.bankId || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next Step
      </button>
    </div>
  );
};

export default Step1Bank;