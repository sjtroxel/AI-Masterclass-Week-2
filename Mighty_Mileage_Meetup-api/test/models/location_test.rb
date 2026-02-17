require "test_helper"

class LocationTest < ActiveSupport::TestCase
  setup do
    @location = Location.new(
      address: "789 Elm St",
      city: "Denver",
      state: "CO",
      zip_code: "80201",
      country: "US",
      locationable: users(:one)
    )
  end

  test "is valid with valid attributes" do
    assert @location.valid?
  end

  test "is invalid without an address" do
    @location.address = nil
    assert_not @location.valid?
    assert_includes @location.errors[:address], "can't be blank"
  end

  test "is invalid without a city" do
    @location.city = nil
    assert_not @location.valid?
    assert_includes @location.errors[:city], "can't be blank"
  end

  test "is invalid without a state" do
    @location.state = nil
    assert_not @location.valid?
    assert_includes @location.errors[:state], "can't be blank"
  end

  test "is invalid without a zip code" do
    @location.zip_code = nil
    assert_not @location.valid?
    assert_includes @location.errors[:zip_code], "can't be blank"
  end

  test "is invalid without a country" do
    @location.country = nil
    assert_not @location.valid?
    assert_includes @location.errors[:country], "can't be blank"
  end

  test "is valid with a 5-digit zip code" do
    @location.zip_code = "90210"
    assert @location.valid?
  end

  test "is valid with a ZIP+4 code" do
    @location.zip_code = "90210-1234"
    assert @location.valid?
  end

  test "is invalid with a non-numeric zip code" do
    @location.zip_code = "ABCDE"
    assert_not @location.valid?
    assert_includes @location.errors[:zip_code], "should be 5 digits or ZIP+4"
  end

  test "is invalid with a 3-digit zip code" do
    @location.zip_code = "123"
    assert_not @location.valid?
    assert_includes @location.errors[:zip_code], "should be 5 digits or ZIP+4"
  end
end
