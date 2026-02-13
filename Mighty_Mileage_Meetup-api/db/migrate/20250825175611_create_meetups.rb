class CreateMeetups < ActiveRecord::Migration[8.0]
  def change
    create_table :meetups do |t|
      t.references :user, null: false, foreign_key: true
      t.string :activity
      t.text :content
      t.datetime :start_date_time
      t.datetime :end_date_time
      t.integer :guests

      t.timestamps
    end
  end
end
