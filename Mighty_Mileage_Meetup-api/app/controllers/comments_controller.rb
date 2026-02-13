class CommentsController < ApplicationController
  before_action :authenticate_request
  before_action :set_commentable

  def index
  page = params[:page].present? ? params[:page].to_i : 1
  comments = @commentable.comments.page(page).per(10)
    render json: {
      comments: CommentBlueprint.render(comments),
      total_pages: comments.total_pages,
      current_page: comments.current_page
    }, status: :ok
  end

  def create
    comment = @commentable.comments.build(comment_params.merge(user: @current_user))
    if comment.save
      render json: CommentBlueprint.render_as_hash(comment), status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_commentable
    if params[:meetup_id]
      @commentable = Meetup.find(params[:meetup_id])
    elsif params[:user_id]
      @commentable = User.find(params[:user_id])
    else
      render json: { errors: ['Commentable not found'] }, status: :not_found
    end
  end

  def comment_params
    params.require(:comment).permit(:content)
  end
end