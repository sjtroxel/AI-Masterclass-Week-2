class UsersController < ApplicationController
  before_action :authenticate_request, only: [:show, :update]

  def create
    user = User.new(user_params)
    if user.save
      token = jwt_encode(user_id: user.id)
      render json: { token: token, user: UserBlueprint.render_as_hash(user) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end

  def show
    render json: UserBlueprint.render(@current_user), status: :ok
  end

  def update
    if @current_user.update(user_params)
      render json: { message: "Profile updated", user: UserBlueprint.render_as_hash(@current_user) }, status: :ok
    else
      render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :username, :password, :password_confirmation, 
    location_attributes: [:address, :city, :state, :zip_code, :country])
  end
end