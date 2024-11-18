class Api::V1::BidsController < ApplicationController
  def create
    @item = Item.find(bid_params[:item_id])  # Changed to find specific item
    @bid = @item.bids.new(amount: bid_params[:amount], bidder_name: bid_params[:bidder_name])
    
    if @bid.save
      @item.update(current_price: @bid.amount)
      
      ActionCable.server.broadcast 'auction_channel', {
        type: 'BID_UPDATE',
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
    params.require(:bid).permit(:amount, :bidder_name, :item_id)
  end
end