require 'sinatra/base'
require 'sinatra-websocket'
require 'json'

require_relative './lib/user_collection'

class Server < Sinatra::Base

  def initialize
    super
    @users = UserCollection.new
  end
  
  set :server, 'thin'
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  get '/' do
    redirect '/index.html'
  end

  get '/api/users' do
    content_type 'text/json'
    return @users.all.to_json
  end

  get '/api/users/debug' do
    content_type 'text/json'
    return @users.debug.to_json
  end

  post '/api/users' do
    data = JSON.parse request.body.read
    content_type 'text/json'
    user = @users.createUser data
    status 201
    user.to_json
  end

  get '/api/users/:stamp' do
    user = @users.user params['stamp']
    return status 404 if user.nil?
    
    if not request.websocket?
      content_type 'text/json'
      return user.info.to_json
    end
    
    request.websocket do |ws|
      ws.onopen do |event|
        p [:open, ws.object_id]
        @timer = EM.add_periodic_timer(15) {
          p ["Sent ping", ws.ping('hello')]
        }
        @users.addUserListener user, ws
      end
      
      ws.onmessage do |data|
        msg = JSON.parse data
        p [:message, msg]
        @users.onMessage msg
      end
      
      ws.onclose do
        p [:close, ws.object_id]
        EM.cancel_timer(@timer)
        user.dropListener ws
      end
    end
  end

  put '/api/users/:stamp' do
    user = @users.user params['stamp']
    return status 404 if user.nil?
    
    data = JSON.parse request.body.read
    @users.updateUser data, user
    
    content_type 'text/json'
    user.info.to_json
  end

  delete '/api/users/:stamp' do
    user = @users.user params['stamp']
    return status 404 if user.nil?

    @users.dropUser params['stamp']
    status 204
  end
end
