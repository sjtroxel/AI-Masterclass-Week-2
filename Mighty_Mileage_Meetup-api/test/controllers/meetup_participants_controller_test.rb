require "test_helper"

class MeetupParticipantsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:two)
    @meetup = meetups(:one)
  end

  test "a user can join a meetup via POST /meetups/:id/join" do
    assert_difference("MeetupParticipant.count", 1) do
      post meetup_join_url(@meetup), headers: auth_header_for(@user)
    end

    assert_response :created

    json = JSON.parse(response.body)
    assert_equal @user.id, json["user_id"]
    assert_equal @meetup.id, json["meetup_id"]
  end

  test "a user can leave a meetup via DELETE /meetups/:id/leave" do
    # First join so there's something to leave
    MeetupParticipant.create!(user: @user, meetup: @meetup)

    assert_difference("MeetupParticipant.count", -1) do
      delete meetup_leave_url(@meetup), headers: auth_header_for(@user)
    end

    assert_response :ok

    json = JSON.parse(response.body)
    assert_equal "Successfully left the meetup", json["message"]
  end
end
