require 'securerandom'

class Game
  def initialize data
    @players = []
    @watchers = []
    @state = {}
    @state['players'] = data.fetch('players', { 'p1' => { 'name' => nil },
                                                'p2' => { 'name' => nil }
                                              }).clone
    @state['commands'] = data.fetch('commands', []).clone
    @state['undo'] = data.fetch('undo', []).clone
    @state['chat'] = data.fetch('chat', []).clone
    @state['private_stamp'] = SecureRandom.uuid
    @state['public_stamp'] = SecureRandom.uuid
  end

  def private_info
    @state.select do |k,v|
      ['players','private_stamp','public_stamp'].include? k
    end
  end

  def public_info
    @state.select do |k,v|
      ['players','public_stamp'].include? k
    end
  end

  def onPrivateMessage msg
    case msg['type']
    when "replayCmd"
      self.onReplayCmdMessage msg
    when "undoCmd"
      self.onUndoCmdMessage msg
    when "chat"
      self.onChatMessage msg
    else
      p [ "Game: unknown private message type #{msg['type']}", msg]
    end
  end
  
  def onPublicMessage msg
    case msg['type']
    when "chat"
      self.onChatMessage msg
    else
      p [ "Game: unknown public message type #{msg['type']}", msg]
    end
  end

  def onChatMessage msg
    name = msg['chat']['from'].strip
    return if name.empty?

    msg['chat']['stamp'] = SecureRandom.uuid
    @state['chat'] << msg['chat']
    self.signalAllListeners msg
  end
  
  def onReplayCmdMessage msg
    name = msg['cmd']['user'].strip
    return if name.empty?

    @state['undo'] = @state['undo'].reject { |c| c['stamp'] == msg['cmd']['stamp'] }
    @state['commands'] << msg['cmd'] unless msg['cmd']['do_not_log']
    self.signalAllListeners({ 'type' => 'replayCmd',
                              'cmd' => msg['cmd']
                            })
  end
  
  def onUndoCmdMessage msg
    @state['commands'] = @state['commands'].reject { |c| c['stamp'] == msg['cmd']['stamp'] }
    @state['undo'] << msg['cmd']
    self.signalAllListeners({ 'type' => 'undoCmd',
                              'cmd' => msg['cmd']
                            })
  end
  
  def addPlayer player, name
    name = name.strip
    return if name.empty?
    
    @players << [ player, name ]
    if @state['players']['p1']['name'].nil?
      @state['players']['p1']['name'] = name
      self.signalAllListeners({ 'type' => 'players',
                                'players' => @state['players'],
                              })
    elsif @state['players']['p2']['name'].nil? and not name === @state['players']['p1']['name']
      @state['players']['p2']['name'] = name
      self.signalAllListeners({ 'type' => 'players',
                                'players' => @state['players'],
                              })
    end
    self.sendHistoryToNewListener player
  end

  def dropPlayer player
    @players.delete_if { |p| p[0] == player }
  end

  def players
    @players.map { |p| p[1] }
  end
  
  def addWatcher watcher, name
    name = name.strip
    return if name.empty?

    @watchers << [ watcher, name ]
    self.sendHistoryToNewListener watcher
  end

  def dropWatcher watcher
    @watchers.delete_if { |w| w[0] == watcher }
  end

  def watchers
    @watchers.map { |w| w[1] }
  end

  def signalAllListeners event
    @players.each do |l|
      Game.signalListener event, l[0]
    end
    @watchers.each do |l|
      Game.signalListener event, l[0]
    end
  end
  
  def self.signalListener event, listener
    listener.send event.to_json
  end

  def sendHistoryToNewListener listener
    # batchs = @state['commands'].each_slice(500).to_a
    batchs = [@state['commands']]
    batch_end = batchs.length-1
    batchs.each_with_index do |b,i|
      Game.signalListener({ 'type' => 'cmdBatch',
                            'cmds' => b,
                            'end' => (i===batch_end),
                          }, listener)
    end
    Game.signalListener({ 'type' => 'setCmds',
                          'where' => 'undo',
                          'cmds' => @state['undo'],
                        }, listener)
    Game.signalListener({ 'type' => 'setCmds',
                          'where' => 'chat',
                          'cmds' => @state['chat'],
                        }, listener)
  end
  
  def debug
    { 'private_stamp' => @state['private_stamp'],
      'public_stamp' => @state['public_stamp'],
      'players' => @state['players'],
      'n_commands' => @state['commands'].length,
      'n_undo' => @state['undo'].length,
      'n_chat' => @state['chat'].length,
      'players' => self.players,
      'watchers' => self.watchers,
    }
  end
end
