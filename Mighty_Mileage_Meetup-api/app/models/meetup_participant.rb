class MeetupParticipant < ApplicationRecord
  belongs_to :user
  belongs_to :meetup

  validates :user_id, uniqueness: { scope: :meetup_id, message: "has already joined this meetup" }
end
