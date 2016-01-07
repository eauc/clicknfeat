angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$stateParams',
    'modes',
    function($scope,
             $stateParams,
             modesService) {
      console.log('init gameCtrl', $stateParams);

      let is_online = R.propEq('online', 'online', $stateParams);
      let is_private = R.propEq('private', 'private', $stateParams);
      let id = R.prop('id', $stateParams);
      $scope.stateEvent('Game.load', is_online, is_private, id);
      $scope.$on('$destroy', () => {
        $scope.stateEvent('Modes.exit');
      });

      $scope.digestOnStateChangeEvent('Game.load.success', $scope);
      $scope.digestOnStateChangeEvent('Game.layers.change', $scope);
      $scope.digestOnStateChangeEvent('Game.board.change', $scope);
      $scope.digestOnStateChangeEvent('Game.scenario.change', $scope);
      $scope.digestOnStateChangeEvent('Game.model.create.enable', $scope);
      $scope.digestOnStateChangeEvent('Game.template.create.enable', $scope);
      $scope.digestOnStateChangeEvent('Game.terrain.create.enable', $scope);
      $scope.onStateChangeEvent('Game.load.error', () => {
        $scope.goToState('lounge');
      }, $scope);

      $scope.hints = {};
      $scope.onStateChangeEvent('Game.chat', (event, msg) => {
        if(msg.from === $scope.user.state.name) return;

        $scope.hints.go_to_main = !$scope.stateIs('game.main');
        $scope.$digest();
      }, $scope);
      $scope.onStateChangeEvent('User.chat', (event, msg) => {
        console.log('gameCtrl: userMailHint', event, msg);
        if(msg.from === $scope.user.state.stamp) return;

        $scope.hints.go_to_online = !$scope.stateIs('game.online');
        $scope.$digest();
      }, $scope);

      function updateCurrentModeBindings() {
        $scope.action_bindings = R.pipe(
          R.path(['state','modes']),
          modesService.currentModeBindings,
          R.clone
        )($scope);
        $scope.action_buttons = R.pipe(
          R.path(['state','modes']),
          modesService.currentModeButtons,
          R.clone
        )($scope);
        $scope.$digest();
      }
      $scope.onStateChangeEvent('Modes.change', updateCurrentModeBindings, $scope);
      $scope.onStateChangeEvent('Game.loaded', updateCurrentModeBindings, $scope);
      $scope.currentModeName = () => {
        return R.pipe(
          R.pathOr({}, ['state', 'modes']),
          modesService.currentModeName
        )($scope);
      };
      $scope.currentModeIs = (mode) => {
        return $scope.currentModeName() === mode;
      };
      $scope.show_action_group = null;
      $scope.doModeAction = (action, ...args) => {
        $scope.stateEvent('Modes.current.action', action, [...args, {}]);
      };
      $scope.doActionButton = ([label, action, group]) => {
        label = label;
        if(action === 'toggle') {
          $scope.show_action_group = ( ($scope.show_action_group === group) ?
                                       null :
                                       group
                                     );
          return;
        }
        $scope.stateEvent('Modes.current.action', action, [{}]);
      };
      // function updateGameLosOriginTarget(on) {
      //   let game_los = {
      //     stamp: null,
      //     change: null,
      //     delete: null
      //   };
      //   function cleanupLosListener(origin) {
      //     if(game_los.stamp === origin) return;
          
      //     console.log('unsubscribe Los listeners', on, game_los.stamp);
      //     if(game_los.change) game_los.change();
      //     game_los.change = null;
      //     if(game_los.delete) game_los.delete();
      //     game_los.delete = null;
      //     game_los.stamp = null;
      //   }
      //   $scope.onGameEvent('changeRemoteLos', (event, los) => {
      //     let stamp = gameLosService[on](los);
      //     cleanupLosListener(stamp);
          
      //     let display = gameLosService.isDisplayed(los);
      //     if( !display ||
      //         R.isNil(stamp) ||
      //         game_los.stamp === stamp ) return;
          
      //     let change_event = 'changeModel-'+stamp;
      //     game_los.change = pubSubService.subscribe(change_event, () => {
      //       console.log('update LoS change', on);
      //       gameLosService.updateOriginTarget($scope, $scope.game, $scope.game.los);
      //     }, game_event_channel);
      //     let delete_event = 'deleteModel-'+stamp;
      //     game_los.delete = pubSubService.subscribe(delete_event, () => {
      //       console.log('update LoS delete', on);
      //       let cmd = (on === 'origin' ? 'clearOrigin' : 'clearTarget');
      //       gameLosService[cmd]($scope, $scope.game, $scope.game.los);
      //     }, game_event_channel);
      //     console.log('subscribe Los listener', on, change_event, delete_event);
      //     game_los.stamp = stamp;
      //   }, $scope);
      //   $scope.$on('$destroy', () => {
      //     cleanupLosListener();
      //   });
      // }
      // updateGameLosOriginTarget('origin');
      // updateGameLosOriginTarget('target');
      
      // function updateGameRulerOriginTarget(on) {
      //   let game_ruler = {
      //     stamp: null,
      //     change: null,
      //     delete: null
      //   };
      //   function cleanupRulerListener(origin) {
      //     if(game_ruler.stamp === origin) return;
          
      //     console.log('unsubscribe Ruler listener', on, game_ruler.stamp);
      //     if(game_ruler.change) game_ruler.change();
      //     game_ruler.change = null;
      //     if(game_ruler.delete) game_ruler.delete();
      //     game_ruler.delete = null;
      //     game_ruler.stamp = null;
      //   }
      //   $scope.onGameEvent('changeRemoteRuler', (event, ruler) => {
      //     let stamp = gameRulerService[on](ruler);
      //     cleanupRulerListener(stamp);
          
      //     let display = gameRulerService.isDisplayed(ruler);
      //     if( !display ||
      //         R.isNil(stamp) ||
      //         game_ruler.stamp === stamp ) return;
          
      //     let change_event = 'changeModel-'+stamp;
      //     game_ruler.change = pubSubService.subscribe(change_event, () => {
      //       console.log('update Ruler change', on);
      //       gameRulerService.updateOriginTarget($scope, $scope.game.ruler);
      //     }, game_event_channel);
      //     let delete_event = 'deleteModel-'+stamp;
      //     game_ruler.delete = pubSubService.subscribe(delete_event, () => {
      //       console.log('update Ruler delete', on);
      //       let cmd = (on === 'origin' ? 'clearOrigin' : 'clearTarget');
      //       gameRulerService[cmd]($scope, $scope.game.ruler)
      //         .then((ruler) => {
      //           $scope.game.ruler = ruler;
      //         });
      //     }, game_event_channel);
      //     console.log('subscribe Ruler listener', on, change_event, delete_event);
      //     game_ruler.stamp = stamp;
      //   }, $scope);
      //   $scope.$on('$destroy', () => {
      //     cleanupRulerListener();
      //   });
      // }
      // updateGameRulerOriginTarget('origin');
      // updateGameRulerOriginTarget('target');
      
      // function updateGameModelSelection() {
      //   let game_model = {
      //     stamp: null,
      //     unsubscribe: null
      //   };
      //   function cleanupModelListener(stamp) {
      //     if(game_model.stamp === stamp ||
      //        R.isNil(game_model.unsubscribe)) return;
          
      //     console.info('unsubscribe Game Model listener', game_model.stamp);
      //     game_model.unsubscribe();
      //     game_model.unsubscribe = null;
      //     game_model.stamp = null;
      //   }
      //   function updateSingleModelSelection(stamp) {
      //     R.pipePromise(
      //       (stamp) => {
      //         if(R.isNil(stamp)) return null;

      //         return gameModelsService
      //           .findStamp(stamp, $scope.game.models);
      //       },
      //       (model) => {
      //         $scope.gameEvent('updateSingleModelSelection', stamp, model);
      //       }
      //     )(stamp);
      //   }
      //   $scope.onGameEvent('changeLocalModelSelection', (event, selection) => {
      //     let stamps = gameModelSelectionService.get('local', selection);
      //     let stamp = R.length(stamps) === 1 ? R.head(stamps) : null;
      //     cleanupModelListener(stamp);
          
      //     if( R.isNil(stamp) ||
      //         game_model.stamp === stamp ) return;
          
      //     let event_name = 'changeModel-'+stamp;
      //     console.info('subscribe Game Model listener', event_name);
      //     game_model.unsubscribe = pubSubService.subscribe(event_name, () => {
      //       let stamps = gameModelSelectionService.get('local', $scope.game.model_selection);
      //       let stamp = R.length(stamps) === 1 ? R.head(stamps) : null;
      //       updateSingleModelSelection(stamp);
      //     }, game_event_channel);
      //     game_model.stamp = stamp;
      //     updateSingleModelSelection(stamp);
      //   }, $scope);
      //   $scope.$on('$destroy', () => {
      //     cleanupModelListener();
      //   });
      // }
      // updateGameModelSelection();
      
      // function updateGameTemplateSelection() {
      //   let game_template = {
      //     stamp: null,
      //     unsubscribe: null
      //   };
      //   function cleanupTemplateListener(stamp) {
      //     if(game_template.stamp === stamp ||
      //        R.isNil(game_template.unsubscribe)) return;
          
      //     console.info('unsubscribe Game Template listener', game_template.stamp);
      //     game_template.unsubscribe();
      //     game_template.unsubscribe = null;
      //     game_template.stamp = null;
      //   }
      //   function updateSingleTemplateSelection(stamp) {
      //     R.pipePromise(
      //       (stamp) => {
      //         if(R.isNil(stamp)) return null;

      //         return gameTemplatesService
      //           .findStamp(stamp, $scope.game.templates);
      //       },
      //       (template) => {
      //         if(R.exists(template) &&
      //            'aoe' !== template.state.type) {
      //           stamp = null;
      //           template = null;
      //         }
              
      //         $scope.gameEvent('updateSingleTemplateSelection', stamp, template);
      //       }
      //     )(stamp);
      //   }
      //   $scope.onGameEvent('changeLocalTemplateSelection', (event, selection) => {
      //     let stamps = gameTemplateSelectionService.get('local', selection);
      //     let stamp = R.length(stamps) === 1 ? R.head(stamps) : null;
      //     cleanupTemplateListener(stamp);
          
      //     if( R.isNil(stamp) ||
      //         game_template.stamp === stamp ) return;
          
      //     let event_name = 'changeTemplate-'+stamp;
      //     console.info('subscribe Game Template listener', event_name);
      //     game_template.unsubscribe = pubSubService.subscribe(event_name, () => {
      //       let stamps = gameTemplateSelectionService.get('local', $scope.game.template_selection);
      //       let stamp = R.length(stamps) === 1 ? R.head(stamps) : null;
      //       updateSingleTemplateSelection(stamp);
      //     }, game_event_channel);
      //     game_template.stamp = stamp;
      //     updateSingleTemplateSelection(stamp);
      //   }, $scope);
      //   $scope.$on('$destroy', () => {
      //     cleanupTemplateListener();
      //   });
      // }
      // updateGameTemplateSelection();
    }
  ]);
