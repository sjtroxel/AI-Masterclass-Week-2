Rails.application.routes.draw do
  
  # Auth
  post '/signup', to: 'users#create'
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'
  get '/me', to: 'sessions#me'

  resources :users, only: [:index, :show, :update, :destroy] do
    resource :profile, only: [:show, :update]
    resources :comments, only: [:index, :create]
  end

  resources :meetups do
    resources :comments, only: [:index, :create]
    post 'join', to: 'meetup_participants#create'
    delete 'leave', to: 'meetup_participants#destroy'
  end

  resources :locations, only: [:show, :update]
end