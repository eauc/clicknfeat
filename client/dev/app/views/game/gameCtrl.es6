(function() {
  angular.module('clickApp.controllers')
    .controller('gameCtrl', gameCtrl);

  gameCtrl.$inject = [
    '$scope',
    '$stateParams',
    'appModes',
    'modes',
  ];
  function gameCtrl($scope,
                    $stateParams,
                    appModesService,
                    modesModel) {
    const vm = this;
    console.log('init gameCtrl', $stateParams);

    const is_online = R.propEq('online', 'online', $stateParams);
    const is_private = R.propEq('private', 'private', $stateParams);
    const id = R.prop('id', $stateParams);

    vm.currentModeName = currentModeName;
    vm.currentModeIs = currentModeIs;
    vm.doModeAction = doModeAction;
    vm.doActionButton = doActionButton;
    // vm.doInvitePlayer = doInvitePlayer;

    activate();

    function activate() {
      vm.show_action_group = null;
      vm.invite_player = null;

      $scope.sendAction('Game.load', is_online, is_private, id);
      $scope.bindCell((bindings) =>{
        vm.action = bindings;
      }, appModesService.bindings, $scope);

      $scope.$on('$destroy', () => {
        $scope.sendAction('Modes.exit');
      });
    }

    function currentModeName() {
      return R.thread($scope)(
        R.pathOr({}, ['state', 'modes']),
        modesModel.currentModeName
      );
    }
    function currentModeIs(mode) {
      return currentModeName() === mode;
    }
    function doModeAction(action, ...args) {
      $scope.sendAction('Modes.current.action',
                        action, [...args, {}]);
    }
    function doActionButton([_label_, action, group]) {
      if(action === 'toggle') {
        vm.show_action_group = ( vm.show_action_group === group
                                 ? null
                                 : group
                               );
        return;
      }
      $scope.sendAction('Modes.current.action',
                        action, [{}]);
    }
    // function doInvitePlayer() {
    //   if(R.isNil(vm.invite_player)) return;

    //   $scope.stateEvent('Game.invitePlayer', vm.invite_player);
    // }

    ////////////////////////////////////////////////////
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
  }
})();
