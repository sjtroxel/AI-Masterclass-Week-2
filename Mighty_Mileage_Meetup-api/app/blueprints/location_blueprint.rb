# frozen_string_literal: true

class LocationBlueprint < Blueprinter::Base
  identifier :id

  fields :address, :city, :state, :zip_code, :country, :created_at, :updated_at
end