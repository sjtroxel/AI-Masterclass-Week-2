require "test_helper"

class MeetupFlowTest < ActionDispatch::IntegrationTest
  test "the Grand Tour: signup, create meetup, join, and comment" do
    # 1. Sign up a new user
    post signup_url, params: {
      user: {
        first_name: "Grand",
        last_name: "Tour",
        email: "grandtour@example.com",
        username: "grand_tour",
        password: "password1",
        password_confirmation: "password1"
      }
    }
    assert_response :created

    creator_token = JSON.parse(response.body)["token"]
    assert creator_token.present?, "Signup should return a JWT token"
    creator_headers = { "Authorization" => "Bearer #{creator_token}" }

    # 2. Use that token to create a Meetup
    post meetups_url,
      params: {
        meetup: {
          title: "Grand Tour Run",
          activity: "run",
          start_date_time: 7.days.from_now.iso8601,
          end_date_time: (7.days.from_now + 2.hours).iso8601,
          guests: 10,
          location_attributes: {
            address: "1 Grand Ave",
            city: "Austin",
            state: "TX",
            zip_code: "73301",
            country: "US"
          }
        }
      },
      headers: creator_headers
    assert_response :created

    meetup_id = JSON.parse(response.body)["id"]
    assert meetup_id.present?, "Created meetup should have an id"

    # 3. A second user joins that Meetup
    second_user = users(:two)
    second_headers = auth_header_for(second_user)

    post meetup_join_url(meetup_id), headers: second_headers
    assert_response :created

    join_json = JSON.parse(response.body)
    assert_equal second_user.id, join_json["user_id"]

    # 4. The second user posts a comment
    post meetup_comments_url(meetup_id),
      params: { comment: { content: "Can't wait for this meetup!" } },
      headers: second_headers
    assert_response :created

    comment_json = JSON.parse(response.body)
    assert_equal "Can't wait for this meetup!", comment_json["content"]
  end
end
