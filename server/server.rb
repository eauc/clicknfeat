require 'sinatra/base'
require 'sinatra-websocket'
require 'json'

class Server < Sinatra::Base
  set :server, 'thin'
  set :public_folder, File.join(File.dirname(__FILE__), '..', 'client')
  set :views, File.join(File.dirname(__FILE__), '..', 'client')

  get '/' do
    redirect '/index.html'
  end

  # get '/users' do
  #   if request.websocket?
  #     request.websocket do |ws|
  #       ws.onopen do |event|
  #         p [:open, ws.object_id]
  #         @timer = EM.add_periodic_timer(15) {
  #           p ["Sent ping", ws.ping('hello')]
  #         }
  #       end
        
  #       ws.onmessage do |msg|
  #         p [:message, msg]
  #         # data = JSON.parse msg
  #         # ws.send({ type: 'register_valid',
  #         #           name: name,
  #         #           clients: others
  #         #         }.to_json)
  #       end
        
  #       ws.onclose do
  #         p [:close, ws.object_id]
  #         EM.cancel_timer(@timer)
  #       end
  #     end
  #   end
  # end
end
