'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('gameCtrl', gameCtrl);

  gameCtrl.$inject = ['$scope', '$stateParams', 'modes'];
  function gameCtrl($scope, $stateParams, modesModel) {
    var vm = this;
    console.log('init gameCtrl', $stateParams);

    var is_online = R.propEq('online', 'online', $stateParams);
    var is_private = R.propEq('private', 'private', $stateParams);
    var id = R.prop('id', $stateParams);

    vm.currentModeName = currentModeName;
    vm.currentModeIs = currentModeIs;
    vm.doModeAction = doModeAction;
    vm.doActionButton = doActionButton;
    // vm.doInvitePlayer = doInvitePlayer;

    activate();

    function activate() {
      vm.show_action_group = null;
      vm.invite_player = null;

      $scope.stateEvent('Game.load', is_online, is_private, id);
      // $scope.digestOnStateChangeEvent('Game.load.success', $scope);
      // $scope.onStateChangeEvent('Game.load.error', onGameLoadError, $scope);

      $scope.digestOnStateChangeEvent('Game.layers.change', $scope);
      // $scope.digestOnStateChangeEvent('Game.board.change', $scope);
      // $scope.digestOnStateChangeEvent('Game.scenario.change', $scope);
      // $scope.digestOnStateChangeEvent('Game.model.create.enable', $scope);
      // $scope.digestOnStateChangeEvent('Game.template.create.enable', $scope);
      // $scope.digestOnStateChangeEvent('Game.terrain.create.enable', $scope);
      // $scope.digestOnStateChangeEvent('Game.players.change', $scope);
      // $scope.digestOnStateChangeEvent('User.change', $scope);

      $scope.onStateChangeEvent('Modes.change', updateCurrentModeBindings, $scope);
      // $scope.onStateChangeEvent('Modes.buttons.update',
      //                           updateCurrentModeBindings,
      //                           $scope);

      $scope.$on('$destroy', function () {
        $scope.stateEvent('Modes.exit');
      });
    }

    // function onGameLoadError() {
    //   $scope.goToState('lounge');
    // }

    function updateCurrentModeBindings() {
      vm.action_bindings = R.thread($scope)(R.path(['state', 'modes']), modesModel.currentModeBindings, R.clone);
      vm.action_buttons = R.thread($scope)(R.path(['state', 'modes']), modesModel.currentModeButtons, R.clone);
      $scope.$digest();
    }

    function currentModeName() {
      return R.thread($scope)(R.pathOr({}, ['state', 'modes']), modesModel.currentModeName);
    }
    function currentModeIs(mode) {
      return currentModeName() === mode;
    }
    function doModeAction(action) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      $scope.stateEvent('Modes.current.action', action, [].concat(args, [{}]));
    }
    function doActionButton(_ref) {
      var _ref2 = _slicedToArray(_ref, 3);

      var _label_ = _ref2[0];
      var action = _ref2[1];
      var group = _ref2[2];

      if (action === 'toggle') {
        vm.show_action_group = vm.show_action_group === group ? null : group;
        return;
      }
      $scope.stateEvent('Modes.current.action', action, [{}]);
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
//# sourceMappingURL=gameCtrl.js.map
