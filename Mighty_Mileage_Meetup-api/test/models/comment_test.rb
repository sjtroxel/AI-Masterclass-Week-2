require "test_helper"

class CommentTest < ActiveSupport::TestCase
  setup do
    @comment = Comment.new(
      content: "Great meetup!",
      user: users(:one),
      commentable: meetups(:one),
      meetup_id: meetups(:one).id
    )
  end

  test "is valid with valid attributes" do
    assert @comment.valid?
  end

  test "is invalid without content" do
    @comment.content = nil
    assert_not @comment.valid?
    assert_includes @comment.errors[:content], "can't be blank"
  end

  test "is invalid if content exceeds 2000 characters" do
    @comment.content = "a" * 2001
    assert_not @comment.valid?
  end

  test "must belong to a user" do
    @comment.user = nil
    assert_not @comment.valid?
    assert_includes @comment.errors[:user], "must exist"
  end

  test "must belong to a commentable object" do
    @comment.commentable = nil
    assert_not @comment.valid?
    assert_includes @comment.errors[:commentable], "must exist"
  end
end
