describe('template model', function() {
  beforeEach(inject([
    'template',
    function(templateModel) {
      this.templateModel = templateModel;
      this.wallTemplateModel = spyOnService('wallTemplate');
      this.wallTemplateModel._create
        .and.callFake(R.clone);
      spyOn(R, 'guid')
        .and.returnValue('newGuid');
    }
  ]));

  xcontext('createP(<state>)', function() {
    return this.templateModel
      .createP(this.state);
  }, function() {
    context('when <state.type> is unknown', function() {
      this.state = { type: 'unknown' };
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Create unknown template type "unknown"'
        ]);
      });
    });

    context('<state.type> is known', function() {
      this.state = {
        type: 'wall',
        x: 1, y: 4, r: 180,
        l: ['label'],
        stamp: 'stamp'
      };
    }, function() {
      it('should proxy <type> create', function() {
        expect(this.wallTemplateModel._create)
          .toHaveBeenCalledWith({
            state: {
              type: 'wall',
              x: 0, y: 0, r: 0,
              l: [],
              lk: false,
              stamp: 'newGuid'
            }
          });
      });

      it('should extend <state> with default values', function() {
        expect(this.context)
          .toEqual({
            state: {
              type: 'wall',
              x: 1, y: 4, r: 180,
              l: [ 'label' ],
              lk: false,
              stamp: 'stamp'
            }
          });
      });
    });
  });

  describe('respondTo(<method>)', function() {
    it('should test whether template responds to <method>', function() {
      this.template = { state: { type: 'wall' } };
      expect(this.templateModel.respondTo('moveFrontP', this.template))
        .toBe(true);
      expect(this.templateModel.respondTo('whatever', this.template))
        .toBe(false);
    });
  });

  context('call(<method>, <...args...>)', function() {
    return this.templateModel
      .callP(this.method, ['arg1', 'arg2'], this.template);
  }, function() {
    beforeEach(function() {
      this.wallTemplateModel.test = jasmine.createSpy('test')
        .and.returnValue('wallTemplate.test.returnValue');
    });

    context('<template.type> is unknown', function() {
      this.template = { state: { type: 'unknown' } };
      this.method = 'test';
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Unknown call test on unknown template'
        ]);
      });
    });

    context('<method> is unknown', function() {
      this.template = { state: { type: 'wall' } };
      this.method = 'unknown';
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Unknown call unknown on wall template'
        ]);
      });
    });

    context('<template.type> and <method> are known', function() {
      this.template = { state: { type: 'wall' } };
      this.method = 'test';
    }, function() {
      it('should proxy <template.type>\'s <method>', function() {
        expect(this.wallTemplateModel.test)
          .toHaveBeenCalledWith('arg1', 'arg2', this.template);

        expect(this.context)
          .toBe('wallTemplate.test.returnValue');
      });
    });
  });
});
