require "test_helper"

class ProfileTest < ActiveSupport::TestCase
  setup do
    @profile = profiles(:one)
  end

  test "is valid with valid attributes" do
    assert @profile.valid?
  end

  test "belongs to a user" do
    assert_equal users(:one), @profile.user
  end

  test "must belong to a user" do
    @profile.user = nil
    assert_not @profile.valid?
    assert_includes @profile.errors[:user], "must exist"
  end

  test "is invalid if bio exceeds 2000 characters" do
    @profile.bio = "a" * 2001
    assert_not @profile.valid?
  end

  test "is valid with a blank bio" do
    @profile.bio = ""
    assert @profile.valid?
  end
end
