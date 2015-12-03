require 'json'
require_relative '../../../server/lib/user_collection'

describe User do
  subject do
    @data = {
      'name' => 'toto',
      'payload' => 'info',
    }
    User.new @data
  end
  
  it "should have a unique stamp" do
    expect(subject.info['stamp']).to match(%r{\S{28,32}})
  end
  
  it "should init info" do
    expect(subject.info['name']).to eq("toto")
    expect(subject.info['payload']).to eq("info")
  end

  describe "udpate" do
    before :each do
      @stamp = subject.info['stamp']
      @info = subject.updateInfo({ 'stamp' => 'ignored',
                                   'name' => 'tata',
                                   'payload' => 'new_data',
                                   'new_payload' => 'whatever' })
    end

    it "should update info" do
      expect(@info).to eq(subject.info)
      expect(subject.info["name"]).to eq("tata")
      expect(subject.info["payload"]).to eq("new_data")
      expect(subject.info["new_payload"]).to eq("whatever")
    end

    it "should preserve stamp" do
      expect(subject.info['stamp']).to eq(@stamp)
    end
  end

  describe "listeners" do
    before :each do
      @listener1 = double('listener1', :send => '')
      @listener2 = double('listener2', :send => '')
      subject.addListener @listener1
      subject.addListener @listener2
    end

    describe "signalListener" do
      it "should send event to listener" do
        expect(@listener2).to receive(:send).once.with("{\"event\":\"payload\"}")

        User.signalListener({ event: "payload" }, @listener2)
      end
    end

    describe "signalAllListeners" do
      it "should send event to all listeners" do
        expect(@listener1).to receive(:send).once.with("{\"event\":\"payload\"}")
        expect(@listener2).to receive(:send).once.with("{\"event\":\"payload\"}")

        subject.signalAllListeners({ event: "payload" })
      end
    end
  end
end
