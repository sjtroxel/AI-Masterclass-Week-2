class ProfilesController < ApplicationController
  before_action :authenticate_request
  before_action :set_profile

  def show
    render json: ProfileBlueprint.render(@profile), status: :ok
  end

  def update
    if @profile.update(profile_params)
      render json: ProfileBlueprint.render_as_hash(@profile), status: :ok
    else
      render json: { errors: @profile.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_profile
    @profile = @current_user.profile
  end

  def profile_params
    params.require(:profile).permit(:bio)
  end
end