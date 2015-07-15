'use strict';

describe('move template', function() {
  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection' },
        };
      }
    ]));

    using([
      [ 'action' ],
      [ 'moveFront' ],
      [ 'moveBack' ],
      [ 'rotateLeft' ],
      [ 'rotateRight' ],
      [ 'shiftUp' ],
      [ 'shiftDown' ],
      [ 'shiftLeft' ],
      [ 'shiftRight' ],
    ], function(e, d) {
      when('user '+e.action+' template selection', function() {
        this.templateModeService.actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.get._retVal = ['stamp'];
        });

        it('should get current selection', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTemplates/'+e.action+' command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', e.action, false,
                                  ['stamp'], this.scope, this.scope.game);
        });
      });

      when('user '+e.action+'Small template selection', function() {
        this.templateModeService.actions[e.action+'Small'](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.get._retVal = ['stamp'];
        });

        it('should get current selection', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTemplates/'+e.action+'Small command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', e.action, true,
                                  ['stamp'], this.scope, this.scope.game);
        });
      });
    });
  });

  describe('template service', function() {
    beforeEach(inject([
      'template',
      function(templateService) {
        this.templateService = templateService;
      }
    ]));

    using([
      [ 'move', 'result', 'small_result', 'before_check', 'after_check' ],
      [ 'rotateLeft',
        { x: 240, y: 240, r: 120 },
        { x: 240, y: 240, r: 174 } ],
      [ 'rotateRight',
        { x: 240, y: 240, r: 240 },
        { x: 240, y: 240, r: 186 } ],
      [ 'moveFront',
        { x: 240, y: 250, r: 180 },
        { x: 240, y: 241, r: 180 },
        { x: 240, y: 475, r: 180 },
        { x: 240, y: 480, r: 180 } ],
      [ 'moveBack',
        { x: 240, y: 230, r: 180 },
        { x: 240, y: 239, r: 180 },
        { x: 240, y: 5, r: 180 },
        { x: 240, y: 0, r: 180 } ],
      [ 'shiftLeft',
        { x: 230, y: 240, r: 180 },
        { x: 239, y: 240, r: 180 },
        { x: 5, y: 240, r: 180 },
        { x: 0, y: 240, r: 180 } ],
      [ 'shiftRight',
        { x: 250, y: 240, r: 180 },
        { x: 241, y: 240, r: 180 },
        { x: 475, y: 240, r: 180 },
        { x: 480, y: 240, r: 180 } ],
      [ 'shiftUp',
        { x: 240, y: 230, r: 180 },
        { x: 240, y: 239, r: 180 },
        { x: 240, y: 5, r: 180 },
        { x: 240, y: 0, r: 180 } ],
      [ 'shiftDown',
        { x: 240, y: 250, r: 180 },
        { x: 240, y: 241, r: 180 },
        { x: 240, y: 475, r: 180 },
        { x: 240, y: 480, r: 180 } ],
    ], function(e, d) {
      describe(e.move+'(<small>)', function() {
        beforeEach(function() {
          this.template = {
            state: { x: 240, y: 240, r: 180 }
          };
        });

        using([
          [ 'small', 'result' ],
          [ false  , e.result ],
          [ true   , e.small_result ],
        ], function(ee, dd) {
          it('should '+e.move+' template, '+dd, function() {
            this.templateService[e.move](ee.small, this.template);
            expect(this.template.state)
              .toEqual(ee.result);
          });
        });
        if(e.length > 3) {
          it('should stay on the board', function() {
            this.template.state = e.before_check;
            this.templateService[e.move](false, this.template);
            expect(this.template.state)
              .toEqual(e.after_check);
          });
        }
        when('template is locked', function() {
          this.template.state.lk = true;
        }, function() {
          it('should not '+e.move+' template', function() {
            this.templateService[e.move](false, this.template);

            expect(R.pick(['x','y','r'], this.template.state))
              .toEqual({ x: 240, y: 240, r: 180 });
          });
        });
      });
    });
  });
});
