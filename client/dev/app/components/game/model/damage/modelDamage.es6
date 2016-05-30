(function() {
  angular.module('clickApp.directives')
    .controller('clickGameModelDamageCtrl', gameModelDamageCtrl)
    .directive('clickGameModelDamage', gameModelDamageDirectiveFactory);

  gameModelDamageCtrl.$inject = [
    '$rootScope',
    'appGame',
    'gameModels',
  ];
  function gameModelDamageCtrl($rootScope,
                               appGameService,
                               gameModelsModel) {
    const vm = this;
    console.log('init clickModelDamageCtrl', vm.info, vm.state);

    vm.range = range;
    vm.warriorBoxClass = warriorBoxClass;
    vm.fieldBoxClass = fieldBoxClass;
    vm.gridBoxClass = gridBoxClass;
    vm.doResetDamage = doResetDamage;
    vm.doWarriorDamage = doWarriorDamage;
    vm.doFieldDamage = doFieldDamage;
    vm.doGridDamage = doGridDamage;
    vm.doGridColDamage = doGridColDamage;

    activate();

    function activate() {
      $rootScope.listenSignal(onModelsChanges,
                              appGameService.models.changes,
                              $rootScope);
    }
    function onModelsChanges([models, stamps]) {
      if(R.isNil(vm.state) ||
         !R.find(R.equals(vm.state.stamp), stamps)) return;
      updateModel(models);
    }
    function updateModel(models) {
      if(R.isNil(vm.state)) return;

      R.thread(models)(
        gameModelsModel.findStamp$(vm.state.stamp),
        R.ifElse(
          R.exists,
          (model) => {
            vm.state = model.state;
          },
          () => {
            vm.state = {};
          }
        )
      );
    }
    function range(n) {
      return R.range(0, n);
    }
    function warriorBoxClass(i) {
      if(R.isNil(vm.state) ||
         R.isNil(vm.state.dmg)) return '';
      return ( vm.state && vm.state.dmg.n > i
               ? 'mark'
               : ''
             );
    }
    function fieldBoxClass(col, line) {
      if(R.isNil(vm.state) ||
         R.isNil(vm.state.dmg)) return '';
      return ( vm.state &&
               vm.state.dmg.f > line * vm.info.field/2 + col
               ? 'mark'
               : ''
             );
    }
    function gridBoxClass(col, line) {
      if(R.isNil(vm.state) ||
         R.isNil(vm.state.dmg)) return '';
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

      $rootScope.sendAction('Game.command.execute',
                        'onModels', [
                          'resetDamage',
                          [],
                          [vm.state.stamp]
                        ]);
    }
    function doWarriorDamage(i) {
      if(R.isNil(vm.state)) return;

      $rootScope.sendAction('Game.command.execute',
                            'onModels', [
                              'setWarriorDamage',
                              [i],
                              [vm.state.stamp]
                            ]);
    }
    function doFieldDamage(i) {
      if(R.isNil(vm.state)) return;

      $rootScope.sendAction('Game.command.execute',
                            'onModels', [
                              'setFieldDamage',
                              [i],
                              [vm.state.stamp]
                            ]);
    }
    function doGridDamage(line, col) {
      if(R.isNil(vm.state)) return;
      if(R.isNil(vm.info[col][line])) return;

      $rootScope.sendAction('Game.command.execute',
                            'onModels', [
                              'setGridDamage',
                              [line, col],
                              [vm.state.stamp]
                            ]);
    }
    function doGridColDamage(col) {
      if(R.isNil(vm.state)) return;

      $rootScope.sendAction('Game.command.execute',
                            'onModels', [
                              'setGridColDamage',
                              [col],
                              [vm.state.stamp]
                            ]);
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
