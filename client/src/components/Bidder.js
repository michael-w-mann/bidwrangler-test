import React, { useState, useEffect } from 'react';
import { cable } from '../utils/cable';

function Bidder({ bidderName }) {
  const [item, setItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    // Subscribe to auction updates
    const subscription = cable.subscriptions.create('AuctionChannel', {
      received: (data) => {
        console.log('Received WebSocket data:', data); // Add this for debugging
        if (data.item) {
          setItem(data.item);
        }
      },
      connected: () => {
        console.log('Connected to WebSocket'); // Add this for debugging
      },
      disconnected: () => {
        console.log('Disconnected from WebSocket'); // Add this for debugging
      }
    });

     // Initial fetch
  const fetchItem = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/item', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.item) {
        setItem(data.item);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  fetchItem();

  // Cleanup subscription
  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/v1/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bid: {
            amount: parseFloat(bidAmount),
            bidder_name: bidderName
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(Object.values(error).join('\n'));
        return;
      }
      
      setBidAmount('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{bidderName}</h2>
      
      {item && (
        <div className="border p-4 rounded mb-6">
          <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            <p className="text-lg mb-4">
            Current Price: ${item.current_price}
            {item.bids && item.bids.length > 0 && ` - ${item.bids[0].bidder_name}`}
            </p>
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label className="block mb-2">Your Bid:</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Place Bid
            </button>
          </form>
    
{/* // commented out below is displayed bid history log*/}
          {/* <div className="space-y-2">
            <h4 className="font-bold">Bid History:</h4>
            {item.bids?.map((bid, index) => (
              <div key={index} className="flex justify-between border-b py-2">
                <span>{bid.bidder_name}</span>
                <span>${bid.amount}</span>
              </div>
            ))}
          </div> */}
        </div>
      )}
    </div>
  );
}

export default Bidder;