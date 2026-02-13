class Profile < ApplicationRecord
  # validations
  validates :bio, length: { maximum: 2000 }

  # associations
  belongs_to :user
end
