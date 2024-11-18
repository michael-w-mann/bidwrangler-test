import React, { useState, useEffect } from 'react';
import { cable } from '../utils/cable';

function Bidder({ bidderName }) {
  const [items, setItems] = useState([]);
  const [bidAmounts, setBidAmounts] = useState({});  // Store bid amounts for each item
  const [outbidItems, setOutbidItems] = useState({}); // Track outbid status per item

  useEffect(() => {
    const subscription = cable.subscriptions.create('AuctionChannel', {
      received: (data) => {
        console.log('Received WebSocket data:', data);
        
        if (data.type === 'NEW_ITEM') {
          setItems(prevItems => [data.item, ...prevItems]);
        } else if (data.type === 'BID_UPDATE') {
          setItems(prevItems => {
            return prevItems.map(item => {
              if (item.id === data.item.id) {
                // Check if this bidder was outbid
                const previousHighestBidder = item.bids?.[0]?.bidder_name;
                const newHighestBidder = data.item.bids?.[0]?.bidder_name;

                if (previousHighestBidder === bidderName && 
                    newHighestBidder !== bidderName) {
                  console.log(`${bidderName} was outbid on ${item.name}!`);
                  setOutbidItems(prev => ({
                    ...prev,
                    [item.id]: true
                  }));
                  // Clear outbid message after 5 seconds
                  setTimeout(() => {
                    setOutbidItems(prev => ({
                      ...prev,
                      [item.id]: false
                    }));
                  }, 5000);
                }
                return data.item;
              }
              return item;
            });
          });
        }
      },
      connected: () => {
        console.log('Connected to WebSocket');
        // Initial fetch of all items
        fetch('http://localhost:3000/api/v1/items', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setItems(data.items);
          }
        })
        .catch(error => console.error('Error:', error));
      },
      disconnected: () => {
        console.log('Disconnected from WebSocket');
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [bidderName]);

  const handleBidSubmit = async (e, itemId) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/v1/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bid: {
            amount: parseFloat(bidAmounts[itemId]),
            bidder_name: bidderName,
            item_id: itemId
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(Object.values(error).join('\n'));
        return;
      }
      
      // Clear bid amount for this item
      setBidAmounts(prev => ({
        ...prev,
        [itemId]: ''
      }));
      
      // Clear outbid status for this item
      setOutbidItems(prev => ({
        ...prev,
        [itemId]: false
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{bidderName}</h2>

      {items.length === 0 ? (
        <div className="border p-4 rounded mb-6 bg-gray-50">
          <p className="text-gray-600">Waiting for items...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map(item => (
            <div key={item.id} className="border p-4 rounded">
              {outbidItems[item.id] && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">You've been outbid on {item.name}! </strong>
                  <span className="block sm:inline">Place a higher bid to get back in the lead!</span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-lg mb-4">
                Current Price: ${item.current_price}
                {item.bids && item.bids.length > 0 && ` - ${item.bids[0].bidder_name}`}
              </p>
              
              <form onSubmit={(e) => handleBidSubmit(e, item.id)} className="mb-4">
                <div className="mb-4">
                  <label className="block mb-2">Your Bid:</label>
                  <input
                    type="number"
                    value={bidAmounts[item.id] || ''}
                    onChange={(e) => setBidAmounts(prev => ({
                      ...prev,
                      [item.id]: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    step="0.01"
                  />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Place Bid
                </button>
              </form>

            {/* commented out below is bid history */}
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Bidder;