class User < ApplicationRecord
    has_secure_password

    # associations
    has_many :comments, dependent: :destroy
    has_one :profile, dependent: :destroy
    has_one :location, as: :locationable, dependent: :destroy
        accepts_nested_attributes_for :location
    has_many :meetups

    # meetups that the user has created
    has_many :created_meetups, class_name: 'Meetup', foreign_key: 'user_id', dependent: :destroy

    # meetups that the user is participating in
    has_many :meetup_participants, dependent: :destroy
    # has_many :meetups, through: :meetup_participants

    # basic presence validations
    validates :first_name, presence: true
    validates :last_name, presence: true
    validates :email, presence: true
    validates :username, presence: true

    # username and email constraints
    validates :username, uniqueness: true, length: { minimum: 3, maximum: 30 }
        validate :validate_username
    validates :email, uniqueness: true, length: { minimum: 5, maximum: 255 }, format: { with: URI::MailTo::EMAIL_REGEXP }

    # password validations
    validates :password, presence: true, length: { minimum: 6 }, format: { 
        with: /\A(?=.*[a-zA-Z])(?=.*\d).+\z/, 
        message: "Password must include at least one letter and one number!"
    }, allow_nil: true

    private
    def validate_username
        unless username =~ /\A[a-zA-Z0-9_]+\Z/
            errors.add(:username, "can only contain letters, numbers, and underscores - and must contain at least one letter or number!")
        end
    end
end
