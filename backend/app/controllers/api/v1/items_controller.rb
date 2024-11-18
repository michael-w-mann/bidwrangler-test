class Api::V1::ItemsController < ApplicationController
  def index
    @items = Item.includes(:bids).order(created_at: :desc)
    render json: {
      items: @items.map { |item|
        {
          id: item.id,
          name: item.name,
          current_price: item.current_price,
          bids: item.bids.order(amount: :desc).map { |bid|
            {
              amount: bid.amount,
              bidder_name: bid.bidder_name
            }
          }
        }
      }
    }
  end

  def create
    @item = Item.new(item_params)
    if @item.save
      # Broadcast the new item
      ActionCable.server.broadcast 'auction_channel', {
        type: 'NEW_ITEM',
        item: {
          id: @item.id,
          name: @item.name,
          current_price: @item.current_price,
          bids: []
        }
      }
      render json: @item, status: :created
    else
      render json: @item.errors, status: :unprocessable_entity
    end
  end

  private

  def item_params
    params.require(:item).permit(:name, :current_price)
  end
end