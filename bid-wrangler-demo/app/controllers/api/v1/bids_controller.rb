class Api::V1::BidsController < ApplicationController
    def create
      @item = Item.first
      @bid = @item.bids.new(bid_params)
      
      if @bid.save
        # Update item's current price
        @item.update(current_price: @bid.amount)
        
        # Broadcast the update to all clients (we'll set up Action Cable next)
        ActionCable.server.broadcast 'auction_channel', {
          item: {
            id: @item.id,
            name: @item.name,
            current_price: @item.current_price,
            bids: @item.bids.order(amount: :desc).map { |bid|
              {
                amount: bid.amount,
                bidder_name: bid.bidder_name
              }
            }
          }
        }
        
        render json: @bid, status: :created
      else
        render json: @bid.errors, status: :unprocessable_entity
      end
    end
  
    private
  
    def bid_params
      params.require(:bid).permit(:amount, :bidder_name)
    end
  end