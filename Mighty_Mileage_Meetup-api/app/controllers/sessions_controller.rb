class SessionsController < ApplicationController
  before_action :authenticate_request, only: [:me, :destroy]

  def create
    user = User.find_by(username: params[:username])
    if user&.authenticate(params[:password])
      token = jwt_encode(user_id: user.id)
      render json: { token: token, user: UserBlueprint.render_as_hash(user) }, status: :ok
    else
      render json: { errors: ['Invalid username or password'] }, status: :unauthorized
    end
  end

  def destroy
    render json: { message: 'Logged out successfully' }, status: :ok
  end

   def me
    render json: { user: UserBlueprint.render_as_hash(@current_user) }, status: :ok
  end
end