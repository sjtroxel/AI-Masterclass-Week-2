class Meetup < ApplicationRecord
    # validations
    validates :title, :activity, :start_date_time, :end_date_time, :guests, presence: true
    validates :title, length: { maximum: 100 }
    validates :activity, inclusion: { in: %w[run bicycle] }
    validates :guests, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 50 }
    validate :start_in_future
    validate :end_after_start
    validate :duration_within_limit

    # enum activity: { run: 0, bicycle: 1 }

    # associations
    belongs_to :user
    has_one :location, as: :locationable, dependent: :destroy
    accepts_nested_attributes_for :location
    has_many :comments, as: :commentable, dependent: :destroy
    has_many :meetup_participants, dependent: :destroy
    has_many :users, through: :meetup_participants

    private

    def start_in_future
        return if start_date_time.blank?

        if start_date_time < Time.current
            errors.add(:start_date_time, "must be in the future")
        end
    end

    def end_after_start
        return if end_date_time.blank? || start_date_time.blank?

        if end_date_time <= start_date_time
            errors.add(:end_date_time, "must be after the start date and time")
        end
    end

    def duration_within_limit
        return if end_date_time.blank? || start_date_time.blank?

        if (end_date_time - start_date_time) > 48.hours
        errors.add(:end_date_time, "must be within 48 hours of the start date and time")
        end
    end
end