require 'securerandom'

class User
  def initialize data
    @listeners = []
    @info = data
    @info['stamp'] = SecureRandom.uuid
  end

  def info
    @info
  end

  def updateInfo data
    stamp = @info['stamp']
    @info = data
    @info['stamp'] = stamp
    @info
  end

  def addListener listener
    @listeners << listener
  end

  def dropListener listener
    @listeners.delete listener
  end

  def signalAllListeners event
    @listeners.each do |l|
      User.signalListener event, l
    end
  end
  
  def self.signalListener event, listener
    listener.send event.to_json
  end

  def debug
    { 'stamp' => @info['stamp'],
      'name' => @info['name'],
      'n_listeners' => @listeners.length
    }
  end
end
