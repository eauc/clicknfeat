angular.module('clickApp.services')
  .factory('modes', [
    function modesServiceFactory() {
      var MODES_REG = {};
      var modesService = {
        registerMode: function registerMode(mode) {
          console.log('modes: registering '+mode.name, mode);
          MODES_REG[mode.name] = mode;
        },
        init: function modesInit(state) {
          var modes = {
            register: MODES_REG
          };
          // TODO : import customized bindings
          Mousetrap.reset();
          return enterMode$('Default', state, modes);
        },
        exit: function modesExit(state, modes) {
          return cleanupCurrentModeBindings$(state, modes);
        },
        currentModeName: (modes) => {
          return R.propOr('Unknown', 'name', currentMode(modes));
        },
        currentModeActions: (modes) => {
          return R.propOr({}, 'actions', currentMode(modes));
        },
        currentModeBindings: (modes) => {
          return R.propOr({}, 'bindings', currentMode(modes));
        },
        currentModeButtons: (modes) => {
          return R.propOr({}, 'buttons', currentMode(modes));
        },
        currentModeBindingsPairs: (modes) => {
          return R.pipe(
            modesService.currentModeBindings,
            R.toPairsIn,
            R.sortBy(R.head)
          )(modes);
        },
        currentModeAction: function(action, args, modes) {
          let mode_name = modesService.currentModeName(modes);
          return R.pipePromise(
            currentMode,
            R.path(['actions',action]),
            R.rejectIf(R.isNil, `Unknown action "${action}" in "${mode_name}" mode`),
            (handler) => {
              return handler.apply(null, args);
            }
          )(modes);
        },
        switchToMode: function(name, state, modes) {
          var previous_mode = currentMode(modes);
          return R.pipePromise(
            R.path(['register', name]),
            R.rejectIf(R.isNil, `Mode ${name} does not exists`),
            R.always(modes),
            leaveMode$(state),
            enterMode$(name, state),
            R.spy(`Modes: switch mode from ${previous_mode.name} to ${name}`)
          )(modes);
        }
      };

      function currentMode(modes = {}) {
        return R.pathOr({}, [
          'register',
          R.propOr('##', 'current', modes)
        ], modes);
      }
      var enterMode$ = R.curry((name, state, modes) => {
        return R.pipePromise(
          R.path(['register', name]),
          (next_mode) => {
            return ( R.exists(next_mode.onEnter) ?
                     next_mode.onEnter(state) :
                     null
                   );
          },
          R.always(modes),
          R.assoc('current', name),
          setupCurrentModeBindings$(state)
        )(modes);
      });
      var leaveMode$ = R.curry((state, modes) => {
        return R.pipePromise(
          currentMode,
          (mode) => {
            return ( R.exists(mode.onLeave) ?
                     mode.onLeave(state) :
                     null
                   );
          },
          R.always(modes),
          cleanupCurrentModeBindings$(state),
          R.assoc('current', null)
        )(modes);
      });
      var cleanupCurrentModeBindings$ = R.curry((state, modes) => {
        Mousetrap.reset();
        return modes;
      });
      var setupCurrentModeBindings$ = R.curry((state, modes) => {
        setupBindings(currentMode(modes), state);
        return modes;
      });
      function setupBindings(mode, state) {
        var own_bindings = R.keys(mode.bindings);
        var all_bindings = R.keysIn(mode.bindings);
        var inherited_bindings = R.difference(all_bindings,
                                              own_bindings);
        R.forEach((action) => {
          Mousetrap.bind(mode.bindings[action],
                         actionBinding(action, state)
                        );
        }, inherited_bindings);
        R.forEach((action) => {
          Mousetrap.bind(mode.bindings[action],
                         actionBinding(action, state)
                        );
        }, own_bindings);
      }
      function actionBinding(name, state) {
        return (event, keys) => {
          console.warn('binding', name, keys, event);

          state.event('Modes.current.action', name, [event]);
        };
      }
      R.curryService(modesService);
      return modesService;
    }
  ])
  .factory('allModes', [
    'defaultMode',
    'rulerMode',
    'losMode',
    'createModelMode',
    'modelsMode',
    'modelMode',
    'modelChargeMode',
    'modelPlaceMode',
    'createTemplateMode',
    'aoeTemplateMode',
    'sprayTemplateMode',
    'wallTemplateMode',
    'createTerrainMode',
    'terrainMode',
    () => ({})
  ]);
