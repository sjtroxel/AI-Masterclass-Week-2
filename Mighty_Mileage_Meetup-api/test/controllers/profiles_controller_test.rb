require "test_helper"

class ProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @profile = profiles(:one)
  end

  test "a user can fetch their own profile" do
    get user_profile_url(@user), headers: auth_header_for(@user)
    assert_response :ok
  end

  test "a user can update their bio" do
    patch user_profile_url(@user),
      params: { profile: { bio: "Updated bio from test!" } },
      headers: auth_header_for(@user)

    assert_response :ok

    json = JSON.parse(response.body)
    assert_equal "Updated bio from test!", json["bio"]

    @profile.reload
    assert_equal "Updated bio from test!", @profile.bio
  end

  test "fetching profile without auth returns 401" do
    get user_profile_url(@user)
    assert_response :unauthorized
  end
end
