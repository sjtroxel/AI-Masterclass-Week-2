class LocationsController < ApplicationController
  before_action :set_location, only: [:show, :update]
  before_action :authenticate_request, only: [:update]

  def show
    render json: LocationBlueprint.render(@location), status: :ok
  end

  def update
    # optionally: only allow owner to update
    if @location.locationable != @current_user
      return render json: { errors: ['Unauthorized'] }, status: :unauthorized
    end

    if @location.update(location_params)
      render json: LocationBlueprint.render_as_hash(@location), status: :ok
    else
      render json: { errors: @location.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_location
    @location = Location.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Location not found'] }, status: :not_found
  end

  def location_params
    params.require(:location).permit(:address, :city, :state, :zip_code, :country)
  end
end