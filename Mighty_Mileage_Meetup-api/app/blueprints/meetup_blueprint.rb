# frozen_string_literal: true

class MeetupBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :activity, :start_date_time, :end_date_time, :guests, :created_at, :updated_at

  association :user, blueprint: UserBlueprint

  association :location, blueprint: LocationBlueprint

  view :normal do
    fields :title, :activity, :start_date_time, :end_date_time, :guests, :created_at, :updated_at
  end

  view :extended do
    association :comments, blueprint: CommentBlueprint
    association :meetup_participants, blueprint: MeetupParticipantBlueprint
  end
end