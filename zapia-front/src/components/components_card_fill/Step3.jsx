import React, { useState, useEffect } from 'react';

const Step3 = ({ formData, setFormData, prevStep, nextStep }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingCards, setExistingCards] = useState([]);
  const [cardFound, setCardFound] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardName: formData.cardName || '',
    joiningFee: formData.joiningFee || '',
    renewalFee: formData.renewalFee || '',
    joiningOffers: formData.joiningOffers || [''], // Start with one empty field
    offers: formData.offers || [''], // New offers field
    milestones: formData.milestones || [{ amount: '', benefit: '' }], // Start with one empty milestone
    cardImage: null, // For file upload
    cardId: null,
    cardImageUrl: null
  });

  // Fetch existing cards when component mounts
  useEffect(() => {
    if (formData.bankId) {
      fetchExistingCards();
    }
  }, [formData.bankId]);

  // Fetch card details when cardName changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardDetails.cardName.trim()) {
        fetchCardDetailsByName();
      } else {
        setCardFound(false);
      }
    }, 800); // Debounce to avoid too many API calls

    return () => clearTimeout(timer);
  }, [cardDetails.cardName]);

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

  const fetchCardDetailsByName = async () => {
    // Get user ID from formData or localStorage
    const userId = formData.userId || localStorage.getItem('user_id') || 101;
    
    try {
      setFetchingDetails(true);
      const response = await fetch(
        `http://localhost:5000/card-details?card_name=${encodeURIComponent(cardDetails.cardName)}&user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        const card = data.card;

        // Populate form with existing card details
        setCardDetails({
          cardName: card.card_name || cardDetails.cardName,
          joiningFee: card.joining_fee || '',
          renewalFee: card.renewal_fee || '',
          joiningOffers: (card.joining_offers && card.joining_offers.length > 0) ? card.joining_offers : [''],
          offers: (card.offers && card.offers.length > 0) ? card.offers : [''],
          milestones: card.milestone_benefits ? 
            Object.entries(card.milestone_benefits).map(([amount, benefit]) => ({
              amount,
              benefit
            })) : [{ amount: '', benefit: '' }],
          cardImage: null,
          cardId: card.card_id || null,
          cardImageUrl: card.card_image_url || null
        });

        setCardFound(true);
        setError('');
        console.log('Card details loaded successfully:', card);
      } else if (response.status === 404) {
        setCardFound(false);
        console.log('Card not found matching name and user');
      } else {
        throw new Error('Failed to fetch card details');
      }
    } catch (err) {
      console.error('Error fetching card details:', err);
      setCardFound(false);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCardDetails({
      ...cardDetails,
      [field]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardDetails({
        ...cardDetails,
        cardImage: file
      });
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

  // Handlers for general offers
  const handleGeneralOfferChange = (index, value) => {
    const newOffers = [...cardDetails.offers];
    newOffers[index] = value;
    setCardDetails({
      ...cardDetails,
      offers: newOffers
    });
  };

  const addGeneralOffer = () => {
    setCardDetails({
      ...cardDetails,
      offers: [...cardDetails.offers, '']
    });
  };

  const removeGeneralOffer = (index) => {
    const newOffers = cardDetails.offers.filter((_, i) => i !== index);
    setCardDetails({
      ...cardDetails,
      offers: newOffers.length === 0 ? [''] : newOffers
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
    //console.log('Validating renewal fee:', typeof cardDetails.renewalFee, cardDetails.renewalFee);
    if (!cardDetails.renewalFee || cardDetails.renewalFee < 0) {
      setError('Valid renewal fee is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    // Use PUT when an existing card (by name+user) was found, otherwise POST to create
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
    const filteredJoiningOffers = cardDetails.joiningOffers.filter(offer => offer.trim() !== '');
    
    // Filter out empty strings from general offers
    const filteredOffers = cardDetails.offers.filter(offer => offer.trim() !== '');

    // Create FormData for multipart/form-data submission
    const formDataToSend = new FormData();
    formDataToSend.append('card_name', cardDetails.cardName);
    formDataToSend.append('bank_id', formData.bankId);
    formDataToSend.append('user_id', userId);
    formDataToSend.append('joining_fee', cardDetails.joiningFee || '0');
    formDataToSend.append('renewal_fee', cardDetails.renewalFee || '0');
    
    // Stringify and append JSON fields
    formDataToSend.append('joining_offers', JSON.stringify(filteredJoiningOffers));
    formDataToSend.append('offers', JSON.stringify(filteredOffers));
    formDataToSend.append('milestone_benefits', JSON.stringify(milestoneBenefits));
    
    // Append card image if provided
    if (cardDetails.cardImage) {
      formDataToSend.append('card_image', cardDetails.cardImage);
    }

    try {
      // Choose method and endpoint
      const isUpdate = cardFound && cardDetails.cardId;
      const endpoint = isUpdate ? `http://localhost:5000/cards/${cardDetails.cardId}` : 'http://localhost:5000/cards';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        body: formDataToSend
        // Note: Do not set Content-Type header; browser will set it with proper boundary
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const result = await response.json();
      
      // Extract card_id from the nested card object in the response
      const newCardId = result.card?.card_id || result.card_id || result.id || cardDetails.cardId;
      if (!newCardId) {
        throw new Error('Server did not return a card_id');
      }
      
      // Update form data with all the collected information including the card_id
      setFormData({
        ...formData,
        ...cardDetails,
        cardCreated: true,
        cardResponse: result,
        cardId: newCardId, // Store the card ID for Step4
        cardName: result.card?.card_name || cardDetails.cardName,
        userId: userId // Keep the userId in formData
      });

      console.log(`${method} successful. Card ID:`, newCardId, 'Full response:', result);
      alert(`${method} successful! Card ID: ${newCardId}`);
      
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
            
            {/* Status indicator for card fetch */}
            {fetchingDetails && (
              <p className="text-sm text-blue-600 flex items-center gap-2">
                <span className="animate-spin">⟳</span> Searching for existing card...
              </p>
            )}
            
            {cardFound && !fetchingDetails && (
              <div className="p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm flex items-center gap-2">
                <span>✓</span> Existing card loaded. Edit the details below and save to update.
              </div>
            )}
            
            {!cardFound && cardDetails.cardName.trim() && !fetchingDetails && (
              <p className="text-sm text-gray-600">
                No existing card found for "{cardDetails.cardName}". Add new details below.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Image
          </label>
          <div className="space-y-3">
            {/* Show existing card image URL if available */}
            {cardDetails.cardImageUrl && !cardDetails.cardImage && (
              <div className="flex gap-4 items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  <img
                    src={cardDetails.cardImageUrl}
                    alt="Existing card"
                    className="h-24 w-32 object-cover rounded-md border border-blue-300"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Current Card Image</p>
                  <p className="text-xs text-gray-600 mt-1">URL: {cardDetails.cardImageUrl}</p>
                  <p className="text-xs text-gray-500 mt-2">Upload a new image below to replace it</p>
                </div>
              </div>
            )}
            
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full cursor-pointer"
              />
              <p className="text-xs text-gray-600 mt-2">PNG, JPG, GIF up to 5MB</p>
            </div>
            
            {cardDetails.cardImage && (
              <div className="flex gap-4 items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-shrink-0">
                  <img
                    src={URL.createObjectURL(cardDetails.cardImage)}
                    alt="Card preview"
                    className="h-24 w-32 object-cover rounded-md border border-blue-300"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">File selected:</p>
                  <p className="text-sm text-gray-600 truncate">{cardDetails.cardImage.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Size: {(cardDetails.cardImage.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCardDetails({ ...cardDetails, cardImage: null })}
                  className="flex-shrink-0 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                >
                  Remove
                </button>
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

      {/* General Offers */}
      <div className="space-y-3 p-4 bg-purple-50 border border-purple-100 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800">General Offers </h4>
          <button
            type="button"
            onClick={addGeneralOffer}
            className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            + Add Offer
          </button>
        </div>
        <p className="text-xs text-gray-600">Add general offers for the card (e.g., cashback, points multipliers)</p>
        
        <div className="space-y-2">
          {cardDetails.offers.map((offer, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={offer}
                onChange={(e) => handleGeneralOfferChange(index, e.target.value)}
                placeholder={`Offer ${index + 1} (e.g., 5% cashback on travel, 2x points on dining)`}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cardDetails.offers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGeneralOffer(index)}
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
          {loading ? 'Processing...' : 'Continue'}
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