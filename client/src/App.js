import React from 'react';
import { useState } from 'react';
import Auctioneer from './components/Auctioneer';
import Bidder from './components/Bidder';
import './App.css';

function App() {
  const [view, setView] = useState('auctioneer');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button 
          onClick={() => setView('auctioneer')}
          className={`mr-2 px-4 py-2 rounded ${view === 'auctioneer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Auctioneer
        </button>
        <button 
          onClick={() => setView('bidder1')}
          className={`mr-2 px-4 py-2 rounded ${view === 'bidder1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bidder #1
        </button>
        <button 
          onClick={() => setView('bidder2')}
          className={`mr-2 px-4 py-2 rounded ${view === 'bidder2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bidder #2
        </button>
      </div>

      {view === 'auctioneer' && <Auctioneer />}
      {view === 'bidder1' && <Bidder bidderName="Bidder 1" />}
      {view === 'bidder2' && <Bidder bidderName="Bidder 2" />}
    </div>
  );
}

export default App;