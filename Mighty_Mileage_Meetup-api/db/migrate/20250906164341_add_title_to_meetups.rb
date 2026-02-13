class AddTitleToMeetups < ActiveRecord::Migration[8.0]
  def change
    add_column :meetups, :title, :string
  end
end
