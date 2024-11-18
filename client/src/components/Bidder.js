import React, { useState, useEffect } from 'react';
import { cable } from '../utils/cable';

function Bidder({ bidderName }) {
  const [item, setItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [wasOutbid, setWasOutbid] = useState(false);

  useEffect(() => {
    let previousHighestBidder = null;

    // Subscribe to auction updates
    const subscription = cable.subscriptions.create('AuctionChannel', {
      received: (data) => {
        console.log('Received WebSocket data:', data);
        if (data.item) {
          setItem(prevItem => {
            // For new items, prevItem will be null
            if (!prevItem) {
              console.log('New item created:', data.item.name);
              return data.item;
            }

            // For existing items, check for outbid
            previousHighestBidder = prevItem?.bids?.[0]?.bidder_name;
            console.log('Previous highest bidder:', previousHighestBidder);
            console.log('Current bidder:', bidderName);
            console.log('New highest bidder:', data.item.bids?.[0]?.bidder_name);

            // check to see if the previous bidder was outbid
            if (previousHighestBidder === bidderName && 
                data.item.bids?.[0]?.bidder_name !== bidderName) {
              console.log(`${bidderName} was outbid!`);
              setWasOutbid(true);
            //   setTimeout(() => setWasOutbid(false), 5000);
            }

            return data.item;
          });
        }
      },
      connected: () => {
        console.log('Connected to WebSocket');
        // Initial fetch when connected
        fetch('http://localhost:3000/api/v1/item', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        .then(res => {
          if (res.ok) return res.json();
          console.log('No item yet');
        })
        .then(data => {
          if (data?.item) setItem(data.item);
        })
        .catch(error => console.error('Error:', error));
      },
      disconnected: () => {
        console.log('Disconnected from WebSocket');
      }
    });

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [bidderName]); //useEffect dependency array

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
      setWasOutbid(false); // Reset outbid status when placing a new bid
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{bidderName}</h2>
      
      {wasOutbid && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">You've been outbid! </strong>
          <span className="block sm:inline">Place a higher bid to get back in the lead!</span>
        </div>
      )}

      {item ? (
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
        </div>
      ) : (
        <div className="border p-4 rounded mb-6 bg-gray-50">
          <p className="text-gray-600">Waiting for an item...</p>
        </div>
      )}
    </div>
  );
}

export default Bidder;