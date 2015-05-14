'use strict';

describe('label template', function() {
  describe('clickGameSelectionDetailCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.selection = { state: { stamp: 'stamp' } };
          this.scope.game = 'game';

          $controller('clickGameSelectionDetailCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user adds a label to template selection', function() {
      this.scope.doAddLabel();
    }, function() {
      when('new label is not empty', function() {
        this.scope.new_label = '    yoo ';
      }, function() {
        it('should execute onTemplates/addLabel command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'addLabel', 'yoo', ['stamp'],
                                  this.scope, this.scope.game);
        });
      });

      when('new label is empty', function() {
        this.scope.new_label = '     ';
      }, function() {
        it('should do nothing', function() {
          expect(this.gameService.executeCommand)
            .not.toHaveBeenCalled();
        });
      });
    });

    when('user removes a label to template selection', function() {
      this.scope.doRemoveLabel('label');
    }, function() {
      it('should execute onTemplates/removeLabel command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates', 'removeLabel', 'label', ['stamp'],
                                this.scope, this.scope.game);
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

    describe('fullLabel()', function() {
      beforeEach(function() {
        this.template = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      it('should return template\'s full label', function() {
        expect(this.templateService.fullLabel(this.template))
          .toEqual('label1 label2');
      });
    });

    describe('addLabel(<label>)', function() {
      beforeEach(function() {
        this.template = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      using([
        [ 'label', 'result' ],
        [ 'new'  , ['label1', 'label2' ,'new'] ],
        // no duplicates
        [ 'label2'  , ['label1', 'label2'] ],
      ], function(e, d) {
        it('should add <label> to template\'s labels, '+d, function() {
          this.templateService.addLabel(e.label, this.template);
          expect(this.template.state.l)
            .toEqual(e.result);
        });
      });
    });

    describe('removeLabel(<label>)', function() {
      beforeEach(function() {
        this.template = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      using([
        [ 'label', 'result' ],
        [ 'label1'  , ['label2'] ],
        [ 'unknown'  , ['label1', 'label2'] ],
      ], function(e, d) {
        it('should remove <label> from template\'s labels, '+d, function() {
          this.templateService.removeLabel(e.label, this.template);
          expect(this.template.state.l)
            .toEqual(e.result);
        });
      });
    });
  });
});
