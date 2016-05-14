'use strict';

(function () {
  angular.module('clickApp.directives').controller('clickGameModelDamageCtrl', gameModelDamageCtrl).directive('clickGameModelDamage', gameModelDamageDirectiveFactory);

  gameModelDamageCtrl.$inject = ['$rootScope', '$scope'];

  // 'gameModels',
  function gameModelDamageCtrl($rootScope, $scope // ,
  // gameModelsModel
  ) {
    var vm = this;
    console.log('init clickModelDamageCtrl', $scope.info, $scope.state);
    var state = $rootScope.state;

    vm.range = range;
    vm.warriorBoxClass = warriorBoxClass;
    vm.fieldBoxClass = fieldBoxClass;
    vm.gridBoxClass = gridBoxClass;
    // vm.doResetDamage = doResetDamage;
    // vm.doWarriorDamage = doWarriorDamage;
    // vm.doFieldDamage = doFieldDamage;
    // vm.doGridDamage = doGridDamage;
    // vm.doGridColDamage = doGridColDamage;

    activate();

    function activate() {
      // $rootScope
      //   .onStateChangeEvent('Game.models.change',
      //                       updateModel,
      //                       $scope);
    }
    function range(n) {
      return R.range(0, n);
    }
    function warriorBoxClass(i) {
      if (R.isNil(vm.state) || R.isNil(vm.state.dmg)) return '';
      return vm.state && vm.state.dmg.n > i ? 'mark' : '';
    }
    function fieldBoxClass(col, line) {
      if (R.isNil(vm.state) || R.isNil(vm.state.dmg)) return '';
      return vm.state && vm.state.dmg.f > line * vm.info.field / 2 + col ? 'mark' : '';
    }
    function gridBoxClass(col, line) {
      if (R.isNil(vm.state) || R.isNil(vm.state.dmg)) return '';
      return !vm.info[col][line] ? 'none' : vm.state && vm.state.dmg[col][line] === 1 ? 'mark' : '';
    }
    // function doResetDamage() {
    //   if(R.isNil(vm.state)) return;

    //   $rootScope
    //     .stateEvent('Game.command.execute',
    //                 'onModels', [
    //                   'resetDamage',
    //                   [],
    //                   [vm.state.stamp]
    //                 ]);
    // }
    // function doWarriorDamage(i) {
    //   if(R.isNil(vm.state)) return;

    //   $rootScope
    //     .stateEvent('Game.command.execute',
    //                 'onModels', [
    //                   'setWarriorDamage',
    //                   [state.factions, i],
    //                   [vm.state.stamp]
    //                 ]);
    // }
    // function doFieldDamage(i) {
    //   if(R.isNil(vm.state)) return;

    //   $rootScope
    //     .stateEvent('Game.command.execute',
    //                 'onModels', [
    //                   'setFieldDamage',
    //                   [state.factions, i],
    //                   [vm.state.stamp]
    //                 ]);
    // }
    // function doGridDamage(line, col) {
    //   if(R.isNil(vm.state)) return;
    //   if(R.isNil(vm.info[col][line])) return;

    //   $rootScope
    //     .stateEvent('Game.command.execute',
    //                 'onModels', [
    //                   'setGridDamage',
    //                   [state.factions, line, col],
    //                   [vm.state.stamp]
    //                 ]);
    // }
    // function doGridColDamage(col) {
    //   if(R.isNil(vm.state)) return;

    //   $rootScope
    //     .stateEvent('Game.command.execute',
    //                 'onModels', [
    //                   'setGridColDamage',
    //                   [state.factions, col],
    //                   [vm.state.stamp]
    //                 ]);
    // }
    // function updateModel() {
    //   if(R.isNil(vm.state)) return;

    //   R.thread($rootScope.state)(
    //     R.path(['game','models']),
    //     gameModelsModel.findStamp$(vm.state.stamp),
    //     R.ifElse(
    //       R.exists,
    //       (model) => {
    //         vm.state = model.state;
    //         $scope.$digest();
    //       },
    //       () => {
    //         vm.state = {};
    //         $scope.$digest();
    //       }
    //     )
    //   );
    // }
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
//# sourceMappingURL=modelDamage.js.map
