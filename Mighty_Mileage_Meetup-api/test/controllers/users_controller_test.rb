require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "POST /signup creates a user and returns a token" do
    assert_difference("User.count", 1) do
      post signup_url, params: {
        user: {
          first_name: "New",
          last_name: "User",
          email: "newuser@example.com",
          username: "new_user",
          password: "password1",
          password_confirmation: "password1"
        }
      }
    end

    assert_response :created

    json = JSON.parse(response.body)
    assert json.key?("token"), "Response should include a JWT token"
    assert json.key?("user"), "Response should include user data"
    assert_equal "new_user", json["user"]["username"]
  end

  test "POST /signup with invalid data returns 422" do
    assert_no_difference("User.count") do
      post signup_url, params: {
        user: {
          first_name: "",
          last_name: "",
          email: "bad",
          username: "",
          password: "short"
        }
      }
    end

    assert_response :unprocessable_content

    json = JSON.parse(response.body)
    assert json["errors"].any?, "Response should include validation errors"
  end
end
