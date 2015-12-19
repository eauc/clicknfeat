require 'json'
require_relative '../../../server/lib/game'

describe Game do
  subject do
    @data = {}
    Game.new @data
  end
  
  it "should have unique public and private stamps" do
    expect(subject.public_info['public_stamp']).to match(%r{\S{28,32}})
    expect(subject.private_info['private_stamp']).to match(%r{\S{28,32}})
    expect(subject.private_info['public_stamp']).to be(subject.public_info['public_stamp'])
    expect(subject.private_info['private_stamp']).not_to be(subject.public_info['public_stamp'])
  end

  it "should init default info" do
    expect(subject.public_info['players']).to eq({ 'p1' => { 'name' => nil },
                                                   'p2' => { 'name' => nil },
                                                 })
  end

  it "should init default state" do
    watcher = double('watcher', :send => nil)
    expect(watcher).to receive(:send).once.with({ 'type' => 'cmdBatch',
                                                  'cmds' => [],
                                                  'end' => true,
                                                }.to_json)
    expect(watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                  'where' => 'undo',
                                                  'cmds' => [],
                                                }.to_json)
    expect(watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                  'where' => 'chat',
                                                  'cmds' => [],
                                                }.to_json)

    subject.addWatcher watcher, "watcher"
  end

  it "should init state from data" do
    @data = {
      'commands' => [ { 'stamp' => 'stamp1' },
                      { 'stamp' => 'stamp2' },
                      { 'stamp' => 'stamp3' },
                    ],
      'undo' => [ { 'stamp' => 'stamp4' },
                  { 'stamp' => 'stamp5' },
                  { 'stamp' => 'stamp6' },
                    ],
      'chat' => [ { 'stamp' => 'stamp7' },
                  { 'stamp' => 'stamp8' },
                  { 'stamp' => 'stamp9' },
                ],
    }
    @subject = Game.new @data
    
    player = double('player', :send => nil)
    expect(player).to receive(:send).once.with({ 'type' => 'cmdBatch',
                                                 'cmds' => @data['commands'],
                                                 'end' => true,
                                               }.to_json)
    expect(player).to receive(:send).once.with({ 'type' => 'setCmds',
                                                 'where' => 'undo',
                                                 'cmds' => @data['undo'],
                                               }.to_json)
    expect(player).to receive(:send).once.with({ 'type' => 'setCmds',
                                                 'where' => 'chat',
                                                 'cmds' => @data['chat'],
                                               }.to_json)

    @subject.addPlayer player, "player"
  end

  it "should set players when they register" do    
    player1 = double('player1', :send => nil)
    expect(player1).to receive(:send).once.with({ 'type' => 'players',
                                                  'players' => { 'p1' => { 'name' => 'player1' },
                                                                 'p2' => { 'name' => nil },
                                                               },
                                                }.to_json)

    subject.addPlayer player1, "player1"

    player2 = double('player2', :send => nil)
    expect(player1).to receive(:send).once.with({ 'type' => 'players',
                                                  'players' => { 'p1' => { 'name' => 'player1' },
                                                                 'p2' => { 'name' => 'player2' },
                                                               },
                                                }.to_json)
    expect(player2).to receive(:send).once.with({ 'type' => 'players',
                                                  'players' => { 'p1' => { 'name' => 'player1' },
                                                                 'p2' => { 'name' => 'player2' },
                                                               },
                                                }.to_json)

    subject.addPlayer player2, "player2"
  end

  it "should not set players again" do    
    player1 = double('player1', :send => nil)
    subject.addPlayer player1, "player1"

    expect(player1).not_to receive(:send).with({ 'type' => 'players',
                                                 'players' => { 'p1' => { 'name' => 'player1' },
                                                                'p2' => { 'name' => 'player1' },
                                                              },
                                               }.to_json)

    subject.addPlayer player1, "player1"
  end

  describe "on message" do
    before :each do
      @data = {
        'commands' => [ { 'stamp' => 'stamp1' },
                        { 'stamp' => 'stamp2' },
                        { 'stamp' => 'stamp3' },
                      ],
        'undo' => [ { 'stamp' => 'stamp4' },
                    { 'stamp' => 'stamp5' },
                    { 'stamp' => 'stamp6' },
                  ],
        'chat' => [ { 'stamp' => 'stamp7' },
                    { 'stamp' => 'stamp8' },
                    { 'stamp' => 'stamp9' },
                  ],
      }
      @subject = Game.new @data

      @watcher = double('watcher', :send => nil)
      @subject.addWatcher @watcher, "watcher"

      @player = double('player', :send => nil)
      @subject.addPlayer @player, "player"
    end

    describe "public" do
      describe "chat" do
        before :each do
          @chat = {
            'type' => 'chat',
            'chat' => { 'from' => 'toto',
                        'msg' => 'hello',
                      }
          }
          @event = @chat.clone
          @event['chat']['stamp'] = 'uuid'

          expect(SecureRandom).to receive(:uuid).and_return('uuid')
        end
        
        it "should forward chat message to all listeners" do
          expect(@watcher).to receive(:send).once.with(@event.to_json)
          expect(@player).to receive(:send).once.with(@event.to_json)

          @subject.onPublicMessage @chat
        end
        
        it "should add chat message to history" do
          @subject.onPublicMessage @chat

          history = (@data['chat'].clone << @event['chat'])

          new_watcher = double('new_watch', :send=> nil)
          expect(new_watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                            'where' => 'chat',
                                                            'cmds' => history,
                                                          }.to_json)

          @subject.addWatcher new_watcher, "new_watcher"
        end
      end

      describe "replayCmd" do
        before :each do
          @cmd = {
            'type' => 'replayCmd',
            'cmd' => { 'user' => 'toto',
                       'stamp' => 'stamp',
                     }
          }
        end
        
        it "should not forward replayCmd message to all listeners" do
          expect(@watcher).not_to receive(:send).with(@cmd.to_json)
          expect(@player).not_to receive(:send).with(@cmd.to_json)

          @subject.onPublicMessage @cmd
        end
        
        it "should not add cmd to history" do
          @subject.onPublicMessage @cmd

          new_watcher = double('new_watch', :send=> nil)
          expect(new_watcher).to receive(:send).once.with({ 'type' => 'cmdBatch',
                                                            'cmds' => @data['commands'],
                                                            'end' => true,
                                                          }.to_json)

          @subject.addWatcher new_watcher, "new_watcher"
        end
      end

      describe "undoCmd" do
        before :each do
          @cmd = {
            'type' => 'undoCmd',
            'cmd' => { 'user' => 'toto',
                       'stamp' => 'stamp',
                     }
          }
        end
        
        it "should not forward replayCmd message to all listeners" do
          expect(@watcher).not_to receive(:send).with(@cmd.to_json)
          expect(@player).not_to receive(:send).with(@cmd.to_json)

          @subject.onPublicMessage @cmd
        end
        
        it "should not add cmd to history" do
          @subject.onPublicMessage @cmd

          new_watcher = double('new_watch', :send=> nil)
          expect(new_watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                            'where' => 'undo',
                                                            'cmds' => @data['undo'],
                                                          }.to_json)

          @subject.addWatcher new_watcher, "new_watcher"
        end
      end
    end

    describe "private" do
      describe "chat" do
        before :each do
          @chat = {
            'type' => 'chat',
            'chat' => { 'from' => 'toto',
                        'msg' => 'hello',
                      }
          }
          @event = @chat.clone
          @event['chat']['stamp'] = 'uuid'

          expect(SecureRandom).to receive(:uuid).and_return('uuid')
        end
        
        it "should forward chat message to all listeners" do
          expect(@watcher).to receive(:send).once.with(@event.to_json)
          expect(@player).to receive(:send).once.with(@event.to_json)

          @subject.onPrivateMessage @chat
        end
        
        it "should add chat message to history" do
          @subject.onPrivateMessage @chat

          history = (@data['chat'].clone << @event['chat'])

          new_watcher = double('new_watch', :send=> nil)
          expect(new_watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                            'where' => 'chat',
                                                            'cmds' => history,
                                                          }.to_json)

          @subject.addWatcher new_watcher, "new_watcher"
        end
      end

      describe "replayCmd" do
        before :each do
          @cmd = {
            'type' => 'replayCmd',
            'cmd' => { 'user' => 'toto',
                       'stamp' => 'stamp',
                     }
          }
        end
        
        it "should forward replayCmd message to all listeners" do
          expect(@watcher).to receive(:send).once.with(@cmd.to_json)
          expect(@player).to receive(:send).once.with(@cmd.to_json)

          @subject.onPrivateMessage @cmd
        end
        
        it "should add cmd to history" do
          @subject.onPrivateMessage @cmd

          history = @data['commands'].clone << @cmd['cmd']
          
          new_watcher = double('new_watch', :send=> nil)
          expect(new_watcher).to receive(:send).once.with({ 'type' => 'cmdBatch',
                                                            'cmds' => history,
                                                            'end' => true,
                                                          }.to_json)

          @subject.addWatcher new_watcher, "new_watcher"
        end

        describe "when cmd is in undo history" do
          before :each do
            @cmd['cmd']['stamp'] = 'stamp5'
          end
          
          it "should remove cmd from undo history" do
            @subject.onPrivateMessage @cmd

            history = @data['undo'].clone
            history.delete_at 1
            
            new_watcher = double('new_watch', :send=> nil)
            expect(new_watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                              'where' => 'undo',
                                                              'cmds' => history,
                                                            }.to_json)

            @subject.addWatcher new_watcher, "new_watcher"
          end
        end

        describe "when cmd should not be logged" do
          before :each do
            @cmd['cmd']['do_not_log'] = true
          end
          
          it "should not add cmd to history" do
            @subject.onPrivateMessage @cmd

            new_watcher = double('new_watch', :send=> nil)
            expect(new_watcher).to receive(:send).once.with({ 'type' => 'cmdBatch',
                                                              'cmds' => @data['commands'],
                                                              'end' => true,
                                                            }.to_json)

            @subject.addWatcher new_watcher, "new_watcher"
          end
        end
      end

      describe "undoCmd" do
        before :each do
          @cmd = {
            'type' => 'undoCmd',
            'cmd' => { 'user' => 'toto',
                       'stamp' => 'stamp',
                     }
          }
        end
        
        it "should forward replayCmd message to all listeners" do
          expect(@watcher).to receive(:send).once.with(@cmd.to_json)
          expect(@player).to receive(:send).once.with(@cmd.to_json)

          @subject.onPrivateMessage @cmd
        end
        
        it "should add cmd to undo history" do
          @subject.onPrivateMessage @cmd

          history = @data['undo'].clone << @cmd['cmd']
          
          new_watcher = double('new_watch', :send=> nil)
          expect(new_watcher).to receive(:send).once.with({ 'type' => 'setCmds',
                                                            'where' => 'undo',
                                                            'cmds' => history,
                                                          }.to_json)

          @subject.addWatcher new_watcher, "new_watcher"
        end

        describe "when cmd is in undo history" do
          before :each do
            @cmd['cmd']['stamp'] = 'stamp2'
          end
          
          it "should remove cmd from history" do
            @subject.onPrivateMessage @cmd

            history = @data['commands'].clone
            history.delete_at 1
            
            new_watcher = double('new_watch', :send=> nil)
            expect(new_watcher).to receive(:send).once.with({ 'type' => 'cmdBatch',
                                                              'cmds' => history,
                                                              'end' => true,
                                                            }.to_json)

            @subject.addWatcher new_watcher, "new_watcher"
          end
        end
      end
    end
  end
end
