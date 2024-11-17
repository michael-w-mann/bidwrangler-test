class AuctionChannel < ApplicationCable::Channel
  def subscribed
    stream_from "auction_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
