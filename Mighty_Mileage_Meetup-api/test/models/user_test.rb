require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @user = User.new(
      first_name: "Test",
      last_name: "User",
      email: "testuser@example.com",
      username: "test_user",
      password: "password1",
      password_confirmation: "password1"
    )
  end

  test "is invalid without a username" do
    @user.username = nil
    assert_not @user.valid?
    assert_includes @user.errors[:username], "can't be blank"
  end

  test "is invalid without an email" do
    @user.email = nil
    assert_not @user.valid?
    assert_includes @user.errors[:email], "can't be blank"
  end

  test "is invalid if email is not a proper format" do
    @user.email = "not-an-email"
    assert_not @user.valid?
    assert_not_empty @user.errors[:email]
  end

  test "is invalid if the username is already taken" do
    @user.save!
    duplicate = User.new(
      first_name: "Dupe",
      last_name: "User",
      email: "dupe@example.com",
      username: "test_user",
      password: "password1",
      password_confirmation: "password1"
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:username], "has already been taken"
  end
end
