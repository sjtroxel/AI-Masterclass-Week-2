# frozen_string_literal: true

class MeetupParticipantBlueprint < Blueprinter::Base
  identifier :id

  fields :user_id, :meetup_id, :created_at, :updated_at

  association :user, blueprint: UserBlueprint
end