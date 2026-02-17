require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    # Fixture has bcrypt digest for "password1"
  end

  test "valid login returns 200 and a JWT token" do
    post login_url, params: { username: @user.username, password: "password1" }
    assert_response :ok

    json = JSON.parse(response.body)
    assert json.key?("token"), "Response should include a token"
    assert json.key?("user"), "Response should include user data"
  end

  test "invalid login returns 401 unauthorized" do
    post login_url, params: { username: @user.username, password: "wrongpassword" }
    assert_response :unauthorized

    json = JSON.parse(response.body)
    assert_includes json["errors"], "Invalid username or password"
  end
end
