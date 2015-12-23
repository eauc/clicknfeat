require 'sinatra/base'
require 'sinatra-websocket'
require 'json'

require_relative './lib/user_collection'
require_relative './lib/game_collection'

class Server < Sinatra::Base

  def initialize
    super
    @users = UserCollection.new
    @games = GameCollection.new
  end
  
  set :server, 'thin'
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  get '/' do
    redirect '/dist/index.html'
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
      timer = nil
      ws.onopen do |event|
        p [:open_user, user.info['name'], ws.object_id]
        timer = EM.add_periodic_timer(15) {
          ws.ping('hello')
          p ["Sent ping", user.info['name'], ws.object_id]
        }
        @users.addUserListener user, ws
        User.signalListener @games.gamesListEvent, ws
      end
      
      ws.onmessage do |data|
        msg = JSON.parse data
        p [:message_user, user.info['name'], msg]
        @users.onMessage msg
      end
      
      ws.onclose do
        p [:close_user, user.info['name'], ws.object_id]
        EM.cancel_timer(timer)
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

  get '/api/games' do
    content_type 'text/json'
    return @games.all.to_json
  end

  get '/api/games/debug' do
    content_type 'text/json'
    return @games.debug.to_json
  end

  post '/api/games' do
    data = JSON.parse request.body.read
    
    game = @games.createGame data
    @users.signalAllUsers @games.gamesListEvent

    content_type 'text/json'
    status 201
    game.to_json
  end

  get '/api/games/public/:stamp' do
    name = params['name']
    game = @games.public_game params['stamp']
    return status 404 if game.nil?
    
    if not request.websocket?
      content_type 'text/json'
      return game.public_info.to_json
    end
    
    request.websocket do |ws|
      timer = nil
      ws.onopen do |event|
        p [:open_watcher, name, ws.object_id]
        timer = EM.add_periodic_timer(15) {
          ws.ping('hello')
          p ["Sent ping", name, ws.object_id]
        }
        game.addWatcher ws, name
      end
      
      ws.onmessage do |data|
        msg = JSON.parse data
        p [:message_watcher, msg]
        game.onPublicMessage msg
      end
      
      ws.onclose do
        p [:close_watcher, ws.object_id]
        EM.cancel_timer(timer)
        game.dropWatcher ws
      end
    end
  end

  get '/api/games/private/:stamp' do
    name = params['name']
    game = @games.private_game params['stamp']
    return status 404 if game.nil?
    
    if not request.websocket?
      content_type 'text/json'
      return game.private_info.to_json
    end
    
    request.websocket do |ws|
      timer = nil
      ws.onopen do |event|
        p [:open_player, name, ws.object_id]
        timer = EM.add_periodic_timer(15) {
          ws.ping('hello')
          p ["Sent ping", name, ws.object_id]
        }
        game.addPlayer ws, name
        @users.signalAllUsers @games.gamesListEvent
      end
      
      ws.onmessage do |data|
        msg = JSON.parse data
        p [:message_player, msg]
        game.onPrivateMessage msg
      end
      
      ws.onclose do
        p [:close_player, ws.object_id]
        EM.cancel_timer(timer)
        game.dropPlayer ws
      end
    end
  end

  delete '/api/games/private/:stamp' do
    game = @games.private_game params['stamp']
    return status 404 if game.nil?

    @games.dropGame params['stamp']
    @users.signalAllUsers @games.gamesListEvent
    status 204
  end
end
