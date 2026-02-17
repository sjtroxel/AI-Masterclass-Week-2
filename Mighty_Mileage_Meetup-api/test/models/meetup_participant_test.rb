require "test_helper"

class MeetupParticipantTest < ActiveSupport::TestCase
  setup do
    @participant = MeetupParticipant.new(
      user: users(:two),
      meetup: meetups(:one)
    )
  end

  test "is valid with valid attributes" do
    assert @participant.valid?
  end

  test "must belong to a user" do
    @participant.user = nil
    assert_not @participant.valid?
    assert_includes @participant.errors[:user], "must exist"
  end

  test "must belong to a meetup" do
    @participant.meetup = nil
    assert_not @participant.valid?
    assert_includes @participant.errors[:meetup], "must exist"
  end

  test "is invalid if user already joined the same meetup" do
    @participant.save!
    duplicate = MeetupParticipant.new(
      user: users(:two),
      meetup: meetups(:one)
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:user_id], "has already joined this meetup"
  end
end
