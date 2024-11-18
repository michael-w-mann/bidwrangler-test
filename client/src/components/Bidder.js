import React, { useState, useEffect } from 'react';
import { cable } from '../utils/cable';
import '../index.css'

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
    <div className="container">
      <div className="box">
        <h2>{bidderName}</h2>
      </div>
  
      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="box">
            {outbidItems[item.id] && (
              <div className="alert">
                You've been outbid on {item.name}! Place another bid to get back on top
              </div>
            )}
            
            <h3>{item.name}</h3>
            <p>
                Current Price: ${item.current_price}
                {item.bids && item.bids.length > 0 && ` - ${item.bids[0].bidder_name}`}
            </p>
            
            <form onSubmit={(e) => handleBidSubmit(e, item.id)}>
              <input
                className="input"
                type="number"
                value={bidAmounts[item.id] || ''}
                onChange={(e) => setBidAmounts(prev => ({
                  ...prev,
                  [item.id]: e.target.value
                }))}
                placeholder="Enter bid amount"
              />
              <button className="button">Place Bid</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bidder;