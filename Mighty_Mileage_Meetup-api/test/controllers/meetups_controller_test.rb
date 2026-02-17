require "test_helper"

class MeetupsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user_one = users(:one)
    @user_two = users(:two)
    @meetup = meetups(:one) # owned by user :one
  end

  test "GET /meetups returns a successful list of meetups" do
    get meetups_url
    assert_response :ok

    json = JSON.parse(response.body)
    assert json.key?("meetups"), "Response should include meetups key"
    assert json.key?("total_pages"), "Response should include pagination"
  end

  test "a logged-in user can create a new meetup" do
    assert_difference("Meetup.count", 1) do
      post meetups_url,
        params: {
          meetup: {
            title: "New Test Run",
            activity: "run",
            start_date_time: 7.days.from_now.iso8601,
            end_date_time: (7.days.from_now + 2.hours).iso8601,
            guests: 3,
            location_attributes: {
              address: "100 Trail Rd",
              city: "Boulder",
              state: "CO",
              zip_code: "80301",
              country: "US"
            }
          }
        },
        headers: auth_header_for(@user_one)
    end

    assert_response :created
  end

  test "a user cannot delete a meetup they did not create" do
    delete meetup_url(@meetup), headers: auth_header_for(@user_two)
    assert_response :unauthorized

    json = JSON.parse(response.body)
    assert_includes json["errors"], "Unauthorized"
  end
end
