require_relative '../../../server/lib/user_collection'

describe UserCollection do
  it "should start empty" do
    expect(subject.all).to be_empty
  end

  describe "create new user" do
    before :each do
      @data = {
        'name' => 'toto',
        'payload' => 'info',
      }
      @user = subject.createUser @data
    end

    it "should create a new user" do
      expect(@user['stamp']).to match(%r{\S{28,32}})
      expect(@user['name']).to eq('toto')
      expect(@user['payload']).to eq('info')
    end

    it "should add user to collection" do
      expect(subject.all).not_to be_empty
      expect(subject.all.first).to eq(@user)

      expect(subject.user(@user['stamp']).info).to eq(@user)
    end
  end


  describe "update new user" do
    before :each do
      user_info = subject.createUser({ 'name' => 'initial',
                                       'payload' => 'initial',
                                     })
      @initial_stamp = user_info['stamp']
      @user = subject.user @initial_stamp

      @data = {
        'name' => 'toto',
        'payload' => 'info',
      }
      subject.updateUser @data, @user
    end

    it "should update user from data" do
      expect(@user.info['name']).to eq('toto')
      expect(@user.info['payload']).to eq('info')
    end

    it "should not change user stamps" do
      expect(@user.info['stamp']).to be(@initial_stamp)
    end
  end

  describe "dropUser" do
    before :each do
      @data = {
        'name' => 'toto',
        'payload' => 'info',
      }
      @user = subject.createUser @data

      subject.dropUser @user['stamp']
    end

    it "should remove user from collection" do
      expect(subject.all).to be_empty
      expect(subject.user @user['stamp']).to be_nil
    end
  end

  describe "listeners" do
    before :each do
      user_info = subject.createUser({ name: "user1" })
      @user1 = subject.user user_info['stamp']
      user_info = subject.createUser({ name: "user2" })
      @user2 = subject.user user_info['stamp']

      @listener1 = double('listener1', :send => nil)
      @user1.addListener @listener1
      @listener2 = double('listener2', :send => nil)
      @user2.addListener @listener2
    end

    describe "addUserListener" do
      it "should send users list to listener" do
        @listener = double('listener', :send => nil)
        expect(@listener).to receive(:send).once.with({ type: "users",
                                                        users: [ @user1.info,
                                                                 @user2.info
                                                               ]
                                                      }.to_json)

        subject.addUserListener @user1, @listener
      end
    end

    describe "createUser" do
      it "should send new users list to all listeners" do
        msg = %r{
"type":"users".*
"name":"user1".*
"name":"user2".*
"name":"new_user"
}x
        expect(@listener1).to receive(:send).once.with(msg)
        expect(@listener2).to receive(:send).once.with(msg)

        user_info = subject.createUser({ name: "new_user" })
      end
    end

    describe "updateUser" do
      it "should send new users list to all listeners" do
        data = {
          'name' => 'toto',
          'payload' => 'info',
        }
        updated_info = data.clone
        updated_info['stamp'] = @user1.info['stamp']
        expect(@listener1).to receive(:send).once.with({ type: "users",
                                                         users: [ updated_info,
                                                                  @user2.info
                                                               ]
                                                      }.to_json)

        subject.updateUser data, @user1
      end
    end

    describe "dropUser" do
      it "should send new users list to all listeners" do
        expect(@listener1).to receive(:send).once.with({ type: "users",
                                                        users: [ @user1.info
                                                               ]
                                                      }.to_json)

        subject.dropUser @user2.info['stamp']
      end
    end
  end

  describe "listeners" do
    before :each do
      user_info = subject.createUser({ name: "user1" })
      @user1 = subject.user user_info['stamp']
      user_info = subject.createUser({ name: "user2" })
      @user2 = subject.user user_info['stamp']
      user_info = subject.createUser({ name: "user3" })
      @user3 = subject.user user_info['stamp']

      @listener1 = double('listener1', :send => nil)
      @user1.addListener @listener1
      @listener2 = double('listener2', :send => nil)
      @user2.addListener @listener2
      @listener3 = double('listener3', :send => nil)
      @user3.addListener @listener3
    end

    describe "onMessage 'chat'" do
      it "should send chat message to concerned users" do
        msg = {
          'type' => 'chat',
          'from' => @user1.info['stamp'],
          'to' => [ @user2.info['stamp'] ],
          'msg' => 'hello'
        }
        expect(@listener1).to receive(:send).once.with(/"type":"chat".*"msg":"hello"/)
        expect(@listener2).to receive(:send).once.with(/"type":"chat".*"msg":"hello"/)
        expect(@listener3).not_to receive(:send)

        subject.onMessage msg
      end
    end
  end
end
