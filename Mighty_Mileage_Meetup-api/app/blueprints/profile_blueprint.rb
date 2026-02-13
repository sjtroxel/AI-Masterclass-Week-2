# frozen_string_literal: true

class ProfileBlueprint < Blueprinter::Base
  identifier :id

  fields :bio, :created_at, :updated_at
end