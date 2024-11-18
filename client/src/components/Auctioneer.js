import React, { useState, useEffect } from 'react';
import { cable } from '../utils/cable';

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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Auctioneer Dashboard</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Item Name:</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Starting Price:</label>
          <input
            type="number"
            value={newItem.starting_price}
            onChange={(e) => setNewItem({ ...newItem, starting_price: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Auction
        </button>
      </form>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="border p-4 rounded">
            <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            <p className="text-lg mb-4">
              Current Price: ${item.current_price}
              {item.bids && item.bids.length > 0 && ` - ${item.bids[0].bidder_name}`}
            </p>

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
    </div>
  );
}

export default Auctioneer;