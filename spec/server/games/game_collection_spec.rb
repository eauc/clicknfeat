require_relative '../../../server/lib/game_collection'

describe GameCollection do
  it "should start empty" do
    expect(subject.all).to be_empty
  end

  describe "create new game" do
    before :each do
      @data = {}
      @game = subject.createGame @data
    end

    it "should create a new game" do
      expect(@game['private_stamp']).to match(%r{\S{28,32}})
      expect(@game['public_stamp']).to match(%r{\S{28,32}})
    end

    it "should add game to collection" do
      expect(subject.all).not_to be_empty

      expect(subject.private_game(@game['private_stamp']).private_info).to eq(@game)
      expect(subject.public_game(@game['public_stamp']).private_info).to eq(@game)
    end
  end

  describe "dropGame" do
    before :each do
      @data = {
        'name' => 'toto',
        'payload' => 'info',
      }
      @game = subject.createGame @data

      subject.dropGame @game['private_stamp']
    end

    it "should remove game from collection" do
      expect(subject.all).to be_empty
      expect(subject.public_game @game['public_stamp']).to be_nil
      expect(subject.private_game @game['private_stamp']).to be_nil
    end
  end

  describe "all" do
    before :each do
      data = {}
      game1 = subject.createGame data
      game2 = subject.createGame data
      
      @game1_public = (subject.private_game game1['private_stamp']).public_info
      @game2_public = (subject.private_game game2['private_stamp']).public_info
    end

    it "should list all games public info" do
      expect(subject.all).to eq([ @game1_public, @game2_public ])
    end
  end
end
