class Item < ApplicationRecord
    has_many :bids, dependent: :destroy
    
    validates :name, presence: true
    validates :current_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  end