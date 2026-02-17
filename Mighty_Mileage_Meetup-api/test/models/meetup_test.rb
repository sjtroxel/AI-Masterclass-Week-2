require "test_helper"

class MeetupTest < ActiveSupport::TestCase
  setup do
    @meetup = Meetup.new(
      user: users(:one),
      title: "Test Meetup",
      activity: "run",
      start_date_time: 3.days.from_now,
      end_date_time: 3.days.from_now + 2.hours,
      guests: 5
    )
  end

  test "is invalid if start_date_time is in the past" do
    @meetup.start_date_time = 1.day.ago
    assert_not @meetup.valid?
    assert_includes @meetup.errors[:start_date_time], "must be in the future"
  end

  test "is invalid if end_date_time is before the start" do
    @meetup.end_date_time = @meetup.start_date_time - 1.hour
    assert_not @meetup.valid?
    assert_includes @meetup.errors[:end_date_time], "must be after the start date and time"
  end

  test "is valid with run activity" do
    @meetup.activity = "run"
    assert @meetup.valid?
  end

  test "is valid with bicycle activity" do
    @meetup.activity = "bicycle"
    assert @meetup.valid?
  end

  test "is invalid with swimming activity" do
    @meetup.activity = "swimming"
    assert_not @meetup.valid?
    assert_includes @meetup.errors[:activity], "is not included in the list"
  end
end
