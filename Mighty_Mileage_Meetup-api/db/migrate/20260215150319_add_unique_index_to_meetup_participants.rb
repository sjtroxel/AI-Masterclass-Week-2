class AddUniqueIndexToMeetupParticipants < ActiveRecord::Migration[8.0]
  def change
    remove_index :meetup_participants, :user_id
    add_index :meetup_participants, [:user_id, :meetup_id], unique: true
  end
end
