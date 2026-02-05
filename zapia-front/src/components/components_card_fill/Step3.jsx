import React, { useState, useEffect } from 'react';

const Step3 = ({ formData, setFormData, prevStep, nextStep }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingCards, setExistingCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(formData.cardId || null);
  const [cardDetails, setCardDetails] = useState({
    cardName: formData.cardName || '',
    joiningFee: formData.joiningFee || '',
    renewalFee: formData.renewalFee || '',
    joiningOffers: formData.joiningOffers || [''], // Start with one empty field
    milestones: formData.milestones || [{ amount: '', benefit: '' }] // Start with one empty milestone
  });

  // Fetch existing cards when component mounts
  useEffect(() => {
    if (formData.bankId) {
      fetchExistingCards();
    }
  }, [formData.bankId]);

  const fetchExistingCards = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-all-cards/${formData.bankId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingCards(data.cards || []);
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
      setExistingCards([]);
    }
  };

  const handleInputChange = (field, value) => {
    setCardDetails({
      ...cardDetails,
      [field]: value
    });
    
    // Check if the entered card name matches an existing card
    if (field === 'cardName') {
      const existingCard = existingCards.find(card => card.card_name === value);
      if (existingCard) {
        setSelectedCardId(existingCard.card_id);
      } else {
        setSelectedCardId(null);
      }
    }
  };

  const handleOfferChange = (index, value) => {
    const newOffers = [...cardDetails.joiningOffers];
    newOffers[index] = value;
    setCardDetails({
      ...cardDetails,
      joiningOffers: newOffers
    });
  };

  const addOffer = () => {
    setCardDetails({
      ...cardDetails,
      joiningOffers: [...cardDetails.joiningOffers, '']
    });
  };

  const removeOffer = (index) => {
    const newOffers = cardDetails.joiningOffers.filter((_, i) => i !== index);
    setCardDetails({
      ...cardDetails,
      joiningOffers: newOffers.length === 0 ? [''] : newOffers
    });
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...cardDetails.milestones];
    newMilestones[index][field] = value;
    setCardDetails({
      ...cardDetails,
      milestones: newMilestones
    });
  };

  const addMilestone = () => {
    setCardDetails({
      ...cardDetails,
      milestones: [...cardDetails.milestones, { amount: '', benefit: '' }]
    });
  };

  const removeMilestone = (index) => {
    const newMilestones = cardDetails.milestones.filter((_, i) => i !== index);
    setCardDetails({
      ...cardDetails,
      milestones: newMilestones.length === 0 ? [{ amount: '', benefit: '' }] : newMilestones
    });
  };

  const validateForm = () => {
    if (!cardDetails.cardName) {
      setError('Card name is required');
      return false;
    }
    if (!cardDetails.joiningFee || cardDetails.joiningFee < 0) {
      setError('Valid joining fee is required');
      return false;
    }
    if (!cardDetails.renewalFee || cardDetails.renewalFee < 0) {
      setError('Valid renewal fee is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    // If an existing card is selected (name matches exactly), use that card_id
    if (selectedCardId) {
      const existingCard = existingCards.find(card => card.card_id === selectedCardId);
      if (existingCard && existingCard.card_name === cardDetails.cardName) {
        // Use existing card
        setFormData({
          ...formData,
          cardId: selectedCardId,
          cardName: cardDetails.cardName,
          isExistingCard: true,
          userId: formData.userId || localStorage.getItem('user_id') || 101
        });
        
        console.log('Using existing card:', selectedCardId);
        if (nextStep) {
          nextStep();
        }
        return;
      }
    }
    
    // Otherwise, validate and create new card
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    // Build milestone benefits object
    const milestoneBenefits = {};
    cardDetails.milestones.forEach((milestone) => {
      if (milestone.amount && milestone.benefit) {
        milestoneBenefits[milestone.amount] = milestone.benefit;
      }
    });

    // Get user ID from formData (passed from HomePage) or localStorage
    const userId = formData.userId || localStorage.getItem('user_id') || 101; // Default to 101 for testing

    // Filter out empty strings from joining offers
    const filteredOffers = cardDetails.joiningOffers.filter(offer => offer.trim() !== '');

    const requestBody = {
      card_name: cardDetails.cardName,
      bank_id: formData.bankId,
      user_id: userId,
      joining_fee: parseFloat(cardDetails.joiningFee),
      renewal_fee: parseFloat(cardDetails.renewalFee),
      joining_offers: filteredOffers, // Array of strings
      milestone_benefits: milestoneBenefits
    };

    try {
      const response = await fetch('http://localhost:5000/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const result = await response.json();
      
      // Extract card_id from the nested card object in the response
      const newCardId = result.card?.card_id || result.card_id || result.id;
      if (!newCardId) {
        throw new Error('Card was created but no card_id was returned');
      }
      
      // Update form data with all the collected information including the card_id
      setFormData({
        ...formData,
        ...cardDetails,
        cardCreated: true,
        cardResponse: result,
        cardId: newCardId, // Store the card ID for Step4
        cardName: result.card?.card_name || cardDetails.cardName,
        isExistingCard: false,
        userId: userId // Keep the userId in formData
      });

      console.log('Card created with ID:', newCardId, 'Full response:', result);
      alert(`Card created successfully! Card ID: ${newCardId}`);
      
      // Move to Step 4 after successful card creation
      if (nextStep) {
        nextStep();
      }
      
    } catch (err) {
      setError('Failed to create card: ' + err.message);
      console.error('Error creating card:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 min-h-[600px] pb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Step 3: Card Details
      </h3>

      {/* Display Previous Step Information */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
        <h4 className="font-medium text-gray-800 mb-2">Selected Information</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-gray-600">Bank:</span>{' '}
            <span className="text-gray-900">{formData.bankName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Point Type:</span>{' '}
            <span className="text-gray-900">{formData.pointName || formData.newPoint?.point_name}</span>
          </div>
        </div>
      </div>

      {/* Card Basic Information */}
      <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">Basic Card Information</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Name <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              list="existing-cards"
              value={cardDetails.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value)}
              placeholder="Enter card name or select from existing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="existing-cards">
              {existingCards.map((card) => (
                <option key={card.card_id} value={card.card_name} />
              ))}
            </datalist>
            
            {existingCards.some(card => card.card_name === cardDetails.cardName) && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                ✓ Using existing card (ID: {selectedCardId})
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Fee (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={cardDetails.joiningFee}
              onChange={(e) => handleInputChange('joiningFee', e.target.value)}
              placeholder="5000"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Renewal Fee (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={cardDetails.renewalFee}
              onChange={(e) => handleInputChange('renewalFee', e.target.value)}
              placeholder="2500"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Joining Offers */}
      <div className="space-y-3 p-4 bg-green-50 border border-green-100 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800">Joining Offers </h4>
          <button
            type="button"
            onClick={addOffer}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            + Add Offer
          </button>
        </div>
        <p className="text-xs text-gray-600">Add joining offers for the card</p>
        
        <div className="space-y-2">
          {cardDetails.joiningOffers.map((offer, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={offer}
                onChange={(e) => handleOfferChange(index, e.target.value)}
                placeholder={`Offer ${index + 1} (e.g., 10% cashback on first transaction)`}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cardDetails.joiningOffers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOffer(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Benefits */}
      <div className="space-y-3 p-4 bg-blue-50 border border-blue-100 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800">Milestone Benefits </h4>
          <button
            type="button"
            onClick={addMilestone}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            + Add Milestone
          </button>
        </div>
        <p className="text-xs text-gray-600">Add spending milestones and their rewards</p>
        
        <div className="space-y-2">
          {cardDetails.milestones.map((milestone, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="number"
                value={milestone.amount}
                onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                placeholder={`Amount (e.g., ${100000 * (index + 1)})`}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={milestone.benefit}
                onChange={(e) => handleMilestoneChange(index, 'benefit', e.target.value)}
                placeholder={`Benefit (e.g., ${5000 * (index + 1)} points)`}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cardDetails.milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 pb-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="flex-1 bg-gray-400 text-white py-3 px-4 rounded-md hover:bg-gray-500 transition duration-300 font-medium disabled:opacity-50"
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-300 font-medium disabled:opacity-50"
        >
          {loading ? 'Processing...' : selectedCardId ? 'Continue with Existing Card' : 'Create New Card & Continue'}
        </button>
      </div>

      {/* Debug Information (Remove in production) */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer">
          Debug: Current Form Data
        </summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify({ ...formData, ...cardDetails }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default Step3;