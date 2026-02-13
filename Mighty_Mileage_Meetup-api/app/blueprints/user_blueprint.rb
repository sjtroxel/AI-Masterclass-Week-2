# frozen_string_literal: true

class UserBlueprint < Blueprinter::Base
    identifier :id

    fields :first_name, :last_name, :username, :email, :created_at, :updated_at

    association :location, blueprint: LocationBlueprint
    # association :meetups, blueprint: MeetupBlueprint, view: :normal

end