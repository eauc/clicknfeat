require 'securerandom'
require_relative './game'

class GameCollection
  def initialize
    @games = []
  end

  def all
    @games.map do |g| g.public_info end
  end

  def createGame data
    game = Game.new data
    @games << game
    game.private_info
  end

  def private_game stamp
    @games.find { |g| g.private_info['private_stamp'] == stamp }
  end
  
  def public_game stamp
    @games.find { |g| g.public_info['public_stamp'] == stamp }
  end
  
  def dropGame stamp
    @games.delete_if { |g| g.private_info['private_stamp'] == stamp }
  end
  
  def gamesListEvent
    { 'type'  => 'games',
      'games' => self.all,
    }
  end

  def debug
    @games.map do |g|
      g.debug
    end
  end
end
