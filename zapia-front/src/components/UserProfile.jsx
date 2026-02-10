import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [cardsData, setCardsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get user ID from localStorage with fallback to "2"
  const getUserId = () => {
    return localStorage.getItem('user_id')?.toString() || "2";
  };

  const fetchUserCards = async () => {
    const currentUserId = getUserId();
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/user/cards/${currentUserId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.status}`);
      }
      
      const data = await response.json();
      setCardsData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user cards');
      setCardsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cards on component mount
  useEffect(() => {
    fetchUserCards();
  }, []);

  // Refresh cards every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserCards();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">User Profile</h2>
        <button
          onClick={fetchUserCards}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 disabled:bg-gray-400 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* User Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {cardsData?.user_id || getUserId()}
            </p>
            <p className="text-sm text-gray-500 mt-1">User ID</p>
          </div>
          <div className="text-right">
            {cardsData?.count !== undefined && (
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {cardsData.count} {cardsData.count === 1 ? 'Card' : 'Cards'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* User Cards Section */}
      {cardsData?.cards && cardsData.cards.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Cards</h3>
            {cardsData.message && (
              <span className="text-sm text-green-600">{cardsData.message}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardsData.cards.map((card) => (
              <div key={card.card_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Card Name</div>
                      <div className="font-bold text-lg text-gray-800">
                        {card.card_name}
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      ID: {card.card_id}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Cards Message */}
      {!loading && cardsData && cardsData.cards?.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">No cards found for this user.</p>
        </div>
      )}

      {/* Account Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{cardsData?.count || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Cards</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{cardsData?.count > 0 ? 'Active' : 'No Cards'}</div>
            <div className="text-sm text-gray-600 mt-1">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;