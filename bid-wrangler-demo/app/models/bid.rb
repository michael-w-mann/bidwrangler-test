class Bid < ApplicationRecord
  belongs_to :item
  
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :bidder_name, presence: true
  validate :bid_must_be_higher
  validate :cannot_bid_twice_in_a_row
  
  private
  
  def bid_must_be_higher
    if amount && item && amount <= item.current_price
      errors.add(:amount, "must be higher than current price")
    end
  end
  
  def cannot_bid_twice_in_a_row
    if bidder_name == item.bids.last&.bidder_name
      errors.add(:bidder_name, "cannot bid twice in a row")
    end
  end
end
