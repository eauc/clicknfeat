require 'securerandom'
require_relative './user'

class UserCollection
  def initialize
    @users = []
  end

  def allActive
    @users.select do |u|
      u.active?
    end.map do |u|
      u.info
    end
  end

  def createUser data
    user = User.new data
    @users << user
    # self.signalAllUsers self.usersListEvent
    user.info
  end

  def user stamp
    @users.find { |u| u.info['stamp'] == stamp }
  end

  def updateUser data, user
    user.updateInfo data
    self.signalAllUsers self.usersListEvent
  end

  def dropUser stamp
    @users.delete_if { |u| u.info['stamp'] == stamp }
    # self.signalAllUsers self.usersListEvent
  end

  def addUserListener user, listener
    user.addListener listener
    User.signalListener self.usersListEvent, listener
  end

  def signalAllUsers event
    @users.each do |u|
      u.signalAllListeners event
    end
  end

  def signalUsers event, stamps
    users = stamps.map do |s|
      @users.find { |u| u.info['stamp'] === s }
    end
    users = users.reject { |u| u.nil? }
    users.each do |u|
      u.signalAllListeners event
    end
  end

  def usersListEvent
    { 'type'  => 'users',
      'users' => self.allActive,
    }
  end

  def onMessage msg
    case msg['type']
    when "chat"
      msg['stamp'] = SecureRandom.uuid
      stamps = ((msg['to'].clone) << msg['from']).uniq
      self.signalUsers msg, stamps
    else
      p [ "Users: unknown message type #{msg['type']}", msg]
    end
  end

  def debug
    @users.map do |u|
      u.debug
    end
  end
end
