class CreateBids < ActiveRecord::Migration[7.2]
  def change
    create_table :bids do |t|
      t.decimal :amount
      t.string :bidder_name
      t.references :item, null: false, foreign_key: true

      t.timestamps
    end
  end
end
