class Api::V1::ItemsController < ApplicationController
    def show
      @item = Item.includes(:bids).first
      if @item
        render json: {
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
      else
        render json: { error: "No item found" }, status: :not_found
      end
    end
  
    def create
      @item = Item.new(item_params)
      if @item.save
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