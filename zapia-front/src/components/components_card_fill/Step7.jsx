import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

const Step7 = ({ formData, onReset }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('pending'); // 'pending', 'success', 'error'

  // Send POST request to add the card when component mounts (process complete)
  useEffect(() => {
    const addCard = async () => {
      const userId = formData.userId || localStorage.getItem('user_id');
      if (formData.cardId && userId) {
        try {
          const response = await fetch('http://localhost:5000/user/add-cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              card_ids: [formData.cardId]
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Card successfully added to user profile:', result);
            setSubmissionStatus('success');
          } else {
            console.error('Failed to add card:', response.status);
            setSubmissionStatus('error');
          }
        } catch (error) {
          console.error('Error adding card:', error);
          setSubmissionStatus('error');
        }
      } else {
        console.warn('Missing required data:', { cardId: formData.cardId, userId: formData.userId });
        setSubmissionStatus('error');
      }
    };

    addCard();
  }, [formData.cardId, formData.userId]);

  // Trigger confetti animation on component mount
  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleNewSubmission = () => {
    if (onReset) {
      onReset();
    }
  };

  const handleGoToDashboard = () => {
    // Navigate to dashboard or home page
    window.location.href = '/';
  };

  return (
    <div className="space-y-6 min-h-[600px] pb-6">
      {/* Success Animation Container */}
      <div className="relative">
        {/* Animated Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 shadow-xl">
              <svg className="w-16 h-16 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thank You!
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Your credit card information has been successfully submitted.
          </p>
        </div>
      </div>

      {/* Appreciation Message Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">We Appreciate Your Contribution!</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information you've provided is incredibly valuable to us. It helps us better understand 
              credit card offerings and rewards structures, enabling us to provide improved services and 
              insights to all our users.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your contribution makes a real difference in building a comprehensive database that benefits 
              the entire community. Thank you for taking the time to share this detailed information with us!
            </p>
          </div>
        </div>
      </div>

      {/* Submission Status Alert */}
      {submissionStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Card successfully added to your profile!</span>
          </div>
        </div>
      )}
      
      {submissionStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">
              {formData.cardId ? 'Failed to add card to profile. Please try again later.' : 'No card ID found. Please contact support.'}
            </span>
          </div>
        </div>
      )}

      {/* Submission Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Submission Summary
          </h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            {showDetails ? 'Hide' : 'Show'} Details
            <svg 
              className={`w-4 h-4 ml-1 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{formData.bankName ? '✓' : '○'}</p>
            <p className="text-sm text-gray-600 mt-1">Bank Selected</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{formData.cardName ? '✓' : '○'}</p>
            <p className="text-sm text-gray-600 mt-1">Card Created</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{formData.pointData ? '✓' : '○'}</p>
            <p className="text-sm text-gray-600 mt-1">Points Configured</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-pink-600">
              {(formData.percentageOffData ? 1 : 0) + (formData.cashbackData ? 1 : 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Bonus Rewards</p>
          </div>
        </div>

        {/* Detailed Information (Collapsible) */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Bank:</span>
              <span className="font-medium text-gray-900">{formData.bankName || 'Not specified'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Card Name:</span>
              <span className="font-medium text-gray-900">{formData.cardName || 'Not specified'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Card ID:</span>
              <span className="font-medium text-gray-900">#{formData.cardId || 'Not assigned'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Points System:</span>
              <span className="font-medium text-gray-900">{formData.pointName || 'Not configured'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Additional Rewards:</span>
              <div className="flex gap-2">
                {formData.percentageOffData && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">% Off</span>
                )}
                {formData.cashbackData && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Cashback</span>
                )}
                {!formData.percentageOffData && !formData.cashbackData && (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What's Next Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white/90">Your submission has been saved and will be reviewed by our team</p>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white/90">The data will help improve our credit card recommendations</p>
          </div>
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white/90">You can submit additional cards anytime to help expand our database</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <button
          onClick={handleNewSubmission}
          className="flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Another Card
        </button>
        
        <button
          onClick={handleGoToDashboard}
          className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Go to Dashboard
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step7;