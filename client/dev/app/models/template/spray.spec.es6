describe('sprayTemplate model', function() {
  beforeEach(inject([
    'sprayTemplate',
    function(sprayTemplateModel) {
      this.sprayTemplateModel = sprayTemplateModel;

      this.modelModel = spyOnService('model');
    }
  ]));

  // context('setOriginP(<factions>, <origin>), ', function() {
  //   return this.sprayTemplateModel
  //     .setOriginP('factions', this.origin, this.template);
  // }, function() {
  //   beforeEach(function() {
  //     this.template = {
  //       state: { x: 240, y: 240, r: 42 }
  //     };
  //     this.origin = {
  //       state: { stamp: 'origin' }
  //     };
  //     this.modelModel.baseEdgeInDirectionP
  //       .resolveWith({
  //         x: 124, y: 124
  //       });
  //   });

  //   it('should set template position to <origin> base edge', function() {
  //     expect(this.modelModel.baseEdgeInDirectionP)
  //       .toHaveBeenCalledWith('factions', 42, this.origin);

  //     expect(R.pick(['x','y','r'], this.context.state))
  //       .toEqual({ x: 124, y: 124, r: 42 });
  //   });

  //   it('should set template origin', function() {
  //     expect(this.sprayTemplateModel.origin(this.context))
  //       .toEqual('origin');
  //   });

  // whenSprayIsLockedShouldRejectAction();
  // });

  // context('setTargetP(<factions>, <origin>, <target>), ', function() {
  //   return this.sprayTemplateModel
  //     .setTargetP('factions', this.origin, this.target, this.template);
  // }, function() {
  //   beforeEach(function() {
  //     this.template = {
  //       state: { x: 240, y: 240, r: 0 }
  //     };
  //     this.origin = {
  //       state: { x: 240, y: 240 }
  //     };
  //     this.modelModel.baseEdgeInDirectionP
  //       .resolveWith({
  //       x: 236, y: 236
  //       });
  //     this.target = {
  //       state: { x: 120, y: 120 }
  //     };
  //   });

  //   it('should center template on <target>', function() {
  //     expect(this.modelModel.baseEdgeInDirectionP)
  //       .toHaveBeenCalledWith('factions', -45, this.origin);

  //     expect(this.context.state)
  //       .toEqual({ x: 236, y: 236, r: -45 });
  //   });

  // whenSprayIsLockedShouldRejectAction();
  // });

  example(function(e) {
    context(e.move+'(<small>)', function() {
      return this.sprayTemplateModel[e.move](true, this.template);
    }, function() {
      beforeEach(function() {
        this.template = { state: { o: 'origin', stamp: 'template' } };
        this.templateModel = spyOnService('template');
        this.templateModel.isLocked
          .and.returnValue(false);
        this.templateModel[e.move]
          .resolveWith((s,t) => t);
      });

      it('should reset template origin', function() {
        expect(this.context.state.o)
          .toBe(null);
      });

      it('should forward to templateModel', function() {
        expect(this.templateModel[e.move])
          .toHaveBeenCalledWith(true, this.context);
      });

      whenSprayIsLockedShouldRejectAction();
    });
  }, [
    ['move'         ],
    ['moveFrontP'   ],
    ['moveBackP'    ],
    ['shiftLeftP'   ],
    ['shiftRightP'  ],
    ['shiftUpP'     ],
    ['shiftDownP'   ],
    ['setPositionP' ],
  ]);

  // example(function(e) {
  //   context(e.move+'(<factions>, <origin>, <small>)', function() {
  //     return this.sprayTemplateModel[e.move]('factions', this.origin,
  //                                            true, this.template);
  //   }, function() {
  //     beforeEach(function() {
  //       this.template = {
  //         state: {
  //           o: 'origin',
  //           stamp: 'template',
  //           r: 0
  //         }
  //       };

  //       this.templateModel = spyOnService('template');
  //       this.templateModel.moves
  //         .and.callThrough();
  //       this.templateModel.isLocked
  //         .and.returnValue(false);
  //       this.templateModel.setPositionP
  //         .resolveWith((p,t) => t);
  //     });

  //     it('should forward to templateModel', function() {
  //       expect(this.templateModel[e.move])
  //         .toHaveBeenCalledWith(true, this.template);
  //     });

  //     context('when <origin> exists', function() {
  //       this.origin = 'origin';
  //     }, function() {
  //       it('should rotate <template> around <origin> base edge', function() {
  //         expect(this.modelModel.baseEdgeInDirectionP)
  //           .toHaveBeenCalledWith('factions', e.new_dir, 'origin');
  //         expect(this.templateModel.setPositionP)
  //           .toHaveBeenCalledWith('model.baseEdgeInDirection.returnValue',
  //                                 this.context);
  //       });
  //     });

  //     whenSprayIsLockedShouldRejectAction();
  //   });
  // }, [
  //   ['move'         , 'new_dir' ],
  //   ['rotateLeftP'  , -6        ],
  //   ['rotateRightP' , 6         ],
  // ]);

  example(function(e, d) {
    context('setSizeP(<size>), '+d, function() {
      return this.sprayTemplateModel
        .setSizeP(e.size, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { }
        };
      });

      it('should set template size', function() {
        expect(this.sprayTemplateModel.size(this.context))
          .toEqual(e.result);
      });
    });
  }, [
    [ 'size', 'result' ],
    [ 6     , 6        ],
    [ 8     , 8        ],
    [ 10    , 10       ],
  ]);

  context('when size is not valid', function() {
    this.expectContextError();
    return this.sprayTemplateModel
      .setSizeP(42, this.template);
  }, function() {
    it('should reject size', function() {
      expect(this.contextError).toEqual([
        'Invalid size for a Spray'
      ]);
    });
  });

  function whenSprayIsLockedShouldRejectAction() {
    context('when spray is locked', function() {
      this.templateModel.isLocked
        .and.returnValue(true);
      this.expectContextError();
    }, function() {
      it('should reject action', function() {
        expect(this.contextError).toEqual([
          'Template is locked'
        ]);
      });
    });
  }
});
