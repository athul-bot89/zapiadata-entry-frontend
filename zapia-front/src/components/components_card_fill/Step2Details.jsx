import React, { useState, useEffect } from 'react';

const Step2Details = ({ formData, setFormData, nextStep, prevStep }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPointId, setSelectedPointId] = useState(formData.pointId || '');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPointData, setNewPointData] = useState({
    pointName: '',
    conversionRate: '',
    minPoints: '',
    validityDays: ''
  });

  // Fetch points when component mounts or when bank is selected
  useEffect(() => {
    if (formData.bankId) {
      fetchPoints();
    }
  }, [formData.bankId]);

  const fetchPoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/points/${formData.bankId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }
      const data = await response.json();
      setPoints(data.points || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching points:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePointSelection = (pointId) => {
    setSelectedPointId(pointId);
    const selectedPoint = points.find(p => p.point_id === pointId);
    if (selectedPoint) {
      setFormData({
        ...formData,
        pointId: pointId,
        pointName: selectedPoint.point_name,
        conversionRate: selectedPoint.conversion_rate_rs,
        redeemableCondition: selectedPoint.redeemable_condition
      });
    }
  };

  const handleCreateNewPoint = async () => {
    
    // Validate new point data
    if (!newPointData.pointName || !newPointData.conversionRate || 
        !newPointData.minPoints || !newPointData.validityDays) {
      alert('Please fill all fields for the new point');
      return;
    }

    try {
      const newPoint = {
        point_name: newPointData.pointName,
        conversion_rate_rs: parseFloat(newPointData.conversionRate),
        redeemable_condition: {
          min_points: parseInt(newPointData.minPoints),
          validity_days: parseInt(newPointData.validityDays)
        },
        bank_id: formData.bankId
      };

      // Make API call to create the new point
      const response = await fetch('http://localhost:5000/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPoint)
      });

      if (!response.ok) {
        throw new Error('Failed to create point');
      }

      const createdPoint = await response.json();

      // Update form data with the created point
      setFormData({
        ...formData,
        pointId: createdPoint.point_id || createdPoint.id,
        pointName: newPoint.point_name,
        conversionRate: newPoint.conversion_rate_rs,
        redeemableCondition: newPoint.redeemable_condition
      });

      alert('New point created successfully!');
      setShowCreateNew(false);
      
      // Clear the new point form
      setNewPointData({
        pointName: '',
        conversionRate: '',
        minPoints: '',
        validityDays: ''
      });
      
      // Refresh the points list
      fetchPoints();
    } catch (err) {
      alert('Failed to create new point: ' + err.message);
    }
  };

  const handleNext = () => {
    if (!selectedPointId && !formData.newPoint) {
      alert('Please select a point type or create a new one');
      return;
    }
    console.log('Form data so far:', formData);
    nextStep(); // Proceed to Step 3
  };

  return (
    <div className="space-y-4 min-h-[500px]">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Step 2: Select Point Type
      </h3>

      {/* Display Bank Information from Step 1 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
        <h4 className="font-medium text-gray-800 mb-2">Selected Bank Information</h4>
        
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium text-gray-600">Bank Name:</span>{' '}
            <span className="text-gray-900">{formData.bankName || 'Not selected'}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium text-gray-600">Bank ID:</span>{' '}
            <span className="text-gray-900">{formData.bankId || 'Not selected'}</span>
          </p>
        </div>
      </div>

      {/* Points Selection Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Available Point Types</h4>
        
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Loading points...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">Error: {error}</p>
          </div>
        )}

        {!loading && !error && points.length > 0 && (
          <div className="space-y-2">
            {points.map((point) => (
              <div
                key={point.point_id}
                className={`p-4 border rounded-md cursor-pointer transition-all ${
                  selectedPointId === point.point_id
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handlePointSelection(point.point_id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{point.point_name}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Conversion Rate: ₹{point.conversion_rate_rs} per point
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Min Points: {point.redeemable_condition.min_points} | 
                      Validity: {point.redeemable_condition.validity_days} days
                    </p>
                  </div>
                  <div className="ml-2">
                    <input
                      type="radio"
                      checked={selectedPointId === point.point_id}
                      onChange={() => handlePointSelection(point.point_id)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              No points found for this bank. Please create a new point type.
            </p>
          </div>
        )}

        {/* Create New Point Button */}
        <button
          type="button"
          onClick={() => setShowCreateNew(!showCreateNew)}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          {showCreateNew ? '− Cancel New Point' : '+ Create New Point Type'}
        </button>

        {/* Create New Point Form */}
        {showCreateNew && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
            <h5 className="font-medium text-gray-800">Create New Point Type</h5>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point Name
              </label>
              <input
                type="text"
                value={newPointData.pointName}
                onChange={(e) => setNewPointData({...newPointData, pointName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Reward Points"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversion Rate (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPointData.conversionRate}
                  onChange={(e) => setNewPointData({...newPointData, conversionRate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Points
                </label>
                <input
                  type="number"
                  value={newPointData.minPoints}
                  onChange={(e) => setNewPointData({...newPointData, minPoints: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity Days
              </label>
              <input
                type="number"
                value={newPointData.validityDays}
                onChange={(e) => setNewPointData({...newPointData, validityDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="730"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateNewPoint}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
            >
              Create Point Type
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition duration-300 font-medium"
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-medium"
        >
          Next Step
        </button>
      </div>

      {/* Debug Information (Remove in production) */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer">
          Debug: Current Form Data
        </summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default Step2Details;