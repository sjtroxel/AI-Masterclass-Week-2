class CreateMeetupParticipants < ActiveRecord::Migration[8.0]
  def change
    create_table :meetup_participants do |t|
      t.references :user, null: false, foreign_key: true
      t.references :meetup, null: false, foreign_key: true

      t.timestamps
    end
  end
end
