(function() {
  angular.module('clickApp.models')
    .factory('sprayTemplate', sprayTemplateModelFactory);

  sprayTemplateModelFactory.$inject = [
    'template',
    'model',
    'point',
  ];
  const POINTS = {
    6: '8.75,0 5.125,-59 10,-60 14.875,-59 11.25,0',
    8: '8.75,0 3.5,-78.672 10,-80 16.5,-78.672 11.25,0',
    10: '8.75,0 1.875,-98.34 10,-100 18.125,-98.34 11.25,0'
  };
  function sprayTemplateModelFactory(templateModel,
                                     modelModel,
                                     pointModel) {
    const SIZE_LENS = R.lensPath(['state','s']);
    const ORIGIN_LENS = R.lensPath(['state','o']);
    const R_LENS = R.lensPath(['state','r']);
    const sprayTemplateModel = Object.create(templateModel);
    R.deepExtend(sprayTemplateModel, {
      _create: sprayTemplateCreate,
      setSizeP: sprayTemplateSetSizeP,
      size: sprayTemplateSize,
      origin: sprayTemplateOrigin,
      setOriginP: sprayTemplateSetOriginP,
      setTargetP: sprayTemplateSetTargetP,
      rotateLeftP: sprayTemplateRotateLeft,
      rotateRightP: sprayTemplateRotateRight,
      render: sprayTemplateRender
    });
    const FORWARD_MOVES = [
      'moveFrontP',
      'moveBackP',
      'shiftLeftP',
      'shiftRightP',
      'shiftUpP',
      'shiftDownP',
      'setPositionP',
    ];
    R.forEach(buildSprayMove, FORWARD_MOVES);

    templateModel.registerTemplate('spray', sprayTemplateModel);
    R.curryService(sprayTemplateModel);
    return sprayTemplateModel;

    function sprayTemplateCreate(temp) {
      return R.set(SIZE_LENS, 6, temp);
    }
    function sprayTemplateSetSizeP(size, temp) {
      return R.threadP(size)(
        (size) => R.find(R.equals(size), [6,8,10]),
        R.rejectIfP(R.isNil, 'Invalid size for a Spray'),
        () => R.set(SIZE_LENS, size, temp)
      );
    }
    function sprayTemplateSize(temp) {
      return R.view(SIZE_LENS, temp);
    }
    function sprayTemplateOrigin(temp) {
      return R.view(ORIGIN_LENS, temp);
    }
    function sprayTemplateSetOriginP(origin, temp) {
      return R.threadP(temp)(
        R.rejectIfP(templateModel.isLocked, 'Template is locked'),
        R.view(R_LENS),
        modelModel.baseEdgeInDirection$(R.__, origin),
        (position) => R.thread(temp)(
          R.set(ORIGIN_LENS, origin.state.stamp),
          (temp) => templateModel.setPositionP(position, temp)
        )
      );
    }
    function sprayTemplateSetTargetP(origin, target, temp) {
      return R.threadP(temp)(
        R.rejectIfP(templateModel.isLocked, 'Template is locked'),
        () => pointModel.directionTo(target.state, origin.state),
        (direction) => R.threadP(origin)(
          modelModel.baseEdgeInDirection$(direction),
          (position) => R.thread(temp)(
            R.set(R_LENS, direction),
            (temp) => templateModel.setPositionP(position, temp)
          )
        )
      );
    }
    function buildSprayMove(move) {
      sprayTemplateModel[move] = sprayTemplateForwardMove;

      function sprayTemplateForwardMove(small, template) {
        return R.threadP(template)(
          R.rejectIfP(templateModel.isLocked,
                     'Template is locked'),
          R.set(ORIGIN_LENS, null),
          (template) => templateModel[move](small, template)
        );
      }
    }
    function sprayTemplateRotateLeft(origin, small, template) {
      return R.threadP(template)(
        (temp) => templateModel.rotateLeftP(small, temp),
        handleOrigin
      );

      function handleOrigin(template) {
        if(R.isNil(origin)) return template;

        return R.threadP(origin)(
          modelModel.baseEdgeInDirection$(template.state.r),
          (base_edge) => templateModel.setPositionP(base_edge, template)
        );
      }
    }
    function sprayTemplateRotateRight(origin, small, template) {
      return R.threadP(template)(
        (temp) => templateModel.rotateRightP(small, temp),
        handleOrigin
      );

      function handleOrigin(template) {
        if(R.isNil(origin)) return template;

        return R.threadP(origin)(
          modelModel.baseEdgeInDirection$(template.state.r),
          (base_edge) => templateModel.setPositionP(base_edge, template)
        );
      }
    }
    function sprayTemplateRender(temp, base_render) {
      const state = temp.state;
      R.deepExtend(base_render, {
        points: POINTS[state.s || 6],
        transform: [
          `rotate(${state.r},${state.x},${state.y})`,
          `translate(${state.x-10},${state.y})`,
        ].join(' ')
      });
      return {
        text_center: { x: state.x,
                       y: state.y + 5
                     },
        flip_center: state,
        rotate_with_model: false
      };
    }
  }
})();
