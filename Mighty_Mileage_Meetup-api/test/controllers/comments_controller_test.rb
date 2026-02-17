require "test_helper"

class CommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @meetup = meetups(:one)
  end

  test "a user can post a comment to a meetup" do
    assert_difference("Comment.count", 1) do
      post meetup_comments_url(@meetup),
        params: { comment: { content: "This is a test comment!" } },
        headers: auth_header_for(@user)
    end

    assert_response :created

    json = JSON.parse(response.body)
    assert_equal "This is a test comment!", json["content"]
  end

  test "posting a comment without auth returns 401" do
    assert_no_difference("Comment.count") do
      post meetup_comments_url(@meetup),
        params: { comment: { content: "Should not work" } }
    end

    assert_response :unauthorized
  end

  test "posting a blank comment returns 422" do
    assert_no_difference("Comment.count") do
      post meetup_comments_url(@meetup),
        params: { comment: { content: "" } },
        headers: auth_header_for(@user)
    end

    assert_response :unprocessable_content
  end
end
