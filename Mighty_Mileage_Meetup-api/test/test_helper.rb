ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Generate an Authorization header with a valid JWT for the given user.
    # Usage: get meetups_url, headers: auth_header_for(users(:one))
    def auth_header_for(user)
      token = JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.credentials.secret_key_base)
      { "Authorization" => "Bearer #{token}" }
    end
  end
end
