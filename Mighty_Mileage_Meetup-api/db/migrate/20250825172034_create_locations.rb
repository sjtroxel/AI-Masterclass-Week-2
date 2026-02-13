class CreateLocations < ActiveRecord::Migration[8.0]
  def change
    create_table :locations do |t|
      t.references :locationable, polymorphic: true, null: false
      t.string :zip_code
      t.string :city
      t.string :state
      t.string :country
      t.string :address

      t.timestamps
    end
  end
end
