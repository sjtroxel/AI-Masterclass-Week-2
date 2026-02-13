class Location < ApplicationRecord
  # validations
  validates :address, :city, :state, :zip_code, :country, presence: true
  validates :zip_code, format: { with: /\A\d{5}(-\d{4})?\z/, message: "should be 5 digits or ZIP+4" }

  # associations
  belongs_to :locationable, polymorphic: true
end
