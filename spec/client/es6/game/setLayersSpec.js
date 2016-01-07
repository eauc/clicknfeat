describe('set layers', function() {
  describe('setLayersCommand service', function() {
    beforeEach(inject([ 'setLayersCommand', function(setLayersCommand) {
      this.setLayersCommandService = setLayersCommand;
      this.gameLayersService = spyOnService('gameLayers');
    }]));

    when('execute(<cmd>, <layer>, <state>, <game>)', function() {
      this.ret = this.setLayersCommandService
        .execute(this.cmd, 'l', this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.state = jasmine.createSpyObj('state', ['changeEvent']);
        this.game = { layers: 'before' };
      });

      when('gameLayers service does not respond to <cmd>', function() {
        this.cmd = 'whatever';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Layers unknown method "whatever"');
          });
        });
      });

      when('gameLayers service responds to <cmd>', function() {
        this.cmd = 'toggle';
      }, function() {
        it('should execute <cmd>', function() {
          expect(this.gameLayersService[this.cmd])
            .toHaveBeenCalledWith('l', 'before');
        });
      
        it('should send changeLayers event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.layers.change');
        });

        it('should return ctxt', function() {
          expect(this.ret[0])
            .toEqual({
              before: 'before',
              desc: 'toggle(l)',
              after: 'gameLayers.toggle.returnValue'
            });
        });
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e) {
      describe(e.method+'(<ctxt>, <state>, <game>)', function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };
          this.state = jasmine.createSpyObj('state', ['changeEvent']);

          let game = { layers: e.previous };
          this.game = this.setLayersCommandService[e.method](this.ctxt, this.state, game);
        });
      
        it('should set game layers', function() {
          expect(this.game.layers).toBe(e.result);
        });
      
        it('should send changeLayers event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.layers.change');
        });
      });
    });
  });

  describe('gameLayers service', function() {
    beforeEach(inject([ 'gameLayers', function(gameLayersService) {
      this.gameLayersService = gameLayersService;
    }]));

    describe('create()', function() {
      it('should init layers', function() {
        expect(this.gameLayersService.create())
          .toEqual(['b','d','s','m','t']);
      });
    });

    describe('set(<l>)', function() {
      it('should display <l> layer', function() {
        this.layers = [];
        this.layers = this.gameLayersService.set('l', this.layers);
        expect(this.gameLayersService.isDisplayed('l', this.layers))
          .toBeTruthy();
      });
    });

    describe('unset(<l>)', function() {
      beforeEach(function() {
        this.layers = this.gameLayersService.set('l', []);
      });

      it('should undisplay <l> layer', function() {
        this.layers = this.gameLayersService.unset('l', this.layers);
        expect(this.gameLayersService.isDisplayed('l', this.layers))
          .toBeFalsy();
      });
    });

    describe('toggle(<l>)', function() {
      beforeEach(function() {
        this.layers = this.gameLayersService.set('l', []);
      });

      it('should switch display for <l> layer', function() {
        this.layers = this.gameLayersService.toggle('l', this.layers);
        expect(this.gameLayersService.isDisplayed('l', this.layers))
          .toBeFalsy();

        this.layers = this.gameLayersService.toggle('l', this.layers);
        expect(this.gameLayersService.isDisplayed('l', this.layers))
          .toBeTruthy();
});
    });
  });
});
