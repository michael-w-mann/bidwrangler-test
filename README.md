# BidWrangler Auction Platform Demo

![BidWrangler Logo](/client/src/images/logo2.png)

## Overview

A real-time auction platform built with React and Ruby on Rails, featuring WebSocket communication for instant updates across multiple bidders.

## Features

- Real-time bidding updates using Action Cable WebSockets
- Multiple auction items support
- Separate views for auctioneers and bidders
- Instant outbid notifications
- Automatic price updates

- Bonus: Optional Bid history tracking 


## Prerequisites

- Ruby 3.2.2
- Rails 7.2.2
- Node.js (latest stable version)
- PostgreSQL
- Yarn or npm

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/michael-w-mann/bidwrangler-test.git
cd bidwrangler-test
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Ruby dependencies
bundle install

# Create and setup the database
rails db:create
rails db:migrate

# Start the Rails server
rails s
```

The backend will run on http://localhost:3000

### 3. Frontend Setup

Open a new terminal

```bash
# Navigate to client directory
cd client

# Install JavaScript dependencies
npm install

# Start the React development server
npm start
```

The frontend will run on http://localhost:3001

## Usage

Open three separate browser tabs, all with the url http://localhost:3001
- In the first tab, click the Auctioneer button to open the Auctioneer dashboard
- In the second tab, click Bidder #1
- In the third tab, click Bidder #2

Auctioneer tab users should be able to:
- create new auction items, which all bidders should see them immediately
- monitor all bids in real-time
- see who is the current top bidders on each item

*BONUS: I added a bid history tracker in the auctioneer tab, but I commented it out in case ya'll didn't want that

Bidder tab users should be able to:
- Place bids on any available items
- See instant rerenders whenever a new bid is made
- View current prices and who is currently in the lead
- Receive instant notifications when outbid
- Receive an alert notification deny message when bidding beneath current price

## Technical Details

### Backend (Ruby on Rails)
- Rails API-only application
- Action Cable for WebSocket communication
- PostgreSQL database

### Frontend (React)
- React Hooks for state management
- WebSocket integration using Action Cable

## 

If you anyone has any questions or wants to know more about my approach, please just let me know! Thank you all! ~Michael
