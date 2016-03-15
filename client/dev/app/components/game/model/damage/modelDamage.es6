(function() {
  angular.module('clickApp.directives')
    .controller('clickGameModelDamageCtrl', gameModelDamageCtrl)
    .directive('clickGameModelDamage', gameModelDamageDirectiveFactory);

  gameModelDamageCtrl.$inject = [
    '$rootScope',
    '$scope',
    'gameModels',
  ];
  function gameModelDamageCtrl($rootScope,
                               $scope,
                               gameModelsModel) {
    const vm = this;
    console.log('init clickModelDamageCtrl', $scope.info, $scope.state);
    const state = $rootScope.state;

    vm.range = range;
    vm.warriorBoxClass = warriorBoxClass;
    vm.fieldBoxClass = fieldBoxClass;
    vm.gridBoxClass = gridBoxClass;
    vm.doResetDamage = doResetDamage;
    vm.doWarriorDamage = doWarriorDamage;
    vm.doFieldDamage = doFieldDamage;
    vm.doGridDamage = doGridDamage;
    vm.doGridColDamage = doGridColDamage;

    function range(n) {
      return R.range(0, n);
    }
    function warriorBoxClass(i) {
      return ( vm.state && vm.state.dmg.n > i
               ? 'mark'
               : ''
             );
    }
    function fieldBoxClass(col, line) {
      return ( vm.state &&
               vm.state.dmg.f > line * vm.info.field/2 + col
               ? 'mark'
               : ''
             );
    }
    function gridBoxClass(col, line) {
      return ( !vm.info[col][line]
               ? 'none'
               : ( vm.state && vm.state.dmg[col][line] === 1
                   ? 'mark'
                   : ''
                 )
             );
    }
    function doResetDamage() {
      if(R.isNil(vm.state)) return;

      $rootScope
        .stateEvent('Game.command.execute',
                    'onModels', [
                      'resetDamage',
                      [],
                      [vm.state.stamp]
                    ])
        .then(refreshState);
    }
    function doWarriorDamage(i) {
      if(R.isNil(vm.state)) return;

      $rootScope
        .stateEvent('Game.command.execute',
                    'onModels', [
                      'setWarriorDamageP',
                      [state.factions, i],
                      [vm.state.stamp]
                    ])
        .then(refreshState);
    }
    function doFieldDamage(i) {
      if(R.isNil(vm.state)) return;

      $rootScope
        .stateEvent('Game.command.execute',
                    'onModels', [
                      'setFieldDamageP',
                      [state.factions, i],
                      [vm.state.stamp]
                    ])
        .then(refreshState);
    }
    function doGridDamage(line, col) {
      if(R.isNil(vm.state)) return;
      if(R.isNil(vm.info[col][line])) return;

      $rootScope
        .stateEvent('Game.command.execute',
                    'onModels', [
                      'setGridDamageP',
                      [state.factions, line, col],
                      [vm.state.stamp]
                    ])
        .then(refreshState);
    }
    function doGridColDamage(col) {
      if(R.isNil(vm.state)) return;

      $rootScope
        .stateEvent('Game.command.execute',
                    'onModels', [
                      'setGridColDamageP',
                      [state.factions, col],
                      [vm.state.stamp]
                    ])
        .then(refreshState);
    }
    function refreshState() {
      return gameModelsModel
        .findStampP(vm.state.stamp,
                    $rootScope.state.game.models)
        .then((model) => {
          vm.state = model.state;
          $scope.$digest();
        });
    }
  }

  gameModelDamageDirectiveFactory.$inject = [];
  function gameModelDamageDirectiveFactory() {
    return {
      restrict: 'E',
      scope: {},
      controller: 'clickGameModelDamageCtrl',
      controllerAs: 'damage',
      bindToController: {
        info: '=',
        state: '='
      },
      templateUrl: 'app/components/game/model/damage/model_damage.html',
      link: link
    };
    function link(scope) {
      console.log('gameModelDamage', scope);
    }
  }
})();
