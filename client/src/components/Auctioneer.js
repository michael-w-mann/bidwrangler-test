import React, { useState, useEffect } from 'react';
import { cable } from '../utils/cable';
import '../styles.css'

function Auctioneer() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', starting_price: '' });

  useEffect(() => {
    const subscription = cable.subscriptions.create('AuctionChannel', {
      received: (data) => {
        if (data.type === 'NEW_ITEM') {
          setItems(prevItems => [data.item, ...prevItems]);
        } else if (data.type === 'BID_UPDATE') {
          setItems(prevItems => prevItems.map(item => 
            item.id === data.item.id ? data.item : item
          ));
        }
      }
    });

    // Fetch existing items
    fetch('http://localhost:3000/api/v1/items')
      .then(res => res.json())
      .then(data => setItems(data.items));

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/v1/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: {
            name: newItem.name,
            current_price: parseFloat(newItem.starting_price)
          }
        })
      });
      if (response.ok) {
        setNewItem({ name: '', starting_price: '' });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h2>Auctioneer Dashboard</h2>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Item Name:</label>
            <input
              className="input"
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div>
            <label>Starting Price:</label>
            <input
              className="input"
              type="number"
              value={newItem.starting_price}
              onChange={(e) => setNewItem({ ...newItem, starting_price: e.target.value })}
            />
          </div>
          <button className="button">Create Auction</button>
        </form>
      </div>
  
      <div className="grid">
        {items.map(item => (
          <div key={item.id} className="box">
            <h3>{item.name}</h3>
            <p>
                Current Price: ${item.current_price}
                {item.bids && item.bids.length > 0 && ` - ${item.bids[0].bidder_name}`}
            </p>
          </div>
        ))}
      </div>
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
  );
}

export default Auctioneer;