'use strict';

angular.module('clickApp.services')
  .factory('losMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'gameLos',
    // 'model',
    // 'gameModels',
    // 'gameModelSelection',
    function losModeServiceFactory(modesService,
                                   settingsService,
                                   commonModeService,
                                   gameService,
                                   gameLosService
                                   // modelService,
                                   // gameModelsService,
                                   // gameModelSelectionService
                                  ) {
      var los_actions = Object.create(commonModeService.actions);
      los_actions.exitLosMode = commonModeService.actions.modeBackToDefault;
      los_actions.dragStartMap = function losDragStartMap(scope, drag) {
        scope.game.los = gameLosService.setLocal(drag.start, drag.now,
                                                 scope, scope.game.los);
      };
      los_actions.dragMap = function losDragMap(scope, drag) {
        scope.game.los = gameLosService.setLocal(drag.start, drag.now,
                                                 scope, scope.game.los);
      };
      los_actions.dragEndMap = function losDragEndMap(scope, drag) {
        return gameService
          .executeCommand('setLos',
                          'setRemote', drag.start, drag.now,
                          scope,  scope.game);
      };
      los_actions.dragStartTemplate = los_actions.dragStartMap;
      los_actions.dragTemplate = los_actions.dragMap;
      los_actions.dragEndTemplate = los_actions.dragEndMap;
      los_actions.dragStartModel = los_actions.dragStartMap;
      los_actions.dragModel = los_actions.dragMap;
      los_actions.dragEndModel = los_actions.dragEndMap;
      // los_actions.setOriginModel = function losSetOriginModel(scope, event) {
      //   return R.pipeP(
      //     function() {
      //       return gameService
      //         .executeCommand('setLos',
      //                         'setOrigin', event['click#'].target,
      //                         scope,  scope.game);
      //     },
      //     function(result) {
      //       updateMaxLengthButton(scope);
      //       return result;
      //     }
      //   )();
      // };
      // los_actions.setTargetModel = function losSetTargetModel(scope, event) {
      //   return gameService
      //     .executeCommand('setLos',
      //                     'setTarget', event['click#'].target,
      //                     scope,  scope.game);
      // };
      var los_default_bindings = {
        exitLosMode: 'shift+r',
      };
      var los_bindings = R.extend(Object.create(commonModeService.bindings),
                                  los_default_bindings);
      var los_buttons = [
      ];
      var los_mode = {
        onEnter: function losOnEnter(/*scope*/) {
          // return R.pipeP(
          //   R.bind(self.Promise.resolve, self.Promise),
          //   function() {
          //     return gameModelSelectionService
          //       .get('local', scope.game.model_selection);
          //   },
          //   function(stamps) {
          //     if(R.length(stamps) !== 1) return;

          //     return gameModelsService
          //       .findStamp(stamps[0], scope.game.models)
          //       .catch(R.always(null));
          //   },
          //   function(model) {
          //     if(R.exists(model)) {
          //       return gameService
          //         .executeCommand('setLos',
          //                         'setOriginResetTarget', model,
          //                         scope, scope.game)
          //         .catch(R.always(null));
          //     }
          //   }
          // )();
        },
        onLeave: function losOnLeave(/*scope*/) {
        },
        name: 'LoS',
        actions: los_actions,
        buttons: los_buttons,
        bindings: los_bindings,
      };
      modesService.registerMode(los_mode);
      settingsService.register('Bindings',
                               los_mode.name,
                               los_default_bindings,
                               function(bs) {
                                 R.extend(los_mode.bindings, bs);
                               });
      return los_mode;
    }
  ]);
