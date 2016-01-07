angular.module('clickApp.services')
  .factory('defaultMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'template',
    'gameTemplateSelection',
    'gameModels',
    'gameModelSelection',
    'gameTerrainSelection',
    function defaultModeServiceFactory(modesService,
                                       settingsService,
                                       commonModeService,
                                       gameService,
                                       templateService,
                                       gameTemplateSelectionService,
                                       gameModelsService,
                                       gameModelSelectionService,
                                       gameTerrainSelectionService) {
      let DEFAULT_MOVES = {
        DragEpsilon: 3
      };
      let MOVES = R.clone(DEFAULT_MOVES);
      settingsService.register('Moves',
                               'Default',
                               DEFAULT_MOVES,
                               (moves) => {
                                 R.extend(MOVES, moves);
                               });
      let default_actions = Object.create(commonModeService.actions);
      function clearTemplateSelection$(state) {
        return () => {
          return state.event('Game.update', R.lensProp('template_selection'),
                             gameTemplateSelectionService.clear$('local', state));
        };
      }
      function clearTerrainSelection$(state) {
        return () => {
          return state.event('Game.update', R.lensProp('terrain_selection'),
                             gameTerrainSelectionService.clear$('local', state));
        };
      }
      default_actions.setModelSelection = (state, event) => {
        return R.pipePromise(
          clearTemplateSelection$(state),
          clearTerrainSelection$(state),
          () => {
            var stamp = event['click#'].target.state.stamp;
            return state.event('Game.command.execute',
                               'setModelSelection', ['set', [stamp]]);
          }
        )();
      };
      default_actions.toggleModelSelection = (state, event) => {
        return R.pipePromise(
          clearTemplateSelection$(state),
          clearTerrainSelection$(state),
          () => {
            var stamp = event['click#'].target.state.stamp;
            if(gameModelSelectionService.in('local', stamp, state.game.model_selection)) {
              return state.event('Game.command.execute',
                                 'setModelSelection', ['removeFrom', [stamp]]);
            }
            else {
              return state.event('Game.command.execute',
                                 'setModelSelection', ['addTo', [stamp]]);
            }
          }
        )();
      };
      default_actions.modelSelectionDetail = (state, event) => {
        return R.pipePromise(
          clearTemplateSelection$(state),
          clearTerrainSelection$(state),
          () => {
            var stamp = event['click#'].target.state.stamp;
            state.changeEvent('Game.selectionDetail.open',
                              'model', event['click#'].target);
            return state.event('Game.command.execute',
                               'setModelSelection', ['set', [stamp]]);
          }
        )();
      };
      default_actions.selectTemplate = (state, event) => {
        return R.pipePromise(
          clearTerrainSelection$(state),
          () => {
            return state
              .event('Game.update', R.lensProp('template_selection'),
                     gameTemplateSelectionService.set$('local',
                                                       [event['click#'].target.state.stamp],
                                                       state));
          }
        )();
      };
      default_actions.templateSelectionDetail = (state, event) => {
        return R.pipePromise(
          clearTerrainSelection$(state),
          () => {
            return state
              .event('Game.update', R.lensProp('template_selection'),
                     gameTemplateSelectionService.set$('local',
                                                       [event['click#'].target.state.stamp],
                                                       state));
          },
          () => { return state.changeEvent('Game.selectionDetail.open',
                                           'template', event['click#'].target); }
        )();
      };
      default_actions.selectTerrain = (state, event) => {
        return R.pipePromise(
          clearTemplateSelection$(state),
          () => {
            return state
              .event('Game.update', R.lensProp('terrain_selection'),
                     gameTerrainSelectionService.set$('local',
                                                      [event['click#'].target.state.stamp],
                                                      state));
          }
        )();
      };
      default_actions.enterRulerMode = (state) => {
        return state.event('Modes.switchTo', 'Ruler');
      };
      default_actions.enterLosMode = (state) => {
        return state.event('Modes.switchTo', 'LoS');
      };
      default_actions.dragStartMap = (state, event) => {
        state.changeEvent('Game.dragBox.enable', event.start, event.now);
      };
      default_actions.dragMap = (state, event) => {
        state.changeEvent('Game.dragBox.enable', event.start, event.now);
      };
      default_actions.dragEndMap = (state, event) => {
        state.changeEvent('Game.dragBox.disable');
        var top_left = {
          x: Math.min(event.now.x, event.start.x),
          y: Math.min(event.now.y, event.start.y)
        };
        var bottom_right = {
          x: Math.max(event.now.x, event.start.x),
          y: Math.max(event.now.y, event.start.y)
        };
        return R.pipeP(
          gameModelsService.findStampsBetweenPoints$(top_left, bottom_right),
          function(stamps) {
            if(R.isEmpty(stamps)) {
              return null;
            }
            return state.event('Game.command.execute',
                               'setModelSelection', ['set', stamps]);
          }
        )(state.game.models);
      };

      var default_default_bindings = {
        enterRulerMode: 'ctrl+r',
        enterLosMode: 'ctrl+l',
        setModelSelection: 'clickModel',
        toggleModelSelection: 'ctrl+clickModel',
        modelSelectionDetail: 'rightClickModel',
        selectTemplate: 'clickTemplate',
        templateSelectionDetail: 'rightClickTemplate',
        selectTerrain: 'clickTerrain'
      };
      var default_bindings = R.extend(Object.create(commonModeService.bindings),
                                      default_default_bindings);
      var default_buttons = [];
      var default_mode = {
        name: 'Default',
        onEnter: (state) => {
          gameTemplateSelectionService
            .checkMode(state, state.game.template_selection)
            .catch(() => {
              return gameTerrainSelectionService
                .checkMode(state, state.game.terrain_selection);
            })
            .catch(() => {
              return gameModelSelectionService
                .checkMode(state, state.game.model_selection);
            })
            .catch(R.always(null));
        },
        actions: default_actions,
        buttons: default_buttons,
        bindings: default_bindings,
        moves: () => MOVES
      };
      modesService.registerMode(default_mode);
      settingsService.register('Bindings',
                               default_mode.name,
                               default_default_bindings,
                               (bs) => {
                                 R.extend(default_mode.bindings, bs);
                               });
      return default_mode;
    }
  ]);
