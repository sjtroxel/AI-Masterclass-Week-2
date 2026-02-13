class MeetupParticipantsController < ApplicationController
  before_action :authenticate_request
  before_action :set_meetup

  def create
    participant = @meetup.meetup_participants.build(user: @current_user)

    if participant.save
      render json: MeetupParticipantBlueprint.render_as_hash(participant), status: :created
    else
      render json: { errors: participant.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    participant = @meetup.meetup_participants.find_by(user: @current_user)

    unless participant
      return render json: { errors: ['You are not a participant of this meetup'] }, status: :not_found
    end

    participant.destroy
    render json: { message: 'Successfully left the meetup' }, status: :ok
  end

  private

  def set_meetup
    @meetup = Meetup.find(params[:meetup_id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Meetup not found'] }, status: :not_found
  end
end